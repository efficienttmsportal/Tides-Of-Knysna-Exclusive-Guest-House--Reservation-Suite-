import React, { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import { 
  Megaphone, 
  Hash, 
  Sparkles, 
  Tag, 
  FileText, 
  CreditCard, 
  BarChart3, 
  Copy, 
  Check, 
  Printer, 
  Download, 
  Mail, 
  Share2,
  Calendar,
  Layers,
  Image as ImageIcon,
  Upload,
  Trash2,
  Plus,
  RefreshCw,
  Eye,
  CheckCircle2,
  ExternalLink,
  Phone,
  MapPin,
  Award,
  Sliders,
  MessageSquare,
  Clock,
  Send,
  Smartphone
} from 'lucide-react';
import { DocumentActionBar } from './DocumentActionBar';
import { MarketingSpecial, SocialTemplate, CompanyInfoData } from '../types';
import { INITIAL_SPECIALS, GUEST_HOUSE_INFO } from '../data/initialData';

const InstagramIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const FacebookIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
  </svg>
);

// Curated high-resolution imagery presets for Knysna and luxury hospitality
const CURATED_PRESET_IMAGES = [
  {
    name: 'Lagoon Sunset & Catamaran',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    season: 'Spring'
  },
  {
    name: 'The Heads Luxury Villa & Spa',
    url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    season: 'Spring'
  },
  {
    name: 'Garden Route Spring Canopy',
    url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
    season: 'Spring'
  },
  {
    name: 'Summer Lagoon Sun & Cocktails',
    url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80',
    season: 'Summer'
  },
  {
    name: 'Autumn Wine Harvest & Vines',
    url: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1200&q=80',
    season: 'Autumn'
  },
  {
    name: 'Winter Fireside & Heated Spa',
    url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    season: 'Winter'
  }
];

// Seasonal specials templates by South African seasons (Knysna context)
const SEASONAL_TEMPLATES: Record<string, MarketingSpecial[]> = {
  Spring: [
    {
      id: `sp-spring-${Date.now()}-1`,
      promoCode: 'KNYSNA-SPRING26',
      discountPercent: 15,
      title: 'Spring Lagoon Blossom & Sunset Catamaran Escape',
      validUntil: '30 Nov 2026',
      season: 'Spring',
      description: 'Embrace spring across Knysna! Enjoy 15% off midweek stays in our luxury suites, chilled Moët & Chandon champagne on arrival, and complimentary private sunset kayak excursions on the lagoon.',
      imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      hashtags: [
        '#TidesOfKnysna',
        '#KnysnaSpring2026',
        '#GardenRouteLuxury',
        '#SpringBlossomEscape',
        '#KnysnaLagoon',
        '#SouthAfricaSpring',
        '#BoutiqueHotelSA',
        '#LuxurySuitesSA'
      ],
      inclusions: [
        '15% Off 2+ Night Midweek Stays',
        'Welcome Chilled Champagne & Artisanal Oysters',
        'Sunset Lagoon Kayak Excursion',
        'Gourmet Lagoon Deck Breakfast'
      ],
      targetAudience: 'Couples & Nature Enthusiasts'
    },
    {
      id: `sp-spring-${Date.now()}-2`,
      promoCode: 'FYNBOS-SPA',
      discountPercent: 20,
      title: 'Fynbos Botanical Wellness & Suite Sanctuary',
      validUntil: '15 Dec 2026',
      season: 'Spring',
      description: 'Rejuvenate your senses with blooming Garden Route fynbos. Includes a 20% discount on The Heads Villa, private couples botanical massage, and herbal aromatherapy spa gift basket.',
      imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
      hashtags: [
        '#TidesOfKnysna',
        '#FynbosWellness',
        '#GardenRouteSpa',
        '#KnysnaHeads',
        '#SpringRejuvenation',
        '#LuxurySanctuary'
      ],
      inclusions: [
        '20% Off 3+ Night Stays',
        '60-Min Couples Botanical Massage',
        'Fynbos Essential Oils Welcome Gift',
        'Organic Farm-to-Table Breakfast'
      ],
      targetAudience: 'Wellness Seekers & Spa Lovers'
    }
  ],
  Summer: [
    {
      id: `sp-summer-${Date.now()}-1`,
      promoCode: 'SUMMER-LAGOON',
      discountPercent: 15,
      title: 'Summer Splash & Private Jetty Catamaran Gala',
      validUntil: '28 Feb 2027',
      season: 'Summer',
      description: 'Bask in sun-drenched Knysna luxury! Direct lagoon swimming access from our private jetty, sunset oyster cruise, and VIP private transfer to Brenton-on-Sea beach.',
      imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80',
      hashtags: [
        '#TidesOfKnysna',
        '#SummerInKnysna',
        '#GardenRouteSummer',
        '#LagoonSanctuary',
        '#KnysnaHeads',
        '#FestiveSeasonSA',
        '#LuxuryTravelSA'
      ],
      inclusions: [
        '15% Off 3+ Night Summer Stays',
        'Complimentary Lagoon Catamaran Cruise',
        'Daily Sundowner Cocktails on Private Terrace',
        'Beach Shuttle & Luxury Picnic Hamper'
      ],
      targetAudience: 'Holidaymakers & Family Gatherings'
    },
    {
      id: `sp-summer-${Date.now()}-2`,
      promoCode: 'FESTIVE-VIP',
      discountPercent: 25,
      title: 'Festive Season Grand Panorama Villa Package',
      validUntil: '15 Jan 2027',
      season: 'Summer',
      description: 'Celebrate Christmas and New Year overlooking the Knysna Heads. Exclusive full villa access, private chef dinners, and unlimited champagne for 5 nights or more.',
      imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
      hashtags: [
        '#TidesOfKnysna',
        '#FestiveVIP',
        '#NewYearKnysna',
        '#PresidentialVilla',
        '#LuxuryHolidaysSA',
        '#KnysnaHeads'
      ],
      inclusions: [
        '25% Off 5+ Night Extended Stays',
        'Private In-Suite Chef 5-Course Dinner',
        'Magnum Dom Pérignon on Arrival',
        'Unlimited Concierge & Airport Transfer'
      ],
      targetAudience: 'VIP Executives & Celebration Groups'
    }
  ],
  Autumn: [
    {
      id: `sp-autumn-${Date.now()}-1`,
      promoCode: 'AUTUMN-HARVEST',
      discountPercent: 18,
      title: 'Garden Route Wine Harvest & Lagoon Sunset Retreat',
      validUntil: '31 May 2027',
      season: 'Autumn',
      description: 'Experience the golden glow of autumn on Knysna Lagoon. Includes guided Bramon Wine Estate Cap Classique tasting, charcuterie boards, and heated plunge pool relaxation.',
      imageUrl: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1200&q=80',
      hashtags: [
        '#TidesOfKnysna',
        '#AutumnHarvestKnysna',
        '#PlettWineRoute',
        '#GoldenLagoon',
        '#WineTastingSA',
        '#GardenRouteAutumn'
      ],
      inclusions: [
        '18% Off Midweek Autumn Bookings',
        'Bramon Wine Tasting Passes for Two',
        'Artisan South African Cheese Platter',
        'Late Checkout to 14:00'
      ],
      targetAudience: 'Wine Connoisseurs & Gourmet Travelers'
    }
  ],
  Winter: [
    {
      id: `sp-winter-${Date.now()}-1`,
      promoCode: 'OYSTER-FEST-VIP',
      discountPercent: 20,
      title: 'Knysna Oyster Festival & Cozy Fireside Romance',
      validUntil: '31 Jul 2027',
      season: 'Winter',
      description: 'Attend South Africa’s premier winter festival in 5-star style. VIP Knysna Oyster Festival event tickets, private heated plunge pool, roaring fireplace, and hot mulled wine.',
      imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      hashtags: [
        '#TidesOfKnysna',
        '#KnysnaOysterFestival',
        '#OysterFest2026',
        '#WinterWarmthKnysna',
        '#CozyLuxury',
        '#WhaleWatchingSA',
        '#GardenRouteWinter'
      ],
      inclusions: [
        '20% Off Festival Stay Dates',
        'VIP Oyster Festival Tasting Tickets',
        'Fireside Port & Hot Chocolate Service',
        'Heated Plunge Pool Temperature Guarantee'
      ],
      targetAudience: 'Festival Attendees & Winter Escapists'
    }
  ]
};

interface MarketingModuleProps {
  companyInfo?: CompanyInfoData;
  onUpdateCompanyInfo?: (info: CompanyInfoData) => void;
}

