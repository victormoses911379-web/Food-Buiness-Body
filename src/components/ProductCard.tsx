import React from 'react';
import { BookOpen, Check, ArrowRight, Sparkles } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onViewDetails: (slug: string) => void;
  onQuickBuy: (product: Product) => void;
  onOpenReader?: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetails, onQuickBuy, onOpenReader }) => {
  const isBundle = product.type === 'BUNDLE';

  return (
    <div 
      id={`product-card-${product.id}`}
      className={`group relative flex flex-col rounded-2xl bg-white border transition-all duration-200 overflow-hidden ${
        isBundle 
          ? 'border-emerald-700/40 shadow-md ring-1 ring-emerald-600/20 hover:shadow-xl' 
          : 'border-stone-200/90 shadow-xs hover:shadow-md hover:border-stone-300'
      }`}
    >
      {/* Visual Cover Image */}
      <div 
        onClick={() => onViewDetails(product.slug)}
        className="relative h-56 w-full overflow-hidden bg-stone-100 cursor-pointer"
      >
        <img
          src={product.cover_image}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/75 via-stone-950/20 to-transparent" />

        {/* Product Type & Badge */}
        <div className="absolute top-3 left-3 flex gap-2">
          {isBundle ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-700 text-white text-[11px] font-bold tracking-wide shadow-xs">
              <Sparkles className="w-3 h-3 text-amber-300" />
              COMPLETE BUNDLE (SAVE 17%)
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-md bg-stone-900/80 backdrop-blur-xs text-white text-[11px] font-semibold tracking-wide">
              {product.id}
            </span>
          )}
        </div>

        {onOpenReader && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenReader(product.id);
            }}
            className="absolute top-3 right-3 px-2 py-1 rounded-md bg-stone-900/80 hover:bg-amber-600 text-white text-[10px] font-bold flex items-center gap-1 backdrop-blur-xs transition-colors cursor-pointer z-10"
            title="Read book directly in interactive reader"
          >
            <BookOpen className="w-3 h-3 text-amber-300" />
            <span>Look Inside</span>
          </button>
        )}

        <div className="absolute bottom-3 left-3 right-3 text-white">
          <div className="text-[11px] font-medium text-stone-300 uppercase tracking-wider mb-0.5">
            {product.format.split('(')[0]}
          </div>
          <div className="font-serif text-lg font-bold leading-tight drop-shadow-xs">
            {product.name}
          </div>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          <p className="text-xs text-stone-500 font-medium">
            {product.subtitle}
          </p>
          <p className="text-sm text-stone-600 leading-relaxed line-clamp-3">
            {product.short_description}
          </p>

          {/* Quick bullet points */}
          <ul className="space-y-1.5 pt-1">
            {product.benefits.slice(0, 2).map((benefit, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-stone-600">
                <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                <span className="line-clamp-1">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Price and CTAs */}
        <div className="pt-4 border-t border-stone-100 flex items-center justify-between gap-3">
          <div>
            <span className="text-xs text-stone-400 block font-medium">Single License</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-serif text-stone-900">
                ${product.price.toFixed(2)}
              </span>
              <span className="text-xs font-semibold text-stone-500">
                {product.currency}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id={`btn-view-${product.id}`}
              onClick={() => onViewDetails(product.slug)}
              className="px-3 py-2 rounded-lg text-xs font-semibold text-stone-700 hover:text-stone-950 hover:bg-stone-100 border border-stone-200 transition-colors"
            >
              View Guide
            </button>
            <button
              id={`btn-buy-${product.id}`}
              onClick={() => onQuickBuy(product)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold text-white shadow-xs transition-all ${
                isBundle 
                  ? 'bg-emerald-800 hover:bg-emerald-700' 
                  : 'bg-stone-900 hover:bg-stone-800'
              }`}
            >
              Buy Guide
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
