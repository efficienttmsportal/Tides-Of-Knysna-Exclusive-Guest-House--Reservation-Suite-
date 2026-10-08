import React, { useState } from 'react';
import { 
  Building2, 
  Save, 
  RotateCcw, 
  Check, 
  CheckCircle,
  Phone, 
  Mail, 
  MapPin, 
  CreditCard, 
  BedDouble, 
  Globe, 
  ShieldCheck, 
  Sparkles, 
  FileText, 
  ExternalLink,
  Plus,
  Trash2,
  AlertCircle,
  Upload,
  Printer,
  Download,
  Share2
} from 'lucide-react';
import { GUEST_HOUSE_INFO } from '../data/initialData';
import { UploadedPolicyDocument } from './GuestFolderModule';
import { WhatsAppIcon } from './GuestPortal';

export interface CompanyInfoData {
  name: string;
  tagline: string;
  subTagline: string;
  salesPerson: string;
  contactNumbers: string;
  telephone: string;
  mobile: string;
  email: string;
  adminEmail: string;
  webAddress: string;
  address: string;
  postalCode?: string;
  gpsCoordinates?: string;
  vatNumber?: string;
  checkInTime?: string;
  checkOutTime?: string;
  cancellationPolicy?: string;
  logoUrl?: string;
  brandingImageUrl?: string;
  letterheadHeaderUrl?: string;
  emailSignatureBannerUrl?: string;
  specialsImageUrl?: string;
  specialsBannerUrl?: string;
  guestHouseSpecialsImages?: string[];
  bankDetails: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    branchCode: string;
    swiftCode: string;
  };
  rooms: {
    number: string;
    name: string;
    type: string;
    capacity: number;
    defaultRate: number;
  }[];
}

interface CompanyInfoModuleProps {
  companyInfo: CompanyInfoData;
  onSaveCompanyInfo: (info: CompanyInfoData) => void;
  onResetDefaults: () => void;
}

