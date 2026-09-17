import JSZip from 'jszip';

function escapePdfText(text: string) {
  return text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

export function makePdf(pages: string[][]) {
  const objects: string[] = [];
  const pageIds = pages.map((_, index) => 4 + index * 2);

  objects[1] = '<< /Type /Catalog /Pages 2 0 R >>';
  objects[2] = `<< /Type /Pages /Kids [${pageIds.map(id => `${id} 0 R`).join(' ')}] /Count ${pages.length} >>`;
  objects[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';

  pages.forEach((lines, index) => {
    const pageId = pageIds[index] ?? 0;
    const contentId = pageId + 1;
    const body = `BT /F1 18 Tf 50 700 Td ${lines.map(line => `(${escapePdfText(line)}) Tj 0 -24 Td`).join(' ')} ET`;
    objects[pageId] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentId} 0 R >>`;
    objects[contentId] = `<< /Length ${body.length} >>\nstream\n${body}\nendstream`;
  });

  let output = '%PDF-1.4\n';
  const offsets: number[] = [];
  for (let id = 1; id < objects.length; id += 1) {
    offsets[id] = output.length;
    output += `${id} 0 obj\n${objects[id]}\nendobj\n`;
  }
  const xrefStart = output.length;
  output += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for (let id = 1; id < objects.length; id += 1) {
    output += `${String(offsets[id]).padStart(10, '0')} 00000 n \n`;
  }
  output += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;
  return new TextEncoder().encode(output);
}

type PptxSlide = { title: string; body: string[]; notes?: string };

const paragraph = (text: string) => `<a:p><a:r><a:rPr lang="en-US"/><a:t>${text}</a:t></a:r></a:p>`;

export async function makePptx(slides: PptxSlide[]) {
  const zip = new JSZip();
  const fileNumbers = slides.map((_, index) => slides.length - index);

  const sldIds = slides.map((_, index) => `<p:sldId id="${256 + index}" r:id="rId${index + 10}"/>`).join('');
  zip.file(
    'ppt/presentation.xml',
    `<?xml version="1.0"?><p:presentation xmlns:p="p" xmlns:r="r"><p:sldIdLst>${sldIds}</p:sldIdLst></p:presentation>`,
  );
  const presentationRels = slides
    .map(
      (_, index) =>
        `<Relationship Id="rId${index + 10}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${fileNumbers[index]}.xml"/>`,
    )
    .join('');
  zip.file(
    'ppt/_rels/presentation.xml.rels',
    `<?xml version="1.0"?><Relationships xmlns="r"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>${presentationRels}</Relationships>`,
  );

  slides.forEach((slide, index) => {
    const fileNumber = fileNumbers[index];
    zip.file(
      `ppt/slides/slide${fileNumber}.xml`,
      `<?xml version="1.0"?><p:sld><p:cSld><p:spTree><p:sp><p:nvSpPr><p:nvPr><p:ph type="title"/></p:nvPr></p:nvSpPr><p:txBody>${paragraph(slide.title)}</p:txBody></p:sp><p:sp><p:txBody>${slide.body.map(paragraph).join('')}</p:txBody></p:sp></p:spTree></p:cSld></p:sld>`,
    );
    if (slide.notes) {
      zip.file(
        `ppt/slides/_rels/slide${fileNumber}.xml.rels`,
        `<?xml version="1.0"?><Relationships xmlns="r"><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/notesSlide" Target="../notesSlides/notesSlide${fileNumber}.xml"/></Relationships>`,
      );
      zip.file(
        `ppt/notesSlides/notesSlide${fileNumber}.xml`,
        `<?xml version="1.0"?><p:notes><p:cSld><p:spTree><p:sp><p:txBody>${paragraph(slide.notes)}</p:txBody></p:sp><p:sp><p:txBody><a:p><a:fld id="{1}" type="slidenum"><a:t>${index + 1}</a:t></a:fld></a:p></p:txBody></p:sp></p:spTree></p:cSld></p:notes>`,
      );
    }
  });

  return zip.generateAsync({ type: 'uint8array' });
}

export function sampleSlides(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    title: `Slide ${index + 1} title`,
    body:
      index === 5
        ? [Array.from({ length: 58 }, (_, word) => `word${word}`).join(' ')]
        : [`Point for slide ${index + 1}`, 'Revenue grew 12% &amp; costs fell'],
    notes: index % 2 === 0 ? `Say the number for slide ${index + 1} &lt;slowly&gt;` : undefined,
  }));
}
