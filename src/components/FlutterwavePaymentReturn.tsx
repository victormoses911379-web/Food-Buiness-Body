import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  XCircle, 
  Download, 
  FileText, 
  ArrowRight, 
  Loader2, 
  ShieldCheck, 
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { safeFetchJson } from '../lib/api';

interface FlutterwavePaymentReturnProps {
  onReturnToCatalog: () => void;
  onOpenPurchases: (email: string) => void;
}

export const FlutterwavePaymentReturn: React.FC<FlutterwavePaymentReturnProps> = ({
  onReturnToCatalog,
  onOpenPurchases
}) => {
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<'verifying' | 'approved' | 'pending' | 'cancelled' | 'failed'>('verifying');
  const [orderData, setOrderData] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const verifyTransaction = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const txRef = urlParams.get('tx_ref') || urlParams.get('txRef') || '';
        const transactionId = urlParams.get('transaction_id') || urlParams.get('transactionId') || '';
        const flwStatus = urlParams.get('status') || '';

        // If user cancelled on Flutterwave checkout
        if (flwStatus === 'cancelled') {
          if (isMounted) {
            setState('cancelled');
            setLoading(false);
          }
          return;
        }

        if (!txRef && !transactionId) {
          if (isMounted) {
            setState('failed');
            setErrorMessage('Missing transaction reference in callback URL.');
            setLoading(false);
          }
          return;
        }

        // Call backend verification endpoint (Server-side verification)
        const response = await safeFetchJson('/api/payments/flutterwave/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            txRef,
            transactionId,
            status: flwStatus
          })
        });

        if (!isMounted) return;

        if (response.success) {
          const data = response.data || {};
          setOrderData(data);

          if (data.isApproved || data.status === 'approved' || data.status === 'PAID') {
            setState('approved');
          } else {
            // Verified with Flutterwave, but awaiting admin manual approval
            setState('pending');
          }
        } else {
          setState('failed');
          setErrorMessage(response.message || response.error || 'Payment verification could not be confirmed.');
        }
      } catch (err: any) {
        if (isMounted) {
          setState('failed');
          setErrorMessage(err.message || 'An unexpected error occurred while verifying your payment.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    verifyTransaction();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden animate-fade-in">
        
        {/* Header Bar */}
        <div className="p-5 border-b border-stone-200 bg-stone-50/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-stone-900 text-white flex items-center justify-center font-serif font-bold text-sm shadow-xs">
              F&B
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500 block">
                Food & Body Publishing • Payment Verification
              </span>
              <h2 className="font-serif text-base font-bold text-stone-900 leading-tight">
                Flutterwave Online Checkout
              </h2>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-stone-200/70 text-stone-700">
            Secure 256-Bit
          </span>
        </div>

        {/* BODY CONTENT BASED ON STATE */}
        <div className="p-6 sm:p-8 space-y-6">

          {/* 1. VERIFYING STATE */}
          {state === 'verifying' && (
            <div className="text-center py-10 space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-50 text-amber-800 ring-8 ring-amber-50/60">
                <Loader2 className="w-8 h-8 text-amber-700 animate-spin" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-2xl font-bold text-stone-900">
                  Verifying Payment with Flutterwave...
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Please hold on while our server confirms your transaction details and secures your digital order.
                </p>
              </div>
            </div>
          )}

          {/* 2. APPROVED STATE (Auto-Approved or Instant Verification) */}
          {state === 'approved' && orderData && (
            <div className="space-y-5 animate-fade-in">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 ring-8 ring-emerald-50">
                  <CheckCircle2 className="w-8 h-8 text-emerald-700" />
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                  Payment Confirmed!
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
                  Your payment via Flutterwave has been verified and your single-user watermarked PDF guide is ready.
                </p>
              </div>

              {/* Order Meta Box */}
              <div className="rounded-2xl border border-stone-200 bg-stone-50/80 p-4 sm:p-5 space-y-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-stone-400 font-semibold block text-[10px] uppercase">Order Number</span>
                    <span className="font-mono font-bold text-stone-900">{orderData.orderNumber}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 font-semibold block text-[10px] uppercase">Amount</span>
                    <span className="font-serif font-bold text-stone-900">
                      {orderData.currency === 'NGN' ? '₦' : '$'}{orderData.amount?.toLocaleString()} {orderData.currency}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-stone-400 font-semibold block text-[10px] uppercase">Product</span>
                    <span className="font-semibold text-stone-900">{orderData.productName || 'Digital Publication'}</span>
                  </div>
                </div>

                {/* Instant Download Links */}
                {orderData.downloads && orderData.downloads.length > 0 && (
                  <div className="pt-2 border-t border-stone-200 space-y-2">
                    <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider block">
                      Download Your Digital Guide
                    </span>
                    {orderData.downloads.map((dl: any, idx: number) => (
                      <a
                        key={idx}
                        href={`/api/download/${dl.token}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-emerald-200" />
                          <span>{dl.product_name || 'Download PDF Guide'}</span>
                        </div>
                        <Download className="w-4 h-4" />
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={onReturnToCatalog}
                  className="flex-1 py-3.5 px-6 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Return to Catalog</span>
                </button>
              </div>
            </div>
          )}

          {/* 3. PENDING STATE (Manual Admin Verification Mode) */}
          {state === 'pending' && orderData && (
            <div className="space-y-5 animate-fade-in">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 text-amber-800 ring-8 ring-amber-50">
                  <Clock className="w-8 h-8 text-amber-700 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold uppercase tracking-wider inline-block">
                    Payment Verified • Awaiting Admin Approval
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                    Payment Received Successfully!
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
                  Your online payment has been verified by Flutterwave. Your order is currently under administrator review before your watermarked PDF download is released.
                </p>
              </div>

              {/* Order Meta Box */}
              <div className="rounded-2xl border border-stone-200 bg-stone-50/80 p-4 sm:p-5 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-stone-400 font-semibold block text-[10px] uppercase">Order Number</span>
                    <span className="font-mono font-bold text-stone-900">{orderData.orderNumber}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 font-semibold block text-[10px] uppercase">Amount Received</span>
                    <span className="font-serif font-bold text-stone-900">
                      {orderData.currency === 'NGN' ? '₦' : '$'}{orderData.amount?.toLocaleString()} {orderData.currency}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 font-semibold block text-[10px] uppercase">Gateway Status</span>
                    <span className="font-bold text-emerald-800">Verified on Flutterwave</span>
                  </div>
                  <div>
                    <span className="text-stone-400 font-semibold block text-[10px] uppercase">Download Status</span>
                    <span className="font-bold text-amber-800">Locked pending admin approval</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-stone-200 text-stone-600 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span>
                    To maintain digital rights protection, downloads are locked until administrative approval. You can track this order anytime under <strong>"My Purchases"</strong>.
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={onReturnToCatalog}
                  className="flex-1 py-3.5 px-6 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>Return to Catalog</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* 4. CANCELLED STATE */}
          {state === 'cancelled' && (
            <div className="text-center py-6 space-y-4 animate-fade-in">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-stone-100 text-stone-600 ring-8 ring-stone-50">
                <XCircle className="w-8 h-8 text-stone-500" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-2xl font-bold text-stone-900">
                  Payment Cancelled
                </h3>
                <p className="text-xs text-stone-600 max-w-sm mx-auto">
                  You cancelled the Flutterwave checkout session. No charges were made to your card or account.
                </p>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={onReturnToCatalog}
                  className="py-3.5 px-6 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-md transition-all inline-flex items-center gap-2"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  <span>Back to Guides Catalog</span>
                </button>
              </div>
            </div>
          )}

          {/* 5. FAILED STATE */}
          {state === 'failed' && (
            <div className="text-center py-6 space-y-4 animate-fade-in">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-100 text-rose-800 ring-8 ring-rose-50">
                <AlertCircle className="w-8 h-8 text-rose-700" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-2xl font-bold text-stone-900">
                  Verification Failed
                </h3>
                <p className="text-xs text-rose-600 max-w-md mx-auto">
                  {errorMessage || 'Unable to confirm your payment with the Flutterwave gateway.'}
                </p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={onReturnToCatalog}
                  className="py-3.5 px-6 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-md transition-all"
                >
                  Return to Catalog
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
