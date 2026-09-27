import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  QrCode as QrIcon,
  Navigation,
  UserPlus,
  Globe,
  Phone,
  Smartphone,
  MapPin,
  ExternalLink,
  Download,
  Share2,
  Printer,
  Sparkles,
  Maximize2,
  Check,
  ChevronDown
} from 'lucide-react';
import { AttractionItem } from '../types';

interface AttractionsQrStationProps {
  attractions: AttractionItem[];
  selectedAttraction: AttractionItem;
  onSelectAttraction: (item: AttractionItem) => void;
  onOpenModal: (item: AttractionItem) => void;
  onOpenPrintSheet: () => void;
}

export type StationQrType = 'maps' | 'vcard' | 'website';

export const AttractionsQrStation: React.FC<AttractionsQrStationProps> = ({
  attractions,
  selectedAttraction,
  onSelectAttraction,
  onOpenModal,
  onOpenPrintSheet
}) => {
  const [scanType, setScanType] = useState<StationQrType>('maps');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generate URLs and payloads
  const cleanPhone = selectedAttraction.contactNumber.replace(/[^0-9+]/g, '');
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${selectedAttraction.name}, ${selectedAttraction.address}, Knysna, South Africa`
  )}`;
  const websiteUrl = selectedAttraction.website || 'https://www.tidesofknysna.co.za';

  // vCard / MECARD payload for mobile camera address book saving
  const vCardMecard = `MECARD:N:${selectedAttraction.name.replace(/;/g, ' ')};TEL:${cleanPhone};${
    selectedAttraction.email ? `EMAIL:${selectedAttraction.email};` : ''
  }URL:${websiteUrl};ADR:${selectedAttraction.address.replace(/;/g, ' ')};;`;

  // Compute active payload based on mode
  const activePayload = React.useMemo(() => {
    switch (scanType) {
      case 'maps':
        return googleMapsUrl;
      case 'vcard':
        return vCardMecard;
      case 'website':
        return websiteUrl;
      default:
        return googleMapsUrl;
    }
  }, [scanType, googleMapsUrl, vCardMecard, websiteUrl]);

  // Generate QR Code
  useEffect(() => {
    if (!activePayload) return;
    setIsGenerating(true);

    QRCode.toDataURL(activePayload, {
      width: 400,
      margin: 2,
      color: {
        dark: '#064e3b', // Lagoon Emerald dark
        light: '#ffffff'
      },
      errorCorrectionLevel: 'H'
    })
      .then((url) => {
        setQrDataUrl(url);
        setIsGenerating(false);
      })
      .catch((err) => {
        console.error('Failed to generate QR code in station', err);
        setIsGenerating(false);
      });
  }, [activePayload]);

  // Copy payload link
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(
        scanType === 'maps' ? googleMapsUrl : scanType === 'website' ? websiteUrl : selectedAttraction.contactNumber
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // WhatsApp share
  const handleWhatsAppShare = () => {
    const text = `*${selectedAttraction.name}* (${selectedAttraction.category})\n📍 Address: ${selectedAttraction.address}\n🚗 Distance: ${selectedAttraction.distanceFromGuestHouse}\n📞 Tel: ${selectedAttraction.contactNumber}\n🌐 Web: ${selectedAttraction.website}\n🗺️ GPS Route: ${googleMapsUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      id="attractions-live-qr-station"
      className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-5"
    >
      {/* Header with Title & Quick Venue Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
              <QrIcon className="w-3 h-3 text-emerald-700" />
              Mobile Concierge QR Station
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              Garden Route Navigation System
            </span>
          </div>
          <h3 className="text-lg font-bold font-serif-luxury text-slate-900">
            Instant Smartphone QR Code Generator
          </h3>
          <p className="text-xs text-slate-500">
            Guests can scan venue locations, contact details, or websites directly with their phone cameras.
          </p>
        </div>

        {/* Venue Select Dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="select-station-venue" className="text-xs font-bold text-slate-600 shrink-0">
            Select Venue:
          </label>
          <div className="relative min-w-[220px]">
            <select
              id="select-station-venue"
              value={selectedAttraction.id}
              onChange={(e) => {
                const found = attractions.find((a) => a.id === e.target.value);
                if (found) onSelectAttraction(found);
              }}
              className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 pr-8 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {attractions.map((att) => (
                <option key={att.id} value={att.id}>
                  {att.name} ({att.distanceFromGuestHouse})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Grid: QR Preview on Left, Mode Selector & Venue Details on Right */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* LEFT COLUMN: QR Code Frame */}
        <div className="md:col-span-5 flex flex-col items-center">
          <div className="relative bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-inner flex flex-col items-center">
            {isGenerating ? (
              <div className="w-48 h-48 flex items-center justify-center bg-white rounded-xl">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
              </div>
            ) : qrDataUrl ? (
              <div className="relative group">
                <img
                  src={qrDataUrl}
                  alt={`${selectedAttraction.name} QR Code`}
                  className="w-48 h-48 object-contain rounded-xl bg-white p-2 border border-slate-200/80 shadow-xs"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-8 h-8 rounded-lg bg-white shadow-md border border-slate-200 flex items-center justify-center text-emerald-700">
                    <QrIcon className="w-4 h-4 text-emerald-700" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-48 h-48 flex items-center justify-center bg-white rounded-xl text-xs text-slate-400">
                Generating QR...
              </div>
            )}

            {/* Camera Scan Prompt Badge */}
            <div className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1 rounded-full shadow-xs">
              <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
              <span>Point Camera to Scan</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Mode Selector, Venue Snapshot, & Export Actions */}
        <div className="md:col-span-7 space-y-4">
          {/* Mode Switcher Tabs */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Choose Data Encoded in QR Code:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {/* Option 1: GPS Location */}
              <button
                id="btn-station-mode-maps"
                onClick={() => setScanType('maps')}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                  scanType === 'maps'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-xs ring-1 ring-emerald-500'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <Navigation className={`w-4 h-4 ${scanType === 'maps' ? 'text-emerald-600' : 'text-slate-400'}`} />
                  {scanType === 'maps' && <Check className="w-3.5 h-3.5 text-emerald-600 font-bold" />}
                </div>
                <div className="font-bold text-xs">Venue Location</div>
                <div className="text-[10px] text-slate-500">Google / Apple Maps GPS</div>
              </button>

              {/* Option 2: Contact Details */}
              <button
                id="btn-station-mode-vcard"
                onClick={() => setScanType('vcard')}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                  scanType === 'vcard'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-xs ring-1 ring-emerald-500'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <UserPlus className={`w-4 h-4 ${scanType === 'vcard' ? 'text-emerald-600' : 'text-slate-400'}`} />
                  {scanType === 'vcard' && <Check className="w-3.5 h-3.5 text-emerald-600 font-bold" />}
                </div>
                <div className="font-bold text-xs">Contact Details</div>
                <div className="text-[10px] text-slate-500">Save to Address Book</div>
              </button>

              {/* Option 3: Website */}
              <button
                id="btn-station-mode-website"
                onClick={() => setScanType('website')}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                  scanType === 'website'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-xs ring-1 ring-emerald-500'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <Globe className={`w-4 h-4 ${scanType === 'website' ? 'text-emerald-600' : 'text-slate-400'}`} />
                  {scanType === 'website' && <Check className="w-3.5 h-3.5 text-emerald-600 font-bold" />}
                </div>
                <div className="font-bold text-xs">Venue Website</div>
                <div className="text-[10px] text-slate-500">Bookings, Menus & Info</div>
              </button>
            </div>
          </div>

          {/* Active Target Banner */}
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">{selectedAttraction.name}</span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                {selectedAttraction.distanceFromGuestHouse}
              </span>
            </div>

            <div className="space-y-1 text-slate-600">
              <div className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span className="text-slate-700">{selectedAttraction.address}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="font-mono text-slate-800">{selectedAttraction.contactNumber}</span>
              </div>
              {selectedAttraction.website && (
                <div className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <a
                    href={selectedAttraction.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-700 hover:underline truncate"
                  >
                    {selectedAttraction.website}
                  </a>
                </div>
              )}
            </div>

            <div className="pt-1 text-[11px] text-slate-500 italic">
              {scanType === 'maps' && '✨ Scanning immediately starts GPS turn-by-turn directions from your mobile location.'}
              {scanType === 'vcard' && '✨ Scanning creates a mobile contact card with name, address, phone & website.'}
              {scanType === 'website' && '✨ Scanning opens the venue’s verified mobile website in your phone’s browser.'}
            </div>
          </div>

          {/* Actions Bar */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              id="btn-station-open-modal"
              onClick={() => onOpenModal(selectedAttraction)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Enlarge & Customize QR</span>
            </button>

            <button
              id="btn-station-copy-link"
              onClick={handleCopyLink}
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <ExternalLink className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>

            <button
              id="btn-station-share-whatsapp"
              onClick={handleWhatsAppShare}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp to Guest</span>
            </button>

            <button
              id="btn-station-print-passes"
              onClick={onOpenPrintSheet}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ml-auto"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Print Day-Trip Passes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
