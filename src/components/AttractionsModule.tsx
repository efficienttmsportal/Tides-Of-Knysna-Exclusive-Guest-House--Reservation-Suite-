import React, { useState, useMemo } from 'react';
import { 
  Compass, 
  MapPin, 
  Phone, 
  Globe, 
  Search, 
  SlidersHorizontal, 
  QrCode as QrIcon, 
  Printer, 
  Share2, 
  Sparkles, 
  Navigation, 
  Plus, 
  ExternalLink, 
  Check, 
  ShieldAlert, 
  Smartphone,
  ChevronRight,
  Filter,
  Edit3,
  Trash2,
  Clock
} from 'lucide-react';
import { AttractionItem } from '../types';
import { DocumentActionBar } from './DocumentActionBar';
import { AttractionQrModal } from './AttractionQrModal';
import { PrintableQrSheetModal } from './PrintableQrSheetModal';
import { AttractionsQrStation } from './AttractionsQrStation';
import { getAttractionStatus } from '../utils/attractionUtils';

interface AttractionsModuleProps {
  initialAttractions: AttractionItem[];
}

export const AttractionsModule: React.FC<AttractionsModuleProps> = ({
  initialAttractions
}) => {
  const [attractions, setAttractions] = useState<AttractionItem[]>(initialAttractions);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');

  // Active station attraction for inline QR code generator
  const [stationAttraction, setStationAttraction] = useState<AttractionItem>(
    initialAttractions[0] || attractions[0]
  );

  // Modal states
  const [activeQrAttraction, setActiveQrAttraction] = useState<AttractionItem | null>(null);
  const [isPrintSheetOpen, setIsPrintSheetOpen] = useState(false);
  const [isAddVenueOpen, setIsAddVenueOpen] = useState(false);
  const [editingAttraction, setEditingAttraction] = useState<AttractionItem | null>(null);

  // New venue form state
  const [newVenue, setNewVenue] = useState<Partial<AttractionItem>>({
    name: '',
    category: 'Sightseeing',
    region: 'Knysna',
    description: '',
    contactNumber: '+27 44 ',
    website: 'https://',
    address: '',
    distanceFromGuestHouse: '2.5 km',
    highlights: ['Scenic Views', 'Guest Favorite'],
    openingTime: '08:00',
    closingTime: '17:00',
    recommendedDuration: '2 hours'
  });

  const handleEditVenueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAttraction) return;

    setAttractions(prev => prev.map(a => a.id === editingAttraction.id ? editingAttraction : a));
    setEditingAttraction(null);
  };

  const handleDeleteVenue = (id: string) => {
    if (window.confirm('Are you sure you want to delete this venue recommendation?')) {
      setAttractions(prev => prev.filter(a => a.id !== id));
      if (stationAttraction?.id === id) {
        const remaining = attractions.filter(a => a.id !== id);
        if (remaining.length > 0) setStationAttraction(remaining[0]);
      }
    }
  };

  // Extract unique categories & regions
  const categories = useMemo(() => {
    const list = Array.from(new Set(attractions.map(a => a.category)));
    return ['All', ...list];
  }, [attractions]);

  const regions = useMemo(() => {
    const list = Array.from(new Set(attractions.map(a => a.region)));
    return ['All', ...list];
  }, [attractions]);

  // Filtered attractions
  const filteredAttractions = useMemo(() => {
    return attractions.filter(att => {
      const matchesSearch = 
        att.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        att.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        att.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        att.highlights.some(h => h.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat = selectedCategory === 'All' || att.category === selectedCategory;
      const matchesRegion = selectedRegion === 'All' || att.region === selectedRegion;

      return matchesSearch && matchesCat && matchesRegion;
    });
  }, [attractions, searchQuery, selectedCategory, selectedRegion]);

  const handleAddVenueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVenue.name || !newVenue.address) return;

    const created: AttractionItem = {
      id: `att-custom-${Date.now()}`,
      name: newVenue.name || 'New Venue',
      category: newVenue.category as any || 'Sightseeing',
      region: newVenue.region as any || 'Knysna',
      description: newVenue.description || 'Recommended attraction curated by Tides of Knysna Concierge.',
      contactNumber: newVenue.contactNumber || '+27 44 382 1234',
      website: newVenue.website || 'https://www.tidesofknysna.co.za',
      address: newVenue.address || 'Knysna, Garden Route',
      distanceFromGuestHouse: newVenue.distanceFromGuestHouse || '3 km',
      highlights: newVenue.highlights || ['Concierge Recommendation'],
      openingTime: newVenue.openingTime || '08:00',
      closingTime: newVenue.closingTime || '17:00',
      recommendedDuration: newVenue.recommendedDuration || '2 hours'
    };

    setAttractions(prev => [created, ...prev]);
    setIsAddVenueOpen(false);
    setActiveQrAttraction(created); // Immediately show QR for the new venue!
  };

  return (
    <div id="attractions-module-root" className="space-y-6">
      {/* Top Document Action Bar */}
      <DocumentActionBar
        documentTitle="Knysna & Garden Route Guest Attractions Guide"
        documentNumber="ATT-GUIDE-2026"
        onSave={() => alert('Concierge attraction recommendations synchronized.')}
      />

      {/* ========================================================================= */}
      {/* MOBILE QR CODE CONCIERGE STATION HERO BANNER                              */}
      {/* ========================================================================= */}
      <div 
        id="qr-concierge-station-hero"
        className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-xl relative overflow-hidden"
      >
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <QrIcon className="w-3.5 h-3.5" /> Mobile Navigation System
              </span>
              <span className="text-[10px] bg-white/10 text-slate-200 px-2 py-0.5 rounded-full font-mono">
                {attractions.length} Curated Venues
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold font-serif-luxury tracking-tight text-white">
              Scan & Save Venue Locations Directly to Mobile
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Equip your guests with effortless navigation. Every attraction features a precision QR code that smartphone cameras instantly decode into <strong className="text-emerald-300 font-semibold">Google Maps GPS navigation</strong>, <strong className="text-emerald-300 font-semibold">Apple Maps routes</strong>, or a <strong className="text-emerald-300 font-semibold">digital vCard contact card</strong> to save straight to their address book.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-300 bg-emerald-950/60 border border-emerald-700/50 px-3 py-1.5 rounded-xl">
                <Navigation className="w-4 h-4 text-emerald-400" />
                <span>1-Tap GPS Navigation</span>
              </div>
              <div className="flex items-center gap-1.5 text-sky-300 bg-sky-950/60 border border-sky-700/50 px-3 py-1.5 rounded-xl">
                <Smartphone className="w-4 h-4 text-sky-400" />
                <span>Save to Phone Contacts</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-300 bg-amber-950/60 border border-amber-700/50 px-3 py-1.5 rounded-xl">
                <Printer className="w-4 h-4 text-amber-400" />
                <span>Printable Concierge Passes</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
            <button
              id="btn-open-print-sheet"
              onClick={() => setIsPrintSheetOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print Guest Day-Trip Passes</span>
            </button>

            <button
              id="btn-add-custom-venue"
              onClick={() => setIsAddVenueOpen(true)}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/20 px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Recommendation</span>
            </button>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute right-0 bottom-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* ========================================================================= */}
      {/* REAL-TIME SMARTPHONE QR CONCIERGE STATION                                 */}
      {/* ========================================================================= */}
      <AttractionsQrStation
        attractions={attractions}
        selectedAttraction={stationAttraction}
        onSelectAttraction={(att) => setStationAttraction(att)}
        onOpenModal={(att) => setActiveQrAttraction(att)}
        onOpenPrintSheet={() => setIsPrintSheetOpen(true)}
      />

      {/* ========================================================================= */}
      {/* SEARCH & FILTERS BAR                                                      */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full md:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="input-attractions-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search attractions, oysters, wine estates, distances..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Region Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <span className="text-[11px] font-bold text-slate-500 shrink-0">Region:</span>
            <select
              id="select-attractions-region"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {regions.map(r => (
                <option key={r} value={r}>
                  {r === 'All' ? 'All Regions (Knysna & Plett)' : r}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          {categories.map(cat => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                <span>{cat}</span>
                {cat === 'Emergency Services' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ATTRACTIONS DIRECTORY GRID WITH QR CODE GENERATORS                        */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAttractions.map(att => (
          <div
            key={att.id}
            id={`attraction-card-${att.id}`}
            className={`bg-white rounded-2xl border transition-all duration-200 p-5 shadow-xs hover:shadow-md flex flex-col justify-between ${
              att.isEmergency 
                ? 'border-rose-200 hover:border-rose-400 bg-rose-50/20' 
                : 'border-slate-200/90 hover:border-emerald-300'
            }`}
          >
            <div>
              {/* Category, Region & Edit/Delete Actions */}
              <div className="flex items-center justify-between text-[11px] font-bold mb-2">
                <div className="flex items-center gap-1.5">
                  <span className={`px-2 py-0.5 rounded-md uppercase tracking-wider ${
                    att.isEmergency 
                      ? 'bg-rose-100 text-rose-800' 
                      : 'bg-emerald-50 text-emerald-800'
                  }`}>
                    {att.category}
                  </span>

                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px]">
                    {att.region}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setEditingAttraction(att)}
                    className="p-1 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded transition"
                    title="Edit venue details"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteVenue(att.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                    title="Delete venue"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="font-bold text-slate-900 text-base leading-snug">
                {att.name}
              </h3>

              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed line-clamp-3">
                {att.description}
              </p>

              {/* Highlights */}
              <div className="mt-3 flex flex-wrap gap-1">
                {att.highlights.slice(0, 3).map((hl, i) => (
                  <span
                    key={i}
                    className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium"
                  >
                    {hl}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Meta & QR Code Generator Trigger */}
            <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-3">
              {/* Address & Distance */}
              <div className="text-xs space-y-1 text-slate-600">
                <div className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span className="truncate text-slate-700 font-medium">{att.address}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-emerald-600" />
                    <a
                      href={`tel:${att.contactNumber.replace(/[^0-9+]/g, '')}`}
                      className="font-mono hover:text-emerald-700 hover:underline"
                      title="Direct call"
                    >
                      {att.contactNumber}
                    </a>
                  </div>
                  <span className="bg-slate-100 px-1.5 py-0.2 rounded text-[10px] font-semibold text-slate-600">
                    {att.distanceFromGuestHouse}
                  </span>
                </div>

                {/* Operating Hours, Duration & Status Indicator */}
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100/80 mt-1">
                  <div className="flex items-center gap-2 text-slate-700 font-medium flex-wrap">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                      <span>{att.openingTime && att.closingTime ? `${att.openingTime} - ${att.closingTime}` : att.isEmergency ? '24/7' : '08:00 - 17:00'}</span>
                    </div>
                    {att.recommendedDuration && (
                      <span className="bg-indigo-50 text-indigo-700 font-semibold px-1.5 py-0.2 rounded text-[10px]">
                        ⏱️ {att.recommendedDuration}
                      </span>
                    )}
                  </div>
                  {(() => {
                    const statusInfo = getAttractionStatus(att);
                    return (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        statusInfo.status === 'open' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {statusInfo.label}
                      </span>
                    );
                  })()}
                </div>

                <div className="flex items-center gap-1 text-[10px] text-slate-400 pt-0.5">
                  <span className="font-semibold text-emerald-700">QR Scan:</span>
                  <span>📍 GPS Navigation</span>
                  <span>•</span>
                  <span>📇 Phone Contact</span>
                  <span>•</span>
                  <span>🌐 Website</span>
                </div>
              </div>

              {/* Direct QR Generator Button & Quick Navigation/Web Actions */}
              <div className="flex items-center gap-2">
                <button
                  id={`btn-generate-qr-${att.id}`}
                  onClick={() => {
                    setStationAttraction(att);
                    setActiveQrAttraction(att);
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs group"
                  title="Generate Mobile QR Code for GPS, Contacts & Web"
                >
                  <QrIcon className="w-4 h-4 text-emerald-200 group-hover:scale-110 transition-transform" />
                  <span>Scan to Mobile</span>
                </button>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${att.name}, ${att.address}, South Africa`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  title="Open directly in Google Maps"
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-xl text-xs transition shrink-0"
                >
                  <Navigation className="w-4 h-4 text-slate-600" />
                </a>

                {att.website && (
                  <a
                    href={att.website}
                    target="_blank"
                    rel="noreferrer"
                    title="Open official venue website"
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-xl text-xs transition shrink-0"
                  >
                    <Globe className="w-4 h-4 text-slate-600" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAttractions.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
          <Compass className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="font-bold text-slate-800 text-sm">No attractions found</h4>
          <p className="text-xs text-slate-500">
            No attractions matching "{searchQuery}" in category "{selectedCategory}".
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setSelectedRegion('All');
            }}
            className="text-xs font-semibold text-emerald-700 hover:underline"
          >
            Reset search filters
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* QR CODE MODAL FOR SELECTED ATTRACTION                                    */}
      {/* ========================================================================= */}
      {activeQrAttraction && (
        <AttractionQrModal
          attraction={activeQrAttraction}
          onClose={() => setActiveQrAttraction(null)}
        />
      )}

      {/* ========================================================================= */}
      {/* PRINTABLE QR SHEET MODAL                                                  */}
      {/* ========================================================================= */}
      {isPrintSheetOpen && (
        <PrintableQrSheetModal
          allAttractions={attractions}
          onClose={() => setIsPrintSheetOpen(false)}
        />
      )}

      {/* ========================================================================= */}
      {/* ADD RECOMMENDATION MODAL                                                  */}
      {/* ========================================================================= */}
      {isAddVenueOpen && (
        <div 
          id="add-venue-modal-backdrop"
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddVenueOpen(false);
          }}
        >
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold font-serif-luxury text-lg text-white">
                  Add Guest Recommendation
                </h3>
                <p className="text-xs text-slate-400">
                  Instantly creates a scannable mobile QR code pass for this venue
                </p>
              </div>
              <button 
                onClick={() => setIsAddVenueOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddVenueSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Venue / Attraction Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ile de Pain Artisanal Bakery"
                  value={newVenue.name || ''}
                  onChange={(e) => setNewVenue(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={newVenue.category || 'Sightseeing'}
                    onChange={(e) => setNewVenue(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Sightseeing">Sightseeing</option>
                    <option value="Ocean Tours">Ocean Tours</option>
                    <option value="Eateries">Eateries</option>
                    <option value="Wine Tasting">Wine Tasting</option>
                    <option value="Markets">Markets</option>
                    <option value="Festivals">Festivals</option>
                    <option value="Car Hire">Car Hire</option>
                    <option value="Air Travel">Air Travel</option>
                    <option value="Emergency Services">Emergency Services</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Region</label>
                  <select
                    value={newVenue.region || 'Knysna'}
                    onChange={(e) => setNewVenue(prev => ({ ...prev, region: e.target.value as any }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Knysna">Knysna</option>
                    <option value="Plettenberg Bay">Plettenberg Bay</option>
                    <option value="Garden Route">Garden Route</option>
                    <option value="Port Elizabeth / Gqeberha">Port Elizabeth / Gqeberha</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Physical Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Thesen Harbour Town, Knysna, 6571"
                  value={newVenue.address || ''}
                  onChange={(e) => setNewVenue(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Contact Phone</label>
                  <input
                    type="text"
                    placeholder="+27 44 382 5000"
                    value={newVenue.contactNumber || ''}
                    onChange={(e) => setNewVenue(prev => ({ ...prev, contactNumber: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Distance from Tides</label>
                  <input
                    type="text"
                    placeholder="e.g. 1.8 km (5 min)"
                    value={newVenue.distanceFromGuestHouse || ''}
                    onChange={(e) => setNewVenue(prev => ({ ...prev, distanceFromGuestHouse: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Opening Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 08:00"
                    value={newVenue.openingTime || ''}
                    onChange={(e) => setNewVenue(prev => ({ ...prev, openingTime: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Closing Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 17:00"
                    value={newVenue.closingTime || ''}
                    onChange={(e) => setNewVenue(prev => ({ ...prev, closingTime: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Recommended Duration</label>
                <input
                  type="text"
                  placeholder="e.g. 2 hours"
                  value={newVenue.recommendedDuration || ''}
                  onChange={(e) => setNewVenue(prev => ({ ...prev, recommendedDuration: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Website URL</label>
                <input
                  type="text"
                  placeholder="https://www.example.co.za"
                  value={newVenue.website || ''}
                  onChange={(e) => setNewVenue(prev => ({ ...prev, website: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Concierge Recommendation Notes</label>
                <textarea
                  rows={2}
                  placeholder="Describe why guests should visit this venue..."
                  value={newVenue.description || ''}
                  onChange={(e) => setNewVenue(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddVenueOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl shadow-sm transition"
                >
                  Create & Generate QR Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EDIT VENUE RECOMMENDATION MODAL                                            */}
      {/* ========================================================================= */}
      {editingAttraction && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingAttraction(null);
          }}
        >
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold font-serif-luxury text-lg text-white">
                  Edit Venue Recommendation
                </h3>
                <p className="text-xs text-slate-400">
                  Update location, contact info, or mobile QR code details
                </p>
              </div>
              <button 
                onClick={() => setEditingAttraction(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditVenueSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Venue / Attraction Name</label>
                <input
                  type="text"
                  required
                  value={editingAttraction.name}
                  onChange={(e) => setEditingAttraction(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={editingAttraction.category}
                    onChange={(e) => setEditingAttraction(prev => prev ? ({ ...prev, category: e.target.value as any }) : null)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Sightseeing">Sightseeing</option>
                    <option value="Ocean Tours">Ocean Tours</option>
                    <option value="Eateries">Eateries</option>
                    <option value="Wine Tasting">Wine Tasting</option>
                    <option value="Markets">Markets</option>
                    <option value="Festivals">Festivals</option>
                    <option value="Car Hire">Car Hire</option>
                    <option value="Air Travel">Air Travel</option>
                    <option value="Emergency Services">Emergency Services</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Region</label>
                  <select
                    value={editingAttraction.region}
                    onChange={(e) => setEditingAttraction(prev => prev ? ({ ...prev, region: e.target.value as any }) : null)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Knysna">Knysna</option>
                    <option value="Plettenberg Bay">Plettenberg Bay</option>
                    <option value="Garden Route">Garden Route</option>
                    <option value="Port Elizabeth / Gqeberha">Port Elizabeth / Gqeberha</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Physical Address</label>
                <input
                  type="text"
                  required
                  value={editingAttraction.address}
                  onChange={(e) => setEditingAttraction(prev => prev ? ({ ...prev, address: e.target.value }) : null)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={editingAttraction.contactNumber}
                    onChange={(e) => setEditingAttraction(prev => prev ? ({ ...prev, contactNumber: e.target.value }) : null)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Distance from Tides</label>
                  <input
                    type="text"
                    value={editingAttraction.distanceFromGuestHouse}
                    onChange={(e) => setEditingAttraction(prev => prev ? ({ ...prev, distanceFromGuestHouse: e.target.value }) : null)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Opening Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 08:00"
                    value={editingAttraction.openingTime || ''}
                    onChange={(e) => setEditingAttraction(prev => prev ? ({ ...prev, openingTime: e.target.value }) : null)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Closing Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 17:00"
                    value={editingAttraction.closingTime || ''}
                    onChange={(e) => setEditingAttraction(prev => prev ? ({ ...prev, closingTime: e.target.value }) : null)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Recommended Duration</label>
                <input
                  type="text"
                  placeholder="e.g. 2 hours"
                  value={editingAttraction.recommendedDuration || ''}
                  onChange={(e) => setEditingAttraction(prev => prev ? ({ ...prev, recommendedDuration: e.target.value }) : null)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Website URL</label>
                <input
                  type="text"
                  value={editingAttraction.website || ''}
                  onChange={(e) => setEditingAttraction(prev => prev ? ({ ...prev, website: e.target.value }) : null)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Concierge Recommendation Notes</label>
                <textarea
                  rows={2}
                  value={editingAttraction.description}
                  onChange={(e) => setEditingAttraction(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    handleDeleteVenue(editingAttraction.id);
                    setEditingAttraction(null);
                  }}
                  className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-bold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Venue</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingAttraction(null)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl shadow-sm transition"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
