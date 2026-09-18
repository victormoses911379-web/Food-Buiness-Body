export type ProductType = 'SINGLE' | 'BUNDLE';
export type ProductStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type PaymentStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID' | 'FAILED' | 'REFUNDED' | 'CANCELLED';

export interface NigerianNairaSettings {
  enabled: boolean;
  method_name: string;
  account_name: string;
  bank_name: string;
  account_number: string;
  currency: string;
  instructions: string;
  naira_rate?: number; // e.g. 1500 NGN per USD
}

export interface PayPalSettings {
  enabled: boolean;
  method_name: string;
  account_name: string;
  email: string;
  currency: string;
  instructions: string;
}

export interface CryptoOption {
  id: string;
  name: string;
  network: string;
  wallet_address: string;
  currency_symbol: string;
  note?: string;
}

export interface CryptoSettings {
  enabled: boolean;
  method_name: string;
  instructions: string;
  options: CryptoOption[];
}

export interface FlutterwaveSettings {
  enabled: boolean;
  method_name: string;
  currency: string; // 'NGN' | 'USD'
  auto_approve: boolean; // default: false (manual admin approval required)
  instructions: string;
}

export interface PaymentSettings {
  // Method Configurations
  naira: NigerianNairaSettings;
  paypal: PayPalSettings;
  crypto: CryptoSettings;
  flutterwave: FlutterwaveSettings;
  updated_at: string;

  // Legacy fallback compatibility fields
  payment_method_name?: string;
  account_name?: string;
  account_number_or_email?: string;
  currency?: string;
  instructions?: string;
}

export interface ManualPaymentSubmission {
  productId: string;
  customerName?: string;
  customerEmail: string;
  amountPaid: number;
  paymentMethod: string; // e.g. "Nigerian Naira (₦)", "PayPal", "Crypto — USDT (TRC20)"
  transactionReference: string;
  paymentProof?: string; // base64 or proof text/link
  proofFilename?: string;
  additionalNote?: string;
  confirmedCheckbox: boolean;
}

export interface Product {
  id: string; // e.g. "EGG-001"
  name: string;
  slug: string;
  subtitle: string;
  description: string;
  short_description: string;
  price: number; // in USD e.g. 9.99
  currency: string; // "USD"
  type: ProductType;
  status: ProductStatus;
  cover_image: string;
  file_reference: string;
  bundle_item_ids?: string[]; // If BUNDLE, list of child product IDs
  pages: number;
  format: string; // e.g. "Digital PDF (Interactive & Printable)"
  benefits: string[];
  what_is_included: {
    chapter: string;
    title: string;
    description: string;
    pages: string;
  }[];
  preview_pages: {
    pageNumber: number;
    title: string;
    caption: string;
    highlight: string;
  }[];
  faqs: {
    question: string;
    answer: string;
  }[];
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
}

export interface DownloadToken {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  token: string;
  expires_at: string;
  download_count: number;
  max_downloads: number;
  created_at: string;
  revoked?: boolean;
}

export interface PaymentRecord {
  paymentId: string;
  customerName: string;
  customerEmail: string;
  productId: string;
  productName: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  transactionId: string;
  paymentReference: string;
  receiptUrl?: string;
  receiptFile?: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected' | 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  adminNote?: string;
  downloadToken?: string;
  downloadExpiresAt?: string;
}

export interface Order {
  id: string;
  order_number: string; // e.g. "ORD-20261001-000001"
  paymentId?: string; // alias for id
  status?: string; // alias for payment_status
  user_id: string;
  customer_name?: string;
  customer_email: string;
  total_amount: number;
  currency: string;
  payment_provider: string; // "Manual Confirmation" | "Flutterwave"
  payment_reference: string; // Unique transaction/reference ID submitted by customer
  paymentMethod?: string;
  paymentProvider?: string;
  flutterwaveTransactionId?: string | null;
  flutterwaveTxRef?: string | null;
  flutterwave_transaction_id?: string | null;
  flutterwave_tx_ref?: string | null;
  flutterwave_flw_ref?: string | null;
  verificationStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED';
  verification_status?: 'PENDING' | 'VERIFIED' | 'REJECTED';
  paidAt?: string | null;
  paid_at?: string | null;
  verifiedAt?: string | null;
  verified_at?: string | null;
  transactionId?: string; // alias for payment_reference
  payment_status: PaymentStatus;
  payment_proof?: string; // Base64 screenshot or proof url/text
  receiptUrl?: string; // alias for payment_proof
  proof_filename?: string;
  additional_note?: string; // Optional customer note or payment details
  notes?: string; // alias for additional_note
  confirmation_confirmed?: boolean; // "I confirm that I have completed the payment."
  reviewed_at?: string;
  approvedAt?: string; // alias for reviewed_at
  rejectedAt?: string; // alias
  reviewed_by?: string;
  rejection_reason?: string;
  adminNote?: string; // alias for rejection_reason
  items: OrderItem[];
  downloads: DownloadToken[];
  created_at: string;
  createdAt?: string; // alias
  updated_at: string;
  updatedAt?: string; // alias
}

export interface EmailLog {
  id: string;
  recipient_email: string;
  recipient_name?: string;
  subject: string;
  type: 'PURCHASE_CONFIRMATION' | 'PRODUCT_DELIVERY';
  order_number: string;
  product_name: string;
  body_text: string;
  download_urls: { productName: string; url: string; token: string }[];
  sent_at: string;
  status: 'SENT' | 'FAILED';
}

export interface AnalyticsEvent {
  id: string;
  event_name: 'page_view' | 'product_view' | 'buy_click' | 'checkout_started' | 'payment_success' | 'download_started';
  product_id?: string;
  product_name?: string;
  url?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface CheckoutRequest {
  productId: string;
  customerEmail: string;
  customerName?: string;
}

export interface CheckoutResponse {
  checkoutId: string;
  paymentReference: string;
  amount: number;
  currency: string;
  productId: string;
  productName: string;
  customerEmail: string;
  paymentUrl: string;
}
