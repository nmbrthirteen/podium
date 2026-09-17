import { describe, expect, it } from 'vitest';
import { runCards } from './run-cards';

const section = (id: string, verbatim = '') => ({
  id,
  title: id,
  minutes: 2,
  keywords: [`${id} keyword`],
  verbatim,
  slideNumbers: [],
});

const sections = [section('open'), section('middle', 'ignored'), section('close', 'Approve it by Friday.')];
const brief = { openingLine: 'Half of us blank in two minutes.', closingLine: 'Book three runs.' };

describe('runCards', () => {
  it('uses all sections for a full run with verbatim on the ends only', () => {
    const cards = runCards('full-run', sections, null, brief);
    expect(cards.map(card => [card.id, card.holdsVerbatim, card.verbatim])).toEqual([
      ['open', true, 'Half of us blank in two minutes.'],
      ['middle', false, ''],
      ['close', true, 'Approve it by Friday.'],
    ]);
  });

  it('loops the chosen section', () => {
    expect(runCards('section-loop', sections, 'middle', brief).map(card => card.id)).toEqual(['middle']);
  });

  it('drills the opening and closing cards', () => {
    expect(runCards('open-close-drill', sections, null, brief).map(card => card.id)).toEqual(['open', 'close']);
  });

  it('returns no cards for a talk without sections', () => {
    expect(runCards('full-run', [], null, brief)).toEqual([]);
    expect(runCards('open-close-drill', [], null, brief)).toEqual([]);
  });
});
