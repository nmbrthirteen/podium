import 'server-only';
import dns from 'node:dns';
import http, { type IncomingMessage } from 'node:http';
import https from 'node:https';
import { isIP, type LookupFunction } from 'node:net';
import type { Readable } from 'node:stream';
import { createBrotliDecompress, createGunzip, createInflate } from 'node:zlib';
import { isPrivateAddress } from './address';
import { extractPage, maxPageCharacters } from './html-text';

export class LinkError extends Error {}

export type FetchedPage = { url: string; title: string; text: string };

const maxBytes = 2 * 1024 * 1024;
const maxRedirects = 4;
const timeoutMs = 10_000;
const privateAddressMessage = 'That link points to a private network address.';

// The socket connects to the address this lookup returns, so the check and the connection
// share one answer. Checking first and letting fetch resolve again would allow DNS rebinding.
const publicOnlyLookup: LookupFunction = (hostname, options, callback) => {
  dns.lookup(hostname, { ...options, all: true }, (error, addresses) => {
    if (error) return callback(error, '', 0);

    if (addresses.length === 0 || addresses.some(entry => isPrivateAddress(entry.address))) {
      return callback(
        new LinkError(addresses.length === 0 ? `Could not find ${hostname}.` : privateAddressMessage),
        '',
        0,
      );
    }

    if (options.all) return callback(null, addresses);
    const [first] = addresses;

    return callback(null, first?.address ?? '', first?.family ?? 4);
  });
};

function assertReachable(url: URL) {
  if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new LinkError('Only http and https links work.');
  // Sockets opened for an IP address skip the lookup, so check literals here.
  const literal = url.hostname.replace(/^\[|\]$/g, '');

  if (isIP(literal) && isPrivateAddress(literal)) throw new LinkError(privateAddressMessage);
}

function open(url: URL, signal: AbortSignal) {
  return new Promise<IncomingMessage>((resolve, reject) => {
    const client = url.protocol === 'https:' ? https : http;

    const request = client.request(
      url,
      {
        lookup: publicOnlyLookup,
        signal,
        headers: {
          'user-agent': 'Mozilla/5.0 (compatible; Podium)',
          accept: 'text/html,text/plain;q=0.9',
          'accept-encoding': 'gzip, deflate, br',
        },
      },
      resolve,
    );

    request.on('error', reject);
    request.end();
  });
}

function decoded(response: IncomingMessage): Readable {
  const encoding = String(response.headers['content-encoding'] ?? '').toLowerCase();

  if (encoding === 'gzip') return response.pipe(createGunzip());

  if (encoding === 'deflate') return response.pipe(createInflate());

  if (encoding === 'br') return response.pipe(createBrotliDecompress());

  return response;
}

async function readLimited(response: IncomingMessage) {
  const body = decoded(response);
  const decoder = new TextDecoder();
  let size = 0;
  let text = '';

  for await (const chunk of body) {
    const bytes: Uint8Array = chunk;
    size += bytes.byteLength;
    text += decoder.decode(bytes, { stream: true });

    if (size >= maxBytes) break;
  }

  body.destroy();
  response.destroy();

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
    assertReachable(url);
    const host = url.hostname;

    const response = await open(url, signal).catch(error => {
      if (error instanceof LinkError) throw error;
      throw new LinkError(signal.aborted ? 'The page took longer than 10 seconds.' : `Could not load ${host}.`);
    });

    const status = response.statusCode ?? 0;
    const location = response.headers.location;

    if (status >= 300 && status < 400 && location) {
      response.destroy();

      try {
        url = new URL(location, url);
      } catch {
        throw new LinkError(`${host} redirected to an address that is not valid.`);
      }

      continue;
    }

    if (status < 200 || status >= 300) {
      response.destroy();
      throw new LinkError(`${host} answered with status ${status}.`);
    }

    const type = response.headers['content-type'] ?? '';

    if (!/text\/html|application\/xhtml\+xml|text\/plain/i.test(type)) {
      response.destroy();
      throw new LinkError('That link is not a web page.');
    }

    const body = await readLimited(response).catch(() => {
      throw new LinkError(signal.aborted ? 'The page took longer than 10 seconds.' : `Could not load ${host}.`);
    });

    const page = /text\/plain/i.test(type) ? { title: '', text: body.slice(0, maxPageCharacters) } : extractPage(body);

    return { url: url.toString(), title: page.title || host, text: page.text };
  }

  throw new LinkError('That link redirects too many times.');
}
