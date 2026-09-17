import { describe, expect, it } from 'vitest';
import { findUrls, linkLabel } from './link-urls';

describe('findUrls', () => {
  it('pulls links out of a sentence and trims trailing punctuation', () => {
    expect(
      findUrls('Board update Friday. Context: https://acme.com/q3-report, and (https://blog.acme.com/hiring).'),
    ).toEqual(['https://acme.com/q3-report', 'https://blog.acme.com/hiring']);
  });

  it('adds https to www links and removes duplicates', () => {
    expect(findUrls('www.acme.com and https://www.acme.com and www.acme.com')).toEqual(['https://www.acme.com']);
  });

  it('keeps at most five links and ignores plain words', () => {
    const text = Array.from({ length: 7 }, (_, index) => `https://site${index}.com`).join(' ');
    expect(findUrls(text)).toHaveLength(5);
    expect(findUrls('no links here, acme dot com')).toEqual([]);
  });
});

describe('linkLabel', () => {
  it('shows the host and path without www', () => {
    expect(linkLabel('https://www.acme.com/')).toBe('acme.com');
    expect(linkLabel('https://acme.com/about/team')).toBe('acme.com/about/team');
    expect(linkLabel('not a url')).toBe('not a url');
  });
});
