import React from 'react';
import { X, ShieldCheck, AlertCircle, FileText } from 'lucide-react';

export type LegalPageType = 'privacy' | 'terms' | 'refund-policy' | 'digital-products' | 'health-disclaimer';

interface LegalModalProps {
  pageType: LegalPageType;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ pageType, onClose }) => {
  const getTitle = () => {
    switch (pageType) {
      case 'privacy': return 'Privacy Policy';
      case 'terms': return 'Terms of Service';
      case 'refund-policy': return 'Refund & Guarantee Policy';
      case 'digital-products': return 'Digital Product Licensing & Delivery';
      case 'health-disclaimer': return 'Medical & Health Disclaimer';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white border border-stone-200 shadow-2xl overflow-hidden my-8 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-200 bg-stone-50/80 shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-800" />
            <h3 className="font-serif text-lg font-bold text-stone-900">
              {getTitle()}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto text-xs sm:text-sm text-stone-600 leading-relaxed space-y-4">
          {pageType === 'health-disclaimer' && (
            <>
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                <span className="font-bold flex items-center gap-1.5 text-xs uppercase tracking-wide">
                  <AlertCircle className="w-4 h-4 text-amber-700" />
                  Mandatory Legal Notice
                </span>
                <p className="text-xs leading-relaxed">
                  The guides published on this platform are for educational, informational, and general scientific inquiry only. They do not constitute the practice of medicine, nutrition therapy, diagnosis, or treatment.
                </p>
              </div>

              <h4 className="font-bold text-stone-900 text-sm">1. Not Medical Advice</h4>
              <p>
                No doctor-patient or healthcare provider relationship is created by purchasing, downloading, or reading any Food & Body digital guide or publication. The information presented summarizes peer-reviewed biochemistry and nutritional literature; it is not tailored to your personal physiological profile, genetics, medications, or preexisting clinical conditions.
              </p>

              <h4 className="font-bold text-stone-900 text-sm">2. Physician Consultation Required</h4>
              <p>
                Always consult your primary care physician or licensed medical professional before implementing any dietary protocol, altering cholesterol intake, adjusting carbohydrate/sugar thresholds, or titrating fiber amounts, especially if you have diagnosed cardiovascular, renal, endocrine, or gastrointestinal diseases.
              </p>

              <h4 className="font-bold text-stone-900 text-sm">3. Emergency Health Circumstances</h4>
              <p>
                If you are experiencing acute allergic reactions, hypoglycemia, severe abdominal pain, or cardiovascular symptoms, seek immediate emergency medical care. Never disregard professional medical advice because of something you read in our publications.
              </p>
            </>
          )}

          {pageType === 'refund-policy' && (
            <>
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                <span className="font-bold block mb-0.5 text-xs uppercase tracking-wide">
                  14-Day 100% Satisfaction Guarantee
                </span>
                <p className="text-xs">
                  We stand behind the scientific rigor and visual clarity of every Food & Body guide. If you are not satisfied, request a full refund within 14 days of purchase.
                </p>
              </div>

              <h4 className="font-bold text-stone-900 text-sm">1. Eligible Window</h4>
              <p>
                Refund requests submitted within 14 calendar days from the timestamp of purchase confirmation will be honored in full to your original payment method.
              </p>

              <h4 className="font-bold text-stone-900 text-sm">2. Token Invalidation Upon Refund</h4>
              <p>
                In accordance with our digital product security architecture, issuing a refund immediately revokes and invalidates all download tokens, links, and license entitlements associated with that order.
              </p>

              <h4 className="font-bold text-stone-900 text-sm">3. How to Request</h4>
              <p>
                Send an email with your Order Number (e.g. ORD-20261001-XXXXXX) to <code className="text-stone-800 font-mono">support@foodandbody.com</code>. Refunds are processed within 2-3 business days.
              </p>
            </>
          )}

          {pageType === 'digital-products' && (
            <>
              <h4 className="font-bold text-stone-900 text-sm">1. Delivery Mechanism</h4>
              <p>
                All guides sold on Food & Body are digital publications provided in Portable Document Format (PDF). Deliveries occur instantaneously upon verified payment confirmation via a secure, short-lived download token and an automated backup delivery email.
              </p>

              <h4 className="font-bold text-stone-900 text-sm">2. Personal License Grant</h4>
              <p>
                Each purchase grants you a non-exclusive, non-transferable, single-user license to view, store, and print the guide for your personal, non-commercial use. Commercial redistribution, public re-uploading, or resale is strictly prohibited.
              </p>

              <h4 className="font-bold text-stone-900 text-sm">3. Download Limits & Expiration</h4>
              <p>
                Download links generated at checkout remain active for 7 days and allow up to 5 total file retrievals to protect intellectual property from automated crawling. If your link expires, use the "Find My Order" feature on our site or contact support to refresh your access.
              </p>
            </>
          )}

          {pageType === 'privacy' && (
            <>
              <h4 className="font-bold text-stone-900 text-sm">1. Information We Collect</h4>
              <p>
                We collect your email address and name strictly to deliver your purchased digital products, process payment verification webhooks, and ensure you can retrieve your download tokens in the future.
              </p>

              <h4 className="font-bold text-stone-900 text-sm">2. Payment Data Security</h4>
              <p>
                Payment card details are never stored or processed directly on our servers; transactions are routed through certified payment processing gateways using industry-standard 256-bit SSL encryption.
              </p>

              <h4 className="font-bold text-stone-900 text-sm">3. No Third-Party Selling</h4>
              <p>
                We will never sell, lease, or monetize your contact information. Your email is only used for order confirmations, delivery tokens, and essential product updates.
              </p>
            </>
          )}

          {pageType === 'terms' && (
            <>
              <h4 className="font-bold text-stone-900 text-sm">1. Agreement to Terms</h4>
              <p>
                By accessing this platform, creating an order, or downloading any publication, you agree to be bound by these Terms of Service and all applicable copyright and intellectual property laws.
              </p>

              <h4 className="font-bold text-stone-900 text-sm">2. Intellectual Property</h4>
              <p>
                All text, illustrations, graphics, anatomy maps, and layouts within the Food & Body digital guides are proprietary copyright assets of Food & Body Publishing. All rights reserved.
              </p>

              <h4 className="font-bold text-stone-900 text-sm">3. Governing Law</h4>
              <p>
                These terms are governed by and construed in accordance with applicable laws governing digital publishing and e-commerce transactions.
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs"
          >
            Close Document
          </button>
        </div>
      </div>
    </div>
  );
};
