import 'server-only';
import { lookup } from 'node:dns/promises';
import { isHosted } from '@/lib/env';
import { isPrivateAddress } from './address';
import { extractPage, maxPageCharacters } from './html-text';

export class LinkError extends Error {}

export type FetchedPage = { url: string; title: string; text: string };

const maxBytes = 2 * 1024 * 1024;
const maxRedirects = 4;
const timeoutMs = 10_000;

async function assertReachable(url: URL) {
  if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new LinkError('Only http and https links work.');
  if (!isHosted()) return;
  const addresses = await lookup(url.hostname, { all: true }).catch(() => []);
  if (addresses.length === 0) throw new LinkError(`Could not find ${url.hostname}.`);
  if (addresses.some(entry => isPrivateAddress(entry.address))) {
    throw new LinkError('That link points to a private network address.');
  }
}

async function readLimited(response: Response) {
  const reader = response.body?.getReader();
  if (!reader) return '';
  const decoder = new TextDecoder();
  let size = 0;
  let text = '';
  while (size < maxBytes) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    text += decoder.decode(value, { stream: true });
  }
  if (size >= maxBytes) await reader.cancel();
  return text + decoder.decode();
}

export async function fetchPage(rawUrl: string): Promise<FetchedPage> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new LinkError('That link is not a valid web address.');
  }

  const signal = AbortSignal.timeout(timeoutMs);
  for (let hop = 0; hop <= maxRedirects; hop += 1) {
    await assertReachable(url);
    const host = url.hostname;
    const response = await fetch(url, {
      redirect: 'manual',
      signal,
      headers: { 'user-agent': 'Mozilla/5.0 (compatible; Podium)', accept: 'text/html,text/plain;q=0.9' },
    }).catch(() => {
      throw new LinkError(signal.aborted ? 'The page took longer than 10 seconds.' : `Could not load ${host}.`);
    });

    const location = response.headers.get('location');
    if (response.status >= 300 && response.status < 400 && location) {
      url = new URL(location, url);
      continue;
    }
    if (!response.ok) throw new LinkError(`${host} answered with status ${response.status}.`);

    const type = response.headers.get('content-type') ?? '';
    if (!/text\/html|application\/xhtml\+xml|text\/plain/i.test(type))
      throw new LinkError('That link is not a web page.');

    const body = await readLimited(response);
    const page = /text\/plain/i.test(type) ? { title: '', text: body.slice(0, maxPageCharacters) } : extractPage(body);
    return { url: url.toString(), title: page.title || host, text: page.text };
  }

  throw new LinkError('That link redirects too many times.');
}
