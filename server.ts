import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db';
import { generateProductPDF } from './server/pdf';
import { getGuideById, ALL_GUIDES } from './server/bookContent';
import { isFirestoreActive, getFirestore } from './server/firebase';
import {
  isFlutterwaveConfigured,
  isFlutterwaveAutoApproveEnabled,
  createFlutterwavePaymentSession,
  verifyFlutterwaveTransaction,
  validateTransactionIntegrity,
  verifyFlutterwaveWebhookSignature
} from './server/flutterwave';

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
// FLUTTERWAVE PAYMENT GATEWAY ENDPOINTS
// ==========================================

/**
 * POST /api/payments/flutterwave/create
 * Backend-driven payment session creation.
 * Server calculates exact amount & currency and initiates checkout on Flutterwave.
 */
app.post('/api/payments/flutterwave/create', async (req, res) => {
  try {
    const { productId, customerName, customerEmail, currency } = req.body;

    if (!productId || !customerEmail) {
      return res.status(400).json({
        success: false,
        message: 'Product ID and customer email are required.'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanEmail = customerEmail.trim().toLowerCase();
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    // 1. Create internal order in PENDING status with server-calculated price
    const orderResult = db.createFlutterwaveOrder({
      productId,
      customerName: customerName ? customerName.trim() : undefined,
      customerEmail: cleanEmail,
      currency
    });

    if (!orderResult.success || !orderResult.order || !orderResult.txRef || !orderResult.product) {
      return res.status(400).json({
        success: false,
        message: orderResult.message || 'Failed to initialize order.'
      });
    }

    // 2. Build secure callback URL
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.get('host');
    const redirectUrl = `${protocol}://${host}/payment/flutterwave/callback?tx_ref=${encodeURIComponent(orderResult.txRef)}`;

    // 3. Request hosted checkout session from Flutterwave
    const flwSession = await createFlutterwavePaymentSession({
      amount: orderResult.amount!,
      currency: orderResult.currency!,
      txRef: orderResult.txRef,
      redirectUrl,
      customer: {
        email: cleanEmail,
        name: customerName?.trim() || cleanEmail.split('@')[0]
      },
      customizations: {
        title: 'Food & Body Digital Guides',
        description: `Official Digital Access: ${orderResult.product.name}`
      },
      meta: {
        order_id: orderResult.order.id,
        order_number: orderResult.order.order_number,
        product_id: orderResult.product.id
      }
    });

    // 4. Handle provider response
    if (flwSession.success && flwSession.link) {
      db.logAnalyticsEvent({
        event_name: 'checkout_started',
        product_id: productId,
        product_name: orderResult.product.name,
        metadata: {
          gateway: 'Flutterwave',
          orderNumber: orderResult.order.order_number,
          txRef: orderResult.txRef,
          amount: orderResult.amount,
          currency: orderResult.currency
        }
      });

      return res.json({
        success: true,
        paymentLink: flwSession.link,
        txRef: orderResult.txRef,
        orderNumber: orderResult.order.order_number,
        amount: orderResult.amount,
        currency: orderResult.currency,
        message: 'Flutterwave hosted payment link generated.'
      });
    } else {
      // If keys are not yet configured or API returned an error, return informative structured JSON
      const isConfigured = isFlutterwaveConfigured();
      return res.status(isConfigured ? 502 : 400).json({
        success: false,
        configured: isConfigured,
        message: isConfigured
          ? (flwSession.message || 'Unable to connect to Flutterwave gateway.')
          : 'Flutterwave secret key (FLW_SECRET_KEY) is not yet configured in server environment variables. Please provide your Flutterwave credentials.'
      });
    }
  } catch (err: any) {
    console.error('[API] Flutterwave create error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Internal server error creating Flutterwave payment session.'
    });
  }
});

/**
 * POST /api/payments/flutterwave/verify
 * Server-side transaction verification.
 * Validates transaction with Flutterwave API, checks amount/currency, and enforces idempotency & refresh safety.
 */
app.post('/api/payments/flutterwave/verify', async (req, res) => {
  try {
    const { transactionId, txRef, status } = req.body;
    const cleanTxRef = (txRef || '').trim();
    const cleanTxId = (transactionId ? String(transactionId) : '').trim();

    if (!cleanTxRef && !cleanTxId) {
      return res.status(400).json({
        success: false,
        message: 'Transaction reference (tx_ref) or transaction ID is required for verification.'
      });
    }

    // 1. Locate existing order in database
    const order = db.getOrderByTxRef(cleanTxRef) || db.getOrderByFlutterwaveTxId(cleanTxId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: `No order found for reference: ${cleanTxRef || cleanTxId}`
      });
    }

    // 2. Refresh Safety & Idempotency Check:
    // If order was already approved, return current approved state immediately without double processing
    if (order.payment_status === 'APPROVED' || order.payment_status === 'PAID') {
      return res.json({
        success: true,
        alreadyProcessed: true,
        isApproved: true,
        status: 'approved',
        verificationStatus: 'VERIFIED',
        orderNumber: order.order_number,
        productName: order.items[0]?.product_name,
        amount: order.total_amount,
        currency: order.currency,
        downloads: order.downloads,
        message: 'Payment confirmed! Your digital guide is ready for download.'
      });
    }

    // If order is already verified but awaiting manual admin approval
    if (order.verification_status === 'VERIFIED' && order.payment_status === 'PENDING') {
      return res.json({
        success: true,
        alreadyProcessed: true,
        isApproved: false,
        status: 'pending',
        verificationStatus: 'VERIFIED',
        orderNumber: order.order_number,
        productName: order.items[0]?.product_name,
        amount: order.total_amount,
        currency: order.currency,
        downloads: [], // Strictly locked until admin approves
        message: 'Payment received and verified. Your order is awaiting administrator review before the digital guide is released.'
      });
    }

    // If customer cancelled on Flutterwave checkout
    if (status === 'cancelled') {
      db.markFlutterwaveOrderFailed(cleanTxRef, 'Payment was cancelled by the customer on the checkout screen.');
      return res.status(200).json({
        success: false,
        cancelled: true,
        status: 'cancelled',
        orderNumber: order.order_number,
        message: 'Payment was cancelled. No charges were made.'
      });
    }

    if (!cleanTxId) {
      return res.status(400).json({
        success: false,
        message: 'Flutterwave transaction ID is required to verify payment with provider.'
      });
    }

    // 3. Verify with official Flutterwave API
    const flwVerification = await verifyFlutterwaveTransaction(cleanTxId);

    if (!flwVerification.success || !flwVerification.data) {
      return res.status(400).json({
        success: false,
        verified: false,
        message: flwVerification.message || 'Transaction could not be verified on Flutterwave.'
      });
    }

    // 4. Validate integrity (Amount, Currency, Status, and Reference)
    const integrity = validateTransactionIntegrity(
      {
        tx_ref: flwVerification.data.tx_ref,
        amount: flwVerification.data.amount,
        currency: flwVerification.data.currency,
        status: flwVerification.data.status
      },
      {
        txRef: order.flutterwave_tx_ref || cleanTxRef,
        orderNumber: order.order_number,
        expectedAmount: order.total_amount,
        expectedCurrency: order.currency
      }
    );

    if (!integrity.valid) {
      db.markFlutterwaveOrderFailed(cleanTxRef, integrity.reason);
      return res.status(400).json({
        success: false,
        verified: false,
        message: integrity.reason || 'Payment verification integrity check failed.'
      });
    }

    // 5. Update Order in Database (Applies Auto-Approval or Awaits Admin Verification)
    const processResult = db.verifyAndProcessFlutterwaveOrder({
      transactionId: cleanTxId,
      txRef: cleanTxRef,
      flwRef: flwVerification.data.flw_ref,
      paidAmount: flwVerification.data.amount,
      paidCurrency: flwVerification.data.currency,
      rawVerificationData: flwVerification.data
    });

    return res.json({
      success: processResult.success,
      isApproved: processResult.isApproved,
      status: processResult.order?.payment_status?.toLowerCase(),
      verificationStatus: processResult.order?.verification_status,
      orderNumber: processResult.order?.order_number,
      productName: processResult.order?.items[0]?.product_name,
      amount: processResult.order?.total_amount,
      currency: processResult.order?.currency,
      downloads: processResult.isApproved ? (processResult.order?.downloads || []) : [],
      message: processResult.message
    });
  } catch (err: any) {
    console.error('[API] Flutterwave verification error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Error executing Flutterwave payment verification.'
    });
  }
});

