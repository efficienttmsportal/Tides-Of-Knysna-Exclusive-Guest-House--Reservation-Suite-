import React, { useState, useEffect, useMemo } from 'react';
import { 
  Printer, 
  Download, 
  FileText, 
  CheckCircle, 
  ShieldCheck, 
  Key, 
  Coffee, 
  Sparkles, 
  X, 
  Search, 
  ChevronRight, 
  Layers, 
  FileCheck, 
  Wifi, 
  Phone, 
  Building,
  CreditCard,
  DollarSign,
  AlertTriangle,
  Compass,
  FileSpreadsheet,
  Check,
  Upload,
  Calendar,
  User,
  QrCode,
  Send
} from 'lucide-react';
import jsPDF from 'jspdf';
import { Reservation, AccountingDocument, UploadedPolicyDocument } from '../types';
import { GUEST_HOUSE_INFO, INITIAL_ACCOUNTING_DOCS, DEFAULT_ESTATE_POLICIES } from '../data/initialData';
import { CompanyInfoData } from './CompanyInfoModule';
import { shareDocumentViaWhatsApp } from '../services/whatsappService';
import { addPdfWatermarkAndEmblem } from '../utils/pdfWatermarkUtils';

export interface UniversalPrintHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyInfo?: CompanyInfoData;
  reservations?: Reservation[];
  currentReservation?: Reservation | null;
  initialCategory?: 'dossier' | 'accounting' | 'policies' | 'staypass' | 'checkin' | 'departure';
  initialDocumentId?: string;
  initialUploadedDoc?: UploadedPolicyDocument | null;
  isAdminView?: boolean;
}

