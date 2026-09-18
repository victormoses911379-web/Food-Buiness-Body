import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProductCard } from './components/ProductCard';
import { ProductDetailPage } from './components/ProductDetailPage';
import { BundleCallout } from './components/BundleCallout';
import { EducationalApproach } from './components/EducationalApproach';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessView } from './components/OrderSuccessView';
import { OrderLookupModal } from './components/OrderLookupModal';
import { AdminDashboard } from './components/AdminDashboard';
import { LegalModal, LegalPageType } from './components/LegalModal';
import { YouTubeModal } from './components/YouTubeModal';
import { BookReaderModal } from './components/BookReaderModal';
import { Footer } from './components/Footer';
import { Product, Order } from './types';
import { Sparkles, ArrowRight, BookOpen, Layers, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'home' | 'shop' | 'product' | 'order-success' | 'admin'>('home');
  const [activeSlug, setActiveSlug] = useState<string>('complete-egg-health-guide');
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  // Modals
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);
  const [legalModalType, setLegalModalType] = useState<LegalPageType | null>(null);
  const [isLookupOpen, setIsLookupOpen] = useState(false);
  const [isYouTubeOpen, setIsYouTubeOpen] = useState(false);
  const [readingProduct, setReadingProduct] = useState<{ id: string; token?: string } | null>(null);

  // Shop filter
  const [shopFilter, setShopFilter] = useState<'ALL' | 'SINGLE' | 'BUNDLE'>('ALL');

  // Load products
  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.products) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Track Analytics
  const trackEvent = (eventName: any, productId?: string, productName?: string, metadata?: any) => {
    fetch('/api/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_name: eventName,
        product_id: productId,
        product_name: productName,
        url: window.location.pathname,
        metadata
      })
    }).catch(() => {});
  };

  // View navigation handler
  const handleNavigate = (view: string, slug?: string) => {
    if (view === 'product' && slug) {
      setActiveSlug(slug);
      setCurrentView('product');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      trackEvent('product_view', slug);
    } else if (view === 'shop') {
      setCurrentView('shop');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      trackEvent('page_view', undefined, 'Shop Page');
    } else if (view === 'home') {
      setCurrentView('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      trackEvent('page_view', undefined, 'Homepage');
    } else if (view === 'admin') {
      setCurrentView('admin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStartCheckout = (product: Product) => {
    trackEvent('buy_click', product.id, product.name, { price: product.price });
    setCheckoutProduct(product);
  };

  const handlePaymentSuccess = (order: Order) => {
    setCheckoutProduct(null);
    setActiveOrder(order);
    setCurrentView('order-success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentProduct = products.find(p => p.slug === activeSlug || p.id === activeSlug) || products[0];
  const bundleProduct = products.find(p => p.type === 'BUNDLE');

  const filteredShopProducts = products.filter(p => {
    if (shopFilter === 'ALL') return true;
    return p.type === shopFilter;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6] text-stone-900 selection:bg-amber-200 selection:text-stone-900">
      {/* Top Navigation */}
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenLookup={() => setIsLookupOpen(true)}
        onOpenYouTube={() => setIsYouTubeOpen(true)}
        onOpenAdmin={() => handleNavigate('admin')}
      />

      {/* Main Content Areas */}
      <main className="flex-1">
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-stone-800 border-t-transparent animate-spin mx-auto" />
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Loading Digital Publishing Catalog...
            </p>
          </div>
        ) : (
          <>
            {/* VIEW 1: HOMEPAGE (SRS Section 7, FR-001) */}
            {currentView === 'home' && (
              <div className="space-y-4 animate-fade-in">
                <Hero
                  onExplore={() => {
                    handleNavigate('shop');
                  }}
                  onWatchYouTube={() => setIsYouTubeOpen(true)}
                  onOpenBundle={() => handleNavigate('product', 'food-and-body-starter-bundle')}
                />

                {/* Featured Products Showcase */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                        Evidence-Based Library
                      </span>
                      <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mt-1">
                        Featured Digital Guides
                      </h2>
                      <p className="text-xs sm:text-sm text-stone-500 mt-1">
                        Instant single-user DRM-free PDF downloads with high-resolution vector diagrams.
                      </p>
                    </div>

                    <button
                      onClick={() => handleNavigate('shop')}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-800 hover:text-stone-950 uppercase tracking-wider underline shrink-0"
                    >
                      <span>View All Publications</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.map(product => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onViewDetails={(slug) => handleNavigate('product', slug)}
                        onQuickBuy={handleStartCheckout}
                        onOpenReader={(id) => setReadingProduct({ id })}
                      />
                    ))}
                  </div>
                </section>

                {/* Starter Bundle Callout Promo (SRS Section 3.2 & 17) */}
                <BundleCallout
                  bundleProduct={bundleProduct}
                  onViewBundle={() => handleNavigate('product', 'food-and-body-starter-bundle')}
                  onBuyBundle={handleStartCheckout}
                />

                {/* Educational Approach & YouTube Funnel (SRS Section 2 & 7) */}
                <EducationalApproach
                  onOpenYouTube={() => setIsYouTubeOpen(true)}
                  onExploreGuides={() => handleNavigate('shop')}
                />
              </div>
            )}

            {/* VIEW 2: SHOP / CATALOG (SRS Section 8, FR-002) */}
            {currentView === 'shop' && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10 animate-fade-in">
                <div className="text-center max-w-2xl mx-auto space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                    Digital Bookstore
                  </span>
                  <h1 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900">
                    The Food & Body Guide Catalog
                  </h1>
                  <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
                    Visual, evidence-based nutrition publications. Each guide includes interactive PDF formatting, clinical references, and actionable kitchen protocols.
                  </p>
                </div>

                {/* Filters */}
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => setShopFilter('ALL')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      shopFilter === 'ALL' ? 'bg-stone-900 text-white shadow-xs' : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    All Publications ({products.length})
                  </button>
                  <button
                    onClick={() => setShopFilter('SINGLE')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      shopFilter === 'SINGLE' ? 'bg-stone-900 text-white shadow-xs' : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    Single Guides ($9.99)
                  </button>
                  <button
                    onClick={() => setShopFilter('BUNDLE')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      shopFilter === 'BUNDLE' ? 'bg-emerald-900 text-white shadow-xs' : 'bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-50'
                    }`}
                  >
                    Starter Bundles (Save 17%)
                  </button>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredShopProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onViewDetails={(slug) => handleNavigate('product', slug)}
                      onQuickBuy={handleStartCheckout}
                      onOpenReader={(id) => setReadingProduct({ id })}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* VIEW 3: PRODUCT DETAIL PAGE (SRS Section 9, FR-003) */}
            {currentView === 'product' && currentProduct && (
              <ProductDetailPage
                product={currentProduct}
                onBack={() => handleNavigate('shop')}
                onBuy={handleStartCheckout}
                onOpenReader={(id) => setReadingProduct({ id })}
              />
            )}

            {/* VIEW 4: ORDER SUCCESS & DIGITAL DELIVERY (SRS FR-008 & FR-011) */}
            {currentView === 'order-success' && activeOrder && (
              <OrderSuccessView
                order={activeOrder}
                onBrowseMore={() => handleNavigate('shop')}
                onViewAdminEmails={() => handleNavigate('admin')}
                onOpenReader={(id, token) => setReadingProduct({ id, token })}
              />
            )}

            {/* VIEW 5: ADMIN DASHBOARD (SRS Section 24, 25, 26, 43, 44) */}
            {currentView === 'admin' && (
              <AdminDashboard
                onBackToStore={() => handleNavigate('home')}
                onRefreshProducts={fetchProducts}
                onOpenReader={(id) => setReadingProduct({ id })}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenLegal={(type) => setLegalModalType(type)}
        onOpenYouTube={() => setIsYouTubeOpen(true)}
        onOpenLookup={() => setIsLookupOpen(true)}
      />

      {/* MODAL 1: CHECKOUT & PAYMENT (SRS Section 11, 12, 13, 14) */}
      {checkoutProduct && (
        <CheckoutModal
          product={checkoutProduct}
          onClose={() => setCheckoutProduct(null)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* MODAL 2: ORDER LOOKUP & RE-DOWNLOAD (SRS Section 23) */}
      {isLookupOpen && (
        <OrderLookupModal
          onClose={() => setIsLookupOpen(false)}
          onSelectOrder={(order) => {
            setActiveOrder(order);
            setCurrentView('order-success');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {/* MODAL 3: YOUTUBE INTEGRATION (SRS Section 2 & 7) */}
      {isYouTubeOpen && (
        <YouTubeModal
          onClose={() => setIsYouTubeOpen(false)}
          onSelectGuide={(slug) => handleNavigate('product', slug)}
        />
      )}

      {/* MODAL 4: LEGAL & COMPLIANCE PAGES (SRS Section 28) */}
      {legalModalType && (
        <LegalModal
          pageType={legalModalType}
          onClose={() => setLegalModalType(null)}
        />
      )}

      {/* MODAL 5: INTERACTIVE BOOK & PDF READER (In-Browser Guide Viewer) */}
      {readingProduct && (
        <BookReaderModal
          productId={readingProduct.id}
          downloadToken={readingProduct.token}
          onClose={() => setReadingProduct(null)}
          onBuyNow={() => {
            const prod = products.find(p => p.id === readingProduct.id);
            setReadingProduct(null);
            if (prod) {
              handleStartCheckout(prod);
            }
          }}
        />
      )}
    </div>
  );
}
