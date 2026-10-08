import React, { useState } from 'react';
import jsPDF from 'jspdf';
import { 
  FileText, 
  Printer, 
  Download, 
  Share2, 
  Mail, 
  Check, 
  CheckCircle, 
  Clock, 
  Calendar, 
  MapPin, 
  Phone, 
  Wifi, 
  ShieldCheck, 
  Sparkles, 
  Compass, 
  Receipt, 
  FileCheck, 
  HeartHandshake, 
  HelpCircle, 
  Send, 
  ExternalLink, 
  Upload, 
  Trash2, 
  FolderOpen,
  DollarSign,
  ChevronRight,
  AlertTriangle,
  Award,
  BedDouble,
  Tag
} from 'lucide-react';
import { Reservation, AttractionItem } from '../types';
import { GUEST_HOUSE_INFO, ATTRACTIONS_DIRECTORY } from '../data/initialData';
import { CompanyInfoData } from './CompanyInfoModule';
import { WhatsAppIcon } from './GuestPortal';

export type GuestDocType = 
  | 'invoice' 
  | 'prearrival' 
  | 'deposit' 
  | 'welcome' 
  | 'policies' 
  | 'statement' 
  | 'farewell' 
  | 'feedback' 
  | 'refund' 
  | 'newsletter' 
  | 'specials' 
  | 'sightseeing' 
  | 'wifi' 
  | 'emergency';

export interface UploadedPolicyDocument {
  id: string;
  title: string;
  category: string;
  strictness: 'Mandatory' | 'Standard' | 'Information';
  fileName: string;
  fileSize: string;
  fileType: string;
  uploadedAt: string;
  uploadedBy: 'Admin' | 'Guest';
  dataUrl?: string;
  notes?: string;
}

const DEFAULT_UPLOADED_POLICIES: UploadedPolicyDocument[] = [
  {
    id: 'up-pol-1',
    title: 'TGCSA 5-Star Graded Guest Estate Bylaws & Code of Conduct',
    category: 'Estate Bylaws',
    strictness: 'Mandatory',
    fileName: 'Tides_of_Knysna_Official_Bylaws_2026.pdf',
    fileSize: '412 KB',
    fileType: 'application/pdf',
    uploadedAt: '2026-09-15 09:30',
    uploadedBy: 'Admin',
    notes: 'Official Tourism Grading Council South Africa luxury estate compliance documentation.'
  },
  {
    id: 'up-pol-2',
    title: 'Knysna Ramsar Environmental Lagoon Protection Protocol',
    category: 'Environmental Sanctuary',
    strictness: 'Mandatory',
    fileName: 'Knysna_Lagoon_Sanctuary_Quiet_Hours_Gazette.pdf',
    fileSize: '284 KB',
    fileType: 'application/pdf',
    uploadedAt: '2026-09-18 14:10',
    uploadedBy: 'Admin',
    notes: 'Mandatory silence hours (22:00 - 07:00) and marine sanctuary protection guidelines.'
  },
  {
    id: 'up-pol-3',
    title: 'Water Safety, Heated Plunge Pool & Kayak Indemnity Protocol',
    category: 'Safety & Indemnity',
    strictness: 'Standard',
    fileName: 'Kayak_and_Pool_Safety_Guidelines.pdf',
    fileSize: '198 KB',
    fileType: 'application/pdf',
    uploadedAt: '2026-09-22 11:45',
    uploadedBy: 'Admin',
    notes: 'Certified lifejacket requirements and complimentary kayak navigation zone map.'
  }
];

interface GuestFolderModuleProps {
  reservation: Reservation;
  companyInfo?: CompanyInfoData;
  onClose?: () => void;
  isAdminView?: boolean;
}

