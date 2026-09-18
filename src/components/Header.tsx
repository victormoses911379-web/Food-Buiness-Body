import React from 'react';
import { BookOpen, Sparkles, Youtube, ShieldCheck, Search, SlidersHorizontal } from 'lucide-react';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string, slug?: string) => void;
  onOpenLookup: () => void;
  onOpenYouTube: () => void;
  onOpenAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onOpenLookup,
  onOpenYouTube,
  onOpenAdmin
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#faf9f6]/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div 
            id="brand-logo"
            onClick={() => onNavigate('home')} 
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-9 h-9 rounded-lg bg-stone-900 text-stone-100 flex items-center justify-center font-serif text-lg font-bold shadow-xs group-hover:bg-emerald-950 transition-colors">
              F<span className="text-amber-400 font-sans text-xs ml-0.5">&</span>B
            </div>
            <div>
              <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-stone-900 block leading-tight">
                FOOD & BODY
              </span>
              <span className="text-[10px] tracking-wider uppercase font-semibold text-stone-500 block">
                Evidence-Based Guides
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600">
            <button
              id="nav-home"
              onClick={() => onNavigate('home')}
              className={`transition-colors hover:text-stone-950 ${currentView === 'home' ? 'text-stone-950 font-semibold' : ''}`}
            >
              Home
            </button>
            <button
              id="nav-shop"
              onClick={() => onNavigate('shop')}
              className={`transition-colors hover:text-stone-950 ${currentView === 'shop' ? 'text-stone-950 font-semibold' : ''}`}
            >
              Browse Guides
            </button>
            <button
              id="nav-bundle"
              onClick={() => onNavigate('product', 'food-and-body-starter-bundle')}
              className="inline-flex items-center gap-1.5 text-emerald-800 hover:text-emerald-950 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full text-xs border border-emerald-200/60 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Starter Bundle (Save 17%)
            </button>
            <button
              id="nav-methodology"
              onClick={() => {
                onNavigate('home');
                setTimeout(() => {
                  document.getElementById('methodology-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="transition-colors hover:text-stone-950"
            >
              Why Visual Guides?
            </button>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              id="btn-find-order"
              onClick={onOpenLookup}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-stone-700 hover:text-stone-950 hover:bg-stone-100 border border-stone-200 transition-colors"
              title="Look up previous orders and download links"
            >
              <Search className="w-3.5 h-3.5 text-stone-500" />
              <span className="hidden sm:inline">Find My Order</span>
            </button>

            <button
              id="btn-youtube-channel"
              onClick={onOpenYouTube}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200/60 transition-colors"
            >
              <Youtube className="w-3.5 h-3.5 text-rose-600" />
              <span>YouTube Channel</span>
            </button>

            <button
              id="btn-admin-portal"
              onClick={onOpenAdmin}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                currentView === 'admin' 
                  ? 'bg-stone-900 text-stone-100 border-stone-900' 
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100 border-stone-200'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
