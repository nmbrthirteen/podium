import { describe, expect, it } from 'vitest';
import { orderDrafts } from './numbering';

const drafts = [
  { id: 'c', sectionId: 's2', position: 2 },
  { id: 'a', sectionId: 's1', position: 5 },
  { id: 'x', sectionId: 'gone', position: 0 },
  { id: 'b', sectionId: 's1', position: 1 },
  { id: 'd', sectionId: null, position: 3 },
];

describe('orderDrafts', () => {
  it('orders by section, then position, with unplaced slides last', () => {
    expect(orderDrafts(drafts, ['s1', 's2']).map(draft => draft.id)).toEqual(['b', 'a', 'c', 'x', 'd']);
  });

  it('returns an empty deck unchanged', () => {
    expect(orderDrafts([], ['s1'])).toEqual([]);
  });
});
