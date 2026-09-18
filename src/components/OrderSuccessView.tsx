import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Download, 
  FileText, 
  Mail, 
  Copy, 
  Check, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  AlertCircle,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { Order } from '../types';

interface OrderSuccessViewProps {
  order: Order;
  onBrowseMore: () => void;
  onViewAdminEmails?: () => void;
  onOpenReader?: (productId: string, token: string) => void;
}

export const OrderSuccessView: React.FC<OrderSuccessViewProps> = ({
  order,
  onBrowseMore,
  onViewAdminEmails,
  onOpenReader
}) => {
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [downloadingToken, setDownloadingToken] = useState<string | null>(null);
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState<string | null>(null);

  const handleCopyLink = (token: string) => {
    const fullUrl = `${window.location.origin}/api/download/${token}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  const handleDownload = async (token: string, productName: string) => {
    setDownloadingToken(token);
    setDownloadSuccessMessage(null);

    try {
      // Trigger download via window.location or direct anchor tag
      const downloadUrl = `/api/download/${token}`;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `${productName.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadSuccessMessage(`Download started for "${productName}". Check your downloads folder!`);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setTimeout(() => setDownloadingToken(null), 1000);
    }
  };

  const isApproved = order.payment_status === 'APPROVED' || order.payment_status === 'PAID';
  const isPending = order.payment_status === 'PENDING';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-8 animate-fade-in">
      {/* Top Success Banner */}
      <div className="text-center space-y-3">
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-2 ring-8 ${
          isApproved ? 'bg-emerald-100 text-emerald-800 ring-emerald-50' : 'bg-amber-100 text-amber-800 ring-amber-50'
        }`}>
          {isApproved ? (
            <CheckCircle2 className="w-8 h-8 text-emerald-700" />
          ) : (
            <Clock className="w-8 h-8 text-amber-700 animate-pulse" />
          )}
        </div>
        <span className={`text-xs uppercase font-bold tracking-wider block ${
          isApproved ? 'text-emerald-800' : 'text-amber-800'
        }`}>
          {isApproved ? 'Payment Confirmed • Digital Access Unlocked' : 'Payment Submitted • Under Verification'}
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
          {isApproved ? 'Your Digital Guides Are Ready!' : 'Payment Received For Verification'}
        </h1>
        <p className="text-sm sm:text-base text-stone-600 max-w-xl mx-auto">
          {isApproved
            ? 'Thank you for your purchase. Your payment was verified, and your secure single-user download tokens have been generated below.'
            : 'Your payment verification details have been received by our administration team. Once verified, your download access will be unlocked.'}
        </p>
      </div>

      {downloadSuccessMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm text-emerald-900 flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{downloadSuccessMessage}</span>
        </div>
      )}

      {/* Order Reference Card */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-100 text-xs">
          <div>
            <span className="text-stone-400 uppercase font-semibold block text-[10px]">Order Number</span>
            <span className="font-mono text-sm font-bold text-stone-900">{order.order_number}</span>
          </div>

          <div>
            <span className="text-stone-400 uppercase font-semibold block text-[10px]">Purchaser</span>
            <span className="font-medium text-stone-800">{order.customer_email}</span>
          </div>

          <div>
            <span className="text-stone-400 uppercase font-semibold block text-[10px]">Total Paid</span>
            <span className="font-serif text-sm font-bold text-stone-900">${order.total_amount.toFixed(2)} {order.currency}</span>
          </div>

          <div>
            <span className="text-stone-400 uppercase font-semibold block text-[10px]">Payment Status</span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
              isApproved
                ? 'bg-emerald-100 text-emerald-800'
                : isPending
                ? 'bg-amber-100 text-amber-900'
                : 'bg-stone-100 text-stone-700'
            }`}>
              {isApproved ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
              {order.payment_status}
            </span>
          </div>
        </div>

        {/* Delivery Email Notice */}
        <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-stone-600">
          <div className="flex items-center gap-2.5">
            <Mail className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>
              {isApproved
                ? <>A backup copy of your download tokens has been dispatched to <strong>{order.customer_email}</strong>.</>
                : <>A payment receipt and status notification has been dispatched to <strong>{order.customer_email}</strong>.</>}
            </span>
          </div>

          {onViewAdminEmails && (
            <button
              onClick={onViewAdminEmails}
              className="text-[11px] font-semibold text-stone-700 hover:text-stone-950 underline shrink-0 text-left"
            >
              View Dispatched Email Log
            </button>
          )}
        </div>
      </div>

      {/* When Pending */}
      {isPending && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-6 sm:p-7 space-y-4">
          <div className="flex items-start gap-3">
            <Clock className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-serif text-lg font-bold text-stone-900">
                Awaiting Manual Payment Verification
              </h3>
              <p className="text-xs text-stone-700 leading-relaxed">
                Your payment reference is <strong>{order.payment_reference}</strong>. Once our team checks the account statement, your order status will update to <strong>APPROVED</strong> and your downloadable PDF link will be ready.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Digital Entitlements & Secure Downloads List (When Approved) */}
      {isApproved && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl font-bold text-stone-900">
                Your Purchased Downloads ({order.downloads.length})
              </h2>
              <p className="text-xs text-stone-500">
                Generated with single-user licensing watermark & token security.
              </p>
            </div>
            <span className="text-xs font-semibold text-stone-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              Valid for 7 days
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {order.downloads.map((item, idx) => (
              <div
                key={idx}
                id={`download-card-${item.product_id}`}
                className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5 hover:border-emerald-700/30 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-14 rounded-lg bg-stone-900 text-stone-100 flex items-center justify-center shrink-0 shadow-xs">
                    <FileText className="w-6 h-6 text-amber-400" />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-emerald-800 font-bold uppercase">
                      {item.product_id}
                    </span>
                    <h3 className="font-serif text-base font-bold text-stone-900 leading-snug">
                      {item.product_name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500">
                      <span>Format: High-Res Digital PDF</span>
                      <span>•</span>
                      <span className="font-mono text-[11px]">Token: {item.token.slice(0, 12)}...</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2.5 sm:shrink-0">
                  {onOpenReader && (
                    <button
                      id={`btn-read-${item.product_id}`}
                      onClick={() => onOpenReader(item.product_id, item.token)}
                      className="px-3.5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                      title="Read book directly in browser"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Read Online</span>
                    </button>
                  )}

                  <button
                    id={`btn-download-${item.product_id}`}
                    onClick={() => handleDownload(item.token, item.product_name)}
                    disabled={downloadingToken === item.token}
                    className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:bg-stone-500 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>
                      {downloadingToken === item.token ? 'Generating PDF...' : 'Download PDF'}
                    </span>
                  </button>

                  <button
                    id={`btn-copy-${item.product_id}`}
                    onClick={() => handleCopyLink(item.token)}
                    className="px-3 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
                    title="Copy permanent secure link"
                  >
                    {copiedToken === item.token ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-stone-500" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Support & Instructions */}
      <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-600 space-y-2">
        <h4 className="font-bold text-stone-900">How to open and save your guides:</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>The downloaded PDF files can be opened in Apple Books, Adobe Acrobat, Google Drive, Kindle, or any modern web browser.</li>
          <li>For iPad/tablet users: open in Safari and tap "Save to Books" for seamless offline study.</li>
          <li>If you ever lose access to this browser tab, use the "Find My Order" feature in the top navigation using your email.</li>
        </ul>
      </div>

      <div className="pt-4 text-center">
        <button
          id="btn-return-shop"
          onClick={onBrowseMore}
          className="inline-flex items-center gap-2 text-xs font-bold text-stone-800 hover:text-stone-950 uppercase tracking-wider underline"
        >
          <span>Return to Homepage & Shop</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
