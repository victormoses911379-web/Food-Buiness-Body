import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db';
import { generateProductPDF } from './server/pdf';
import { getGuideById, ALL_GUIDES } from './server/bookContent';
import { isFirestoreActive, getFirestore } from './server/firebase';

const app = express();
const PORT = 3000;

// High body limits to support receipt screenshots / base64 proof uploads without entity.too.large
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Request logger for audit
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`[API] ${req.method} ${req.path} - ${new Date().toISOString()}`);
  }
  next();
});

// ==========================================
// SECURE ADMIN AUTHENTICATION
// ==========================================
const ADMIN_PASSWORD = process.env.ADMIN_ACCESS_KEY || 'admin123';
const activeAdminTokens = new Set<string>();

function generateAdminToken(): string {
  const token = `adm_${crypto.randomBytes(24).toString('hex')}_${Date.now()}`;
  activeAdminTokens.add(token);
  return token;
}

function verifyAdminToken(req: express.Request): boolean {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7).trim() : undefined;
  const customKey = (req.headers['x-admin-key'] as string)?.trim();

  if (token && (activeAdminTokens.has(token) || token === ADMIN_PASSWORD)) {
    return true;
  }
  if (customKey && customKey === ADMIN_PASSWORD) {
    return true;
  }
  return false;
}

const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (verifyAdminToken(req)) {
    return next();
  }
  return res.status(401).json({
    success: false,
    error: 'Unauthorized. Admin login required.',
    message: 'Unauthorized. Admin credentials required to access this resource.'
  });
};

// POST /api/admin/login and POST /api/admin/auth
app.post(['/api/admin/login', '/api/admin/auth'], (req, res) => {
  const { key, password } = req.body;
  const provided = (key || password || '').trim();

  if (provided && provided === ADMIN_PASSWORD) {
    const token = generateAdminToken();
    res.json({
      success: true,
      token,
      message: 'Admin authenticated successfully'
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'Invalid administrator credentials',
      message: 'Invalid administrator credentials'
    });
  }
});

// ==========================================
// PUBLIC PRODUCT ENDPOINTS
// ==========================================

// GET /api/products
app.get('/api/products', (req, res) => {
  const includeUnpublished = req.query.all === 'true' || req.query.includeInactive === 'true';
  const products = db.getProducts(includeUnpublished);
  res.json({ success: true, products });
});

// GET /api/products/:slug
app.get('/api/products/:slug', (req, res) => {
  const { slug } = req.params;
  const product = db.getProductBySlug(slug) || db.getProductById(slug);
  if (!product) {
    return res.status(404).json({ success: false, error: 'This guide is currently unavailable.' });
  }
  res.json({ success: true, product });
});

// ==========================================
// CHECKOUT ENDPOINT
// ==========================================

