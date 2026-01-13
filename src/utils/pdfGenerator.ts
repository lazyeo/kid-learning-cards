import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { toast } from 'react-hot-toast';

interface DownloadOptions {
  filename?: string;
  elementId?: string; // Option to pass ID directly
  element?: HTMLElement; // Option to pass element ref
}

export const downloadPDF = async ({ filename = 'worksheet', elementId, element }: DownloadOptions) => {
  const targetElement = element || (elementId ? document.getElementById(elementId) : null);

  if (!targetElement) {
    console.error('Download failed: Target element not found');
    toast.error('无法找到要下载的内容');
    return;
  }

  const toastId = toast.loading('正在生成 PDF...');

  try {
    // 1. Capture the element as a canvas
    const canvas = await html2canvas(targetElement, {
      scale: 2, // Higher scale for better quality
      useCORS: true, // Allow loading cross-origin images
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: targetElement.scrollWidth,
      windowHeight: targetElement.scrollHeight
    });

    // 2. Initialize PDF (A4 size)
    // A4 dimensions in mm: 210 x 297
    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const pdf = new jsPDF('p', 'mm', 'a4');

    // 3. Add image to PDF
    // If content height exceeds A4, handle pagination (basic implementation usually fits one page for now)
    // For now we assume single page worksheets as per current design

    const imgData = canvas.toDataURL('image/png');

    // Check if content is taller than one page
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Handle multi-page (if content overflows significantly)
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // 4. Save
    pdf.save(`${filename}-${new Date().toISOString().split('T')[0]}.pdf`);

    toast.success('PDF 下载成功！', { id: toastId });
  } catch (error) {
    console.error('PDF generation failed:', error);
    toast.error('PDF 生成失败，请重试', { id: toastId });
  }
};
