import React from 'react';
import { Youtube, Play, CheckCircle2, BookOpen, Layers, Microscope } from 'lucide-react';

interface EducationalApproachProps {
  onOpenYouTube: () => void;
  onExploreGuides: () => void;
}

export const EducationalApproach: React.FC<EducationalApproachProps> = ({ onOpenYouTube, onExploreGuides }) => {
  const videos = [
    {
      title: 'What Happens to Your Arteries When You Eat 3 Eggs a Day?',
      views: '1.4M views',
      duration: '14:22',
      topic: 'Lipid transport, ApoB, and dietary cholesterol adaptation',
      guideId: 'EGG-001'
    },
    {
      title: 'The Hidden Sugar Molecule Map: How Fructose Traps Liver Fat',
      views: '890K views',
      duration: '18:05',
      topic: 'Hepatic de novo lipogenesis and overcoming afternoon brain fog',
      guideId: 'SUG-001'
    },
    {
      title: 'The 30-Plant Rule: What Fermenting Fiber Actually Does in Your Colon',
      views: '1.1M views',
      duration: '16:40',
      topic: 'Short-chain fatty acids (butyrate) and sealing gut tight junctions',
      guideId: 'FIB-001'
    }
  ];

  return (
    <section id="methodology-section" className="py-16 sm:py-24 bg-white border-y border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Methodological Philosophy */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-800">
              The Food & Body Approach
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 leading-tight">
              Why Visual Biomechanical Maps Beat Generic Dietary Advice
            </h2>
            <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
              Most nutrition information fails because it either overwhelms you with dense medical jargon or dumbs science down into dogmatic fad diet rules. We bridge the gap with visual anatomy and biochemical maps.
            </p>
          </div>

          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-stone-200 text-stone-700 flex items-center justify-center">
                <Microscope className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-stone-900">100% Evidence Grounded</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Directly referenced to peer-reviewed human clinical trials (PubMed, Nature, NEJM), not speculation.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-stone-900">Step-by-Step Anatomy</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Trace nutrients from oral mastication down into hepatic mitochondria with crystal clear infographics.
              </p>
            </div>
          </div>
        </div>

        {/* YouTube / Free Content to Paid Product Pipeline (SRS Section 2 & 7) */}
        <div className="pt-8 border-t border-stone-100 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-rose-700 uppercase tracking-wider mb-1">
                <Youtube className="w-4 h-4 text-rose-600" />
                <span>As Seen On YouTube</span>
              </div>
              <h3 className="font-serif text-2xl font-bold text-stone-900">
                From Video Animation to Deep-Dive Publication
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-xl">
                Our educational videos introduce the concepts; our digital publishing guides provide the exact clinical papers, protocols, and reference tables you can keep forever.
              </p>
            </div>

            <button
              id="btn-open-yt-modal"
              onClick={onOpenYouTube}
              className="inline-flex items-center gap-2 text-xs font-bold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-4 py-2.5 rounded-lg border border-rose-200/60 transition-colors shrink-0"
            >
              <Youtube className="w-4 h-4 text-rose-600" />
              <span>Visit YouTube Channel</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {videos.map((vid, idx) => (
              <div
                key={idx}
                onClick={onOpenYouTube}
                className="group cursor-pointer rounded-xl border border-stone-200 bg-[#faf9f6] p-5 space-y-3 hover:border-stone-400 hover:shadow-md transition-all"
              >
                <div className="relative h-32 rounded-lg bg-stone-900 flex items-center justify-center overflow-hidden">
                  <div className="w-10 h-10 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-4 h-4 fill-white ml-0.5" />
                  </div>
                  <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] text-stone-300 font-mono">
                    {vid.duration}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-stone-500">
                    <span>{vid.views}</span>
                    <span className="font-mono text-emerald-800 font-semibold">{vid.guideId}</span>
                  </div>
                  <h4 className="font-serif text-sm font-bold text-stone-900 group-hover:text-emerald-950 transition-colors leading-snug">
                    {vid.title}
                  </h4>
                  <p className="text-xs text-stone-600 line-clamp-2">
                    {vid.topic}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
