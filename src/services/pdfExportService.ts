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

    const imgData = canvas.toDataURL('image/png', 1.0);

    // A4 dimensions in mm: exactly 210mm x 297mm
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = 210;
    const pdfHeight = 297;

    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    // Single-page tolerance (up to 299mm rendered canvas height maps to a single A4 page)
    if (imgHeight <= pdfHeight + 2) {
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, Math.min(imgHeight, pdfHeight), undefined, 'FAST');
    } else {
      // Multi-page slicing if content genuinely exceeds one page
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;

      while (heightLeft > 2) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;
      }
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
