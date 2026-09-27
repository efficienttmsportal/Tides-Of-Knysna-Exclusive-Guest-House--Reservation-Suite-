import React, { useState, useEffect, useId } from 'react';
import QRCode from 'qrcode';
import { 
  X, 
  MapPin, 
  Phone, 
  Globe, 
  Share2, 
  Download, 
  Copy, 
  Check, 
  ExternalLink, 
  Smartphone, 
  QrCode as QrIcon, 
  Compass, 
  Printer, 
  Sparkles, 
  Navigation,
  UserPlus,
  Send
} from 'lucide-react';
import { AttractionItem } from '../types';

interface AttractionQrModalProps {
  attraction: AttractionItem | null;
  onClose: () => void;
}

export type QrFormatType = 'maps' | 'vcard' | 'website' | 'phone';

interface ColorTheme {
  id: string;
  name: string;
  dark: string;
  light: string;
  badgeBg: string;
}

const COLOR_THEMES: ColorTheme[] = [
  { id: 'emerald', name: 'Lagoon Emerald', dark: '#064e3b', light: '#f0fdf4', badgeBg: 'bg-emerald-600' },
  { id: 'slate', name: 'Midnight Slate', dark: '#0f172a', light: '#ffffff', badgeBg: 'bg-slate-900' },
  { id: 'blue', name: 'Ocean Azure', dark: '#0369a1', light: '#f0f9ff', badgeBg: 'bg-sky-600' },
  { id: 'amber', name: 'Cape Sunset', dark: '#9a3412', light: '#fffbeb', badgeBg: 'bg-amber-600' }
];

