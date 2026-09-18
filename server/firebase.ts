import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore as getAdminFirestore, Firestore } from 'firebase-admin/firestore';

let firestoreInstance: Firestore | null = null;
let isInitialized = false;

/**
 * Lazy initialization of Firebase Admin SDK / Firestore
 * Respects environment constraints: does not crash if credentials are not configured.
 */
export function getFirestore(): Firestore | null {
  if (firestoreInstance) return firestoreInstance;

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (privateKey) {
    // Correctly format escaped newlines in environment variable
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  if (projectId && clientEmail && privateKey) {
    try {
      if (getApps().length === 0) {
        initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        });
      }
      firestoreInstance = getAdminFirestore();
      isInitialized = true;
      console.log(`[Firebase Firestore] Successfully connected to project: ${projectId}`);
      return firestoreInstance;
    } catch (err) {
      console.error('[Firebase Firestore] Initialization error with supplied credentials:', err);
    }
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
      if (getApps().length === 0) {
        initializeApp();
      }
      firestoreInstance = getAdminFirestore();
      isInitialized = true;
      console.log('[Firebase Firestore] Connected via GOOGLE_APPLICATION_CREDENTIALS');
      return firestoreInstance;
    } catch (err) {
      console.error('[Firebase Firestore] Error with application default credentials:', err);
    }
  } else {
    // Credentials not yet configured
    if (!isInitialized) {
      console.log('[Firebase Firestore] Environment variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY) not set.');
      console.log('[Storage Engine] Operating in durable persistent local file mode (data/db.json). Ready to seamlessly connect when Firebase credentials are provided.');
      isInitialized = true;
    }
  }

  return null;
}

export function isFirestoreActive(): boolean {
  return getFirestore() !== null;
}

/**
 * Save or update payment submission in Firestore
 */
