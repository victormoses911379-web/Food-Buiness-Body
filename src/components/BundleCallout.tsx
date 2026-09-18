import React from 'react';
import { Sparkles, Check, ArrowRight, ShieldCheck, Download } from 'lucide-react';
import { Product } from '../types';

interface BundleCalloutProps {
  bundleProduct?: Product;
  onViewBundle: () => void;
  onBuyBundle: (product: Product) => void;
}

export const BundleCallout: React.FC<BundleCalloutProps> = ({
  bundleProduct,
  onViewBundle,
  onBuyBundle
}) => {
  if (!bundleProduct) return null;

  return (
    <section className="my-16 sm:my-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-stone-900 text-stone-100 p-8 sm:p-12 lg:p-16 border border-stone-800 shadow-2xl">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 bg-emerald-950/50 rounded-full blur-3xl pointer-events-none" />

          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-700/60 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Special 3-in-1 Launch Edition
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                Get the Complete Food & Body <span className="text-amber-400 italic">Starter Bundle</span>
              </h2>

              <p className="text-sm sm:text-base text-stone-300 leading-relaxed max-w-xl">
                One single purchase unlocks all 3 foundational visual guides. Master lipid biology, stabilize daytime glycemic volatility, and cultivate deep microbiome health.
              </p>

              {/* 3 Guides Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-stone-800/80 border border-stone-700/80">
                  <div className="text-[10px] font-mono text-amber-400 font-semibold uppercase">Guide 01</div>
                  <div className="text-xs font-bold text-stone-100 mt-0.5">The Egg Guide</div>
                  <div className="text-[11px] text-stone-400 mt-1">Lipids & Choline</div>
                </div>
                <div className="p-3.5 rounded-xl bg-stone-800/80 border border-stone-700/80">
                  <div className="text-[10px] font-mono text-rose-400 font-semibold uppercase">Guide 02</div>
                  <div className="text-xs font-bold text-stone-100 mt-0.5">Sugar & Your Body</div>
                  <div className="text-[11px] text-stone-400 mt-1">Metabolic Energy</div>
                </div>
                <div className="p-3.5 rounded-xl bg-stone-800/80 border border-stone-700/80">
                  <div className="text-[10px] font-mono text-emerald-400 font-semibold uppercase">Guide 03</div>
                  <div className="text-xs font-bold text-stone-100 mt-0.5">The Fiber Guide</div>
                  <div className="text-[11px] text-stone-400 mt-1">Gut Microbiome</div>
                </div>
              </div>

              {/* Benefits Checklist */}
              <div className="space-y-2 pt-2 text-xs text-stone-300">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Instant access to 3 full digital PDF files (156 total pages)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Saves $4.98 compared to buying guides separately</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>14-day 100% money back guarantee on all digital files</span>
                </div>
              </div>
            </div>

            {/* Action Card */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl bg-stone-950/80 border border-stone-800 p-6 sm:p-8 space-y-6 shadow-xl backdrop-blur-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                    Limited Bundle Pricing
                  </span>
                  <div className="flex items-baseline gap-3 mt-1">
                    <span className="text-4xl sm:text-5xl font-serif font-bold text-white">
                      $24.99
                    </span>
                    <span className="text-sm font-semibold text-stone-400">USD</span>
                    <span className="text-sm text-stone-500 line-through">$29.97</span>
                  </div>
                  <p className="text-xs text-emerald-400 font-semibold mt-1">
                    Instant 17% savings applied automatically
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    id="btn-buy-bundle-promo"
                    onClick={() => onBuyBundle(bundleProduct)}
                    className="w-full py-3.5 px-6 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-sm tracking-wide shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <span>BUY THE STARTER BUNDLE</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    id="btn-view-bundle-promo"
                    onClick={onViewBundle}
                    className="w-full py-2.5 px-4 rounded-xl text-stone-400 hover:text-white text-xs font-semibold border border-stone-800 hover:bg-stone-900 transition-colors"
                  >
                    View Bundle Overview & Sample Pages
                  </button>
                </div>

                <div className="pt-4 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-stone-400">
                  <div className="flex items-center gap-1.5">
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Instant PDF Access</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>DRM-Free Personal Copy</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