export const AttractionQrModal: React.FC<AttractionQrModalProps> = ({
  attraction,
  onClose
}) => {
  const [format, setFormat] = useState<QrFormatType>('maps');
  const [selectedTheme, setSelectedTheme] = useState<ColorTheme>(COLOR_THEMES[0]);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const modalId = useId();

  // Construct target payloads
  const googleMapsUrl = attraction
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${attraction.name}, ${attraction.address}, Knysna, South Africa`
      )}`
    : '';

  const appleMapsUrl = attraction
    ? `https://maps.apple.com/?q=${encodeURIComponent(attraction.name)}&address=${encodeURIComponent(
        `${attraction.address}, South Africa`
      )}`
    : '';

  const cleanPhone = attraction ? attraction.contactNumber.replace(/[^0-9+]/g, '') : '';
  const telUrl = `tel:${cleanPhone}`;
  const websiteUrl = attraction?.website || '';

  // Standard vCard 3.0 string
  const vCardString = attraction
    ? `BEGIN:VCARD\r
VERSION:3.0\r
FN:${attraction.name}\r
ORG:Garden Route Attractions\r
TITLE:${attraction.category}\r
TEL;TYPE=WORK,VOICE:${attraction.contactNumber}\r
${attraction.email ? `EMAIL;TYPE=PREF,INTERNET:${attraction.email}\r\n` : ''}URL:${attraction.website}\r
ADR;TYPE=WORK:;;${attraction.address};${attraction.region};;6571;South Africa\r
NOTE:Curated by Tides of Knysna Concierge. Distance: ${attraction.distanceFromGuestHouse}. Highlights: ${attraction.highlights.join(', ')}\r
END:VCARD`
    : '';

  // Active payload string based on format
  const activePayload = React.useMemo(() => {
    if (!attraction) return '';
    switch (format) {
      case 'maps':
        return googleMapsUrl;
      case 'vcard':
        // MECARD format works with iOS & Android Camera native scanners
        return `MECARD:N:${attraction.name.replace(/;/g, ' ')};TEL:${cleanPhone};${
          attraction.email ? `EMAIL:${attraction.email};` : ''
        }URL:${attraction.website};ADR:${attraction.address.replace(/;/g, ' ')};;`;
      case 'website':
        return websiteUrl;
      case 'phone':
        return telUrl;
      default:
        return googleMapsUrl;
    }
  }, [format, attraction, googleMapsUrl, cleanPhone, websiteUrl, telUrl]);

  // Generate QR code whenever payload or theme changes
  useEffect(() => {
    if (!activePayload) return;
    setIsGenerating(true);

    QRCode.toDataURL(activePayload, {
      width: 480,
      margin: 2,
      color: {
        dark: selectedTheme.dark,
        light: selectedTheme.light
      },
      errorCorrectionLevel: 'H'
    })
      .then((url) => {
        setQrDataUrl(url);
        setIsGenerating(false);
      })
      .catch((err) => {
        console.error('Failed to generate QR code', err);
        setIsGenerating(false);
      });
  }, [activePayload, selectedTheme]);

  if (!attraction) return null;

  // Copy link / payload to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        format === 'maps' ? googleMapsUrl : format === 'website' ? websiteUrl : activePayload
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  // Download QR code as PNG image with branded label
  const handleDownloadQrPng = () => {
    if (!qrDataUrl) return;

    // Create a canvas with venue header & QR
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 600, 720);

    // Top banner
    ctx.fillStyle = selectedTheme.dark;
    ctx.fillRect(0, 0, 600, 90);

    // Banner Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('TIDES OF KNYSNA CONCIERGE', 300, 38);

    ctx.font = '13px sans-serif';
    ctx.fillStyle = '#a7f3d0';
    ctx.fillText('GUEST LOCATION PASS & GPS NAVIGATION', 300, 64);

    // Venue title
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(attraction.name, 300, 130, 540);

    // Category & Distance
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText(`${attraction.category} • ${attraction.distanceFromGuestHouse}`, 300, 155);

    // Draw QR image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.drawImage(img, 120, 180, 360, 360);

      // Address & Phone footer
      ctx.font = 'bold 14px sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.fillText(attraction.address, 300, 580, 540);

      ctx.font = '13px sans-serif';
      ctx.fillStyle = '#059669';
      ctx.fillText(`Tel: ${attraction.contactNumber} | ${attraction.website.replace('https://', '')}`, 300, 610, 540);

      // Scan instruction
      ctx.font = 'italic 12px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('Scan with smartphone camera to open Google Maps or save to Contacts', 300, 650);

      // Footer bar
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 680, 600, 40);
      ctx.font = '11px sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText('Tides of Knysna Exclusive Guest House • 14 Waterfront Promenade', 300, 705);

      // Download trigger
      const link = document.createElement('a');
      link.download = `${attraction.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_location_qr.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = qrDataUrl;
  };

  // Download .vcf file
  const handleDownloadVcard = () => {
    const blob = new Blob([vCardString], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${attraction.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.vcf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // WhatsApp share link
  const handleWhatsAppShare = () => {
    const text = `*${attraction.name}* (${attraction.category})\n📍 ${attraction.address}\n🚗 Distance from Tides of Knysna: ${attraction.distanceFromGuestHouse}\n📞 ${attraction.contactNumber}\n🗺️ GPS Map Link: ${googleMapsUrl}`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  // Print concierge card
  const handlePrintCard = () => {
    window.print();
  };

  return (
    <div 
      id="attraction-qr-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        id="attraction-qr-modal-container"
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col my-auto"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-5 sm:p-6 flex items-start justify-between relative overflow-hidden">
          <div className="relative z-10 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-widest uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                <QrIcon className="w-3 h-3" /> Mobile QR Generator
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
                {attraction.region}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-serif-luxury tracking-tight text-white">
              {attraction.name}
            </h3>
            <p className="text-xs text-slate-300 flex items-center gap-2">
              <span className="flex items-center gap-1 text-emerald-300">
                <MapPin className="w-3.5 h-3.5" />
                {attraction.distanceFromGuestHouse}
              </span>
              <span>•</span>
              <span className="text-slate-300">{attraction.category}</span>
            </p>
          </div>

          <button
            id="btn-close-qr-modal"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition z-10"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Decorative background glow */}
          <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Format Selector Tabs */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-2">
              1. Select Mobile Scan Destination
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                id="btn-qr-tab-maps"
                onClick={() => setFormat('maps')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition ${
                  format === 'maps'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Navigation className={`w-4 h-4 mb-1 ${format === 'maps' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>GPS Directions</span>
                <span className="text-[9px] text-slate-400 font-normal mt-0.5">Google / Apple Maps</span>
              </button>

              <button
                id="btn-qr-tab-vcard"
                onClick={() => setFormat('vcard')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition ${
                  format === 'vcard'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <UserPlus className={`w-4 h-4 mb-1 ${format === 'vcard' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>Contact Card</span>
                <span className="text-[9px] text-slate-400 font-normal mt-0.5">Save to Phone Contacts</span>
              </button>

              <button
                id="btn-qr-tab-website"
                onClick={() => setFormat('website')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition ${
                  format === 'website'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Globe className={`w-4 h-4 mb-1 ${format === 'website' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>Venue Website</span>
                <span className="text-[9px] text-slate-400 font-normal mt-0.5">Bookings & Menus</span>
              </button>

              <button
                id="btn-qr-tab-phone"
                onClick={() => setFormat('phone')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition ${
                  format === 'phone'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Phone className={`w-4 h-4 mb-1 ${format === 'phone' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>Direct Call</span>
                <span className="text-[9px] text-slate-400 font-normal mt-0.5">1-Tap Dial</span>
              </button>
            </div>
          </div>

          {/* Main Visual Display: QR Code + Details */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-center gap-6">
            {/* The QR Code Card Frame */}
            <div className="relative flex flex-col items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm shrink-0">
              {isGenerating ? (
                <div className="w-52 h-52 flex items-center justify-center bg-slate-100 rounded-xl">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
                </div>
              ) : qrDataUrl ? (
                <div className="relative group">
                  <img
                    id="img-attraction-qr"
                    src={qrDataUrl}
                    alt={`${attraction.name} QR Code`}
                    className="w-52 h-52 object-contain rounded-lg"
                  />
                  {/* Center branding icon overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-9 h-9 rounded-lg bg-white shadow-md border border-slate-200 flex items-center justify-center text-emerald-700">
                      <Compass className="w-5 h-5 text-emerald-600" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-52 h-52 flex items-center justify-center bg-slate-100 rounded-xl text-slate-400 text-xs">
                  Generating QR...
                </div>
              )}

              {/* Scan Badge */}
              <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
                <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Scan with Phone Camera</span>
              </div>
            </div>

            {/* QR Info & Guidance */}
            <div className="space-y-3.5 flex-1 w-full text-left">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  {format === 'maps' && '📍 GPS Navigation Target'}
                  {format === 'vcard' && '📇 Mobile Address Book Target'}
                  {format === 'website' && '🌐 Official Venue Website'}
                  {format === 'phone' && '📞 Telephony Call Target'}
                </span>
                <p className="text-xs font-semibold text-slate-900 mt-0.5">
                  {format === 'maps' && 'Opens Google Maps or Apple Maps with directions directly from Knysna.'}
                  {format === 'vcard' && 'Prompts your smartphone to automatically save this venue to your Contacts.'}
                  {format === 'website' && 'Launches the venue’s verified website for reservations, tickets & menus.'}
                  {format === 'phone' && `Prompts your mobile dialer to immediately call ${attraction.contactNumber}.`}
                </p>
              </div>

              {/* Venue Snapshot Info */}
              <div className="space-y-1.5 text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200/80">
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="font-medium text-slate-800">{attraction.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-mono text-slate-700">{attraction.contactNumber}</span>
                  {attraction.alternativeContact && (
                    <span className="text-[10px] text-slate-400">({attraction.alternativeContact})</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <a 
                    href={attraction.website} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-emerald-700 hover:underline truncate"
                  >
                    {attraction.website.replace('https://', '')}
                  </a>
                </div>
              </div>

              {/* Theme Customizer */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] font-bold text-slate-600">QR Theme Style:</span>
                <div className="flex items-center gap-1.5">
                  {COLOR_THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => setSelectedTheme(theme)}
                      className={`w-6 h-6 rounded-full border-2 transition ${
                        selectedTheme.id === theme.id ? 'border-emerald-600 scale-110 shadow-sm' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: theme.dark }}
                      title={theme.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
            {/* Left Primary Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                id="btn-download-qr-png"
                onClick={handleDownloadQrPng}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save QR Image (PNG)</span>
              </button>

              {format === 'vcard' && (
                <button
                  id="btn-download-vcf"
                  onClick={handleDownloadVcard}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                >
                  <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Download .VCF Card</span>
                </button>
              )}

              <button
                id="btn-test-maps-link"
                onClick={() => {
                  window.open(format === 'maps' ? googleMapsUrl : format === 'website' ? websiteUrl : googleMapsUrl, '_blank', 'noopener,noreferrer');
                }}
                className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                <span>Open in Browser</span>
              </button>
            </div>

            {/* Right Secondary Actions */}
            <div className="flex items-center gap-2">
              <button
                id="btn-whatsapp-share"
                onClick={handleWhatsAppShare}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                title="Send location and details via WhatsApp"
              >
                <Send className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp</span>
              </button>

              <button
                id="btn-copy-qr-link"
                onClick={handleCopy}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer / Concierge Badge */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            Tides of Knysna Concierge Guest Pass Service
          </span>
          <span className="font-mono">ATT-QR-{attraction.id.toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
};