export const CompanyInfoModule: React.FC<CompanyInfoModuleProps> = ({
  companyInfo,
  onSaveCompanyInfo,
  onResetDefaults
}) => {
  const [formData, setFormData] = useState<CompanyInfoData>({
    ...companyInfo,
    postalCode: companyInfo.postalCode || '6571',
    gpsCoordinates: companyInfo.gpsCoordinates || '-34.0354° S, 23.0465° E (Knysna Waterfront)',
    vatNumber: companyInfo.vatNumber || 'ZA4890219402',
    checkInTime: companyInfo.checkInTime || '14:00 - 20:00 (Late arrival concierge on request)',
    checkOutTime: companyInfo.checkOutTime || '10:30 (Late checkout subject to suite availability)',
    cancellationPolicy: companyInfo.cancellationPolicy || '100% refund up to 14 days prior to arrival; 50% refund up to 7 days prior. Non-refundable within 48 hours.',
    specialsImageUrl: companyInfo.specialsImageUrl || GUEST_HOUSE_INFO.specialsImageUrl,
    specialsBannerUrl: companyInfo.specialsBannerUrl || GUEST_HOUSE_INFO.specialsBannerUrl,
    guestHouseSpecialsImages: companyInfo.guestHouseSpecialsImages || GUEST_HOUSE_INFO.guestHouseSpecialsImages
  });

  const [activeSubTab, setActiveSubTab] = useState<'general' | 'branding' | 'contact' | 'banking' | 'rooms' | 'policies'>('general');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedSig, setCopiedSig] = useState(false);
  const logoInputRef = React.useRef<HTMLInputElement>(null);
  const brandingInputRef = React.useRef<HTMLInputElement>(null);
  const sigInputRef = React.useRef<HTMLInputElement>(null);
  const letterheadInputRef = React.useRef<HTMLInputElement>(null);
  const specialsInputRef = React.useRef<HTMLInputElement>(null);

  // Uploaded Estate Policies State (Synchronized across Admin and Guest Portal)
  const [uploadedPolicies, setUploadedPolicies] = useState<UploadedPolicyDocument[]>(() => {
    try {
      const saved = localStorage.getItem('tok_uploaded_policy_docs_v2');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load uploaded policies', e);
    }
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
  const [policyUploadTitle, setPolicyUploadTitle] = useState('');
  const [policyUploadCategory, setPolicyUploadCategory] = useState('Estate Protocol');
  const [policyUploadStrictness, setPolicyUploadStrictness] = useState<'Mandatory' | 'Standard' | 'Information'>('Mandatory');
  const [isUploadingPolicy, setIsUploadingPolicy] = useState(false);
  const [policyNotice, setPolicyNotice] = useState<string | null>(null);

  const handlePolicyUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPolicy(true);
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
        uploadedBy: 'Admin',
        dataUrl: reader.result as string,
        notes: `Uploaded by Admin Manager via Company Info Profile.`
      };

      const updated = [newPolicy, ...uploadedPolicies];
      setUploadedPolicies(updated);
      try {
        localStorage.setItem('tok_uploaded_policy_docs_v2', JSON.stringify(updated));
      } catch (err) {
        console.warn('Storage limit reached for policy dataUrl', err);
      }
      setIsUploadingPolicy(false);
      setPolicyUploadTitle('');
      setPolicyNotice(`Successfully uploaded policy document: "${newPolicy.title}"`);
      setTimeout(() => setPolicyNotice(null), 4000);
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteUploadedPolicy = (id: string) => {
    const updated = uploadedPolicies.filter(p => p.id !== id);
    setUploadedPolicies(updated);
    try {
      localStorage.setItem('tok_uploaded_policy_docs_v2', JSON.stringify(updated));
    } catch (e) {}
    setPolicyNotice('Policy document removed from registry.');
    setTimeout(() => setPolicyNotice(null), 3000);
  };

  const handleDownloadPolicyFile = (policy: UploadedPolicyDocument) => {
    if (policy.dataUrl) {
      const a = document.createElement('a');
      a.href = policy.dataUrl;
      a.download = policy.fileName;
      a.click();
    } else {
      const sampleText = `TIDES OF KNYSNA - ESTATE POLICY\n\nTitle: ${policy.title}\nCategory: ${policy.category}\nStrictness: ${policy.strictness}\nUploaded: ${policy.uploadedAt}\n\nOfficial notice: All resident guests and visitors must comply with this estate policy.`;
      const blob = new Blob([sampleText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = policy.fileName.endsWith('.txt') ? policy.fileName : `${policy.fileName}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
    setPolicyNotice(`Downloaded ${policy.title}`);
    setTimeout(() => setPolicyNotice(null), 3000);
  };

  const handlePrintPolicy = () => {
    window.print();
  };

  const handleFileUpload = (field: keyof CompanyInfoData, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setFormData(prev => ({
        ...prev,
        [field]: dataUrl
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSpecialsImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setFormData(prev => {
        const existing = prev.guestHouseSpecialsImages || [];
        return {
          ...prev,
          specialsImageUrl: dataUrl,
          specialsBannerUrl: dataUrl,
          guestHouseSpecialsImages: [dataUrl, ...existing.filter(img => img !== dataUrl)]
        };
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveSpecialImage = (index: number) => {
    setFormData(prev => {
      const current = [...(prev.guestHouseSpecialsImages || [])];
      current.splice(index, 1);
      return {
        ...prev,
        guestHouseSpecialsImages: current,
        specialsImageUrl: current[0] || ''
      };
    });
  };

  const handleSetPrimarySpecial = (imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      specialsImageUrl: imageUrl,
      specialsBannerUrl: imageUrl
    }));
  };

  const handleCopyEmailSignature = () => {
    const sigHtml = `
<table style="font-family: Arial, sans-serif; font-size: 13px; color: #1e293b; max-width: 600px; border-collapse: collapse;">
  <tr>
    <td style="padding-bottom: 10px;">
      <strong style="font-size: 16px; color: #065f46;">${formData.salesPerson}</strong><br/>
      <span style="color: #64748b; font-size: 12px;">Head of Guest Experience & Reservations | ${formData.name}</span>
    </td>
  </tr>
  <tr>
    <td style="padding-bottom: 10px;">
      <a href="https://${formData.webAddress}" target="_blank">
        <img src="${formData.logoUrl || GUEST_HOUSE_INFO.logoUrl}" alt="${formData.name}" style="height: 48px; display: block; border-radius: 4px; border: 0;" />
      </a>
    </td>
  </tr>
  <tr>
    <td style="padding-bottom: 10px; font-size: 12px; line-height: 1.5; color: #334155; border-top: 1px solid #e2e8f0; padding-top: 10px;">
      📍 <strong>Address:</strong> ${formData.address}<br/>
      📞 <strong>Tel:</strong> ${formData.telephone} | <strong>Mobile:</strong> ${formData.mobile}<br/>
      ✉️ <strong>Direct:</strong> <a href="mailto:${formData.email}" style="color: #059669; text-decoration: none;">${formData.email}</a> | 🌐 <a href="https://${formData.webAddress}" style="color: #059669; text-decoration: none;">${formData.webAddress}</a>
    </td>
  </tr>
  <tr>
    <td style="padding-top: 8px;">
      <img src="${formData.emailSignatureBannerUrl || formData.brandingImageUrl || GUEST_HOUSE_INFO.brandingImageUrl}" alt="Accreditation Seal" style="max-width: 100%; border-radius: 4px; display: block; border: 0;" />
    </td>
  </tr>
  <tr>
    <td style="padding-top: 8px; font-size: 10px; color: #94a3b8; font-style: italic;">
      ${formData.tagline} • South Africa 5-Star Graded Tourism Establishment
    </td>
  </tr>
</table>`;
    navigator.clipboard.writeText(sigHtml);
    setCopiedSig(true);
    setTimeout(() => setCopiedSig(false), 2500);
  };

  const handleChange = (field: keyof CompanyInfoData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBankChange = (field: keyof CompanyInfoData['bankDetails'], value: string) => {
    setFormData(prev => ({
      ...prev,
      bankDetails: {
        ...prev.bankDetails,
        [field]: value
      }
    }));
  };

  const handleRoomChange = (index: number, field: string, value: any) => {
    const updatedRooms = [...formData.rooms];
    updatedRooms[index] = {
      ...updatedRooms[index],
      [field]: field === 'capacity' || field === 'defaultRate' ? Number(value) : value
    };
    setFormData(prev => ({ ...prev, rooms: updatedRooms }));
  };

  const handleAddRoom = () => {
    const newRoomNumber = (100 + formData.rooms.length + 1).toString();
    const newRoom = {
      number: newRoomNumber,
      name: `Luxury Suite ${newRoomNumber}`,
      type: 'Executive Lagoon View',
      capacity: 2,
      defaultRate: 3200
    };
    setFormData(prev => ({
      ...prev,
      rooms: [...prev.rooms, newRoom]
    }));
  };

  const handleRemoveRoom = (index: number) => {
    if (formData.rooms.length <= 1) {
      alert('At least one room/suite must remain in inventory.');
      return;
    }
    const updated = formData.rooms.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, rooms: updated }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveCompanyInfo(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 text-white border border-slate-700 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif-luxury text-2xl font-bold text-white tracking-tight">
                Company & Establishment Profile
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                All Editable
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Manage core branding, legal entity, contact numbers, banking details, room inventory & policies.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onResetDefaults}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Defaults
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition"
          >
            {saveSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-200" />
                Changes Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save All Changes
              </>
            )}
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-xl flex items-center justify-between text-xs font-medium shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Company profile updated successfully! All invoice templates, guest portals, and vouchers will reflect these details.</span>
          </div>
          <span className="text-[11px] font-bold text-emerald-700">Live in System</span>
        </div>
      )}

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('general')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
            activeSubTab === 'general'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Building2 className="w-3.5 h-3.5 text-emerald-500" />
          General Profile
        </button>

        <button
          onClick={() => setActiveSubTab('branding')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
            activeSubTab === 'branding'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-pink-500" />
          Branding & Media Uploads
        </button>

        <button
          onClick={() => setActiveSubTab('contact')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
            activeSubTab === 'contact'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Phone className="w-3.5 h-3.5 text-blue-500" />
          Contact & Location
        </button>

        <button
          onClick={() => setActiveSubTab('banking')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
            activeSubTab === 'banking'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
          Banking & Fiscal Details
        </button>

        <button
          onClick={() => setActiveSubTab('rooms')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
            activeSubTab === 'rooms'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <BedDouble className="w-3.5 h-3.5 text-amber-500" />
          Rooms & Suites ({formData.rooms.length})
        </button>

        <button
          onClick={() => setActiveSubTab('policies')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
            activeSubTab === 'policies'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
          Policies & Hours
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* TAB 1: General & Branding */}
        {activeSubTab === 'general' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Brand Identity & Marketing Headings</h3>
              <p className="text-xs text-slate-500">Official business titles shown on letterheads, vouchers, and guest portals.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Establishment Trade Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full text-sm font-semibold px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Primary Brand Tagline
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => handleChange('tagline', e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Secondary Sub-Tagline
                </label>
                <input
                  type="text"
                  value={formData.subTagline}
                  onChange={(e) => handleChange('subTagline', e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Head of Guest Experience / Sales Person Signatory
                </label>
                <input
                  type="text"
                  value={formData.salesPerson}
                  onChange={(e) => handleChange('salesPerson', e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Website URL
                </label>
                <div className="relative">
                  <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={formData.webAddress}
                    onChange={(e) => handleChange('webAddress', e.target.value)}
                    className="w-full text-xs pl-8 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 1.5: Branding & Media Uploads */}
        {activeSubTab === 'branding' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Corporate Logo, Letterhead & Email Signature Assets</h3>
                <p className="text-xs text-slate-500">
                  Upload official artwork for company branding. Images automatically appear across all document headers, footers, and email signatures.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 1. Official Company Logo */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/60 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-slate-800">1. Company Logo</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">SVG / PNG</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Displayed on main application header, PDF invoices, guest vouchers, and in the footer.
                  </p>
                  <div className="h-20 bg-slate-950 p-2 rounded-xl border border-slate-800 flex items-center justify-center">
                    <img 
                      src={formData.logoUrl || GUEST_HOUSE_INFO.logoUrl} 
                      alt="Logo Preview" 
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <input
                    type="file"
                    ref={logoInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload('logoUrl', e.target.files[0]);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5" /> Upload Company Logo
                  </button>
                  <input
                    type="text"
                    value={formData.logoUrl || ''}
                    onChange={(e) => handleChange('logoUrl', e.target.value)}
                    placeholder="Or paste Logo Image URL..."
                    className="w-full text-[11px] px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-700"
                  />
                </div>
              </div>

              {/* 2. 5-Star Accreditation Branding Seal */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/60 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-slate-800">2. 5-Star Accreditation Badge</span>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Branding Seal</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Official accreditation emblem displayed on letterheads and below company logo in the footer.
                  </p>
                  <div className="h-20 bg-slate-950 p-2 rounded-xl border border-slate-800 flex items-center justify-center">
                    <img 
                      src={formData.brandingImageUrl || GUEST_HOUSE_INFO.brandingImageUrl} 
                      alt="Branding Seal Preview" 
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <input
                    type="file"
                    ref={brandingInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload('brandingImageUrl', e.target.files[0]);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => brandingInputRef.current?.click()}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5" /> Upload Branding Seal
                  </button>
                  <input
                    type="text"
                    value={formData.brandingImageUrl || ''}
                    onChange={(e) => handleChange('brandingImageUrl', e.target.value)}
                    placeholder="Or paste Branding Image URL..."
                    className="w-full text-[11px] px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-700"
                  />
                </div>
              </div>

              {/* 3. Email Signature Promo Banner */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/60 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-slate-800">3. Email Signature Banner</span>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">Email Artwork</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Placed directly inside outgoing executive email signatures below company logo.
                  </p>
                  <div className="h-20 bg-slate-950 p-2 rounded-xl border border-slate-800 flex items-center justify-center">
                    <img 
                      src={formData.emailSignatureBannerUrl || GUEST_HOUSE_INFO.emailSignatureBannerUrl} 
                      alt="Email Signature Banner Preview" 
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <input
                    type="file"
                    ref={sigInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload('emailSignatureBannerUrl', e.target.files[0]);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => sigInputRef.current?.click()}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5" /> Upload Email Sig Banner
                  </button>
                  <input
                    type="text"
                    value={formData.emailSignatureBannerUrl || ''}
                    onChange={(e) => handleChange('emailSignatureBannerUrl', e.target.value)}
                    placeholder="Or paste Signature Banner URL..."
                    className="w-full text-[11px] px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-700"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Contact & Location */}
        {activeSubTab === 'contact' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Direct Contact Lines & Geographical Address</h3>
              <p className="text-xs text-slate-500">Public contact numbers and operations manager email receiving inventory alerts.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Public Reservations Email
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full text-xs pl-8 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Operations Manager Alert Email</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">Inventory Alert Target</span>
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-emerald-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={formData.adminEmail}
                    onChange={(e) => handleChange('adminEmail', e.target.value)}
                    className="w-full text-xs pl-8 pr-3 py-2 border border-emerald-300 bg-emerald-50/30 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="qsappinfo@gmail.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Front Desk Telephone
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={formData.telephone}
                    onChange={(e) => handleChange('telephone', e.target.value)}
                    className="w-full text-xs pl-8 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Duty Manager Mobile / WhatsApp
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-emerald-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={formData.mobile}
                    onChange={(e) => handleChange('mobile', e.target.value)}
                    className="w-full text-xs pl-8 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Public Contact String (Header / Footer display)
                </label>
                <input
                  type="text"
                  value={formData.contactNumbers}
                  onChange={(e) => handleChange('contactNumbers', e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Physical Property Address
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    className="w-full text-xs pl-8 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Postal Code / Area
                </label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => handleChange('postalCode', e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  GPS Coordinates / Nav Reference
                </label>
                <input
                  type="text"
                  value={formData.gpsCoordinates}
                  onChange={(e) => handleChange('gpsCoordinates', e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Banking & Fiscal Details */}
        {activeSubTab === 'banking' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Banking Details & Tax Numbers</h3>
              <p className="text-xs text-slate-500">Rendered on EFT payment stubs, formal quotes, and guest invoice PDFs.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={formData.bankDetails.bankName}
                  onChange={(e) => handleBankChange('bankName', e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Account Name / Registered Entity
                </label>
                <input
                  type="text"
                  value={formData.bankDetails.accountName}
                  onChange={(e) => handleBankChange('accountName', e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  value={formData.bankDetails.accountNumber}
                  onChange={(e) => handleBankChange('accountNumber', e.target.value)}
                  className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Branch Code (Clearing Code)
                </label>
                <input
                  type="text"
                  value={formData.bankDetails.branchCode}
                  onChange={(e) => handleBankChange('branchCode', e.target.value)}
                  className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  SWIFT / BIC (International Inbound Wires)
                </label>
                <input
                  type="text"
                  value={formData.bankDetails.swiftCode}
                  onChange={(e) => handleBankChange('swiftCode', e.target.value)}
                  className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  VAT / Enterprise Registration Number
                </label>
                <input
                  type="text"
                  value={formData.vatNumber}
                  onChange={(e) => handleChange('vatNumber', e.target.value)}
                  className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Rooms & Suites */}
        {activeSubTab === 'rooms' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Room Inventory & Base Nightly Rates</h3>
                <p className="text-xs text-slate-500">Configure luxury suite titles, room numbers, capacities, and base rates.</p>
              </div>

              <button
                type="button"
                onClick={handleAddRoom}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Suite
              </button>
            </div>

            <div className="space-y-3">
              {formData.rooms.map((room, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition flex flex-col md:flex-row items-center gap-3">
                  <div className="w-16">
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">Room #</label>
                    <input
                      type="text"
                      value={room.number}
                      onChange={(e) => handleRoomChange(idx, 'number', e.target.value)}
                      className="w-full text-xs font-mono font-bold px-2 py-1.5 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>

                  <div className="flex-1 min-w-[200px] w-full">
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">Suite Name</label>
                    <input
                      type="text"
                      value={room.name}
                      onChange={(e) => handleRoomChange(idx, 'name', e.target.value)}
                      className="w-full text-xs font-semibold px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>

                  <div className="w-full md:w-44">
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">Suite Type</label>
                    <input
                      type="text"
                      value={room.type}
                      onChange={(e) => handleRoomChange(idx, 'type', e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>

                  <div className="w-24">
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">Guests Max</label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={room.capacity}
                      onChange={(e) => handleRoomChange(idx, 'capacity', e.target.value)}
                      className="w-full text-xs px-2 py-1.5 border border-slate-300 rounded-lg bg-white text-center"
                    />
                  </div>

                  <div className="w-32">
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">Base Rate (ZAR)</label>
                    <div className="relative">
                      <span className="absolute left-2 top-1.5 text-xs text-slate-400 font-bold">R</span>
                      <input
                        type="number"
                        min={500}
                        step={50}
                        value={room.defaultRate}
                        onChange={(e) => handleRoomChange(idx, 'defaultRate', e.target.value)}
                        className="w-full text-xs font-bold pl-6 pr-2 py-1.5 border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                  </div>

                  <div className="pt-4 md:pt-3">
                    <button
                      type="button"
                      onClick={() => handleRemoveRoom(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                      title="Remove Suite"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: Policies & Operating Hours + Official Policy Document Uploads */}
        {activeSubTab === 'policies' && (
          <div className="space-y-6">
            {policyNotice && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-bold flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>{policyNotice}</span>
                </div>
                <button onClick={() => setPolicyNotice(null)} className="text-emerald-700">✕</button>
              </div>
            )}

            {/* Standard Text Policies */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm">Guest Policies & Standard Operational Hours</h3>
                <p className="text-xs text-slate-500">Automatically shown to incoming guests in their Guest Portal & confirmation emails.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Check-In Window & Procedures
                  </label>
                  <input
                    type="text"
                    value={formData.checkInTime}
                    onChange={(e) => handleChange('checkInTime', e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Check-Out Window & Departure Inspections
                  </label>
                  <input
                    type="text"
                    value={formData.checkOutTime}
                    onChange={(e) => handleChange('checkOutTime', e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Standard Cancellation & Refund Policy
                  </label>
                  <textarea
                    rows={3}
                    value={formData.cancellationPolicy}
                    onChange={(e) => handleChange('cancellationPolicy', e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Official Policy Document Uploads & Repository */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-bold text-slate-900 text-sm">Official Estate Policy Documents & Legal Bylaws</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Upload official estate policy PDFs, terms, and guidelines. Synced directly to Guest Portal for guest download and printing.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handlePrintPolicy}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition self-start sm:self-auto"
                  title="Print all policy records on any printer"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-600" />
                  Print Policy Manifest
                </button>
              </div>

              {/* Upload Form Box */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-3">
                <div className="flex items-center justify-between">
                  <strong className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-emerald-600" />
                    Upload New Policy Document (PDF, Word, Text, Image)
                  </strong>
                  <span className="text-[10px] text-slate-400">Universal printer-ready format</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={policyUploadTitle}
                    onChange={(e) => setPolicyUploadTitle(e.target.value)}
                    placeholder="Document Title (e.g. Pet & Service Animal Protocol)"
                    className="px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />

                  <select
                    value={policyUploadCategory}
                    onChange={(e) => setPolicyUploadCategory(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="Estate Bylaws">Estate Bylaws</option>
                    <option value="Environmental Sanctuary">Environmental Sanctuary</option>
                    <option value="Safety & Indemnity">Safety & Indemnity</option>
                    <option value="Quiet Hours & Noise">Quiet Hours & Noise</option>
                    <option value="Pool & Plunge Protocol">Pool & Plunge Protocol</option>
                    <option value="Pet Policy">Pet Policy</option>
                    <option value="Cancellation & Refund">Cancellation & Refund</option>
                    <option value="VIP Resident Privileges">VIP Resident Privileges</option>
                  </select>

                  <label className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition shadow-xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploadingPolicy ? 'Uploading...' : 'Select File to Upload'}</span>
                    <input
                      type="file"
                      accept=".pdf,.docx,.doc,.txt,.png,.jpg,.jpeg"
                      onChange={handlePolicyUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Uploaded Policies Registry */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600 px-1">
                  <span>Registered Policy Archives ({uploadedPolicies.length} Active Documents)</span>
                  <span className="text-[11px] text-emerald-700">Live in Guest Portal</span>
                </div>

                {uploadedPolicies.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                    No policy documents uploaded yet. Upload your first PDF or document above.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                    {uploadedPolicies.map((pol) => (
                      <div key={pol.id} className="p-4 hover:bg-slate-50 transition flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                        <div className="flex items-start gap-3 min-w-0">
                          <span className="p-2 rounded-xl bg-blue-50 text-blue-700 shrink-0 mt-0.5">
                            <FileText className="w-4 h-4" />
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <strong className="text-slate-900 text-xs">{pol.title}</strong>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                {pol.category}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                pol.strictness === 'Mandatory'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {pol.strictness}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                              <span>File: {pol.fileName}</span>
                              <span>•</span>
                              <span>Size: {pol.fileSize}</span>
                              <span>•</span>
                              <span>Uploaded: {pol.uploadedAt} by {pol.uploadedBy}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                          <button
                            type="button"
                            onClick={() => handleDownloadPolicyFile(pol)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold flex items-center gap-1.5 transition text-xs"
                            title="Download Policy File"
                          >
                            <Download className="w-3.5 h-3.5 text-slate-600" />
                            Download
                          </button>

                          <button
                            type="button"
                            onClick={handlePrintPolicy}
                            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-xl font-bold flex items-center gap-1.5 transition text-xs"
                            title="Print policy documentation on any printer"
                          >
                            <Printer className="w-3.5 h-3.5 text-emerald-700" />
                            Print
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              const text = `📜 *ESTATE POLICY & HOUSE RULES*\n*${pol.title}*\nCategory: ${pol.category} (${pol.strictness})\nPlease review our official retreat guidelines. Download link: https://tidesofknysna.co.za/policies?doc=${pol.id}`;
                              window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
                            }}
                            className="p-1.5 bg-[#25D366]/20 hover:bg-[#25D366]/30 text-emerald-900 border border-[#25D366]/40 rounded-xl transition"
                            title="Share policy via WhatsApp"
                          >
                            <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366]" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteUploadedPolicy(pol.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                            title="Remove policy"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bottom Save Bar */}
        <div className="flex items-center justify-between p-4 bg-slate-900 text-white rounded-2xl shadow-lg">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Changes will apply system-wide across all guest vouchers, letters, and accounting docs.</span>
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-md transition"
          >
            <Save className="w-4 h-4" />
            Save Profile Changes
          </button>
        </div>
      </form>
    </div>
  );
};