// POST /api/checkout
app.post('/api/checkout', (req, res) => {
  try {
    const { productId, customerEmail, customerName } = req.body;

    if (!productId || !customerEmail) {
      return res.status(400).json({ success: false, message: 'Product ID and customer email are required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    const session = db.createCheckoutSession(productId, customerEmail, customerName);

    db.logAnalyticsEvent({
      event_name: 'checkout_started',
      product_id: productId,
      product_name: session.productName,
      metadata: { customerEmail, amount: session.amount }
    });

    res.json({ success: true, ...session });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message || 'Checkout failed to initialize.' });
  }
});

// ==========================================
// MANUAL PAYMENT SYSTEM & SETTINGS
// ==========================================

// GET /api/payment-settings (Public - used on Checkout Page)
app.get('/api/payment-settings', (req, res) => {
  try {
    const settings = db.getPaymentSettings();
    res.json({
      success: true,
      settings,
      database: isFirestoreActive() ? 'firestore' : 'durable-file-store'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to load payment settings' });
  }
});

// PUT & POST /api/admin/payment-settings (Admin only)
app.all(['/api/admin/payment-settings'], requireAdmin, (req, res) => {
  if (req.method !== 'PUT' && req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }
  try {
    const updated = db.updatePaymentSettings(req.body);
    res.json({ success: true, settings: updated, message: 'Payment settings saved successfully.' });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message || 'Failed to update payment settings' });
  }
});

// ==========================================
// MANUAL PAYMENT SUBMISSION (Customer)
// ==========================================

// POST /api/orders/submit-payment & POST /api/payments/submit
app.post(['/api/orders/submit-payment', '/api/payments/submit'], (req, res) => {
  try {
    const {
      productId,
      customerName,
      customerEmail,
      amountPaid,
      amount,
      paymentMethod,
      transactionReference,
      transactionId,
      paymentProof,
      receiptUrl,
      receiptFile,
      proofFilename,
      additionalNote,
      notes,
      confirmedCheckbox
    } = req.body;

    const emailToUse = (customerEmail || '').trim();
    const refToUse = (transactionReference || transactionId || '').trim();
    const finalAmount = amountPaid !== undefined ? Number(amountPaid) : (amount !== undefined ? Number(amount) : 0);

    if (!productId || !emailToUse || !refToUse) {
      return res.status(400).json({
        success: false,
        message: 'Product, customer email, and transaction ID / reference are required.'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailToUse)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    if (confirmedCheckbox === false) {
      return res.status(400).json({
        success: false,
        message: 'Please check the box confirming you completed the payment.'
      });
    }

    const result = db.submitManualPayment({
      productId,
      customerName: (customerName || '').trim(),
      customerEmail: emailToUse,
      amountPaid: finalAmount,
      paymentMethod: paymentMethod || 'Manual Payment',
      transactionReference: refToUse,
      paymentProof: paymentProof || receiptUrl || receiptFile,
      proofFilename,
      additionalNote: additionalNote || notes,
      confirmedCheckbox: true
    });

    db.logAnalyticsEvent({
      event_name: 'payment_success',
      product_id: productId,
      metadata: {
        orderNumber: result.order?.order_number,
        paymentId: result.order?.id,
        amount: result.order?.total_amount,
        status: 'PENDING',
        transactionReference: refToUse
      }
    });

    // Standardized JSON response adhering to master requirements
    res.status(201).json({
      success: true,
      message: 'Payment submitted successfully. Your payment is now awaiting manual verification.',
      paymentId: result.order?.id,
      order: result.order
    });
  } catch (err: any) {
    console.error('[API] Manual payment submission error:', err);
    res.status(400).json({
      success: false,
      message: err.message || 'Unable to submit payment'
    });
  }
});

// ==========================================
// CUSTOMER PAYMENT STATUS LOOKUP
// ==========================================

// GET /api/payments/status
app.get('/api/payments/status', (req, res) => {
  try {
    const email = (req.query.email as string)?.trim().toLowerCase();
    const queryId = (req.query.paymentId as string || req.query.id as string || req.query.orderNumber as string || req.query.transactionId as string)?.trim();

    if (!queryId && !email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your Email address or Payment ID.'
      });
    }

    let order = queryId ? db.getOrderByIdOrNumber(queryId) : undefined;
    if (!order && email) {
      const orders = db.getOrdersByCustomerEmail(email);
      if (orders.length > 0) {
        order = orders[0];
      }
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'No payment found matching the provided details. Please verify your reference.'
      });
    }

    const status = (order.payment_status || 'PENDING').toLowerCase();
    const isApproved = status === 'approved' || status === 'paid';
    const isRejected = status === 'rejected';

    let statusMessage = 'Your payment is currently awaiting manual verification.';
    if (isApproved) {
      statusMessage = 'Your payment has been approved. Your digital guide is ready.';
    } else if (isRejected) {
      statusMessage = 'Your payment was not approved. Please review the payment details or contact support.';
    }

    res.json({
      success: true,
      payment: {
        paymentId: order.id,
        orderNumber: order.order_number,
        customerEmail: order.customer_email,
        customerName: order.customer_name,
        amount: order.total_amount,
        currency: order.currency,
        paymentMethod: order.payment_provider,
        transactionId: order.payment_reference,
        paymentReference: order.payment_reference,
        status, // "pending" | "approved" | "rejected"
        statusMessage,
        createdAt: order.created_at,
        approvedAt: isApproved ? order.reviewed_at : null,
        rejectedAt: isRejected ? order.reviewed_at : null,
        rejectionReason: isRejected ? order.rejection_reason : undefined,
        // STRICT: download tokens ONLY available if approved
        downloads: isApproved ? order.downloads : []
      },
      order
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error checking payment status.'
    });
  }
});

// ==========================================
// ORDER LOOKUP & CONFIRMATION
// ==========================================

// GET /api/orders/lookup?email=...
app.get('/api/orders/lookup', (req, res) => {
  const email = req.query.email as string;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email parameter is required.' });
  }
  const orders = db.getOrdersByCustomerEmail(email);
  res.json({ success: true, orders });
});

