import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PDFExportOptions {
  fileName?: string;
  elementId?: string;
  element?: HTMLElement | null;
  documentNumber?: string;
}

const waitForImages = (el: HTMLElement): Promise<void> => {
  const images = Array.from(el.querySelectorAll('img'));
  const promises = images.map((img) => {
    if (img.complete && img.naturalHeight !== 0) {
      return Promise.resolve();
    }
    return new Promise<void>((resolve) => {
      img.onload = () => resolve();
      img.onerror = () => {
        console.warn('Image failed to load before PDF generation:', img.src);
        resolve(); // Continue even if one image fails
      };
    });
  });
  return Promise.all(promises).then(() => undefined);
};

export const exportToPDF = async ({
  elementId = 'document-print-canvas',
  element: customElement,
  fileName = 'AESCION-Document.pdf',
  documentNumber,
}: PDFExportOptions = {}): Promise<void> => {
  let targetElement = customElement || document.getElementById(elementId);

  if (!targetElement) {
    targetElement =
      document.getElementById('live-preview-a4-canvas') ||
      (document.querySelector('.a4-page') as HTMLElement);
  }

  if (!targetElement) {
    throw new Error('A4 Document element not found for PDF export.');
  }

  if (document.fonts) {
    await document.fonts.ready;
  }
  await waitForImages(targetElement);

  const printRoot = document.getElementById('document-print-root');
  const isInsidePrintRoot =
    printRoot && (targetElement === printRoot || printRoot.contains(targetElement));

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

    const imgData = canvas.toDataURL('image/jpeg', 0.95);

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

    // Single-page tolerance
    if (imgHeight <= pdfHeight + 3) {
      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, Math.min(imgHeight, pdfHeight));
    } else {
      // Multi-page slicing with page numbers
      const totalPages = Math.ceil((imgHeight - 2) / pdfHeight);
      let heightLeft = imgHeight;
      let position = 0;
      let pageNum = 1;

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      addPageFooter(pdf, pageNum, totalPages, documentNumber);
      heightLeft -= pdfHeight;

      while (heightLeft > 3) {
        position -= pdfHeight;
        pdf.addPage();
        pageNum++;
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        addPageFooter(pdf, pageNum, totalPages, documentNumber);
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

function addPageFooter(pdf: jsPDF, page: number, total: number, docNum?: string) {
  if (total <= 1) return;
  pdf.setFontSize(8);
  pdf.setTextColor(150, 150, 150);
  const text = `${docNum ? `${docNum}  |  ` : ''}Page ${page} of ${total}`;
  pdf.text(text, 105, 292, { align: 'center' });
}

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
