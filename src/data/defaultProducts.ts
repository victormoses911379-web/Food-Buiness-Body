import { Product } from '../types';

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'EGG-001',
    name: 'The Complete Egg Health Guide',
    slug: 'complete-egg-health-guide',
    subtitle: 'What Happens Inside Your Body When You Eat Eggs',
    short_description: 'A visual guide to egg nutrition, digestion, cholesterol, and safety.',
    description: 'An evidence-based, highly visual breakdown of dietary cholesterol versus serum lipids, choline synthesis for neural vitality, lutein bioavailability, and optimal culinary temperature protocols.',
    price: 9.99,
    currency: 'USD',
    type: 'SINGLE',
    status: 'PUBLISHED',
    cover_image: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=800&auto=format&fit=crop&q=80',
    file_reference: 'private/storage/egg-guide.pdf',
    pages: 48,
    format: 'Digital PDF (Interactive & Printable • DRM Free)',
    benefits: [
      'Visual breakdown of HMG-CoA reductase and hepatic cholesterol compensation',
      'The 300mg choline threshold for liver detox & acetylcholine memory pathways',
      'Macular carotenoids: 3x absorption mechanics in natural lipid matrix',
      'Safe cooking temperatures: preventing oxidized sterol formation'
    ],
    what_is_included: [
      { chapter: '01', title: 'The Anatomy of an Egg', description: 'Yolk vs. albumen breakdown, phospholipid matrix, and bioavailability rankings.', pages: 'p. 4-11' },
      { chapter: '02', title: 'Cholesterol Demystified', description: 'LDL particle sizing (Pattern A vs. B), HDL remodeling, and ApoB markers.', pages: 'p. 12-22' },
      { chapter: '03', title: 'Brain & Liver Biochemistry', description: 'Phosphatidylcholine transport, cell membrane fluidity, and methylation.', pages: 'p. 23-33' },
      { chapter: '04', title: 'Culinary Chemistry & Safety', description: 'Heat thresholds, raw vs cooked avidin binding, and pasture quality standards.', pages: 'p. 34-48' }
    ],
    preview_pages: [
      { pageNumber: 8, title: 'Lipid Suspension Matrix', caption: 'How egg yolk phospholipids encapsulate fat-soluble vitamins A, D, E, K.', highlight: '300% Carotenoid Bioavailability' },
      { pageNumber: 17, title: 'Hepatic Cholesterol Balance', caption: 'Cellular feedback loop between dietary sterols and liver biosynthesis.', highlight: '70% of People are Hypo-Responders' },
      { pageNumber: 28, title: 'The Choline Pathway', caption: 'From digestive lumen to phosphatidylcholine synthesis in hepatocytes.', highlight: 'Critical for Cell Membrane Integrity' }
    ],
    faqs: [
      { question: 'Will the cholesterol in eggs increase my risk of heart disease?', answer: 'Extensive randomized controlled trials demonstrate that dietary cholesterol has minimal impact on serum LDL-C in 70%+ of individuals. This guide details the exact hepatic feedback mechanism.' },
      { question: 'How is this delivered?', answer: 'Instant PDF download upon checkout, plus a secure link sent to your email with lifetime access on all your devices.' },
      { question: 'Can I print this guide?', answer: 'Yes! The PDF is rendered at 300 DPI high-definition vector typography, formatted perfectly for A4/Letter home printing or iPad/tablet reading.' }
    ],
    created_at: new Date('2026-09-01T10:00:00Z').toISOString(),
    updated_at: new Date('2026-09-01T10:00:00Z').toISOString()
  },
  {
    id: 'SUG-001',
    name: 'Sugar & Your Body',
    slug: 'sugar-and-your-body',
    subtitle: 'The Metabolic Guide to Fructose, Glucose & Cellular Energy',
    short_description: 'A visual blueprint of blood sugar spikes, insulin resistance, cravings, and hidden sugars.',
    description: 'Discover the cellular mechanics of glycemic volatility, hepatic fructose conversion, advanced glycation end-products, and a 14-day protocol to break free from reactive afternoon crashes.',
    price: 9.99,
    currency: 'USD',
    type: 'SINGLE',
    status: 'PUBLISHED',
    cover_image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&auto=format&fit=crop&q=80',
    file_reference: 'private/storage/sugar-guide.pdf',
    pages: 52,
    format: 'Digital PDF (Interactive & Printable • DRM Free)',
    benefits: [
      'Visual glucose curve analysis: spikes vs gentle sustained energy plateaus',
      'The hepatic fructose bottleneck: why the liver metabolizes fructose like ethanol',
      'Craving neurology: dopamine surges in the nucleus accumbens',
      'Ingredient decoder: uncovering the 56 industrial aliases of added sugar'
    ],
    what_is_included: [
      { chapter: '01', title: 'The Carbohydrate Spectrum', description: 'Monosaccharides vs polysaccharides, molecular bonds, and salivary amylase.', pages: 'p. 4-13' },
      { chapter: '02', title: 'The Post-Meal Glucose Rollercoaster', description: 'Insulin secretion, GLUT4 translocation, and reactive hypoglycemia crashes.', pages: 'p. 14-25' },
      { chapter: '03', title: 'Fructose & Fatty Liver Dynamics', description: 'De novo lipogenesis, uric acid accumulation, and visceral fat storage.', pages: 'p. 26-38' },
      { chapter: '04', title: 'The 14-Day Reset Blueprint', description: 'Savory breakfast structures, fiber sequencing, and label translation tools.', pages: 'p. 39-52' }
    ],
    preview_pages: [
      { pageNumber: 12, title: 'The 3:30 PM Craving Loop', caption: 'Step-by-step hormone cascade following a high-glycemic lunchtime meal.', highlight: 'Reactive Hypoglycemia Explained' },
      { pageNumber: 24, title: 'Fructose vs Glucose Metabolic Route', caption: 'Why glucose distributes to muscle glycogen while fructose is trapped in liver cells.', highlight: 'Hepatic De Novo Lipogenesis' },
      { pageNumber: 42, title: 'Food Order Sequencing', caption: 'Consuming vegetables and protein before carbs reduces peak glucose spike by 40%.', highlight: 'Meal Sequencing Blueprint' }
    ],
    faqs: [
      { question: 'Do I have to eliminate all fruit and carbohydrates?', answer: 'No. The guide highlights the critical difference between cellular fruit sugars bound in fibrous plant cells vs acellular refined sugars in processed foods.' },
      { question: 'Is this suitable for pre-diabetics?', answer: 'Yes, the visual diagrams make insulin sensitivity and postprandial glucose regulation extraordinarily easy to understand.' }
    ],
    created_at: new Date('2026-09-02T10:00:00Z').toISOString(),
    updated_at: new Date('2026-09-02T10:00:00Z').toISOString()
  },
  {
    id: 'FIB-001',
    name: 'The Complete Fiber Guide',
    slug: 'complete-fiber-guide',
    subtitle: 'The Microbiome, Digestion & Gut Health Blueprint',
    short_description: 'A visual guide to gut flora, short-chain fatty acids, digestive transit, and gut barrier integrity.',
    description: 'Transform your digestive vitality with visual mappings of soluble vs insoluble fiber fermentation, butyrate fuel for colonocytes, microbiome diversity, and bloating reduction protocols.',
    price: 9.99,
    currency: 'USD',
    type: 'SINGLE',
    status: 'PUBLISHED',
    cover_image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
    file_reference: 'private/storage/fiber-guide.pdf',
    pages: 56,
    format: 'Digital PDF (Interactive & Printable • DRM Free)',
    benefits: [
      'Visual distinction: viscous, fermentable, prebiotic vs insoluble structural fiber',
      'The SCFA powerhouse: how butyrate fuels colonocytes and tight junctions',
      'The 30-plants-per-week microbiome diversity target',
      'Gentle titration protocol: how to increase fiber without gas or bloating'
    ],
    what_is_included: [
      { chapter: '01', title: 'The Intestinal Architecture', description: 'Mucosal layer, villi, microvilli, and gut-associated lymphoid tissue (GALT).', pages: 'p. 4-14' },
      { chapter: '02', title: 'The Microbial Fermentation Factory', description: 'Bacteroidetes vs Firmicutes, bacterial enzymes, and gas synthesis.', pages: 'p. 15-28' },
      { chapter: '03', title: 'Short-Chain Fatty Acids (SCFAs)', description: 'Acetate, propionate, and butyrate signalling across the gut-brain axis.', pages: 'p. 29-41' },
      { chapter: '04', title: 'The Gradual Titration Roadmap', description: '5-gram stepwise increments, hydration pairings, and low-FODMAP swaps.', pages: 'p. 42-56' }
    ],
    preview_pages: [
      { pageNumber: 15, title: 'The Mucus Barrier & Butyrate', caption: 'How short-chain fatty acids nourish epithelial enterocytes to prevent leaky gut.', highlight: '70% of Colon Energy from Butyrate' },
      { pageNumber: 27, title: 'Soluble vs Insoluble Comparison', caption: 'Gel formation in the small intestine vs peristaltic propulsion in the colon.', highlight: 'Viscous Gel vs Bulk Propulsion' },
      { pageNumber: 48, title: 'The Bloat-Free Escalation Plan', caption: 'Stepwise guide to increasing daily fiber from 15g to 35g over four weeks.', highlight: '5g Every 5 Days Titration' }
    ],
    faqs: [
      { question: 'Why do high-fiber foods sometimes make me bloated?', answer: 'When fiber-starved gut bacteria suddenly receive large amounts of prebiotic oligosaccharides, rapid fermentation creates gas. The guide provides a gentle titration strategy to prevent this completely.' },
      { question: 'How much fiber do I actually need?', answer: 'The evolutionary ancestral estimate is 40-100g/day, while the modern Western average is only 15g. We help you target a realistic 30-38g/day.' }
    ],
    created_at: new Date('2026-09-03T10:00:00Z').toISOString(),
    updated_at: new Date('2026-09-03T10:00:00Z').toISOString()
  },
  {
    id: 'BND-001',
    name: 'Food & Body Starter Bundle',
    slug: 'food-and-body-starter-bundle',
    subtitle: 'The Complete 3-Guide Nutrition & Biology Master Collection',
    short_description: 'Includes all 3 foundational guides: Egg Health, Sugar Metabolism, and Fiber & Gut Microbiome.',
    description: 'The ultimate visual library for understanding human metabolism, gastrointestinal biology, and evidence-based nutrition. Includes The Complete Egg Health Guide, Sugar & Your Body, and The Complete Fiber Guide. Save 17% compared to purchasing individually.',
    price: 24.99,
    currency: 'USD',
    type: 'BUNDLE',
    status: 'PUBLISHED',
    cover_image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&auto=format&fit=crop&q=80',
    file_reference: 'private/storage/bundle-starter.zip',
    bundle_item_ids: ['EGG-001', 'SUG-001', 'FIB-001'],
    pages: 156,
    format: '3 Complete Digital PDFs (Instant Download • DRM-Free)',
    benefits: [
      'Access all 3 guides instantly with 1 single purchase and order',
      'Over 150+ full-color visual diagrams, charts, and biochemical pathways',
      'Saves $4.98 compared to buying guides separately',
      'Covers lipids, energy metabolism, glucose, and gut microbiome in one library'
    ],
    what_is_included: [
      { chapter: 'GUIDE 1', title: 'The Complete Egg Health Guide (48 pages)', description: 'Cholesterol synthesis, choline pathways, and cooking science.', pages: 'p. 1-48' },
      { chapter: 'GUIDE 2', title: 'Sugar & Your Body (52 pages)', description: 'Fructose metabolism, insulin spikes, cravings, and reset roadmap.', pages: 'p. 1-52' },
      { chapter: 'GUIDE 3', title: 'The Complete Fiber Guide (56 pages)', description: 'Microbiome diversity, SCFA butyrate, and titration schedule.', pages: 'p. 1-56' }
    ],
    preview_pages: [
      { pageNumber: 1, title: 'Egg Lipids & Neurotransmitters', caption: 'Part of The Complete Egg Health Guide visual suite.', highlight: 'Included in Bundle' },
      { pageNumber: 2, title: 'Glucose Waveform Analysis', caption: 'Part of Sugar & Your Body metabolic breakdown.', highlight: 'Included in Bundle' },
      { pageNumber: 3, title: 'Microbiome Fermentation Map', caption: 'Part of The Complete Fiber Guide gut barrier chapter.', highlight: 'Included in Bundle' }
    ],
    faqs: [
      { question: 'Do I get access to all 3 individual PDFs?', answer: 'Yes! Upon checkout, your account receives download tokens for each of the 3 guides (Egg, Sugar, and Fiber). You can download them individually or all together.' },
      { question: 'Is this a recurring subscription or a one-time purchase?', answer: 'It is a strictly one-time payment of $24.99 with lifetime access, free updates, and no recurring fees.' }
    ],
    created_at: new Date('2026-09-04T10:00:00Z').toISOString(),
    updated_at: new Date('2026-09-04T10:00:00Z').toISOString()
  }
];
