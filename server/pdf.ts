import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { getGuideById, BookGuide, BookPage } from './bookContent';

export interface ProductSummary {
  id: string;
  name: string;
  subtitle?: string;
  [key: string]: any;
}

interface PDFOptions {
  product: ProductSummary;
  customerEmail?: string;
  orderNumber?: string;
}

export async function generateProductPDF({
  product,
  customerEmail = 'customer@foodandbody.com',
  orderNumber = 'ORD-ONLINE-DIGITAL'
}: PDFOptions): Promise<Uint8Array> {
  const guide: BookGuide | undefined = getGuideById(product.id);
  const pdfDoc = await PDFDocument.create();

  // Fonts
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
  const fontTimesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const fontTimesItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

  // Palettes
  const darkNavy = rgb(0.08, 0.12, 0.18);
  const deepGreen = rgb(0.12, 0.35, 0.25);
  const darkCanvas = rgb(0.07, 0.08, 0.09);
  const darkCanvasText = rgb(0.92, 0.93, 0.94);
  const darkCanvasMuted = rgb(0.65, 0.68, 0.72);
  const lightBg = rgb(0.98, 0.97, 0.95);
  const bodyText = rgb(0.15, 0.18, 0.22);
  const mutedText = rgb(0.42, 0.46, 0.50);
  const goldAccent = rgb(0.85, 0.58, 0.18);
  const borderGray = rgb(0.84, 0.84, 0.84);
  const darkBorder = rgb(0.20, 0.22, 0.25);

  const pagesToRender: BookPage[] = guide?.pages || [];

  if (pagesToRender.length === 0) {
    // Fallback single page if product is unknown
    const page = pdfDoc.addPage([595.28, 841.89]);
    page.drawText(product.name, { x: 50, y: 750, size: 24, font: fontBold, color: darkNavy });
    page.drawText(`Digital Edition licensed to ${customerEmail}`, { x: 50, y: 700, size: 12, font: fontRegular, color: mutedText });
    return await pdfDoc.save();
  }

  const pageWidth = 595.28;
  const pageHeight = 841.89;

  for (let i = 0; i < pagesToRender.length; i++) {
    const bookPage = pagesToRender[i];
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    const isDark = bookPage.theme === 'dark' || bookPage.theme === 'cover';

    // Wrap page.drawText to automatically sanitize characters to WinAnsi supported set
    const originalDrawText = page.drawText.bind(page);
    (page as any).drawText = (text: string, options: any) => {
      return originalDrawText(safeStr(text), options);
    };

    // 1. Draw Page Background
    page.drawRectangle({
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
      color: isDark ? darkCanvas : lightBg,
    });

    // 2. Decorative Top Accent Line
    page.drawRectangle({
      x: 36,
      y: pageHeight - 36,
      width: pageWidth - 72,
      height: 2,
      color: isDark ? goldAccent : deepGreen,
    });

    // 3. Header Info (Running header on pages after cover)
    if (bookPage.pageNumber > 1) {
      page.drawText(guide?.series || 'FOOD & BODY • EVIDENCE-BASED PUBLISHING', {
        x: 40,
        y: pageHeight - 55,
        size: 7.5,
        font: fontBold,
        color: isDark ? goldAccent : mutedText,
      });

      page.drawText(bookPage.section.toUpperCase(), {
        x: pageWidth - 200,
        y: pageHeight - 55,
        size: 7.5,
        font: fontRegular,
        color: isDark ? darkCanvasMuted : mutedText,
      });

      page.drawLine({
        start: { x: 40, y: pageHeight - 62 },
        end: { x: pageWidth - 40, y: pageHeight - 62 },
        thickness: 0.5,
        color: isDark ? darkBorder : borderGray,
      });
    }

    // 4. Footer Watermark & Page Number
    const footerY = 32;
    page.drawLine({
      start: { x: 40, y: footerY + 12 },
      end: { x: pageWidth - 40, y: footerY + 12 },
      thickness: 0.5,
      color: isDark ? darkBorder : borderGray,
    });

    page.drawText(`Licensed to: ${customerEmail} • Order: ${orderNumber}`, {
      x: 40,
      y: footerY,
      size: 7,
      font: fontRegular,
      color: isDark ? darkCanvasMuted : mutedText,
    });

    page.drawText(`PAGE ${bookPage.pageNumber.toString().padStart(2, '0')} / ${pagesToRender.length}`, {
      x: pageWidth - 90,
      y: footerY,
      size: 7,
      font: fontBold,
      color: isDark ? darkCanvasMuted : mutedText,
    });

    // 5. Page Body Content Flow
    let currentY = pageHeight - 95;

    // COVER PAGE SPECIAL LAYOUT
    if (bookPage.pageNumber === 1) {
      currentY = pageHeight - 160;

      page.drawText(guide?.series || 'NUTRITION • VISUAL HEALTH GUIDE', {
        x: 50,
        y: currentY,
        size: 10,
        font: fontBold,
        color: goldAccent,
      });

      currentY -= 50;

      // Title
      const titleLines = splitTextIntoLines(bookPage.title, 26, fontTimesBold, pageWidth - 100);
      for (const line of titleLines) {
        page.drawText(line, {
          x: 50,
          y: currentY,
          size: 26,
          font: fontTimesBold,
          color: darkCanvasText,
        });
        currentY -= 34;
      }

      currentY -= 15;

      // Subtitle
      if (bookPage.subtitle) {
        const subLines = splitTextIntoLines(bookPage.subtitle, 13, fontTimesItalic, pageWidth - 100);
        for (const line of subLines) {
          page.drawText(line, {
            x: 50,
            y: currentY,
            size: 13,
            font: fontTimesItalic,
            color: goldAccent,
          });
          currentY -= 20;
        }
      }

      // Decorative central illustration box
      currentY -= 40;
      page.drawRectangle({
        x: 50,
        y: currentY - 180,
        width: pageWidth - 100,
        height: 180,
        borderWidth: 1,
        borderColor: darkBorder,
        color: rgb(0.10, 0.12, 0.14),
      });

      page.drawText('FOOD & BODY VISUAL ANATOMY', {
        x: 70,
        y: currentY - 35,
        size: 9,
        font: fontBold,
        color: goldAccent,
      });

      page.drawText('EVIDENCE-BASED PHYSIOLOGICAL BREAKDOWN', {
        x: 70,
        y: currentY - 55,
        size: 12,
        font: fontBold,
        color: darkCanvasText,
      });

      const coverDesc = [
        '• Cellular Digestion & Nutrient Absorption Pathways',
        '• Systematic Reviews, Meta-Analyses & Clinical References',
        '• Practical Dietary Implementation & Evidence Demystification'
      ];

      let cDescY = currentY - 85;
      for (const cd of coverDesc) {
        page.drawText(cd, {
          x: 70,
          y: cDescY,
          size: 9,
          font: fontRegular,
          color: darkCanvasMuted,
        });
        cDescY -= 18;
      }

      // Cover License Panel
      currentY -= 250;
      page.drawRectangle({
        x: 50,
        y: currentY - 60,
        width: pageWidth - 100,
        height: 60,
        borderWidth: 1,
        borderColor: goldAccent,
        color: rgb(0.11, 0.13, 0.16),
      });

      page.drawText('OFFICIAL VERIFIED DIGITAL LICENSE', {
        x: 65,
        y: currentY - 22,
        size: 8,
        font: fontBold,
        color: goldAccent,
      });

      page.drawText(`Purchased by: ${customerEmail} | License Key: ${orderNumber}`, {
        x: 65,
        y: currentY - 38,
        size: 8,
        font: fontRegular,
        color: darkCanvasText,
      });

      page.drawText('DRM-Secured Personal Edition • Food & Body Publishing', {
        x: 65,
        y: currentY - 50,
        size: 7,
        font: fontRegular,
        color: darkCanvasMuted,
      });

      continue;
    }

    // REGULAR PAGES (Page 2 to 35+)

    // Section Tag
    if (bookPage.section) {
      page.drawText(bookPage.section.toUpperCase(), {
        x: 48,
        y: currentY,
        size: 8.5,
        font: fontBold,
        color: isDark ? goldAccent : deepGreen,
      });
      currentY -= 18;
    }

    // Page Title
    const titleLines = splitTextIntoLines(bookPage.title, 18, fontBold, pageWidth - 96);
    for (const line of titleLines) {
      page.drawText(line, {
        x: 48,
        y: currentY,
        size: 18,
        font: fontBold,
        color: isDark ? darkCanvasText : darkNavy,
      });
      currentY -= 24;
    }

    // Page Subtitle
    if (bookPage.subtitle) {
      currentY -= 4;
      page.drawText(bookPage.subtitle, {
        x: 48,
        y: currentY,
        size: 11,
        font: fontOblique,
        color: isDark ? goldAccent : deepGreen,
      });
      currentY -= 20;
    }

    currentY -= 8;

    // Flow Steps (Visual arrow chain)
    if (bookPage.content.flowSteps && bookPage.content.flowSteps.length > 0) {
      const flowText = bookPage.content.flowSteps.join('  →  ');
      page.drawRectangle({
        x: 48,
        y: currentY - 26,
        width: pageWidth - 96,
        height: 26,
        color: isDark ? rgb(0.12, 0.15, 0.18) : rgb(0.92, 0.95, 0.92),
        borderWidth: 0.5,
        borderColor: isDark ? goldAccent : deepGreen,
      });

      page.drawText(flowText, {
        x: 58,
        y: currentY - 17,
        size: 8.5,
        font: fontBold,
        color: isDark ? goldAccent : deepGreen,
      });

      currentY -= 38;
    }

    // Main Paragraphs
    if (bookPage.content.paragraphs) {
      for (const p of bookPage.content.paragraphs) {
        const lines = splitTextIntoLines(p, 9.5, fontRegular, pageWidth - 96);
        for (const line of lines) {
          if (currentY < 90) break;
          page.drawText(line, {
            x: 48,
            y: currentY,
            size: 9.5,
            font: fontRegular,
            color: isDark ? darkCanvasText : bodyText,
          });
          currentY -= 14.5;
        }
        currentY -= 8;
      }
    }

    // Subsections
    if (bookPage.content.subsections) {
      for (const sub of bookPage.content.subsections) {
        if (currentY < 100) break;

        page.drawText(sub.title, {
          x: 48,
          y: currentY,
          size: 10.5,
          font: fontBold,
          color: isDark ? goldAccent : darkNavy,
        });
        currentY -= 15;

        const sLines = splitTextIntoLines(sub.body, 9, fontRegular, pageWidth - 96);
        for (const line of sLines) {
          if (currentY < 90) break;
          page.drawText(line, {
            x: 48,
            y: currentY,
            size: 9,
            font: fontRegular,
            color: isDark ? darkCanvasMuted : bodyText,
          });
          currentY -= 13.5;
        }
        currentY -= 8;
      }
    }

    // Bullets
    if (bookPage.content.bullets) {
      for (const b of bookPage.content.bullets) {
        if (currentY < 90) break;
        page.drawText(`•  ${b}`, {
          x: 56,
          y: currentY,
          size: 9,
          font: fontRegular,
          color: isDark ? darkCanvasText : bodyText,
        });
        currentY -= 14;
      }
      currentY -= 6;
    }

    // Table (e.g. Egg Nutrition at a Glance)
    if (bookPage.content.table && currentY > 150) {
      const table = bookPage.content.table;
      const rowHeight = 17;
      const col1Width = 240;
      const col2Width = pageWidth - 96 - col1Width;
      const tableHeight = (table.rows.length + 1) * rowHeight;

      if (currentY - tableHeight > 70) {
        // Table Header
        page.drawRectangle({
          x: 48,
          y: currentY - rowHeight,
          width: pageWidth - 96,
          height: rowHeight,
          color: isDark ? rgb(0.14, 0.16, 0.18) : rgb(0.12, 0.18, 0.24),
        });

        page.drawText(table.headers[0], {
          x: 56,
          y: currentY - 12,
          size: 8.5,
          font: fontBold,
          color: rgb(1, 1, 1),
        });

        page.drawText(table.headers[1], {
          x: 48 + col1Width + 12,
          y: currentY - 12,
          size: 8.5,
          font: fontBold,
          color: rgb(1, 1, 1),
        });

        currentY -= rowHeight;

        // Table Rows
        for (let r = 0; r < table.rows.length; r++) {
          const row = table.rows[r];
          const isEven = r % 2 === 0;

          page.drawRectangle({
            x: 48,
            y: currentY - rowHeight,
            width: pageWidth - 96,
            height: rowHeight,
            color: isDark
              ? (isEven ? rgb(0.09, 0.10, 0.12) : rgb(0.11, 0.13, 0.15))
              : (isEven ? rgb(1, 1, 1) : rgb(0.95, 0.94, 0.92)),
            borderWidth: 0.3,
            borderColor: isDark ? darkBorder : borderGray,
          });

          page.drawText(row[0], {
            x: 56,
            y: currentY - 12,
            size: 8.5,
            font: fontRegular,
            color: isDark ? darkCanvasText : bodyText,
          });

          page.drawText(row[1], {
            x: 48 + col1Width + 12,
            y: currentY - 12,
            size: 8.5,
            font: fontBold,
            color: isDark ? goldAccent : darkNavy,
          });

          currentY -= rowHeight;
        }
        currentY -= 12;
      }
    }

    // FAQ Items
    if (bookPage.content.faqItems) {
      for (const faq of bookPage.content.faqItems) {
        if (currentY < 80) break;
        page.drawText(`Q: ${faq.question}`, {
          x: 48,
          y: currentY,
          size: 9,
          font: fontBold,
          color: isDark ? goldAccent : darkNavy,
        });
        currentY -= 13;

        const aLines = splitTextIntoLines(faq.answer, 8.5, fontRegular, pageWidth - 100);
        for (const al of aLines) {
          if (currentY < 75) break;
          page.drawText(al, {
            x: 58,
            y: currentY,
            size: 8.5,
            font: fontRegular,
            color: isDark ? darkCanvasMuted : bodyText,
          });
          currentY -= 12;
        }
        currentY -= 6;
      }
    }

    // Callout Box
    if (bookPage.content.callout && currentY > 110) {
      const callout = bookPage.content.callout;
      const cLines = splitTextIntoLines(callout.text, 8.5, fontRegular, pageWidth - 124);
      const boxHeight = 24 + cLines.length * 13;

      if (currentY - boxHeight > 65) {
        page.drawRectangle({
          x: 48,
          y: currentY - boxHeight,
          width: pageWidth - 96,
          height: boxHeight,
          borderWidth: 1,
          borderColor: isDark ? goldAccent : deepGreen,
          color: isDark ? rgb(0.10, 0.12, 0.14) : rgb(0.95, 0.97, 0.95),
        });

        page.drawText(callout.title.toUpperCase(), {
          x: 60,
          y: currentY - 16,
          size: 8,
          font: fontBold,
          color: isDark ? goldAccent : deepGreen,
        });

        let cy = currentY - 30;
        for (const cl of cLines) {
          page.drawText(cl, {
            x: 60,
            y: cy,
            size: 8.5,
            font: fontRegular,
            color: isDark ? darkCanvasText : bodyText,
          });
          cy -= 13;
        }

        currentY -= (boxHeight + 12);
      }
    }

    // Quote
    if (bookPage.content.quote && currentY > 80) {
      const qLines = splitTextIntoLines(bookPage.content.quote, 9.5, fontTimesItalic, pageWidth - 110);
      for (const ql of qLines) {
        page.drawText(ql, {
          x: 55,
          y: currentY,
          size: 9.5,
          font: fontTimesItalic,
          color: isDark ? goldAccent : deepGreen,
        });
        currentY -= 14;
      }
    }
  }

  return await pdfDoc.save();
}

export function safeStr(text: string | undefined | null): string {
  if (!text) return '';
  return String(text)
    .replace(/[\u201C\u201D]/g, '"') // smart quotes
    .replace(/[\u2018\u2019]/g, "'") // smart single quotes
    .replace(/[\u2013\u2014]/g, '-') // en-dash and em-dash
    .replace(/\u2022/g, '*') // bullet
    .replace(/\u2248/g, '~') // approx
    .replace(/\u2265/g, '>=') // >=
    .replace(/\u2264/g, '<=') // <=
    .replace(/\u00B1/g, '+/-') // +/-
    .replace(/\u00B0/g, ' deg ') // degree
    .replace(/\u2026/g, '...') // ellipsis
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // zero-width
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, ' '); // safe Latin-1 / ASCII
}

function splitTextIntoLines(text: string, fontSize: number, font: any, maxWidth: number): string[] {
  if (!text) return [];
  const clean = safeStr(text);
  const words = clean.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    let testWidth = 0;
    try {
      testWidth = font.widthOfTextAtSize(testLine, fontSize);
    } catch {
      testWidth = testLine.length * (fontSize * 0.55);
    }
    if (testWidth <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}