// GET /api/orders/:id
app.get('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const order = db.getOrderByIdOrNumber(id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found.' });
  }
  res.json({ success: true, order });
});

// ==========================================
// ADMIN VERIFICATION ENDPOINTS (Protected)
// ==========================================

// POST /api/admin/orders/:id/approve (Admin confirms and approves order)
app.post('/api/admin/orders/:id/approve', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { adminName } = req.body;
    const result = db.approveOrder(id, adminName);
    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message });
    }
    res.json({ success: true, message: result.message, order: result.order });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to approve order.' });
  }
});

// POST /api/admin/orders/:id/reject (Admin rejects payment verification)
app.post('/api/admin/orders/:id/reject', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { reason, adminName } = req.body;
    const result = db.rejectOrder(id, adminName, reason);
    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message });
    }
    res.json({ success: true, message: result.message, order: result.order });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to reject order.' });
  }
});

// GET /api/admin/orders
app.get('/api/admin/orders', requireAdmin, (req, res) => {
  const status = req.query.status as string;
  const orders = db.getOrders(status);
  const pendingCount = db.getPendingPaymentsCount();
  res.json({ success: true, orders, pendingCount });
});

// POST /api/admin/orders/:id/refund
app.post('/api/admin/orders/:id/refund', requireAdmin, (req, res) => {
  const { id } = req.params;
  const result = db.refundOrder(id);
  if (!result.success) {
    return res.status(400).json({ success: false, message: result.message });
  }
  res.json({ success: true, ...result });
});

// POST /api/admin/orders/:id/resend-email
app.post('/api/admin/orders/:id/resend-email', requireAdmin, (req, res) => {
  const { id } = req.params;
  const success = db.resendDeliveryEmail(id);
  if (!success) {
    return res.status(400).json({ success: false, message: 'Failed to resend email. Ensure order is paid/approved.' });
  }
  res.json({ success: true, message: 'Delivery email resent.' });
});

// GET /api/admin/customers
app.get('/api/admin/customers', requireAdmin, (req, res) => {
  const customers = db.getCustomers();
  res.json({ success: true, customers });
});

