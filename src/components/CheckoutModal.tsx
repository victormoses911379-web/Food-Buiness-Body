import React, { useState, useEffect } from 'react';
import { 
  X, 
  Lock, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  FileText,
  Loader2,
  Copy,
  Check,
  Upload,
  Clock,
  ArrowRight,
  ArrowLeft,
  Building2,
  CreditCard,
  Coins,
  Globe,
  ExternalLink,
  Info
} from 'lucide-react';
import { Product, PaymentSettings, CryptoOption } from '../types';
import { safeFetchJson } from '../lib/api';

interface CheckoutModalProps {
  product: Product;
  onClose: () => void;
  onPaymentSuccess: (order: any) => void;
  onOpenPurchases?: (email: string) => void;
}

type PaymentMethodType = 'flutterwave' | 'naira' | 'paypal' | 'crypto';

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  product,
  onClose,
  onPaymentSuccess,
  onOpenPurchases
}) => {
  // Payment Settings from backend
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);

  // Step State: 'method_selection' | 'instructions_and_form'
  const [checkoutStep, setCheckoutStep] = useState<'method_selection' | 'instructions_and_form'>('method_selection');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('flutterwave');
  const [selectedCryptoOptionId, setSelectedCryptoOptionId] = useState<string>('');
  const [selectedCurrency, setSelectedCurrency] = useState<'NGN' | 'USD'>('NGN');
  const [initiatingFlutterwave, setInitiatingFlutterwave] = useState(false);

  // Customer Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [amountPaid, setAmountPaid] = useState<number>(product.price);
  const [txRef, setTxRef] = useState('');
  const [additionalNote, setAdditionalNote] = useState('');
  const [paymentProof, setPaymentProof] = useState<string>('');
  const [proofFilename, setProofFilename] = useState<string>('');
  const [confirmedCheckbox, setConfirmedCheckbox] = useState(false);

  // UI State
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [submittedOrder, setSubmittedOrder] = useState<any | null>(null);

  // Load Payment Settings on mount
  useEffect(() => {
    let isMounted = true;
    const fetchSettings = async () => {
      try {
        const res = await safeFetchJson('/api/payment-settings');
        if (res.success && res.data?.settings && isMounted) {
          const loadedSettings = res.data.settings;
          setSettings(loadedSettings);

          // Auto-select first available method
          const flutterwaveEnabled = loadedSettings.flutterwave?.enabled ?? true;
          const nairaEnabled = loadedSettings.naira?.enabled ?? true;
          const paypalEnabled = loadedSettings.paypal?.enabled ?? true;
          const cryptoEnabled = loadedSettings.crypto?.enabled ?? true;

          if (flutterwaveEnabled) {
            setSelectedMethod('flutterwave');
          } else if (nairaEnabled) {
            setSelectedMethod('naira');
          } else if (paypalEnabled) {
            setSelectedMethod('paypal');
          } else if (cryptoEnabled) {
            setSelectedMethod('crypto');
          }

          // Default crypto option
          if (loadedSettings.crypto?.options?.length > 0) {
            setSelectedCryptoOptionId(loadedSettings.crypto.options[0].id);
          }
          return;
        }
      } catch (err) {
        console.warn('Using default payment settings:', err);
      } finally {
        if (isMounted) setLoadingSettings(false);
      }
    };
    fetchSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  // Update amount & currency whenever selectedMethod or product changes
  useEffect(() => {
    if (!settings) {
      setAmountPaid(product.price);
      return;
    }

    if (selectedMethod === 'flutterwave') {
      if (selectedCurrency === 'NGN') {
        const rate = settings.naira?.naira_rate || 1500;
        setAmountPaid(Math.round(product.price * rate));
      } else {
        setAmountPaid(product.price);
      }
    } else if (selectedMethod === 'naira') {
      const rate = settings.naira?.naira_rate || 1500;
      const nairaPrice = Math.round(product.price * rate);
      setAmountPaid(nairaPrice);
    } else if (selectedMethod === 'paypal') {
      setAmountPaid(product.price);
    } else if (selectedMethod === 'crypto') {
      setAmountPaid(product.price);
    }
  }, [selectedMethod, selectedCurrency, product, settings]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Proof file is too large. Please upload an image or receipt under 5MB.');
      return;
    }

    setProofFilename(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPaymentProof(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const getMethodDisplayName = (): string => {
    if (selectedMethod === 'flutterwave') {
      return settings?.flutterwave?.method_name || 'Online Payment (Flutterwave)';
    }
    if (selectedMethod === 'naira') {
      return settings?.naira?.method_name || 'Nigerian Naira (₦)';
    }
    if (selectedMethod === 'paypal') {
      return settings?.paypal?.method_name || 'PayPal';
    }
    if (selectedMethod === 'crypto') {
      const opt = settings?.crypto?.options?.find(o => o.id === selectedCryptoOptionId);
      if (opt) {
        return `Crypto — ${opt.name} (${opt.network})`;
      }
      return settings?.crypto?.method_name || 'Crypto';
    }
    return 'Manual Payment';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim()) {
      setErrorMsg('Please enter your email address for order confirmation.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (!txRef.trim()) {
      setErrorMsg('Please enter your transaction reference or transfer ID.');
      return;
    }

    if (!confirmedCheckbox) {
      setErrorMsg('Please confirm that you have completed the payment.');
      return;
    }

    setLoading(true);

    try {
      const chosenMethodTitle = getMethodDisplayName();

      const res = await safeFetchJson('/api/orders/submit-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          customerName: name.trim() || undefined,
          customerEmail: email.trim(),
          amountPaid: Number(amountPaid) || product.price,
          amount: Number(amountPaid) || product.price,
          paymentMethod: chosenMethodTitle,
          transactionReference: txRef.trim(),
          transactionId: txRef.trim(),
          paymentProof: paymentProof || undefined,
          receiptUrl: paymentProof || undefined,
          receiptFile: paymentProof || undefined,
          proofFilename: proofFilename || undefined,
          additionalNote: additionalNote.trim() || undefined,
          notes: additionalNote.trim() || undefined,
          confirmedCheckbox: true
        })
      });

      if (!res.success) {
        throw new Error(res.message || res.error || 'Failed to submit payment verification.');
      }

      const orderData = res.data?.order || res.data;
      setSubmittedOrder(orderData);
      if (onPaymentSuccess) {
        onPaymentSuccess(orderData);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during submission. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Safe Fallback Payment Settings
  const flutterwaveConfig = settings?.flutterwave || {
    enabled: true,
    method_name: 'Online Payment (Flutterwave)',
    currency: 'NGN',
    auto_approve: false,
    instructions: 'Pay securely online using Cards, Bank Transfer, USSD, or Mobile Money via Flutterwave.'
  };

  const handleFlutterwaveInitiate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim()) {
      setErrorMsg('Please enter your email address for order delivery.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setInitiatingFlutterwave(true);
    try {
      const res = await safeFetchJson('/api/payments/flutterwave/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          customerName: name.trim() || undefined,
          customerEmail: email.trim(),
          currency: selectedCurrency
        })
      });

      if (!res.success) {
        throw new Error(res.message || res.error || 'Failed to initialize Flutterwave payment session.');
      }

      if (res.data?.paymentLink) {
        // Redirect directly to Flutterwave hosted checkout
        window.location.href = res.data.paymentLink;
      } else {
        throw new Error('No payment link received from Flutterwave.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to connect to Flutterwave. Please check your network or try another payment method.');
      setInitiatingFlutterwave(false);
    }
  };

  const nairaConfig = settings?.naira || {
    enabled: true,
    method_name: 'Nigerian Naira (₦)',
    account_name: 'Victor Moses',
    bank_name: 'Guaranty Trust Bank (GTBank)',
    account_number: '0123456789',
    currency: 'NGN',
    instructions: '1. Transfer the exact amount in NGN to the bank account above.\n2. Copy the session/transaction reference ID from your banking app receipt.\n3. Return to this form, attach your screenshot, and submit.\n4. Our team will verify and unlock your digital guide.',
    naira_rate: 1500
  };

  const paypalConfig = settings?.paypal || {
    enabled: true,
    method_name: 'PayPal',
    account_name: 'Victor Moses',
    email: 'payments@foodandbodypub.com',
    currency: 'USD',
    instructions: '1. Send payment via PayPal to the email address above using Goods & Services or Personal Transfer.\n2. Note your PayPal Transaction ID from your payment confirmation receipt.\n3. Return to this form, fill out your transaction ID, and attach a screenshot.\n4. Our team will verify and unlock your guide.'
  };

  const cryptoConfig = settings?.crypto || {
    enabled: true,
    method_name: 'Crypto',
    instructions: '1. Select your preferred cryptocurrency from the options below.\n2. Send the exact amount to the designated wallet address.\n3. Make sure to choose the correct network.\n4. Copy your Transaction Hash / TxID from your wallet or exchange.\n5. Submit your TxID and optional screenshot below for blockchain verification.',
    options: [
      {
        id: 'crypto_btc',
        name: 'Bitcoin',
        network: 'Bitcoin',
        wallet_address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        currency_symbol: 'BTC',
        note: 'Send only BTC on native Bitcoin network.'
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
  };

  const activeCryptoOption: CryptoOption = 
    cryptoConfig.options?.find(o => o.id === selectedCryptoOptionId) ||
    cryptoConfig.options?.[0] || {
      id: 'default',
      name: 'USDT',
      network: 'TRC20',
      wallet_address: 'TYDZSBLNrdgnLsUtHgVxrmRgyq27gWnEqT',
      currency_symbol: 'USDT'
    };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white border border-stone-200 shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-200 bg-stone-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-stone-900 text-white flex items-center justify-center font-serif font-bold text-sm shadow-xs">
              F&B
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500 block">
                Official Digital Store • Manual Payment
              </span>
              <h2 className="font-serif text-base sm:text-lg font-bold text-stone-900 leading-tight">
                {submittedOrder 
                  ? 'Payment Submitted' 
                  : checkoutStep === 'method_selection' 
                  ? 'Choose Payment Method' 
                  : 'Payment Instructions & Details'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors"
            title="Close checkout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* VIEW A: SUCCESS / PENDING CONFIRMATION STATE */}
        {submittedOrder ? (
          <div className="p-6 sm:p-8 space-y-6 animate-fade-in">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 text-amber-800 ring-8 ring-amber-50">
                <Clock className="w-8 h-8 text-amber-700 animate-pulse" />
              </div>

              <div className="space-y-1">
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider inline-block">
                  Status: Pending Admin Verification
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                  Payment Submitted Successfully!
                </h3>
              </div>

              <p className="text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
                Your payment is being reviewed by our administration team. You will receive access to your PDF once the payment has been confirmed.
              </p>
            </div>

            {/* Order Confirmation Card */}
            <div className="rounded-2xl border border-stone-200 bg-stone-50/80 p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-stone-400 uppercase font-semibold block text-[10px]">Order Number</span>
                  <span className="font-mono text-sm font-bold text-stone-900">{submittedOrder.order_number}</span>
                </div>

                <div>
                  <span className="text-stone-400 uppercase font-semibold block text-[10px]">Payment Method</span>
                  <span className="font-bold text-stone-900">{submittedOrder.payment_provider}</span>
                </div>

                <div>
                  <span className="text-stone-400 uppercase font-semibold block text-[10px]">Transaction Reference</span>
                  <span className="font-mono text-sm font-semibold text-stone-800 break-all">{submittedOrder.payment_reference}</span>
                </div>

                <div>
                  <span className="text-stone-400 uppercase font-semibold block text-[10px]">Amount Paid</span>
                  <span className="font-serif text-sm font-bold text-stone-900">
                    {submittedOrder.currency === 'NGN' ? '₦' : '$'}{submittedOrder.total_amount?.toLocaleString()} {submittedOrder.currency}
                  </span>
                </div>

                <div className="sm:col-span-2">
                  <span className="text-stone-400 uppercase font-semibold block text-[10px]">Purchaser Email</span>
                  <span className="font-medium text-stone-800">{submittedOrder.customer_email}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-stone-200 text-xs text-stone-600 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>
                  A confirmation email with your order details has been dispatched to <strong>{submittedOrder.customer_email}</strong>. Once approved, your single-user watermarked PDF will unlock immediately.
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenPurchases) {
                    onOpenPurchases(submittedOrder.customer_email);
                  }
                }}
                className="flex-1 py-3.5 px-6 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Track Status in My Purchases</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="py-3.5 px-6 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-700 font-semibold text-xs transition-colors text-center"
              >
                Continue Browsing
              </button>
            </div>
          </div>
        ) : (
          /* ACTIVE CHECKOUT FLOW */
          <div className="max-h-[82vh] overflow-y-auto p-5 sm:p-7 space-y-6">
            {/* Product Summary Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80">
              <div className="flex items-start gap-3">
                <div className="w-10 h-12 rounded-lg bg-stone-900 text-amber-400 flex items-center justify-center shrink-0 shadow-xs">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">
                    Product Selected
                  </span>
                  <h3 className="font-serif font-bold text-stone-900 text-sm leading-snug">
                    {product.name}
                  </h3>
                  <p className="text-xs text-stone-600 line-clamp-1">{product.subtitle}</p>
                </div>
              </div>

              <div className="text-left sm:text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-amber-200">
                <span className="text-[10px] font-semibold text-stone-500 uppercase block">Standard Price</span>
                <span className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                  ${product.price.toFixed(2)}{' '}
                  <span className="text-xs font-normal text-stone-500">USD</span>
                </span>
              </div>
            </div>

            {/* STEP 1: CHOOSE PAYMENT METHOD */}
            {checkoutStep === 'method_selection' && (
              <div className="space-y-5 animate-fade-in">
                <div>
                  <h3 className="font-serif text-lg font-bold text-stone-900">
                    Choose Payment Method
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Select one of the manual payment options configured below to continue to payment instructions:
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3.5">
                  {/* Card 0: Flutterwave (Instant Online Checkout) */}
                  {flutterwaveConfig.enabled && (
                    <div
                      id="card-payment-flutterwave"
                      onClick={() => setSelectedMethod('flutterwave')}
                      className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-4 ${
                        selectedMethod === 'flutterwave'
                          ? 'border-stone-900 bg-stone-50 ring-2 ring-stone-900/10 shadow-sm'
                          : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-300/40 flex items-center justify-center text-2xl shrink-0">
                          ⚡
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-serif font-bold text-stone-900 text-sm sm:text-base">
                              {flutterwaveConfig.method_name || 'Pay Online (Flutterwave)'}
                            </h4>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                              Cards • Bank • USSD
                            </span>
                          </div>
                          <p className="text-xs text-stone-500 mt-0.5 leading-snug">
                            Instant online payment via Flutterwave's secure hosted checkout gateway.
                          </p>
                          <div className="text-xs font-bold text-stone-800 mt-1 font-serif">
                            ₦{Math.round(product.price * (nairaConfig.naira_rate || 1500)).toLocaleString()} NGN{' '}
                            <span className="text-[10px] font-normal text-stone-500 font-sans">
                              or ${product.price.toFixed(2)} USD
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMethod('flutterwave');
                          }}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            selectedMethod === 'flutterwave'
                              ? 'bg-stone-900 text-white'
                              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                          }`}
                        >
                          {selectedMethod === 'flutterwave' ? 'SELECTED' : 'SELECT'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Card 1: Nigerian Naira (₦) */}
                  {nairaConfig.enabled && (
                    <div
                      id="card-payment-naira"
                      onClick={() => setSelectedMethod('naira')}
                      className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-4 ${
                        selectedMethod === 'naira'
                          ? 'border-stone-900 bg-stone-50 ring-2 ring-stone-900/10 shadow-sm'
                          : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-2xl shrink-0">
                          🇳🇬
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-serif font-bold text-stone-900 text-sm sm:text-base">
                              {nairaConfig.method_name || 'Nigerian Naira (₦)'}
                            </h4>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900">
                              Direct Bank Transfer
                            </span>
                          </div>
                          <p className="text-xs text-stone-500 mt-0.5 leading-snug">
                            Pay with Nigerian Naira using configured Nigerian bank/payment details.
                          </p>
                          <div className="text-xs font-bold text-stone-800 mt-1 font-serif">
                            ₦{Math.round(product.price * (nairaConfig.naira_rate || 1500)).toLocaleString()}{' '}
                            <span className="text-[10px] font-normal text-stone-500 font-sans">
                              (1 USD ≈ ₦{(nairaConfig.naira_rate || 1500).toLocaleString()})
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMethod('naira');
                          }}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            selectedMethod === 'naira'
                              ? 'bg-stone-900 text-white'
                              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                          }`}
                        >
                          {selectedMethod === 'naira' ? 'SELECTED' : 'SELECT'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Card 2: PayPal */}
                  {paypalConfig.enabled && (
                    <div
                      id="card-payment-paypal"
                      onClick={() => setSelectedMethod('paypal')}
                      className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-4 ${
                        selectedMethod === 'paypal'
                          ? 'border-stone-900 bg-stone-50 ring-2 ring-stone-900/10 shadow-sm'
                          : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-2xl shrink-0">
                          💳
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-serif font-bold text-stone-900 text-sm sm:text-base">
                              {paypalConfig.method_name || 'PayPal'}
                            </h4>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-900">
                              Manual Receipt Verification
                            </span>
                          </div>
                          <p className="text-xs text-stone-500 mt-0.5 leading-snug">
                            Pay using configured PayPal account / email details.
                          </p>
                          <div className="text-xs font-bold text-stone-800 mt-1 font-serif">
                            ${product.price.toFixed(2)} USD
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMethod('paypal');
                          }}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            selectedMethod === 'paypal'
                              ? 'bg-stone-900 text-white'
                              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                          }`}
                        >
                          {selectedMethod === 'paypal' ? 'SELECTED' : 'SELECT'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Card 3: Crypto */}
                  {cryptoConfig.enabled && (
                    <div
                      id="card-payment-crypto"
                      onClick={() => setSelectedMethod('crypto')}
                      className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-4 ${
                        selectedMethod === 'crypto'
                          ? 'border-stone-900 bg-stone-50 ring-2 ring-stone-900/10 shadow-sm'
                          : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-2xl shrink-0">
                          ₿
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-serif font-bold text-stone-900 text-sm sm:text-base">
                              {cryptoConfig.method_name || 'Crypto'}
                            </h4>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                              USDT / BTC / ETH
                            </span>
                          </div>
                          <p className="text-xs text-stone-500 mt-0.5 leading-snug">
                            Pay using configured cryptocurrency details with blockchain TxID.
                          </p>
                          <div className="text-xs font-bold text-stone-800 mt-1 font-serif">
                            ${product.price.toFixed(2)} USD equivalent
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMethod('crypto');
                          }}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            selectedMethod === 'crypto'
                              ? 'bg-stone-900 text-white'
                              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                          }`}
                        >
                          {selectedMethod === 'crypto' ? 'SELECTED' : 'SELECT'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Continue to Payment button */}
                <div className="pt-2">
                  <button
                    id="btn-continue-to-payment"
                    type="button"
                    onClick={() => {
                      setCheckoutStep('instructions_and_form');
                    }}
                    className="w-full py-4 px-6 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <span>CONTINUE TO PAYMENT</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: PAYMENT INSTRUCTIONS & SUBMISSION FORM */}
            {checkoutStep === 'instructions_and_form' && (
              <div className="space-y-6 animate-fade-in">
                {/* Back to method selection button */}
                <div className="flex items-center justify-between pb-1">
                  <button
                    id="btn-change-payment-method"
                    type="button"
                    onClick={() => setCheckoutStep('method_selection')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-900 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Change Payment Method</span>
                  </button>

                  <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 font-semibold">
                    {getMethodDisplayName()}
                  </span>
                </div>

                {/* INSTRUCTIONS DISPLAY & FORM PER METHOD */}
                {selectedMethod === 'flutterwave' ? (
                  <form onSubmit={handleFlutterwaveInitiate} className="space-y-5 animate-fade-in">
                    {/* Flutterwave Info Card */}
                    <div className="rounded-2xl border-2 border-stone-800 bg-stone-900 text-stone-100 p-5 sm:p-6 shadow-md space-y-4">
                      <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">⚡</span>
                          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                            Flutterwave Hosted Online Gateway
                          </span>
                        </div>
                        <span className="text-[11px] text-stone-400 font-mono">Instant Gateway</span>
                      </div>

                      <p className="text-xs text-stone-300 leading-relaxed">
                        You will be redirected to Flutterwave's secure 256-bit encrypted checkout portal to complete your order using card, bank transfer, or USSD.
                      </p>

                      {/* Currency Switcher */}
                      <div className="p-3.5 rounded-xl bg-stone-950/80 border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                            Billing Currency
                          </span>
                          <span className="text-xs text-stone-300">
                            {selectedCurrency === 'NGN' ? 'Nigerian Naira (Cards, Bank Transfer, USSD)' : 'US Dollars (International Cards)'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 bg-stone-800 p-1 rounded-xl shrink-0">
                          <button
                            type="button"
                            onClick={() => setSelectedCurrency('NGN')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              selectedCurrency === 'NGN'
                                ? 'bg-amber-400 text-stone-950 shadow-xs'
                                : 'text-stone-300 hover:text-white'
                            }`}
                          >
                            ₦ NGN
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedCurrency('USD')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              selectedCurrency === 'USD'
                                ? 'bg-amber-400 text-stone-950 shadow-xs'
                                : 'text-stone-300 hover:text-white'
                            }`}
                          >
                            $ USD
                          </button>
                        </div>
                      </div>

                      {/* Total Amount Display */}
                      <div className="flex items-center justify-between p-3.5 rounded-xl bg-stone-800/80 border border-stone-700/60">
                        <span className="text-xs text-stone-300 font-medium">Exact Amount Billed</span>
                        <span className="font-serif text-lg font-bold text-amber-300">
                          {selectedCurrency === 'NGN' 
                            ? `₦${Math.round(product.price * (nairaConfig.naira_rate || 1500)).toLocaleString()} NGN` 
                            : `$${product.price.toFixed(2)} USD`}
                        </span>
                      </div>

                      {/* Payment Methods Accepted */}
                      <div className="flex flex-wrap gap-1.5 text-[11px] text-stone-400 pt-1">
                        <span className="px-2.5 py-1 rounded-md bg-stone-800 text-stone-300 font-mono">Mastercard</span>
                        <span className="px-2.5 py-1 rounded-md bg-stone-800 text-stone-300 font-mono">Visa</span>
                        <span className="px-2.5 py-1 rounded-md bg-stone-800 text-stone-300 font-mono">Verve</span>
                        <span className="px-2.5 py-1 rounded-md bg-stone-800 text-stone-300 font-mono">Bank Transfer</span>
                        <span className="px-2.5 py-1 rounded-md bg-stone-800 text-stone-300 font-mono">USSD</span>
                      </div>
                    </div>

                    {/* Customer Info Form */}
                    <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 space-y-4 shadow-xs">
                      <div className="flex items-center justify-between pb-1 border-b border-stone-200">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-stone-700" />
                          <h4 className="font-serif font-bold text-stone-900 text-base">
                            Delivery & Customer Information
                          </h4>
                        </div>
                        <span className="text-[11px] font-semibold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          Secure Checkout
                        </span>
                      </div>

                      {errorMsg && (
                        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-2.5 text-xs text-rose-900 animate-fade-in">
                          <div className="flex items-start gap-2.5">
                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <p className="font-semibold">{errorMsg}</p>
                              <p className="text-[11px] text-rose-700">
                                You can also switch to direct Nigerian Naira bank transfer or PayPal to complete your order immediately.
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 pt-1 border-t border-rose-200/60">
                            {nairaConfig.enabled && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedMethod('naira');
                                  setErrorMsg(null);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-stone-900 text-white font-semibold text-xs hover:bg-stone-800 transition-all cursor-pointer flex items-center gap-1.5"
                              >
                                <span>🇳🇬 Pay via Bank Transfer (GTBank)</span>
                                <span>→</span>
                              </button>
                            )}
                            {paypalConfig.enabled && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedMethod('paypal');
                                  setErrorMsg(null);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-white border border-stone-300 text-stone-800 font-semibold text-xs hover:bg-stone-100 transition-all cursor-pointer"
                              >
                                Pay with PayPal →
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="space-y-1">
                          <label htmlFor="customer-name-flw" className="text-xs font-bold text-stone-700 block">
                            Full Name <span className="text-stone-400 font-normal">(Optional)</span>
                          </label>
                          <input
                            id="customer-name-flw"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Sarah Jenkins"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-stone-900 focus:border-stone-900 bg-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <label htmlFor="customer-email-flw" className="text-xs font-bold text-stone-700 block">
                            Email Address <span className="text-rose-600">*</span>
                          </label>
                          <input
                            id="customer-email-flw"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-stone-900 focus:border-stone-900 bg-white"
                          />
                          <span className="text-[10px] text-stone-500 block">
                            Your watermarked PDF download link is linked to this email address.
                          </span>
                        </div>
                      </div>

                      <button
                        id="btn-proceed-flutterwave"
                        type="submit"
                        disabled={initiatingFlutterwave}
                        className="w-full py-4 px-6 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                      >
                        {initiatingFlutterwave ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>CONNECTING TO FLUTTERWAVE...</span>
                          </>
                        ) : (
                          <>
                            <span>PROCEED TO FLUTTERWAVE CHECKOUT</span>
                            <ExternalLink className="w-4 h-4" />
                          </>
                        )}
                      </button>

                      <div className="flex items-center justify-center gap-4 text-[11px] text-stone-500 pt-1">
                        <span className="flex items-center gap-1">
                          <Lock className="w-3 h-3 text-stone-400" />
                          PCI-DSS Certified
                        </span>
                        <span>•</span>
                        <span>256-Bit SSL Encrypted</span>
                        <span>•</span>
                        <span>Flutterwave Hosted</span>
                      </div>
                    </div>
                  </form>
                ) : (
                  <>
                    {/* INSTRUCTIONS DISPLAY PER METHOD */}
                    <div className="rounded-2xl border-2 border-stone-800 bg-stone-900 text-stone-100 p-5 sm:p-6 shadow-md space-y-5">
                  {/* METHOD A: NIGERIAN NAIRA */}
                  {selectedMethod === 'naira' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">🇳🇬</span>
                          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                            Nigerian Bank Account Details
                          </span>
                        </div>
                        <span className="text-[11px] text-stone-400 font-mono">Currency: NGN (₦)</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                        <div className="p-3 rounded-xl bg-stone-800/80 border border-stone-700/60 space-y-1">
                          <span className="text-[10px] uppercase font-semibold text-stone-400 block">
                            Bank Name
                          </span>
                          <div className="font-bold text-stone-100 text-sm">
                            {nairaConfig.bank_name || 'Guaranty Trust Bank (GTBank)'}
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-stone-800/80 border border-stone-700/60 space-y-1">
                          <span className="text-[10px] uppercase font-semibold text-stone-400 block">
                            Account Name
                          </span>
                          <div className="font-bold text-stone-100 text-sm">
                            {nairaConfig.account_name}
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-stone-800/80 border border-stone-700/60 space-y-1 sm:col-span-2 flex items-center justify-between gap-2">
                          <div className="overflow-hidden">
                            <span className="text-[10px] uppercase font-semibold text-stone-400 block">
                              Account Number
                            </span>
                            <div className="font-mono font-bold text-amber-300 text-base sm:text-lg tracking-wider">
                              {nairaConfig.account_number}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleCopy(nairaConfig.account_number, 'naira_acct')}
                            className="px-3.5 py-1.5 rounded-lg bg-stone-700 hover:bg-stone-600 text-stone-100 font-semibold text-xs flex items-center gap-1.5 shrink-0 transition-colors"
                            title="Copy account number"
                          >
                            {copiedKey === 'naira_acct' ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Number</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Instructions */}
                      <div className="p-3.5 rounded-xl bg-stone-950/60 border border-stone-800 text-xs space-y-1.5">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
                          Payment Instructions
                        </span>
                        <div className="text-stone-300 text-xs leading-relaxed whitespace-pre-line">
                          {nairaConfig.instructions}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* METHOD B: PAYPAL */}
                  {selectedMethod === 'paypal' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">💳</span>
                          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                            PayPal Payment Details
                          </span>
                        </div>
                        <span className="text-[11px] text-stone-400 font-mono">Currency: USD ($)</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                        <div className="p-3 rounded-xl bg-stone-800/80 border border-stone-700/60 space-y-1">
                          <span className="text-[10px] uppercase font-semibold text-stone-400 block">
                            PayPal Account Name
                          </span>
                          <div className="font-bold text-stone-100 text-sm">
                            {paypalConfig.account_name}
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-stone-800/80 border border-stone-700/60 space-y-1">
                          <span className="text-[10px] uppercase font-semibold text-stone-400 block">
                            Amount to Send
                          </span>
                          <div className="font-serif font-bold text-emerald-400 text-sm sm:text-base">
                            ${product.price.toFixed(2)} USD
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-stone-800/80 border border-stone-700/60 space-y-1 sm:col-span-2 flex items-center justify-between gap-2">
                          <div className="overflow-hidden">
                            <span className="text-[10px] uppercase font-semibold text-stone-400 block">
                              PayPal Email Address
                            </span>
                            <div className="font-mono font-bold text-amber-300 text-sm sm:text-base truncate">
                              {paypalConfig.email}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleCopy(paypalConfig.email, 'paypal_email')}
                            className="px-3.5 py-1.5 rounded-lg bg-stone-700 hover:bg-stone-600 text-stone-100 font-semibold text-xs flex items-center gap-1.5 shrink-0 transition-colors"
                            title="Copy PayPal email"
                          >
                            {copiedKey === 'paypal_email' ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Email</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Instructions */}
                      <div className="p-3.5 rounded-xl bg-stone-950/60 border border-stone-800 text-xs space-y-1.5">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
                          Payment Instructions
                        </span>
                        <div className="text-stone-300 text-xs leading-relaxed whitespace-pre-line">
                          {paypalConfig.instructions}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* METHOD C: CRYPTO */}
                  {selectedMethod === 'crypto' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">₿</span>
                          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                            Cryptocurrency Wallet Details
                          </span>
                        </div>
                        <span className="text-[11px] text-stone-400 font-mono">Blockchain Transfer</span>
                      </div>

                      {/* Select Crypto Token / Network */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] uppercase font-bold text-stone-400 block">
                          Select Cryptocurrency / Network:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {cryptoConfig.options?.map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setSelectedCryptoOptionId(opt.id)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                activeCryptoOption.id === opt.id
                                  ? 'bg-amber-400 text-stone-950 shadow-xs'
                                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                              }`}
                            >
                              <span>{opt.name}</span>
                              <span className="opacity-75 text-[10px]">({opt.network})</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Wallet Card */}
                      <div className="p-4 rounded-xl bg-stone-800/80 border border-stone-700/60 space-y-2.5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-stone-700 pb-2">
                          <div>
                            <span className="text-[10px] uppercase text-stone-400 block font-semibold">
                              Asset & Network
                            </span>
                            <div className="font-bold text-amber-300 text-sm">
                              {activeCryptoOption.name} • {activeCryptoOption.network}
                            </div>
                          </div>

                          <div className="text-left sm:text-right">
                            <span className="text-[10px] uppercase text-stone-400 block font-semibold">
                              Equivalent Price
                            </span>
                            <div className="font-serif font-bold text-stone-100 text-sm">
                              ${product.price.toFixed(2)} USD
                            </div>
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase text-stone-400 block font-semibold mb-1">
                            Deposit Wallet Address
                          </span>
                          <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-stone-950 font-mono text-xs text-amber-200 break-all select-all">
                            <span>{activeCryptoOption.wallet_address}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(activeCryptoOption.wallet_address, 'crypto_wallet')}
                              className="px-2.5 py-1 rounded bg-stone-700 hover:bg-stone-600 text-white font-sans font-semibold text-[11px] shrink-0 transition-colors"
                              title="Copy wallet address"
                            >
                              {copiedKey === 'crypto_wallet' ? 'Copied' : 'Copy'}
                            </button>
                          </div>
                        </div>

                        {activeCryptoOption.note && (
                          <div className="flex items-start gap-1.5 text-[11px] text-amber-300/90 pt-1">
                            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <span>{activeCryptoOption.note}</span>
                          </div>
                        )}
                      </div>

                      {/* Instructions */}
                      <div className="p-3.5 rounded-xl bg-stone-950/60 border border-stone-800 text-xs space-y-1.5">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
                          Payment Instructions
                        </span>
                        <div className="text-stone-300 text-xs leading-relaxed whitespace-pre-line">
                          {cryptoConfig.instructions}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* CUSTOMER PAYMENT SUBMISSION FORM */}
                <form onSubmit={handleSubmit} className="space-y-4 pt-1">
                  <div className="flex items-center justify-between pb-1 border-b border-stone-200">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-stone-700" />
                      <h4 className="font-serif font-bold text-stone-900 text-base">
                        Submit Payment Details For Verification
                      </h4>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      Step 2 of 2
                    </span>
                  </div>

                  {errorMsg && (
                    <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800 animate-fade-in">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Full Name */}
                    <div className="space-y-1">
                      <label htmlFor="customer-name" className="text-xs font-bold text-stone-700 block">
                        Full Name <span className="text-stone-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        id="customer-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Sarah Jenkins"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-stone-900 focus:border-stone-900 bg-white"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                      <label htmlFor="customer-email" className="text-xs font-bold text-stone-700 block">
                        Email Address <span className="text-rose-600">*</span>
                      </label>
                      <input
                        id="customer-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-stone-900 focus:border-stone-900 bg-white"
                      />
                      <span className="text-[10px] text-stone-500 block">
                        Your unlocked PDF link will be delivered here upon admin approval.
                      </span>
                    </div>

                    {/* Amount Paid */}
                    <div className="space-y-1">
                      <label htmlFor="amount-paid" className="text-xs font-bold text-stone-700 block">
                        Amount Paid ({selectedMethod === 'naira' ? 'NGN ₦' : 'USD $'}) <span className="text-rose-600">*</span>
                      </label>
                      <input
                        id="amount-paid"
                        type="number"
                        step="0.01"
                        required
                        value={amountPaid}
                        onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm text-stone-900 font-mono focus:outline-hidden focus:ring-2 focus:ring-stone-900 focus:border-stone-900 bg-white"
                      />
                    </div>

                    {/* Transaction Reference / ID */}
                    <div className="space-y-1">
                      <label htmlFor="transaction-ref" className="text-xs font-bold text-stone-700 block">
                        {selectedMethod === 'naira' 
                          ? 'Bank Session / Transfer Reference ID'
                          : selectedMethod === 'paypal'
                          ? 'PayPal Transaction ID'
                          : 'Blockchain TxHash / Transaction ID'}{' '}
                        <span className="text-rose-600">*</span>
                      </label>
                      <input
                        id="transaction-ref"
                        type="text"
                        required
                        value={txRef}
                        onChange={(e) => setTxRef(e.target.value)}
                        placeholder={
                          selectedMethod === 'naira'
                            ? 'e.g. 090267240916... or Bank session ID'
                            : selectedMethod === 'paypal'
                            ? 'e.g. 9XF12984920'
                            : 'e.g. 0x8f... or TxID hash'
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm text-stone-900 font-mono placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-stone-900 focus:border-stone-900 bg-white"
                      />
                    </div>
                  </div>

                  {/* Optional Additional Note */}
                  <div className="space-y-1">
                    <label htmlFor="additional-note" className="text-xs font-bold text-stone-700 block">
                      Additional Note / Payer Remarks <span className="text-stone-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      id="additional-note"
                      type="text"
                      value={additionalNote}
                      onChange={(e) => setAdditionalNote(e.target.value)}
                      placeholder="e.g. Sender bank account name, PayPal email, or transaction note"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-stone-900 focus:border-stone-900 bg-white"
                    />
                  </div>

                  {/* Payment Proof / Screenshot Upload */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-xs font-bold text-stone-700 block">
                      Proof of Payment / Screenshot <span className="text-stone-400 font-normal">(Recommended)</span>
                    </label>

                    <div className="rounded-xl border border-dashed border-stone-300 p-4 bg-stone-50 hover:bg-stone-100/70 transition-colors flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-stone-200 text-stone-600 flex items-center justify-center shrink-0">
                          <Upload className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-stone-800">
                            {proofFilename ? proofFilename : 'Upload receipt or payment screenshot'}
                          </div>
                          <span className="text-[10px] text-stone-500 block">
                            PNG, JPG, or PDF up to 5MB
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {paymentProof && (
                          <button
                            type="button"
                            onClick={() => {
                              setPaymentProof('');
                              setProofFilename('');
                            }}
                            className="px-2.5 py-1.5 rounded-lg border border-stone-300 text-[11px] font-semibold text-stone-600 hover:bg-stone-200 transition-colors"
                          >
                            Remove
                          </button>
                        )}
                        <label
                          htmlFor="payment-proof-file"
                          className="cursor-pointer px-3.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition-colors"
                        >
                          {paymentProof ? 'Change File' : 'Select File'}
                        </label>
                        <input
                          id="payment-proof-file"
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </div>
                    </div>

                    {paymentProof && paymentProof.startsWith('data:image') && (
                      <div className="p-2 rounded-xl border border-stone-200 bg-white max-w-xs">
                        <img
                          src={paymentProof}
                          alt="Payment proof preview"
                          className="rounded-lg max-h-32 object-contain w-full"
                        />
                      </div>
                    )}
                  </div>

                  {/* Confirmation Checkbox */}
                  <div className="p-3.5 rounded-xl bg-stone-100/70 border border-stone-200">
                    <label className="flex items-start gap-2.5 cursor-pointer text-xs text-stone-800 font-medium">
                      <input
                        id="checkbox-confirm-payment"
                        type="checkbox"
                        required
                        checked={confirmedCheckbox}
                        onChange={(e) => setConfirmedCheckbox(e.target.checked)}
                        className="w-4 h-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900 mt-0.5 shrink-0"
                      />
                      <span>
                        <strong>I confirm that I have completed the payment</strong> using the details provided above and that the transaction reference is accurate.
                      </span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    id="btn-submit-manual-payment"
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 px-6 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:bg-stone-400 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting For Verification...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>SUBMIT PAYMENT FOR VERIFICATION</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-4 text-[11px] text-stone-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Lock className="w-3 h-3 text-stone-400" />
                      Secure Submission
                    </span>
                    <span>•</span>
                    <span>Manual Admin Review</span>
                    <span>•</span>
                    <span>Single-User Watermarked PDF</span>
                  </div>
                </form>
              </>
            )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
