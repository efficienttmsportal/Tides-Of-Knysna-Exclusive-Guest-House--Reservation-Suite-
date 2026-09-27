import React, { useState, useRef } from 'react';
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
  const [specials, setSpecials] = useState<MarketingSpecial[]>(INITIAL_SPECIALS);
  const [selectedSpecialId, setSelectedSpecialId] = useState<string>(specials[0]?.id || '');
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedVoucher, setCopiedVoucher] = useState(false);
  const [copiedSignature, setCopiedSignature] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState<'Spring' | 'Summer' | 'Autumn' | 'Winter'>('Spring');
  const [autoPreviewMode, setAutoPreviewMode] = useState<'voucher' | 'instagram' | 'facebook' | 'whatsapp' | 'signature'>('voucher');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

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

    setSpecials(prev => [...newSpecials, ...prev]);
    setSelectedSpecialId(newSpecials[0].id);
    setEditSpecial(newSpecials[0]);
    setSelectedSeason(seasonName);
    setSaveSuccessMsg(`✨ Auto-generated ${newSpecials.length} seasonal ${seasonName} specials with custom hashtags & imagery!`);
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  const handleSaveSpecial = () => {
    setSpecials(specials.map(s => s.id === editSpecial.id ? editSpecial : s));
    setSaveSuccessMsg('Special promotion & assets successfully updated.');
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
    setSpecials([newSp, ...specials]);
    setSelectedSpecialId(newId);
    setEditSpecial(newSp);
  };

  const handleDeleteSpecial = (id: string) => {
    if (specials.length <= 1) {
      alert('You must have at least one active special.');
      return;
    }
    if (confirm('Delete this promotional special?')) {
      const updated = specials.filter(s => s.id !== id);
      setSpecials(updated);
      setSelectedSpecialId(updated[0].id);
    }
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
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Active Guest Specials</h3>
                  <span className="text-[11px] text-slate-500">{specials.length} campaigns active</span>
                </div>
                <button
                  onClick={handleCreateNewSpecial}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Special
                </button>
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

                  <div className="flex flex-wrap gap-1.5">
                    {(editSpecial.hashtags || []).map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-mono font-medium flex items-center gap-1"
                      >
                        {tag}
                        <button
                          onClick={() => {
                            const updated = (editSpecial.hashtags || []).filter((_, i) => i !== idx);
                            setEditSpecial({ ...editSpecial, hashtags: updated });
                          }}
                          className="text-emerald-500 hover:text-rose-600 ml-0.5"
                        >
                          ✕
                        </button>
                      </span>
                    ))}

                    <button
                      onClick={() => {
                        const newTag = prompt('Enter new hashtag (e.g. #KnysnaSanctuary):');
                        if (newTag) {
                          const formatted = newTag.startsWith('#') ? newTag : `#${newTag}`;
                          setEditSpecial({
                            ...editSpecial,
                            hashtags: [...(editSpecial.hashtags || []), formatted]
                          });
                        }
                      }}
                      className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <Plus className="w-3 h-3" /> Add Tag
                    </button>
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

                    <div className="flex items-center justify-end gap-2 pt-1 no-print">
                      <button
                        onClick={() => window.print()}
                        className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                      >
                        <Printer className="w-3.5 h-3.5 text-emerald-400" />
                        Print Special Voucher
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
                            alert('Instagram caption & hashtags copied to clipboard!');
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
                    </div>
                  </div>
                )}

                {/* AUTO PREVIEW 3: FACEBOOK / TWITTER (16:9) */}
                {autoPreviewMode === 'facebook' && (
                  <div className="space-y-3">
                    <div className="aspect-[16/9] rounded-2xl overflow-hidden relative shadow-xl border border-slate-800 bg-slate-950 flex flex-col justify-between p-6 md:p-8 text-white">
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

                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => {
                          const waText = `🌊 *${resolvedCompany.name} Exclusive Guest Special*\n\n✨ *${editSpecial.title}*\n${editSpecial.description}\n\n🎁 *Privilege:* ${editSpecial.discountPercent}% Discount\n🔑 *Code:* ${editSpecial.promoCode}\n📅 *Valid:* ${editSpecial.validUntil}\n\nBook direct: ${resolvedCompany.webAddress}\n\n${(editSpecial.hashtags || []).join(' ')}`;
                          navigator.clipboard.writeText(waText);
                          alert('WhatsApp broadcast message copied to clipboard!');
                        }}
                        className="px-3 py-1.5 bg-[#128C7E] hover:bg-[#075E54] text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                      >
                        <WhatsAppIcon className="w-3.5 h-3.5" />
                        Copy WhatsApp Blast
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
              <div className="flex items-center justify-between border-b pb-3 no-print">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  Official Corporate Letterhead
                </h4>
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Letterhead
                </button>
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

                <button
                  onClick={handleCopyHtmlEmailSignature}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  {copiedSignature ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSignature ? 'HTML Signature Copied!' : 'Copy HTML Signature'}
                </button>
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
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="flex items-center gap-1.5 font-bold text-xs text-pink-600">
                <InstagramIcon className="w-4 h-4" /> Instagram Square (1080x1080)
              </span>
              <button
                onClick={() => alert('Instagram caption & asset copied!')}
                className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 font-semibold"
              >
                <Copy className="w-3.5 h-3.5" /> Copy
              </button>
            </div>

            <div className="aspect-square rounded-2xl bg-gradient-to-tr from-slate-950 via-slate-900 to-emerald-950 p-6 text-white flex flex-col justify-between shadow-inner">
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
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="flex items-center gap-1.5 font-bold text-xs text-blue-600">
                <FacebookIcon className="w-4 h-4" /> Facebook Landscape Banner (1200x630)
              </span>
              <button
                onClick={() => alert('Facebook post text copied!')}
                className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 font-semibold"
              >
                <Copy className="w-3.5 h-3.5" /> Copy
              </button>
            </div>

            <div className="aspect-[16/9] rounded-2xl bg-gradient-to-r from-blue-950 via-slate-900 to-emerald-950 p-6 text-white flex flex-col justify-between shadow-inner">
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

      {/* SUB-TAB 4: CURATED TOURISM HASHTAGS */}
      {activeTab === 'hashtags' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Optimized Tourism & Hospitality Hashtags
              </h3>
              <p className="text-xs text-slate-500">
                Categorized for maximum reach across Instagram, TikTok, Facebook & Pinterest
              </p>
            </div>
            <button
              onClick={handleCopyHashtags}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
            >
              {copiedHash ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedHash ? 'Copied to Clipboard!' : 'Copy All Hashtags'}
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {hashtagsList.map(tag => (
              <span
                key={tag}
                className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 text-xs font-medium font-mono transition cursor-pointer"
                onClick={() => {
                  navigator.clipboard.writeText(tag);
                  alert(`Copied ${tag}`);
                }}
              >
                {tag}
              </span>
            ))}
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
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-400" />
              Print Monthly Report
            </button>
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
