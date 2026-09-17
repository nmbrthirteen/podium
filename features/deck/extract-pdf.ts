import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { DeckError, type ExtractedSlide, toExtractedSlide } from './extracted-slide';

export async function extractPdf(data: Uint8Array): Promise<ExtractedSlide[]> {
  const loadingTask = getDocument({ data, disableFontFace: true, useSystemFonts: false });

  try {
    const document = await loadingTask.promise.catch(() => {
      throw new DeckError('This file is not a readable PDF. Export the deck again as PDF or PPTX, then upload it.');
    });

    const slides: ExtractedSlide[] = [];
    for (let number = 1; number <= document.numPages; number += 1) {
      const page = await document.getPage(number);
      const content = await page.getTextContent();
      let text = '';
      for (const item of content.items) {
        if (!('str' in item)) continue;
        text += item.str;
        text += item.hasEOL ? '\n' : ' ';
      }
      const normalized = text
        .split('\n')
        .map(line => line.replace(/\s+/g, ' ').trim())
        .filter(Boolean)
        .join('\n');
      slides.push(toExtractedSlide(number, normalized, ''));
      page.cleanup();
    }

    if (slides.length === 0) throw new DeckError('This PDF has no pages. Check the file, then upload it again.');
    return slides;
  } finally {
    await loadingTask.destroy();
  }
}
