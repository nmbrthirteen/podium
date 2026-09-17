const urlPattern = /\b(?:https?:\/\/|www\.)[^\s<>"'`]+/gi;

export const maxLinks = 5;

export function findUrls(text: string) {
  const found = (text.match(urlPattern) ?? [])
    .map(url => url.replace(/[.,;:!?)\]}]+$/, ''))
    .map(url => (url.toLowerCase().startsWith('www.') ? `https://${url}` : url));
  return [...new Set(found)].slice(0, maxLinks);
}

export function linkLabel(url: string) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');
    return parsed.pathname === '/' ? host : `${host}${parsed.pathname}`;
  } catch {
    return url;
  }
}
