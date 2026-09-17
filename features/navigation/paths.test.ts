import { describe, expect, it } from 'vitest';
import { activeTalkId, isCurrentPage, isFocusPath } from './paths';

describe('activeTalkId', () => {
  it('reads the talk from any talk page and skips the new talk page', () => {
    expect(activeTalkId('/talks/abc/plan')).toBe('abc');
    expect(activeTalkId('/talks/abc')).toBe('abc');
    expect(activeTalkId('/talks/new')).toBeNull();
    expect(activeTalkId('/settings')).toBeNull();
  });
});

describe('isFocusPath', () => {
  it('hides navigation during runs, drills, live mode, and sign in', () => {
    expect(isFocusPath('/talks/abc/practice/run-1')).toBe(true);
    expect(isFocusPath('/talks/abc/practice/qa')).toBe(true);
    expect(isFocusPath('/talks/abc/present/live')).toBe(true);
    expect(isFocusPath('/sign-in')).toBe(true);
    expect(isFocusPath('/talks/abc/practice')).toBe(false);
    expect(isFocusPath('/talks/abc/present')).toBe(false);
    expect(isFocusPath('/')).toBe(false);
  });
});

describe('isCurrentPage', () => {
  it('matches the page and its children only', () => {
    expect(isCurrentPage('/talks/abc/practice/qa', '/talks/abc/practice')).toBe(true);
    expect(isCurrentPage('/talks/abc/plan', '/talks/abc/plan')).toBe(true);
    expect(isCurrentPage('/talks/abc/planner', '/talks/abc/plan')).toBe(false);
  });
});
