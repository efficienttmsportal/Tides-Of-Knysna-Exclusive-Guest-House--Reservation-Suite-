import React, { useRef, useState } from 'react';
import { 
  Building2, 
  Phone, 
  Mail, 
  Globe, 
  MapPin, 
  ShieldAlert, 
  FileText, 
  Layers,
  Award,
  Sparkles,
  Upload,
  Copy,
  Check,
  CheckCircle2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { GUEST_HOUSE_INFO } from '../data/initialData';
import { CompanyInfoData } from '../types';

interface FooterProps {
  onSelectTab: (tab: string) => void;
  companyInfo?: CompanyInfoData;
  onUpdateCompanyInfo?: (info: CompanyInfoData) => void;
}

export const Footer: React.FC<FooterProps> = ({ 
  onSelectTab, 
  companyInfo, 
  onUpdateCompanyInfo 
}) => {
  const [copiedSignature, setCopiedSignature] = useState(false);
  const [uploadToast, setUploadToast] = useState<string | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const brandingInputRef = useRef<HTMLInputElement>(null);

  const resolvedCompany = companyInfo || {
    name: GUEST_HOUSE_INFO.name,
    tagline: GUEST_HOUSE_INFO.tagline,
    subTagline: GUEST_HOUSE_INFO.subTagline,
    salesPerson: GUEST_HOUSE_INFO.salesPerson,
    contactNumbers: GUEST_HOUSE_INFO.contactNumbers,
    telephone: GUEST_HOUSE_INFO.telephone,
    mobile: GUEST_HOUSE_INFO.mobile,
    email: GUEST_HOUSE_INFO.email,
    adminEmail: GUEST_HOUSE_INFO.adminEmail,
    webAddress: GUEST_HOUSE_INFO.webAddress,
    address: GUEST_HOUSE_INFO.address,
    logoUrl: GUEST_HOUSE_INFO.logoUrl,
    brandingImageUrl: GUEST_HOUSE_INFO.brandingImageUrl,
    emailSignatureBannerUrl: GUEST_HOUSE_INFO.emailSignatureBannerUrl,
    bankDetails: GUEST_HOUSE_INFO.bankDetails,
    rooms: GUEST_HOUSE_INFO.rooms
  };

  const handleUploadImage = (field: 'logoUrl' | 'brandingImageUrl', file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (onUpdateCompanyInfo) {
        onUpdateCompanyInfo({
          ...resolvedCompany,
          [field]: dataUrl
        });
      }
      setUploadToast(`Uploaded new ${field === 'logoUrl' ? 'Company Logo' : 'Branding Seal'}`);
      setTimeout(() => setUploadToast(null), 3500);
    };
    reader.readAsDataURL(file);
  };

  const handleCopyEmailSignature = () => {
    const sigHtml = `
<table style="font-family: Arial, sans-serif; font-size: 13px; color: #1e293b; max-width: 600px; border-collapse: collapse;">
  <tr>
    <td style="padding-bottom: 10px;">
      <strong style="font-size: 16px; color: #065f46;">${resolvedCompany.salesPerson}</strong><br/>
      <span style="color: #64748b; font-size: 12px;">Head of Guest Experience & Reservations | ${resolvedCompany.name}</span>
    </td>
  </tr>
  <tr>
    <td style="padding-bottom: 10px;">
      <a href="https://${resolvedCompany.webAddress}" target="_blank">
        <img src="${resolvedCompany.logoUrl || GUEST_HOUSE_INFO.logoUrl}" alt="${resolvedCompany.name}" style="height: 48px; display: block; border-radius: 4px; border: 0;" />
      </a>
    </td>
  </tr>
  <tr>
    <td style="padding-bottom: 10px; font-size: 12px; line-height: 1.5; color: #334155; border-top: 1px solid #e2e8f0; padding-top: 10px;">
      📍 <strong>Address:</strong> ${resolvedCompany.address}<br/>
      📞 <strong>Tel:</strong> ${resolvedCompany.telephone} | <strong>Mobile:</strong> ${resolvedCompany.mobile}<br/>
      ✉️ <strong>Direct:</strong> <a href="mailto:${resolvedCompany.email}" style="color: #059669; text-decoration: none;">${resolvedCompany.email}</a> | 🌐 <a href="https://${resolvedCompany.webAddress}" style="color: #059669; text-decoration: none;">${resolvedCompany.webAddress}</a>
    </td>
  </tr>
  <tr>
    <td style="padding-top: 8px;">
      <img src="${resolvedCompany.emailSignatureBannerUrl || resolvedCompany.brandingImageUrl || GUEST_HOUSE_INFO.brandingImageUrl}" alt="Accreditation Seal" style="max-width: 100%; border-radius: 4px; display: block; border: 0;" />
    </td>
  </tr>
  <tr>
    <td style="padding-top: 8px; font-size: 10px; color: #94a3b8; font-style: italic;">
      ${resolvedCompany.tagline} • South Africa 5-Star Graded Tourism Establishment
    </td>
  </tr>
</table>`;

    navigator.clipboard.writeText(sigHtml);
    setCopiedSignature(true);
    setTimeout(() => setCopiedSignature(false), 2500);
  };

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 pt-10 pb-8 mt-16 no-print">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        {/* Toast note */}
        {uploadToast && (
          <div className="bg-emerald-950 border border-emerald-500/50 text-emerald-200 text-xs px-4 py-2 rounded-xl flex items-center justify-between animate-in fade-in">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {uploadToast}
            </span>
            <button onClick={() => setUploadToast(null)} className="text-emerald-400 font-bold">✕</button>
          </div>
        )}

        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-8 border-b border-slate-800">
          
          {/* COLUMN 1 & 2: COMPANY LOGO & BRANDING ON LETTERHEAD AND EMAIL SIGNATURE (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* 1. Official Company Logo */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-400 tracking-wider uppercase flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Official Corporate Brand Identity
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={logoInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleUploadImage('logoUrl', e.target.files[0]);
                      }
                    }}
                  />
                  <button
                    onClick={() => logoInputRef.current?.click()}
                    className="text-[10px] text-slate-400 hover:text-emerald-300 flex items-center gap-1 font-semibold transition"
                    title="Upload new corporate logo"
                  >
                    <Upload className="w-3 h-3" />
                    Upload Logo
                  </button>
                </div>
              </div>

              {/* The Logo Display */}
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex items-center justify-center">
                <img 
                  src={resolvedCompany.logoUrl || GUEST_HOUSE_INFO.logoUrl} 
                  alt={resolvedCompany.name}
                  className="max-h-14 w-auto object-contain"
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-0.5">
                <span className="font-serif-luxury text-slate-200 font-bold text-sm">
                  {resolvedCompany.name}
                </span>
                <span className="text-[11px] text-emerald-400 font-medium">
                  5-Star Graded
                </span>
              </div>
              <p className="text-xs text-slate-400 italic">
                "{resolvedCompany.tagline}"
              </p>
            </div>

            {/* 2. BRANDING ON LETTERHEAD AND EMAIL SIGNATURE BELOW COMPANY LOGO */}
            <div className="pt-3 border-t border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  Branding on Letterhead & Email Signature
                </span>
                <input
                  type="file"
                  ref={brandingInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleUploadImage('brandingImageUrl', e.target.files[0]);
                    }
                  }}
                />
                <button
                  onClick={() => brandingInputRef.current?.click()}
                  className="text-[10px] text-slate-400 hover:text-amber-300 flex items-center gap-1 font-semibold transition"
                  title="Upload branding seal or email signature banner"
                >
                  <Upload className="w-3 h-3" />
                  Upload Branding
                </button>
              </div>

              {/* Branding Image Display below logo */}
              <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shadow-inner">
                <img 
                  src={resolvedCompany.brandingImageUrl || GUEST_HOUSE_INFO.brandingImageUrl} 
                  alt="Official Branding Seal & Letterhead Emblem" 
                  className="w-full max-h-20 object-contain p-1"
                />
              </div>

              {/* Executive Email Signature Card below company logo */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-100 text-xs">{resolvedCompany.salesPerson}</div>
                    <div className="text-[10px] text-emerald-400">Head of Guest Experience • {resolvedCompany.name}</div>
                  </div>
                  <button
                    onClick={handleCopyEmailSignature}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-lg text-[10px] flex items-center gap-1 shadow-xs transition"
                  >
                    {copiedSignature ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedSignature ? 'Copied HTML!' : 'Copy Signature'}
                  </button>
                </div>

                <div className="text-[10.5px] text-slate-400 space-y-0.5 border-t border-slate-800 pt-1.5 leading-snug">
                  <div>📞 {resolvedCompany.telephone} | ✉️ {resolvedCompany.email}</div>
                  <div className="truncate">📍 {resolvedCompany.address}</div>
                </div>

                <div className="flex items-center justify-between pt-1 text-[10px]">
                  <button
                    onClick={() => onSelectTab('marketing')}
                    className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold transition"
                  >
                    <FileText className="w-3 h-3" />
                    Open Letterhead & Specials Studio <ChevronRight className="w-3 h-3" />
                  </button>
                  <span className="text-slate-500 font-mono">TGCSA #4890281928</span>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMN 3: OPERATIONAL SUITE SHORTCUTS (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              Operational Modules
            </h4>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <button onClick={() => onSelectTab('reservations')} className="text-left text-slate-400 hover:text-emerald-400 transition py-0.5">
                <strong className="text-slate-300">R</strong> - Reservations
              </button>
              <button onClick={() => onSelectTab('marketing')} className="text-left text-slate-400 hover:text-emerald-400 transition py-0.5">
                <strong className="text-slate-300">Mark</strong> - Specials & Brand
              </button>
              <button onClick={() => onSelectTab('checkin')} className="text-left text-slate-400 hover:text-emerald-400 transition py-0.5">
                <strong className="text-slate-300">CHI</strong> - Check-In
              </button>
              <button onClick={() => onSelectTab('departure')} className="text-left text-slate-400 hover:text-emerald-400 transition py-0.5">
                <strong className="text-slate-300">Dep</strong> - Departure
              </button>
              <button onClick={() => onSelectTab('accounting')} className="text-left text-slate-400 hover:text-emerald-400 transition py-0.5">
                <strong className="text-slate-300">Acc</strong> - Accounting
              </button>
              <button onClick={() => onSelectTab('employees')} className="text-left text-slate-400 hover:text-emerald-400 transition py-0.5">
                <strong className="text-slate-300">EMP</strong> - Employees
              </button>
              <button onClick={() => onSelectTab('inventory')} className="text-left text-slate-400 hover:text-emerald-400 transition py-0.5">
                <strong className="text-slate-300">Inv</strong> - Inventory
              </button>
              <button onClick={() => onSelectTab('checklists')} className="text-left text-slate-400 hover:text-emerald-400 transition py-0.5">
                <strong className="text-slate-300">Chk</strong> - Checklists
              </button>
              <button onClick={() => onSelectTab('suppliers')} className="text-left text-slate-400 hover:text-emerald-400 transition py-0.5">
                <strong className="text-slate-300">SCon</strong> - Suppliers
              </button>
              <button onClick={() => onSelectTab('company')} className="text-left text-slate-400 hover:text-emerald-400 transition py-0.5">
                <strong className="text-slate-300">Comp</strong> - Profile & Media
              </button>
              <button onClick={() => onSelectTab('attractions')} className="text-left text-slate-400 hover:text-emerald-400 transition py-0.5">
                <strong className="text-slate-300">MAP</strong> - Attractions
              </button>
              <button onClick={() => onSelectTab('backend')} className="text-left text-slate-400 hover:text-emerald-400 transition py-0.5">
                <strong className="text-slate-300">Bend</strong> - Cloud Backup
              </button>
            </div>
          </div>

          {/* COLUMN 4: DIRECT CONTACTS & BANKING (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              Direct Contacts & Banking
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <span>{resolvedCompany.contactNumbers}</span>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <span>{resolvedCompany.email}</span>
              </div>
              <div className="flex items-start gap-2">
                <Globe className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <a href={`https://${resolvedCompany.webAddress}`} target="_blank" rel="noreferrer" className="hover:text-emerald-300 transition">
                  {resolvedCompany.webAddress}
                </a>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <span className="leading-snug">{resolvedCompany.address}</span>
              </div>
            </div>

            {/* Breakage Deposit notice */}
            <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-[11px] space-y-1 mt-3">
              <div className="font-bold text-slate-200 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
                Refundable Breakage Deposit
              </div>
              <p className="text-slate-400 leading-snug">
                Inspected upon departure and refunded in full within 48 hours. FNB Acc: {resolvedCompany.bankDetails.accountNumber}.
              </p>
            </div>
          </div>

        </div>

        {/* Bottom copyright & attribution */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            © {new Date().getFullYear()} {resolvedCompany.name}. All Rights Reserved. South Africa VAT Reg: 4890281928.
          </div>
          <div className="flex items-center gap-4">
            <span className="text-emerald-400">Where Elegance Meets Adventures</span>
            <span>•</span>
            <span className="hover:text-slate-300 cursor-pointer" onClick={() => onSelectTab('marketing')}>
              Marketing & Branding Hub
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
