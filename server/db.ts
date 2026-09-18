import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Product, Order, OrderItem, DownloadToken, User, EmailLog, AnalyticsEvent, PaymentSettings, ManualPaymentSubmission } from '../src/types';
import {
  syncPaymentToFirestore,
  updatePaymentStatusInFirestore,
  syncSettingsToFirestore,
  getPaymentFromFirestore,
  isFirestoreActive
} from './firebase';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

export const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  naira: {
    enabled: true,
    method_name: 'Nigerian Naira (₦)',
    account_name: 'Victor Moses',
    bank_name: 'Guaranty Trust Bank (GTBank)',
    account_number: '0123456789',
    currency: 'NGN',
    instructions: `1. Transfer the exact amount in NGN to the bank account above.
2. Copy the session/transaction reference or narration ID from your banking app receipt.
3. Return to this form, optionally attach your payment screenshot, and submit.
4. Once verified by our team, your PDF download will unlock immediately.`,
    naira_rate: 1500
  },
  paypal: {
    enabled: true,
    method_name: 'PayPal',
    account_name: 'Victor Moses',
    email: 'payments@foodandbodypub.com',
    currency: 'USD',
    instructions: `1. Send payment via PayPal to the email address above using Goods & Services or Personal Transfer.
2. Note your PayPal Transaction ID from your payment confirmation receipt.
3. Return to this form, fill out your transaction ID, and optionally attach a screenshot of your PayPal receipt.
4. Our team will verify and unlock your digital guide.`
  },
  crypto: {
    enabled: true,
    method_name: 'Crypto',
    instructions: `1. Select your preferred cryptocurrency from the options below.
2. Send the equivalent amount to the designated wallet address.
3. Ensure you choose the correct blockchain network to prevent any loss of funds.
4. Copy your Transaction Hash / TxID from your wallet or exchange.
5. Submit your TxID and optional screenshot below for blockchain verification.`,
    options: [
      {
        id: 'crypto_btc',
        name: 'Bitcoin',
        network: 'Bitcoin',
        wallet_address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        currency_symbol: 'BTC',
        note: 'Send only BTC on the native Bitcoin network.'
      },
      {
        id: 'crypto_usdt_trc20',
        name: 'USDT',
        network: 'TRC20',
        wallet_address: 'TYDZSBLNrdgnLsUtHgVxrmRgyq27gWnEqT',
        currency_symbol: 'USDT',
        note: 'Send only USDT via Tron (TRC20) network.'
      },
      {
        id: 'crypto_usdt_bep20',
        name: 'USDT',
        network: 'BEP20',
        wallet_address: '0x71C838931024B3619796eB96160F5488132e08e6',
        currency_symbol: 'USDT',
        note: 'Send only USDT via BNB Smart Chain (BEP20).'
      },
      {
        id: 'crypto_eth',
        name: 'Ethereum',
        network: 'Ethereum',
        wallet_address: '0x71C838931024B3619796eB96160F5488132e08e6',
        currency_symbol: 'ETH',
        note: 'Send only ETH via Ethereum (ERC20) network.'
      }
    ]
  },
  payment_method_name: 'Manual Payment Confirmation',
  account_name: 'Victor Moses',
  account_number_or_email: '0123456789',
  currency: 'USD',
  instructions: 'Please select a manual payment method.',
  updated_at: new Date('2026-09-16T12:00:00Z').toISOString()
};

export interface DatabaseSchema {
  products: Product[];
  users: User[];
  orders: Order[];
  order_items: OrderItem[];
  downloads: DownloadToken[];
  emails: EmailLog[];
  analytics: AnalyticsEvent[];
  processed_payment_references: string[];
  payment_settings: PaymentSettings;
}

