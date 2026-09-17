export const maxPageCharacters = 20_000;

const namedEntities: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

function codePoint(value: number, fallback: string) {
  return Number.isInteger(value) && value > 0 && value < 0x110000 ? String.fromCodePoint(value) : fallback;
}

export function decodeEntities(text: string) {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code: string) => {
    const lower = code.toLowerCase();
    if (lower.startsWith('#x')) return codePoint(Number.parseInt(lower.slice(2), 16), match);
    if (lower.startsWith('#')) return codePoint(Number.parseInt(lower.slice(1), 10), match);
    return namedEntities[lower] ?? match;
  });
}

function metaDescription(html: string) {
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    if (!/(?:name|property)=["'](?:og:)?description["']/i.test(tag)) continue;
    const content = tag.match(/content=["']([^"']*)["']/i)?.[1];
    if (content?.trim()) return decodeEntities(content).trim();
  }
  return '';
}

const hiddenBlocks = /<(script|style|noscript|svg|template|iframe|nav|footer|form|header|aside)\b[\s\S]*?<\/\1>/gi;
const lineBreaks = /<\/?(?:p|div|section|article|main|li|ul|ol|h[1-6]|br|tr|table|blockquote|pre)\b[^>]*>/gi;

function contentRegion(html: string) {
  for (const tag of ['article', 'main', 'body']) {
    const inner = html.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*)<\\/${tag}>`, 'i'))?.[1];
    if (inner?.trim()) return inner;
  }
  return html;
}

export function extractPage(html: string) {
  const title = decodeEntities(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '')
    .replace(/\s+/g, ' ')
    .trim();
  const lines = decodeEntities(
    contentRegion(html)
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(hiddenBlocks, ' ')
      .replace(lineBreaks, '\n')
      .replace(/<[^>]+>/g, ' '),
  )
    .split('\n')
    .map(line =>
      line
        .replace(/\s+/g, ' ')
        .replace(/\s+([.,;:!?)\]])/g, '$1')
        .replace(/([([])\s+/g, '$1')
        .trim(),
    )
    .filter(Boolean);

  const text = [metaDescription(html), ...lines].filter(Boolean).join('\n');
  return { title, text: text.slice(0, maxPageCharacters) };
}