// POST /api/admin/products
app.post('/api/admin/products', requireAdmin, (req, res) => {
  try {
    const product = db.saveProduct(req.body);
    res.json({ success: true, product });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PATCH /api/admin/products/:id
app.patch('/api/admin/products/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const product = db.saveProduct({ ...req.body, id });
    res.json({ success: true, product });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET /api/admin/emails
app.get('/api/admin/emails', requireAdmin, (req, res) => {
  const emails = db.getEmails();
  res.json({ success: true, emails });
});

// GET /api/admin/stats
app.get('/api/admin/stats', requireAdmin, (req, res) => {
  const stats = db.getAnalyticsSummary();
  const firestoreActive = isFirestoreActive();
  res.json({
    success: true,
    ...stats,
    firestoreActive,
    storageEngine: firestoreActive ? 'Firebase Firestore (Cloud Sync Active)' : 'Local Persistent Database (data/db.json)',
    firebaseProjectId: process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || null
  });
});

// POST /api/admin/test-firestore (Direct cloud connectivity test)
app.post('/api/admin/test-firestore', requireAdmin, async (req, res) => {
  try {
    const active = isFirestoreActive();
    if (!active) {
      return res.json({
        success: false,
        active: false,
        message: 'Firebase credentials are not yet configured in environment variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY).'
      });
    }

    const firestore = getFirestore();
    if (!firestore) {
      return res.status(500).json({
        success: false,
        active: false,
        message: 'Could not initialize Firestore client with current credentials.'
      });
    }

    const testId = `test_${Date.now()}`;
    await firestore.collection('system_checks').doc(testId).set({
      testId,
      timestamp: new Date().toISOString(),
      triggeredBy: 'Administrator Verification Center',
      status: 'SUCCESS'
    });

    res.json({
      success: true,
      active: true,
      projectId: process.env.FIREBASE_PROJECT_ID,
      message: `Successfully connected to Firebase Firestore project "${process.env.FIREBASE_PROJECT_ID}"! A verification record was written to the "system_checks" collection.`
    });
  } catch (err: any) {
    console.error('[API] Firestore test error:', err);
    res.status(500).json({
      success: false,
      active: false,
      message: `Firestore connection error: ${err.message}`
    });
  }
});

// ==========================================
// SECURE DOWNLOAD ENDPOINT
// ==========================================

// GET /api/download/:token
app.get('/api/download/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const validation = db.validateAndGetDownload(token);

    if (!validation.valid || !validation.product) {
      return res.status(validation.errorStatus || 403).json({
        success: false,
        error: validation.errorMessage || 'Access Denied.',
        message: validation.errorMessage || 'Access Denied.'
      });
    }

    const { product, order, downloadToken } = validation;

    db.logAnalyticsEvent({
      event_name: 'download_started',
      product_id: product.id,
      product_name: product.name,
      metadata: {
        orderNumber: order?.order_number,
        downloadCount: downloadToken?.download_count
      }
    });

    // Generate authenticated PDF binary stream
    const pdfBytes = await generateProductPDF({
      product,
      customerEmail: order?.customer_email,
      orderNumber: order?.order_number
    });

    const safeFilename = `${product.name.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
    res.setHeader('Content-Length', pdfBytes.byteLength);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');

    res.send(Buffer.from(pdfBytes));
  } catch (err: any) {
    console.error('Download delivery error:', err);
    res.status(500).json({ success: false, message: 'Failed to generate guide download.' });
  }
});

// GET /api/download/:token/info
app.get('/api/download/:token/info', (req, res) => {
  const { token } = req.params;
  const downloadToken = db['data'].downloads.find((d: any) => d.token === token);
  if (!downloadToken) {
    return res.status(404).json({ success: false, message: 'Download token not found' });
  }

  const order = db['data'].orders.find((o: any) => o.id === downloadToken.order_id);
  const isExpired = Date.now() > new Date(downloadToken.expires_at).getTime();

  res.json({
    success: true,
    token: downloadToken.token,
    product_name: downloadToken.product_name,
    order_number: order?.order_number,
    download_count: downloadToken.download_count,
    max_downloads: downloadToken.max_downloads,
    expires_at: downloadToken.expires_at,
    is_expired: isExpired,
    revoked: downloadToken.revoked || false,
    order_status: order?.payment_status
  });
});

// GET /api/books/:id
app.get('/api/books/:id', (req, res) => {
  const { id } = req.params;
  const guide = getGuideById(id);
  if (!guide) {
    return res.status(404).json({ success: false, message: 'Book guide not found' });
  }
  res.json({ success: true, guide });
});

// GET /api/pdf/preview/:id
app.get('/api/pdf/preview/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = db.getProducts(true).find(p => p.id === id || p.slug === id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const pdfBytes = await generateProductPDF({
      product,
      customerEmail: (req.query.email as string) || 'reader@foodandbody.com',
      orderNumber: 'PREVIEW-SAMPLE-EDITION'
    });

    const safeFilename = `${product.name.replace(/[^a-zA-Z0-9_-]/g, '_')}_Official_Guide.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${safeFilename}"`);
    res.setHeader('Content-Length', pdfBytes.byteLength);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(Buffer.from(pdfBytes));
  } catch (err: any) {
    console.error('PDF preview generation error:', err);
    res.status(500).json({ success: false, message: 'Failed to generate PDF preview' });
  }
});

// POST /api/analytics/event
app.post('/api/analytics/event', (req, res) => {
  const { event_name, product_id, product_name, url, metadata } = req.body;
  if (!event_name) {
    return res.status(400).json({ success: false, message: 'event_name required' });
  }
  const logged = db.logAnalyticsEvent({
    event_name,
    product_id,
    product_name,
    url,
    metadata
  });
  res.json({ success: true, event: logged });
});

// ==========================================
// GUARANTEED JSON 404 FOR UNMATCHED /api/*
// Prevents any API call from falling into HTML
// ==========================================
app.all('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `API route not found: ${req.method} ${req.path}`,
    message: `API endpoint not found: ${req.method} ${req.path}`
  });
});

// ==========================================
// GLOBAL JSON ERROR HANDLER FOR /api
// ==========================================
app.use('/api', (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[API Error Intercepted]', err);
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      error: 'The uploaded file or receipt image is too large. Please upload an image under 5MB.',
      message: 'The uploaded file or receipt image is too large. Please upload an image under 5MB.'
    });
  }
  res.status(err.status || err.statusCode || 500).json({
    success: false,
    error: err.message || 'An unexpected internal server error occurred',
    message: err.message || 'An unexpected internal server error occurred'
  });
});

// ==========================================
// VITE MIDDLEWARE & SERVER STARTUP
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Food & Body Digital Publishing Server running on port ${PORT}`);
  });
}

startServer();
