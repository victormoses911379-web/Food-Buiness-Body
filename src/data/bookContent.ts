export interface BookPage {
  pageNumber: number;
  section: string;
  title: string;
  subtitle?: string;
  theme?: 'dark' | 'light' | 'cover';
  content: {
    paragraphs?: string[];
    bullets?: string[];
    subsections?: { title: string; body: string }[];
    table?: { headers: string[]; rows: string[][] };
    callout?: { title: string; text: string; type?: 'info' | 'warning' | 'tip' };
    quote?: string;
    flowSteps?: string[];
    faqItems?: { question: string; answer: string }[];
  };
}

export interface BookGuide {
  id: string;
  title: string;
  subtitle: string;
  series: string;
  totalPages: number;
  coverImage?: string;
  pages: BookPage[];
}

export { EGG_HEALTH_GUIDE, FIBER_GUIDE, SUGAR_GUIDE, ALL_GUIDES, getGuideById } from '../../server/bookContent';
