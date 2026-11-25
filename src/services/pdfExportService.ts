import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PDFExportOptions {
  fileName?: string;
  elementId?: string;
  element?: HTMLElement | null;
}

const waitForImages = (el: HTMLElement): Promise<void> => {
  const images = Array.from(el.querySelectorAll('img'));
  const promises = images.map((img) => {
    if (img.complete && img.naturalHeight !== 0) {
      return Promise.resolve();
    }
    return new Promise<void>((resolve) => {
      img.onload = () => resolve();
      img.onerror = () => resolve();
    });
  });
  return Promise.all(promises).then(() => undefined);
};

interface AtomicBlock {
  top: number;
  bottom: number;
}

interface PageSlice {
  startDomY: number;
  endDomY: number;
  topOffsetMm: number;
}

/**
 * Collects non-splittable atomic vertical intervals (table rows, cards, headers, footers)
 * relative to the document root element so PDF page breaks only occur in gaps between blocks.
 */
const collectAtomicBlocks = (rootEl: HTMLElement): AtomicBlock[] => {
  const rootRect = rootEl.getBoundingClientRect();
  const candidates = Array.from(
    rootEl.querySelectorAll<HTMLElement>('thead tr, tbody tr, .break-inside-avoid')
  );

  // Keep only atomic leaf blocks (skip .break-inside-avoid wrappers that contain other tracked blocks)
  const leafBlocks = candidates.filter(
    (el) => !candidates.some((other) => other !== el && el.contains(other))
  );

  const blocks: AtomicBlock[] = [];
  for (const el of leafBlocks) {
    const rect = el.getBoundingClientRect();
    if (rect.height <= 0) continue;
    blocks.push({
      top: rect.top - rootRect.top,
      bottom: rect.bottom - rootRect.top,
    });
  }

  blocks.sort((a, b) => a.top - b.top);
  return blocks;
};

/**
 * Computes smart A4 page slices (in DOM px) that never cut through an atomic block
 * and preserve clean top/bottom margins on continuation pages.
 */
const computePageSlices = (
  rootEl: HTMLElement,
  totalDomHeight: number,
  pxPerMm: number
): PageSlice[] => {
  const a4HeightMm = 297;
  const pageMarginMm = 8;

  // Page 1 already has 8mm top padding inside .a4-page; stop 8mm before bottom edge
  const page1MaxDomY = (a4HeightMm - pageMarginMm) * pxPerMm;
  // Continuation pages get 8mm top margin + 8mm bottom margin
  const nextPageUsableDomH = (a4HeightMm - pageMarginMm * 2) * pxPerMm;

  // If the entire document fits comfortably on a single A4 page (2mm tolerance)
  if (totalDomHeight <= (a4HeightMm + 2) * pxPerMm) {
    return [{ startDomY: 0, endDomY: totalDomHeight, topOffsetMm: 0 }];
  }

  const blocks = collectAtomicBlocks(rootEl);
  if (blocks.length === 0) {
    // Fallback to uniform slices if no atomic blocks found
    const slices: PageSlice[] = [];
    let cursor = 0;
    let isFirst = true;
    while (cursor < totalDomHeight - 2) {
      const limit = isFirst ? page1MaxDomY : cursor + nextPageUsableDomH;
      const end = Math.min(totalDomHeight, limit);
      slices.push({
        startDomY: cursor,
        endDomY: end,
        topOffsetMm: isFirst ? 0 : pageMarginMm,
      });
      cursor = end;
      isFirst = false;
    }
    return slices;
  }

  const slices: PageSlice[] = [];
  let pageStart = 0;
  let pageLimit = page1MaxDomY;
  let prevBottom = 0;
  let isFirstPage = true;

  for (const block of blocks) {
    if (block.bottom <= pageLimit) {
      prevBottom = Math.max(prevBottom, block.bottom);
      continue;
    }

    // Block crosses the current page limit
    if (block.top > pageStart + 4) {
      // Cut cleanly in the midpoint of the whitespace gap before this block
      const gapCut =
        prevBottom > pageStart && block.top > prevBottom
          ? (prevBottom + block.top) / 2
          : Math.max(pageStart, block.top - 1);

      slices.push({
        startDomY: pageStart,
        endDomY: gapCut,
        topOffsetMm: isFirstPage ? 0 : pageMarginMm,
      });

      pageStart = gapCut;
      isFirstPage = false;
      pageLimit = pageStart + nextPageUsableDomH;
    }

    // If a single block itself exceeds one full page, advance limit past it
    while (block.bottom > pageLimit) {
      pageLimit += nextPageUsableDomH;
    }
    prevBottom = Math.max(prevBottom, block.bottom);
  }

  if (pageStart < totalDomHeight - 2) {
    slices.push({
      startDomY: pageStart,
      endDomY: totalDomHeight,
      topOffsetMm: isFirstPage ? 0 : pageMarginMm,
    });
  }

  return slices;
};

