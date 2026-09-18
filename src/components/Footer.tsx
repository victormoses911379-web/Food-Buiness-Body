import React from 'react';
import { Youtube, ShieldCheck, FileText, ArrowRight } from 'lucide-react';
import { LegalPageType } from './LegalModal';

interface FooterProps {
  onNavigate: (view: string, slug?: string) => void;
  onOpenLegal: (type: LegalPageType) => void;
  onOpenYouTube: () => void;
  onOpenLookup: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenLegal,
  onOpenYouTube,
  onOpenLookup
}) => {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Col 1 & 2: Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-stone-100 text-stone-900 flex items-center justify-center font-serif font-bold text-base">
                F&B
              </div>
              <span className="font-serif text-xl font-bold tracking-tight text-white">
                FOOD & BODY
              </span>
            </div>

            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed max-w-sm">
              Digital publishing platform converting biological science and clinical human trials into intuitive, visual nutrition guides that you can keep and refer to for life.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={onOpenYouTube}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-rose-400 transition-colors"
              >
                <Youtube className="w-4 h-4 text-rose-500" />
                <span>1.2M YouTube Subscribers</span>
              </button>
            </div>
          </div>

          {/* Col 3: Digital Publications */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-100 block">
              Publications
            </span>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <button
                  onClick={() => onNavigate('product', 'complete-egg-health-guide')}
                  className="hover:text-white transition-colors text-left"
                >
                  The Complete Egg Health Guide
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('product', 'sugar-and-your-body')}
                  className="hover:text-white transition-colors text-left"
                >
                  Sugar & Your Body
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('product', 'complete-fiber-guide')}
                  className="hover:text-white transition-colors text-left"
                >
                  The Complete Fiber Guide
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('product', 'food-and-body-starter-bundle')}
                  className="hover:text-amber-300 font-semibold transition-colors text-left flex items-center gap-1"
                >
                  <span>Starter Bundle (Save 17%)</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Customer Services */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-100 block">
              Customer Access
            </span>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <button
                  onClick={onOpenLookup}
                  className="hover:text-white transition-colors text-left"
                >
                  Find My Order & Downloads
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegal('refund-policy')}
                  className="hover:text-white transition-colors text-left"
                >
                  14-Day Money Back Guarantee
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegal('digital-products')}
                  className="hover:text-white transition-colors text-left"
                >
                  Digital Product DRM & Delivery
                </button>
              </li>
              <li>
                <a
                  href="mailto:support@foodandbody.com"
                  className="hover:text-white transition-colors"
                >
                  Customer Support Email
                </a>
              </li>
            </ul>
          </div>

          {/* Col 5: Compliance & Legal (SRS Section 28) */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-100 block">
              Legal & Compliance
            </span>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <button
                  onClick={() => onOpenLegal('health-disclaimer')}
                  className="hover:text-amber-300 transition-colors text-left font-medium"
                >
                  Health & Medical Disclaimer
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegal('privacy')}
                  className="hover:text-white transition-colors text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegal('terms')}
                  className="hover:text-white transition-colors text-left"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegal('refund-policy')}
                  className="hover:text-white transition-colors text-left"
                >
                  Refund Policy
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Mandatory Health Disclaimer Banner (SRS Section 28) */}
        <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 text-[11px] text-stone-400 leading-relaxed space-y-1">
          <span className="font-bold text-stone-300 uppercase tracking-wide block">
            Evidence-Based Health Disclaimer
          </span>
          <p>
            The content, diagrams, nutritional frameworks, and biochemistry pathways published by Food & Body are intended solely for educational, informational, and reference purposes. They do not constitute personalized medical advice, diagnosis, or treatment. Always seek the advice of a physician or other qualified health provider regarding any medical condition or before starting any dietary regimen.
          </p>
        </div>

        {/* Copyright & Bottom Bar */}
        <div className="pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div>
            © {new Date().getFullYear()} Food & Body Digital Publishing. All rights reserved. Target MVP Launch: October 1, 2026.
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>100% DRM-Free Digital PDF</span>
            <span>•</span>
            <span>256-Bit SSL Payment Protection</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