export const MarketingModule: React.FC<MarketingModuleProps> = ({
  companyInfo,
  onUpdateCompanyInfo
}) => {
  const [activeTab, setActiveTab] = useState<'specials' | 'branding' | 'social' | 'hashtags' | 'sales_report'>('specials');
  const [specials, setSpecials] = useState<MarketingSpecial[]>(() => {
    try {
      const saved = localStorage.getItem('tok_marketing_specials_v2');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load specials from localStorage', e);
    }
    return INITIAL_SPECIALS;
  });
  const [selectedSpecialId, setSelectedSpecialId] = useState<string>(specials[0]?.id || '');
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedVoucher, setCopiedVoucher] = useState(false);
  const [copiedSignature, setCopiedSignature] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState<'Spring' | 'Summer' | 'Autumn' | 'Winter'>('Spring');
  const [autoPreviewMode, setAutoPreviewMode] = useState<'voucher' | 'instagram' | 'facebook' | 'whatsapp' | 'signature'>('voucher');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Full image view toggle for marketing photography on all social media pages
  const [showFullImageOnly, setShowFullImageOnly] = useState(false);

  // Hashtags Editing State
  const [newHashtagInput, setNewHashtagInput] = useState('');
  const [editingTagIndex, setEditingTagIndex] = useState<number | null>(null);
  const [editingTagValue, setEditingTagValue] = useState('');

  const activeSpecial = specials.find(s => s.id === selectedSpecialId) || specials[0];
  const [editSpecial, setEditSpecial] = useState<MarketingSpecial>(activeSpecial);

  // File upload refs
  const specialFileInputRef = useRef<HTMLInputElement>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const brandingFileInputRef = useRef<HTMLInputElement>(null);
  const emailSigFileInputRef = useRef<HTMLInputElement>(null);

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

  React.useEffect(() => {
    if (activeSpecial) {
      setEditSpecial({
        ...activeSpecial,
        hashtags: activeSpecial.hashtags || [
          '#TidesOfKnysna',
          '#KnysnaLuxury',
          '#GardenRouteEscape',
          '#SouthAfricaTravel'
        ]
      });
    }
  }, [selectedSpecialId]);

  // Download Special or Marketing Material as Official Adobe PDF with Corporate Branding
  const handleDownloadMarketingAdobePdf = (title: string, subtitle: string, details: string) => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const companyTitle = resolvedCompany.name;
      const companySub = resolvedCompany.tagline || '5-STAR LUXURY BOUTIQUE RETREAT & SPA';
      const companyAddr = resolvedCompany.address || GUEST_HOUSE_INFO.address;
      const companyTel = resolvedCompany.telephone || GUEST_HOUSE_INFO.telephone;
      const companyEmail = resolvedCompany.email || GUEST_HOUSE_INFO.email;

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

      // Title Banner
      pdf.setFillColor(240, 253, 244);
      pdf.setDrawColor(16, 185, 129);
      pdf.rect(15, 38, 180, 18, 'FD');
      pdf.setTextColor(6, 78, 59);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.text(`OFFICIAL SPECIAL & MARKETING CAMPAIGN: ${title.toUpperCase()}`, 20, 49);

      // Details block
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9.5);
      pdf.setTextColor(15, 23, 42);

      let yPos = 65;
      pdf.text(`Category & Code: ${subtitle}`, 15, yPos);
      yPos += 8;
      pdf.setDrawColor(203, 213, 225);
      pdf.line(15, yPos, 195, yPos);

      yPos += 8;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(51, 65, 85);

      const splitText = pdf.splitTextToSize(details, 180);
      let lineIdx = 0;
      while (lineIdx < splitText.length) {
        if (yPos > 275) {
          pdf.addPage();
          yPos = 20;
        }
        pdf.text(splitText[lineIdx], 15, yPos);
        yPos += 6;
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
      pdf.text(`Reservations & Marketing: ${companyTel} • ${companyEmail}`, 15, yPos);

      pdf.save(`${title.replace(/[^a-zA-Z0-9]/g, '_')}_Adobe_PDF.pdf`);
      setSaveSuccessMsg(`Downloaded ${title} as Adobe PDF successfully!`);
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    } catch (err) {
      console.error('Marketing PDF generation error:', err);
      setSaveSuccessMsg('Failed to generate Adobe PDF.');
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    }
  };

  // Handle uploading image for a special (base64)
  const handleUploadSpecialImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setEditSpecial(prev => ({
        ...prev,
        imageUrl: dataUrl
      }));
    };
    reader.readAsDataURL(file);
  };

  // Handle uploading branding images for company
  const handleUploadCompanyBranding = (field: 'logoUrl' | 'brandingImageUrl' | 'emailSignatureBannerUrl' | 'letterheadHeaderUrl', file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (onUpdateCompanyInfo) {
        onUpdateCompanyInfo({
          ...resolvedCompany,
          [field]: dataUrl
        });
      }
      setSaveSuccessMsg(`Updated ${field.replace('Url', '')} branding image.`);
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    };
    reader.readAsDataURL(file);
  };

  // Auto-generate seasonal specials
  const handleAutoGenerateSeasonSpecials = (seasonName: 'Spring' | 'Summer' | 'Autumn' | 'Winter') => {
    const templates = SEASONAL_TEMPLATES[seasonName] || SEASONAL_TEMPLATES.Spring;
    
    // Check if they already exist or generate fresh
    const newSpecials = templates.map((tmpl, idx) => ({
      ...tmpl,
      id: `sp-${seasonName.toLowerCase()}-${Date.now()}-${idx}`
    }));

    const updated = [...newSpecials, ...specials];
    setSpecials(updated);
    try {
      localStorage.setItem('tok_marketing_specials_v2', JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('tok_specials_updated', { detail: updated }));
    } catch (e) {
      console.warn('Failed to persist specials', e);
    }
    setSelectedSpecialId(newSpecials[0].id);
    setEditSpecial(newSpecials[0]);
    setSelectedSeason(seasonName);
    setSaveSuccessMsg(`✨ Auto-generated ${newSpecials.length} seasonal ${seasonName} specials with custom hashtags & imagery!`);
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  const handleSaveSpecial = () => {
    const updated = specials.map(s => s.id === editSpecial.id ? editSpecial : s);
    setSpecials(updated);
    try {
      localStorage.setItem('tok_marketing_specials_v2', JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('tok_specials_updated', { detail: updated }));
    } catch (e) {
      console.warn('Failed to persist specials', e);
    }
    setSaveSuccessMsg('Special promotion, hashtags & media assets successfully updated & synchronized.');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleCreateNewSpecial = () => {
    const newId = `sp-${Date.now()}`;
    const newSp: MarketingSpecial = {
      id: newId,
      promoCode: `TOK-${selectedSeason.toUpperCase()}-26`,
      discountPercent: 15,
      title: `${selectedSeason} Signature Lagoon Privilege`,
      validUntil: '31 Dec 2026',
      season: selectedSeason,
      description: `Escape to ${resolvedCompany.name} during ${selectedSeason}. Unmatched lagoon views, sunset bubbles, and private chauffeur options.`,
      imageUrl: CURATED_PRESET_IMAGES[0].url,
      hashtags: [
        '#TidesOfKnysna',
        `#Knysna${selectedSeason}`,
        '#GardenRouteLuxury',
        '#LagoonViews',
        '#BoutiqueHotelSA'
      ],
      inclusions: [
        '15% Off Suite Rates',
        'Complimentary Welcome Drinks',
        'Daily Gourmet Breakfast'
      ],
      targetAudience: 'Luxury Travelers'
    };
    const updated = [newSp, ...specials];
    setSpecials(updated);
    try {
      localStorage.setItem('tok_marketing_specials_v2', JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('tok_specials_updated', { detail: updated }));
    } catch (e) {
      console.warn('Failed to persist specials', e);
    }
    setSelectedSpecialId(newId);
    setEditSpecial(newSp);
  };

  const handleDeleteSpecial = (id: string) => {
    if (specials.length <= 1) {
      setSaveSuccessMsg('A minimum of one active special promotion is required.');
      setTimeout(() => setSaveSuccessMsg(null), 3000);
      return;
    }
    const filtered = specials.filter(s => s.id !== id);
    setSpecials(filtered);
    try {
      localStorage.setItem('tok_marketing_specials_v2', JSON.stringify(filtered));
      window.dispatchEvent(new CustomEvent('tok_specials_updated', { detail: filtered }));
    } catch (e) {
      console.warn('Failed to persist specials', e);
    }
    if (selectedSpecialId === id && filtered.length > 0) {
      setSelectedSpecialId(filtered[0].id);
      setEditSpecial(filtered[0]);
    }
    setSaveSuccessMsg('Special campaign removed.');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const hashtagsList = editSpecial.hashtags || [
    '#TidesOfKnysna',
    '#KnysnaExclusiveGuestHouse',
    '#GardenRouteLuxury',
    '#KnysnaHeads',
    '#SouthAfricaLuxuryTravel',
    '#LagoonViews',
    '#BoutiqueHotelSA',
    '#KnysnaHolidays'
  ];

  const handleAddHashtag = (tagToAdd?: string) => {
    const val = (tagToAdd || newHashtagInput).trim();
    if (!val) return;
    const formatted = val.startsWith('#') ? val : `#${val}`;
    const current = editSpecial.hashtags || [];
    if (!current.includes(formatted)) {
      const updated = [...current, formatted];
      setEditSpecial(prev => ({ ...prev, hashtags: updated }));
      setSpecials(prev => prev.map(s => s.id === editSpecial.id ? { ...s, hashtags: updated } : s));
      setSaveSuccessMsg(`Added ${formatted} to active social hashtags.`);
      setTimeout(() => setSaveSuccessMsg(null), 2500);
    }
    setNewHashtagInput('');
  };

  const handleDeleteHashtag = (index: number) => {
    const current = editSpecial.hashtags || [];
    const updated = current.filter((_, i) => i !== index);
    setEditSpecial(prev => ({ ...prev, hashtags: updated }));
    setSpecials(prev => prev.map(s => s.id === editSpecial.id ? { ...s, hashtags: updated } : s));
  };

  const handleSaveEditedTag = (index: number) => {
    if (!editingTagValue.trim()) return;
    const formatted = editingTagValue.trim().startsWith('#') ? editingTagValue.trim() : `#${editingTagValue.trim()}`;
    const current = [...(editSpecial.hashtags || [])];
    current[index] = formatted;
    setEditSpecial(prev => ({ ...prev, hashtags: current }));
    setSpecials(prev => prev.map(s => s.id === editSpecial.id ? { ...s, hashtags: current } : s));
    setEditingTagIndex(null);
  };

  const handleCopyHashtags = () => {
    navigator.clipboard.writeText(hashtagsList.join(' '));
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  // Copy HTML Email Signature to clipboard
  const handleCopyHtmlEmailSignature = () => {
    const sigHtml = `
<table style="font-family: Arial, sans-serif; font-size: 13px; color: #1e293b; max-width: 600px; border-collapse: collapse;">
  <tr>
    <td style="padding-bottom: 12px;">
      <strong style="font-size: 16px; color: #065f46;">${resolvedCompany.salesPerson}</strong><br/>
      <span style="color: #64748b; font-size: 12px;">Head of Guest Experience & Reservations | ${resolvedCompany.name}</span>
    </td>
  </tr>
  <tr>
    <td style="padding-bottom: 12px;">
      <a href="https://${resolvedCompany.webAddress}" target="_blank">
        <img src="${resolvedCompany.logoUrl || GUEST_HOUSE_INFO.logoUrl}" alt="${resolvedCompany.name}" style="height: 50px; display: block; border-radius: 6px; border: 0;" />
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
      <img src="${resolvedCompany.emailSignatureBannerUrl || resolvedCompany.brandingImageUrl || GUEST_HOUSE_INFO.brandingImageUrl}" alt="5-Star Accreditation & Specials" style="max-width: 100%; border-radius: 6px; display: block; border: 0;" />
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

  // ==========================================
  // MARKETING DOWNLOAD & SHARING HANDLERS
  // ==========================================
  const handleDownloadHtmlDoc = (filename: string, title: string, contentHtml: string) => {
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title} - ${resolvedCompany.name}</title>
  <style>
    @page { size: A4 portrait; margin: 15mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #0f172a; margin: 0; padding: 24px; background: #fff; line-height: 1.5; }
    .header { border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
    .footer { margin-top: 36px; padding-top: 14px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; text-align: center; }
    @media print { body { padding: 0; } .no-print { display: none !important; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h2 style="margin: 0; color: #064e3b; font-family: Georgia, serif;">${resolvedCompany.name}</h2>
      <div style="font-size: 12px; color: #64748b; font-style: italic;">${resolvedCompany.tagline}</div>
    </div>
    <div style="text-align: right; font-size: 11px; color: #475569;">
      <div>TGCSA ★★★★★ Luxury Graded</div>
      <div>Knysna Lagoon • Garden Route</div>
    </div>
  </div>
  ${contentHtml}
  <div class="footer">
    <div>Issued by ${resolvedCompany.name} Marketing Division • VAT: 4890281928</div>
    <div>Enquiries: ${resolvedCompany.email} • Tel: ${resolvedCompany.telephone} • Web: ${resolvedCompany.webAddress}</div>
  </div>
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setSaveSuccessMsg(`Downloaded "${title}" dossier successfully!`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const getSpecialShareText = (sp: MarketingSpecial) => {
    return `Dear Valued Guest,\n\n` +
      `We are delighted to share an exclusive privilege invitation to ${resolvedCompany.name} in Knysna.\n\n` +
      `✨ ${sp.title.toUpperCase()}\n` +
      `${sp.description}\n\n` +
      `🎁 PRIVILEGE BENEFIT: ${sp.discountPercent}% Direct Booking Saving\n` +
      `🔑 EXCLUSIVE PROMO CODE: ${sp.promoCode}\n` +
      `📅 VALIDITY: Valid until ${sp.validUntil}\n` +
      (sp.inclusions && sp.inclusions.length > 0 ? `\nPackage Inclusions:\n` + sp.inclusions.map(i => `• ${i}`).join('\n') + `\n` : '') +
      `\nReserve your suite directly online: https://${resolvedCompany.webAddress}\n` +
      `Direct Inquiries: ${resolvedCompany.email} | Tel: ${resolvedCompany.telephone}\n\n` +
      `Warm regards,\n${resolvedCompany.salesPerson}\n${resolvedCompany.name} Exclusive Guest House\n\n` +
      (sp.hashtags || []).join(' ');
  };

  const handleShareSpecialEmail = (sp: MarketingSpecial, client: 'gmail' | 'yahoo' | 'outlook' | 'default') => {
    const subject = encodeURIComponent(`Exclusive Invitation: ${sp.title} (${sp.discountPercent}% Saving) - ${resolvedCompany.name}`);
    const body = encodeURIComponent(getSpecialShareText(sp));

    if (client === 'gmail') {
      window.open(`https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`, '_blank', 'noopener,noreferrer');
    } else if (client === 'yahoo') {
      window.open(`https://compose.mail.yahoo.com/?subj=${subject}&body=${body}`, '_blank', 'noopener,noreferrer');
    } else if (client === 'outlook') {
      window.open(`https://outlook.live.com/mail/0/deeplink/compose?subject=${subject}&body=${body}`, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
    }
  };

  const handleShareSpecialWhatsApp = (sp: MarketingSpecial) => {
    const text = encodeURIComponent(getSpecialShareText(sp));
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadSpecialVoucher = (sp: MarketingSpecial) => {
    const voucherHtml = `
      <div style="border: 2px solid #064e3b; border-radius: 12px; padding: 24px; background: #f0fdf4; margin: 20px 0;">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div>
            <span style="background: #047857; color: #fff; padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: bold; text-transform: uppercase;">
              ${sp.season || 'Seasonal'} Exclusive Privilege Voucher
            </span>
            <h1 style="margin: 12px 0 6px 0; color: #0f172a; font-size: 24px; font-family: Georgia, serif;">${sp.title}</h1>
            <p style="color: #334155; font-size: 14px; margin: 0 0 16px 0;">${sp.description}</p>
          </div>
          <div style="text-align: right; background: #fbbf24; color: #0f172a; padding: 12px 18px; border-radius: 12px; font-weight: 900; font-size: 18px;">
            ${sp.discountPercent}% OFF
          </div>
        </div>

        ${sp.inclusions && sp.inclusions.length > 0 ? `
          <div style="margin: 16px 0; padding: 12px; background: #fff; border-radius: 8px; border: 1px solid #a7f3d0;">
            <strong style="font-size: 12px; color: #065f46; text-transform: uppercase;">Package Inclusions:</strong>
            <ul style="margin: 8px 0 0 0; padding-left: 20px; font-size: 13px; color: #1e293b;">
              ${sp.inclusions.map(inc => `<li>${inc}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        <div style="margin-top: 16px; padding-top: 16px; border-top: 1px dashed #059669; display: flex; justify-content: space-between; align-items: center; font-size: 13px;">
          <div>
            <span>PROMO CODE: </span><strong style="font-family: monospace; font-size: 16px; color: #065f46; background: #fff; padding: 3px 8px; border-radius: 6px; border: 1px solid #10b981;">${sp.promoCode}</strong>
            <span style="color: #64748b; margin-left: 12px;">Valid until: ${sp.validUntil}</span>
          </div>
          <div style="font-weight: bold; color: #047857;">
            Book Direct: ${resolvedCompany.webAddress}
          </div>
        </div>
      </div>
      <div style="font-size: 11px; color: #64748b; font-family: monospace;">
        Hashtags: ${(sp.hashtags || []).join(' ')}
      </div>
    `;

    handleDownloadHtmlDoc(
      `Special_Voucher_${sp.promoCode}`,
      `Privilege Voucher - ${sp.title}`,
      voucherHtml
    );
  };

  const handleDownloadAllSpecialsCatalog = () => {
    const catalogHtml = `
      <h2 style="color: #065f46; font-family: Georgia, serif;">2026 Season Guest Specials & Promotional Packages</h2>
      <p style="color: #64748b; font-size: 13px;">Official publication of direct booking privileges, seasonal discounts, and promotional vouchers.</p>
      <div style="margin-top: 24px;">
        ${specials.map(sp => `
          <div style="border: 1px solid #cbd5e1; border-radius: 10px; padding: 18px; margin-bottom: 16px; background: #fff;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <strong style="font-size: 16px; color: #0f172a;">${sp.title}</strong>
              <span style="background: #047857; color: #fff; padding: 3px 10px; border-radius: 6px; font-weight: bold; font-size: 12px;">${sp.discountPercent}% OFF</span>
            </div>
            <p style="font-size: 13px; color: #475569; margin: 8px 0;">${sp.description}</p>
            <div style="font-size: 12px; color: #065f46;">
              <strong>Promo Code:</strong> ${sp.promoCode} • <strong>Season:</strong> ${sp.season || 'All'} • <strong>Valid until:</strong> ${sp.validUntil}
            </div>
          </div>
        `).join('')}
      </div>
    `;

    handleDownloadHtmlDoc(
      `Tides_of_Knysna_Marketing_Specials_Catalog_2026`,
      `Official Specials Catalog`,
      catalogHtml
    );
  };

  const handleDownloadLetterhead = () => {
    const letterheadHtml = `
      <div style="border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-size: 22px; font-weight: bold; color: #064e3b; font-family: Georgia, serif;">${resolvedCompany.name}</div>
          <div style="font-size: 12px; color: #047857; font-style: italic;">"${resolvedCompany.tagline}"</div>
        </div>
        <div style="text-align: right; font-size: 11px; color: #64748b;">
          <div style="font-weight: bold; color: #0f172a;">EST. 2024 • KNYSNA LAGOON</div>
          <div>VAT REG: 4890281928</div>
          <div>TGCSA 5-STAR EXCLUSIVE GRADED</div>
        </div>
      </div>
      <div style="font-size: 13px; color: #334155; line-height: 1.8; min-height: 380px;">
        <div style="color: #64748b; font-size: 12px; margin-bottom: 16px;">Date: ${new Date().toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
        <p>Dear Valued Guest & Partner,</p>
        <p>We have the distinct honor of welcoming you to ${resolvedCompany.name}. Nestled along the tranquil waters of the world-famous Knysna Lagoon, our sanctuary is committed to delivering unmatched privacy, gourmet gastronomy, and bespoke adventures across the Garden Route.</p>
        <p>Should you require private yacht charters, helicopter transfers, or curated dining on our lagoon deck, our concierge remains at your dedicated service.</p>
        <div style="margin-top: 36px;">
          <div style="font-weight: bold; color: #0f172a;">${resolvedCompany.salesPerson}</div>
          <div style="color: #64748b; font-size: 12px;">Head of Guest Experience & Reservations</div>
        </div>
      </div>
      <div style="border-top: 1px solid #cbd5e1; padding-top: 12px; font-size: 11px; color: #64748b; text-align: center;">
        <div>${resolvedCompany.address}</div>
        <div>Tel: ${resolvedCompany.contactNumbers} | Email: ${resolvedCompany.email} | Web: ${resolvedCompany.webAddress}</div>
      </div>
    `;

    handleDownloadHtmlDoc(
      `Tides_of_Knysna_Official_Letterhead`,
      `Official Corporate Letterhead`,
      letterheadHtml
    );
  };

  const handleDownloadEmailSignatureHtml = () => {
    const sigHtml = `<!DOCTYPE html><html><body>
<table style="font-family: Arial, sans-serif; font-size: 13px; color: #1e293b; max-width: 600px; border-collapse: collapse;">
  <tr><td style="padding-bottom: 12px;"><strong style="font-size: 16px; color: #065f46;">${resolvedCompany.salesPerson}</strong><br/><span style="color: #64748b; font-size: 12px;">Head of Guest Experience & Reservations | ${resolvedCompany.name}</span></td></tr>
  <tr><td style="padding-bottom: 12px;"><a href="https://${resolvedCompany.webAddress}" target="_blank"><img src="${resolvedCompany.logoUrl || GUEST_HOUSE_INFO.logoUrl}" alt="${resolvedCompany.name}" style="height: 50px; display: block; border-radius: 6px; border: 0;" /></a></td></tr>
  <tr><td style="padding-bottom: 10px; font-size: 12px; line-height: 1.5; color: #334155; border-top: 1px solid #e2e8f0; padding-top: 10px;">📍 <strong>Address:</strong> ${resolvedCompany.address}<br/>📞 <strong>Tel:</strong> ${resolvedCompany.telephone} | <strong>Mobile:</strong> ${resolvedCompany.mobile}<br/>✉️ <strong>Direct:</strong> <a href="mailto:${resolvedCompany.email}" style="color: #059669; text-decoration: none;">${resolvedCompany.email}</a> | 🌐 <a href="https://${resolvedCompany.webAddress}" style="color: #059669; text-decoration: none;">${resolvedCompany.webAddress}</a></td></tr>
  <tr><td style="padding-top: 8px;"><img src="${resolvedCompany.emailSignatureBannerUrl || resolvedCompany.brandingImageUrl || GUEST_HOUSE_INFO.brandingImageUrl}" alt="5-Star Accreditation & Specials" style="max-width: 100%; border-radius: 6px; display: block; border: 0;" /></td></tr>
  <tr><td style="padding-top: 8px; font-size: 10px; color: #94a3b8; font-style: italic;">${resolvedCompany.tagline} • South Africa 5-Star Graded Tourism Establishment</td></tr>
</table>
</body></html>`;

    const blob = new Blob([sigHtml], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Tides_Knysna_Email_Signature.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setSaveSuccessMsg('Downloaded Email Signature HTML file!');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleDownloadSocialPost = (platformName: string, title: string, textContent: string) => {
    const postHtml = `
      <div style="border: 1px solid #cbd5e1; border-radius: 12px; padding: 24px; background: #f8fafc; margin: 20px 0;">
        <span style="background: #0f172a; color: #fff; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: bold; text-transform: uppercase;">
          ${platformName} Social Asset
        </span>
        <h2 style="margin: 14px 0 8px 0; color: #0f172a;">${title}</h2>
        <div style="white-space: pre-wrap; font-size: 14px; line-height: 1.6; color: #334155; background: #fff; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0;">
          ${textContent}
        </div>
      </div>
    `;

    handleDownloadHtmlDoc(
      `Social_${platformName.replace(/\s+/g, '_')}_Post`,
      `${platformName} Campaign Asset`,
      postHtml
    );
  };

  const handleShareSocialWhatsApp = (platformName: string, content: string) => {
    const text = encodeURIComponent(`🌊 *${resolvedCompany.name} - ${platformName} Post Asset*\n\n${content}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareSocialEmail = (platformName: string, content: string, client: 'gmail' | 'yahoo' | 'outlook' | 'default') => {
    const subject = encodeURIComponent(`${resolvedCompany.name} - ${platformName} Marketing Asset`);
    const body = encodeURIComponent(content);

    if (client === 'gmail') {
      window.open(`https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`, '_blank', 'noopener,noreferrer');
    } else if (client === 'yahoo') {
      window.open(`https://compose.mail.yahoo.com/?subj=${subject}&body=${body}`, '_blank', 'noopener,noreferrer');
    } else if (client === 'outlook') {
      window.open(`https://outlook.live.com/mail/0/deeplink/compose?subject=${subject}&body=${body}`, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
    }
  };

  const handleDownloadHashtags = () => {
    const txtContent = `${resolvedCompany.name} Official Tourism & Marketing Hashtags Directory\nUpdated: ${new Date().toISOString().slice(0, 10)}\n\n` +
      `ALL ACTIVE HASHTAGS:\n${hashtagsList.join('\n')}\n\n` +
      `COPY-PASTE STRING:\n${hashtagsList.join(' ')}\n`;

    const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Tides_of_Knysna_Hashtags_Directory.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setSaveSuccessMsg('Downloaded Hashtags Directory text file!');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleShareHashtagsWhatsApp = () => {
    const text = encodeURIComponent(`🌊 *${resolvedCompany.name} Official Hashtags*\n\n${hashtagsList.join(' ')}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadSalesReportCsv = () => {
    const csvContent = "Month,Room Nights Sold,Occupancy Rate,ADR (ZAR),Gross Revenue (ZAR)\n" +
      "January 2026,168 Nights,90.3%,2850,478800\n" +
      "February 2026,152 Nights,89.4%,2800,425600\n" +
      "March 2026,145 Nights,78.0%,2750,398750\n" +
      "June 2026 (Oyster Fest),175 Nights,97.2%,3200,560000\n" +
      "September 2026 (Current),158 Nights,87.7%,2900,458200\n";

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Tides_of_Knysna_Sales_Report_2026.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setSaveSuccessMsg('Downloaded Monthly Sales Report CSV!');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleShareSalesReportEmail = (client: 'gmail' | 'yahoo' | 'outlook' | 'default') => {
    const subject = encodeURIComponent(`${resolvedCompany.name} - Monthly Tourism & Sales Performance Report`);
    const body = encodeURIComponent(
      `Executive Sales & Tourism Performance Summary - ${resolvedCompany.name}\n\n` +
      `• Jan 2026: 168 Nights (90.3% Occ) | ADR R2,850 | Gross R 478,800\n` +
      `• Feb 2026: 152 Nights (89.4% Occ) | ADR R2,800 | Gross R 425,600\n` +
      `• Mar 2026: 145 Nights (78.0% Occ) | ADR R2,750 | Gross R 398,750\n` +
      `• Jun 2026: 175 Nights (97.2% Occ) | ADR R3,200 | Gross R 560,000 (Oyster Festival)\n` +
      `• Sep 2026: 158 Nights (87.7% Occ) | ADR R2,900 | Gross R 458,200 (Current)\n\n` +
      `Generated by ${resolvedCompany.name} Revenue Management.`
    );

    if (client === 'gmail') {
      window.open(`https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`, '_blank', 'noopener,noreferrer');
    } else if (client === 'yahoo') {
      window.open(`https://compose.mail.yahoo.com/?subj=${subject}&body=${body}`, '_blank', 'noopener,noreferrer');
    } else if (client === 'outlook') {
      window.open(`https://outlook.live.com/mail/0/deeplink/compose?subject=${subject}&body=${body}`, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
    }
  };

  return (
    <div className="space-y-6">
      <DocumentActionBar
        documentTitle={`Marketing & Sales Hub - ${activeTab.toUpperCase()}`}
        onSave={handleSaveSpecial}
      />

      {/* Toast Alert */}
      {saveSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {saveSuccessMsg}
          </div>
          <button onClick={() => setSaveSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-950 font-bold">✕</button>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap border-b border-slate-200 bg-white rounded-xl p-1 shadow-xs text-xs font-semibold no-print gap-1">
        <button
          onClick={() => setActiveTab('specials')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition ${
            activeTab === 'specials'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Tag className="w-3.5 h-3.5 text-emerald-400" />
          Seasonal Specials & Image Upload
        </button>

        <button
          onClick={() => setActiveTab('branding')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition ${
            activeTab === 'branding'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-emerald-400" />
          Letterhead & Email Signature Branding
        </button>

        <button
          onClick={() => setActiveTab('social')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition ${
            activeTab === 'social'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <InstagramIcon className="w-3.5 h-3.5 text-pink-400" />
          Social Share Templates
        </button>

        <button
          onClick={() => setActiveTab('hashtags')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition ${
            activeTab === 'hashtags'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Hash className="w-3.5 h-3.5 text-emerald-400" />
          Tourism & Season Hashtags
        </button>

        <button
          onClick={() => setActiveTab('sales_report')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition ${
            activeTab === 'sales_report'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
          Sales Reports
        </button>
      </div>

      {/* SUB-TAB 1: SPECIALS WITH IMAGE UPLOAD, SEASON AUTO-GENERATE & AUTO PREVIEW */}
      {activeTab === 'specials' && (
        <div className="space-y-6">
          {/* Top Seasonal Auto-Generate Bar */}
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 text-white p-5 rounded-2xl border border-emerald-900/60 shadow-md no-print flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950">
                  Current Season: Spring in Knysna
                </span>
                <span className="text-xs text-emerald-300 font-serif-luxury italic">
                  Garden Route Spring Blossom & Lagoon Warmth
                </span>
              </div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Auto-Generate Specials by Season with Hashtags & Custom Imagery
              </h2>
              <p className="text-xs text-slate-300">
                Instantly produce bespoke guest house promotions tailored to Garden Route tourism calendars.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <div className="flex rounded-xl bg-slate-800/80 p-1 border border-slate-700 text-xs">
                {(['Spring', 'Summer', 'Autumn', 'Winter'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSeason(s)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition ${
                      selectedSeason === s
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {s === 'Spring' ? '🌸' : s === 'Summer' ? '☀️' : s === 'Autumn' ? '🍂' : '❄️'} {s}
                  </button>
                ))}
              </div>

              <button
                id="btn-auto-generate-specials"
                onClick={() => handleAutoGenerateSeasonSpecials(selectedSeason)}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Auto-Generate {selectedSeason} Specials
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Active Specials List (4 cols) */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3 no-print">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Active Guest Specials</h3>
                  <span className="text-[11px] text-slate-500">{specials.length} campaigns active</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleDownloadAllSpecialsCatalog}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                    title="Download All Specials Catalog (HTML Dossier)"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                    title="Print All Specials Catalog (Universal Printer)"
                  >
                    <Printer className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleCreateNewSpecial}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    New Special
                  </button>
                </div>
              </div>

              <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
                {specials.map(sp => (
                  <div
                    key={sp.id}
                    onClick={() => setSelectedSpecialId(sp.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition relative group ${
                      sp.id === selectedSpecialId
                        ? 'bg-emerald-50/80 border-emerald-400 shadow-xs'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 text-white font-mono">
                        {sp.promoCode}
                      </span>
                      <div className="flex items-center gap-2">
                        {sp.season && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            {sp.season}
                          </span>
                        )}
                        <span className="font-black text-emerald-700 text-xs">
                          {sp.discountPercent}% OFF
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSpecial(sp.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 rounded transition"
                          title="Delete Special"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {sp.imageUrl && (
                      <div className="h-16 w-full rounded-lg overflow-hidden mb-2 bg-slate-100 border border-slate-200">
                        <img 
                          src={sp.imageUrl} 
                          alt={sp.title} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    )}

                    <h4 className="font-bold text-xs text-slate-900 leading-snug">{sp.title}</h4>
                    <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                      <span>Valid: {sp.validUntil}</span>
                      <span className="text-[10px] text-emerald-600 font-semibold font-mono">
                        {(sp.hashtags || []).length} hashtags
                      </span>
                    </div>

                    {/* Quick Document & Sharing Actions on Card */}
                    <div className="flex items-center gap-1.5 pt-2 mt-2 border-t border-slate-100 opacity-90 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadSpecialVoucher(sp);
                        }}
                        className="p-1 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded transition"
                        title="Download Voucher HTML"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShareSpecialWhatsApp(sp);
                        }}
                        className="p-1 text-slate-500 hover:text-[#25D366] hover:bg-emerald-50 rounded transition"
                        title="Share on WhatsApp"
                      >
                        <WhatsAppIcon className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShareSpecialEmail(sp, 'gmail');
                        }}
                        className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                        title="Share via Gmail"
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSpecialId(sp.id);
                          setTimeout(() => window.print(), 100);
                        }}
                        className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition"
                        title="Print Voucher"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Active Special Editor + Live Auto Preview (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Special Edit Form */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
                <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-200 gap-2">
                  <div>
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" />
                      Special Editor & Visual Asset Studio
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">{editSpecial.title}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveSpecial}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Save Special
                    </button>
                  </div>
                </div>

                {/* Form fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Special Title</label>
                    <input
                      type="text"
                      value={editSpecial.title}
                      onChange={(e) => setEditSpecial({ ...editSpecial, title: e.target.value })}
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Promo Code</label>
                    <input
                      type="text"
                      value={editSpecial.promoCode}
                      onChange={(e) => setEditSpecial({ ...editSpecial, promoCode: e.target.value.toUpperCase() })}
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-lg font-mono font-bold uppercase focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Discount %</label>
                    <input
                      type="number"
                      min="5"
                      max="75"
                      value={editSpecial.discountPercent}
                      onChange={(e) => setEditSpecial({ ...editSpecial, discountPercent: Number(e.target.value) })}
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-lg font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Season Tag</label>
                    <select
                      value={editSpecial.season || 'Spring'}
                      onChange={(e) => setEditSpecial({ ...editSpecial, season: e.target.value as any })}
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="Spring">🌸 Spring</option>
                      <option value="Summer">☀️ Summer</option>
                      <option value="Autumn">🍂 Autumn</option>
                      <option value="Winter">❄️ Winter</option>
                      <option value="All Seasons">🌟 All Seasons</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Valid Until Date</label>
                    <input
                      type="text"
                      value={editSpecial.validUntil}
                      onChange={(e) => setEditSpecial({ ...editSpecial, validUntil: e.target.value })}
                      placeholder="e.g. 30 Nov 2026"
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Target Audience</label>
                    <input
                      type="text"
                      value={editSpecial.targetAudience || 'VIP Couples & Travelers'}
                      onChange={(e) => setEditSpecial({ ...editSpecial, targetAudience: e.target.value })}
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block font-semibold text-slate-700 mb-1">Description & Inclusions</label>
                    <textarea
                      rows={2}
                      value={editSpecial.description}
                      onChange={(e) => setEditSpecial({ ...editSpecial, description: e.target.value })}
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    ></textarea>
                  </div>
                </div>

                {/* IMAGE UPLOAD FOR SPECIAL */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-emerald-600" />
                        Special Banner Image & Visual Assets
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Upload custom promotional photos or choose from high-res Knysna presets.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={specialFileInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleUploadSpecialImage(e.target.files[0]);
                          }
                        }}
                      />
                      <button
                        onClick={() => specialFileInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold transition"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Upload Custom Image
                      </button>

                      {editSpecial.imageUrl && (
                        <button
                          onClick={() => setEditSpecial({ ...editSpecial, imageUrl: '' })}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                          title="Remove Image"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Preset quick image selection */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-1">
                    {CURATED_PRESET_IMAGES.map((preset, idx) => (
                      <div
                        key={idx}
                        onClick={() => setEditSpecial({ ...editSpecial, imageUrl: preset.url })}
                        className={`group relative rounded-lg overflow-hidden border cursor-pointer transition h-16 ${
                          editSpecial.imageUrl === preset.url
                            ? 'border-emerald-500 ring-2 ring-emerald-400/40 shadow-xs'
                            : 'border-slate-200 hover:border-emerald-300'
                        }`}
                      >
                        <img 
                          src={preset.url} 
                          alt={preset.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent flex items-end p-1">
                          <span className="text-[9px] font-bold text-white truncate leading-tight">
                            {preset.name.split(' ')[0]}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* URL Input alternative */}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[11px] text-slate-500 font-semibold shrink-0">Or Image URL:</span>
                    <input
                      type="text"
                      value={editSpecial.imageUrl || ''}
                      onChange={(e) => setEditSpecial({ ...editSpecial, imageUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg text-slate-700"
                    />
                  </div>
                </div>

                {/* SOCIAL MEDIA HASHTAGS GENERATOR */}
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <Hash className="w-4 h-4 text-emerald-600" />
                      Seasonal Social Media Hashtags
                    </h4>
                    <button
                      onClick={handleCopyHashtags}
                      className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-900 transition"
                    >
                      {copiedHash ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedHash ? 'Copied!' : 'Copy Hashtags'}
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1.5 items-center">
                      {(editSpecial.hashtags || []).map((tag, idx) => (
                        editingTagIndex === idx ? (
                          <div key={idx} className="flex items-center gap-1 bg-white border border-emerald-500 rounded-lg p-0.5 shadow-xs">
                            <input
                              type="text"
                              value={editingTagValue}
                              onChange={(e) => setEditingTagValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveEditedTag(idx);
                                if (e.key === 'Escape') setEditingTagIndex(null);
                              }}
                              autoFocus
                              className="px-2 py-0.5 text-xs font-mono text-slate-800 outline-none w-28"
                            />
                            <button
                              onClick={() => handleSaveEditedTag(idx)}
                              className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                              title="Save Tag"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => setEditingTagIndex(null)}
                              className="p-1 text-slate-400 hover:text-slate-600"
                              title="Cancel"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <span
                            key={idx}
                            className="group px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-mono font-medium flex items-center gap-1 hover:bg-emerald-100 transition"
                          >
                            <span 
                              onClick={() => {
                                setEditingTagIndex(idx);
                                setEditingTagValue(tag);
                              }}
                              className="cursor-pointer hover:underline"
                              title="Click to edit hashtag"
                            >
                              {tag}
                            </span>
                            <button
                              onClick={() => handleDeleteHashtag(idx)}
                              className="text-emerald-500 hover:text-rose-600 ml-0.5"
                              title="Remove tag"
                            >
                              ✕
                            </button>
                          </span>
                        )
                      ))}
                    </div>

                    {/* Inline Add Hashtag Bar */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <div className="relative flex-1">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs font-bold">#</span>
                        <input
                          type="text"
                          value={newHashtagInput}
                          onChange={(e) => setNewHashtagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddHashtag();
                            }
                          }}
                          placeholder="AddCustomTag (press Enter)"
                          className="w-full text-xs pl-6 pr-3 py-1.5 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddHashtag()}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 transition shadow-xs shrink-0"
                      >
                        <Plus className="w-3 h-3" /> Add Tag
                      </button>
                    </div>

                    {/* Popular Quick-Add Tag Suggestions */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-400">Quick Add:</span>
                      {['#KnysnaLagoon', '#GardenRouteLuxury', '#TidesOfKnysna', '#5StarSanctuary', '#HoneymoonDestinationSA'].map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => handleAddHashtag(t)}
                          className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 font-mono transition"
                        >
                          +{t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* LIVE AUTO PREVIEW SYSTEM */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-200 gap-2">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-emerald-600" />
                    <h3 className="font-bold text-slate-900 text-sm">Interactive Auto Preview</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Live Updating
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* FULL IMAGE VIEW TOGGLE */}
                    <button
                      onClick={() => setShowFullImageOnly(!showFullImageOnly)}
                      className={`px-3 py-1 rounded-md text-xs font-bold transition flex items-center gap-1.5 ${
                        showFullImageOnly
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                      }`}
                      title="Toggle full uncropped image for marketing material"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      {showFullImageOnly ? 'Full Image: ON (Uncropped)' : 'View Full Image'}
                    </button>

                    {/* Mode switcher tabs */}
                    <div className="flex rounded-lg bg-slate-100 p-1 text-xs font-semibold">
                    <button
                      onClick={() => setAutoPreviewMode('voucher')}
                      className={`px-3 py-1 rounded-md transition ${
                        autoPreviewMode === 'voucher'
                          ? 'bg-white text-slate-900 shadow-xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      🎫 Voucher / Flyer
                    </button>
                    <button
                      onClick={() => setAutoPreviewMode('instagram')}
                      className={`px-3 py-1 rounded-md transition ${
                        autoPreviewMode === 'instagram'
                          ? 'bg-white text-slate-900 shadow-xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      📸 Instagram (1:1)
                    </button>
                    <button
                      onClick={() => setAutoPreviewMode('facebook')}
                      className={`px-3 py-1 rounded-md transition ${
                        autoPreviewMode === 'facebook'
                          ? 'bg-white text-slate-900 shadow-xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      📱 Facebook (16:9)
                    </button>
                    <button
                      onClick={() => setAutoPreviewMode('whatsapp')}
                      className={`px-3 py-1 rounded-md transition ${
                        autoPreviewMode === 'whatsapp'
                          ? 'bg-white text-slate-900 shadow-xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      💬 WhatsApp Blast
                    </button>
                    <button
                      onClick={() => setAutoPreviewMode('signature')}
                      className={`px-3 py-1 rounded-md transition ${
                        autoPreviewMode === 'signature'
                          ? 'bg-white text-slate-900 shadow-xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      ✉️ Signature Banner
                    </button>
                  </div>
                </div>
              </div>

                {/* UNPROPPED FULL IMAGE VIEW FOR MARKETING MEDIA & SOCIAL ADS */}
                {showFullImageOnly && (
                  <div className="space-y-3 bg-slate-900 text-white p-4 rounded-2xl border border-slate-700 shadow-xl">
                    <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
                          <ImageIcon className="w-4 h-4" />
                        </span>
                        <div>
                          <strong className="text-white block font-sans">Full Resolution Marketing Media Asset (Uncropped)</strong>
                          <span className="text-[11px] text-slate-400">High-Fidelity 1200px Photography for Social Feed & Ad Placement</span>
                        </div>
                      </div>
                      <span className="bg-emerald-500 text-slate-950 font-bold px-2 py-0.5 rounded text-[10px] uppercase font-mono">
                        {editSpecial.season || 'Special'} • {editSpecial.discountPercent}% Off
                      </span>
                    </div>

                    <div className="w-full rounded-xl overflow-hidden bg-black flex items-center justify-center border border-slate-800 relative group">
                      {editSpecial.imageUrl ? (
                        <img 
                          src={editSpecial.imageUrl} 
                          alt={editSpecial.title} 
                          className="w-full h-auto max-h-[520px] object-contain rounded-xl"
                        />
                      ) : (
                        <div className="py-24 text-center text-slate-500 text-xs">
                          No marketing image URL provided. Upload an image above or select a seasonal preset.
                        </div>
                      )}
                      <div className="absolute bottom-3 left-3 right-3 bg-slate-950/80 backdrop-blur-sm p-3 rounded-xl border border-slate-700/60 flex items-center justify-between text-xs">
                        <div className="truncate mr-2">
                          <strong className="text-white block truncate">{editSpecial.title}</strong>
                          <span className="text-[11px] text-slate-300">Code: <code className="font-mono text-emerald-400 font-bold">{editSpecial.promoCode}</code> • Valid until: {editSpecial.validUntil}</span>
                        </div>
                        <button
                          onClick={() => {
                            if (editSpecial.imageUrl) {
                              navigator.clipboard.writeText(editSpecial.imageUrl);
                              setSaveSuccessMsg('Image URL copied to clipboard.');
                              setTimeout(() => setSaveSuccessMsg(null), 2500);
                            }
                          }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shrink-0 transition flex items-center gap-1"
                        >
                          <Copy className="w-3.5 h-3.5" /> Copy Image URL
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* AUTO PREVIEW 1: LUXURY GUEST VOUCHER / FLYER */}
                {autoPreviewMode === 'voucher' && (
                  <div className="space-y-3">
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-800 text-white bg-slate-950 printable-area">
                      {/* Background image if present */}
                      {editSpecial.imageUrl && (
                        <div className="absolute inset-0 z-0 opacity-40">
                          <img 
                            src={editSpecial.imageUrl} 
                            alt={editSpecial.title} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                      )}
                      <div className="relative z-10 bg-gradient-to-r from-slate-950 via-slate-900/90 to-emerald-950/80 p-6 md:p-8 space-y-5">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="text-emerald-400 font-serif-luxury font-bold text-xl tracking-wider">
                              {resolvedCompany.name}
                            </div>
                            <div className="text-xs text-slate-300 italic">
                              "{resolvedCompany.tagline}"
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-md">
                              {editSpecial.discountPercent}% Privilege Voucher
                            </div>
                            <span className="text-[10px] text-emerald-300 block mt-1 font-mono">
                              Season: {editSpecial.season || 'Spring'}
                            </span>
                          </div>
                        </div>

                        <div className="my-4 space-y-2">
                          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight">
                            {editSpecial.title}
                          </h2>
                          <p className="text-slate-200 text-xs md:text-sm leading-relaxed max-w-xl">
                            {editSpecial.description}
                          </p>

                          {/* Inclusions checklist if provided */}
                          {editSpecial.inclusions && editSpecial.inclusions.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-2 text-xs text-emerald-200">
                              {editSpecial.inclusions.map((inc, i) => (
                                <div key={i} className="flex items-center gap-1.5">
                                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                  <span>{inc}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Hashtags displayed on voucher */}
                        <div className="pt-2 text-[11px] text-emerald-300/80 font-mono">
                          {(editSpecial.hashtags || []).slice(0, 5).join(' ')}
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400">Promo Code:</span>
                            <span className="font-mono font-black text-sm text-emerald-300 bg-slate-900 px-3 py-1 rounded-lg border border-emerald-500/40">
                              {editSpecial.promoCode}
                            </span>
                            <span className="text-[11px] text-slate-400 ml-2">
                              Valid: {editSpecial.validUntil}
                            </span>
                          </div>
                          <div className="text-slate-400 text-[11px]">
                            Direct Inquiries: {resolvedCompany.email} | {resolvedCompany.telephone}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2 pt-2 no-print border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => handleDownloadMarketingAdobePdf(editSpecial.title, `Promo Code: ${editSpecial.promoCode} (${editSpecial.discountPercent}% Off)`, `${editSpecial.description}\nValid Until: ${editSpecial.validUntil}\nInclusions: ${(editSpecial.inclusions || []).join(', ')}\nHashtags: ${(editSpecial.hashtags || []).join(' ')}`)}
                        className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                        title="Download special as Adobe PDF with corporate branding"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download Adobe PDF
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownloadSpecialVoucher(editSpecial)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                        title="Download printable HTML voucher dossier"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download Voucher
                      </button>

                      <button
                        type="button"
                        onClick={() => handleShareSpecialWhatsApp(editSpecial)}
                        className="px-3.5 py-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                        title="Share voucher directly on WhatsApp"
                      >
                        <WhatsAppIcon className="w-3.5 h-3.5 text-slate-950" />
                        WhatsApp Voucher
                      </button>

                      <button
                        type="button"
                        onClick={() => handleShareSpecialEmail(editSpecial, 'gmail')}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-xl text-xs font-bold transition flex items-center gap-1"
                        title="Email voucher via Gmail"
                      >
                        <Mail className="w-3.5 h-3.5 text-blue-600" />
                        Gmail
                      </button>

                      <button
                        type="button"
                        onClick={() => handleShareSpecialEmail(editSpecial, 'outlook')}
                        className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200 rounded-xl text-xs font-bold transition flex items-center gap-1"
                        title="Email voucher via Outlook"
                      >
                        <Mail className="w-3.5 h-3.5 text-sky-600" />
                        Outlook
                      </button>

                      <button
                        type="button"
                        onClick={() => handleShareSpecialEmail(editSpecial, 'yahoo')}
                        className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-xl text-xs font-bold transition flex items-center gap-1"
                        title="Email voucher via Yahoo"
                      >
                        <Mail className="w-3.5 h-3.5 text-purple-600" />
                        Yahoo
                      </button>

                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                        title="Print Special Voucher on any printer"
                      >
                        <Printer className="w-3.5 h-3.5 text-emerald-400" />
                        Print Voucher
                      </button>
                    </div>
                  </div>
                )}

                {/* AUTO PREVIEW 2: INSTAGRAM SQUARE (1:1) */}
                {autoPreviewMode === 'instagram' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                    <div className="aspect-square rounded-2xl overflow-hidden relative shadow-xl border border-slate-800 bg-slate-950 flex flex-col justify-between p-6 text-white">
                      {editSpecial.imageUrl && (
                        <div className="absolute inset-0 z-0">
                          <img 
                            src={editSpecial.imageUrl} 
                            alt={editSpecial.title} 
                            className="w-full h-full object-cover" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/30"></div>
                        </div>
                      )}

                      <div className="relative z-10 flex items-center justify-between">
                        <span className="font-serif-luxury font-bold text-sm text-emerald-400">
                          {resolvedCompany.name}
                        </span>
                        <span className="bg-emerald-500 text-slate-950 px-2 py-0.5 rounded text-[10px] font-black uppercase">
                          {editSpecial.discountPercent}% OFF
                        </span>
                      </div>

                      <div className="relative z-10 text-center space-y-2">
                        <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest">
                          Knysna Lagoon • {editSpecial.season || 'Spring'} Edition
                        </span>
                        <h3 className="font-serif-luxury text-xl font-bold leading-tight">
                          {editSpecial.title}
                        </h3>
                        <p className="text-xs text-slate-200 line-clamp-3 max-w-xs mx-auto">
                          {editSpecial.description}
                        </p>
                      </div>

                      <div className="relative z-10 flex items-center justify-between text-[11px] pt-3 border-t border-slate-700/80">
                        <span className="font-mono font-bold text-emerald-400">Code: {editSpecial.promoCode}</span>
                        <span className="text-slate-300">{resolvedCompany.webAddress}</span>
                      </div>
                    </div>

                    <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span>Ready-to-Post Instagram Caption</span>
                        <button
                          onClick={() => {
                            const fullCopy = `${editSpecial.title}\n\n${editSpecial.description}\n\n🥂 Exclusive Promo Code: ${editSpecial.promoCode} for ${editSpecial.discountPercent}% discount.\nValid until ${editSpecial.validUntil}.\n\nReserve direct at ${resolvedCompany.webAddress} or link in bio.\n\n${(editSpecial.hashtags || []).join(' ')}`;
                            navigator.clipboard.writeText(fullCopy);
                            setSaveSuccessMsg('Instagram caption & hashtags copied to clipboard!');
                            setTimeout(() => setSaveSuccessMsg(null), 3000);
                          }}
                          className="flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-bold"
                        >
                          <Copy className="w-3.5 h-3.5" /> Copy Post
                        </button>
                      </div>

                      <p className="text-slate-700 whitespace-pre-line leading-relaxed text-[11px]">
                        {editSpecial.title}
                        {'\n\n'}
                        {editSpecial.description}
                        {'\n\n'}
                        🥂 Use promo code <strong>{editSpecial.promoCode}</strong> to unlock your <strong>{editSpecial.discountPercent}% direct discount</strong>!
                        {'\n'}
                        ✨ Link in bio or direct inquiry: {resolvedCompany.email}
                        {'\n\n'}
                        <span className="text-emerald-700 font-mono font-medium">
                          {(editSpecial.hashtags || []).join(' ')}
                        </span>
                      </p>

                      <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-200 no-print">
                        <button
                          type="button"
                          onClick={() => handleDownloadSocialPost('Instagram_1080x1080', editSpecial.title, `${editSpecial.title}\n\n${editSpecial.description}\n\nCode: ${editSpecial.promoCode} (${editSpecial.discountPercent}% Off)\n${(editSpecial.hashtags || []).join(' ')}`)}
                          className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-800 rounded-lg font-bold border border-slate-300 text-[11px] flex items-center gap-1 transition"
                        >
                          <Download className="w-3 h-3" /> Download Post
                        </button>
                        <button
                          type="button"
                          onClick={() => handleShareSpecialWhatsApp(editSpecial)}
                          className="px-2.5 py-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 rounded-lg font-bold text-[11px] flex items-center gap-1 transition"
                        >
                          <WhatsAppIcon className="w-3 h-3 text-slate-950" /> WhatsApp
                        </button>
                        <button
                          type="button"
                          onClick={() => handleShareSpecialEmail(editSpecial, 'gmail')}
                          className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-lg font-bold border border-blue-200 text-[11px] flex items-center gap-1 transition"
                        >
                          <Mail className="w-3 h-3 text-blue-600" /> Email
                        </button>
                        <button
                          type="button"
                          onClick={() => window.print()}
                          className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 transition"
                        >
                          <Printer className="w-3 h-3" /> Print
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* AUTO PREVIEW 3: FACEBOOK / TWITTER (16:9) */}
                {autoPreviewMode === 'facebook' && (
                  <div className="space-y-3">
                    <div className="aspect-[16/9] rounded-2xl overflow-hidden relative shadow-xl border border-slate-800 bg-slate-950 flex flex-col justify-between p-6 md:p-8 text-white printable-area">
                      {editSpecial.imageUrl && (
                        <div className="absolute inset-0 z-0">
                          <img 
                            src={editSpecial.imageUrl} 
                            alt={editSpecial.title} 
                            className="w-full h-full object-cover" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/70 to-transparent"></div>
                        </div>
                      )}

                      <div className="relative z-10 flex items-center justify-between">
                        <span className="font-serif-luxury font-bold text-base text-white">
                          {resolvedCompany.name}
                        </span>
                        <span className="bg-emerald-500 text-slate-950 px-2.5 py-0.5 rounded font-black text-xs uppercase">
                          {editSpecial.season || 'Special'} • {editSpecial.discountPercent}% Off
                        </span>
                      </div>

                      <div className="relative z-10 max-w-md space-y-2">
                        <h3 className="text-xl md:text-2xl font-bold text-emerald-300">
                          {editSpecial.title}
                        </h3>
                        <p className="text-xs text-slate-200 line-clamp-3">
                          {editSpecial.description}
                        </p>
                      </div>

                      <div className="relative z-10 flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-emerald-400 font-bold">{resolvedCompany.telephone}</span>
                          <span className="text-slate-400">| Promo: {editSpecial.promoCode}</span>
                        </div>
                        <span className="bg-white text-slate-950 px-3 py-1 rounded-lg font-bold text-xs">
                          Book Direct & Save
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2 pt-1 no-print">
                      <button
                        type="button"
                        onClick={() => handleDownloadSocialPost('Facebook_1200x630', editSpecial.title, `${editSpecial.title}\n\n${editSpecial.description}\n\nCode: ${editSpecial.promoCode}\nBook Direct: ${resolvedCompany.webAddress}`)}
                        className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 rounded-lg text-xs font-bold border border-slate-300 flex items-center gap-1.5 transition"
                      >
                        <Download className="w-3.5 h-3.5" /> Download Banner
                      </button>
                      <button
                        type="button"
                        onClick={() => handleShareSpecialWhatsApp(editSpecial)}
                        className="px-3 py-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
                      >
                        <WhatsAppIcon className="w-3.5 h-3.5" /> Share WhatsApp
                      </button>
                      <button
                        type="button"
                        onClick={() => handleShareSpecialEmail(editSpecial, 'gmail')}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-lg text-xs font-bold border border-blue-200 flex items-center gap-1.5 transition"
                      >
                        <Mail className="w-3.5 h-3.5 text-blue-600" /> Share Email
                      </button>
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
                      >
                        <Printer className="w-3.5 h-3.5" /> Print Banner
                      </button>
                    </div>
                  </div>
                )}

                {/* AUTO PREVIEW 4: WHATSAPP GUEST BLAST */}
                {autoPreviewMode === 'whatsapp' && (
                  <div className="max-w-md mx-auto bg-[#e5ddd5] p-4 rounded-2xl border border-slate-300 shadow-inner space-y-2">
                    <div className="bg-white rounded-xl p-3.5 shadow-sm text-xs text-slate-800 space-y-2 leading-relaxed">
                      {editSpecial.imageUrl && (
                        <div className="h-32 w-full rounded-lg overflow-hidden bg-slate-100 mb-2">
                          <img src={editSpecial.imageUrl} alt={editSpecial.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div>
                        🌊 *{resolvedCompany.name} - Exclusive Special Announcement*
                      </div>
                      <div className="font-bold text-slate-900">
                        ✨ {editSpecial.title}
                      </div>
                      <p className="text-[11px] text-slate-700">
                        {editSpecial.description}
                      </p>
                      <div className="bg-emerald-50 p-2 rounded border border-emerald-200 text-[11px]">
                        🎁 *Benefit:* {editSpecial.discountPercent}% Direct Discount<br/>
                        🔑 *Promo Code:* `{editSpecial.promoCode}`<br/>
                        📅 *Validity:* Until {editSpecial.validUntil}
                      </div>
                      <div className="text-[10px] text-slate-500 pt-1">
                        📲 Reply directly to this message or visit {resolvedCompany.webAddress} to secure your suite.
                      </div>
                      <div className="text-[9px] text-emerald-700 font-mono">
                        {(editSpecial.hashtags || []).slice(0, 4).join(' ')}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2 pt-1 no-print">
                      <button
                        type="button"
                        onClick={() => {
                          const waText = `🌊 *${resolvedCompany.name} Exclusive Guest Special*\n\n✨ *${editSpecial.title}*\n${editSpecial.description}\n\n🎁 *Privilege:* ${editSpecial.discountPercent}% Discount\n🔑 *Code:* ${editSpecial.promoCode}\n📅 *Valid:* ${editSpecial.validUntil}\n\nBook direct: ${resolvedCompany.webAddress}\n\n${(editSpecial.hashtags || []).join(' ')}`;
                          window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(waText)}`, '_blank', 'noopener,noreferrer');
                        }}
                        className="px-3 py-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                      >
                        <WhatsAppIcon className="w-3.5 h-3.5" />
                        Open in WhatsApp
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const waText = `🌊 *${resolvedCompany.name} Exclusive Guest Special*\n\n✨ *${editSpecial.title}*\n${editSpecial.description}\n\n🎁 *Privilege:* ${editSpecial.discountPercent}% Discount\n🔑 *Code:* ${editSpecial.promoCode}\n📅 *Valid:* ${editSpecial.validUntil}\n\nBook direct: ${resolvedCompany.webAddress}\n\n${(editSpecial.hashtags || []).join(' ')}`;
                          navigator.clipboard.writeText(waText);
                          setSaveSuccessMsg('WhatsApp broadcast message copied to clipboard!');
                          setTimeout(() => setSaveSuccessMsg(null), 3000);
                        }}
                        className="px-3 py-1.5 bg-[#128C7E] hover:bg-[#075E54] text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        Copy Blast
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownloadSocialPost('WhatsApp_Blast', editSpecial.title, `🌊 *${resolvedCompany.name}*\n${editSpecial.title}\n${editSpecial.description}\nPromo Code: ${editSpecial.promoCode}`)}
                        className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 rounded-lg text-xs font-bold border border-slate-300 transition flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </button>

                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Print Flyer
                      </button>
                    </div>
                  </div>
                )}

                {/* AUTO PREVIEW 5: EMAIL SIGNATURE PROMO BANNER */}
                {autoPreviewMode === 'signature' && (
                  <div className="space-y-3">
                    <div className="p-4 rounded-xl bg-slate-900 text-white border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {editSpecial.imageUrl && (
                          <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-slate-600">
                            <img src={editSpecial.imageUrl} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 uppercase">
                              {editSpecial.season || 'Seasonal'} Promo
                            </span>
                            <span className="text-emerald-300 font-serif-luxury text-xs font-bold">
                              {resolvedCompany.name}
                            </span>
                          </div>
                          <div className="font-bold text-sm text-white mt-0.5">
                            {editSpecial.title}
                          </div>
                          <div className="text-[11px] text-slate-300">
                            Book Direct with code <strong className="text-emerald-400 font-mono">{editSpecial.promoCode}</strong> for {editSpecial.discountPercent}% Off
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <span className="bg-emerald-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm">
                          {editSpecial.discountPercent}% SAVING
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 italic">
                      This promotional banner is automatically linked into executive email signatures below the company logo.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: BRANDING (LETTERHEAD & EMAIL SIGNATURE WITH LOGO & UPLOAD) */}
      {activeTab === 'branding' && (
        <div className="space-y-6">
          {/* Top Branding Upload Hub */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4 no-print">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-emerald-600" />
                  Corporate Identity & Branding Image Uploader
                </h3>
                <p className="text-xs text-slate-500">
                  Upload company logo, 5-star accreditation badges, and letterhead artwork that syncs across documents and email signatures.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 1. Company Logo */}
              <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800">1. Official Company Logo</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-bold">Active</span>
                </div>
                <div className="h-16 flex items-center justify-center bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <img 
                    src={resolvedCompany.logoUrl || GUEST_HOUSE_INFO.logoUrl} 
                    alt="Company Logo" 
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <input
                  type="file"
                  ref={logoFileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleUploadCompanyBranding('logoUrl', e.target.files[0]);
                    }
                  }}
                />
                <button
                  onClick={() => logoFileInputRef.current?.click()}
                  className="w-full py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Upload className="w-3.5 h-3.5" /> Upload Logo
                </button>
              </div>

              {/* 2. Accreditation & Branding Badge */}
              <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800">2. 5-Star Accreditation Badge</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-bold">Active</span>
                </div>
                <div className="h-16 flex items-center justify-center bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <img 
                    src={resolvedCompany.brandingImageUrl || GUEST_HOUSE_INFO.brandingImageUrl} 
                    alt="Accreditation Seal" 
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <input
                  type="file"
                  ref={brandingFileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleUploadCompanyBranding('brandingImageUrl', e.target.files[0]);
                    }
                  }}
                />
                <button
                  onClick={() => brandingFileInputRef.current?.click()}
                  className="w-full py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Upload className="w-3.5 h-3.5" /> Upload Branding Seal
                </button>
              </div>

              {/* 3. Email Signature Promo Banner */}
              <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800">3. Email Signature Banner</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-bold">Active</span>
                </div>
                <div className="h-16 flex items-center justify-center bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <img 
                    src={resolvedCompany.emailSignatureBannerUrl || GUEST_HOUSE_INFO.emailSignatureBannerUrl} 
                    alt="Signature Banner" 
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <input
                  type="file"
                  ref={emailSigFileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleUploadCompanyBranding('emailSignatureBannerUrl', e.target.files[0]);
                    }
                  }}
                />
                <button
                  onClick={() => emailSigFileInputRef.current?.click()}
                  className="w-full py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Upload className="w-3.5 h-3.5" /> Upload Sig Banner
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Official Letterhead Preview (6 cols) */}
            <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 md:p-8 space-y-6 printable-area">
              <div className="flex flex-wrap items-center justify-between border-b pb-3 no-print gap-2">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  Official Corporate Letterhead
                </h4>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleDownloadLetterhead}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition shadow-xs"
                    title="Download Letterhead HTML/Doc file"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const text = `🌊 *${resolvedCompany.name} Official Letterhead*\n"${resolvedCompany.tagline}"\n${resolvedCompany.address}\nTel: ${resolvedCompany.telephone}\nWeb: ${resolvedCompany.webAddress}`;
                      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
                    }}
                    className="px-3 py-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1 transition shadow-xs"
                    title="Share Letterhead details via WhatsApp"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5 text-slate-950" /> WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const subject = encodeURIComponent(`${resolvedCompany.name} - Official Corporate Letterhead`);
                      const body = encodeURIComponent(`Dear Valued Guest,\n\nPlease find the official corporate letterhead credentials for ${resolvedCompany.name}.\n\nAddress: ${resolvedCompany.address}\nTelephone: ${resolvedCompany.telephone}\nEmail: ${resolvedCompany.email}\nWeb: ${resolvedCompany.webAddress}\n\nWarm regards,\n${resolvedCompany.salesPerson}`);
                      window.open(`https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`, '_blank', 'noopener,noreferrer');
                    }}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                    title="Email Letterhead via Gmail"
                  >
                    <Mail className="w-3.5 h-3.5 text-blue-600" /> Email
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs hover:bg-slate-800 transition"
                    title="Print Letterhead on any printer"
                  >
                    <Printer className="w-3.5 h-3.5 text-emerald-400" /> Print Letterhead
                  </button>
                </div>
              </div>

              {/* Letterhead Header with Logo */}
              <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="h-14">
                    <img 
                      src={resolvedCompany.logoUrl || GUEST_HOUSE_INFO.logoUrl} 
                      alt="Logo" 
                      className="h-full object-contain"
                    />
                  </div>
                  <p className="text-[11px] text-emerald-700 font-medium italic">
                    "{resolvedCompany.tagline}"
                  </p>
                </div>
                <div className="text-right text-[10px] text-slate-500 space-y-0.5">
                  <div className="font-bold text-slate-800">EST. 2024 • KNYSNA LAGOON</div>
                  <div>VAT REG: 4890281928</div>
                  <div>TGCSA 5-STAR EXCLUSIVE GRADED</div>
                </div>
              </div>

              {/* Letterhead Body */}
              <div className="text-xs text-slate-700 space-y-3 leading-relaxed min-h-[220px]">
                <div className="text-slate-400 text-[11px]">
                  Date: {new Date().toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                <p>Dear Valued Guest & Partner,</p>
                <p>
                  We have the distinct honor of welcoming you to {resolvedCompany.name}. Nestled along the tranquil waters of the world-famous Knysna Lagoon, our sanctuary is committed to delivering unmatched privacy, gourmet gastronomy, and bespoke adventures across the Garden Route.
                </p>
                <p>
                  Should you require private yacht charters, helicopter transfers, or curated dining on our lagoon deck, our concierge remains at your dedicated service.
                </p>
                <div className="pt-4">
                  <div className="font-bold text-slate-900">{resolvedCompany.salesPerson}</div>
                  <div className="text-slate-500 text-[11px]">Head of Guest Experience & Reservations</div>
                </div>
              </div>

              {/* Letterhead Footer Branding */}
              <div className="border-t border-slate-200 pt-3 text-[10px] text-slate-500 text-center space-y-1">
                <div className="font-semibold text-slate-700">{resolvedCompany.address}</div>
                <div>Tel: {resolvedCompany.contactNumbers} | Email: {resolvedCompany.email} | Web: {resolvedCompany.webAddress}</div>
              </div>
            </div>

            {/* Right: Executive Email Signature Preview (6 cols) */}
            <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-emerald-600" />
                    Executive Email Signature Generator
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Styled with corporate branding below logo. 1-click HTML copy for Gmail, Outlook, or Apple Mail.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleDownloadEmailSignatureHtml}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-2xs"
                    title="Download signature as HTML file"
                  >
                    <Download className="w-3.5 h-3.5" /> HTML File
                  </button>
                  <button
                    onClick={handleCopyHtmlEmailSignature}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                  >
                    {copiedSignature ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedSignature ? 'HTML Signature Copied!' : 'Copy HTML Signature'}
                  </button>
                </div>
              </div>

              {/* Rendered Email Signature Box */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 font-sans">
                {/* Person details */}
                <div className="space-y-0.5">
                  <div className="font-bold text-sm text-slate-900">
                    {resolvedCompany.salesPerson}
                  </div>
                  <div className="text-xs text-emerald-700 font-semibold">
                    Head of Guest Experience & Reservations | {resolvedCompany.name}
                  </div>
                </div>

                {/* Company Logo in Email Signature */}
                <div className="py-1">
                  <img 
                    src={resolvedCompany.logoUrl || GUEST_HOUSE_INFO.logoUrl} 
                    alt="Company Logo" 
                    className="h-10 object-contain rounded"
                  />
                </div>

                {/* Contact row */}
                <div className="text-[11px] text-slate-600 space-y-1 border-t border-slate-200 pt-2 leading-relaxed">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>{resolvedCompany.address}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                      {resolvedCompany.telephone}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-emerald-600 shrink-0" />
                      {resolvedCompany.email}
                    </span>
                  </div>
                </div>

                {/* BRANDING BELOW COMPANY LOGO IN SIGNATURE */}
                <div className="pt-2">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Branding & Accreditation Banner:
                  </div>
                  <div className="rounded-xl overflow-hidden shadow-xs border border-slate-300 bg-slate-950">
                    <img 
                      src={resolvedCompany.emailSignatureBannerUrl || resolvedCompany.brandingImageUrl || GUEST_HOUSE_INFO.brandingImageUrl} 
                      alt="Email Signature Branding" 
                      className="w-full object-cover max-h-24"
                    />
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="text-[9.5px] text-slate-400 italic pt-1 border-t border-slate-200">
                  Confidentiality Notice: This message contains privileged luxury hospitality reservation data intended solely for the recipient. Eco-Certified Knysna Lagoon Sanctuary.
                </div>
              </div>

              {/* Instructions */}
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1">
                <strong>How to Install in Your Email Client:</strong>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Click <strong>"Copy HTML Signature"</strong> above. Then open Gmail Settings → General → Signature (or Outlook Settings → Mail → Signatures) and press Paste (Ctrl+V / Cmd+V). The logo, branding image, contact links, and styling will paste directly!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: SOCIAL POST TEMPLATES */}
      {activeTab === 'social' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Instagram Post Template */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
              <span className="flex items-center gap-1.5 font-bold text-xs text-pink-600">
                <InstagramIcon className="w-4 h-4" /> Instagram Square (1080x1080)
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleDownloadSocialPost('Instagram_Square_1080', 'Where Sunset Reflections Meet Pure Serenity', `Unwind in timeless luxury at ${resolvedCompany.name}. Soak in breathtaking lagoon sunsets from your private panoramic balcony. 🥂 Link in bio to reserve your escape.\n\n${hashtagsList.join(' ')}`)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                  title="Download Instagram post asset"
                >
                  <Download className="w-3 h-3" /> Download
                </button>
                <button
                  type="button"
                  onClick={() => handleShareSocialWhatsApp('Instagram Post', `🌊 *${resolvedCompany.name} - Knysna Lagoon Sanctuary*\nWhere Sunset Reflections Meet Pure Serenity.\n\nUnwind in timeless luxury. Link in bio to reserve.\n\n${hashtagsList.join(' ')}`)}
                  className="px-2.5 py-1 bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                >
                  <WhatsAppIcon className="w-3 h-3 text-slate-950" /> WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-2.5 py-1 bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition"
                >
                  <Printer className="w-3 h-3" /> Print
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`Where Sunset Reflections Meet Pure Serenity.\n\nUnwind in timeless luxury at ${resolvedCompany.name}. Soak in breathtaking lagoon sunsets from your private panoramic balcony. 🥂 Link in bio to reserve your escape.\n\n${hashtagsList.join(' ')}`);
                    setSaveSuccessMsg('Instagram post caption copied to clipboard!');
                    setTimeout(() => setSaveSuccessMsg(null), 3000);
                  }}
                  className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 font-semibold px-2 py-1 rounded bg-slate-50 border border-slate-200"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy
                </button>
              </div>
            </div>

            <div className="aspect-square rounded-2xl bg-gradient-to-tr from-slate-950 via-slate-900 to-emerald-950 p-6 text-white flex flex-col justify-between shadow-inner printable-area">
              <div className="flex items-center justify-between">
                <span className="font-serif-luxury text-sm font-bold text-emerald-400">
                  {resolvedCompany.name}
                </span>
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </div>

              <div className="text-center space-y-2">
                <div className="text-[11px] font-bold text-emerald-300 uppercase tracking-widest">
                  Lagoon Sanctuary • Knysna
                </div>
                <h3 className="font-serif-luxury text-xl font-bold leading-tight">
                  Where Sunset Reflections Meet Pure Serenity.
                </h3>
                <p className="text-xs text-slate-300 max-w-xs mx-auto">
                  Wake up to uninterrupted vistas across the Knysna Lagoon. Private heated plunge pools, champagne on arrival.
                </p>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-3 border-t border-slate-800">
                <span>{resolvedCompany.webAddress}</span>
                <span>Exclusive Suites</span>
              </div>
            </div>

            <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
              <strong>Recommended Caption:</strong>
              <p>
                Unwind in timeless luxury at {resolvedCompany.name}. Soak in breathtaking lagoon sunsets from your private panoramic balcony. 🥂 Link in bio to reserve your escape.
              </p>
            </div>
          </div>

          {/* Facebook Post Template */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
              <span className="flex items-center gap-1.5 font-bold text-xs text-blue-600">
                <FacebookIcon className="w-4 h-4" /> Facebook Landscape Banner (1200x630)
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleDownloadSocialPost('Facebook_Landscape_1200', 'Spring Lagoon Serenade Package', `Planning your next Garden Route retreat? Escape to ${resolvedCompany.name}. Exceptional hospitality, gourmet lagoon breakfasts, and tailored adventure itineraries.\n\nBook direct: ${resolvedCompany.webAddress}\n${hashtagsList.join(' ')}`)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                >
                  <Download className="w-3 h-3" /> Download
                </button>
                <button
                  type="button"
                  onClick={() => handleShareSocialWhatsApp('Facebook Banner', `🌊 *${resolvedCompany.name} Retreat Announcement*\nPlanning your next Garden Route retreat? Escape to ${resolvedCompany.name}.\n\nBook direct: ${resolvedCompany.webAddress}\n\n${hashtagsList.join(' ')}`)}
                  className="px-2.5 py-1 bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                >
                  <WhatsAppIcon className="w-3 h-3 text-slate-950" /> WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-2.5 py-1 bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition"
                >
                  <Printer className="w-3 h-3" /> Print
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`Planning your next Garden Route retreat? Escape to ${resolvedCompany.name}. Exceptional hospitality, gourmet lagoon breakfasts, and tailored adventure itineraries. Book direct: ${resolvedCompany.webAddress}\n\n${hashtagsList.join(' ')}`);
                    setSaveSuccessMsg('Facebook post text copied to clipboard!');
                    setTimeout(() => setSaveSuccessMsg(null), 3000);
                  }}
                  className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 font-semibold px-2 py-1 rounded bg-slate-50 border border-slate-200"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy
                </button>
              </div>
            </div>

            <div className="aspect-[16/9] rounded-2xl bg-gradient-to-r from-blue-950 via-slate-900 to-emerald-950 p-6 text-white flex flex-col justify-between shadow-inner printable-area">
              <div className="flex items-center justify-between">
                <span className="font-serif-luxury text-base font-bold text-white">
                  {resolvedCompany.name}
                </span>
                <span className="text-[10px] bg-emerald-500 text-slate-950 px-2 py-0.5 rounded font-black">
                  GARDEN ROUTE
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-emerald-300">
                  Spring Lagoon Serenade Package
                </h3>
                <p className="text-xs text-slate-200 mt-1 max-w-sm">
                  Complimentary sunset catamaran cruise included with all 3-night stays booked this month.
                </p>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                <span className="font-mono text-emerald-400 font-bold">{resolvedCompany.contactNumbers}</span>
                <span className="bg-white text-slate-950 px-3 py-1 rounded font-bold text-[11px]">
                  Book Direct & Save
                </span>
              </div>
            </div>

            <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
              <strong>Facebook Ad Copy:</strong>
              <p>
                Planning your next Garden Route retreat? Escape to {resolvedCompany.name}. Exceptional hospitality, gourmet lagoon breakfasts, and tailored adventure itineraries.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: CURATED & EDITABLE TOURISM HASHTAGS */}
      {activeTab === 'hashtags' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Hash className="w-4 h-4 text-emerald-600" />
                Live Hashtag Manager & Social Media Tag Editor
              </h3>
              <p className="text-xs text-slate-500">
                Edit, add, or customize hashtags. Tags automatically sync into Instagram, Facebook, WhatsApp, and social preview templates.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleDownloadHashtags}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition shadow-2xs"
                title="Download Hashtag Directory as text file"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                Download TXT
              </button>
              <button
                type="button"
                onClick={handleShareHashtagsWhatsApp}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 rounded-xl text-xs font-bold transition shadow-2xs"
                title="Share hashtags list on WhatsApp"
              >
                <WhatsAppIcon className="w-3.5 h-3.5" />
                WhatsApp
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-2xs"
                title="Print Hashtag Cheatsheet"
              >
                <Printer className="w-3.5 h-3.5 text-emerald-400" />
                Print Cheatsheet
              </button>
              <button
                onClick={handleCopyHashtags}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs shrink-0"
              >
                {copiedHash ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedHash ? 'Copied to Clipboard!' : 'Copy All Hashtags'}
              </button>
            </div>
          </div>

          {/* Add Hashtag Input Bar */}
          <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-2.5 text-slate-400 font-mono font-bold text-xs">#</span>
              <input
                type="text"
                value={newHashtagInput}
                onChange={(e) => setNewHashtagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddHashtag();
                  }
                }}
                placeholder="Type custom hashtag (e.g. KnysnaSunsetVillas or SpringTravel2026)..."
                className="w-full text-xs pl-8 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => handleAddHashtag()}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs shrink-0"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" /> Add Hashtag
            </button>
          </div>

          {/* Preset Hashtag Category Packs */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              1-Click Luxury Tourism Packs (Tap to Append to Campaign):
            </span>
            <div className="flex flex-wrap gap-2 text-xs">
              {[
                { name: 'Lagoon & Heads Pack', tags: ['#KnysnaLagoon', '#TheHeadsKnysna', '#GardenRouteSA', '#FeatherbedEcoTour'] },
                { name: '5-Star Luxury Pack', tags: ['#LuxurySanctuary', '#BoutiqueHotelSA', '#5StarHospitality', '#VIPTravelSA'] },
                { name: 'Culinary & Oysters Pack', tags: ['#KnysnaOysters', '#PlettWineRoute', '#ArtisanDining', '#CapClassique'] },
                { name: 'Honeymoon & Romance', tags: ['#HoneymoonSA', '#RomanticLagoon', '#CouplesRetreat', '#VillaSanctuary'] }
              ].map(pack => (
                <button
                  key={pack.name}
                  type="button"
                  onClick={() => {
                    pack.tags.forEach(t => handleAddHashtag(t));
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 rounded-xl border border-slate-200 hover:border-emerald-300 transition font-medium flex items-center gap-1.5 text-[11px]"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  + {pack.name}
                </button>
              ))}
            </div>
          </div>

          {/* Active Hashtags List with In-Place Edit & Delete */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-bold text-slate-700">Active Hashtags in Campaign ({hashtagsList.length})</span>
              <span>Click pencil to edit or trash to remove</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {hashtagsList.map((tag, idx) => {
                const isEditing = editingTagIndex === idx;

                return isEditing ? (
                  <div key={idx} className="flex items-center gap-1 bg-white border-2 border-emerald-500 rounded-xl p-1 shadow-xs">
                    <input
                      type="text"
                      autoFocus
                      value={editingTagValue}
                      onChange={(e) => setEditingTagValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEditedTag(idx);
                        if (e.key === 'Escape') setEditingTagIndex(null);
                      }}
                      className="px-2 py-1 text-xs font-mono text-slate-900 outline-none w-36"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveEditedTag(idx)}
                      className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                      title="Save"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingTagIndex(null)}
                      className="p-1 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 text-[10px]"
                      title="Cancel"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div
                    key={idx}
                    className="group flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-emerald-50/80 text-slate-700 hover:text-emerald-900 border border-slate-200 hover:border-emerald-300 text-xs font-mono transition"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTagIndex(idx);
                        setEditingTagValue(tag);
                      }}
                      className="p-1 hover:text-emerald-700 text-slate-400 opacity-60 group-hover:opacity-100 transition"
                      title="Edit Hashtag"
                    >
                      <Sparkles className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteHashtag(idx)}
                      className="p-1 hover:text-rose-600 text-slate-400 opacity-60 group-hover:opacity-100 transition"
                      title="Delete Hashtag"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: MONTHLY SALES REPORTS */}
      {activeTab === 'sales_report' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Comprehensive Monthly Sales & Tourism Report
              </h3>
              <p className="text-xs text-slate-500">
                Detailed monthly performance, RevPAR, ADR, and occupancy rate metrics
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleDownloadSalesReportCsv}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                title="Download CSV sales spreadsheet"
              >
                <Download className="w-3.5 h-3.5" />
                Download CSV
              </button>
              <button
                type="button"
                onClick={() => handleShareSalesReportEmail('gmail')}
                className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
                title="Share sales report via Email"
              >
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                Email Report
              </button>
              <button
                type="button"
                onClick={() => {
                  const summary = `📊 *${resolvedCompany.name} Sales Performance Summary*\n• Jan: R 478,800 (90.3% Occ)\n• Feb: R 425,600 (89.4% Occ)\n• Mar: R 398,750 (78.0% Occ)\n• Jun (Oyster Fest): R 560,000 (97.2% Occ)\n• Sep (Current): R 458,200 (87.7% Occ)\n\nTotal YTD Gross: R 2,321,350 across luxury suites.`;
                  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(summary)}`, '_blank', 'noopener,noreferrer');
                }}
                className="px-3.5 py-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                title="Share summary on WhatsApp"
              >
                <WhatsAppIcon className="w-3.5 h-3.5 text-slate-950" />
                WhatsApp Report
              </button>
              <button
                onClick={() => window.print()}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                title="Print Report on any printer"
              >
                <Printer className="w-3.5 h-3.5 text-emerald-400" />
                Print Monthly Report
              </button>
            </div>
          </div>

          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white text-left font-bold">
                <th className="py-2.5 px-3 rounded-l-lg">Month</th>
                <th className="py-2.5 px-3">Room Nights Sold</th>
                <th className="py-2.5 px-3">Occupancy Rate</th>
                <th className="py-2.5 px-3">ADR (Avg Daily Rate)</th>
                <th className="py-2.5 px-3 text-right rounded-r-lg">Gross Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              <tr>
                <td className="py-2.5 px-3 font-bold">January 2026</td>
                <td className="py-2.5 px-3">168 Nights</td>
                <td className="py-2.5 px-3 text-emerald-700 font-semibold">90.3%</td>
                <td className="py-2.5 px-3">R 2,850</td>
                <td className="py-2.5 px-3 text-right font-bold">R 478,800</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold">February 2026</td>
                <td className="py-2.5 px-3">152 Nights</td>
                <td className="py-2.5 px-3 text-emerald-700 font-semibold">89.4%</td>
                <td className="py-2.5 px-3">R 2,800</td>
                <td className="py-2.5 px-3 text-right font-bold">R 425,600</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold">March 2026</td>
                <td className="py-2.5 px-3">145 Nights</td>
                <td className="py-2.5 px-3 text-emerald-700 font-semibold">78.0%</td>
                <td className="py-2.5 px-3">R 2,750</td>
                <td className="py-2.5 px-3 text-right font-bold">R 398,750</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold">June 2026 (Oyster Fest)</td>
                <td className="py-2.5 px-3">175 Nights</td>
                <td className="py-2.5 px-3 text-emerald-700 font-semibold">97.2%</td>
                <td className="py-2.5 px-3">R 3,200</td>
                <td className="py-2.5 px-3 text-right font-bold">R 560,000</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold">September 2026 (Current)</td>
                <td className="py-2.5 px-3">158 Nights</td>
                <td className="py-2.5 px-3 text-emerald-700 font-semibold">87.7%</td>
                <td className="py-2.5 px-3">R 2,900</td>
                <td className="py-2.5 px-3 text-right font-bold">R 458,200</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