export async function syncPaymentToFirestore(paymentData: any): Promise<boolean> {
  const db = getFirestore();
  if (!db) return false;

  try {
    const docId = paymentData.paymentId || paymentData.id || paymentData.order_number;
    await db.collection('payments').doc(docId).set(
      {
        paymentId: paymentData.paymentId || paymentData.id,
        orderNumber: paymentData.order_number || paymentData.orderNumber,
        customerName: paymentData.customer_name || paymentData.customerName || '',
        customerEmail: (paymentData.customer_email || paymentData.customerEmail || '').toLowerCase(),
        productId: paymentData.productId || (paymentData.items?.[0]?.product_id) || '',
        productName: paymentData.productName || (paymentData.items?.[0]?.product_name) || '',
        amount: paymentData.total_amount || paymentData.amount || 0,
        currency: paymentData.currency || 'USD',
        paymentMethod: paymentData.payment_provider || paymentData.paymentMethod || 'Manual Payment',
        transactionId: paymentData.payment_reference || paymentData.transactionId || '',
        paymentReference: paymentData.payment_reference || paymentData.paymentReference || '',
        receiptUrl: paymentData.payment_proof || paymentData.receiptUrl || '',
        notes: paymentData.additional_note || paymentData.notes || '',
        status: (paymentData.payment_status || paymentData.status || 'pending').toLowerCase(),
        createdAt: paymentData.created_at || paymentData.createdAt || new Date().toISOString(),
        updatedAt: paymentData.updated_at || paymentData.updatedAt || new Date().toISOString(),
        approvedAt: paymentData.reviewed_at || paymentData.approvedAt || null,
        rejectedAt: paymentData.rejectedAt || null,
        adminNote: paymentData.rejection_reason || paymentData.adminNote || '',
        downloadToken: paymentData.downloads?.[0]?.token || paymentData.downloadToken || null,
        downloadExpiresAt: paymentData.downloads?.[0]?.expires_at || paymentData.downloadExpiresAt || null,
        syncedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    console.log(`[Firebase Firestore] Payment ${docId} synchronized successfully.`);
    return true;
  } catch (err) {
    console.error('[Firebase Firestore] Failed to sync payment:', err);
    return false;
  }
}

/**
 * Update payment status (Approve / Reject) in Firestore
 */
export async function updatePaymentStatusInFirestore(
  docId: string,
  status: 'pending' | 'approved' | 'rejected',
  details: {
    adminName?: string;
    adminNote?: string;
    downloadToken?: string;
    downloadExpiresAt?: string;
    downloads?: any[];
  }
): Promise<boolean> {
  const db = getFirestore();
  if (!db) return false;

  try {
    const now = new Date().toISOString();
    const updateData: Record<string, any> = {
      status,
      updatedAt: now,
    };

    if (status === 'approved') {
      updateData.approvedAt = now;
      updateData.reviewedBy = details.adminName || 'Admin';
      if (details.downloadToken) {
        updateData.downloadToken = details.downloadToken;
      }
      if (details.downloadExpiresAt) {
        updateData.downloadExpiresAt = details.downloadExpiresAt;
      }
      if (details.downloads) {
        updateData.downloads = details.downloads;
      }
    } else if (status === 'rejected') {
      updateData.rejectedAt = now;
      updateData.reviewedBy = details.adminName || 'Admin';
      updateData.adminNote = details.adminNote || '';
      updateData.rejectionReason = details.adminNote || '';
    }

    await db.collection('payments').doc(docId).set(updateData, { merge: true });
    console.log(`[Firebase Firestore] Payment ${docId} status updated to ${status}.`);
    return true;
  } catch (err) {
    console.error(`[Firebase Firestore] Error updating payment status for ${docId}:`, err);
    return false;
  }
}

/**
 * Sync centralized payment settings (Naira, PayPal, Crypto) to Firestore
 */
export async function syncSettingsToFirestore(settings: any): Promise<boolean> {
  const db = getFirestore();
  if (!db) return false;

  try {
    await db.collection('payment_settings').doc('global_config').set(
      {
        ...settings,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    console.log('[Firebase Firestore] Payment settings synced to Firestore.');
    return true;
  } catch (err) {
    console.error('[Firebase Firestore] Failed to sync settings:', err);
    return false;
  }
}

/**
 * Retrieve payment status from Firestore
 */
export async function getPaymentFromFirestore(queryKey: string): Promise<any | null> {
  const db = getFirestore();
  if (!db) return null;

  try {
    // First try direct doc ID
    const docSnap = await db.collection('payments').doc(queryKey).get();
    if (docSnap.exists) {
      return { id: docSnap.id, ...docSnap.data() };
    }

    // Try finding by orderNumber or paymentReference
    const refQuery = await db.collection('payments').where('paymentReference', '==', queryKey).limit(1).get();
    if (!refQuery.empty) {
      const doc = refQuery.docs[0];
      return { id: doc.id, ...doc.data() };
    }

    const orderQuery = await db.collection('payments').where('orderNumber', '==', queryKey).limit(1).get();
    if (!orderQuery.empty) {
      const doc = orderQuery.docs[0];
      return { id: doc.id, ...doc.data() };
    }

    return null;
  } catch (err) {
    console.error('[Firebase Firestore] Failed to retrieve payment:', err);
    return null;
  }
}

/**
 * Retrieve customer payments by email from Firestore
 */
export async function getCustomerPaymentsFromFirestore(email: string): Promise<any[]> {
  const db = getFirestore();
  if (!db) return [];

  try {
    const query = await db
      .collection('payments')
      .where('customerEmail', '==', email.toLowerCase().trim())
      .orderBy('createdAt', 'desc')
      .get();

    return query.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error('[Firebase Firestore] Failed to query customer payments:', err);
    return [];
  }
}

/**
 * Retrieve global payment settings from Firestore
 */
export async function getSettingsFromFirestore(): Promise<any | null> {
  const db = getFirestore();
  if (!db) return null;

  try {
    const snap = await db.collection('payment_settings').doc('global_config').get();
    if (snap.exists) {
      return snap.data();
    }
    return null;
  } catch (err) {
    console.error('[Firebase Firestore] Failed to load settings from Firestore:', err);
    return null;
  }
}