const INITIAL_PRODUCTS: Product[] = [
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

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        // Ensure all products exist
        if (!parsed.products || parsed.products.length === 0) {
          parsed.products = INITIAL_PRODUCTS;
        }
        return {
          products: parsed.products || INITIAL_PRODUCTS,
          users: parsed.users || [],
          orders: parsed.orders || [],
          order_items: parsed.order_items || [],
          downloads: parsed.downloads || [],
          emails: parsed.emails || [],
          analytics: parsed.analytics || [],
          processed_payment_references: parsed.processed_payment_references || [],
          payment_settings: parsed.payment_settings || DEFAULT_PAYMENT_SETTINGS
        };
      }
    } catch (err) {
      console.warn('Error reading db.json, initializing fresh data:', err);
    }

    const initialData: DatabaseSchema = {
      products: INITIAL_PRODUCTS,
      users: [
        {
          id: 'usr_sample_1',
          name: 'Sarah Jenkins',
          email: 'sarah.j@example.com',
          created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
          updated_at: new Date(Date.now() - 86400000 * 5).toISOString()
        }
      ],
      orders: [],
      order_items: [],
      downloads: [],
      emails: [],
      analytics: [],
      processed_payment_references: [],
      payment_settings: DEFAULT_PAYMENT_SETTINGS
    };

    this.saveData(initialData);
    return initialData;
  }

  private saveData(dataToSave: DatabaseSchema = this.data) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist database:', err);
    }
  }

  // --- PRODUCTS ---
  public getProducts(includeUnpublished = false): Product[] {
    if (includeUnpublished) {
      return this.data.products;
    }
    return this.data.products.filter(p => p.status === 'PUBLISHED');
  }

  public getProductById(id: string): Product | undefined {
    return this.data.products.find(p => p.id === id);
  }

  public getProductBySlug(slug: string): Product | undefined {
    return this.data.products.find(p => p.slug === slug);
  }

  public saveProduct(productData: Partial<Product>): Product {
    const existingIndex = this.data.products.findIndex(p => p.id === productData.id);
    const now = new Date().toISOString();

    if (existingIndex >= 0) {
      const updated: Product = {
        ...this.data.products[existingIndex],
        ...productData,
        updated_at: now
      };
      this.data.products[existingIndex] = updated;
      this.saveData();
      return updated;
    } else {
      const newProduct: Product = {
        id: productData.id || `PROD-${Date.now()}`,
        name: productData.name || 'Untitled Guide',
        slug: productData.slug || `guide-${Date.now()}`,
        subtitle: productData.subtitle || '',
        description: productData.description || '',
        short_description: productData.short_description || '',
        price: Number(productData.price) || 9.99,
        currency: productData.currency || 'USD',
        type: productData.type || 'SINGLE',
        status: productData.status || 'PUBLISHED',
        cover_image: productData.cover_image || 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=800&auto=format&fit=crop&q=80',
        file_reference: productData.file_reference || 'private/storage/new-guide.pdf',
        pages: productData.pages || 48,
        format: productData.format || 'Digital PDF (Interactive & Printable)',
        benefits: productData.benefits || ['Comprehensive visual breakdown', 'Evidence-based science'],
        what_is_included: productData.what_is_included || [],
        preview_pages: productData.preview_pages || [],
        faqs: productData.faqs || [],
        created_at: now,
        updated_at: now
      };
      this.data.products.push(newProduct);
      this.saveData();
      return newProduct;
    }
  }

  public updateProductStatus(id: string, status: Product['status']): Product | undefined {
    const product = this.getProductById(id);
    if (!product) return undefined;
    product.status = status;
    product.updated_at = new Date().toISOString();
    this.saveData();
    return product;
  }

  // --- CHECKOUT & PAYMENT & ORDERS ---
  public createCheckoutSession(productId: string, customerEmail: string, customerName?: string) {
    const product = this.getProductById(productId);
    if (!product) {
      throw new Error('Product unavailable');
    }
    if (product.status !== 'PUBLISHED') {
      throw new Error('This guide is currently unavailable.');
    }

    const checkoutId = `chk_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const paymentReference = `pay_ref_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;

    return {
      checkoutId,
      paymentReference,
      amount: product.price,
      currency: product.currency,
      productId: product.id,
      productName: product.name,
      customerEmail,
      customerName: customerName || '',
      paymentUrl: `/checkout/${checkoutId}`
    };
  }

  /**
   * Process Payment Webhook with Idempotency (FR-006 & FR-007)
   */
  public processPaymentWebhook(payload: {
    payment_reference: string;
    status: 'PAID' | 'FAILED' | 'REFUNDED';
    amount: number;
    currency: string;
    product_id: string;
    customer_email: string;
    customer_name?: string;
  }): { success: boolean; duplicate: boolean; order?: Order; message: string } {
    const { payment_reference, status, product_id, customer_email, customer_name } = payload;

    // Idempotency check: if payment_reference was already processed, return success without creating duplicate order
    if (this.data.processed_payment_references.includes(payment_reference)) {
      const existingOrder = this.data.orders.find(o => o.payment_reference === payment_reference);
      return {
        success: true,
        duplicate: true,
        order: existingOrder,
        message: 'Payment already processed. Duplicate ignored.'
      };
    }

    // Mark reference as processed
    this.data.processed_payment_references.push(payment_reference);

    if (status !== 'PAID') {
      this.saveData();
      return {
        success: false,
        duplicate: false,
        message: `Payment status is ${status}. No order created.`
      };
    }

    // Backend verifies price from database, strictly ignoring any client overrides
    const product = this.getProductById(product_id);
    if (!product) {
      throw new Error('Invalid product for payment verification');
    }

    const now = new Date().toISOString();
    const orderId = `ord_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const orderNumber = `ORD-20261001-${String(this.data.orders.length + 1).padStart(6, '0')}`;

    // Find or create customer
    let user = this.data.users.find(u => u.email.toLowerCase() === customer_email.toLowerCase());
    if (!user) {
      user = {
        id: `usr_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
        name: customer_name || customer_email.split('@')[0],
        email: customer_email.toLowerCase(),
        created_at: now,
        updated_at: now
      };
      this.data.users.push(user);
    } else if (customer_name && !user.name) {
      user.name = customer_name;
      user.updated_at = now;
    }

    // Generate Order Items & Entitlements
    const orderItems: OrderItem[] = [];
    const downloadTokens: DownloadToken[] = [];

    // Bundle Logic (FR-009): If BND-001 is purchased, grant entitlement to all 3 individual guides!
    if (product.type === 'BUNDLE' && product.bundle_item_ids && product.bundle_item_ids.length > 0) {
      // Add primary bundle item
      orderItems.push({
        id: `item_${Date.now()}_0`,
        order_id: orderId,
        product_id: product.id,
        product_name: product.name,
        unit_price: product.price,
        quantity: 1,
        subtotal: product.price
      });

      // Grant access to each individual product in bundle
      product.bundle_item_ids.forEach((childId, idx) => {
        const childProduct = this.getProductById(childId);
        if (childProduct) {
          const tokenStr = `tok_${crypto.randomBytes(16).toString('hex')}`;
          const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

          downloadTokens.push({
            id: `dl_${Date.now()}_${idx + 1}`,
            order_id: orderId,
            product_id: childProduct.id,
            product_name: childProduct.name,
            token: tokenStr,
            expires_at: expiresAt,
            download_count: 0,
            max_downloads: 5,
            created_at: now
          });
        }
      });
    } else {
      // Single product
      orderItems.push({
        id: `item_${Date.now()}_0`,
        order_id: orderId,
        product_id: product.id,
        product_name: product.name,
        unit_price: product.price,
        quantity: 1,
        subtotal: product.price
      });

      const tokenStr = `tok_${crypto.randomBytes(16).toString('hex')}`;
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

      downloadTokens.push({
        id: `dl_${Date.now()}_1`,
        order_id: orderId,
        product_id: product.id,
        product_name: product.name,
        token: tokenStr,
        expires_at: expiresAt,
        download_count: 0,
        max_downloads: 5,
        created_at: now
      });
    }

    const newOrder: Order = {
      id: orderId,
      order_number: orderNumber,
      user_id: user.id,
      customer_name: customer_name || user.name,
      customer_email: customer_email.toLowerCase(),
      total_amount: product.price,
      currency: product.currency,
      payment_provider: 'FoodBodyPay',
      payment_reference,
      payment_status: 'PAID',
      items: orderItems,
      downloads: downloadTokens,
      created_at: now,
      updated_at: now
    };

    this.data.orders.push(newOrder);
    orderItems.forEach(item => this.data.order_items.push(item));
    downloadTokens.forEach(dt => this.data.downloads.push(dt));

    // Send Customer Emails (FR-012 & FR-013)
    this.sendOrderEmails(newOrder, product, downloadTokens);

    this.saveData();

    return {
      success: true,
      duplicate: false,
      order: newOrder,
      message: 'Order created and entitlements granted successfully.'
    };
  }

  // --- MANUAL PAYMENT SYSTEM (Customer Submission & Admin Approval) ---

  public getPaymentSettings(): PaymentSettings {
    if (
      !this.data.payment_settings ||
      !this.data.payment_settings.naira ||
      !this.data.payment_settings.paypal ||
      !this.data.payment_settings.crypto
    ) {
      this.data.payment_settings = {
        ...DEFAULT_PAYMENT_SETTINGS,
        ...(this.data.payment_settings || {}),
        naira: {
          ...DEFAULT_PAYMENT_SETTINGS.naira,
          ...(this.data.payment_settings?.naira || {})
        },
        paypal: {
          ...DEFAULT_PAYMENT_SETTINGS.paypal,
          ...(this.data.payment_settings?.paypal || {})
        },
        crypto: {
          ...DEFAULT_PAYMENT_SETTINGS.crypto,
          ...(this.data.payment_settings?.crypto || {}),
          options:
            this.data.payment_settings?.crypto?.options && this.data.payment_settings.crypto.options.length > 0
              ? this.data.payment_settings.crypto.options
              : DEFAULT_PAYMENT_SETTINGS.crypto.options
        },
        updated_at: this.data.payment_settings?.updated_at || new Date().toISOString()
      };
      this.saveData();
    }
    return this.data.payment_settings;
  }

  public updatePaymentSettings(settings: Partial<PaymentSettings>): PaymentSettings {
    const current = this.getPaymentSettings();
    this.data.payment_settings = {
      ...current,
      ...settings,
      naira: {
        ...current.naira,
        ...(settings.naira || {})
      },
      paypal: {
        ...current.paypal,
        ...(settings.paypal || {})
      },
      crypto: {
        ...current.crypto,
        ...(settings.crypto || {}),
        options: settings.crypto?.options || current.crypto?.options || DEFAULT_PAYMENT_SETTINGS.crypto.options
      },
      updated_at: new Date().toISOString()
    };
    this.saveData();

    // Background sync to Firestore
    syncSettingsToFirestore(this.data.payment_settings).catch(err => {
      console.warn('[Firestore] Background settings sync error:', err);
    });

    return this.data.payment_settings;
  }

  /**
   * Customer submits manual payment proof/transaction ID
   * Status is set to PENDING. No download tokens are issued yet.
   */
  public submitManualPayment(submission: ManualPaymentSubmission): {
    success: boolean;
    order?: Order;
    message: string;
  } {
    const {
      productId,
      customerName,
      customerEmail,
      amountPaid,
      paymentMethod,
      transactionReference,
      paymentProof,
      proofFilename,
      additionalNote,
      confirmedCheckbox
    } = submission;

    if (!productId || !customerEmail || !transactionReference) {
      throw new Error('Please provide all required payment details.');
    }

    if (!confirmedCheckbox) {
      throw new Error('Please check the confirmation box to verify that you have completed payment.');
    }

    const cleanRef = transactionReference.trim();
    // Prevent duplicate submission with identical reference
    const existingWithRef = this.data.orders.find(
      o => o.payment_reference.toLowerCase() === cleanRef.toLowerCase()
    );
    if (existingWithRef) {
      return {
        success: true,
        order: existingWithRef,
        message: `A payment with transaction reference "${cleanRef}" has already been submitted. Current status: ${existingWithRef.payment_status}.`
      };
    }

    const product = this.getProductById(productId);
    if (!product) {
      throw new Error('The selected guide is unavailable.');
    }

    const now = new Date().toISOString();
    const orderId = `ord_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const orderNumber = `ORD-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(this.data.orders.length + 1).padStart(6, '0')}`;

    // Find or create customer
    let user = this.data.users.find(u => u.email.toLowerCase() === customerEmail.toLowerCase().trim());
    if (!user) {
      user = {
        id: `usr_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
        name: customerName?.trim() || customerEmail.split('@')[0],
        email: customerEmail.toLowerCase().trim(),
        created_at: now,
        updated_at: now
      };
      this.data.users.push(user);
    } else if (customerName && !user.name) {
      user.name = customerName.trim();
      user.updated_at = now;
    }

    const orderItems: OrderItem[] = [];
    orderItems.push({
      id: `item_${Date.now()}_0`,
      order_id: orderId,
      product_id: product.id,
      product_name: product.name,
      unit_price: product.price,
      quantity: 1,
      subtotal: product.price
    });

    const settings = this.getPaymentSettings();

    // Determine currency according to selected payment method
    let currencyUsed = 'USD';
    const chosenMethod = paymentMethod?.trim() || 'Manual Payment';
    if (chosenMethod.includes('Naira') || chosenMethod.includes('NGN') || chosenMethod.includes('₦')) {
      currencyUsed = 'NGN';
    } else if (chosenMethod.includes('PayPal')) {
      currencyUsed = settings.paypal?.currency || 'USD';
    } else if (chosenMethod.includes('Crypto')) {
      currencyUsed = 'USD';
    }

    // In the manual payment confirmation system, order is created with status PENDING.
    // Downloads are strictly empty (0 tokens) until manually reviewed & approved by admin.
    const newOrder: Order = {
      id: orderId,
      order_number: orderNumber,
      user_id: user.id,
      customer_name: customerName?.trim() || user.name,
      customer_email: customerEmail.toLowerCase().trim(),
      total_amount: Number(amountPaid) > 0 ? Number(amountPaid) : product.price,
      currency: currencyUsed,
      payment_provider: chosenMethod,
      payment_reference: cleanRef,
      payment_status: 'PENDING',
      payment_proof: paymentProof,
      proof_filename: proofFilename,
      additional_note: additionalNote?.trim() || undefined,
      confirmation_confirmed: true,
      items: orderItems,
      downloads: [], // STRICT: 0 tokens issued until APPROVED
      created_at: now,
      updated_at: now
    };

    this.data.orders.unshift(newOrder);
    orderItems.forEach(it => this.data.order_items.push(it));

    // Dispatch Pending Confirmation Email Notification
    const pendingEmail: EmailLog = {
      id: `em_${Date.now()}_pending`,
      recipient_email: newOrder.customer_email,
      recipient_name: newOrder.customer_name,
      subject: `Payment Received — Awaiting Verification (${newOrder.order_number})`,
      type: 'PURCHASE_CONFIRMATION',
      order_number: newOrder.order_number,
      product_name: product.name,
      body_text: `Your payment has been submitted and is awaiting confirmation.\n\nOrder: ${newOrder.order_number}\nProduct: ${product.name}\nPayment Method: ${chosenMethod}\nAmount: ${newOrder.currency === 'NGN' ? '₦' : '$'}${newOrder.total_amount.toLocaleString()} ${newOrder.currency}\nTransaction Reference: ${cleanRef}\n\nOur team is currently reviewing your payment details. You will receive access to your PDF once the payment has been confirmed. You can also view your status anytime under "My Purchases" on our website.`,
      download_urls: [],
      sent_at: now,
      status: 'SENT'
    };
    this.data.emails.unshift(pendingEmail);

    this.saveData();

    // Background sync to Firestore if configured
    syncPaymentToFirestore(newOrder).catch(err => {
      console.warn('[Firestore] Background payment sync error:', err);
    });

    return {
      success: true,
      order: newOrder,
      message: 'Payment submitted successfully. Your payment is being reviewed. You will receive access to your PDF once the payment has been confirmed.'
    };
  }

  /**
   * Admin approves manual payment
   * Status -> APPROVED, generates secure download tokens, sends delivery email.
   */
  public approveOrder(orderId: string, adminName?: string): {
    success: boolean;
    order?: Order;
    message: string;
  } {
    const order = this.data.orders.find(o => o.id === orderId || o.order_number === orderId);
    if (!order) {
      return { success: false, message: 'Order not found.' };
    }

    if (order.payment_status === 'APPROVED' || order.payment_status === 'PAID') {
      return { success: true, order, message: 'Order has already been approved.' };
    }

    const now = new Date().toISOString();
    order.payment_status = 'APPROVED';
    order.reviewed_at = now;
    order.reviewed_by = adminName || 'Admin';
    order.rejection_reason = undefined;
    order.updated_at = now;

    // Issue Secure PDF Download Token(s)
    const product = this.getProductById(order.items[0]?.product_id);
    const downloadTokens: DownloadToken[] = [];

    if (product?.type === 'BUNDLE' && product.bundle_item_ids && product.bundle_item_ids.length > 0) {
      product.bundle_item_ids.forEach((childId, idx) => {
        const childProduct = this.getProductById(childId);
        if (childProduct) {
          const tokenStr = `tok_${crypto.randomBytes(16).toString('hex')}`;
          const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
          const dt: DownloadToken = {
            id: `dl_${Date.now()}_${idx + 1}`,
            order_id: order.id,
            product_id: childProduct.id,
            product_name: childProduct.name,
            token: tokenStr,
            expires_at: expiresAt,
            download_count: 0,
            max_downloads: 10,
            created_at: now
          };
          downloadTokens.push(dt);
          this.data.downloads.push(dt);
        }
      });
    } else if (product) {
      const tokenStr = `tok_${crypto.randomBytes(16).toString('hex')}`;
      const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
      const dt: DownloadToken = {
        id: `dl_${Date.now()}_1`,
        order_id: order.id,
        product_id: product.id,
        product_name: product.name,
        token: tokenStr,
        expires_at: expiresAt,
        download_count: 0,
        max_downloads: 10,
        created_at: now
      };
      downloadTokens.push(dt);
      this.data.downloads.push(dt);
    }

    order.downloads = downloadTokens;

    // Dispatch Product Delivery Email with Download Links
    const downloadUrls = downloadTokens.map(dt => ({
      productName: dt.product_name,
      url: `/api/download/${dt.token}`,
      token: dt.token
    }));

    const deliveryEmail: EmailLog = {
      id: `em_${Date.now()}_approved`,
      recipient_email: order.customer_email,
      recipient_name: order.customer_name,
      subject: `Payment Confirmed! Your PDF is Ready: ${product?.name || 'Publication'} (${order.order_number})`,
      type: 'PRODUCT_DELIVERY',
      order_number: order.order_number,
      product_name: product?.name || 'Guide',
      body_text: `Payment confirmed! Your PDF is now available to download.\n\nYour manual payment for order ${order.order_number} has been verified and approved by our team.\n\nYou can click the secure link below to download your visual guide, or view it directly in the 'My Purchases' section.`,
      download_urls: downloadUrls,
      sent_at: now,
      status: 'SENT'
    };
    this.data.emails.unshift(deliveryEmail);

    this.saveData();

    // Background sync approval to Firestore
    updatePaymentStatusInFirestore(order.id, 'approved', {
      adminName: order.reviewed_by,
      downloadToken: downloadTokens[0]?.token,
      downloadExpiresAt: downloadTokens[0]?.expires_at,
      downloads: downloadTokens
    }).catch(err => {
      console.warn('[Firestore] Background approval sync error:', err);
    });

    return {
      success: true,
      order,
      message: `Order ${order.order_number} approved successfully. PDF access has been unlocked.`
    };
  }

  /**
   * Admin rejects manual payment
   * Status -> REJECTED, records rejection reason, revokes any tokens.
   */
  public rejectOrder(orderId: string, adminName?: string, reason?: string): {
    success: boolean;
    order?: Order;
    message: string;
  } {
    const order = this.data.orders.find(o => o.id === orderId || o.order_number === orderId);
    if (!order) {
      return { success: false, message: 'Order not found.' };
    }

    const now = new Date().toISOString();
    order.payment_status = 'REJECTED';
    order.reviewed_at = now;
    order.reviewed_by = adminName || 'Admin';
    order.rejection_reason = reason?.trim() || 'Payment details could not be verified.';
    order.updated_at = now;

    // Revoke tokens if any were present
    if (order.downloads && order.downloads.length > 0) {
      order.downloads.forEach(d => {
        d.revoked = true;
        const found = this.data.downloads.find(dt => dt.id === d.id);
        if (found) found.revoked = true;
      });
      order.downloads = [];
    }

    // Dispatch Rejection Email
    const rejectEmail: EmailLog = {
      id: `em_${Date.now()}_rejected`,
      recipient_email: order.customer_email,
      recipient_name: order.customer_name,
      subject: `Payment Verification Update for Order ${order.order_number}`,
      type: 'PURCHASE_CONFIRMATION',
      order_number: order.order_number,
      product_name: order.items[0]?.product_name || 'Guide',
      body_text: `Your payment verification for order ${order.order_number} could not be confirmed.\n\nReason: ${order.rejection_reason}\n\nPlease check your payment details or contact our support team if you believe this is in error.`,
      download_urls: [],
      sent_at: now,
      status: 'SENT'
    };
    this.data.emails.unshift(rejectEmail);

    this.saveData();

    // Background sync rejection to Firestore
    updatePaymentStatusInFirestore(order.id, 'rejected', {
      adminName: order.reviewed_by,
      adminNote: order.rejection_reason
    }).catch(err => {
      console.warn('[Firestore] Background rejection sync error:', err);
    });

    return {
      success: true,
      order,
      message: `Order ${order.order_number} rejected.`
    };
  }

  // --- EMAIL DISPATCH & LOGGING ---
  private sendOrderEmails(order: Order, product: Product, downloadTokens: DownloadToken[]) {
    const now = new Date().toISOString();
    const downloadUrls = downloadTokens.map(dt => ({
      productName: dt.product_name,
      url: `/api/download/${dt.token}`,
      token: dt.token
    }));

    // 1. Purchase Confirmation Email (FR-012)
    const confirmEmail: EmailLog = {
      id: `em_${Date.now()}_1`,
      recipient_email: order.customer_email,
      recipient_name: order.customer_name,
      subject: `Order Confirmation: ${product.name} (${order.order_number})`,
      type: 'PURCHASE_CONFIRMATION',
      order_number: order.order_number,
      product_name: product.name,
      body_text: `Thank you for purchasing ${product.name}! Your order ${order.order_number} for $${order.total_amount.toFixed(2)} ${order.currency} has been confirmed. Your digital PDF guide(s) are ready for immediate download.`,
      download_urls: downloadUrls,
      sent_at: now,
      status: 'SENT'
    };

    // 2. Product Delivery Email (FR-013)
    const deliveryEmail: EmailLog = {
      id: `em_${Date.now()}_2`,
      recipient_email: order.customer_email,
      recipient_name: order.customer_name,
      subject: `Your Guide is Ready: ${product.name} — Download Access Inside`,
      type: 'PRODUCT_DELIVERY',
      order_number: order.order_number,
      product_name: product.name,
      body_text: `Your digital publication is ready. Click the secure access links below to download your visual guide. Note: download links are valid for 7 days and include up to 5 downloads per item.`,
      download_urls: downloadUrls,
      sent_at: now,
      status: 'SENT'
    };

    this.data.emails.unshift(confirmEmail, deliveryEmail);
  }

  public resendDeliveryEmail(orderId: string): boolean {
    const order = this.data.orders.find(o => o.id === orderId || o.order_number === orderId);
    if (!order || (order.payment_status !== 'APPROVED' && order.payment_status !== 'PAID')) return false;

    const product = this.getProductById(order.items[0]?.product_id);
    const downloadUrls = order.downloads.map(dt => ({
      productName: dt.product_name,
      url: `/api/download/${dt.token}`,
      token: dt.token
    }));

    const resendEmail: EmailLog = {
      id: `em_${Date.now()}_resend`,
      recipient_email: order.customer_email,
      recipient_name: order.customer_name,
      subject: `[Resent] Your Download Access: ${order.order_number}`,
      type: 'PRODUCT_DELIVERY',
      order_number: order.order_number,
      product_name: product?.name || 'Food & Body Guides',
      body_text: `Here is your resent access link for order ${order.order_number}.`,
      download_urls: downloadUrls,
      sent_at: new Date().toISOString(),
      status: 'SENT'
    };

    this.data.emails.unshift(resendEmail);
    this.saveData();
    return true;
  }

  // --- DOWNLOAD SECURITY (FR-011, Section 20, Section 42) ---
  public validateAndGetDownload(token: string): {
    valid: boolean;
    errorStatus?: number;
    errorMessage?: string;
    product?: Product;
    downloadToken?: DownloadToken;
    order?: Order;
  } {
    // 1. Validate token existence
    const downloadToken = this.data.downloads.find(d => d.token === token);
    if (!downloadToken) {
      return { valid: false, errorStatus: 404, errorMessage: 'This download link is invalid.' };
    }

    // 2. Check revocation
    if (downloadToken.revoked) {
      return { valid: false, errorStatus: 403, errorMessage: 'This download access has been revoked.' };
    }

    // 3. Check expiration
    const expiresAt = new Date(downloadToken.expires_at).getTime();
    if (Date.now() > expiresAt) {
      return { valid: false, errorStatus: 410, errorMessage: 'This download link has expired. Please contact support.' };
    }

    // 4. Check entitlement and order status (Tokens belonging to unpaid or refunded orders must be rejected)
    const order = this.data.orders.find(o => o.id === downloadToken.order_id);
    if (!order) {
      return { valid: false, errorStatus: 403, errorMessage: 'Associated order not found.' };
    }

    if (order.payment_status === 'REFUNDED') {
      return { valid: false, errorStatus: 403, errorMessage: 'Access Denied: This purchase was refunded.' };
    }

    if (order.payment_status === 'PENDING') {
      return { valid: false, errorStatus: 403, errorMessage: 'Access Denied: Your payment is currently PENDING review. PDF download will be unlocked once approved by the administrator.' };
    }

    if (order.payment_status === 'REJECTED') {
      return { valid: false, errorStatus: 403, errorMessage: 'Access Denied: Payment verification was rejected.' };
    }

    if (order.payment_status !== 'APPROVED' && order.payment_status !== 'PAID') {
      return { valid: false, errorStatus: 403, errorMessage: `Access Denied: Order status is ${order.payment_status}.` };
    }

    // 5. Check download limits
    if (downloadToken.download_count >= downloadToken.max_downloads) {
      return { valid: false, errorStatus: 429, errorMessage: `Maximum download limit (${downloadToken.max_downloads}) reached for this link.` };
    }

    const product = this.getProductById(downloadToken.product_id);
    if (!product) {
      return { valid: false, errorStatus: 404, errorMessage: 'Product file not found.' };
    }

    // Increment download count
    downloadToken.download_count += 1;
    this.saveData();

    return {
      valid: true,
      product,
      downloadToken,
      order
    };
  }

  // --- REFUND FLOW (Section 42) ---
  public refundOrder(orderId: string): { success: boolean; message: string } {
    const order = this.data.orders.find(o => o.id === orderId || o.order_number === orderId);
    if (!order) {
      return { success: false, message: 'Order not found' };
    }

    if (order.payment_status === 'REFUNDED') {
      return { success: true, message: 'Order was already refunded' };
    }

    order.payment_status = 'REFUNDED';
    order.updated_at = new Date().toISOString();

    // Invalidate/revoke all download tokens for this order
    this.data.downloads
      .filter(d => d.order_id === order.id)
      .forEach(d => {
        d.revoked = true;
      });

    this.saveData();
    return { success: true, message: `Order ${order.order_number} refunded and download access revoked.` };
  }

  // --- ORDERS & CUSTOMER LOOKUP ---
  public getOrders(statusFilter?: string): Order[] {
    if (!statusFilter || statusFilter === 'ALL') {
      return this.data.orders;
    }
    return this.data.orders.filter(o => o.payment_status === statusFilter);
  }

  public getOrderByIdOrNumber(idOrNumber: string): Order | undefined {
    const trimmed = (idOrNumber || '').trim();
    if (!trimmed) return undefined;
    return this.data.orders.find(
      o => o.id === trimmed || 
           o.order_number === trimmed ||
           o.payment_reference?.toLowerCase() === trimmed.toLowerCase() ||
           (o as any).paymentId === trimmed
    );
  }

  public getPendingPaymentsCount(): number {
    return this.data.orders.filter(o => o.payment_status === 'PENDING').length;
  }

  public getOrdersByCustomerEmail(email: string): Order[] {
    return this.data.orders.filter(o => o.customer_email.toLowerCase() === email.toLowerCase());
  }

  public getCustomers(): {
    email: string;
    name: string;
    orderCount: number;
    totalSpent: number;
    lastPurchaseDate: string;
  }[] {
    const customerMap = new Map<string, { email: string; name: string; orderCount: number; totalSpent: number; lastPurchaseDate: string }>();

    for (const order of this.data.orders) {
      if (order.payment_status === 'APPROVED' || order.payment_status === 'PAID') {
        const existing = customerMap.get(order.customer_email);
        if (existing) {
          existing.orderCount += 1;
          existing.totalSpent += order.total_amount;
          if (new Date(order.created_at) > new Date(existing.lastPurchaseDate)) {
            existing.lastPurchaseDate = order.created_at;
          }
        } else {
          customerMap.set(order.customer_email, {
            email: order.customer_email,
            name: order.customer_name || 'Customer',
            orderCount: 1,
            totalSpent: order.total_amount,
            lastPurchaseDate: order.created_at
          });
        }
      }
    }

    return Array.from(customerMap.values());
  }

  public getEmails(): EmailLog[] {
    return this.data.emails;
  }

  // --- ANALYTICS ---
  public logAnalyticsEvent(event: Omit<AnalyticsEvent, 'id' | 'timestamp'>) {
    const newEvent: AnalyticsEvent = {
      id: `ev_${Date.now()}_${crypto.randomBytes(2).toString('hex')}`,
      timestamp: new Date().toISOString(),
      ...event
    };
    this.data.analytics.unshift(newEvent);
    // Keep max 500 events
    if (this.data.analytics.length > 500) {
      this.data.analytics.pop();
    }
    this.saveData();
    return newEvent;
  }

  public getAnalyticsSummary() {
    const events = this.data.analytics;
    const countByEvent: Record<string, number> = {};
    for (const ev of events) {
      countByEvent[ev.event_name] = (countByEvent[ev.event_name] || 0) + 1;
    }

    const totalRevenue = this.data.orders
      .filter(o => o.payment_status === 'APPROVED' || o.payment_status === 'PAID')
      .reduce((sum, o) => sum + o.total_amount, 0);

    const paidOrders = this.data.orders.filter(o => o.payment_status === 'APPROVED' || o.payment_status === 'PAID').length;
    const totalDownloads = this.data.downloads.reduce((sum, d) => sum + d.download_count, 0);

    return {
      totalRevenue,
      paidOrders,
      totalOrders: this.data.orders.length,
      customerCount: this.getCustomers().length,
      totalDownloads,
      eventCounts: countByEvent,
      recentEvents: events.slice(0, 30)
    };
  }
}

export const db = new Database();
