/**
 * Server-Side Flutterwave Payment Integration Service
 * Adheres strictly to official Flutterwave Standard Hosted Checkout API (v3).
 * FLW_SECRET_KEY and FLW_ENCRYPTION_KEY are strictly contained on the server.
 */

export interface CreateFlutterwavePaymentParams {
  amount: number;
  currency: string;
  txRef: string;
  redirectUrl: string;
  customer: {
    email: string;
    name?: string;
  };
  customizations?: {
    title?: string;
    description?: string;
    logo?: string;
  };
  meta?: Record<string, any>;
}

export interface FlutterwaveCreateResponse {
  success: boolean;
  link?: string;
  txRef?: string;
  message?: string;
  raw?: any;
}

export interface FlutterwaveVerifyResponse {
  success: boolean;
  verified: boolean;
  data?: {
    id: number | string;
    tx_ref: string;
    flw_ref?: string;
    amount: number;
    currency: string;
    status: string; // 'successful' | 'failed'
    charged_amount?: number;
    customer?: {
      email: string;
      name?: string;
    };
    created_at?: string;
  };
  message?: string;
  raw?: any;
}

/**
 * Check if Flutterwave credentials exist in the server environment
 */
export function isFlutterwaveConfigured(): boolean {
  return !!process.env.FLW_SECRET_KEY && process.env.FLW_SECRET_KEY.trim() !== '';
}

/**
 * Check if automated approval is enabled for verified Flutterwave transactions
 * Defaults to FALSE so the publisher can manually review orders before releasing digital guides.
 */
export function isFlutterwaveAutoApproveEnabled(): boolean {
  return process.env.FLUTTERWAVE_AUTO_APPROVE === 'true';
}

/**
 * Create a standard hosted checkout payment session on Flutterwave
 * Endpoint: POST https://api.flutterwave.com/v3/payments
 */
export async function createFlutterwavePaymentSession(
  params: CreateFlutterwavePaymentParams
): Promise<FlutterwaveCreateResponse> {
  const secretKey = process.env.FLW_SECRET_KEY?.trim();

  if (!secretKey) {
    return {
      success: false,
      message: 'Flutterwave Secret Key (FLW_SECRET_KEY) is not configured in server environment variables.'
    };
  }

  try {
    const payload = {
      tx_ref: params.txRef,
      amount: params.amount,
      currency: params.currency.toUpperCase(),
      redirect_url: params.redirectUrl,
      customer: {
        email: params.customer.email.toLowerCase().trim(),
        name: params.customer.name || 'Valued Reader'
      },
      customizations: {
        title: params.customizations?.title || 'Food & Body Publishing',
        description: params.customizations?.description || 'Digital Guide Purchase',
        logo: params.customizations?.logo || 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=128&auto=format&fit=crop&q=80'
      },
      meta: params.meta || {}
    };

    const response = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data: any = await response.json();

    if (response.ok && data.status === 'success' && data.data?.link) {
      return {
        success: true,
        link: data.data.link,
        txRef: params.txRef,
        raw: data
      };
    } else {
      return {
        success: false,
        message: data.message || `Flutterwave API returned status ${response.status}`,
        raw: data
      };
    }
  } catch (err: any) {
    console.error('[Flutterwave] Error initiating payment session:', err);
    return {
      success: false,
      message: err.message || 'Network error connecting to Flutterwave.'
    };
  }
}

/**
 * Verify a completed transaction with the Flutterwave API
 * Endpoint: GET https://api.flutterwave.com/v3/transactions/:id/verify
 */
export async function verifyFlutterwaveTransaction(
  transactionId: string | number
): Promise<FlutterwaveVerifyResponse> {
  const secretKey = process.env.FLW_SECRET_KEY?.trim();

  if (!secretKey) {
    return {
      success: false,
      verified: false,
      message: 'Flutterwave Secret Key (FLW_SECRET_KEY) is not configured in server environment.'
    };
  }

  try {
    const response = await fetch(`https://api.flutterwave.com/v3/transactions/${transactionId}/verify`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json'
      }
    });

    const data: any = await response.json();

    if (response.ok && data.status === 'success' && data.data) {
      const tx = data.data;
      const isSuccessful = tx.status?.toLowerCase() === 'successful';

      return {
        success: true,
        verified: isSuccessful,
        data: {
          id: tx.id,
          tx_ref: tx.tx_ref,
          flw_ref: tx.flw_ref,
          amount: Number(tx.amount),
          currency: tx.currency,
          status: tx.status,
          charged_amount: Number(tx.charged_amount || tx.amount),
          customer: {
            email: tx.customer?.email,
            name: tx.customer?.name
          },
          created_at: tx.created_at
        },
        message: isSuccessful ? 'Transaction verified successfully.' : `Transaction status is: ${tx.status}`,
        raw: data
      };
    } else {
      return {
        success: false,
        verified: false,
        message: data.message || 'Transaction could not be verified on Flutterwave.',
        raw: data
      };
    }
  } catch (err: any) {
    console.error('[Flutterwave] Error verifying transaction:', err);
    return {
      success: false,
      verified: false,
      message: err.message || 'Network error verifying Flutterwave transaction.'
    };
  }
}

/**
 * Validate incoming transaction details against expected internal order
 */
export function validateTransactionIntegrity(
  txData: {
    tx_ref: string;
    amount: number;
    currency: string;
    status: string;
  },
  expected: {
    txRef: string;
    orderNumber?: string;
    expectedAmount: number;
    expectedCurrency: string;
  }
): { valid: boolean; reason?: string } {
  // 1. Transaction status must be successful
  if (txData.status?.toLowerCase() !== 'successful') {
    return { valid: false, reason: `Transaction is not successful (status: ${txData.status})` };
  }

  // 2. Reference match (tx_ref must match internal expected reference or order number)
  const matchesRef = txData.tx_ref === expected.txRef ||
    (expected.orderNumber && txData.tx_ref.includes(expected.orderNumber));
  if (!matchesRef) {
    return { valid: false, reason: `Transaction reference mismatch. Expected ${expected.txRef}, got ${txData.tx_ref}` };
  }

  // 3. Currency match
  if (txData.currency?.toUpperCase() !== expected.expectedCurrency?.toUpperCase()) {
    return {
      valid: false,
      reason: `Currency mismatch. Expected ${expected.expectedCurrency}, got ${txData.currency}`
    };
  }

  // 4. Amount match (allowing reasonable rounding tolerance if applicable)
  const diff = Math.abs(txData.amount - expected.expectedAmount);
  if (diff > 0.05 && txData.amount < expected.expectedAmount) {
    return {
      valid: false,
      reason: `Amount paid (${txData.amount} ${txData.currency}) is less than required price (${expected.expectedAmount} ${expected.expectedCurrency})`
    };
  }

  return { valid: true };
}

/**
 * Verify Webhook Signature via verif-hash header
 */
export function verifyFlutterwaveWebhookSignature(headerSignature: string | undefined): boolean {
  const secretHash = process.env.FLW_SECRET_HASH?.trim();

  // If secret hash is configured, verify header exactly matches
  if (secretHash) {
    return headerSignature === secretHash;
  }

  // If secret hash is not configured, we allow the webhook through to perform a server-side
  // re-verification of the transaction via `verifyFlutterwaveTransaction(data.id)`.
  return true;
}
