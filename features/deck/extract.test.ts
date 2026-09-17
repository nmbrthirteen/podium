import { describe, expect, it } from 'vitest';
import { makePdf, makePptx, sampleSlides } from '@/tests/fixtures/make-decks';
import { deckRules } from './deck-rules';
import { extractPdf } from './extract-pdf';
import { extractPptx } from './extract-pptx';
import { DeckError, slideTitle } from './extracted-slide';

describe('extractPptx', () => {
  it('reads 30 slides in presentation order with notes', async () => {
    const slides = await extractPptx(await makePptx(sampleSlides(30)));

    expect(slides).toHaveLength(30);
    expect(slides.map(slide => slide.number)).toEqual(Array.from({ length: 30 }, (_, index) => index + 1));
    expect(slides[0]?.text).toBe('Slide 1 title\nPoint for slide 1\nRevenue grew 12% & costs fell');
    expect(slideTitle(slides[29] ?? { number: 30, text: '' })).toBe('Slide 30 title');
    expect(slides[0]?.notes).toBe('Say the number for slide 1 <slowly>');
    expect(slides[1]?.notes).toBe('');
    expect(slides[2]?.notes).toBe('Say the number for slide 3 <slowly>');
  });

  it('flags the dense slide', async () => {
    const slides = await extractPptx(await makePptx(sampleSlides(30)));
    expect(deckRules(slides).map(issue => issue.message)).toEqual([
      'Slide 6 has 61 words. Dense slides pull you into reading.',
    ]);
  });

  it('rejects a file that is not a deck', async () => {
    await expect(extractPptx(new TextEncoder().encode('not a zip'))).rejects.toThrow(DeckError);
  });
});

describe('extractPdf', () => {
  it('reads text from 30 pages', async () => {
    const wrap = (line: string) => {
      const words = line.replace('&amp;', '&').split(' ');
      return Array.from({ length: Math.ceil(words.length / 8) }, (_, row) =>
        words.slice(row * 8, row * 8 + 8).join(' '),
      );
    };
    const pages = sampleSlides(30).map(slide => [slide.title, ...slide.body.flatMap(wrap)]);
    const slides = await extractPdf(makePdf(pages));

    expect(slides).toHaveLength(30);
    expect(slides[0]?.text).toContain('Slide 1 title');
    expect(slides[0]?.text).toContain('Revenue grew 12% & costs fell');
    expect(slides[29]?.text).toContain('Slide 30 title');
    expect(deckRules(slides).map(issue => issue.action.kind === 'open' && issue.action.target)).toEqual(['slide-6']);
  });

  it('rejects a file that is not a PDF', async () => {
    await expect(extractPdf(new TextEncoder().encode('plain text'))).rejects.toThrow(DeckError);
  });
});
