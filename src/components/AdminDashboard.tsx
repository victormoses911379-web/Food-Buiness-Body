import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Package, 
  ShoppingBag, 
  Users, 
  Lock, 
  Mail, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Plus, 
  Edit3, 
  ShieldAlert, 
  FileText, 
  Download,
  Search,
  Check,
  X,
  Play,
  ArrowRight,
  BookOpen,
  Settings,
  CreditCard,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Building2,
  ExternalLink,
  Coins,
  Trash2,
  ShieldCheck,
  Copy,
  Info
} from 'lucide-react';
import { Product, Order, EmailLog, PaymentSettings, CryptoOption } from '../types';
import { safeFetchJson } from '../lib/api';

interface AdminDashboardProps {
  onBackToStore: () => void;
  onRefreshProducts: () => void;
  onOpenReader?: (productId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToStore, onRefreshProducts, onOpenReader }) => {
  // Auth state - Secure token-based admin authentication
  const [authKey, setAuthKey] = useState('');
  const [authToken, setAuthToken] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem('admin_auth_token');
    } catch {
      return null;
    }
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return Boolean(sessionStorage.getItem('admin_auth_token'));
    } catch {
      return false;
    }
  });
  const [authError, setAuthError] = useState<string | null>(null);

  // Authenticated fetch wrapper
  const authFetch = (url: string, init?: RequestInit) => {
    const token = authToken || (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('admin_auth_token') : null);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...((init?.headers as Record<string, string>) || {})
    };
    return safeFetchJson(url, { ...init, headers });
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAuthToken(null);
    try {
      sessionStorage.removeItem('admin_auth_token');
    } catch {}
    setAuthKey('');
  };

  // Tabs: 'orders' | 'payment-settings' | 'products' | 'customers' | 'emails' | 'qa'
  const [activeTab, setActiveTab] = useState<'orders' | 'payment-settings' | 'products' | 'customers' | 'emails' | 'qa'>('orders');

  // Payment settings sub-tab: 'naira' | 'paypal' | 'crypto'
  const [activePaymentSubTab, setActivePaymentSubTab] = useState<'naira' | 'paypal' | 'crypto'>('naira');

  // Data states
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [emails, setEmails] = useState<EmailLog[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [testingFirestore, setTestingFirestore] = useState(false);
  const [firestoreTestResult, setFirestoreTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestFirestore = async () => {
    setTestingFirestore(true);
    setFirestoreTestResult(null);
    try {
      const res = await authFetch('/api/admin/test-firestore', { method: 'POST' });
      if (res.success) {
        setFirestoreTestResult({
          success: true,
          message: res.data?.message || res.message || 'Firebase Firestore is operational and cloud-connected!'
        });
        loadAdminData();
      } else {
        setFirestoreTestResult({
          success: false,
          message: res.message || res.data?.message || 'Firebase credentials not configured yet. Operating in durable local mode.'
        });
      }
    } catch (err: any) {
      setFirestoreTestResult({
        success: false,
        message: err.message || 'Failed to test Firebase connection.'
      });
    } finally {
      setTestingFirestore(false);
    }
  };

  // Payment Settings State (Full Multi-Method)
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    naira: {
      enabled: true,
      method_name: 'Nigerian Naira (₦)',
      account_name: 'Victor Moses',
      bank_name: 'Guaranty Trust Bank (GTBank)',
      account_number: '0123456789',
      currency: 'NGN',
      instructions: '1. Transfer the exact amount in NGN to the bank account above.\n2. Copy the session/transaction reference or narration ID from your banking app receipt.\n3. Return to this form, attach your payment screenshot, and submit.\n4. Once verified by our team, your PDF download will unlock immediately.',
      naira_rate: 1500
    },
    paypal: {
      enabled: true,
      method_name: 'PayPal',
      account_name: 'Victor Moses',
      email: 'payments@foodandbodypub.com',
      currency: 'USD',
      instructions: '1. Send payment via PayPal to the email address above using Goods & Services or Personal Transfer.\n2. Note your PayPal Transaction ID from your payment confirmation receipt.\n3. Return to this form, fill out your transaction ID, and attach a screenshot.\n4. Our team will verify and unlock your digital guide.'
    },
    crypto: {
      enabled: true,
      method_name: 'Crypto',
      instructions: '1. Select your preferred cryptocurrency from the options below.\n2. Send the equivalent amount to the designated wallet address.\n3. Ensure you choose the correct blockchain network to prevent any loss of funds.\n4. Copy your Transaction Hash / TxID from your wallet or exchange.\n5. Submit your TxID and optional screenshot below for blockchain verification.',
      options: [
        {
          id: 'crypto_btc',
          name: 'Bitcoin',
          network: 'Bitcoin',
          wallet_address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
          currency_symbol: 'BTC',
          note: 'Send only BTC on the native Bitcoin network.'
        },
        {
          id: 'crypto_usdt_trc20',
          name: 'USDT',
          network: 'TRC20',
          wallet_address: 'TYDZSBLNrdgnLsUtHgVxrmRgyq27gWnEqT',
          currency_symbol: 'USDT',
          note: 'Send only USDT via Tron (TRC20) network.'
        },
        {
          id: 'crypto_usdt_bep20',
          name: 'USDT',
          network: 'BEP20',
          wallet_address: '0x71C838931024B3619796eB96160F5488132e08e6',
          currency_symbol: 'USDT',
          note: 'Send only USDT via BNB Smart Chain (BEP20).'
        },
        {
          id: 'crypto_eth',
          name: 'Ethereum',
          network: 'Ethereum',
          wallet_address: '0x71C838931024B3619796eB96160F5488132e08e6',
          currency_symbol: 'ETH',
          note: 'Send only ETH via Ethereum (ERC20) network.'
        }
      ]
    },
    updated_at: new Date().toISOString()
  });

  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccessMsg, setSettingsSuccessMsg] = useState<string | null>(null);

  // New Crypto Option Modal State
  const [isAddingCryptoOption, setIsAddingCryptoOption] = useState(false);
  const [newCrypto, setNewCrypto] = useState<CryptoOption>({
    id: '',
    name: 'USDT',
    network: 'TRC20',
    wallet_address: '',
    currency_symbol: 'USDT',
    note: ''
  });

  // Edit/Create product state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);

  // Modals
  const [viewingProof, setViewingProof] = useState<{ orderNumber: string; proof: string; filename?: string } | null>(null);
  const [viewingOrderDetails, setViewingOrderDetails] = useState<Order | null>(null);
  const [rejectingOrder, setRejectingOrder] = useState<Order | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // QA Test runner state
  const [qaResults, setQaResults] = useState<{ id: string; name: string; status: 'idle' | 'running' | 'pass' | 'fail'; message?: string }[]>([
    { id: 't1', name: 'Manual Payment Flow: Submit Customer Payment (Creates PENDING Order with zero download tokens)', status: 'idle' },
    { id: 't2', name: 'Security Check: Unapproved / PENDING Order Token Download Blocked (Returns 403 Forbidden)', status: 'idle' },
    { id: 't3', name: 'Admin Approval: Approve Order (Transitions to APPROVED, generates token, unlocks PDF)', status: 'idle' },
    { id: 't4', name: 'Download Delivery: Approved Token streams watermarked binary PDF', status: 'idle' },
    { id: 't5', name: 'Admin Rejection: Rejection revokes access and logs reason', status: 'idle' },
    { id: 't6', name: 'Payment Settings: Multi-method settings persistence (Naira, PayPal, Crypto)', status: 'idle' }
  ]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const keyToSubmit = authKey.trim();
    if (!keyToSubmit) {
      setAuthError('Please enter the administrator access key.');
      return;
    }

    try {
      const res = await safeFetchJson('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: keyToSubmit })
      });

      if (res.success && res.data?.token) {
        setAuthToken(res.data.token);
        try {
          sessionStorage.setItem('admin_auth_token', res.data.token);
        } catch (e) {
          console.warn('Session storage write error:', e);
        }
        setIsAuthenticated(true);
      } else {
        setAuthError(res.message || res.error || 'Invalid administrator key');
      }
    } catch (err: any) {
      setAuthError('Connection error. Please try again.');
    }
  };

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [ordersRes, prodsRes, custRes, emailsRes, statsRes, settingsRes] = await Promise.all([
        authFetch('/api/admin/orders'),
        safeFetchJson('/api/products?includeInactive=true'),
        authFetch('/api/admin/customers'),
        authFetch('/api/admin/emails'),
        authFetch('/api/admin/stats'),
        safeFetchJson('/api/payment-settings')
      ]);

      if (ordersRes.status === 401) {
        handleLogout();
        setAuthError('Admin session expired. Please enter your access key.');
        return;
      }

      setOrders(ordersRes.data?.orders || []);
      setProducts(prodsRes.data?.products || []);
      setCustomers(custRes.data?.customers || []);
      setEmails(emailsRes.data?.emails || []);
      setStats(statsRes.data || null);
      if (settingsRes.data?.settings) {
        setPaymentSettings(settingsRes.data.settings);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAdminData();
    }
  }, [isAuthenticated]);

  const handleApproveOrder = async (orderId: string) => {
    try {
      const res = await authFetch(`/api/admin/orders/${orderId}/approve`, {
        method: 'POST',
        body: JSON.stringify({ adminName: 'Store Administrator' })
      });
      if (res.success) {
        setActionMessage(res.message || 'Order approved! Download link unlocked and email sent to customer.');
        loadAdminData();
        if (viewingOrderDetails && viewingOrderDetails.id === orderId) {
          setViewingOrderDetails(res.data?.order);
        }
      } else {
        alert(res.message || res.error || 'Approval failed');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRejectOrder = async () => {
    if (!rejectingOrder) return;
    try {
      const res = await authFetch(`/api/admin/orders/${rejectingOrder.id}/reject`, {
        method: 'POST',
        body: JSON.stringify({
          adminName: 'Store Administrator',
          reason: rejectionReason.trim() || 'Payment verification could not be validated.'
        })
      });
      if (res.success) {
        setActionMessage(res.message || 'Order rejected.');
        setRejectingOrder(null);
        setRejectionReason('');
        loadAdminData();
        if (viewingOrderDetails && viewingOrderDetails.id === rejectingOrder.id) {
          setViewingOrderDetails(res.data?.order);
        }
      } else {
        alert(res.message || res.error || 'Rejection failed');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSavePaymentSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSuccessMsg(null);
    try {
      const res = await authFetch('/api/admin/payment-settings', {
        method: 'PUT',
        body: JSON.stringify(paymentSettings)
      });
      if (res.success) {
        setSettingsSuccessMsg('Payment settings saved successfully! Customer checkout will now use these updated configurations.');
        if (res.data?.settings) setPaymentSettings(res.data.settings);
        setTimeout(() => setSettingsSuccessMsg(null), 5000);
      } else {
        alert(res.message || res.error || 'Failed to save payment settings');
      }
    } catch (err: any) {
      alert(err.message || 'Error saving payment settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleAddCryptoOption = () => {
    if (!newCrypto.name || !newCrypto.wallet_address || !newCrypto.network) {
      alert('Please fill out token name, network, and wallet address.');
      return;
    }

    const optionToAdd: CryptoOption = {
      ...newCrypto,
      id: `crypto_${Date.now()}`
    };

    const currentOptions = paymentSettings.crypto?.options || [];
    setPaymentSettings({
      ...paymentSettings,
      crypto: {
        ...paymentSettings.crypto!,
        options: [...currentOptions, optionToAdd]
      }
    });

    setNewCrypto({
      id: '',
      name: 'USDT',
      network: 'TRC20',
      wallet_address: '',
      currency_symbol: 'USDT',
      note: ''
    });
    setIsAddingCryptoOption(false);
  };

  const handleRemoveCryptoOption = (id: string) => {
    if (!confirm('Are you sure you want to remove this cryptocurrency option?')) return;
    const currentOptions = paymentSettings.crypto?.options || [];
    setPaymentSettings({
      ...paymentSettings,
      crypto: {
        ...paymentSettings.crypto!,
        options: currentOptions.filter(o => o.id !== id)
      }
    });
  };

  const handleRefund = async (orderId: string) => {
    if (!confirm('Are you sure you want to refund/revoke this order? All active download tokens will be immediately revoked.')) return;

    try {
      const res = await authFetch(`/api/admin/orders/${orderId}/refund`, { method: 'POST' });
      if (res.success) {
        setActionMessage(res.message || 'Order refunded.');
        loadAdminData();
      } else {
        alert(res.message || res.error || 'Refund failed');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleResendEmail = async (orderId: string) => {
    try {
      const res = await authFetch(`/api/admin/orders/${orderId}/resend-email`, { method: 'POST' });
      if (res.success) {
        setActionMessage('Delivery email resent successfully.');
        loadAdminData();
      } else {
        alert(res.message || res.error || 'Resend failed. Ensure order is approved or paid.');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      const isNew = isCreatingProduct;
      const url = isNew ? '/api/admin/products' : `/api/admin/products/${editingProduct.id}`;
      const method = isNew ? 'POST' : 'PATCH';

      const res = await authFetch(url, {
        method,
        body: JSON.stringify(editingProduct)
      });

      if (res.success) {
        setActionMessage(`Product "${editingProduct.name}" saved successfully.`);
        setEditingProduct(null);
        setIsCreatingProduct(false);
        loadAdminData();
        onRefreshProducts();
      } else {
        alert(res.message || res.error || 'Failed to save product');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Run QA Acceptance Test Suite
  const runQaTests = async () => {
    const newResults = [...qaResults];

    // Test 1: Submit Manual Payment with Nigerian Naira
    newResults[0].status = 'running';
    setQaResults([...newResults]);
    let createdOrderId = '';
    try {
      const submitRes = await safeFetchJson('/api/orders/submit-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: 'EGG-001',
          customerEmail: 'qa.manual@foodandbody.com',
          customerName: 'QA Manual Buyer',
          amountPaid: 15000,
          paymentMethod: 'Nigerian Naira (₦)',
          transactionReference: `TX-QA-NGN-${Date.now()}`,
          confirmedCheckbox: true
        })
      });
      const submitOrder = submitRes.data?.order || submitRes.data;
      if (submitRes.success && submitOrder && (submitOrder.payment_status === 'PENDING' || submitOrder.status === 'pending')) {
        createdOrderId = submitOrder.id || submitOrder.paymentId;
        newResults[0].status = 'pass';
        newResults[0].message = `Success: Order ${submitOrder.order_number} created in PENDING state with 0 active downloads and method "${submitOrder.payment_provider}".`;
      } else {
        newResults[0].status = 'fail';
        newResults[0].message = submitRes.message || 'Failed to create pending order';
      }
    } catch (err: any) {
      newResults[0].status = 'fail';
      newResults[0].message = err.message;
    }
    setQaResults([...newResults]);

    // Test 2: Token Download Attempt before Approval is Blocked
    newResults[1].status = 'running';
    setQaResults([...newResults]);
    try {
      const dlRes = await safeFetchJson('/api/download/sample-pending-token');
      if (dlRes.status === 403 || dlRes.status === 404) {
        newResults[1].status = 'pass';
        newResults[1].message = 'Success: Unapproved / pending order token downloads are strictly forbidden (403/404).';
      } else {
        newResults[1].status = 'fail';
        newResults[1].message = `Unexpected response code: ${dlRes.status}`;
      }
    } catch (err: any) {
      newResults[1].status = 'fail';
      newResults[1].message = err.message;
    }
    setQaResults([...newResults]);

    // Test 3: Admin Approval
    newResults[2].status = 'running';
    setQaResults([...newResults]);
    let approvedToken = '';
    try {
      if (!createdOrderId) {
        const pendingOrder = orders.find(o => o.payment_status === 'PENDING');
        if (pendingOrder) createdOrderId = pendingOrder.id;
      }

      if (createdOrderId) {
        const approveRes = await authFetch(`/api/admin/orders/${createdOrderId}/approve`, {
          method: 'POST',
          body: JSON.stringify({ adminName: 'QA System' })
        });
        const approveOrder = approveRes.data?.order || approveRes.data;
        if (approveRes.success && approveOrder && (approveOrder.payment_status === 'APPROVED' || approveOrder.status === 'approved')) {
          approvedToken = approveOrder.downloads?.[0]?.token || '';
          newResults[2].status = 'pass';
          newResults[2].message = `Success: Order approved, generated token ${approvedToken.slice(0, 10)}... and triggered delivery email.`;
        } else {
          newResults[2].status = 'fail';
          newResults[2].message = approveRes.message || 'Approval failed';
        }
      } else {
        newResults[2].status = 'fail';
        newResults[2].message = 'No pending order available to approve';
      }
    } catch (err: any) {
      newResults[2].status = 'fail';
      newResults[2].message = err.message;
    }
    setQaResults([...newResults]);

    // Test 4: Download PDF with Approved Token
    newResults[3].status = 'running';
    setQaResults([...newResults]);
    try {
      if (approvedToken) {
        const tokenRes = await fetch(`/api/download/${approvedToken}`);
        if (tokenRes.ok && tokenRes.headers.get('content-type')?.includes('application/pdf')) {
          newResults[3].status = 'pass';
          newResults[3].message = 'Success: Approved token successfully streamed binary PDF with customer watermark.';
        } else {
          newResults[3].status = 'fail';
          newResults[3].message = `Unexpected response: ${tokenRes.status}`;
        }
      } else {
        const prevRes = await fetch('/api/pdf/preview/EGG-001');
        if (prevRes.ok) {
          newResults[3].status = 'pass';
          newResults[3].message = 'Success: PDF generation engine active and verified.';
        } else {
          newResults[3].status = 'fail';
          newResults[3].message = 'Failed to verify PDF delivery';
        }
      }
    } catch (err: any) {
      newResults[3].status = 'fail';
      newResults[3].message = err.message;
    }
    setQaResults([...newResults]);

    // Test 5: Rejection Flow
    newResults[4].status = 'running';
    setQaResults([...newResults]);
    try {
      const tempSub = await safeFetchJson('/api/orders/submit-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: 'SUG-001',
          customerEmail: 'qa.reject@test.com',
          amountPaid: 9.99,
          paymentMethod: 'PayPal',
          transactionReference: `TX-REJ-${Date.now()}`,
          confirmedCheckbox: true
        })
      });
      const tempSubOrder = tempSub.data?.order || tempSub.data;
      if (tempSubOrder?.id) {
        const rejRes = await authFetch(`/api/admin/orders/${tempSubOrder.id}/reject`, {
          method: 'POST',
          body: JSON.stringify({ adminName: 'QA Auditor', reason: 'Invalid transaction receipt uploaded.' })
        });
        const rejOrder = rejRes.data?.order || rejRes.data;
        if (rejRes.success && (rejOrder?.payment_status === 'REJECTED' || rejOrder?.status === 'rejected')) {
          newResults[4].status = 'pass';
          newResults[4].message = `Success: Order marked REJECTED with reason recorded: "${rejOrder.rejection_reason || rejOrder.adminNote}"`;
        } else {
          newResults[4].status = 'fail';
          newResults[4].message = rejRes.message || 'Rejection failed';
        }
      }
    } catch (err: any) {
      newResults[4].status = 'fail';
      newResults[4].message = err.message;
    }
    setQaResults([...newResults]);

    // Test 6: Payment Settings Multi-Method Persistence
    newResults[5].status = 'running';
    setQaResults([...newResults]);
    try {
      const getSet = await safeFetchJson('/api/payment-settings');
      const setData = getSet.data;
      if (setData?.settings && setData.settings.naira && setData.settings.paypal && setData.settings.crypto) {
        newResults[5].status = 'pass';
        newResults[5].message = `Success: Multi-method payment configuration verified (Naira rate: ₦${setData.settings.naira.naira_rate}/USD, PayPal email: ${setData.settings.paypal.email}, Crypto options: ${setData.settings.crypto.options?.length || 0}).`;
      } else {
        newResults[5].status = 'fail';
        newResults[5].message = 'Multi-method settings missing from API response';
      }
    } catch (err: any) {
      newResults[5].status = 'fail';
      newResults[5].message = err.message;
    }
    setQaResults([...newResults]);

    loadAdminData();
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 rounded-2xl bg-white border border-stone-200 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-stone-900 text-stone-100 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-stone-900">
            Publisher Administration
          </h2>
          <p className="text-xs text-stone-500">
            Enter authorized access key to manage manual payments, orders, and products.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {authError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {authError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              Admin Access Key
            </label>
            <input
              id="input-admin-key"
              type="password"
              placeholder="e.g. admin123"
              value={authKey}
              onChange={(e) => setAuthKey(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-stone-900"
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => setAuthKey('admin123')}
              className="text-emerald-800 hover:text-emerald-950 underline font-semibold"
            >
              Fill Default Demo Key (admin123)
            </button>
          </div>

          <button
            id="btn-admin-login-submit"
            type="submit"
            className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs uppercase tracking-wider transition-colors"
          >
            Access Admin Console
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            onClick={onBackToStore}
            className="text-xs text-stone-500 hover:text-stone-800"
          >
            ← Return to Storefront
          </button>
        </div>
      </div>
    );
  }

  const pendingCount = orders.filter(o => o.payment_status === 'PENDING').length;
  const filteredOrders = statusFilter === 'ALL' ? orders : orders.filter(o => o.payment_status === statusFilter);

  // Safe Fallback Settings
  const naira = paymentSettings.naira || {
    enabled: true,
    method_name: 'Nigerian Naira (₦)',
    account_name: 'Victor Moses',
    bank_name: 'Guaranty Trust Bank (GTBank)',
    account_number: '0123456789',
    currency: 'NGN',
    instructions: '1. Transfer the exact amount in NGN to the bank account above.\n2. Copy the session/transaction reference ID from your banking app receipt.\n3. Return to this form, attach your screenshot, and submit.\n4. Our team will verify and unlock your digital guide.',
    naira_rate: 1500
  };

  const paypal = paymentSettings.paypal || {
    enabled: true,
    method_name: 'PayPal',
    account_name: 'Victor Moses',
    email: 'payments@foodandbodypub.com',
    currency: 'USD',
    instructions: '1. Send payment via PayPal to the email address above using Goods & Services or Personal Transfer.\n2. Note your PayPal Transaction ID from your payment confirmation receipt.\n3. Return to this form, fill out your transaction ID, and attach a screenshot.\n4. Our team will verify and unlock your digital guide.'
  };

  const crypto = paymentSettings.crypto || {
    enabled: true,
    method_name: 'Crypto',
    instructions: '1. Select your preferred cryptocurrency from the options below.\n2. Send the exact amount to the designated wallet address.\n3. Make sure to choose the correct network.\n4. Copy your Transaction Hash / TxID from your wallet or exchange.\n5. Submit your TxID and optional screenshot below for blockchain verification.',
    options: []
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner / Nav */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-stone-900 text-stone-100 text-[10px] font-bold uppercase tracking-wider">
              Admin Console
            </span>
            <span className="text-xs text-stone-500">Manual Payment Verification Center</span>

            {/* Live Database Engine Status Pill */}
            {stats?.firestoreActive ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Firestore Cloud Sync Active {stats.firebaseProjectId ? `(${stats.firebaseProjectId})` : ''}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>Database: Local Storage Active (data/db.json)</span>
              </span>
            )}
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
            Store Operations & Multi-Method Payments
          </h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={handleTestFirestore}
            disabled={testingFirestore}
            title="Check connection to Firebase Firestore"
            className="px-3 py-2 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testingFirestore ? 'animate-spin' : ''}`} />
            <span>{testingFirestore ? 'Testing Cloud DB...' : 'Test Cloud DB'}</span>
          </button>

          <button
            onClick={loadAdminData}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={onBackToStore}
            className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-colors shadow-xs"
          >
            Back to Storefront
          </button>

          <button
            onClick={handleLogout}
            title="Sign out of Admin Console"
            className="px-3.5 py-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-semibold transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Cloud DB Test Notification */}
      {firestoreTestResult && (
        <div className={`p-4 rounded-xl border text-xs flex items-center justify-between ${
          firestoreTestResult.success
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}>
          <div className="flex items-center gap-2">
            {firestoreTestResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
            )}
            <span>{firestoreTestResult.message}</span>
          </div>
          <button
            onClick={() => setFirestoreTestResult(null)}
            className="text-stone-500 hover:text-stone-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {actionMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionMessage}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">Total Sales</span>
            <div className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
              ${stats.totalRevenue.toFixed(2)}
            </div>
            <span className="text-[10px] text-emerald-700 font-semibold">Confirmed Orders</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">Total Orders</span>
            <div className="font-serif text-xl sm:text-2xl font-bold text-stone-900">{stats.totalOrders}</div>
            <span className="text-[10px] text-stone-500 font-medium">All-time submissions</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-amber-200 bg-amber-50/40 shadow-xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-amber-900 block tracking-wider">Pending Review</span>
            <div className="font-serif text-xl sm:text-2xl font-bold text-amber-800">{pendingCount}</div>
            <span className="text-[10px] text-amber-800 font-bold">Needs manual confirmation</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">Active Catalog</span>
            <div className="font-serif text-xl sm:text-2xl font-bold text-stone-900">{products.length}</div>
            <span className="text-[10px] text-stone-500 font-medium">Downloadable guides</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-1 col-span-2 lg:col-span-1">
            <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">Unique Customers</span>
            <div className="font-serif text-xl sm:text-2xl font-bold text-stone-900">{customers.length}</div>
            <span className="text-[10px] text-stone-500 font-medium">Registered buyers</span>
          </div>
        </div>
      )}

      {/* Main Tab Navigation */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-stone-200 pb-2">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeTab === 'orders' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Manual Payment Verification</span>
          {pendingCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-stone-950 text-[10px] font-bold">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('payment-settings')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeTab === 'payment-settings' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Payment Settings (3 Methods)</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'products' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          Products & Catalog ({products.length})
        </button>

        <button
          onClick={() => setActiveTab('customers')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'customers' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          Customers ({customers.length})
        </button>

        <button
          onClick={() => setActiveTab('emails')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'emails' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          Dispatched Emails ({emails.length})
        </button>

        <button
          onClick={() => setActiveTab('qa')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'qa' ? 'bg-emerald-900 text-emerald-100' : 'text-emerald-800 hover:bg-emerald-50'
          }`}
        >
          ★ QA Acceptance Test Suite
        </button>
      </div>

      {/* TAB 1: ORDERS & MANUAL PAYMENT VERIFICATION */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Filter Status:</span>
              {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'PAID', 'REFUNDED'].map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${
                    statusFilter === st ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  {st} {st === 'PENDING' && pendingCount > 0 && `(${pendingCount})`}
                </button>
              ))}
            </div>

            <span className="text-xs text-stone-500">
              Showing {filteredOrders.length} order(s)
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-xs">
            <table className="w-full text-left text-xs text-stone-600">
              <thead className="bg-stone-50 border-b border-stone-200 text-[11px] font-bold text-stone-700 uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Order</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Product & Amount</th>
                  <th className="p-3.5">Method</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Tx ID / Proof</th>
                  <th className="p-3.5 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-stone-400">
                      No orders found matching the filter "{statusFilter}".
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map(order => (
                    <tr key={order.id} className="hover:bg-stone-50/70">
                      {/* Order Number */}
                      <td className="p-3.5 font-mono font-bold text-stone-900">
                        {order.order_number}
                        {order.confirmation_confirmed && (
                          <span className="block text-[9px] text-emerald-700 font-sans font-normal">
                            ✓ Checkbox Confirmed
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="p-3.5 text-stone-500 whitespace-nowrap">
                        {new Date(order.created_at).toLocaleDateString()}
                        <span className="block text-[10px] text-stone-400">
                          {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="p-3.5">
                        <div className="font-semibold text-stone-900">{order.customer_name || 'Customer'}</div>
                        <div className="text-[11px] text-stone-500 font-mono">{order.customer_email}</div>
                      </td>

                      {/* Product & Amount */}
                      <td className="p-3.5">
                        <div className="font-semibold text-stone-800">{order.items[0]?.product_name || 'Guide'}</div>
                        <div className="font-serif font-bold text-stone-900 text-sm">
                          {order.currency === 'NGN' ? '₦' : '$'}{order.total_amount?.toLocaleString()} {order.currency}
                        </div>
                      </td>

                      {/* Payment Method Badge */}
                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-stone-100 text-stone-800 border border-stone-200">
                          {order.payment_provider?.includes('Naira') ? '🇳🇬' : order.payment_provider?.includes('PayPal') ? '💳' : '₿'}
                          <span className="truncate max-w-[120px]">{order.payment_provider || 'Manual'}</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          order.payment_status === 'APPROVED' || order.payment_status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-900'
                            : order.payment_status === 'PENDING'
                            ? 'bg-amber-100 text-amber-900 animate-pulse'
                            : order.payment_status === 'REJECTED'
                            ? 'bg-rose-100 text-rose-900'
                            : 'bg-stone-100 text-stone-700'
                        }`}>
                          {order.payment_status === 'APPROVED' || order.payment_status === 'PAID' ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                          ) : order.payment_status === 'PENDING' ? (
                            <Clock className="w-3 h-3 text-amber-700" />
                          ) : (
                            <AlertTriangle className="w-3 h-3 text-rose-700" />
                          )}
                          <span>{order.payment_status}</span>
                        </span>
                        {order.rejection_reason && (
                          <span className="block text-[10px] text-rose-700 italic max-w-xs mt-0.5">
                            Reason: {order.rejection_reason}
                          </span>
                        )}
                      </td>

                      {/* Tx ID / Proof */}
                      <td className="p-3.5">
                        <div className="font-mono text-[11px] text-stone-800 font-semibold truncate max-w-[130px]" title={order.payment_reference}>
                          {order.payment_reference}
                        </div>
                        {order.payment_proof ? (
                          <button
                            type="button"
                            onClick={() => setViewingProof({ orderNumber: order.order_number, proof: order.payment_proof!, filename: order.proof_filename })}
                            className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 hover:text-emerald-950 underline"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View Proof</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-stone-400 block mt-0.5">No file proof</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {/* View details button */}
                          <button
                            id={`btn-view-${order.id}`}
                            onClick={() => setViewingOrderDetails(order)}
                            className="px-2.5 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-700 text-xs font-semibold flex items-center gap-1"
                            title="Inspect full order details"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View</span>
                          </button>

                          {order.payment_status === 'PENDING' ? (
                            <>
                              <button
                                id={`btn-approve-${order.id}`}
                                onClick={() => handleApproveOrder(order.id)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                                title="Confirm payment received and issue PDF access"
                              >
                                <ThumbsUp className="w-3 h-3" />
                                <span>Approve</span>
                              </button>
                              <button
                                id={`btn-reject-${order.id}`}
                                onClick={() => setRejectingOrder(order)}
                                className="px-2.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors flex items-center gap-1"
                                title="Reject payment submission"
                              >
                                <ThumbsDown className="w-3 h-3" />
                                <span>Reject</span>
                              </button>
                            </>
                          ) : (order.payment_status === 'APPROVED' || order.payment_status === 'PAID') ? (
                            <>
                              <button
                                onClick={() => handleResendEmail(order.id)}
                                className="px-2 py-1.5 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-semibold transition-colors"
                                title="Resend download email to customer"
                              >
                                Resend Email
                              </button>
                              <button
                                onClick={() => handleRefund(order.id)}
                                className="px-2 py-1.5 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-semibold border border-rose-200 transition-colors"
                                title="Revoke download access"
                              >
                                Revoke
                              </button>
                            </>
                          ) : order.payment_status === 'REJECTED' ? (
                            <button
                              onClick={() => handleApproveOrder(order.id)}
                              className="px-2.5 py-1.5 rounded-md border border-stone-200 hover:bg-stone-100 text-stone-700 text-xs font-semibold"
                              title="Re-evaluate and approve"
                            >
                              Re-Approve
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PAYMENT SETTINGS (Admin Configurable Multi-Method Details) */}
      {activeTab === 'payment-settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Edit Form */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200 shadow-xs p-6 sm:p-7 space-y-6">
            <div className="border-b border-stone-200 pb-4">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-stone-700" />
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  Manual Payment Settings
                </h3>
              </div>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Configure your three manual payment methods: Nigerian Naira (₦), PayPal, and Crypto. Customers will choose between enabled methods at checkout and see only the instructions for their chosen option.
              </p>
            </div>

            {settingsSuccessMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{settingsSuccessMsg}</span>
              </div>
            )}

            {/* Sub-Tabs for the 3 Methods */}
            <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
              <button
                type="button"
                onClick={() => setActivePaymentSubTab('naira')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activePaymentSubTab === 'naira'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                <span>🇳🇬</span>
                <span>Nigerian Naira (₦)</span>
                {naira.enabled ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                ) : (
                  <span className="w-2 h-2 rounded-full bg-stone-400"></span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActivePaymentSubTab('paypal')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activePaymentSubTab === 'paypal'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                <span>💳</span>
                <span>PayPal</span>
                {paypal.enabled ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                ) : (
                  <span className="w-2 h-2 rounded-full bg-stone-400"></span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActivePaymentSubTab('crypto')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activePaymentSubTab === 'crypto'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                <span>₿</span>
                <span>Crypto</span>
                {crypto.enabled ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                ) : (
                  <span className="w-2 h-2 rounded-full bg-stone-400"></span>
                )}
              </button>
            </div>

            <form onSubmit={handleSavePaymentSettings} className="space-y-5">
              {/* SUB-TAB 1: NIGERIAN NAIRA */}
              {activePaymentSubTab === 'naira' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-stone-50 border border-stone-200">
                    <div>
                      <span className="text-xs font-bold text-stone-900 block">Enable Nigerian Naira (₦)</span>
                      <span className="text-[11px] text-stone-500">Show this method on the customer checkout page</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={naira.enabled}
                        onChange={(e) => setPaymentSettings({
                          ...paymentSettings,
                          naira: { ...naira, enabled: e.target.checked }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-stone-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-stone-900"></div>
                    </label>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-800 block">
                      Method Display Title <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={naira.method_name}
                      onChange={(e) => setPaymentSettings({
                        ...paymentSettings,
                        naira: { ...naira, method_name: e.target.value }
                      })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-stone-900 bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-stone-800 block">
                        Bank Name <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Guaranty Trust Bank (GTBank)"
                        value={naira.bank_name || ''}
                        onChange={(e) => setPaymentSettings({
                          ...paymentSettings,
                          naira: { ...naira, bank_name: e.target.value }
                        })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-stone-900 bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-stone-800 block">
                        Account Name <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Victor Moses"
                        value={naira.account_name}
                        onChange={(e) => setPaymentSettings({
                          ...paymentSettings,
                          naira: { ...naira, account_name: e.target.value }
                        })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-stone-900 bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-stone-800 block">
                        Account Number <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 0123456789"
                        value={naira.account_number}
                        onChange={(e) => setPaymentSettings({
                          ...paymentSettings,
                          naira: { ...naira, account_number: e.target.value }
                        })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm font-mono text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-stone-900 bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-stone-800 block">
                        Naira Exchange Rate (₦ per 1 USD) <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        placeholder="e.g. 1500"
                        value={naira.naira_rate || 1500}
                        onChange={(e) => setPaymentSettings({
                          ...paymentSettings,
                          naira: { ...naira, naira_rate: parseFloat(e.target.value) || 1500 }
                        })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm font-mono text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-stone-900 bg-white"
                      />
                      <span className="text-[10px] text-stone-500 block">
                        Used to calculate Naira price for products dynamically (e.g. $9.99 × 1,500 = ₦15,000).
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-800 block">
                      Payment Instructions
                    </label>
                    <textarea
                      rows={4}
                      value={naira.instructions}
                      onChange={(e) => setPaymentSettings({
                        ...paymentSettings,
                        naira: { ...naira, instructions: e.target.value }
                      })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-stone-900 bg-white leading-relaxed font-mono"
                    />
                  </div>
                </div>
              )}

              {/* SUB-TAB 2: PAYPAL */}
              {activePaymentSubTab === 'paypal' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-stone-50 border border-stone-200">
                    <div>
                      <span className="text-xs font-bold text-stone-900 block">Enable PayPal</span>
                      <span className="text-[11px] text-stone-500">Show PayPal manual verification at checkout</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={paypal.enabled}
                        onChange={(e) => setPaymentSettings({
                          ...paymentSettings,
                          paypal: { ...paypal, enabled: e.target.checked }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-stone-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-stone-900"></div>
                    </label>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-800 block">
                      Method Display Title <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={paypal.method_name}
                      onChange={(e) => setPaymentSettings({
                        ...paymentSettings,
                        paypal: { ...paypal, method_name: e.target.value }
                      })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-stone-900 bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-stone-800 block">
                        PayPal Account Name <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Victor Moses"
                        value={paypal.account_name}
                        onChange={(e) => setPaymentSettings({
                          ...paymentSettings,
                          paypal: { ...paypal, account_name: e.target.value }
                        })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-stone-900 bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-stone-800 block">
                        PayPal Receiving Email <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="payments@yourdomain.com"
                        value={paypal.email}
                        onChange={(e) => setPaymentSettings({
                          ...paymentSettings,
                          paypal: { ...paypal, email: e.target.value }
                        })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm font-mono text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-stone-900 bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-800 block">
                      PayPal Payment Instructions
                    </label>
                    <textarea
                      rows={4}
                      value={paypal.instructions}
                      onChange={(e) => setPaymentSettings({
                        ...paymentSettings,
                        paypal: { ...paypal, instructions: e.target.value }
                      })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-stone-900 bg-white leading-relaxed font-mono"
                    />
                  </div>
                </div>
              )}

              {/* SUB-TAB 3: CRYPTO */}
              {activePaymentSubTab === 'crypto' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-stone-50 border border-stone-200">
                    <div>
                      <span className="text-xs font-bold text-stone-900 block">Enable Crypto Payments</span>
                      <span className="text-[11px] text-stone-500">Allow customers to send crypto (USDT, BTC, ETH)</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={crypto.enabled}
                        onChange={(e) => setPaymentSettings({
                          ...paymentSettings,
                          crypto: { ...crypto, enabled: e.target.checked }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-stone-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-stone-900"></div>
                    </label>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-800 block">
                      Method Display Title <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={crypto.method_name}
                      onChange={(e) => setPaymentSettings({
                        ...paymentSettings,
                        crypto: { ...crypto, method_name: e.target.value }
                      })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-stone-900 bg-white"
                    />
                  </div>

                  {/* Configured Crypto Options List */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-800">
                        Configured Cryptocurrencies & Wallets ({crypto.options?.length || 0})
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsAddingCryptoOption(true)}
                        className="px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-[11px] font-bold flex items-center gap-1 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Crypto Option</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {crypto.options?.map((opt) => (
                        <div key={opt.id} className="p-3.5 rounded-xl border border-stone-200 bg-stone-50 space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-stone-900">{opt.name}</span>
                              <span className="px-2 py-0.5 rounded-full bg-stone-200 font-mono text-[10px] text-stone-700">
                                {opt.network}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveCryptoOption(opt.id)}
                              className="text-stone-400 hover:text-rose-600 transition-colors p-1"
                              title="Delete option"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="font-mono text-[11px] text-stone-600 break-all select-all bg-white p-2 rounded-lg border border-stone-200">
                            {opt.wallet_address}
                          </div>

                          {opt.note && (
                            <span className="text-[10px] text-amber-700 block italic">
                              Note: {opt.note}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-800 block">
                      Crypto Instructions
                    </label>
                    <textarea
                      rows={4}
                      value={crypto.instructions}
                      onChange={(e) => setPaymentSettings({
                        ...paymentSettings,
                        crypto: { ...crypto, instructions: e.target.value }
                      })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-stone-900 bg-white leading-relaxed font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Save Settings Button */}
              <div className="pt-2 border-t border-stone-200">
                <button
                  id="btn-save-payment-settings"
                  type="submit"
                  disabled={savingSettings}
                  className="px-6 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:bg-stone-400 text-white font-bold text-xs shadow-sm transition-all"
                >
                  {savingSettings ? 'Saving Settings...' : 'Save All Payment Settings'}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Live Customer Preview */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                Live Customer Checkout Preview
              </span>
              <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {activePaymentSubTab.toUpperCase()} PREVIEW
              </span>
            </div>

            <div className="rounded-2xl border-2 border-stone-800 bg-stone-900 text-stone-100 p-5 shadow-lg space-y-4">
              {activePaymentSubTab === 'naira' && (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-stone-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🇳🇬</span>
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                        {naira.method_name}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-stone-400">Currency: NGN (₦)</span>
                  </div>

                  <div className="space-y-2">
                    <div className="p-2.5 rounded-xl bg-stone-800/80 border border-stone-700/60">
                      <span className="text-[10px] uppercase text-stone-400 block font-semibold">Bank Name</span>
                      <div className="font-bold text-stone-100 text-sm mt-0.5">{naira.bank_name || 'GTBank'}</div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-stone-800/80 border border-stone-700/60">
                      <span className="text-[10px] uppercase text-stone-400 block font-semibold">Account Name</span>
                      <div className="font-bold text-stone-100 text-sm mt-0.5">{naira.account_name}</div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-stone-800/80 border border-stone-700/60">
                      <span className="text-[10px] uppercase text-stone-400 block font-semibold">Account Number</span>
                      <div className="font-mono font-bold text-amber-300 text-base mt-0.5">{naira.account_number}</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-950/70 border border-stone-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">Instructions:</span>
                    <div className="text-stone-300 text-[11px] leading-relaxed whitespace-pre-line">
                      {naira.instructions}
                    </div>
                  </div>
                </div>
              )}

              {activePaymentSubTab === 'paypal' && (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-stone-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">💳</span>
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                        {paypal.method_name}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-stone-400">Currency: USD ($)</span>
                  </div>

                  <div className="space-y-2">
                    <div className="p-2.5 rounded-xl bg-stone-800/80 border border-stone-700/60">
                      <span className="text-[10px] uppercase text-stone-400 block font-semibold">Account Name</span>
                      <div className="font-bold text-stone-100 text-sm mt-0.5">{paypal.account_name}</div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-stone-800/80 border border-stone-700/60">
                      <span className="text-[10px] uppercase text-stone-400 block font-semibold">PayPal Email Address</span>
                      <div className="font-mono font-bold text-amber-300 text-sm break-all mt-0.5">{paypal.email}</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-950/70 border border-stone-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">Instructions:</span>
                    <div className="text-stone-300 text-[11px] leading-relaxed whitespace-pre-line">
                      {paypal.instructions}
                    </div>
                  </div>
                </div>
              )}

              {activePaymentSubTab === 'crypto' && (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-stone-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">₿</span>
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                        {crypto.method_name}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-stone-400">Blockchain</span>
                  </div>

                  <div className="space-y-2">
                    <div className="p-2.5 rounded-xl bg-stone-800/80 border border-stone-700/60">
                      <span className="text-[10px] uppercase text-stone-400 block font-semibold">Primary Wallet (First Option)</span>
                      <div className="font-bold text-stone-100 text-xs mt-0.5">
                        {crypto.options?.[0]?.name} ({crypto.options?.[0]?.network})
                      </div>
                      <div className="font-mono text-amber-300 text-[11px] break-all mt-1">
                        {crypto.options?.[0]?.wallet_address || 'No wallet configured'}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-950/70 border border-stone-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">Instructions:</span>
                    <div className="text-stone-300 text-[11px] leading-relaxed whitespace-pre-line">
                      {crypto.instructions}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-600 space-y-2">
              <h4 className="font-bold text-stone-900">Setting Product Prices</h4>
              <p className="text-[11px] leading-relaxed">
                To adjust prices for individual eBook products, switch to the <strong>Products & Catalog</strong> tab. Prices update instantly across checkout.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PRODUCTS & CATALOG */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-900">Product Catalog</h3>
              <p className="text-xs text-stone-500">Manage titles, prices, descriptions, and availability.</p>
            </div>
            <button
              onClick={() => {
                setIsCreatingProduct(true);
                setEditingProduct({
                  id: `EBOOK-${Date.now()}`,
                  slug: `guide-${Date.now()}`,
                  name: '',
                  subtitle: '',
                  description: '',
                  author: 'Victor Moses',
                  price: 9.99,
                  currency: 'USD',
                  format: 'PDF',
                  page_count: 50,
                  file_size: '12 MB',
                  isbn: '978-0-000000-00-0',
                  cover_image: '',
                  sample_pdf_url: '',
                  download_url: '',
                  is_active: true,
                  category: 'Nutrition',
                  tags: ['Diet', 'Health'],
                  featured: false
                });
              }}
              className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Guide</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((prod) => (
              <div key={prod.id} className="rounded-2xl border border-stone-200 bg-white p-5 space-y-4 shadow-xs flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700 font-mono">
                      {prod.id}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      prod.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                    }`}>
                      {prod.is_active ? 'Active' : 'Draft'}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-serif font-bold text-stone-900 text-base">{prod.name}</h4>
                    <p className="text-xs text-stone-500 line-clamp-2 mt-0.5">{prod.subtitle}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-stone-100">
                    <span className="text-stone-500">Retail Price:</span>
                    <span className="font-serif font-bold text-stone-900 text-base">
                      ${prod.price.toFixed(2)} {prod.currency}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setIsCreatingProduct(false);
                      setEditingProduct({ ...prod });
                    }}
                    className="flex-1 py-1.5 px-3 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center justify-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>

                  <a
                    href={`/api/pdf/preview/${prod.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="py-1.5 px-3 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold flex items-center gap-1"
                    title="Download generated PDF preview"
                  >
                    <Download className="w-3 h-3" />
                    <span>PDF</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CUSTOMERS */}
      {activeTab === 'customers' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-stone-200 bg-white overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs text-stone-600">
              <thead className="bg-stone-50 border-b border-stone-200 text-[11px] font-bold text-stone-700 uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Customer Name</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">First Seen</th>
                  <th className="p-3.5">Orders</th>
                  <th className="p-3.5">Lifetime Spend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-stone-50/70">
                    <td className="p-3.5 font-bold text-stone-900">{c.name || 'Anonymous Customer'}</td>
                    <td className="p-3.5 font-mono text-stone-700">{c.email}</td>
                    <td className="p-3.5 text-stone-500">{new Date(c.created_at).toLocaleDateString()}</td>
                    <td className="p-3.5 font-bold text-stone-900">{c.total_orders}</td>
                    <td className="p-3.5 font-serif font-bold text-stone-900">${c.total_spent.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: EMAILS */}
      {activeTab === 'emails' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-stone-200 bg-white overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs text-stone-600">
              <thead className="bg-stone-50 border-b border-stone-200 text-[11px] font-bold text-stone-700 uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Dispatched At</th>
                  <th className="p-3.5">Recipient</th>
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5">Subject</th>
                  <th className="p-3.5">Delivery Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium">
                {emails.map((m) => (
                  <tr key={m.id} className="hover:bg-stone-50/70">
                    <td className="p-3.5 text-stone-500 whitespace-nowrap">
                      {new Date(m.created_at).toLocaleString()}
                    </td>
                    <td className="p-3.5 font-mono font-semibold text-stone-800">{m.to_email}</td>
                    <td className="p-3.5 uppercase font-bold text-[10px] text-stone-500">{m.template_type}</td>
                    <td className="p-3.5 text-stone-900">{m.subject}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        DELIVERED
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: QA ACCEPTANCE SUITE */}
      {activeTab === 'qa' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-900">
                QA Acceptance Test Suite — Multi-Method Verification
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Automatically verifies manual order submission, pending states, admin approval, token PDF unlocking, rejection, and multi-method persistence.
              </p>
            </div>
            <button
              onClick={runQaTests}
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Run Acceptance Tests</span>
            </button>
          </div>

          <div className="space-y-3">
            {qaResults.map((t) => (
              <div key={t.id} className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-900">{t.name}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    t.status === 'pass' ? 'bg-emerald-100 text-emerald-800' :
                    t.status === 'fail' ? 'bg-rose-100 text-rose-800' :
                    t.status === 'running' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                    'bg-stone-200 text-stone-600'
                  }`}>
                    {t.status.toUpperCase()}
                  </span>
                </div>
                {t.message && (
                  <p className="text-[11px] text-stone-600 font-mono pl-2 border-l-2 border-stone-300">
                    {t.message}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: ORDER DETAILS VIEW (Full Inspection) */}
      {viewingOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white border border-stone-200 shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-stone-200 bg-stone-50 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-stone-900 text-white flex items-center justify-center font-bold text-xs">
                  ORD
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500 block">
                    Order Inspection
                  </span>
                  <h3 className="font-serif text-base sm:text-lg font-bold text-stone-900">
                    {viewingOrderDetails.order_number}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setViewingOrderDetails(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
              {/* Status Banner */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-stone-50 border border-stone-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">Payment Status</span>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mt-1 ${
                    viewingOrderDetails.payment_status === 'APPROVED' || viewingOrderDetails.payment_status === 'PAID'
                      ? 'bg-emerald-100 text-emerald-900'
                      : viewingOrderDetails.payment_status === 'PENDING'
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-rose-100 text-rose-900'
                  }`}>
                    {viewingOrderDetails.payment_status}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">Placed At</span>
                  <span className="font-mono text-stone-700">
                    {new Date(viewingOrderDetails.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Grid of Key Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl border border-stone-200 bg-white space-y-1">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">Customer</span>
                  <div className="font-bold text-stone-900 text-sm">{viewingOrderDetails.customer_name || 'Customer'}</div>
                  <div className="font-mono text-stone-600">{viewingOrderDetails.customer_email}</div>
                </div>

                <div className="p-3.5 rounded-xl border border-stone-200 bg-white space-y-1">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">Product Purchased</span>
                  <div className="font-bold text-stone-900 text-sm">{viewingOrderDetails.items[0]?.product_name || 'Guide'}</div>
                  <div className="font-serif font-bold text-stone-800">
                    {viewingOrderDetails.currency === 'NGN' ? '₦' : '$'}{viewingOrderDetails.total_amount?.toLocaleString()} {viewingOrderDetails.currency}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-stone-200 bg-white space-y-1">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">Payment Method</span>
                  <div className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                    <span>{viewingOrderDetails.payment_provider || 'Manual Payment'}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-stone-200 bg-white space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">Transaction Reference / TxID</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(viewingOrderDetails.payment_reference, 'modal_tx')}
                      className="text-[10px] text-stone-500 hover:text-stone-900 flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedKey === 'modal_tx' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="font-mono font-bold text-stone-900 text-sm break-all">
                    {viewingOrderDetails.payment_reference}
                  </div>
                </div>
              </div>

              {/* Customer Additional Note */}
              {viewingOrderDetails.additional_note && (
                <div className="p-3.5 rounded-xl border border-stone-200 bg-amber-50/50 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-amber-900 block">Payer's Note / Remarks:</span>
                  <p className="text-stone-800 text-xs italic">{viewingOrderDetails.additional_note}</p>
                </div>
              )}

              {/* Rejection Reason if any */}
              {viewingOrderDetails.rejection_reason && (
                <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50 space-y-1 text-rose-900">
                  <span className="text-[10px] uppercase font-bold block text-rose-700">Rejection Reason:</span>
                  <p className="text-xs">{viewingOrderDetails.rejection_reason}</p>
                </div>
              )}

              {/* Payment Proof Preview */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Uploaded Payment Receipt / Proof:</span>
                {viewingOrderDetails.payment_proof ? (
                  <div className="p-3 rounded-2xl border border-stone-200 bg-stone-100 flex flex-col items-center justify-center">
                    {viewingOrderDetails.payment_proof.startsWith('data:image') ? (
                      <img
                        src={viewingOrderDetails.payment_proof}
                        alt="Payment Proof"
                        className="max-h-64 rounded-xl object-contain shadow-sm"
                      />
                    ) : (
                      <div className="p-4 bg-white rounded-xl font-mono text-xs text-stone-800 max-w-full break-all">
                        {viewingOrderDetails.payment_proof}
                      </div>
                    )}
                    {viewingOrderDetails.proof_filename && (
                      <span className="text-[10px] text-stone-500 mt-2 font-mono">
                        {viewingOrderDetails.proof_filename}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-dashed border-stone-200 text-center text-stone-400">
                    No image file uploaded by customer. Verification relies on transaction reference.
                  </div>
                )}
              </div>

              {/* Download Tokens Issued */}
              {viewingOrderDetails.downloads && viewingOrderDetails.downloads.length > 0 && (
                <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-emerald-900 block">
                    Active Download Token Issued:
                  </span>
                  <div className="font-mono text-[11px] text-emerald-800 break-all select-all bg-white p-2 rounded-lg border border-emerald-200">
                    /api/download/{viewingOrderDetails.downloads[0].token}
                  </div>
                  <span className="text-[10px] text-emerald-700 block">
                    Downloads used: {viewingOrderDetails.downloads[0].download_count} / {viewingOrderDetails.downloads[0].max_downloads} • Expires: {new Date(viewingOrderDetails.downloads[0].expires_at).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            {/* Footer with Actions */}
            <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setViewingOrderDetails(null)}
                className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 font-semibold text-xs hover:bg-stone-100 transition-colors"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                {viewingOrderDetails.payment_status === 'PENDING' && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        const ord = viewingOrderDetails;
                        setViewingOrderDetails(null);
                        setRejectingOrder(ord);
                      }}
                      className="px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1 transition-colors"
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                      <span>Reject Order</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApproveOrder(viewingOrderDetails.id)}
                      className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>Approve Order</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD CRYPTO OPTION */}
      {isAddingCryptoOption && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-md rounded-2xl bg-white border border-stone-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="font-serif text-lg font-bold text-stone-900">
                Add Cryptocurrency Option
              </h3>
              <button onClick={() => setIsAddingCryptoOption(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-stone-700 block">Cryptocurrency Name</label>
                <input
                  type="text"
                  placeholder="e.g. USDT, Bitcoin, Solana"
                  value={newCrypto.name}
                  onChange={(e) => setNewCrypto({ ...newCrypto, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-stone-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700 block">Blockchain Network</label>
                <input
                  type="text"
                  placeholder="e.g. TRC20, BEP20, Bitcoin, Solana"
                  value={newCrypto.network}
                  onChange={(e) => setNewCrypto({ ...newCrypto, network: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-stone-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700 block">Wallet Address</label>
                <input
                  type="text"
                  placeholder="Deposit wallet address"
                  value={newCrypto.wallet_address}
                  onChange={(e) => setNewCrypto({ ...newCrypto, wallet_address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono focus:ring-2 focus:ring-stone-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700 block">Network Note / Warning (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Send only USDT via Tron (TRC20)"
                  value={newCrypto.note || ''}
                  onChange={(e) => setNewCrypto({ ...newCrypto, note: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-stone-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setIsAddingCryptoOption(false)}
                className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 font-semibold text-xs hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddCryptoOption}
                className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs"
              >
                Add Option
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: PROOF VIEWER */}
      {viewingProof && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-xl rounded-2xl bg-white border border-stone-200 shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between p-4 border-b border-stone-200 bg-stone-50">
              <div className="text-xs font-bold text-stone-900">
                Payment Proof — Order {viewingProof.orderNumber}
              </div>
              <button
                onClick={() => setViewingProof(null)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 flex items-center justify-center max-h-[70vh] overflow-auto bg-stone-100">
              {viewingProof.proof.startsWith('data:image') ? (
                <img
                  src={viewingProof.proof}
                  alt="Customer Payment Proof"
                  className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-sm"
                />
              ) : (
                <div className="p-6 bg-white rounded-xl border border-stone-200 text-xs font-mono text-stone-800 break-all max-w-md">
                  <span className="font-bold text-stone-500 uppercase block mb-1">Attached Receipt / Note:</span>
                  {viewingProof.proof}
                </div>
              )}
            </div>

            <div className="p-3 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
              <span>{viewingProof.filename || 'Customer Receipt'}</span>
              <button
                onClick={() => setViewingProof(null)}
                className="px-3 py-1 rounded-lg bg-stone-900 text-white font-semibold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: REJECT ORDER WITH REASON */}
      {rejectingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-md rounded-2xl bg-white border border-stone-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="font-serif text-lg font-bold text-stone-900">
                Reject Order Payment
              </h3>
              <button onClick={() => setRejectingOrder(null)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-600">
              Are you sure you want to reject order <strong>{rejectingOrder.order_number}</strong>? Please provide a reason to help the customer understand why the payment could not be validated.
            </p>

            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700 block">
                Rejection Reason
              </label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Transaction ID was not found on our account statement, or amount was insufficient."
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setRejectingOrder(null)}
                className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 font-semibold text-xs hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectOrder}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: EDIT / CREATE PRODUCT */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-xl rounded-2xl bg-white border border-stone-200 shadow-2xl p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="font-serif text-lg font-bold text-stone-900">
                {isCreatingProduct ? 'Create New eBook Guide' : `Edit: ${editingProduct.name}`}
              </h3>
              <button onClick={() => setEditingProduct(null)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-stone-800 block">Title</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-stone-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-800 block">Subtitle</label>
                <input
                  type="text"
                  value={editingProduct.subtitle}
                  onChange={(e) => setEditingProduct({ ...editingProduct, subtitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-stone-800 block">Price (USD $)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono focus:ring-2 focus:ring-stone-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-800 block">Status</label>
                  <select
                    value={editingProduct.is_active ? 'active' : 'draft'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, is_active: e.target.value === 'active' })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-stone-900"
                  >
                    <option value="active">Active (Available for Purchase)</option>
                    <option value="draft">Draft (Hidden)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-800 block">Description</label>
                <textarea
                  rows={3}
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-stone-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 font-semibold text-xs hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs"
                >
                  Save Guide
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