export const GuestFolderModule: React.FC<GuestFolderModuleProps> = ({
  reservation,
  companyInfo,
  onClose,
  isAdminView = false
}) => {
  const [activeDoc, setActiveDoc] = useState<GuestDocType>('invoice');
  const [shareFeedbackNotice, setShareFeedbackNotice] = useState<string | null>(null);
  const [uploadedPolicies, setUploadedPolicies] = useState<UploadedPolicyDocument[]>(() => {
    try {
      const saved = localStorage.getItem('tok_uploaded_policy_docs_v2');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load uploaded policies', e);
    }
    return DEFAULT_UPLOADED_POLICIES;
  });

  const [policyUploadTitle, setPolicyUploadTitle] = useState('');
  const [policyUploadCategory, setPolicyUploadCategory] = useState('Estate Protocol');
  const [policyUploadStrictness, setPolicyUploadStrictness] = useState<'Mandatory' | 'Standard' | 'Information'>('Mandatory');
  const [isUploading, setIsUploading] = useState(false);

  const dutyManagerMobile = companyInfo?.mobile || GUEST_HOUSE_INFO.mobile;
  const cleanManagerMobile = dutyManagerMobile.replace(/[^0-9]/g, '');
  const guestFullName = `${reservation.customerName} ${reservation.customerSurname}`.trim();
  const guestEmail = reservation.email || 'guest@example.com';
  const roomPinCode = `*${reservation.roomNumber}${reservation.customerSurname.length}7#`;
  const wifiNetwork = 'TidesExclusive_Guest5G';
  const wifiPassword = 'LagoonView2026!';

  // Document navigation items list
  const docNavItems: { id: GuestDocType; title: string; subtitle: string; icon: any; badge?: string }[] = [
    { id: 'invoice', title: '1. Tax Invoice & Fiscal Receipt', subtitle: 'VAT breakdown, payment status & bank details', icon: Receipt, badge: reservation.paymentStatus },
    { id: 'prearrival', title: '2. Pre-Arrival Letter & Route', subtitle: 'Check-in window, GPS coordinates & directions', icon: Mail },
    { id: 'deposit', title: '3. Deposit Guarantee Receipt', subtitle: 'Breakage deposit pre-authorization & terms', icon: DollarSign, badge: `R ${reservation.breakageDepositAmount}` },
    { id: 'welcome', title: '4. Personalized Welcome Letter', subtitle: 'Suite welcome, arrival & departure schedule', icon: Sparkles },
    { id: 'policies', title: '5. Estate Policies & House Rules', subtitle: 'Quiet hours, non-smoking & sanctuary bylaws', icon: ShieldCheck },
    { id: 'statement', title: '6. Guest Folio Statement', subtitle: 'Itemized billing folio and closing ledger balance', icon: FileText },
    { id: 'farewell', title: '7. Farewell & Check-Out Dossier', subtitle: '10:30 check-out protocol & departure transfer', icon: HeartHandshake },
    { id: 'feedback', title: '8. Guest Feedback & Review Form', subtitle: '5-star hospitality survey & digital sign-off', icon: FileCheck },
    { id: 'refund', title: '9. Deposit Refund Clearance', subtitle: 'Room inspection sign-off & release guarantee', icon: Award },
    { id: 'newsletter', title: '10. Knysna Gazette Newsletter', subtitle: 'Lagoon conservation, festivals & eco-catamarans', icon: BookUserIcon },
    { id: 'specials', title: '11. Exclusive Resident Specials', subtitle: 'Return vouchers, 15% VIP discount & promo codes', icon: Tag },
    { id: 'sightseeing', title: '12. Curated Sightseeing Guide', subtitle: 'Attractions, distance, hours & GPS coordinates', icon: Compass },
    { id: 'wifi', title: '13. Wi-Fi Access Certificate', subtitle: '200Mbps uncapped fibre network & password code', icon: Wifi },
    { id: 'emergency', title: '14. Emergency Numbers Directory', subtitle: 'SAPS police, NSRI rescue, hospital & butler hotline', icon: Phone }
  ];

  // Universal Print Document Action
  const handlePrintDocument = () => {
    window.print();
  };

  // Download Document as Official Adobe PDF with Corporate Branding
  const handleDownloadAdobePdf = (docName: string) => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const companyTitle = companyInfo?.name || GUEST_HOUSE_INFO.name;
      const companySub = companyInfo?.subtitle || 'EXCLUSIVE GUEST HOUSE • 5-STAR BOUTIQUE RETREAT';
      const companyAddr = companyInfo?.address || GUEST_HOUSE_INFO.address;
      const companyTel = companyInfo?.mobile || GUEST_HOUSE_INFO.mobile;
      const companyEmail = companyInfo?.email || GUEST_HOUSE_INFO.email;

      // Header background
      pdf.setFillColor(6, 78, 59); // deep emerald
      pdf.rect(0, 0, 210, 32, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.text(companyTitle.toUpperCase(), 15, 12);

      pdf.setFontSize(9);
      pdf.setTextColor(217, 119, 6); // gold
      pdf.text(companySub, 15, 19);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7.5);
      pdf.setTextColor(200, 200, 200);
      pdf.text(`${companyAddr} | Tel: ${companyTel} | ${companyEmail} | VAT: 4890281928`, 15, 26);

      // Dossier Banner
      pdf.setFillColor(240, 253, 244);
      pdf.setDrawColor(16, 185, 129);
      pdf.rect(15, 38, 180, 16, 'FD');
      pdf.setTextColor(6, 78, 59);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.text(`OFFICIAL GUEST DOSSIER: ${docName.toUpperCase()}`, 20, 48);

      // Metadata block
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(15, 23, 42);

      let yPos = 62;
      pdf.text(`Guest: ${guestFullName}`, 15, yPos);
      pdf.text(`Ref: ${reservation.reservationNumber}`, 120, yPos);
      yPos += 6;
      pdf.text(`Suite: Room ${reservation.roomNumber} (${reservation.roomAllocation})`, 15, yPos);
      pdf.text(`Status: ${reservation.paymentStatus} (${reservation.paymentMethod})`, 120, yPos);
      yPos += 6;
      pdf.text(`Dates: ${reservation.checkInDate} to ${reservation.checkOutDate} (${reservation.totalNights} Nights)`, 15, yPos);
      pdf.text(`Door PIN: ${roomPinCode} | Wi-Fi: ${wifiPassword}`, 120, yPos);

      yPos += 8;
      pdf.setDrawColor(203, 213, 225);
      pdf.line(15, yPos, 195, yPos);

      yPos += 8;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(15, 23, 42);
      pdf.text('Document Content & Terms:', 15, yPos);

      yPos += 6;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8.5);
      pdf.setTextColor(51, 65, 85);

      const el = document.getElementById('guest-printable-document-canvas');
      const textContent = el ? el.innerText : `Official document ${docName} for ${guestFullName}.`;
      const splitText = pdf.splitTextToSize(textContent, 180);

      let lineIdx = 0;
      while (lineIdx < splitText.length) {
        if (yPos > 275) {
          pdf.addPage();
          yPos = 20;
        }
        pdf.text(splitText[lineIdx], 15, yPos);
        yPos += 5.5;
        lineIdx++;
      }

      if (yPos > 265) {
        pdf.addPage();
        yPos = 20;
      }
      yPos += 12;
      pdf.setDrawColor(203, 213, 225);
      pdf.line(15, yPos, 195, yPos);
      yPos += 6;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.setTextColor(6, 78, 59);
      pdf.text('TIDES OF KNYSNA • 5-STAR LUXURY ESTATE & GUEST SANCTUARY', 15, yPos);
      yPos += 4;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.setTextColor(100, 116, 139);
      pdf.text('Tourism Grading Council of South Africa (TGCSA) Graded ★★★★★ • VAT Reg: 4890281928', 15, yPos);
      yPos += 3.5;
      pdf.text(`Duty Manager Hotline: ${dutyManagerMobile} • reservations@tidesofknysna.co.za`, 15, yPos);

      pdf.save(`${docName.replace(/\s+/g, '_')}_${reservation.customerSurname}_${reservation.reservationNumber}.pdf`);
      setShareFeedbackNotice(`Downloaded ${docName} as Adobe PDF successfully!`);
      setTimeout(() => setShareFeedbackNotice(null), 3000);
    } catch (err) {
      console.error('Adobe PDF generation failed:', err);
      handleDownloadDocument(docName);
    }
  };

  // Download Document as Formatted Offline HTML File
  const handleDownloadDocument = (docName: string) => {
    const el = document.getElementById('guest-printable-document-canvas');
    if (!el) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>${docName} - ${reservation.reservationNumber} - ${guestFullName}</title>
        <style>
          body { font-family: Arial, Helvetica, sans-serif; color: #0f172a; margin: 40px; line-height: 1.5; font-size: 13px; }
          .header-box { border-bottom: 2px solid #064e3b; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; }
          .title { font-size: 24px; font-weight: bold; color: #064e3b; margin: 0; }
          .gold-text { color: #d97706; font-weight: bold; }
          .badge { background: #ecfdf5; border: 1px solid #10b981; color: #065f46; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: bold; display: inline-block; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
          th { background: #f8fafc; font-weight: bold; }
          .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 11px; color: #64748b; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header-box">
          <div>
            <h1 class="title">TIDES OF KNYSNA</h1>
            <div class="gold-text">EXCLUSIVE GUEST HOUSE • 5-STAR BOUTIQUE RETREAT</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 4px;">14 Waterfront Promenade, Knysna Lagoon Vista, Garden Route 6571 • Tel: +27 44 382 1234</div>
          </div>
          <div style="text-align: right;">
            <div class="badge">OFFICIAL GUEST DOSSIER</div>
            <div style="font-size: 11px; margin-top: 6px; font-family: monospace;">Ref: ${reservation.reservationNumber}</div>
            <div style="font-size: 11px;">Suite ${reservation.roomNumber}</div>
          </div>
        </div>
        ${el.innerHTML}
        <div class="footer">
          <div>Issued by Tides of Knysna Hospitality Ltd • VAT: 4890281928 • Tourism Grading Council of South Africa (TGCSA) Graded ★★★★★</div>
          <div>24/7 Duty Manager & Concierge Hotline: ${dutyManagerMobile} • reservations@tidesofknysna.co.za</div>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docName.replace(/\s+/g, '_')}_${reservation.customerSurname}_${reservation.reservationNumber}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setShareFeedbackNotice(`Downloaded ${docName} successfully!`);
    setTimeout(() => setShareFeedbackNotice(null), 3000);
  };

  // Generate Email and WhatsApp Sharable Text for Document
  const getDocumentSummaryText = (type: GuestDocType) => {
    const baseGreeting = `Dear ${guestFullName},\n\nWe have prepared your official ${docNavItems.find(d => d.id === type)?.title || 'documentation'} for your stay at Tides of Knysna Exclusive Guest House.\n\n`;
    const stayDetails = 
      `🏨 Suite: Room ${reservation.roomNumber} (${reservation.roomAllocation})\n` +
      `📅 Arrival Date: ${reservation.checkInDate}\n` +
      `📅 Departure Date: ${reservation.checkOutDate}\n` +
      `⏳ Stay Duration: ${reservation.totalNights} Nights (${reservation.numberOfGuests} Guests)\n` +
      `🔖 Booking Reference: ${reservation.reservationNumber}\n` +
      `🔑 Suite Door PIN: ${roomPinCode}\n` +
      `📶 Wi-Fi SSID: ${wifiNetwork} | Password: ${wifiPassword}\n\n`;

    let specificText = '';
    if (type === 'invoice') {
      specificText = 
        `📄 TAX INVOICE & RECEIPT SUMMARY:\n` +
        `• Invoice No: INV-${reservation.reservationNumber}\n` +
        `• Total Accommodation: R ${reservation.totalRoomCost.toLocaleString()}\n` +
        `• Breakage Guarantee Deposit: R ${reservation.breakageDepositAmount.toLocaleString()}\n` +
        `• Total Amount Paid: R ${(reservation.totalRoomCost + reservation.breakageDepositAmount).toLocaleString()} (${reservation.paymentMethod})\n` +
        `• VAT Status: 15% Included (VAT Reg: 4890281928)\n\n`;
    } else if (type === 'prearrival') {
      specificText = 
        `🗺️ PRE-ARRIVAL & CHECK-IN GUIDELINES:\n` +
        `• Check-in time: 14:00 - 20:00\n` +
        `• Address: 14 Waterfront Promenade, Knysna Lagoon Vista, Garden Route\n` +
        `• Gate Access: Dial concierge or use electronic keypad outside suite door.\n\n`;
    } else if (type === 'deposit') {
      specificText = 
        `💳 BREAKAGE DEPOSIT PRE-AUTHORIZATION:\n` +
        `• Deposit Amount: R ${reservation.breakageDepositAmount.toLocaleString()}\n` +
        `• Status: ${reservation.breakageDepositStatus}\n` +
        `• Release: Refunded within 48 hours post room inspection.\n\n`;
    } else if (type === 'emergency') {
      specificText = 
        `🚨 EMERGENCY CONTACTS:\n` +
        `• 24/7 Duty Manager Eleanor: ${dutyManagerMobile}\n` +
        `• Knysna SAPS Police: 10111 / +27 44 302 6600\n` +
        `• NSRI Sea Rescue Station 12: +27 82 990 5956\n` +
        `• Knysna Hospital & Medical: +27 44 302 8400\n\n`;
    } else if (type === 'wifi') {
      specificText = 
        `📶 HIGH-SPEED WI-FI ACCESS:\n` +
        `• Network SSID: ${wifiNetwork}\n` +
        `• Wi-Fi Code: ${wifiPassword}\n` +
        `• Speed: 200Mbps Uncapped Fibre.\n\n`;
    } else {
      specificText = 
        `Please access your full interactive document dossier on the Tides of Knysna Guest Portal:\n` +
        `https://tidesofknysna.co.za/portal?ref=${encodeURIComponent(reservation.reservationNumber)}&surname=${encodeURIComponent(reservation.customerSurname)}\n\n`;
    }

    const signoff = `Warm regards,\nEleanor Sterling\nHead of Guest Experience & Reservations\nTides of Knysna Exclusive Guest House\nTel: +27 44 382 1234 | Mobile: ${dutyManagerMobile}`;
    return baseGreeting + stayDetails + specificText + signoff;
  };

  // Sharing Handlers
  const handleShareGmail = (type: GuestDocType) => {
    const subject = encodeURIComponent(`Tides of Knysna - ${docNavItems.find(d => d.id === type)?.title || 'Guest Document'} - ${reservation.reservationNumber} (${guestFullName})`);
    const body = encodeURIComponent(getDocumentSummaryText(type));
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(guestEmail)}&su=${subject}&body=${body}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareYahoo = (type: GuestDocType) => {
    const subject = encodeURIComponent(`Tides of Knysna - ${docNavItems.find(d => d.id === type)?.title || 'Guest Document'} - ${reservation.reservationNumber}`);
    const body = encodeURIComponent(getDocumentSummaryText(type));
    window.open(`https://compose.mail.yahoo.com/?to=${encodeURIComponent(guestEmail)}&subj=${subject}&body=${body}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareOutlook = (type: GuestDocType) => {
    const subject = encodeURIComponent(`Tides of Knysna - ${docNavItems.find(d => d.id === type)?.title || 'Guest Document'} - ${reservation.reservationNumber}`);
    const body = encodeURIComponent(getDocumentSummaryText(type));
    window.open(`https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(guestEmail)}&subject=${subject}&body=${body}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareDefaultMail = (type: GuestDocType) => {
    const subject = encodeURIComponent(`Tides of Knysna Document - ${reservation.reservationNumber}`);
    const body = encodeURIComponent(getDocumentSummaryText(type));
    window.location.href = `mailto:${guestEmail}?subject=${subject}&body=${body}`;
  };

  const handleShareWhatsApp = (type: GuestDocType) => {
    const text = getDocumentSummaryText(type);
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  // Uploading Policy Handlers
  const handlePolicyFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const newPolicy: UploadedPolicyDocument = {
        id: `up-pol-${Date.now()}`,
        title: policyUploadTitle.trim() || file.name.replace(/\.[^/.]+$/, ""),
        category: policyUploadCategory,
        strictness: policyUploadStrictness,
        fileName: file.name,
        fileSize: `${Math.round(file.size / 1024)} KB`,
        fileType: file.type || 'application/octet-stream',
        uploadedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        uploadedBy: isAdminView ? 'Admin' : 'Guest',
        dataUrl: reader.result as string,
        notes: `Uploaded by ${isAdminView ? 'Admin Manager' : guestFullName} via Digital Portal.`
      };

      const updated = [newPolicy, ...uploadedPolicies];
      setUploadedPolicies(updated);
      try {
        localStorage.setItem('tok_uploaded_policy_docs_v2', JSON.stringify(updated));
      } catch (err) {
        console.warn('Storage limit reached for policy dataUrl', err);
      }
      setIsUploading(false);
      setPolicyUploadTitle('');
      setShareFeedbackNotice(`Successfully uploaded policy: "${newPolicy.title}"`);
      setTimeout(() => setShareFeedbackNotice(null), 4000);
    };
    reader.readAsDataURL(file);
  };

  const handleDeletePolicy = (id: string) => {
    const filtered = uploadedPolicies.filter(p => p.id !== id);
    setUploadedPolicies(filtered);
    try {
      localStorage.setItem('tok_uploaded_policy_docs_v2', JSON.stringify(filtered));
    } catch (err) {}
    setShareFeedbackNotice('Policy document removed.');
    setTimeout(() => setShareFeedbackNotice(null), 3000);
  };

  return (
    <div id="guest-folder-root" className="space-y-6 animate-fade-in font-sans">
      {/* ========================================================================= */}
      {/* PERSONALIZED WELCOME HEADER & STAY DOSSIER BANNER                        */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                Resident Guest Folder & Invoicing Hub
              </span>
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-200 border border-slate-700">
                Ref: {reservation.reservationNumber}
              </span>
              <span className="text-xs text-amber-300 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                Suite {reservation.roomNumber}
              </span>
            </div>

            <h1 className="font-serif-luxury text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white">
              Welcome, {guestFullName}
            </h1>

            <p className="text-sm text-emerald-200/95 font-medium">
              {reservation.roomAllocation} • Tides of Knysna 5-Star Luxury Retreat
            </p>

            {/* Quick Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs pt-1">
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Arrival Date</span>
                <span className="font-bold text-white">{reservation.checkInDate}</span>
                <span className="text-[10px] text-emerald-400 block">From 14:00</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Departure Date</span>
                <span className="font-bold text-white">{reservation.checkOutDate}</span>
                <span className="text-[10px] text-amber-300 block">By 10:30</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Duration</span>
                <span className="font-bold text-white">{reservation.totalNights} Days / Nights</span>
                <span className="text-[10px] text-slate-400 block">{reservation.numberOfGuests} Guests</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Fibre Wi-Fi Code</span>
                <span className="font-mono font-bold text-emerald-400">{wifiPassword}</span>
                <span className="text-[10px] text-slate-300 block truncate">{wifiNetwork}</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Sightseeing Guide</span>
                <button
                  type="button"
                  onClick={() => setActiveDoc('sightseeing')}
                  className="font-bold text-blue-300 hover:text-blue-200 block text-left truncate"
                >
                  {ATTRACTIONS_DIRECTORY.length} Attractions →
                </button>
                <span className="text-[10px] text-slate-400 block">Hours & Routes</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">24/7 Emergency</span>
                <span className="font-mono font-bold text-rose-300 block text-[11px] truncate">{dutyManagerMobile}</span>
                <span className="text-[10px] text-slate-400 block">Police 10111</span>
              </div>
            </div>
          </div>

          {/* Quick Universal Print & Close Actions */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
            <button
              onClick={handlePrintDocument}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition"
              title="Print on any printer (Universal Driver, Laser, Inkjet & Adobe PDF)"
            >
              <Printer className="w-4 h-4" />
              <span>Print Active Document</span>
            </button>

            <button
              onClick={() => handleDownloadAdobePdf(docNavItems.find(d => d.id === activeDoc)?.title || 'Document')}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition"
              title="Download official document as formatted Adobe PDF with corporate branding"
            >
              <Download className="w-4 h-4" />
              <span>Download Adobe PDF</span>
            </button>

            <button
              onClick={() => handleDownloadDocument(docNavItems.find(d => d.id === activeDoc)?.title || 'Document')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-white/20 transition"
              title="Download offline copy as formatted document file"
            >
              <Download className="w-4 h-4" />
              <span>Download HTML File</span>
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
              >
                Close Folder
              </button>
            )}
          </div>
        </div>
      </div>

      {shareFeedbackNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-bold flex items-center justify-between shadow-xs animate-fade-in no-print">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{shareFeedbackNotice}</span>
          </div>
          <button onClick={() => setShareFeedbackNotice(null)} className="text-emerald-700">✕</button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2-COLUMN LAYOUT: DOCUMENT PICKER SIDEBAR + PREVIEW CANVAS               */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: 14 DOCUMENT DIRECTORY MENU */}
        <div className="lg:col-span-4 space-y-3 no-print">
          <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm space-y-2">
            <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <FolderOpen className="w-4 h-4 text-emerald-600" />
                Folder Documents (14 Categories)
              </span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                Live & Synced
              </span>
            </div>

            <div className="space-y-1 max-h-[620px] overflow-y-auto pr-1">
              {docNavItems.map((item) => {
                const IconComponent = item.icon;
                const isSelected = activeDoc === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveDoc(item.id)}
                    className={`w-full text-left p-3 rounded-2xl transition flex items-center justify-between group ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-100'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <span className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                        isSelected ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-100 text-slate-600 group-hover:text-emerald-700'
                      }`}>
                        <IconComponent className="w-4 h-4" />
                      </span>
                      <div className="min-w-0">
                        <div className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                          {item.title}
                        </div>
                        <div className={`text-[10px] truncate ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                          {item.subtitle}
                        </div>
                      </div>
                    </div>
                    {item.badge && (
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ml-1 ${
                        isSelected ? 'bg-slate-800 text-emerald-300 border border-slate-700' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Multi-Platform Share Panel for Active Document */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Share2 className="w-3.5 h-3.5 text-emerald-600" />
              Direct Multi-Channel Document Dispatch
            </h4>
            <p className="text-[11px] text-slate-500">
              Instantly transmit active document summary and online pass to guest or companions:
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => handleShareGmail(activeDoc)}
                className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-xl font-bold flex items-center justify-center gap-1.5 border border-rose-200 transition"
                title="Send via Gmail Webmail composer"
              >
                <Mail className="w-3.5 h-3.5 text-rose-600" />
                <span>Gmail</span>
              </button>

              <button
                onClick={() => handleShareYahoo(activeDoc)}
                className="p-2.5 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-xl font-bold flex items-center justify-center gap-1.5 border border-purple-200 transition"
                title="Send via Yahoo Mail"
              >
                <Mail className="w-3.5 h-3.5 text-purple-600" />
                <span>Yahoo Mail</span>
              </button>

              <button
                onClick={() => handleShareOutlook(activeDoc)}
                className="p-2.5 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl font-bold flex items-center justify-center gap-1.5 border border-blue-200 transition"
                title="Send via Outlook / Office 365"
              >
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                <span>Outlook</span>
              </button>

              <button
                onClick={() => handleShareWhatsApp(activeDoc)}
                className="p-2.5 bg-[#25D366]/20 hover:bg-[#25D366]/30 text-emerald-900 rounded-xl font-bold flex items-center justify-center gap-1.5 border border-[#25D366]/40 transition"
                title="Dispatch directly via WhatsApp chat"
              >
                <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp</span>
              </button>
            </div>

            <button
              onClick={() => handleShareDefaultMail(activeDoc)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <Send className="w-3 h-3 text-slate-500" />
              <span>Default Email Client ({guestEmail})</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: PREVIEW CANVAS & DOCUMENT DISPLAY */}
        <div className="lg:col-span-8 space-y-4">
          {/* Document Canvas Header Bar (Screen only) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center justify-between gap-3 text-xs no-print flex-wrap">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">
                Viewing: {docNavItems.find(d => d.id === activeDoc)?.title}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDownloadDocument(docNavItems.find(d => d.id === activeDoc)?.title || 'Document')}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-semibold flex items-center gap-1.5 transition"
                title="Save offline document to device"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </button>
              <button
                onClick={handlePrintDocument}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl flex items-center gap-1.5 transition shadow-sm"
                title="Print on Laser / Inkjet / PDF printer"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Any Printer
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* THE OFFICIAL PRINTABLE DOCUMENT CANVAS CONTAINER                          */}
          {/* ========================================================================= */}
          <div 
            id="guest-printable-document-canvas"
            className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-md space-y-6 print:border-none print:shadow-none print:p-0 print:m-0"
          >
            {/* OFFICIAL LETTERHEAD (Rendered on every printed & downloaded doc) */}
            <div className="border-b-2 border-slate-900 pb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <span className="font-serif-luxury font-bold text-2xl sm:text-3xl tracking-tight text-slate-900 block">
                  TIDES OF KNYSNA
                </span>
                <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-800 block mt-0.5">
                  Exclusive Guest House • 5-Star Boutique Retreat
                </span>
                <p className="text-xs text-slate-500 mt-1">
                  14 Waterfront Promenade, Knysna Lagoon Vista, Garden Route 6571, South Africa
                </p>
                <p className="text-xs text-slate-500">
                  Tel: +27 (0)44 382 1234 • Concierge Mobile & WhatsApp: {dutyManagerMobile}
                </p>
              </div>

              <div className="text-left sm:text-right text-xs space-y-1">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[10px] uppercase tracking-wider inline-block">
                  ★★★★★ TGCSA ACCREDITED
                </span>
                <div className="font-mono text-slate-800 font-bold">
                  Dossier Ref: {reservation.reservationNumber}
                </div>
                <div className="text-slate-500 text-[11px]">
                  VAT Reg: 4890281928 • FNB Account 62899401293
                </div>
                <div className="text-slate-500 text-[11px]">
                  Generated: {new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>
            </div>

            {/* GUEST & STAY RECEPTION SUMMARY BLOCK */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Resident Guest</span>
                <strong className="text-slate-900 text-sm block">{guestFullName}</strong>
                <span className="text-[11px] text-slate-500 truncate block">{guestEmail}</span>
                <span className="text-[10px] text-slate-400 block font-mono">ID: {reservation.idOrPassportNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Suite Allocation</span>
                <strong className="text-emerald-800 text-sm block">Room {reservation.roomNumber}</strong>
                <span className="text-[11px] text-slate-600 block">{reservation.roomAllocation}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Stay Schedule</span>
                <span className="block"><strong>Check-In:</strong> {reservation.checkInDate}</span>
                <span className="block"><strong>Check-Out:</strong> {reservation.checkOutDate}</span>
                <span className="text-emerald-700 font-semibold text-[11px] block">{reservation.totalNights} Nights • {reservation.numberOfGuests} Guests</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Suite Credentials</span>
                <span className="block font-mono text-xs">Door PIN: <strong>{roomPinCode}</strong></span>
                <span className="block font-mono text-[11px] text-emerald-700">Wi-Fi: <strong>{wifiPassword}</strong></span>
                <span className="text-[10px] text-slate-400 block">Duty Manager: Eleanor Sterling</span>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* DOCUMENT 1: TAX INVOICE & OFFICIAL FISCAL RECEIPT                         */}
            {/* ========================================================================= */}
            {activeDoc === 'invoice' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <h2 className="text-xl font-bold font-serif-luxury text-slate-900">
                      TAX INVOICE & OFFICIAL FISCAL RECEIPT
                    </h2>
                    <p className="text-xs text-slate-500">
                      Compliant with South African Revenue Service (SARS) & TGCSA Tourism Graded Regulations
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-xs uppercase tracking-wider inline-block">
                      {reservation.paymentStatus === 'Paid' ? 'PAID IN FULL - RECEIPT ISSUED' : reservation.paymentStatus}
                    </span>
                    <div className="font-mono text-xs text-slate-700 mt-1">Invoice: INV-{reservation.reservationNumber}</div>
                  </div>
                </div>

                {/* Line Items Table */}
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-y border-slate-200">
                      <th className="py-2.5 px-3 text-left">Description of Accommodation / Service</th>
                      <th className="py-2.5 px-3 text-center">Nights / Qty</th>
                      <th className="py-2.5 px-3 text-right">Unit Rate (ZAR)</th>
                      <th className="py-2.5 px-3 text-right">Amount (ZAR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr>
                      <td className="py-3 px-3">
                        <strong className="block text-slate-900">{reservation.roomAllocation} (Suite {reservation.roomNumber})</strong>
                        <span className="text-[11px] text-slate-500">
                          Luxury 5-Star Lagoon View Suite. Includes artisanal breakfast, daily housekeeping & catamaran access.
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-semibold">{reservation.totalNights} Nights</td>
                      <td className="py-3 px-3 text-right font-mono">R {reservation.ratePerNightPerPerson.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                        R {reservation.totalRoomCost.toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3">
                        <strong className="block text-slate-900">Refundable Breakage Guarantee Pre-Authorization Deposit</strong>
                        <span className="text-[11px] text-slate-500">
                          Security guarantee held on file. Released within 48 hours following room departure inspection.
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-semibold">1 Deposit</td>
                      <td className="py-3 px-3 text-right font-mono">R {reservation.breakageDepositAmount.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                        R {reservation.breakageDepositAmount.toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3">
                        <strong className="block text-slate-900">Knysna Tourism Marketing & Ramsar Conservation Levy</strong>
                        <span className="text-[11px] text-slate-500">
                          1% Environmental preservation contribution to Knysna Estuary Ramsar Sanctuary (Complimentary).
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-semibold">1 Stay</td>
                      <td className="py-3 px-3 text-right font-mono">R 0.00</td>
                      <td className="py-3 px-3 text-right font-mono text-emerald-700 font-bold">INCLUDED</td>
                    </tr>
                  </tbody>
                </table>

                {/* Subtotals & VAT Breakdown */}
                <div className="flex justify-end pt-2">
                  <div className="w-72 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal (Excl. 15% VAT):</span>
                      <span className="font-mono">R {Math.round((reservation.totalRoomCost / 1.15)).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>South African VAT (15%):</span>
                      <span className="font-mono">R {Math.round(reservation.totalRoomCost - (reservation.totalRoomCost / 1.15)).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Breakage Deposit (Zero Rated):</span>
                      <span className="font-mono">R {reservation.breakageDepositAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t-2 border-slate-900 pt-2 text-sm font-bold text-slate-900">
                      <span>Grand Total Settlement:</span>
                      <span className="font-mono text-emerald-800">
                        R {(reservation.totalRoomCost + reservation.breakageDepositAmount).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                      <span>Payment Method:</span>
                      <span className="font-semibold text-slate-800">{reservation.paymentMethod}</span>
                    </div>
                  </div>
                </div>

                {/* Banking & Settlement Instructions */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 text-slate-700">
                  <strong className="block text-slate-900 font-bold uppercase tracking-wider text-[11px]">
                    Official Banking Details (For Wire Transfer & Incidentals)
                  </strong>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                    <div><strong>Bank:</strong> First National Bank (FNB)</div>
                    <div><strong>Account Name:</strong> Tides of Knysna Hospitality Ltd</div>
                    <div><strong>Account Number:</strong> 62899401293</div>
                    <div><strong>Branch Code:</strong> 250655 (Knysna)</div>
                    <div><strong>SWIFT Code:</strong> FIRNZAJJ</div>
                    <div><strong>Reference:</strong> {reservation.reservationNumber}</div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* DOCUMENT 2: PRE-ARRIVAL LETTER & JOURNEY INSTRUCTIONS                    */}
            {/* ========================================================================= */}
            {activeDoc === 'prearrival' && (
              <div className="space-y-5 text-xs text-slate-700 leading-relaxed">
                <div className="border-b border-slate-200 pb-3">
                  <h2 className="text-xl font-bold font-serif-luxury text-slate-900">
                    PRE-ARRIVAL JOURNEY DOSSIER & CHECK-IN PROTOCOL
                  </h2>
                  <p className="text-slate-500">Everything you need for seamless arrival at our Knysna waterfront sanctuary.</p>
                </div>

                <p>
                  Dear <strong>{guestFullName}</strong>,
                </p>
                <p>
                  We are delighted to welcome you to <strong>Tides of Knysna Exclusive Guest House</strong> on <strong>{reservation.checkInDate}</strong>. Your reserved sanctuary, <strong>Suite {reservation.roomNumber} ({reservation.roomAllocation})</strong>, is undergoing our signature multi-point sanitization and aromatherapy turndown in anticipation of your {reservation.totalNights}-night stay.
                </p>

                <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-2">
                  <h4 className="font-bold text-emerald-950 uppercase tracking-wider text-[11px]">
                    Essential Arrival Information
                  </h4>
                  <ul className="space-y-1.5 text-[11px]">
                    <li>• <strong>Check-In Window:</strong> 14:00 to 20:00. Early luggage drop-off is available from 10:30 upon request.</li>
                    <li>• <strong>Property GPS Coordinates:</strong> -34.0354° S, 23.0465° E (14 Waterfront Promenade, Knysna).</li>
                    <li>• <strong>Keyless Entry:</strong> Touchpad door PIN is <strong>{roomPinCode}</strong>. Simply touch the screen and enter code followed by #.</li>
                    <li>• <strong>Arrival Beverages:</strong> Chilled Cape Cap Classique sparkling wine or organic rooibos infusion served on our sunset lagoon terrace upon your arrival.</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                    Driving Directions from N2 Highway & Airports
                  </h4>
                  <p>
                    From George Airport (GRJ - 65 km / 50 min): Follow the N2 East past Wilderness and Sedgefield. Upon entering Knysna, turn right into Waterfront Drive, follow for 1.2 km, and enter Promenade Gate. Our security team will direct you to Suite {reservation.roomNumber} private parking.
                  </p>
                  <p>
                    Should you require our executive chauffeur in our Mercedes-Benz V-Class, please call Duty Manager Eleanor at <strong>{dutyManagerMobile}</strong>.
                  </p>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* DOCUMENT 3: BREAKAGE DEPOSIT PRE-AUTHORIZATION RECEIPT                    */}
            {/* ========================================================================= */}
            {activeDoc === 'deposit' && (
              <div className="space-y-5 text-xs text-slate-700 leading-relaxed">
                <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold font-serif-luxury text-slate-900">
                      BREAKAGE DEPOSIT GUARANTEE & PRE-AUTHORIZATION
                    </h2>
                    <p className="text-slate-500">Security guarantee audit record for Suite {reservation.roomNumber}.</p>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-900 rounded-full font-bold text-xs">
                    STATUS: {reservation.breakageDepositStatus}
                  </span>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Pre-Auth Amount</span>
                      <strong className="text-slate-900 font-mono text-base">R {reservation.breakageDepositAmount.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Payment Method</span>
                      <strong className="text-slate-900">{reservation.paymentMethod}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Guarantee Status</span>
                      <strong className="text-emerald-700">{reservation.breakageDepositStatus}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Audit Release</span>
                      <strong className="text-slate-900">Within 48h Post-Departure</strong>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-slate-600">
                  <h4 className="font-bold text-slate-900 text-xs">Terms of Deposit Release</h4>
                  <p>
                    The refundable breakage deposit guarantees the pristine preservation of Suite {reservation.roomNumber}'s curated luxury amenities, including high-thread-count Egyptian cotton linens, espresso machines, and lagoon equipment.
                  </p>
                  <p>
                    Following check-out at 10:30 on {reservation.checkOutDate}, our housekeeping supervisor conducts a white-glove inspection. Funds are automatically released to your originating payment account.
                  </p>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* DOCUMENT 4: PERSONALIZED WELCOME LETTER                                   */}
            {/* ========================================================================= */}
            {activeDoc === 'welcome' && (
              <div className="space-y-5 text-xs text-slate-700 leading-relaxed">
                <div className="border-b border-slate-200 pb-3">
                  <h2 className="text-xl font-bold font-serif-luxury text-slate-900">
                    WELCOME TO TIDES OF KNYSNA
                  </h2>
                  <p className="text-slate-500">Elevate Your Escape - Where Elegance Meets Adventures ★★★★★</p>
                </div>

                <p className="text-sm font-serif-luxury italic text-slate-900">
                  Dearest {guestFullName},
                </p>

                <p>
                  It is an absolute honor to welcome you to our boutique retreat on the tranquil banks of the Knysna Estuary. Your arrival on <strong>{reservation.checkInDate}</strong> marks the beginning of a truly unforgettable {reservation.totalNights}-day experience in <strong>Suite {reservation.roomNumber} ({reservation.roomAllocation})</strong>.
                </p>

                <p>
                  Here at Tides of Knysna, luxury is redefined through tranquility and bespoke attention to detail. Every element of your suite has been curated to inspire deep rejuvenation—from our 600-thread-count Egyptian linens and botanical fynbos bathroom amenities to our panoramic deck overlooking the serene lagoon.
                </p>

                <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-2 text-amber-950">
                  <h4 className="font-bold uppercase tracking-wider text-[11px] text-amber-900">
                    Your Resident Privileges
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div>☕ <strong>Artisanal Breakfast:</strong> 07:30 - 10:30 on the Waterfront Dining Deck.</div>
                    <div>🍷 <strong>Sundowner Hour:</strong> 17:00 - 20:30 in the Lagoon Lounge.</div>
                    <div>🛶 <strong>Lagoon Kayaks & SUPs:</strong> Complimentary use from our private jetty.</div>
                    <div>📶 <strong>Fibre Wi-Fi:</strong> Network <em>{wifiNetwork}</em> • Code <em>{wifiPassword}</em>.</div>
                  </div>
                </div>

                <p>
                  Should you desire dining recommendations, an oyster tasting excursion, or a private sunset catamaran cruise, our front-of-house team is at your command.
                </p>

                <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                  <div>
                    <strong className="block text-slate-900 font-bold">Eleanor Sterling</strong>
                    <span className="text-[11px] text-slate-500">Head of Guest Experience & Reservations</span>
                  </div>
                  <div className="text-right">
                    <strong className="block text-slate-900 font-bold">Management & Butler Team</strong>
                    <span className="text-[11px] text-emerald-700">Tides of Knysna Exclusive Retreat</span>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* DOCUMENT 5: ESTATE POLICIES & HOUSE RULES                                 */}
            {/* ========================================================================= */}
            {activeDoc === 'policies' && (
              <div className="space-y-6 text-xs text-slate-700 leading-relaxed">
                <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold font-serif-luxury text-slate-900">
                      ESTATE POLICIES, HOUSE RULES & SANCTUARY BYLAWS
                    </h2>
                    <p className="text-slate-500">Ensuring peace, safety, and 5-star comfort for all resident guests.</p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-xs uppercase">
                    Mandatory Compliance
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                    <strong className="text-slate-900 block font-bold mb-1">1. Check-In (14:00) & Strict Check-Out (10:30)</strong>
                    <p className="text-slate-600">
                      To enable thorough hospital-grade sanitization and suite preparation, check-out is strictly by 10:30. Unauthorized late departures incur a R350/hour fee.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                    <strong className="text-slate-900 block font-bold mb-1">2. Ramsar Sanctuary Quiet Hours (22:00 - 07:00)</strong>
                    <p className="text-slate-600">
                      Knysna Lagoon is a protected environmental wetland sanctuary. Quiet hours are strictly enforced between 22:00 and 07:00 daily. Parties, loud music, and disruptive gatherings are strictly prohibited.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                    <strong className="text-slate-900 block font-bold mb-1">3. Strictly 100% Non-Smoking Establishment</strong>
                    <p className="text-slate-600">
                      All interior suites, balconies, and public lounges are 100% non-smoking (including vapes and e-cigarettes). Designated garden gazebos are provided. Breaches incur a R2,500 ionization remediation fee.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                    <strong className="text-slate-900 block font-bold mb-1">4. Plunge Pool & Lagoon Kayak Safety Protocol</strong>
                    <p className="text-slate-600">
                      Plunge pool hours are 07:00 - 21:00. No glassware permitted on pool decks. Certified lifejackets must be worn at all times when operating estate lagoon kayaks.
                    </p>
                  </div>
                </div>

                {/* Uploaded Policies Section */}
                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5 text-emerald-600" />
                      Uploaded Official Policy Documentation ({uploadedPolicies.length} Files Available)
                    </h4>
                    <span className="text-[10px] text-slate-400">Click download to save official PDF bylaws</span>
                  </div>

                  <div className="space-y-2">
                    {uploadedPolicies.map((up) => (
                      <div key={up.id} className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FileText className="w-4 h-4 text-emerald-700 shrink-0" />
                          <div className="min-w-0">
                            <strong className="block text-slate-900 truncate">{up.title}</strong>
                            <span className="text-[10px] text-slate-500">
                              {up.fileName} • {up.fileSize} • Uploaded {up.uploadedAt} by {up.uploadedBy}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => {
                              if (up.dataUrl) {
                                const a = document.createElement('a');
                                a.href = up.dataUrl;
                                a.download = up.fileName;
                                a.click();
                              } else {
                                handleDownloadDocument(up.title);
                              }
                            }}
                            className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-800 rounded-lg font-bold border border-emerald-300 text-[11px] flex items-center gap-1 transition"
                            title="Download Policy Document"
                          >
                            <Download className="w-3 h-3" />
                            Download
                          </button>
                          <button
                            onClick={() => window.print()}
                            className="p-1 text-slate-500 hover:text-slate-800 transition"
                            title="Print this policy"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          {isAdminView && (
                            <button
                              onClick={() => handleDeletePolicy(up.id)}
                              className="p-1 text-rose-400 hover:text-rose-600 transition"
                              title="Delete policy"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Upload Policy Form (For Admin and Guest) */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-3 no-print">
                    <div className="flex items-center justify-between">
                      <strong className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5 text-emerald-600" />
                        {isAdminView ? 'Admin Policy Uploader' : 'Guest Document / Policy Acceptance Uploader'}
                      </strong>
                      <span className="text-[10px] text-slate-400">PDF, DOCX, TXT, PNG, JPG (Max 10MB)</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={policyUploadTitle}
                        onChange={(e) => setPolicyUploadTitle(e.target.value)}
                        placeholder="Document Title (e.g. Signed Estate Acceptance)"
                        className="px-3 py-1.5 border border-slate-300 rounded-xl text-xs bg-white"
                      />
                      <select
                        value={policyUploadCategory}
                        onChange={(e) => setPolicyUploadCategory(e.target.value)}
                        className="px-3 py-1.5 border border-slate-300 rounded-xl text-xs bg-white"
                      >
                        <option value="Estate Protocol">Estate Protocol</option>
                        <option value="Environmental Sanctuary">Environmental Sanctuary</option>
                        <option value="Safety & Indemnity">Safety & Indemnity</option>
                        <option value="Guest Signed Agreement">Guest Signed Agreement</option>
                        <option value="Special House Rules">Special House Rules</option>
                      </select>
                      <label className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition shadow-xs">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isUploading ? 'Uploading...' : 'Browse & Upload File'}</span>
                        <input
                          type="file"
                          accept=".pdf,.docx,.txt,.png,.jpg,.jpeg"
                          onChange={handlePolicyFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* DOCUMENT 6: GUEST FOLIO STATEMENT OF ACCOUNT                             */}
            {/* ========================================================================= */}
            {activeDoc === 'statement' && (
              <div className="space-y-6 text-xs text-slate-700">
                <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold font-serif-luxury text-slate-900">
                      GUEST FOLIO STATEMENT OF ACCOUNT
                    </h2>
                    <p className="text-slate-500">Official statement of ledger transactions for Room {reservation.roomNumber}.</p>
                  </div>
                  <span className="font-mono text-xs font-bold px-3 py-1 bg-slate-100 rounded-lg">
                    Folio #{reservation.reservationNumber}
                  </span>
                </div>

                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-y border-slate-200">
                      <th className="py-2.5 px-3 text-left">Posting Date</th>
                      <th className="py-2.5 px-3 text-left">Transaction Description</th>
                      <th className="py-2.5 px-3 text-right">Debit (Charges)</th>
                      <th className="py-2.5 px-3 text-right">Credit (Payments)</th>
                      <th className="py-2.5 px-3 text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-2.5 px-3">{reservation.checkInDate}</td>
                      <td className="py-2.5 px-3">Suite Accommodation ({reservation.totalNights} Nights @ R{reservation.ratePerNightPerPerson.toLocaleString()}/p)</td>
                      <td className="py-2.5 px-3 text-right font-mono">R {reservation.totalRoomCost.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right font-mono">-</td>
                      <td className="py-2.5 px-3 text-right font-mono">R {reservation.totalRoomCost.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3">{reservation.checkInDate}</td>
                      <td className="py-2.5 px-3">Breakage Deposit Security Hold</td>
                      <td className="py-2.5 px-3 text-right font-mono">R {reservation.breakageDepositAmount.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right font-mono">-</td>
                      <td className="py-2.5 px-3 text-right font-mono">R {(reservation.totalRoomCost + reservation.breakageDepositAmount).toLocaleString()}</td>
                    </tr>
                    <tr className="bg-emerald-50/40">
                      <td className="py-2.5 px-3">{reservation.checkInDate}</td>
                      <td className="py-2.5 px-3 font-semibold text-emerald-800">Payment Credited ({reservation.paymentMethod})</td>
                      <td className="py-2.5 px-3 text-right font-mono">-</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                        R {(reservation.totalRoomCost + reservation.breakageDepositAmount).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-900">R 0.00</td>
                    </tr>
                  </tbody>
                </table>

                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between text-xs font-bold text-emerald-950">
                  <span>CLOSING STATEMENT BALANCE:</span>
                  <span className="text-base font-mono">R 0.00 (SETTLED IN FULL)</span>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* DOCUMENT 7: FAREWELL LETTER & CHECK-OUT PROCEDURES                        */}
            {/* ========================================================================= */}
            {activeDoc === 'farewell' && (
              <div className="space-y-5 text-xs text-slate-700 leading-relaxed">
                <div className="border-b border-slate-200 pb-3">
                  <h2 className="text-xl font-bold font-serif-luxury text-slate-900">
                    FAREWELL & DEPARTURE CHECK-OUT DOSSIER
                  </h2>
                  <p className="text-slate-500">Thank you for gracing our Knysna waterfront retreat.</p>
                </div>

                <p>
                  Dear <strong>{guestFullName}</strong>,
                </p>
                <p>
                  As your stay concludes on <strong>{reservation.checkOutDate}</strong>, we wish to express our heartfelt gratitude for choosing Tides of Knysna. We trust that the tranquility of the Knysna Estuary has renewed your spirit and provided memories that will linger for years to come.
                </p>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                    Check-Out Checklist (By 10:30)
                  </h4>
                  <ul className="space-y-1 text-[11px]">
                    <li>✓ <strong>Check-Out Time:</strong> Strictly by 10:30 to permit multi-point sanitation for incoming arrivals.</li>
                    <li>✓ <strong>Digital Safes:</strong> Please ensure personal passports, jewellery, and electronics have been retrieved.</li>
                    <li>✓ <strong>Key Return:</strong> Physical keycards may be deposited at the reception desk drop-box.</li>
                    <li>✓ <strong>Luggage Concierge:</strong> Complimentary luggage storage is available in our secure locker suite.</li>
                  </ul>
                </div>

                <p>
                  Until we welcome you back to our tranquil shores, travel safely and keep the magic of Knysna close to your heart.
                </p>
              </div>
            )}

            {/* ========================================================================= */}
            {/* DOCUMENT 8: GUEST FEEDBACK & REVIEW FORM                                  */}
            {/* ========================================================================= */}
            {activeDoc === 'feedback' && (
              <div className="space-y-5 text-xs text-slate-700">
                <div className="border-b border-slate-200 pb-3">
                  <h2 className="text-xl font-bold font-serif-luxury text-slate-900">
                    GUEST SATISFACTION SURVEY & ACCREDITATION AUDIT
                  </h2>
                  <p className="text-slate-500">Official evaluation form filed directly to General Management.</p>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <strong className="block text-slate-900">1. Suite Cleanliness & Egyptian Linen Presentation</strong>
                      <span className="text-[11px] text-slate-500">Sanitization, linen freshness & bathroom comfort</span>
                    </div>
                    <span className="font-bold text-amber-500">★★★★★ (5.0 / 5)</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <strong className="block text-slate-900">2. Staff Hospitality & Concierge Care</strong>
                      <span className="text-[11px] text-slate-500">Warmth, efficiency and attentiveness of butler staff</span>
                    </div>
                    <span className="font-bold text-amber-500">★★★★★ (5.0 / 5)</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <strong className="block text-slate-900">3. In-Suite Amenities & High-Speed Wi-Fi</strong>
                      <span className="text-[11px] text-slate-500">Nespresso bar, fynbos toiletries & 200Mbps connectivity</span>
                    </div>
                    <span className="font-bold text-amber-500">★★★★★ (5.0 / 5)</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <strong className="block text-slate-900">Official Remarks & Commendations:</strong>
                  <p className="text-slate-600 italic">
                    "Immaculate experience in Suite {reservation.roomNumber}. The sunset catamaran cruise and personalized concierge attention exceeded all 5-star expectations."
                  </p>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* DOCUMENT 9: REFUND & ROOM CLEARANCE CERTIFICATE                           */}
            {/* ========================================================================= */}
            {activeDoc === 'refund' && (
              <div className="space-y-5 text-xs text-slate-700 leading-relaxed">
                <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold font-serif-luxury text-slate-900">
                      DEPOSIT REFUND CLEARANCE GUARANTEE CERTIFICATE
                    </h2>
                    <p className="text-slate-500">Official room inspection sign-off and refund authorization.</p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-xs uppercase">
                    INSPECTION CLEARED
                  </span>
                </div>

                <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <strong className="text-emerald-950 text-sm">Suite {reservation.roomNumber} Inspection Passed: Zero Deficiencies</strong>
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    Housekeeping Lead Maria Cloete has inspected Suite {reservation.roomNumber} following departure. All luxury furnishings, linens, electronic safes, and estate keys have been accounted for in pristine condition.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Authorized Refund Amount</span>
                    <strong className="text-slate-900 text-sm font-mono">R {reservation.breakageDepositAmount.toLocaleString()}</strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Originating Method</span>
                    <strong className="text-slate-900 text-sm">{reservation.paymentMethod}</strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Settlement Processing</span>
                    <strong className="text-emerald-700 text-sm">Dispatched Electronically</strong>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* DOCUMENT 10: KNYSNA GAZETTE & SEASONAL NEWSLETTER                         */}
            {/* ========================================================================= */}
            {activeDoc === 'newsletter' && (
              <div className="space-y-5 text-xs text-slate-700 leading-relaxed">
                <div className="border-b border-slate-200 pb-3">
                  <h2 className="text-xl font-bold font-serif-luxury text-slate-900">
                    THE KNYSNA GAZETTE • RESIDENT SEASONAL EDITION
                  </h2>
                  <p className="text-slate-500">Environmental conservation, oyster festivals & Garden Route news.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase">
                      Sanctuary News
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">Knysna Seahorse Breeding Milestone</h4>
                    <p className="text-slate-600 text-[11px]">
                      The endangered Knysna seahorse (Hippocampus capensis), endemic only to our estuary, has recorded a 24% population surge this season thanks to Ramsar conservation measures supported by your stay levy.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px] uppercase">
                      New Catamaran
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">Solar-Electric Lagoon Catamaran Cruises</h4>
                    <p className="text-slate-600 text-[11px]">
                      We have launched our whisper-quiet, zero-emission solar catamaran departing directly from our private jetty at 17:30 daily for resident sunset champagne tastings.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* DOCUMENT 11: EXCLUSIVE RESIDENT SPECIALS & RETURN VOUCHERS                */}
            {/* ========================================================================= */}
            {activeDoc === 'specials' && (
              <div className="space-y-5 text-xs text-slate-700 leading-relaxed">
                <div className="border-b border-slate-200 pb-3">
                  <h2 className="text-xl font-bold font-serif-luxury text-slate-900">
                    EXCLUSIVE RESIDENT PRIVILEGES & RETURN VOUCHERS
                  </h2>
                  <p className="text-slate-500">Privileged direct rates for your next escape or friends & family.</p>
                </div>

                <div className="p-5 bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-transparent rounded-2xl border border-amber-300 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-amber-400 text-slate-950 font-black rounded-full text-xs uppercase">
                      VIP 15% DIRECT REWARD
                    </span>
                    <span className="font-mono font-bold text-emerald-800 text-sm">PROMO: KNYSNA-VIP26</span>
                  </div>
                  <h3 className="font-bold text-base text-slate-900">
                    Complimentary Sunset Catamaran Cruise + 15% Off Your Next Stay
                  </h3>
                  <p className="text-slate-600">
                    As an authenticated resident guest ({guestFullName}), quote your reservation reference <strong>{reservation.reservationNumber}</strong> or promo code <strong>KNYSNA-VIP26</strong> for guaranteed best rates and VIP champagne turndown on your return visit.
                  </p>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* DOCUMENT 12: CURATED SIGHTSEEING & EXCURSION GUIDE                        */}
            {/* ========================================================================= */}
            {activeDoc === 'sightseeing' && (
              <div className="space-y-5 text-xs text-slate-700">
                <div className="border-b border-slate-200 pb-3">
                  <h2 className="text-xl font-bold font-serif-luxury text-slate-900">
                    CURATED SIGHTSEEING & GARDEN ROUTE EXCURSION DIRECTORY
                  </h2>
                  <p className="text-slate-500">Hand-selected by Tides of Knysna Concierge with hours and direct coordinates.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {ATTRACTIONS_DIRECTORY.slice(0, 6).map((att) => (
                    <div key={att.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <strong className="text-slate-900 text-xs">{att.name}</strong>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold shrink-0">
                          {att.category}
                        </span>
                      </div>
                      <p className="text-slate-500 text-[11px] line-clamp-2">{att.description}</p>
                      <div className="text-[10px] text-slate-600 pt-1 border-t border-slate-200 flex flex-wrap justify-between gap-1">
                        <span>📍 {att.address} ({att.distanceFromGuestHouse})</span>
                        <span>⏰ {att.openingTime || '08:00'} - {att.closingTime || '17:00'}</span>
                      </div>
                      <div className="text-[10px] text-emerald-700 font-medium">
                        📞 {att.contactNumber} • Duration: {att.recommendedDuration || '2 hours'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* DOCUMENT 13: SUITE WI-FI ACCESS CERTIFICATE                               */}
            {/* ========================================================================= */}
            {activeDoc === 'wifi' && (
              <div className="space-y-6 text-xs text-slate-700 text-center max-w-lg mx-auto py-4">
                <div className="w-16 h-16 rounded-3xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center mx-auto shadow-sm">
                  <Wifi className="w-8 h-8" />
                </div>

                <div>
                  <h2 className="text-2xl font-bold font-serif-luxury text-slate-900">
                    HIGH-SPEED FIBRE WI-FI PASS
                  </h2>
                  <p className="text-slate-500 mt-1">Dedicated 200Mbps uncapped low-latency internet in Suite {reservation.roomNumber}.</p>
                </div>

                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 space-y-4 text-left">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                    <span className="text-slate-500 font-bold uppercase text-[10px]">Network Name (SSID):</span>
                    <strong className="font-mono text-sm text-slate-900">{wifiNetwork}</strong>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                    <span className="text-slate-500 font-bold uppercase text-[10px]">Wi-Fi Security Key / Code:</span>
                    <strong className="font-mono text-base text-emerald-700 tracking-wider bg-white px-3 py-1 rounded border border-emerald-300">
                      {wifiPassword}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-slate-500">
                    <span>Bandwidth: 200Mbps Synchronous</span>
                    <span>Encryption: WPA3-Personal</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400">
                  Suitable for 4K streaming, Zoom video conferencing, and VPN enterprise traffic.
                </p>
              </div>
            )}

            {/* ========================================================================= */}
            {/* DOCUMENT 14: EMERGENCY NUMBERS & 24/7 CONCIERGE DIRECTORY                 */}
            {/* ========================================================================= */}
            {activeDoc === 'emergency' && (
              <div className="space-y-5 text-xs text-slate-700">
                <div className="border-b border-slate-200 pb-3">
                  <h2 className="text-xl font-bold font-serif-luxury text-slate-900">
                    EMERGENCY NUMBERS & 24/7 CONCIERGE DIRECTORY
                  </h2>
                  <p className="text-slate-500">Rapid emergency response contacts and internal estate hotlines.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1">
                    <strong className="block text-emerald-950 font-bold">24/7 Duty Manager Eleanor Sterling</strong>
                    <div className="text-base font-mono font-bold text-emerald-700">{dutyManagerMobile}</div>
                    <p className="text-[11px] text-emerald-800">On-call 24 hours for in-suite emergencies, arrivals & lock-outs.</p>
                  </div>

                  <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-200 space-y-1">
                    <strong className="block text-rose-950 font-bold">Knysna SAPS Police Services</strong>
                    <div className="text-base font-mono font-bold text-rose-700">10111 / +27 (0)44 302 6600</div>
                    <p className="text-[11px] text-rose-800">Knysna Central Police Station, Waterfront Drive.</p>
                  </div>

                  <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-200 space-y-1">
                    <strong className="block text-blue-950 font-bold">NSRI Sea Rescue (Station 12 Knysna)</strong>
                    <div className="text-base font-mono font-bold text-blue-700">+27 (0)82 990 5956</div>
                    <p className="text-[11px] text-blue-800">24/7 National Sea Rescue for lagoon and coastal emergencies.</p>
                  </div>

                  <div className="p-3.5 bg-purple-50 rounded-2xl border border-purple-200 space-y-1">
                    <strong className="block text-purple-950 font-bold">Knysna Private Hospital & Trauma</strong>
                    <div className="text-base font-mono font-bold text-purple-700">+27 (0)44 384 1083</div>
                    <p className="text-[11px] text-purple-800">Life Knysna Private Hospital 24h Accident & Emergency Unit.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Icon replacement for BookUserIcon
const BookUserIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
    <circle cx="12" cy="8" r="2"/>
    <path d="M15 13a3 3 0 0 0-6 0"/>
  </svg>
);
