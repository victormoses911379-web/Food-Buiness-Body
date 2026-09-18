import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Check, 
  Download, 
  FileText, 
  ShieldCheck, 
  HelpCircle, 
  AlertCircle, 
  Sparkles, 
  ChevronRight,
  Eye,
  Layers,
  BookOpen
} from 'lucide-react';
import { Product } from '../types';

interface ProductDetailPageProps {
  product: Product;
  onBack: () => void;
  onBuy: (product: Product) => void;
  onOpenReader?: (productId: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ product, onBack, onBuy, onOpenReader }) => {
  const [selectedPreviewIndex, setSelectedPreviewIndex] = useState(0);
  const isBundle = product.type === 'BUNDLE';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Navigation Breadcrumb */}
      <button
        id="btn-back-to-guides"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-stone-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Guides</span>
      </button>

      {/* Top Product Hero Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Left Column: Visual Cover & Interactive Page Previews */}
        <div className="lg:col-span-6 space-y-6">
          <div className="relative rounded-2xl overflow-hidden bg-stone-900 shadow-xl border border-stone-800">
            <div className="h-80 sm:h-96 w-full relative">
              <img
                src={product.cover_image}
                alt={product.name}
                className="w-full h-full object-cover object-center opacity-85"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/30 to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                <span className="inline-block px-2.5 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-[10px] uppercase font-bold tracking-wider mb-2">
                  {product.id} • {product.pages} Pages
                </span>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold leading-tight">
                  {product.name}
                </h1>
                <p className="text-sm text-stone-300">
                  {product.subtitle}
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Page Previews (SRS FR-003: Preview images) */}
          {product.preview_pages && product.preview_pages.length > 0 && (
            <div className="rounded-xl border border-stone-200 bg-white p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-700">
                  <Eye className="w-4 h-4 text-emerald-700" />
                  <span>Interactive Sample Pages</span>
                </div>
                <span className="text-xs text-stone-500 font-medium">
                  Page {product.preview_pages[selectedPreviewIndex].pageNumber} of {product.pages}
                </span>
              </div>

              {/* Selected Preview Box */}
              <div className="p-4 rounded-lg bg-stone-50 border border-stone-200/90 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-stone-900">
                    {product.preview_pages[selectedPreviewIndex].title}
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    {product.preview_pages[selectedPreviewIndex].highlight}
                  </span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {product.preview_pages[selectedPreviewIndex].caption}
                </p>
              </div>

              {/* Preview Page Selector Tabs */}
              <div className="grid grid-cols-3 gap-2">
                {product.preview_pages.map((preview, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedPreviewIndex(idx)}
                    className={`p-2.5 rounded-lg text-left text-xs font-medium border transition-all ${
                      selectedPreviewIndex === idx
                        ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                        : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <span className="block text-[10px] text-stone-400 font-mono">Sample {idx + 1}</span>
                    <span className="truncate block font-semibold">{preview.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Pricing, Overview & Purchase CTA */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                {product.type === 'BUNDLE' ? '3-in-1 Master Bundle' : 'Single Visual Guide'}
              </span>
              <span className="text-xs text-stone-500 font-medium">
                {product.format}
              </span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight leading-tight">
              {product.name}
            </h2>
            <p className="text-base text-stone-600 font-medium">
              {product.subtitle}
            </p>
          </div>

          {/* Pricing Card */}
          <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider text-stone-500 font-bold block">
                  One-Time Purchase
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl font-serif font-bold text-stone-900">
                    ${product.price.toFixed(2)}
                  </span>
                  <span className="text-sm font-semibold text-stone-500">
                    {product.currency}
                  </span>
                  {isBundle && (
                    <span className="text-xs text-stone-400 line-through">
                      $29.97
                    </span>
                  )}
                </div>
              </div>

              {isBundle && (
                <div className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                  Save $4.98
                </div>
              )}
            </div>

            <p className="text-xs text-stone-500">
              Immediate digital delivery via PDF stream and email backup link. No subscription or recurring fees.
            </p>

            <button
              id={`pdp-buy-btn-${product.id}`}
              onClick={() => onBuy(product)}
              className="w-full py-3.5 px-6 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm tracking-wide shadow-md transition-all hover:translate-y-[-1px] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>GET THE GUIDE — ${product.price.toFixed(2)}</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            {onOpenReader && (
              <div className="flex gap-2">
                <button
                  type="button"
                  id={`pdp-reader-btn-${product.id}`}
                  onClick={() => onOpenReader(product.id)}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-stone-300 hover:border-amber-600 hover:bg-amber-50/50 text-stone-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-amber-600" />
                  <span>Look Inside Guide</span>
                </button>
                <a
                  href={`/api/pdf/preview/${product.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-xl border border-stone-300 hover:border-emerald-600 hover:bg-emerald-50/50 text-stone-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  title="Open sample PDF in new tab"
                >
                  <Download className="w-4 h-4 text-emerald-700" />
                  <span>PDF Preview</span>
                </a>
              </div>
            )}

            {/* Quick trust metrics */}
            <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-stone-500 font-medium border-t border-stone-100">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>14-Day Money Back</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5 text-emerald-700" />
                <span>Instant PDF Download</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900">
              Overview
            </h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Product Benefits (FR-003) */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900">
              Key Biological Discoveries
            </h3>
            <div className="grid grid-cols-1 gap-2.5">
              {product.benefits.map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-700">
                  <div className="mt-0.5 w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-emerald-700" />
                  </div>
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* What's Included Section (FR-003) */}
      <div className="mt-16 pt-12 border-t border-stone-200">
        <div className="max-w-3xl space-y-6">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-800">
              Comprehensive Curriculum
            </span>
            <h3 className="font-serif text-2xl font-bold text-stone-900 mt-1">
              What's Included in This Publication
            </h3>
          </div>

          <div className="divide-y divide-stone-200 rounded-xl border border-stone-200 bg-white overflow-hidden shadow-xs">
            {product.what_is_included.map((item, idx) => (
              <div key={idx} className="p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-stone-100 text-stone-800 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                  {item.chapter}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-stone-900">{item.title}</h4>
                    <span className="text-xs text-stone-400 font-mono">{item.pages}</span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions (FR-003) */}
      {product.faqs && product.faqs.length > 0 && (
        <div className="mt-16 pt-12 border-t border-stone-200">
          <div className="max-w-3xl space-y-6">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-emerald-800">
                Common Questions
              </span>
              <h3 className="font-serif text-2xl font-bold text-stone-900 mt-1">
                Frequently Asked Questions
              </h3>
            </div>

            <div className="space-y-4">
              {product.faqs.map((faq, idx) => (
                <div key={idx} className="p-5 rounded-xl border border-stone-200 bg-white space-y-2 shadow-xs">
                  <div className="flex items-start gap-2.5 text-sm font-bold text-stone-900">
                    <HelpCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <span>{faq.question}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed pl-6.5">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mandatory Health Disclaimer (SRS Section 9 & 28) */}
      <div className="mt-16 pt-8 border-t border-stone-200">
        <div className="p-5 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3 text-xs text-amber-950">
          <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block uppercase tracking-wider text-[11px] text-amber-900">
              Evidence-Based Health Disclaimer
            </span>
            <p className="leading-relaxed text-amber-900/90">
              The content in this digital guide is provided strictly for educational and informational purposes. It does not constitute medical advice, diagnosis, or personalized treatment plans. Always consult your personal physician or licensed healthcare provider before making major modifications to your diet or medical regimen.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
