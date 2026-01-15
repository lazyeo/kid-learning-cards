import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { toast } from 'react-hot-toast';

interface PDFOptions {
  elementId?: string; // Option to pass ID directly
  element?: HTMLElement; // Option to pass element ref
}

interface DownloadOptions extends PDFOptions {
  filename?: string;
}

const createPDF = async ({ elementId, element }: PDFOptions): Promise<jsPDF | null> => {
  const targetElement = element || (elementId ? document.getElementById(elementId) : null);

  if (!targetElement) {
    console.error('PDF creation failed: Target element not found');
    return null;
  }

  try {
    // 获取内容的原始尺寸（未缩放）
    // ScaledPreview 组件内部内容固定为 800px 宽度
    const PRINT_WIDTH = 800;

    // 临时移除 transform 以获取真实高度
    const originalTransform = targetElement.style.transform;
    const originalWidth = targetElement.style.width;
    targetElement.style.transform = 'none';
    targetElement.style.width = `${PRINT_WIDTH}px`;

    // 强制重排以获取正确尺寸
    const elementHeight = targetElement.scrollHeight;

    // 恢复原始样式
    targetElement.style.transform = originalTransform;
    targetElement.style.width = originalWidth;

    // 2. Capture the element as an image using html-to-image
    // Force transform: none on cloned node to avoid capturing scaled preview
    const dataUrl = await toPng(targetElement, {
      pixelRatio: 2, // Higher resolution for print quality
      backgroundColor: '#ffffff',
      width: PRINT_WIDTH,
      height: elementHeight,
      style: {
        transform: 'none',
        transformOrigin: 'top left',
        width: `${PRINT_WIDTH}px`,
      },
    });

    // 3. Initialize PDF (A4 size)
    const imgWidth = 210; // mm
    const pageHeight = 297; // mm

    // Calculate image height preserving aspect ratio
    const imgHeight = (elementHeight * imgWidth) / PRINT_WIDTH;

    const pdf = new jsPDF('p', 'mm', 'a4');

    // 4. Add image to PDF
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(dataUrl, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // 5. Handle multi-page
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(dataUrl, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    return pdf;
  } catch (error) {
    console.error('PDF creation failed:', error);
    throw error;
  }
};

export const downloadPDF = async ({ filename = 'worksheet', ...options }: DownloadOptions) => {
  const toastId = toast.loading('正在生成 PDF...');

  try {
    const pdf = await createPDF(options);
    if (!pdf) {
      toast.error('无法找到要下载的内容', { id: toastId });
      return;
    }

    pdf.save(`${filename}-${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('PDF 下载成功！', { id: toastId });
  } catch (error) {
    console.error('PDF generation failed:', error);
    toast.error('PDF 生成失败，请重试', { id: toastId });
  }
};

export const printPDF = async (options: PDFOptions) => {
  const toastId = toast.loading('正在准备打印...');

  try {
    const pdf = await createPDF(options);
    if (!pdf) {
      toast.error('无法找到要打印的内容', { id: toastId });
      return;
    }

    // Add auto-print script to the PDF
    pdf.autoPrint();

    // Open PDF in new window
    const blob = pdf.output('blob');
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url);

    if (printWindow) {
      toast.success('打印预览已打开', { id: toastId });
    } else {
      toast.error('请允许弹出窗口以进行打印', { id: toastId });
    }

    // Cleanup URL after a delay
    setTimeout(() => URL.revokeObjectURL(url), 60000);

  } catch (error) {
    console.error('Print preparation failed:', error);
    toast.error('打印准备失败，请重试', { id: toastId });
  }
};