export const UniversalPrintHubModal: React.FC<UniversalPrintHubModalProps> = ({
  isOpen,
  onClose,
  companyInfo,
  reservations = [],
  currentReservation: initialCurrentRes,
  initialCategory = 'dossier',
  initialDocumentId,
  initialUploadedDoc,
  isAdminView = true
}) => {
  if (!isOpen) return null;

  const info = companyInfo || (GUEST_HOUSE_INFO as any);
  const effectiveLogo = companyInfo?.logoUrl || GUEST_HOUSE_INFO.logoUrl;

  // Selected reservation
  const [selectedResId, setSelectedResId] = useState<string>(
    initialCurrentRes?.id || reservations[0]?.id || 'TOK-2026-0891'
  );
  const activeReservation = useMemo(() => {
    return reservations.find(r => r.id === selectedResId) || initialCurrentRes || reservations[0] || {
      id: 'TOK-2026-0891',
      reservationNumber: 'TOK-2026-0891',
      customerName: 'Cornelius',
      customerSurname: 'Vanderbilt',
      customerEmail: 'cornelius.vanderbilt@estate.co.za',
      customerPhone: '+27 (0)82 882 1092',
      checkInDate: '2026-10-12',
      checkOutDate: '2026-10-16',
      totalNights: 4,
      numberOfGuests: 2,
      roomNumber: '1',
      roomAllocation: 'Presidential Lagoon Suite',
      paymentStatus: 'Paid in Full',
      paymentMethod: 'EFT / Credit Card',
      totalAmount: 23600,
      breakageDeposit: 5000,
      idOrPassportNumber: 'ZA-780912-5819-082',
      wifiCredentialsProvided: true,
      roomPinCode: '4928'
    } as unknown as Reservation;
  }, [reservations, selectedResId, initialCurrentRes]);

  // Categories
  const [activeCategory, setActiveCategory] = useState<'dossier' | 'accounting' | 'policies' | 'staypass' | 'checkin' | 'departure'>(
    initialCategory
  );

  // Sub-document selections
  const [selectedDossierDoc, setSelectedDossierDoc] = useState<string>(
    initialDocumentId || 'welcome'
  );
  const [selectedAccountingDocId, setSelectedAccountingDocId] = useState<string>(
    INITIAL_ACCOUNTING_DOCS[0]?.id || 'acc-1'
  );

  // Uploaded policies loaded from synchronized localStorage
  const [uploadedPolicies, setUploadedPolicies] = useState<UploadedPolicyDocument[]>(() => {
    try {
      const saved = localStorage.getItem('tok_uploaded_policy_docs_v2');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
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
  });

  const [selectedPolicyId, setSelectedPolicyId] = useState<string>(
    initialUploadedDoc?.id || uploadedPolicies[0]?.id || 'up-pol-1'
  );

  const selectedUploadedDoc = useMemo(() => {
    return uploadedPolicies.find(p => p.id === selectedPolicyId) || initialUploadedDoc || uploadedPolicies[0];
  }, [uploadedPolicies, selectedPolicyId, initialUploadedDoc]);

  // Selected Accounting doc
  const selectedAccountingDoc = useMemo(() => {
    return INITIAL_ACCOUNTING_DOCS.find(d => d.id === selectedAccountingDocId) || INITIAL_ACCOUNTING_DOCS[0];
  }, [selectedAccountingDocId]);

  // Copied notice
  const [copyNotice, setCopyNotice] = useState(false);

  // Hardware Printer Mode Hint
  const [printerEngine, setPrinterEngine] = useState<'universal' | 'laserjet' | 'inkjet' | 'inktank'>('universal');

  // Universal Hardware Print Action
  const handlePrint = () => {
    window.print();
  };

  // Official Adobe PDF Export Action
  const handleDownloadPdf = () => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const companyTitle = info.name || 'Tides of Knysna';
      const companySub = info.subTagline || info.tagline || 'EXCLUSIVE GUEST HOUSE • 5-STAR BOUTIQUE RETREAT';
      const companyAddr = info.address || GUEST_HOUSE_INFO.address;
      const companyTel = info.telephone || info.contactNumbers || GUEST_HOUSE_INFO.telephone;
      const companyEmail = info.email || GUEST_HOUSE_INFO.email;

      // Corporate Header
      pdf.setFillColor(15, 23, 42); // slate-900
      pdf.rect(0, 0, 210, 30, 'F');

      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(15);
      pdf.text(companyTitle.toUpperCase(), 15, 12);

      pdf.setFontSize(8.5);
      pdf.setTextColor(209, 250, 229);
      pdf.text(companySub, 15, 18);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7.5);
      pdf.setTextColor(226, 232, 240);
      pdf.text(`${companyAddr} | Tel: ${companyTel} | Email: ${companyEmail} | VAT: 4890281928`, 15, 24);

      // Document banner
      pdf.setFillColor(248, 250, 252);
      pdf.setDrawColor(203, 213, 225);
      pdf.rect(15, 36, 180, 18, 'FD');

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.setTextColor(15, 23, 42);

      let docTitleStr = 'OFFICIAL CORPORATE DOCUMENT';
      if (activeCategory === 'dossier') {
        docTitleStr = `GUEST DOSSIER: ${selectedDossierDoc.toUpperCase()}`;
      } else if (activeCategory === 'accounting') {
        docTitleStr = `${selectedAccountingDoc.documentType.toUpperCase()} #${selectedAccountingDoc.documentNumber}`;
      } else if (activeCategory === 'policies') {
        docTitleStr = `ESTATE REGULATION: ${selectedUploadedDoc?.title || 'Bylaws'}`;
      } else if (activeCategory === 'staypass') {
        docTitleStr = `OFFICIAL RESIDENT STAY PASS & KEY DOSSIER`;
      } else if (activeCategory === 'checkin') {
        docTitleStr = `ARRIVAL & GUEST REGISTRATION CARD`;
      } else if (activeCategory === 'departure') {
        docTitleStr = `SUITE CLEARANCE & ROOM INSPECTION CERTIFICATE`;
      }

      pdf.text(docTitleStr, 20, 45);
      pdf.setFontSize(8.5);
      pdf.setTextColor(6, 78, 59);
      pdf.text(`Ref: #${activeReservation.reservationNumber} | Suite: Room ${activeReservation.roomNumber}`, 20, 50);

      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(71, 85, 105);
      pdf.text(`Generated: ${new Date().toLocaleDateString('en-ZA')}`, 130, 46);
      pdf.text(`Universal Driver Compatible`, 130, 51);

      // Body text extraction from printable canvas
      const el = document.getElementById('universal-printable-canvas');
      const textContent = el ? el.innerText : `Official Documentation for ${companyTitle}.`;
      const splitText = pdf.splitTextToSize(textContent, 180);

      let yPos = 62;
      let lineIdx = 0;
      pdf.setFontSize(8);
      pdf.setTextColor(51, 65, 85);

      while (lineIdx < splitText.length) {
        if (yPos > 275) {
          pdf.addPage();
          yPos = 20;
        }
        pdf.text(splitText[lineIdx], 15, yPos);
        yPos += 5.2;
        lineIdx++;
      }

      // Add official watermark and corporate logo emblem to all generated PDF pages
      addPdfWatermarkAndEmblem(pdf);

      pdf.save(`${docTitleStr.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
    } catch (err) {
      console.error('Error in handleDownloadPdf:', err);
      window.print();
    }
  };

  const handleEmailPdf = () => {
    handleDownloadPdf();
    const subject = encodeURIComponent(`Official Document: ${activeCategory.toUpperCase()} - #${activeReservation.reservationNumber}`);
    const body = encodeURIComponent(`Dear ${activeReservation.customerName},\n\nPlease find attached your official PDF document / statement from Tides of Knysna Exclusive Guest House.\n\nReservation: #${activeReservation.reservationNumber}\nSuite: Room ${activeReservation.roomNumber}\n\nWarm regards,\nConcierge Desk (+27 81 266 956)\nTides of Knysna`);
    window.location.href = `mailto:${activeReservation.customerEmail || ''}?subject=${subject}&body=${body}`;
  };

  const handleWhatsAppPdf = () => {
    handleDownloadPdf();
    const text = encodeURIComponent(`Hello ${activeReservation.customerName},\n\nHere is your official PDF document / statement from Tides of Knysna Exclusive Guest House (Ref: #${activeReservation.reservationNumber}, Room ${activeReservation.roomNumber}). PDF has been generated and downloaded to your device.\n\nConcierge / WhatsApp Dispatch: +27 81 266 956`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleShareWhatsAppDeepLink = () => {
    let docTitleStr = 'Official Corporate Document';
    if (activeCategory === 'dossier') {
      docTitleStr = `Guest Dossier (${selectedDossierDoc.toUpperCase()})`;
    } else if (activeCategory === 'accounting') {
      docTitleStr = `${selectedAccountingDoc.documentType.toUpperCase()} #${selectedAccountingDoc.documentNumber}`;
    } else if (activeCategory === 'policies') {
      docTitleStr = `Estate Regulation (${selectedUploadedDoc?.title || 'Bylaws'})`;
    } else if (activeCategory === 'staypass') {
      docTitleStr = `Resident Stay Pass & Key Dossier`;
    } else if (activeCategory === 'checkin') {
      docTitleStr = `Arrival & Guest Registration Card`;
    } else if (activeCategory === 'departure') {
      docTitleStr = `Suite Clearance & Inspection Certificate`;
    }

    shareDocumentViaWhatsApp({
      phoneNumber: activeReservation.customerPhone || '+2781266956',
      guestName: activeReservation.customerName,
      documentTitle: docTitleStr,
      reservationNumber: activeReservation.reservationNumber,
      roomNumber: activeReservation.roomNumber,
      documentUrl: window.location.href,
      additionalNotes: `Instant PDF attachment link generated successfully via Tides of Knysna Universal Print Hub.`
    });
  };

  const handleCopyText = () => {
    const el = document.getElementById('universal-printable-canvas');
    if (el) {
      navigator.clipboard.writeText(el.innerText).then(() => {
        setCopyNotice(true);
        setTimeout(() => setCopyNotice(false), 2500);
      });
    }
  };

  // Privacy Rule: Only allow Wi-Fi credentials on Welcome Letter or dedicated Wi-Fi certificate or Stay Pass.
  // Strictly EXCLUDE Wi-Fi password and network on Tax Invoice, Statement, Folio, Departure, and Accounting documents!
  const isWifiAllowed = 
    (activeCategory === 'dossier' && (selectedDossierDoc === 'welcome' || selectedDossierDoc === 'wifi')) ||
    activeCategory === 'staypass';

  const wifiPassword = 'LagoonView2026!';
  const wifiNetwork = 'TidesExclusive_Guest5G';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto print-modal-wrapper">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-6xl w-full my-6 shadow-2xl overflow-hidden flex flex-col max-h-[94vh] print:max-h-none print:bg-white print:border-none print:shadow-none print:p-0 print:m-0">
        
        {/* TOP MODAL CONTROL BAR (Hidden during printing) */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/90 no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-slate-950 flex items-center justify-center font-bold shadow-md">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-serif-luxury">
                  Universal Document Print & Export Hub
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/60">
                  All Printers Compatible
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Official corporate stationery output for Inkjet, Laserjet & Inktank printers on Universal Printer Drivers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* PRINTER HARDWARE ENGINE SELECTOR */}
            <div className="hidden md:flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700 text-[11px]">
              <span className="text-slate-400 px-2 font-medium">Printer:</span>
              {(['universal', 'laserjet', 'inkjet', 'inktank'] as const).map(eng => (
                <button
                  key={eng}
                  type="button"
                  onClick={() => setPrinterEngine(eng)}
                  className={`px-2 py-1 rounded-lg capitalize transition font-bold ${
                    printerEngine === eng
                      ? 'bg-slate-900 text-emerald-300 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {eng === 'universal' ? 'Universal Driver' : eng}
                </button>
              ))}
            </div>

            {/* PRINT BUTTON */}
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-md transition"
              title="Print directly to any connected printer (Laserjet, Inkjet, Inktank)"
            >
              <Printer className="w-4 h-4" />
              <span>Print (All Printers)</span>
            </button>

            {/* PDF DOWNLOAD */}
            <button
              onClick={handleDownloadPdf}
              className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
              title="Download official branded Adobe PDF"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>

            {/* EMAIL PDF */}
            <button
              onClick={handleEmailPdf}
              className="px-3 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
              title="Download PDF and attach to Email"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Email PDF</span>
            </button>

            {/* WHATSAPP PDF */}
            <button
              onClick={handleWhatsAppPdf}
              className="px-3 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
              title="Download PDF and share via WhatsApp (+27 81 266 956)"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>WhatsApp PDF</span>
            </button>

            {/* SHARE VIA WHATSAPP DEEP LINK */}
            <button
              onClick={handleShareWhatsAppDeepLink}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
              title="Share WhatsApp deep link with pre-filled message & PDF attachment link"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Share via WhatsApp</span>
            </button>

            {/* COPY TEXT */}
            <button
              onClick={handleCopyText}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 transition"
              title="Copy plain text"
            >
              {copyNotice ? <Check className="w-4 h-4 text-emerald-400" /> : <Layers className="w-4 h-4" />}
            </button>

            {/* CLOSE BUTTON */}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
              title="Close Hub"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* NAVIGATION & DOCUMENT SELECTOR TABS (Hidden during printing) */}
        <div className="p-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs no-print">
          {/* Main Category Tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-full">
            <button
              onClick={() => setActiveCategory('dossier')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition shrink-0 ${
                activeCategory === 'dossier'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Guest Dossier (14 Docs)
            </button>

            <button
              onClick={() => setActiveCategory('accounting')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition shrink-0 ${
                activeCategory === 'accounting'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              Accounting & Tax Invoices
            </button>

            <button
              onClick={() => setActiveCategory('policies')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition shrink-0 ${
                activeCategory === 'policies'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Policies & Uploaded Docs ({uploadedPolicies.length})
            </button>

            <button
              onClick={() => setActiveCategory('staypass')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition shrink-0 ${
                activeCategory === 'staypass'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              Stay Pass & Resident Key
            </button>

            <button
              onClick={() => setActiveCategory('checkin')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition shrink-0 ${
                activeCategory === 'checkin'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Check-In Registration
            </button>

            <button
              onClick={() => setActiveCategory('departure')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition shrink-0 ${
                activeCategory === 'departure'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              Departure Clearance
            </button>
          </div>

          {/* Active Guest Selector Dropdown */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-[11px] text-slate-400 font-semibold hidden sm:inline">Guest Dossier:</span>
            <select
              value={selectedResId}
              onChange={(e) => setSelectedResId(e.target.value)}
              className="bg-slate-800 text-slate-200 border border-slate-700 text-xs rounded-xl px-2.5 py-1.5 outline-none font-medium"
            >
              {reservations.map(r => (
                <option key={r.id} value={r.id}>
                  {r.customerName} {r.customerSurname} (Suite {r.roomNumber} • #{r.reservationNumber})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* SUB-DOCUMENT FILTER BAR (Specific to Category) */}
        <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto text-[11px] no-print">
          <span className="text-slate-400 font-semibold shrink-0">Select Template:</span>
          
          {activeCategory === 'dossier' && (
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {[
                { id: 'welcome', label: '1. Welcome Letter' },
                { id: 'invoice', label: '2. Tax Invoice' },
                { id: 'statement', label: '3. Statement + Stub' },
                { id: 'folio', label: '4. Guest Folio' },
                { id: 'reg_card', label: '5. Registration Card' },
                { id: 'terms', label: '6. House Rules Agreement' },
                { id: 'indemnity', label: '7. Indemnity Waiver' },
                { id: 'deposit', label: '8. Deposit Receipt' },
                { id: 'breakfast', label: '9. Laguna Menu' },
                { id: 'envelope', label: '10. Key Card Envelope' },
                { id: 'departure', label: '11. Departure Clearance' },
                { id: 'refund', label: '12. Refund Requisition' },
                { id: 'sightseeing', label: '13. Sightseeing Guide' },
                { id: 'wifi', label: '14. Wi-Fi Certificate' }
              ].map(d => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDossierDoc(d.id)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition shrink-0 ${
                    selectedDossierDoc === d.id
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                      : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          )}

          {activeCategory === 'accounting' && (
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {INITIAL_ACCOUNTING_DOCS.map(doc => (
                <button
                  key={doc.id}
                  onClick={() => setSelectedAccountingDocId(doc.id)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition shrink-0 ${
                    selectedAccountingDocId === doc.id
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                      : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
                  }`}
                >
                  {doc.documentType} (#{doc.documentNumber})
                </button>
              ))}
            </div>
          )}

          {activeCategory === 'policies' && (
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {uploadedPolicies.map(up => (
                <button
                  key={up.id}
                  onClick={() => setSelectedPolicyId(up.id)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition shrink-0 ${
                    selectedPolicyId === up.id
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                      : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
                  }`}
                >
                  {up.title} ({up.category})
                </button>
              ))}
            </div>
          )}
        </div>

        {/* DOCUMENT PREVIEW CONTAINER */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-950 flex justify-center print:bg-white print:p-0 print:m-0 print:overflow-visible">
          
          {/* ========================================================================= */}
          {/* THE OFFICIAL PRINTABLE CANVAS (100% Full-bleed Corporate Stationery)       */}
          {/* ========================================================================= */}
          <div 
            id="universal-printable-canvas"
            className="printable-area bg-white text-slate-900 rounded-3xl max-w-4xl w-full p-6 sm:p-10 shadow-2xl space-y-6 print:border-none print:shadow-none print:p-0 print:m-0 print:rounded-none"
          >
            {/* OFFICIAL CORPORATE LETTERHEAD HEADER */}
            <div className="border-b-2 border-slate-900 pb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                {/* Official Corporate Logo */}
                <div className="shrink-0 bg-slate-900 p-1.5 rounded-xl border border-slate-800 shadow-xs">
                  <img 
                    src={effectiveLogo} 
                    alt={info.name || 'Tides of Knysna'} 
                    className="h-14 sm:h-16 w-auto object-contain rounded-lg max-w-[180px] sm:max-w-[210px]"
                  />
                </div>
                <div>
                  <h1 className="font-serif-luxury text-xl sm:text-2xl font-bold tracking-tight text-slate-950">
                    {info.name || 'Tides of Knysna'}
                  </h1>
                  <p className="text-xs text-emerald-800 font-bold uppercase tracking-wider mt-0.5">
                    {info.subTagline || info.tagline || 'EXCLUSIVE GUEST HOUSE • 5-STAR BOUTIQUE RETREAT'}
                  </p>
                  <div className="text-[11px] text-slate-600 mt-1 space-y-0.5">
                    <div>{info.address || GUEST_HOUSE_INFO.address}</div>
                    <div>Tel: {info.telephone || info.contactNumbers || GUEST_HOUSE_INFO.telephone} | Email: {info.email || GUEST_HOUSE_INFO.email}</div>
                    <div>VAT Reg: 4890281928 | Web: {info.webAddress || GUEST_HOUSE_INFO.webAddress}</div>
                  </div>
                </div>
              </div>

              <div className="text-left sm:text-right text-xs space-y-1">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[10px] uppercase tracking-wider inline-block">
                  ★★★★★ TGCSA ACCREDITED
                </span>
                <div className="font-mono text-slate-900 font-bold">
                  Dossier Ref: {activeReservation.reservationNumber}
                </div>
                <div className="text-slate-500 text-[11px]">
                  FNB Cheque Acc: 62899401293 (Branch 210214)
                </div>
                <div className="text-slate-500 text-[11px]">
                  Printed: {new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>
            </div>

            {/* GUEST & STAY RECEPTION SUMMARY CARD */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Resident Guest</span>
                <strong className="text-slate-900 text-sm block">{activeReservation.customerName} {activeReservation.customerSurname}</strong>
                <span className="text-[11px] text-slate-500 truncate block">{activeReservation.customerEmail}</span>
                <span className="text-[10px] text-slate-400 block font-mono">ID: {activeReservation.idOrPassportNumber}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Suite Allocation</span>
                <strong className="text-emerald-800 text-sm block">Room {activeReservation.roomNumber}</strong>
                <span className="text-[11px] text-slate-600 block">{activeReservation.roomAllocation}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Stay Schedule</span>
                <span className="block"><strong>Check-In:</strong> {activeReservation.checkInDate}</span>
                <span className="block"><strong>Check-Out:</strong> {activeReservation.checkOutDate}</span>
                <span className="text-emerald-700 font-semibold text-[11px] block">{activeReservation.totalNights} Nights • {activeReservation.numberOfGuests} Guests</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Access Credentials</span>
                <span className="block font-mono text-xs">Door PIN: <strong>{activeReservation.roomPinCode || '4928'}</strong></span>
                {/* STRICT PRIVACY RULE: Wi-Fi passcode is ONLY permitted on Welcome Letter, Wi-Fi Certificate, or Stay Pass! */}
                {isWifiAllowed ? (
                  <span className="block font-mono text-[11px] text-emerald-700">Wi-Fi: <strong>{wifiPassword}</strong></span>
                ) : null}
                <span className="text-[10px] text-slate-400 block">Duty Officer: Eleanor Sterling</span>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* BODY 1: GUEST DOSSIER DOCUMENTS (14 TEMPLATES)                            */}
            {/* ========================================================================= */}
            {activeCategory === 'dossier' && (
              <div className="space-y-6">
                {selectedDossierDoc === 'welcome' && (
                  <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
                    <div className="border-b border-slate-200 pb-2">
                      <h2 className="text-xl font-bold font-serif-luxury text-slate-900">
                        OFFICIAL WELCOME LETTER & ESTATE DIRECTORY
                      </h2>
                      <span className="text-emerald-800 font-semibold text-xs">A Bespoke Sanctuary on the Knysna Lagoon</span>
                    </div>

                    <p>
                      Dear <strong>{activeReservation.customerName} {activeReservation.customerSurname}</strong>,
                    </p>
                    <p>
                      On behalf of the entire host team, we extend our warmest welcome to <em>{info.name}</em>. We are honored to host your stay in our <strong>{activeReservation.roomAllocation} (Suite {activeReservation.roomNumber})</strong> from {activeReservation.checkInDate} to {activeReservation.checkOutDate}.
                    </p>

                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2 text-xs">
                      <h4 className="font-bold text-emerald-950 uppercase text-[11px]">Essential Resident Credentials</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div>🔑 <strong>Keyless Suite Door PIN:</strong> <span className="font-mono font-bold text-emerald-800">{activeReservation.roomPinCode || '4928'}</span></div>
                        <div>📶 <strong>Fibre Wi-Fi Network:</strong> <span className="font-mono text-emerald-800">{wifiNetwork}</span></div>
                        <div>🔒 <strong>Wi-Fi Passcode:</strong> <span className="font-mono font-bold text-emerald-800">{wifiPassword}</span></div>
                        <div>🍳 <strong>Gourmet Breakfast:</strong> Served 07:30 - 10:30 at Lagoon Terrace</div>
                      </div>
                    </div>

                    <p>
                      Our concierge desk is at your service 24/7 for bespoke lagoon excursions, Featherbed nature reserve crossings, or private dining arrangements.
                    </p>
                    <div className="pt-4 flex justify-between items-end border-t border-slate-200">
                      <div>
                        <div className="font-serif-luxury text-sm font-bold text-slate-900">Eleanor Sterling</div>
                        <div className="text-[11px] text-slate-500">General Manager & Resident Host</div>
                      </div>
                      <div className="text-right text-[10px] text-slate-400">
                        Tides Executive Suite • 5-Star Graded
                      </div>
                    </div>
                  </div>
                )}

                {selectedDossierDoc === 'invoice' && (
                  <div className="space-y-4 text-xs text-slate-800">
                    <div className="border-b border-slate-200 pb-2 flex justify-between items-center">
                      <div>
                        <h2 className="text-xl font-bold font-serif-luxury text-slate-900">TAX INVOICE & FISCAL RECEIPT</h2>
                        <span className="text-xs text-slate-500">Official VAT Document (SARS Compliant)</span>
                      </div>
                      <div className="text-right font-mono font-bold text-emerald-800 text-sm">
                        #INV-{activeReservation.reservationNumber}
                      </div>
                    </div>

                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-900 text-white font-bold text-[11px]">
                          <th className="py-2 px-3 rounded-l-lg">Description</th>
                          <th className="py-2 px-3 text-center">Nights / Qty</th>
                          <th className="py-2 px-3 text-right">Rate (ZAR)</th>
                          <th className="py-2 px-3 text-right rounded-r-lg">Total (ZAR)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        <tr>
                          <td className="py-2.5 px-3 font-semibold">{activeReservation.roomAllocation} (Suite {activeReservation.roomNumber})</td>
                          <td className="py-2.5 px-3 text-center">{activeReservation.totalNights}</td>
                          <td className="py-2.5 px-3 text-right">R {(activeReservation.totalAmount / Math.max(1, activeReservation.totalNights)).toLocaleString()}</td>
                          <td className="py-2.5 px-3 text-right font-bold">R {activeReservation.totalAmount.toLocaleString()}</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3">Refundable Breakage & Key Deposit Reserve</td>
                          <td className="py-2.5 px-3 text-center">1</td>
                          <td className="py-2.5 px-3 text-right">R {activeReservation.breakageDeposit?.toLocaleString() || '5,000'}</td>
                          <td className="py-2.5 px-3 text-right font-bold">R {activeReservation.breakageDeposit?.toLocaleString() || '5,000'}</td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="flex justify-end pt-2">
                      <div className="w-64 space-y-1.5 text-right">
                        <div className="flex justify-between text-slate-600">
                          <span>Subtotal:</span>
                          <strong>R {((activeReservation.totalAmount + (activeReservation.breakageDeposit || 5000)) / 1.15).toFixed(2)}</strong>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>VAT (15% Included):</span>
                          <strong>R {(((activeReservation.totalAmount + (activeReservation.breakageDeposit || 5000)) / 1.15) * 0.15).toFixed(2)}</strong>
                        </div>
                        <div className="flex justify-between text-base font-bold text-slate-950 border-t border-slate-900 pt-1.5">
                          <span>Total Amount:</span>
                          <span className="text-emerald-800">R {(activeReservation.totalAmount + (activeReservation.breakageDeposit || 5000)).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                      <strong>Settlement Status:</strong> {activeReservation.paymentStatus} ({activeReservation.paymentMethod}).
                      <div>Bank Settlement: First National Bank • Acc: 62899401293 • Ref: {activeReservation.reservationNumber}</div>
                    </div>
                  </div>
                )}

                {selectedDossierDoc === 'statement' && (
                  <div className="space-y-4 text-xs text-slate-800">
                    <div className="border-b border-slate-200 pb-2 flex justify-between items-center">
                      <div>
                        <h2 className="text-xl font-bold font-serif-luxury text-slate-900">STATEMENT OF ACCOUNT WITH PAYMENT STUB</h2>
                        <span className="text-xs text-slate-500">Official Guest Account Ledger</span>
                      </div>
                      <div className="text-right font-mono font-bold text-slate-900 text-sm">
                        Stmt Date: {new Date().toLocaleDateString('en-ZA')}
                      </div>
                    </div>

                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-900 text-white font-bold text-[11px]">
                          <th className="py-2 px-3 rounded-l-lg">Transaction Date</th>
                          <th className="py-2 px-3">Description / Folio Item</th>
                          <th className="py-2 px-3 text-right">Debit</th>
                          <th className="py-2 px-3 text-right">Credit</th>
                          <th className="py-2 px-3 text-right rounded-r-lg">Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        <tr>
                          <td className="py-2 px-3">{activeReservation.checkInDate}</td>
                          <td className="py-2 px-3">Accommodation Charges ({activeReservation.totalNights} Nights)</td>
                          <td className="py-2 px-3 text-right">R {activeReservation.totalAmount.toLocaleString()}</td>
                          <td className="py-2 px-3 text-right">-</td>
                          <td className="py-2 px-3 text-right font-bold">R {activeReservation.totalAmount.toLocaleString()}</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3">{activeReservation.checkInDate}</td>
                          <td className="py-2 px-3">Pre-Payment Received ({activeReservation.paymentMethod})</td>
                          <td className="py-2 px-3 text-right">-</td>
                          <td className="py-2 px-3 text-right text-emerald-700 font-bold">R {activeReservation.totalAmount.toLocaleString()}</td>
                          <td className="py-2 px-3 text-right font-bold text-emerald-800">R 0.00</td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Official Remittance Stub */}
                    <div className="mt-6 pt-4 border-t-2 border-dashed border-slate-400 space-y-2">
                      <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-500">
                        <span>✂ Please Detach & Return With Payment</span>
                        <span>Remittance Stub #{activeReservation.reservationNumber}</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-300 grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-bold">Resident</span>
                          <strong>{activeReservation.customerName} {activeReservation.customerSurname}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-bold">Suite & Ref</span>
                          <strong>Room {activeReservation.roomNumber} ({activeReservation.reservationNumber})</strong>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block uppercase font-bold">Closing Balance</span>
                          <strong className="text-emerald-700 text-sm">R 0.00 (Fully Settled)</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedDossierDoc === 'wifi' && (
                  <div className="space-y-4 text-xs text-slate-800">
                    <div className="border-b border-slate-200 pb-2 text-center space-y-1">
                      <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-2xl mx-auto flex items-center justify-center font-bold">
                        <Wifi className="w-6 h-6" />
                      </div>
                      <h2 className="text-xl font-bold font-serif-luxury text-slate-900">
                        HIGH-SPEED FIBRE WI-FI ACCESS CERTIFICATE
                      </h2>
                      <p className="text-xs text-slate-500">200Mbps Dedicated Uncapped Wireless Coverage</p>
                    </div>

                    <div className="max-w-md mx-auto p-6 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-center space-y-3">
                      <div>
                        <span className="text-[11px] text-slate-500 uppercase font-bold">Network Name (SSID)</span>
                        <div className="font-mono text-base font-extrabold text-slate-900">{wifiNetwork}</div>
                      </div>
                      <div className="pt-2 border-t border-emerald-200">
                        <span className="text-[11px] text-slate-500 uppercase font-bold">Passcode / Key</span>
                        <div className="font-mono text-2xl font-black text-emerald-800 tracking-wider">{wifiPassword}</div>
                      </div>
                      <p className="text-[10px] text-slate-500 pt-2">
                        Coverage encompasses Suite {activeReservation.roomNumber}, Lagoon Deck, Plunge Pool & Dining Veranda.
                      </p>
                    </div>
                  </div>
                )}

                {/* Generic view for remaining dossier docs */}
                {!['welcome', 'invoice', 'statement', 'wifi'].includes(selectedDossierDoc) && (
                  <div className="space-y-4 text-xs text-slate-800">
                    <div className="border-b border-slate-200 pb-2">
                      <h2 className="text-xl font-bold font-serif-luxury text-slate-900 uppercase">
                        {selectedDossierDoc.replace('_', ' ')} DOCUMENT
                      </h2>
                      <span className="text-xs text-slate-500">Tides of Knysna Official Resident Dossier</span>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 leading-relaxed">
                      <p>
                        This document constitutes an official record issued to <strong>{activeReservation.customerName} {activeReservation.customerSurname}</strong> for <strong>Suite {activeReservation.roomNumber}</strong> during the reservation period of {activeReservation.checkInDate} to {activeReservation.checkOutDate}.
                      </p>
                      <p>
                        All terms, safety protocols, and estate bylaws are protected under South African tourism hospitality standards. For questions or modifications, please contact the general manager at {info.telephone || GUEST_HOUSE_INFO.telephone}.
                      </p>
                    </div>

                    <div className="pt-8 grid grid-cols-2 gap-8">
                      <div className="border-t border-slate-900 pt-1 text-center">
                        <strong>Guest Signature</strong>
                        <div className="text-[10px] text-slate-500">Date: ________________________</div>
                      </div>
                      <div className="border-t border-slate-900 pt-1 text-center">
                        <strong>Duty Manager Sign-Off</strong>
                        <div className="text-[10px] text-slate-500">Eleanor Sterling • Operations</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================================= */}
            {/* BODY 2: ACCOUNTING & FINANCIAL DOCUMENTS                                  */}
            {/* ========================================================================= */}
            {activeCategory === 'accounting' && (
              <div className="space-y-5 text-xs text-slate-800">
                <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold font-serif-luxury text-slate-900 uppercase">
                      {selectedAccountingDoc.documentType}
                    </h2>
                    <span className="text-xs text-slate-500">Issued by Financial Administration Office</span>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-slate-900 text-sm">
                      #{selectedAccountingDoc.documentNumber}
                    </div>
                    <div className="text-[11px] text-slate-500">Issue Date: {selectedAccountingDoc.date}</div>
                    <div className="text-[11px] text-slate-500">Due Date: {selectedAccountingDoc.dueDate}</div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Party / Client:</span>
                    <strong className="text-slate-900 text-sm">{selectedAccountingDoc.clientOrSupplierName}</strong>
                    <div className="text-[11px] text-slate-500">{selectedAccountingDoc.clientEmail}</div>
                    <div className="text-[11px] text-slate-500">{selectedAccountingDoc.clientPhone}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Billing Terms:</span>
                    <div>Payment Due within 7 Days</div>
                    <div className="text-emerald-800 font-bold">FNB Account: 62899401293</div>
                  </div>
                </div>

                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold text-[11px]">
                      <th className="py-2.5 px-3 rounded-l-lg">Description</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Unit Price (ZAR)</th>
                      <th className="py-2.5 px-3 text-right rounded-r-lg">Total (ZAR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {selectedAccountingDoc.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-3 font-semibold">{it.description}</td>
                        <td className="py-2 px-3 text-center">{it.quantity}</td>
                        <td className="py-2 px-3 text-right">R {it.unitPrice.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</td>
                        <td className="py-2 px-3 text-right font-bold">R {it.total.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex justify-end pt-2">
                  <div className="w-64 space-y-1.5 text-right">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal:</span>
                      <strong>R {selectedAccountingDoc.subtotal.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</strong>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>VAT (15% Included):</span>
                      <strong>R {(selectedAccountingDoc.taxAmount || selectedAccountingDoc.subtotal * 0.15).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</strong>
                    </div>
                    <div className="flex justify-between text-base font-bold text-slate-950 border-t border-slate-900 pt-1.5">
                      <span>Grand Total:</span>
                      <span className="text-emerald-800">R {selectedAccountingDoc.grandTotal.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 space-y-1">
                  <strong>Banking Details for Electronic Settlement:</strong>
                  <div>First National Bank • Acc Name: Tides of Knysna Pty Ltd • Acc: 62899401293 • Branch: 210214 • Swift: FIRNZAJJ</div>
                  <div>Reference: #{selectedAccountingDoc.documentNumber}</div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* BODY 3: POLICIES & ALL UPLOADED DOCUMENTATION (CURRENT & NEW)             */}
            {/* ========================================================================= */}
            {activeCategory === 'policies' && selectedUploadedDoc && (
              <div className="space-y-5 text-xs text-slate-800">
                <div className="border-b border-slate-200 pb-3 flex justify-between items-start gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 text-emerald-400">
                        {selectedUploadedDoc.category}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {selectedUploadedDoc.strictness} Compliance
                      </span>
                    </div>
                    <h2 className="text-xl font-bold font-serif-luxury text-slate-900">
                      {selectedUploadedDoc.title}
                    </h2>
                    <span className="text-xs text-slate-500">Official Estate Bylaw Gazette & Legal Compliance Documentation</span>
                  </div>

                  <div className="text-right text-[11px] text-slate-500 font-mono">
                    <div>File: {selectedUploadedDoc.fileName}</div>
                    <div>Size: {selectedUploadedDoc.fileSize}</div>
                    <div>Uploaded: {selectedUploadedDoc.uploadedAt}</div>
                  </div>
                </div>

                {/* Policy terms & regulations transcript */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 leading-relaxed">
                  <h4 className="font-bold text-slate-900 uppercase text-xs tracking-wider">
                    Executive Summary & Operating Protocol
                  </h4>
                  <p>
                    {selectedUploadedDoc.notes || 'Official estate regulations and guest conduct protocol. By occupying the premises, resident guests and registered visitors confirm their agreement to abide by these statutory bylaws.'}
                  </p>

                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <div className="font-bold text-slate-900 text-xs">Statutory Provisions & Guidelines:</div>
                    <ul className="list-disc pl-5 space-y-1 text-slate-700">
                      <li><strong>Sanctuary Silence Hours:</strong> Strict quiet hours observed between 22:00 and 07:00 daily to safeguard peaceful lagoon birdlife.</li>
                      <li><strong>Waterway Conservation:</strong> The Knysna Ramsar Estuary is an environmentally protected marine sanctuary. No foreign pollutants or open fires permitted on private jetty.</li>
                      <li><strong>Pool & Heated Plunge Spas:</strong> Glassware is strictly prohibited around pool areas. Children under 16 must be accompanied by an adult guardian at all times.</li>
                      <li><strong>Suite Security & Master Keying:</strong> Digital PIN door codes are strictly personal to the registered booking party.</li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-950 text-xs space-y-1">
                  <strong>Tourism Grading Council South Africa (TGCSA) 5-Star Mandate:</strong>
                  <p className="text-[11px] text-emerald-800">
                    This official document is archived in the Knysna Municipal Estate Register. Hard copies are filed at the Front Desk for public review.
                  </p>
                </div>

                <div className="pt-6 grid grid-cols-2 gap-8">
                  <div className="border-t border-slate-900 pt-1 text-center">
                    <strong>Resident Acceptance Signature</strong>
                    <div className="text-[10px] text-slate-500">{activeReservation.customerName} {activeReservation.customerSurname}</div>
                  </div>
                  <div className="border-t border-slate-900 pt-1 text-center">
                    <strong>Estate Authority Countersign</strong>
                    <div className="text-[10px] text-slate-500">Eleanor Sterling • Estate Operations</div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* BODY 4: RESIDENT STAY PASS & DIGITAL KEY DOSSIER                          */}
            {/* ========================================================================= */}
            {activeCategory === 'staypass' && (
              <div className="space-y-6 text-xs text-slate-800">
                <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold font-serif-luxury text-slate-900">
                      OFFICIAL RESIDENT STAY PASS & ACCESS DOSSIER
                    </h2>
                    <span className="text-xs text-emerald-800 font-bold">Tides of Knysna Private Guest Access Card</span>
                  </div>
                  <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center font-mono font-bold text-xs">
                    <QrCode className="w-7 h-7 text-emerald-300" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <h4 className="font-bold text-slate-900 text-xs uppercase">Guest & Room Allocation</h4>
                    <div>Resident: <strong>{activeReservation.customerName} {activeReservation.customerSurname}</strong></div>
                    <div>Allocated Suite: <strong className="text-emerald-800 text-sm">Room {activeReservation.roomNumber} ({activeReservation.roomAllocation})</strong></div>
                    <div>Stay Window: <strong>{activeReservation.checkInDate} to {activeReservation.checkOutDate}</strong></div>
                    <div>Duration: <strong>{activeReservation.totalNights} Nights • {activeReservation.numberOfGuests} Guests</strong></div>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-400 space-y-2">
                    <h4 className="font-bold text-emerald-950 text-xs uppercase">Keyless Access Codes</h4>
                    <div className="flex justify-between items-center">
                      <span>Suite Door PIN:</span>
                      <strong className="font-mono text-base text-emerald-900">{activeReservation.roomPinCode || '4928'}</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Lagoon Security Gate:</span>
                      <strong className="font-mono text-base text-emerald-900">7721#</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Fibre Wi-Fi Network:</span>
                      <strong className="font-mono text-xs text-slate-800">{wifiNetwork}</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Wi-Fi Code:</span>
                      <strong className="font-mono text-sm text-emerald-800">{wifiPassword}</strong>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                  <strong>Important Notice:</strong> Present this pass at the Lagoon Terrace dining room for breakfast service and at the concierge for complimentary boat charter bookings.
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* BODY 5: CHECK-IN REGISTRATION CARD                                        */}
            {/* ========================================================================= */}
            {activeCategory === 'checkin' && (
              <div className="space-y-5 text-xs text-slate-800">
                <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold font-serif-luxury text-slate-900">
                      GUEST REGISTRATION CARD & ARRIVAL FOLIO
                    </h2>
                    <span className="text-xs text-slate-500">Tourism & Hospitality Act Statutory Form</span>
                  </div>
                  <div className="font-mono font-bold text-slate-900 text-sm">
                    Arrival Ref: #{activeReservation.reservationNumber}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="space-y-1.5">
                    <div><strong>Full Name:</strong> {activeReservation.customerName} {activeReservation.customerSurname}</div>
                    <div><strong>Passport / National ID:</strong> {activeReservation.idOrPassportNumber}</div>
                    <div><strong>Email:</strong> {activeReservation.customerEmail}</div>
                    <div><strong>Mobile:</strong> {activeReservation.customerPhone}</div>
                  </div>
                  <div className="space-y-1.5">
                    <div><strong>Allocated Suite:</strong> Room {activeReservation.roomNumber} ({activeReservation.roomAllocation})</div>
                    <div><strong>Arrival Date:</strong> {activeReservation.checkInDate} (From 14:00)</div>
                    <div><strong>Departure Date:</strong> {activeReservation.checkOutDate} (By 10:30)</div>
                    <div><strong>Number of Guests:</strong> {activeReservation.numberOfGuests}</div>
                  </div>
                </div>

                <div className="space-y-2 text-[11px] text-slate-600 leading-relaxed">
                  <p>
                    I hereby acknowledge registration at {info.name}. I agree to abide by the estate regulations, non-smoking policy inside suites, and agree to settle all personal charges prior to departure.
                  </p>
                </div>

                <div className="pt-8 grid grid-cols-2 gap-8">
                  <div className="border-t border-slate-900 pt-1 text-center">
                    <strong>Guest Signature</strong>
                    <div className="text-[10px] text-slate-500">Date: ________________________</div>
                  </div>
                  <div className="border-t border-slate-900 pt-1 text-center">
                    <strong>Reception Agent</strong>
                    <div className="text-[10px] text-slate-500">Eleanor Sterling • Verified & Key Issued</div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* BODY 6: DEPARTURE INSPECTION & CLEARANCE CERTIFICATE                      */}
            {/* ========================================================================= */}
            {activeCategory === 'departure' && (
              <div className="space-y-5 text-xs text-slate-800">
                <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold font-serif-luxury text-slate-900">
                      DEPARTURE INSPECTION & CLEARANCE CERTIFICATE
                    </h2>
                    <span className="text-xs text-slate-500">Suite Signoff & Breakage Deposit Release Record</span>
                  </div>
                  <div className="font-mono font-bold text-slate-900 text-sm">
                    Suite {activeReservation.roomNumber} Clearance
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="space-y-1">
                    <div><strong>Departing Resident:</strong> {activeReservation.customerName} {activeReservation.customerSurname}</div>
                    <div><strong>Suite Inspected:</strong> Room {activeReservation.roomNumber} ({activeReservation.roomAllocation})</div>
                    <div><strong>Check-Out Date:</strong> {activeReservation.checkOutDate}</div>
                  </div>
                  <div className="space-y-1">
                    <div><strong>Breakage Deposit:</strong> R {activeReservation.breakageDeposit?.toLocaleString() || '5,000'}</div>
                    <div><strong>Inspection Rating:</strong> <span className="font-bold text-emerald-700">Excellent (No Damages)</span></div>
                    <div><strong>Refund Authorized:</strong> <span className="font-bold text-emerald-800">100% Full Settlement Released</span></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs uppercase">Inspection Signoff Checklist:</h4>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 bg-emerald-50 rounded border border-emerald-200 flex items-center gap-1.5 font-medium text-emerald-900">
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> All master keys & remote fobs returned
                    </div>
                    <div className="p-2 bg-emerald-50 rounded border border-emerald-200 flex items-center gap-1.5 font-medium text-emerald-900">
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Spa bath, linens & furniture verified intact
                    </div>
                    <div className="p-2 bg-emerald-50 rounded border border-emerald-200 flex items-center gap-1.5 font-medium text-emerald-900">
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Minibar & boutique wine tally settled
                    </div>
                    <div className="p-2 bg-emerald-50 rounded border border-emerald-200 flex items-center gap-1.5 font-medium text-emerald-900">
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Final VAT invoice dispatched via email
                    </div>
                  </div>
                </div>

                <div className="pt-8 grid grid-cols-2 gap-8">
                  <div className="border-t border-slate-900 pt-1 text-center">
                    <strong>Inspecting Housekeeper</strong>
                    <div className="text-[10px] text-slate-500">Martha Ndlovu • Executive Housekeeping</div>
                  </div>
                  <div className="border-t border-slate-900 pt-1 text-center">
                    <strong>Operations Officer Signoff</strong>
                    <div className="text-[10px] text-slate-500">Eleanor Sterling • Deposit Released</div>
                  </div>
                </div>
              </div>
            )}

            {/* UNIVERSAL PRINTER ENGINE WATERMARK & CERTIFICATION FOOTER */}
            <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-400">
              <div className="flex items-center gap-2">
                <Printer className="w-3 h-3 text-emerald-600" />
                <span>
                  Universal Printer Engine Certified • Compatible with Inkjet, Laserjet & Inktank Drivers (HP, Epson, Canon, Brother, Kyocera, Xerox, Ricoh, Lexmark)
                </span>
              </div>
              <div className="font-mono">
                TSA-ISO-9001 • TGCSA Exclusive 5-Star Grade
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