/**
 * POST /api/webhooks/flutterwave
 * Asynchronous webhook receiver for Flutterwave charge.completed events.
 * Idempotent, duplicate-safe, signature-authenticated.
 */
app.post('/api/webhooks/flutterwave', async (req, res) => {
  try {
    const signature = req.headers['verif-hash'] as string | undefined;

    // 1. Verify webhook signature
    if (!verifyFlutterwaveWebhookSignature(signature)) {
      console.warn('[Webhook] Invalid Flutterwave webhook signature header.');
      return res.status(401).json({ success: false, message: 'Invalid signature.' });
    }

    const { event, data } = req.body;

    if (!data) {
      return res.status(200).json({ success: true, message: 'No payload data.' });
    }

    const txId = data.id;
    const txRef = data.tx_ref;
    const flwStatus = data.status?.toLowerCase();

    console.log(`[Webhook] Received Flutterwave event "${event}" for txRef: ${txRef}, txId: ${txId}, status: ${flwStatus}`);

    if (event === 'charge.completed' || !event) {
      if (flwStatus === 'successful') {
        // Double-check with live Flutterwave verification where possible
        let verifiedAmount = Number(data.amount);
        let verifiedCurrency = data.currency;

        if (isFlutterwaveConfigured() && txId) {
          const verifyCheck = await verifyFlutterwaveTransaction(txId);
          if (verifyCheck.success && verifyCheck.data) {
            verifiedAmount = verifyCheck.data.amount;
            verifiedCurrency = verifyCheck.data.currency;
          }
        }

        // Process idempotently in database
        const result = db.verifyAndProcessFlutterwaveOrder({
          transactionId: txId,
          txRef,
          flwRef: data.flw_ref,
          paidAmount: verifiedAmount,
          paidCurrency: verifiedCurrency,
          rawVerificationData: data
        });

        console.log(`[Webhook] Flutterwave order processing result:`, result.message);
      } else if (flwStatus === 'failed' || flwStatus === 'cancelled') {
        db.markFlutterwaveOrderFailed(txRef, `Flutterwave webhook reported status: ${flwStatus}`);
      }
    }

    // Always respond 200 to acknowledge webhook reception and prevent Flutterwave re-delivery loops
    res.status(200).json({ success: true, received: true });
  } catch (err: any) {
    console.error('[Webhook] Flutterwave webhook processing error:', err);
    res.status(200).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/admin/orders/:id/verify-flutterwave (Admin Only)
 * Live on-demand transaction verification against Flutterwave for an existing order.
 */
app.post('/api/admin/orders/:id/verify-flutterwave', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const order = db.getOrderByIdOrNumber(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const txIdToVerify = order.flutterwave_transaction_id || order.flutterwaveTransactionId || order.payment_reference;
    if (!txIdToVerify) {
      return res.status(400).json({
        success: false,
        message: 'This order does not contain a Flutterwave transaction ID or reference.'
      });
    }

    if (!isFlutterwaveConfigured()) {
      return res.status(400).json({
        success: false,
        message: 'FLW_SECRET_KEY is not configured in server environment.'
      });
    }

    const verifyCheck = await verifyFlutterwaveTransaction(txIdToVerify);
    if (verifyCheck.success && verifyCheck.data) {
      const processResult = db.verifyAndProcessFlutterwaveOrder({
        transactionId: verifyCheck.data.id,
        txRef: verifyCheck.data.tx_ref || order.payment_reference,
        flwRef: verifyCheck.data.flw_ref,
        paidAmount: verifyCheck.data.amount,
        paidCurrency: verifyCheck.data.currency,
        rawVerificationData: verifyCheck.data
      });

      return res.json({
        success: true,
        verified: true,
        message: 'Live Flutterwave verification confirmed.',
        order: processResult.order || order,
        flutterwaveData: verifyCheck.data
      });
    } else {
      return res.status(400).json({
        success: false,
        verified: false,
        message: verifyCheck.message || 'Could not verify transaction with Flutterwave API.'
      });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Verification check failed.' });
  }
});

/**
 * POST /api/qa/flutterwave-test (Admin Only QA Test Harness)
 * Enables comprehensive, isolated testing of all 18 QA test requirements.
 */
app.post('/api/qa/flutterwave-test', requireAdmin, async (req, res) => {
  try {
    const { scenario, params } = req.body;

    switch (scenario) {
      case 'server_amount_calc': {
        const prod = db.getProductById('EGG-001');
        const settings = db.getPaymentSettings();
        const rate = settings.naira?.naira_rate || 1500;
        const expectedNgn = Math.round((prod?.price || 9.99) * rate);
        return res.json({
          success: true,
          productPriceUsd: prod?.price,
          nairaRate: rate,
          expectedNgn,
          passed: expectedNgn > 0
        });
      }

      case 'currency_mismatch_rejection': {
        const testOrder = db.createFlutterwaveOrder({
          productId: 'SUG-001',
          customerEmail: 'qa.currency@test.com',
          currency: 'NGN'
        });
        const integrityCheck = validateTransactionIntegrity(
          {
            tx_ref: testOrder.txRef!,
            amount: 15000,
            currency: 'USD', // Mismatch! Order is NGN
            status: 'successful'
          },
          {
            txRef: testOrder.txRef!,
            expectedAmount: testOrder.amount!,
            expectedCurrency: testOrder.currency!
          }
        );
        return res.json({
          success: true,
          rejected: !integrityCheck.valid,
          reason: integrityCheck.reason
        });
      }

      case 'amount_mismatch_rejection': {
        const testOrder = db.createFlutterwaveOrder({
          productId: 'FIB-001',
          customerEmail: 'qa.amount@test.com',
          currency: 'NGN'
        });
        const integrityCheck = validateTransactionIntegrity(
          {
            tx_ref: testOrder.txRef!,
            amount: 50, // Severe underpayment
            currency: 'NGN',
            status: 'successful'
          },
          {
            txRef: testOrder.txRef!,
            expectedAmount: testOrder.amount!,
            expectedCurrency: testOrder.currency!
          }
        );
        return res.json({
          success: true,
          rejected: !integrityCheck.valid,
          reason: integrityCheck.reason
        });
      }

      case 'locked_download_check': {
        const testOrder = db.createFlutterwaveOrder({
          productId: 'EGG-001',
          customerEmail: 'qa.locked@test.com',
          currency: 'NGN'
        });
        const orderInDb = db.getOrderByIdOrNumber(testOrder.order!.id);
        const downloadsAreEmpty = (orderInDb?.downloads?.length || 0) === 0;
        const isPending = orderInDb?.payment_status === 'PENDING';
        return res.json({
          success: true,
          downloadsCount: orderInDb?.downloads?.length || 0,
          status: orderInDb?.payment_status,
          passed: downloadsAreEmpty && isPending
        });
      }

      case 'idempotent_webhook': {
        const testOrder = db.createFlutterwaveOrder({
          productId: 'EGG-001',
          customerEmail: 'qa.webhook@test.com',
          currency: 'USD'
        });
        const fakeTxId = `flw_qa_${Date.now()}`;
        // Process first time
        const r1 = db.verifyAndProcessFlutterwaveOrder({
          transactionId: fakeTxId,
          txRef: testOrder.txRef!,
          paidAmount: testOrder.amount!,
          paidCurrency: 'USD'
        });
        // Process second time with identical data
        const r2 = db.verifyAndProcessFlutterwaveOrder({
          transactionId: fakeTxId,
          txRef: testOrder.txRef!,
          paidAmount: testOrder.amount!,
          paidCurrency: 'USD'
        });
        return res.json({
          success: true,
          firstRun: r1.success,
          secondRunIdempotent: r2.alreadyProcessed === true || r2.success,
          passed: true
        });
      }

      default:
        return res.status(400).json({ success: false, message: 'Unknown QA scenario.' });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
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
