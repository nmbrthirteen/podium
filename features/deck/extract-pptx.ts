import path from 'node:path';
import JSZip from 'jszip';
import { decodeEntities } from '@/features/links/html-text';
import { DeckError, type ExtractedSlide, toExtractedSlide } from './extracted-slide';

function attribute(tag: string, name: string) {
  const match = tag.match(new RegExp(`\\b${name}="([^"]*)"`));

  return match?.[1] ?? null;
}

function relationships(xml: string) {
  return [...xml.matchAll(/<Relationship\b([^>]*?)\/?>/g)].map(match => {
    const tag = match[1] ?? '';

    return { id: attribute(tag, 'Id'), type: attribute(tag, 'Type') ?? '', target: attribute(tag, 'Target') ?? '' };
  });
}

function resolvePart(baseDir: string, target: string) {
  if (target.startsWith('/')) return target.slice(1);

  return path.posix.normalize(path.posix.join(baseDir, target));
}

function paragraphs(xml: string) {
  const withoutSlideNumbers = xml.replace(/<a:fld\b[^>]*type="slidenum"[^>]*>[\s\S]*?<\/a:fld>/g, '');

  return withoutSlideNumbers
    .split(/<\/a:p>/)
    .map(paragraph =>
      [...paragraph.matchAll(/<a:t(?:\s[^>]*)?>([\s\S]*?)<\/a:t>/g)]
        .map(match => decodeEntities(match[1] ?? ''))
        .join(''),
    )
    .map(text => text.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

async function readPart(zip: JSZip, part: string) {
  return zip.file(part)?.async('string') ?? null;
}

export async function extractPptx(data: Uint8Array): Promise<ExtractedSlide[]> {
  let zip: JSZip;

  try {
    zip = await JSZip.loadAsync(data);
  } catch {
    throw new DeckError('This file is not a readable PPTX. Export the deck again as PPTX or PDF, then upload it.');
  }

  const presentation = await readPart(zip, 'ppt/presentation.xml');
  const presentationRels = await readPart(zip, 'ppt/_rels/presentation.xml.rels');

  if (!presentation || !presentationRels) {
    throw new DeckError('This file is not a PowerPoint deck. Export it as PPTX or PDF, then upload it.');
  }

  const targets = new Map(relationships(presentationRels).map(rel => [rel.id, rel.target]));

  const slideRelIds = [...presentation.matchAll(/<p:sldId\b([^>]*?)\/?>/g)].flatMap(match => {
    const id = attribute(match[1] ?? '', 'r:id');

    return id === null ? [] : [id];
  });

  const slides: ExtractedSlide[] = [];

  for (const relId of slideRelIds) {
    const target = targets.get(relId);

    if (!target) continue;
    const slidePart = resolvePart('ppt', target);
    const slideXml = await readPart(zip, slidePart);

    if (!slideXml) continue;

    const slideDir = path.posix.dirname(slidePart);
    const slideRels = await readPart(zip, `${slideDir}/_rels/${path.posix.basename(slidePart)}.rels`);

    const notesTarget = slideRels
      ? relationships(slideRels).find(rel => rel.type.endsWith('/notesSlide'))?.target
      : undefined;

    const notesXml = notesTarget ? await readPart(zip, resolvePart(slideDir, notesTarget)) : null;

    slides.push(
      toExtractedSlide(
        slides.length + 1,
        paragraphs(slideXml).join('\n'),
        notesXml ? paragraphs(notesXml).join('\n') : '',
      ),
    );
  }

  if (slides.length === 0) throw new DeckError('This deck has no slides. Check the file, then upload it again.');

  return slides;
}