export const exportToPDF = async ({
  elementId = 'document-print-canvas',
  element: customElement,
  fileName = 'AESCION-Document.pdf',
}: PDFExportOptions = {}): Promise<void> => {
  let targetElement = customElement || document.getElementById(elementId);

  // Fallback if specific canvas id is not found
  if (!targetElement) {
    targetElement = document.getElementById('live-preview-a4-canvas') || (document.querySelector('.a4-page') as HTMLElement);
  }

  if (!targetElement) {
    throw new Error('A4 Document element not found for PDF export.');
  }

  // Ensure web fonts and images are completely loaded before capturing
  if (document.fonts) {
    await document.fonts.ready;
  }
  await waitForImages(targetElement);

  // If targetElement is inside #document-print-root, make it temporarily active in fixed off-screen position for capture
  const printRoot = document.getElementById('document-print-root');
  const isInsidePrintRoot = printRoot && (targetElement === printRoot || printRoot.contains(targetElement));

  const originalDisplay = printRoot ? printRoot.style.display : '';
  const originalPosition = printRoot ? printRoot.style.position : '';
  const originalLeft = printRoot ? printRoot.style.left : '';
  const originalTop = printRoot ? printRoot.style.top : '';
  const originalWidth = printRoot ? printRoot.style.width : '';
  const originalOpacity = printRoot ? printRoot.style.opacity : '';
  const originalZIndex = printRoot ? printRoot.style.zIndex : '';

  if (isInsidePrintRoot && printRoot) {
    printRoot.style.display = 'block';
    printRoot.style.position = 'fixed';
    printRoot.style.left = '-9999px';
    printRoot.style.top = '0';
    printRoot.style.width = '210mm';
    printRoot.style.opacity = '1';
    printRoot.style.zIndex = '-1000';
  }

  try {
    // Measure DOM layout before html2canvas capture so page slices match exact block boundaries
    const elRect = targetElement.getBoundingClientRect();
    const domWidth = elRect.width || targetElement.offsetWidth;
    const domHeight = elRect.height || targetElement.offsetHeight;
    const pxPerMm = domWidth / 210;
    const pageSlices = computePageSlices(targetElement, domHeight, pxPerMm);

    // Capture canvas with 2.5x high-DPI scaling
    const canvas = await html2canvas(targetElement, {
      scale: 2.5,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      scrollX: 0,
      scrollY: 0,
      windowWidth: 1200,
      onclone: (clonedDoc) => {
        const clonedEl =
          clonedDoc.getElementById(targetElement!.id) ||
          (clonedDoc.querySelector('.a4-page') as HTMLElement);

        if (clonedEl) {
          clonedEl.style.transform = 'none';
          clonedEl.style.margin = '0 auto';
          clonedEl.style.boxShadow = 'none';

          // Remove scaling and padding anomalies from all parent wrappers in clone
          let parent = clonedEl.parentElement;
          while (parent) {
            parent.style.transform = 'none';
            parent.style.margin = '0';
            parent.style.padding = '0';
            parent.style.overflow = 'visible';
            parent = parent.parentElement;
          }
        }
      },
    });

    // A4 dimensions in mm: exactly 210mm x 297mm
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = 210;
    const pdfHeight = 297;
    const domToCanvas = canvas.width / domWidth;

    if (pageSlices.length <= 1) {
      const imgData = canvas.toDataURL('image/png', 1.0);
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, Math.min(imgHeight, pdfHeight), undefined, 'FAST');
    } else {
      const sliceCanvas = document.createElement('canvas');
      const sliceCtx = sliceCanvas.getContext('2d');

      pageSlices.forEach((slice, idx) => {
        if (idx > 0) {
          pdf.addPage();
        }

        const sy = Math.max(0, Math.round(slice.startDomY * domToCanvas));
        const ey = Math.min(canvas.height, Math.round(slice.endDomY * domToCanvas));
        const sh = Math.max(1, ey - sy);

        sliceCanvas.width = canvas.width;
        sliceCanvas.height = sh;

        if (sliceCtx) {
          sliceCtx.fillStyle = '#ffffff';
          sliceCtx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
          sliceCtx.drawImage(canvas, 0, sy, canvas.width, sh, 0, 0, canvas.width, sh);
        }

        const sliceImgData = sliceCanvas.toDataURL('image/png', 1.0);
        const sliceHeightMm = (sh * pdfWidth) / canvas.width;
        const maxDrawHeight = pdfHeight - slice.topOffsetMm;

        pdf.addImage(
          sliceImgData,
          'PNG',
          0,
          slice.topOffsetMm,
          pdfWidth,
          Math.min(sliceHeightMm, maxDrawHeight),
          undefined,
          'FAST'
        );
      });
    }

    pdf.save(fileName);
  } finally {
    if (isInsidePrintRoot && printRoot) {
      printRoot.style.display = originalDisplay;
      printRoot.style.position = originalPosition;
      printRoot.style.left = originalLeft;
      printRoot.style.top = originalTop;
      printRoot.style.width = originalWidth;
      printRoot.style.opacity = originalOpacity;
      printRoot.style.zIndex = originalZIndex;
    }
  }
};

export const printDocument = (): void => {
  const triggerPrint = () => {
    window.focus();
    window.print();
  };

  const printRoot = document.getElementById('document-print-root');
  if (document.fonts) {
    document.fonts.ready.then(() => {
      if (printRoot) {
        waitForImages(printRoot).then(triggerPrint);
      } else {
        triggerPrint();
      }
    });
  } else {
    triggerPrint();
  }
};
