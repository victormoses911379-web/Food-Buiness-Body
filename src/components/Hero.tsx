import React from 'react';
import { ArrowRight, Youtube, CheckCircle2, FileText, Zap, ShieldCheck } from 'lucide-react';

interface HeroProps {
  onExplore: () => void;
  onWatchYouTube: () => void;
  onOpenBundle: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExplore, onWatchYouTube, onOpenBundle }) => {
  return (
    <section className="relative overflow-hidden bg-radial-[at_top_right] from-stone-100/80 via-[#faf9f6] to-[#faf9f6] border-b border-stone-200 pt-10 pb-16 lg:pt-16 lg:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Main Hero Copy */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-semibold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              NEW: October 2026 Digital Editions Released
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-stone-900 leading-[1.12]">
              Understand What Happens <span className="italic text-emerald-900">Inside</span> Your Body.
            </h1>

            <p className="text-lg sm:text-xl text-stone-600 leading-relaxed max-w-2xl">
              Visual, evidence-based guides that make food and nutrition easier to understand. Cut through dietary noise with clean anatomical maps, cellular pathways, and clear kitchen protocols.
            </p>

            {/* CTAs strictly matching FR-001 */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                id="hero-cta-explore"
                onClick={onExplore}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-sm shadow-md transition-all hover:translate-y-[-1px]"
              >
                <span>Explore the Guides</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="hero-cta-youtube"
                onClick={onWatchYouTube}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-stone-50 text-stone-800 font-semibold text-sm border border-stone-300 shadow-xs transition-colors"
              >
                <Youtube className="w-4 h-4 text-rose-600" />
                <span>Watch on YouTube</span>
              </button>
            </div>

            {/* Value Props & Trust Badges */}
            <div className="pt-6 border-t border-stone-200/80 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-stone-600 font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Peer-Reviewed Science</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Instant PDF Download</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>14-Day Money Back</span>
              </div>
            </div>
          </div>

          {/* Visual Showcase / Guide Mockups Preview */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Stacked Book Presentation */}
              <div 
                onClick={onOpenBundle}
                className="cursor-pointer group relative bg-stone-900 rounded-2xl p-6 text-stone-100 shadow-2xl transition-transform hover:scale-[1.01]"
              >
                <div className="flex items-center justify-between pb-4 border-b border-stone-800 text-xs">
                  <span className="font-semibold text-amber-400 uppercase tracking-wider">
                    Featured Master Collection
                  </span>
                  <span className="bg-emerald-800/80 text-emerald-100 px-2.5 py-0.5 rounded-full font-bold">
                    Save 17%
                  </span>
                </div>

                <div className="py-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-16 rounded-md bg-stone-800 border border-stone-700 flex flex-col justify-center items-center text-[10px] font-bold text-amber-300 p-1 text-center leading-tight shadow-sm">
                      EGG
                      <span className="text-[8px] text-stone-400 font-normal">GUIDE</span>
                    </div>
                    <div className="w-12 h-16 rounded-md bg-stone-800 border border-stone-700 flex flex-col justify-center items-center text-[10px] font-bold text-rose-300 p-1 text-center leading-tight shadow-sm">
                      SUGAR
                      <span className="text-[8px] text-stone-400 font-normal">GUIDE</span>
                    </div>
                    <div className="w-12 h-16 rounded-md bg-stone-800 border border-stone-700 flex flex-col justify-center items-center text-[10px] font-bold text-emerald-300 p-1 text-center leading-tight shadow-sm">
                      FIBER
                      <span className="text-[8px] text-stone-400 font-normal">GUIDE</span>
                    </div>
                    <div className="pl-2">
                      <p className="font-serif text-lg font-bold text-stone-50 leading-tight">
                        Food & Body Starter Bundle
                      </p>
                      <p className="text-xs text-stone-400 mt-0.5">
                        All 3 Guides • 156 Visual Pages
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-stone-300 leading-relaxed">
                    Includes full digital PDF editions for Egg Nutrition, Sugar & Metabolic Energy, and Fiber & Gut Microbiome.
                  </p>
                </div>

                <div className="pt-4 border-t border-stone-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-stone-400 line-through mr-2">$29.97</span>
                    <span className="text-2xl font-bold font-serif text-white">$24.99</span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 group-hover:text-amber-300">
                    <span>View Bundle Details</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </div>

              {/* Floating highlight note */}
              <div className="absolute -bottom-4 -left-4 bg-white/95 backdrop-blur-sm border border-stone-200 rounded-xl p-3.5 shadow-lg hidden sm:flex items-center gap-3 text-xs">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  PDF
                </div>
                <div>
                  <div className="font-semibold text-stone-900">100% DRM-Free Digital Files</div>
                  <div className="text-stone-500">Read on iPad, Kindle, Mac, PC, or Print at Home</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
