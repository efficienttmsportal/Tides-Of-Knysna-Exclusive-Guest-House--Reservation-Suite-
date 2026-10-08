import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  X, 
  Printer, 
  MapPin, 
  Phone, 
  Globe, 
  Compass, 
  Sparkles, 
  Check, 
  Plus, 
  Trash2,
  QrCode as QrIcon
} from 'lucide-react';
import { AttractionItem } from '../types';
import { WhatsAppIcon } from './GuestPortal';

interface PrintableQrSheetModalProps {
  allAttractions: AttractionItem[];
  selectedInitialAttraction?: AttractionItem | null;
  onClose: () => void;
}

export const PrintableQrSheetModal: React.FC<PrintableQrSheetModalProps> = ({
  allAttractions,
  selectedInitialAttraction,
  onClose
}) => {
  // Currently selected attractions for the itinerary sheet (max 6 for clean A4 printing)
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    if (selectedInitialAttraction) {
      // Find 3 other related attractions
      const related = allAttractions
        .filter(a => a.id !== selectedInitialAttraction.id && a.region === selectedInitialAttraction.region)
        .slice(0, 3)
        .map(a => a.id);
      return [selectedInitialAttraction.id, ...related];
    }
    // Default to top 4 popular attractions
    return allAttractions.slice(0, 4).map(a => a.id);
  });

  // Generated QR data URLs mapped by attraction id
  const [qrMap, setQrMap] = useState<Record<string, string>>({});

  // Preset Itineraries
  const handleApplyPreset = (presetName: string) => {
    let ids: string[] = [];
    if (presetName === 'lagoon') {
      ids = allAttractions
        .filter(a => a.name.toLowerCase().includes('lagoon') || a.category === 'Ocean Tours' || a.name.toLowerCase().includes('oyster'))
        .slice(0, 4)
        .map(a => a.id);
    } else if (presetName === 'wine') {
      ids = allAttractions
        .filter(a => a.category === 'Wine Tasting' || a.name.toLowerCase().includes('wine'))
        .slice(0, 4)
        .map(a => a.id);
    } else if (presetName === 'dining') {
      ids = allAttractions
        .filter(a => a.category === 'Eateries' || a.category === 'Markets')
        .slice(0, 4)
        .map(a => a.id);
    } else if (presetName === 'emergency') {
      ids = allAttractions
        .filter(a => a.category === 'Emergency Services' || a.isEmergency)
        .slice(0, 4)
        .map(a => a.id);
    }
    if (ids.length > 0) setSelectedIds(ids);
  };

  // Generate QR codes for all selected attractions
  useEffect(() => {
    const generateAll = async () => {
      const newMap: Record<string, string> = {};
      for (const id of selectedIds) {
        const item = allAttractions.find(a => a.id === id);
        if (item) {
          const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            `${item.name}, ${item.address}, Knysna, South Africa`
          )}`;
          try {
            const url = await QRCode.toDataURL(mapUrl, {
              width: 320,
              margin: 1,
              color: { dark: '#064e3b', light: '#ffffff' },
              errorCorrectionLevel: 'M'
            });
            newMap[id] = url;
          } catch (e) {
            console.error('Error generating batch QR', e);
          }
        }
      }
      setQrMap(newMap);
    };

    generateAll();
  }, [selectedIds, allAttractions]);

  const toggleAttraction = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 1) {
        setSelectedIds(prev => prev.filter(x => x !== id));
      }
    } else {
      if (selectedIds.length < 6) {
        setSelectedIds(prev => [...prev, id]);
      }
    }
  };

  const selectedList = allAttractions.filter(a => selectedIds.includes(a.id));

  // WhatsApp share itinerary
  const handleWhatsAppShareItinerary = () => {
    if (selectedList.length === 0) return;
    const itemsText = selectedList.map((att, i) => 
      `${i + 1}. *${att.name}* (${att.category})\n   📍 Address: ${att.address} (~${att.distanceFromGuestHouse})\n   📞 Tel: ${att.contactNumber}\n   🗺️ GPS: https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${att.name} ${att.address}`)}`
    ).join('\n\n');

    const msg =
      `🗺️ *TIDES OF KNYSNA - GUEST DAY-TRIP ITINERARY*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `Dear Guest, here is your curated Knysna & Garden Route excursion itinerary:\n\n` +
      `${itemsText}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `Have a safe & wonderful day exploring! Contact Reception anytime at +27 82 555 4321.`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div 
      id="printable-qr-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        id="printable-qr-modal-container"
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden my-auto"
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-serif-luxury text-white">
                Guest Excursion QR Passes & Printable Sheet
              </h3>
              <p className="text-xs text-slate-400">
                Curate up to 6 attraction destination QR codes on a printable concierge slip for guests
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleWhatsAppShareItinerary}
              className="bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
              title="Send day-trip itinerary directly to guest via WhatsApp"
            >
              <WhatsAppIcon className="w-3.5 h-3.5 text-slate-950" />
              <span>WhatsApp Itinerary</span>
            </button>
            <button
              id="btn-trigger-print"
              onClick={() => window.print()}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Sheet</span>
            </button>
            <button
              id="btn-close-printable-modal"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar & Preset Filter */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-slate-600 mr-1">Quick Presets:</span>
            <button
              onClick={() => handleApplyPreset('lagoon')}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-700 font-medium transition"
            >
              Lagoon Safari & Cruises
            </button>
            <button
              onClick={() => handleApplyPreset('wine')}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-700 font-medium transition"
            >
              Plett Wine Route
            </button>
            <button
              onClick={() => handleApplyPreset('dining')}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-700 font-medium transition"
            >
              Oysters & Dining
            </button>
            <button
              onClick={() => handleApplyPreset('emergency')}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-rose-500 hover:text-rose-700 font-medium transition"
            >
              Emergency & Medical
            </button>
          </div>

          <div className="text-[11px] text-slate-500 font-mono">
            {selectedList.length} of 6 Passes Selected
          </div>
        </div>

        {/* Printable Paper Canvas Preview */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-100/60 print:bg-white print:p-0">
          <div 
            id="printable-concierge-sheet"
            className="bg-white max-w-3xl mx-auto border border-slate-200/90 shadow-md rounded-2xl p-6 print:border-none print:shadow-none print:p-4 space-y-6"
          >
            {/* Header of the physical print document */}
            <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold font-serif-luxury text-xl text-slate-900">
                    TIDES OF KNYSNA
                  </span>
                  <span className="text-[10px] uppercase tracking-widest bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                    Concierge Day Pass
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  14 Waterfront Promenade, Knysna Lagoon • Front Desk: +27 44 382 1234
                </p>
              </div>

              <div className="text-right text-xs">
                <span className="font-bold text-slate-900 block">Personalized Guest Itinerary</span>
                <span className="text-[11px] text-slate-500">Scan any QR code for GPS Navigation</span>
              </div>
            </div>

            {/* Grid of Printable QR Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedList.map((att) => (
                <div
                  key={att.id}
                  className="border border-slate-200 rounded-xl p-3.5 flex items-start gap-3 bg-white relative group"
                >
                  {/* Remove button (hidden in print) */}
                  <button
                    onClick={() => toggleAttraction(att.id)}
                    className="absolute top-2 right-2 text-slate-300 hover:text-rose-600 print:hidden p-1 transition"
                    title="Remove from print sheet"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  {/* QR Image */}
                  <div className="w-24 h-24 shrink-0 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center p-1">
                    {qrMap[att.id] ? (
                      <img
                        src={qrMap[att.id]}
                        alt={att.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="text-[10px] text-slate-400">Loading...</div>
                    )}
                  </div>

                  {/* Attraction Details */}
                  <div className="space-y-1 text-left flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                        {att.category}
                      </span>
                      <span className="text-[9px] text-slate-400">{att.distanceFromGuestHouse}</span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-xs truncate leading-snug">
                      {att.name}
                    </h4>

                    <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{att.address}</span>
                    </p>

                    <div className="flex items-center gap-1 text-[11px] text-slate-700 font-mono">
                      <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>{att.contactNumber}</span>
                    </div>

                    <div className="text-[9px] text-slate-400 italic pt-0.5">
                      Point camera to open Google / Apple Maps
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Print Footer Notice */}
            <div className="border-t border-slate-200 pt-3 flex items-center justify-between text-[10px] text-slate-400">
              <span>Prepared for guests of Tides of Knysna Exclusive Guest House</span>
              <span>www.tidesofknysna.co.za</span>
            </div>
          </div>
        </div>

        {/* Bottom Drawer: Add more attractions to sheet */}
        <div className="bg-slate-50 border-t border-slate-200 p-4">
          <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-2">
            Click to Add or Remove Venues from this Print Slip:
          </label>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {allAttractions.map(att => {
              const isSelected = selectedIds.includes(att.id);
              return (
                <button
                  key={att.id}
                  onClick={() => toggleAttraction(att.id)}
                  className={`px-2.5 py-1 rounded-lg shrink-0 border transition flex items-center gap-1 ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 border-emerald-600 font-bold shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {isSelected ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                  <span className="truncate max-w-[150px]">{att.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
