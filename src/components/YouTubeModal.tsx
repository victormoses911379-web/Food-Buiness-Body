import React from 'react';
import { X, Youtube, Play, Users, ExternalLink, ArrowRight } from 'lucide-react';

interface YouTubeModalProps {
  onClose: () => void;
  onSelectGuide: (slug: string) => void;
}

export const YouTubeModal: React.FC<YouTubeModalProps> = ({ onClose, onSelectGuide }) => {
  const featuredVideos = [
    {
      title: 'What 3 Eggs a Day Actually Does to Your Arteries (ApoB & LDL Explained)',
      duration: '14:22',
      views: '1.4M views',
      slug: 'complete-egg-health-guide',
      guideName: 'The Complete Egg Health Guide',
      synopsis: 'Visual analysis of hepatic sterol balance, the myth of the dietary cholesterol ceiling, and the vital role of choline.'
    },
    {
      title: 'The Hidden Sugar Molecule Map: Why Fructose Traps Visceral Liver Fat',
      duration: '18:05',
      views: '890K views',
      slug: 'sugar-and-your-body',
      guideName: 'Sugar & Your Body',
      synopsis: 'Tracing postprandial glucose curves, GLUT4 resistance, and decoding the 56 deceptive names of industrial sugars.'
    },
    {
      title: 'What Happens in Your Colon When You Eat 30 Unique Plants a Week',
      duration: '16:40',
      views: '1.1M views',
      slug: 'complete-fiber-guide',
      guideName: 'The Complete Fiber Guide',
      synopsis: 'Short-chain fatty acid synthesis, butyrate as primary fuel for colonocytes, and how to increase fiber without bloating.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white border border-stone-200 shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Top Channel Banner */}
        <div className="bg-stone-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 flex items-center justify-center text-stone-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-rose-600 flex items-center justify-center shadow-md">
              <Youtube className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold">Food & Body YouTube Channel</h3>
              <div className="flex items-center gap-2 text-xs text-stone-400">
                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> 1.2M Subscribers</span>
                <span>•</span>
                <span>Evidence-Based Visual Nutrition</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-stone-300 leading-relaxed max-w-lg mt-2">
            Our YouTube channel turns complex human biology into captivating 3D animations. Our companion digital guides provide the detailed protocols, meal maps, and clinical citations.
          </p>
        </div>

        {/* Video List */}
        <div className="p-6 overflow-y-auto space-y-4">
          <span className="text-xs uppercase font-bold tracking-wider text-stone-500 block">
            Most Watched Documentary Episodes:
          </span>

          <div className="space-y-3">
            {featuredVideos.map((video, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-stone-200 bg-stone-50/80 hover:bg-stone-100/80 transition-colors space-y-2"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 text-[11px] text-stone-500 font-medium">
                      <span className="text-rose-600 font-bold flex items-center gap-1">
                        <Play className="w-3 h-3 fill-rose-600" /> Episode {idx + 1}
                      </span>
                      <span>•</span>
                      <span>{video.views}</span>
                      <span>•</span>
                      <span className="font-mono">{video.duration}</span>
                    </div>
                    <h4 className="font-serif text-sm font-bold text-stone-900 leading-snug">
                      {video.title}
                    </h4>
                    <p className="text-xs text-stone-600">
                      {video.synopsis}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between">
                  <span className="text-[11px] text-stone-500">
                    Companion Publication: <strong>{video.guideName}</strong>
                  </span>
                  <button
                    onClick={() => {
                      onClose();
                      onSelectGuide(video.slug);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-950"
                  >
                    <span>View Guide</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between text-xs text-stone-500 shrink-0">
          <span>Free content drives discovery; digital guides provide the complete lifelong blueprint.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-stone-900 text-white font-semibold hover:bg-stone-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
