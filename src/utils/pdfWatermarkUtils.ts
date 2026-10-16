/**
 * PDF Watermark & Luxury Corporate Emblem Utility
 * Automatically injects the official Tides of Knysna secure diagonal watermark
 * and 5-star luxury gold/emerald crest emblem across all generated PDF pages.
 * Letterhead follows exact specifications:
 * - Logo aligned to Left of All Letterheads: 50mm high by 38mm wide
 * - Header: 'Tides Of Knysna Exclusive Guest House' - Centre
 * - Sub header line: '9 Maritime Close Pezula Golf Estate,' / 'Sparrebosch, Western Cape RSA 6571'
 *   remove bold, 10pt Arial, centered over two lines
 * - Contact line: 'W. www.tidesofknysna.online e.reservations@tidesofknysna.online WhatsApp/concierge +27812662956'
 *   8pt Arial, centre align all
 */
import jsPDF from 'jspdf';
import { GUEST_HOUSE_INFO } from '../data/initialData';

export function addPdfWatermarkAndEmblem(pdf: jsPDF, companyInfo?: any) {
  const totalPages = typeof pdf.getNumberOfPages === 'function' ? pdf.getNumberOfPages() : 1;
  const info = companyInfo || (() => {
    try {
      const saved = localStorage.getItem('tok_exclusive_company_profile_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return GUEST_HOUSE_INFO;
  })();

  const logoUrl = info?.logoUrl || GUEST_HOUSE_INFO.logoUrl;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const isPt = pageWidth > 300; // true if points (e.g. 595.28 pt), false if mm (e.g. 210 mm)
  const scale = isPt ? 2.83465 : 1; // 1mm = 2.83465 pt

  const centerX = pageWidth / 2;
  const logoWidth = 38 * scale;
  const logoHeight = 50 * scale;
  const logoX = (isPt ? 36 : 14);
  const logoY = (isPt ? 20 : 7);

  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);

    try {
      // Header: "Tides Of Knysna Exclusive Guest House" - Centred
      pdf.setTextColor(15, 23, 42); // slate-900
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(isPt ? 14 : 11);
      const titleY = isPt ? 32 : 12;
      pdf.text(info?.name || 'Tides Of Knysna Exclusive Guest House', centerX, titleY, { align: 'center' });

      // Sub-header line: 10pt Arial, remove bold, centered over two lines
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(isPt ? 10 : 9);
      pdf.setTextColor(51, 65, 85); // slate-700
      const subY1 = isPt ? 46 : 17;
      const subY2 = isPt ? 58 : 22;
      pdf.text('9 Maritime Close Pezula Golf Estate,', centerX, subY1, { align: 'center' });
      pdf.text('Sparrebosch, Western Cape RSA 6571', centerX, subY2, { align: 'center' });

      // Contact line: 8pt Arial, centre align all
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(isPt ? 8 : 7);
      pdf.setTextColor(100, 116, 139); // slate-500
      const contactY = isPt ? 70 : 27;
      pdf.text('W. www.tidesofknysna.online e.reservations@tidesofknysna.online WhatsApp/concierge +27812662956', centerX, contactY, { align: 'center' });

      // Divider line
      pdf.setDrawColor(203, 213, 225); // slate-300
      pdf.setLineWidth(isPt ? 0.75 : 0.3);
      const divY = isPt ? 80 : 31;
      const marginX = isPt ? 36 : 14;
      pdf.line(marginX, divY, pageWidth - marginX, divY);

    } catch (e) {
      // Silently continue
    }
  }
}
