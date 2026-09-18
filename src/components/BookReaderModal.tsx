import React, { useState, useEffect } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Download, 
  List, 
  Maximize2, 
  Minimize2, 
  Sun, 
  Moon, 
  Coffee,
  Search,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { BookGuide, BookPage, getGuideById } from '../data/bookContent';

interface BookReaderModalProps {
  productId: string;
  token?: string; // Optional download token if customer has purchased
  initialPage?: number;
  onClose: () => void;
}

export const BookReaderModal: React.FC<BookReaderModalProps> = ({
  productId,
  token,
  initialPage = 1,
  onClose
}) => {
  const [guide, setGuide] = useState<BookGuide | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [showToc, setShowToc] = useState<boolean>(false);
  const [themeMode, setThemeMode] = useState<'auto' | 'dark' | 'light' | 'sepia'>('auto');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSearch, setShowSearch] = useState<boolean>(false);

  useEffect(() => {
    // Resolve guide from local bundle or API
    const local = getGuideById(productId);
    if (local) {
      setGuide(local);
    } else {
      fetch(`/api/books/${productId}`)
        .then(res => res.json())
        .then(data => {
          if (data.guide) setGuide(data.guide);
        })
        .catch(err => console.error('Failed to load book guide:', err));
    }
  }, [productId]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        handleNextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        handlePrevPage();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [guide, currentPage]);

  if (!guide) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-sm text-white">
        <div className="text-center space-y-3">
          <BookOpen className="w-10 h-10 animate-bounce mx-auto text-amber-500" />
          <p className="font-serif text-lg">Opening digital publication...</p>
        </div>
      </div>
    );
  }

  const totalPages = guide.pages.length;
  const activePage: BookPage = guide.pages[currentPage - 1] || guide.pages[0];

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  // Determine styling based on page theme + user preference
  const isPageNaturallyDark = activePage.theme === 'dark' || activePage.theme === 'cover';
  
  let pageBgClass = 'bg-[#faf7f2] text-stone-900';
  let cardBgClass = 'bg-white border-stone-200';

  if (themeMode === 'dark' || (themeMode === 'auto' && isPageNaturallyDark)) {
    pageBgClass = 'bg-[#121518] text-stone-100';
    cardBgClass = 'bg-[#1a1e23] border-stone-800 text-stone-100';
  } else if (themeMode === 'sepia') {
    pageBgClass = 'bg-[#f4ecd8] text-[#3d2f1d]';
    cardBgClass = 'bg-[#eae0c8] border-[#d8cca8] text-[#3d2f1d]';
  } else {
    pageBgClass = 'bg-[#ffffff] text-stone-900';
    cardBgClass = 'bg-stone-50 border-stone-200 text-stone-900';
  }

  const downloadUrl = token 
    ? `/api/download/${token}` 
    : `/api/pdf/preview/${guide.id}`;

  // Filtered search pages
  const filteredPages = searchQuery.trim()
    ? guide.pages.filter(p => {
        const text = `${p.title} ${p.section} ${p.content.paragraphs?.join(' ') || ''} ${p.content.subsections?.map(s => s.title + ' ' + s.body).join(' ') || ''}`.toLowerCase();
        return text.includes(searchQuery.toLowerCase());
      })
    : [];

  return (
    <div className={`fixed inset-0 z-50 flex flex-col bg-stone-950/90 backdrop-blur-md overflow-hidden animate-fade-in ${isFullscreen ? 'p-0' : 'p-2 sm:p-4'}`}>
      <div 
        id="book-reader-container"
        className="flex-1 flex flex-col w-full max-w-5xl mx-auto bg-stone-900 rounded-2xl shadow-2xl border border-stone-800 overflow-hidden"
      >
        {/* TOP TOOLBAR */}
        <header className="h-14 bg-stone-950 border-b border-stone-800 px-4 flex items-center justify-between text-stone-300 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowToc(!showToc)}
              className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold ${showToc ? 'bg-amber-600 text-white' : 'hover:bg-stone-800 text-stone-300'}`}
              title="Table of Contents"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Contents</span>
            </button>

            <button
              onClick={() => setShowSearch(!showSearch)}
              className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold ${showSearch ? 'bg-amber-600 text-white' : 'hover:bg-stone-800 text-stone-300'}`}
              title="Search Book"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Search</span>
            </button>

            <div className="h-4 w-px bg-stone-800 hidden sm:block" />

            <div className="hidden md:block truncate max-w-xs lg:max-w-md">
              <span className="text-[11px] uppercase tracking-wider text-amber-500 font-bold block">
                {guide.series}
              </span>
              <h3 className="text-xs font-serif font-bold text-white truncate">
                {guide.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme selector */}
            <div className="flex items-center bg-stone-900 rounded-lg p-1 border border-stone-800 text-xs">
              <button
                onClick={() => setThemeMode('auto')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${themeMode === 'auto' ? 'bg-amber-600 text-white' : 'text-stone-400 hover:text-white'}`}
                title="Page Native Theme"
              >
                Auto
              </button>
              <button
                onClick={() => setThemeMode('light')}
                className={`p-1.5 rounded transition-colors ${themeMode === 'light' ? 'bg-amber-600 text-white' : 'text-stone-400 hover:text-white'}`}
                title="Light Mode"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setThemeMode('sepia')}
                className={`p-1.5 rounded transition-colors ${themeMode === 'sepia' ? 'bg-amber-600 text-white' : 'text-stone-400 hover:text-white'}`}
                title="Sepia Mode"
              >
                <Coffee className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setThemeMode('dark')}
                className={`p-1.5 rounded transition-colors ${themeMode === 'dark' ? 'bg-amber-600 text-white' : 'text-stone-400 hover:text-white'}`}
                title="Dark Mode"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Download PDF button */}
            <a
              href={downloadUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
              title="Download Complete PDF File"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Get PDF</span>
            </a>

            {/* Fullscreen button */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-white transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-rose-950/50 hover:text-rose-400 text-stone-400 transition-colors"
              title="Close Reader"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* SEARCH BAR (COLLAPSIBLE) */}
        {showSearch && (
          <div className="bg-stone-900 border-b border-stone-800 p-3 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search across all 33+ pages (e.g. cholesterol, choline, villi, fermentation, insulin)..."
                className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-stone-950 border border-stone-800 text-xs text-white focus:outline-hidden focus:border-amber-500 font-mono"
                autoFocus
              />
              <Search className="w-4 h-4 text-stone-500 absolute left-3 top-2" />
            </div>
            {searchQuery && (
              <span className="text-xs text-stone-400 shrink-0">
                Found {filteredPages.length} pages
              </span>
            )}
          </div>
        )}

        {/* MAIN READER BODY */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* TABLE OF CONTENTS DRAWER */}
          {showToc && (
            <aside className="w-72 bg-stone-950 border-r border-stone-800 flex flex-col shrink-0 z-20 animate-slide-right">
              <div className="p-3 border-b border-stone-800 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
                  Table of Contents
                </span>
                <span className="text-[11px] text-stone-400 font-mono">{totalPages} Pages</span>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1 text-xs">
                {guide.pages.map((p) => (
                  <button
                    key={p.pageNumber}
                    onClick={() => {
                      setCurrentPage(p.pageNumber);
                      setShowToc(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg transition-all flex items-start gap-2.5 ${
                      currentPage === p.pageNumber
                        ? 'bg-amber-600/20 text-amber-400 font-bold border border-amber-600/30'
                        : 'text-stone-300 hover:bg-stone-900'
                    }`}
                  >
                    <span className="font-mono text-[10px] text-stone-500 mt-0.5 w-6 shrink-0">
                      p.{p.pageNumber.toString().padStart(2, '0')}
                    </span>
                    <div className="flex-1 truncate">
                      <span className="block text-[10px] uppercase tracking-wider text-stone-500 truncate">
                        {p.section}
                      </span>
                      <span className="truncate block font-serif">
                        {p.title}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </aside>
          )}

          {/* SEARCH RESULTS DRAWER */}
          {showSearch && searchQuery && (
            <aside className="w-72 bg-stone-950 border-r border-stone-800 flex flex-col shrink-0 z-20">
              <div className="p-3 border-b border-stone-800 text-xs font-bold text-amber-400">
                Matching Pages ({filteredPages.length})
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1 text-xs">
                {filteredPages.map((p) => (
                  <button
                    key={p.pageNumber}
                    onClick={() => setCurrentPage(p.pageNumber)}
                    className="w-full text-left p-2 rounded-lg hover:bg-stone-900 text-stone-300"
                  >
                    <div className="flex items-center justify-between font-mono text-[10px] text-amber-500">
                      <span>PAGE {p.pageNumber}</span>
                      <span className="text-stone-500 uppercase">{p.section}</span>
                    </div>
                    <p className="font-serif font-bold text-white text-xs truncate mt-0.5">
                      {p.title}
                    </p>
                  </button>
                ))}
              </div>
            </aside>
          )}

          {/* BOOK PAGE DISPLAY STAGE */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-8 flex items-center justify-center bg-stone-900/50">
            <article 
              className={`w-full max-w-2xl min-h-[640px] rounded-xl shadow-2xl p-6 sm:p-10 transition-colors duration-200 border flex flex-col justify-between ${pageBgClass}`}
            >
              {/* PAGE TOP HEADER */}
              <div>
                <div className="flex items-center justify-between border-b pb-3 mb-6 text-[10px] uppercase tracking-wider opacity-60">
                  <span className="font-bold">{guide.series}</span>
                  <span className="font-mono">{activePage.section}</span>
                </div>

                {/* COVER PAGE SPECIFIC LAYOUT */}
                {activePage.pageNumber === 1 ? (
                  <div className="text-center py-10 space-y-6">
                    <div className="w-16 h-1 bg-amber-500 mx-auto rounded-full" />
                    <span className="text-xs uppercase tracking-widest font-bold text-amber-500 block">
                      {guide.series}
                    </span>
                    <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
                      {guide.title}
                    </h1>
                    <p className="font-serif italic text-base sm:text-lg text-amber-600 max-w-lg mx-auto">
                      {guide.subtitle}
                    </p>

                    <div className="my-8 p-6 rounded-xl border border-stone-700/40 bg-black/10 max-w-md mx-auto text-left space-y-3">
                      <span className="text-[11px] uppercase tracking-wider font-bold text-amber-500 block">
                        Official Digital Edition
                      </span>
                      <p className="text-xs leading-relaxed opacity-80">
                        {guide.pages[1]?.content?.paragraphs?.[0] || 'Complete evidence-based physiological guide.'}
                      </p>
                      <div className="pt-2 border-t border-stone-700/30 flex items-center justify-between text-[11px] font-mono text-stone-400">
                        <span>{totalPages} Visual Pages</span>
                        <span>Full Resolution Vector</span>
                      </div>
                    </div>

                    <button
                      onClick={handleNextPage}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
                    >
                      <span>Begin Reading</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  /* REGULAR CONTENT PAGE LAYOUT */
                  <div className="space-y-5">
                    {/* Page Title & Subtitle */}
                    <div>
                      <h2 className="font-serif text-2xl sm:text-3xl font-bold leading-tight">
                        {activePage.title}
                      </h2>
                      {activePage.subtitle && (
                        <p className="font-serif italic text-sm text-amber-600 mt-1">
                          {activePage.subtitle}
                        </p>
                      )}
                    </div>

                    {/* Visual Flow Steps if available */}
                    {activePage.content.flowSteps && (
                      <div className="flex flex-wrap items-center gap-2 p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-xs font-bold text-amber-600 font-mono">
                        {activePage.content.flowSteps.map((step, idx) => (
                          <React.Fragment key={idx}>
                            <span>{step}</span>
                            {idx < (activePage.content.flowSteps?.length || 0) - 1 && (
                              <span className="text-stone-400">→</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    )}

                    {/* Paragraphs */}
                    {activePage.content.paragraphs && (
                      <div className="space-y-3 text-sm leading-relaxed opacity-90">
                        {activePage.content.paragraphs.map((p, idx) => (
                          <p key={idx}>{p}</p>
                        ))}
                      </div>
                    )}

                    {/* Subsections (Cards) */}
                    {activePage.content.subsections && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        {activePage.content.subsections.map((sub, idx) => (
                          <div 
                            key={idx}
                            className={`p-4 rounded-xl border text-xs leading-relaxed space-y-1.5 shadow-2xs ${cardBgClass}`}
                          >
                            <h4 className="font-bold uppercase tracking-wider text-amber-600 text-[11px]">
                              {sub.title}
                            </h4>
                            <p className="opacity-80">{sub.body}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Bullet Points */}
                    {activePage.content.bullets && (
                      <ul className="space-y-2 text-xs leading-relaxed pl-2">
                        {activePage.content.bullets.map((b, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-amber-500 font-bold mt-0.5">•</span>
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Data Table */}
                    {activePage.content.table && (
                      <div className="overflow-x-auto rounded-xl border border-stone-300 dark:border-stone-700 shadow-2xs my-4">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-stone-200/60 dark:bg-stone-800 text-[11px] uppercase tracking-wider font-bold">
                            <tr>
                              {activePage.content.table.headers.map((h, idx) => (
                                <th key={idx} className="p-2.5">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                            {activePage.content.table.rows.map((row, rIdx) => (
                              <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-black/5' : ''}>
                                <td className="p-2.5 font-medium">{row[0]}</td>
                                <td className="p-2.5 font-mono font-bold text-amber-600">{row[1]}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* FAQ Items */}
                    {activePage.content.faqItems && (
                      <div className="space-y-3 text-xs pt-2">
                        {activePage.content.faqItems.map((faq, idx) => (
                          <div key={idx} className={`p-3.5 rounded-xl border space-y-1 ${cardBgClass}`}>
                            <span className="font-bold text-amber-600 block">
                              Q: {faq.question}
                            </span>
                            <p className="opacity-80 leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Callout Box */}
                    {activePage.content.callout && (
                      <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-500/10 text-xs space-y-1 my-3 shadow-2xs">
                        <span className="font-bold uppercase tracking-wider text-amber-600 text-[10px] block">
                          {activePage.content.callout.title}
                        </span>
                        <p className="opacity-90 leading-relaxed whitespace-pre-line">
                          {activePage.content.callout.text}
                        </p>
                      </div>
                    )}

                    {/* Standout Quote */}
                    {activePage.content.quote && (
                      <blockquote className="border-l-3 border-amber-500 pl-4 py-1 font-serif italic text-sm text-amber-600 my-4">
                        {activePage.content.quote}
                      </blockquote>
                    )}
                  </div>
                )}
              </div>

              {/* PAGE BOTTOM FOOTER */}
              <div className="pt-6 border-t mt-8 flex items-center justify-between text-[11px] font-mono opacity-60">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="truncate max-w-[200px]">{guide.title}</span>
                </div>
                <span className="font-bold">
                  PAGE {activePage.pageNumber.toString().padStart(2, '0')} / {totalPages}
                </span>
              </div>
            </article>
          </main>
        </div>

        {/* BOTTOM PAGINATION BAR */}
        <footer className="h-14 bg-stone-950 border-t border-stone-800 px-4 flex items-center justify-between text-stone-300 shrink-0">
          <button
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-semibold transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Previous Page</span>
          </button>

          {/* Page slider and counter */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-stone-400">
              Page <strong className="text-white">{currentPage}</strong> of {totalPages}
            </span>
            <input
              type="range"
              min={1}
              max={totalPages}
              value={currentPage}
              onChange={(e) => setCurrentPage(Number(e.target.value))}
              className="w-24 sm:w-48 h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          <button
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-semibold transition-colors cursor-pointer"
          >
            <span className="hidden sm:inline">Next Page</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </footer>
      </div>
    </div>
  );
};
