import React, { useState, useEffect } from 'react';
import { 
  X, 
  Search, 
  FileText, 
  Download, 
  Check, 
  AlertCircle, 
  ArrowRight, 
  Loader2, 
  Clock, 
  Lock, 
  CheckCircle2, 
  BookOpen, 
  RefreshCw 
} from 'lucide-react';
import { Order } from '../types';

interface OrderLookupModalProps {
  onClose: () => void;
  onSelectOrder?: (order: Order) => void;
  onOpenReader?: (productId: string, token?: string) => void;
  initialQuery?: string;
}

export const OrderLookupModal: React.FC<OrderLookupModalProps> = ({ 
  onClose, 
  onSelectOrder, 
  onOpenReader,
  initialQuery = '' 
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Order[] | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchOrders = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const isEmail = searchTerm.includes('@');
      let orders: Order[] = [];

      if (isEmail) {
        const res = await fetch(`/api/orders/lookup?email=${encodeURIComponent(searchTerm.trim())}`);
        const data = await res.json();
        orders = data.orders || [];
      } else {
        const res = await fetch(`/api/orders/${encodeURIComponent(searchTerm.trim())}`);
        if (res.ok) {
          const data = await res.json();
          orders = data.order ? [data.order] : [];
        }
      }

      setHasSearched(true);
      if (orders.length === 0) {
        setErrorMsg(`No purchases found matching "${searchTerm}". Please verify your email or order number.`);
        setResults([]);
      } else {
        setResults(orders);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Lookup failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery.trim()) {
      fetchOrders(initialQuery.trim());
    }
  }, [initialQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders(query);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white border border-stone-200 shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-200 bg-stone-50/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-stone-900 text-amber-400 flex items-center justify-center shadow-xs">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500 block">
                Customer Portal
              </span>
              <h2 className="font-serif text-lg font-bold text-stone-900">
                My Purchases & Digital Downloads
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 sm:p-7 space-y-5 overflow-y-auto flex-1">
          <p className="text-xs text-stone-600 leading-relaxed">
            Enter the email address or order number you submitted at checkout to view your payment confirmation status and download your eBooks.
          </p>

          <form onSubmit={handleSearch} className="space-y-3">
            <div className="flex gap-2">
              <input
                id="input-lookup-query"
                type="text"
                required
                placeholder="Enter your email or order number (e.g. you@example.com)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-stone-900 focus:border-stone-900 bg-white"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:bg-stone-400 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                <span>Find Purchases</span>
              </button>
            </div>
          </form>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-xs text-rose-800 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Results list */}
          {results && results.length > 0 && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <span className="text-xs font-bold text-stone-800">
                  Purchases Found ({results.length})
                </span>
                <button
                  type="button"
                  onClick={() => fetchOrders(query)}
                  disabled={loading}
                  className="text-[11px] text-stone-500 hover:text-stone-900 flex items-center gap-1"
                  title="Check if pending order has been approved"
                >
                  <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh Status</span>
                </button>
              </div>

              <div className="space-y-4">
                {results.map((ord) => {
                  const isApproved = ord.payment_status === 'APPROVED' || ord.payment_status === 'PAID';
                  const isPending = ord.payment_status === 'PENDING';
                  const isRejected = ord.payment_status === 'REJECTED';

                  return (
                    <div
                      key={ord.id}
                      className="p-5 rounded-2xl border border-stone-200 bg-stone-50/80 space-y-4 shadow-xs"
                    >
                      {/* Top Order Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200/80 pb-3">
                        <div>
                          <span className="font-mono text-xs font-bold text-stone-900 block">
                            {ord.order_number}
                          </span>
                          <span className="text-[10px] text-stone-400">
                            Placed on {new Date(ord.created_at).toLocaleDateString()} at {new Date(ord.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div>
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
                            isApproved
                              ? 'bg-emerald-100 text-emerald-900'
                              : isPending
                              ? 'bg-amber-100 text-amber-900 animate-pulse'
                              : isRejected
                              ? 'bg-rose-100 text-rose-900'
                              : 'bg-stone-200 text-stone-800'
                          }`}>
                            {isApproved ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                            ) : isPending ? (
                              <Clock className="w-3.5 h-3.5 text-amber-700" />
                            ) : (
                              <AlertCircle className="w-3.5 h-3.5 text-rose-700" />
                            )}
                            <span>{ord.payment_status}</span>
                          </span>
                        </div>
                      </div>

                      {/* Details & Status Message */}
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between text-stone-800 font-semibold">
                          <span>{ord.items[0]?.product_name || 'Nutrition Guide'}</span>
                          <span className="font-serif font-bold text-stone-900">
                            {ord.currency === 'NGN' ? '₦' : '$'}{ord.total_amount?.toLocaleString()} {ord.currency}
                          </span>
                        </div>

                        {ord.payment_provider && (
                          <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
                            <span className="font-semibold text-stone-700">Payment Method:</span>
                            <span className="px-2 py-0.5 rounded-md bg-stone-100 font-medium text-stone-800 border border-stone-200">
                              {ord.payment_provider}
                            </span>
                          </div>
                        )}

                        {/* Status Explanation Box */}
                        {isPending && (
                          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs space-y-1">
                            <div className="font-bold flex items-center gap-1.5 text-amber-900">
                              <Clock className="w-4 h-4 text-amber-700" />
                              <span>Payment Verification Pending</span>
                            </div>
                            <p className="text-[11px] text-amber-900/90 leading-relaxed">
                              Our administration team is currently verifying your payment reference (<code>{ord.payment_reference}</code>). As soon as verified, your PDF download link will unlock right here and will be emailed to <strong>{ord.customer_email}</strong>.
                            </p>
                          </div>
                        )}

                        {isRejected && (
                          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 text-xs space-y-1">
                            <div className="font-bold flex items-center gap-1.5 text-rose-900">
                              <AlertCircle className="w-4 h-4 text-rose-700" />
                              <span>Payment Could Not Be Verified</span>
                            </div>
                            <p className="text-[11px] text-rose-900/90 leading-relaxed">
                              {ord.rejection_reason ? ord.rejection_reason : 'The provided transaction reference could not be matched with bank statements.'}
                            </p>
                          </div>
                        )}

                        {isApproved && (
                          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs space-y-1">
                            <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                              <span>Payment Confirmed & Verified!</span>
                            </div>
                            <p className="text-[11px] text-emerald-900/90 leading-relaxed">
                              Your purchase is confirmed. You can download your official PDF guide below or read it directly in our clean interactive reader.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Download & Action Buttons */}
                      <div className="pt-2 border-t border-stone-200/80 flex flex-wrap items-center justify-between gap-2">
                        {isApproved && ord.downloads && ord.downloads.length > 0 ? (
                          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                            {ord.downloads.map((dt) => (
                              <a
                                key={dt.token}
                                href={`/api/download/${dt.token}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Download PDF ({dt.download_count}/{dt.max_downloads})</span>
                              </a>
                            ))}

                            {onOpenReader && ord.items[0]?.product_id && (
                              <button
                                type="button"
                                onClick={() => {
                                  onClose();
                                  onOpenReader(ord.items[0].product_id, ord.downloads[0]?.token);
                                }}
                                className="px-3.5 py-2 rounded-xl border border-stone-300 hover:bg-stone-200 text-stone-800 font-semibold text-xs transition-colors flex items-center gap-1.5"
                              >
                                <BookOpen className="w-3.5 h-3.5 text-stone-600" />
                                <span>Read Online</span>
                              </button>
                            )}
                          </div>
                        ) : isPending ? (
                          <button
                            type="button"
                            disabled
                            className="px-4 py-2 rounded-xl bg-stone-200 text-stone-400 font-semibold text-xs flex items-center gap-1.5 cursor-not-allowed"
                            title="Download unlocks upon admin confirmation"
                          >
                            <Lock className="w-3.5 h-3.5" />
                            <span>Download Locked (Pending Review)</span>
                          </button>
                        ) : null}

                        {onSelectOrder && (
                          <button
                            type="button"
                            onClick={() => {
                              onSelectOrder(ord);
                              onClose();
                            }}
                            className="text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1 ml-auto"
                          >
                            <span>Full Order Details</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
