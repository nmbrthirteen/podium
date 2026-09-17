const thumbnailWidth = 320;

export async function renderPdfThumbnails(file: File, onProgress?: (done: number, total: number) => void) {
  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerPort ??= new Worker(new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url), {
    type: 'module',
  });

  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) });
  const thumbnails = new Map<number, Blob>();

  try {
    const document = await loadingTask.promise;
    for (let number = 1; number <= document.numPages; number += 1) {
      const page = await document.getPage(number);
      const base = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({ scale: thumbnailWidth / base.width });
      const canvas = window.document.createElement('canvas');
      canvas.width = Math.round(viewport.width);
      canvas.height = Math.round(viewport.height);
      await page.render({ canvas, viewport }).promise;
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
      if (blob) thumbnails.set(number, blob);
      page.cleanup();
      onProgress?.(number, document.numPages);
    }
  } finally {
    await loadingTask.destroy();
  }

  return thumbnails;
}
