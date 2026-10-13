/**
 * PDF Watermark & Luxury Corporate Emblem Utility
 * Automatically injects the official Tides of Knysna secure diagonal watermark
 * and 5-star luxury gold/emerald crest emblem across all generated PDF pages.
 */
import jsPDF from 'jspdf';
import { GUEST_HOUSE_INFO } from '../data/initialData';

export function addPdfWatermarkAndEmblem(pdf: jsPDF, companyInfo?: any) {
  const totalPages = pdf.internal.getNumberOfPages();
  const info = companyInfo || (() => {
    try {
      const saved = localStorage.getItem('tok_exclusive_company_profile_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return GUEST_HOUSE_INFO;
  })();

  const logoUrl = info?.logoUrl || GUEST_HOUSE_INFO.logoUrl;

  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);

    try {
      if (logoUrl && (logoUrl.startsWith('data:image/png') || logoUrl.startsWith('data:image/jpeg'))) {
        const format = logoUrl.includes('jpeg') || logoUrl.includes('jpg') ? 'JPEG' : 'PNG';
        pdf.addImage(logoUrl, format, 15, 6, 28, 12);
      } else {
        // Luxury vector crest badge / emblem & company branding in header
        pdf.setDrawColor(217, 119, 6); // gold border
        pdf.setFillColor(6, 78, 59); // deep emerald fill
        pdf.roundedRect(15, 6, 22, 14, 2, 2, 'FD');
        pdf.setTextColor(255, 255, 255);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9.5);
        pdf.text('TK', 20, 15);

        pdf.setTextColor(15, 23, 42);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10.5);
        pdf.text(info?.name || GUEST_HOUSE_INFO.name, 42, 12);

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7.5);
        pdf.setTextColor(100, 116, 139);
        pdf.text(info?.subTagline || GUEST_HOUSE_INFO.subTagline || 'Exclusive Guest House & Luxury Estates', 42, 17);
      }
    } catch (e) {
      // Fallback emblem
      pdf.setDrawColor(217, 119, 6);
      pdf.setFillColor(6, 78, 59);
      pdf.roundedRect(15, 6, 22, 14, 2, 2, 'FD');
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9.5);
      pdf.text('TK', 20, 15);
    }
  }
}
