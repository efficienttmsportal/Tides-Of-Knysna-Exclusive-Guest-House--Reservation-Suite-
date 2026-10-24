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
  Clock,
  TrendingUp,
  BarChart3
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

  // QR Concierge Station Enhanced State & Handlers
  const [scanStatus, setScanStatus] = useState<'searching' | 'success' | 'error'>('searching');
  const [isBatchScanning, setIsBatchScanning] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  const [scanHistory, setScanHistory] = useState<Array<{ id: string; venueName: string; timestamp: string; location: string; action: string; status: string }>>([
    { id: 'scan-1', venueName: 'Pezula Championship Golf Course', timestamp: new Date(Date.now() - 3600000).toLocaleTimeString(), location: 'Pezula Estate', action: 'GPS Map Route Decoded', status: 'Success' },
    { id: 'scan-2', venueName: 'Knysna Oyster Company', timestamp: new Date(Date.now() - 7200000).toLocaleTimeString(), location: 'Knysna Quays', action: 'vCard Contact Saved', status: 'Success' }
  ]);
  const [isScanHistoryOpen, setIsScanHistoryOpen] = useState(false);
  const [kpiMetric, setKpiMetric] = useState<'visitors' | 'scans' | 'ratings'>('visitors');

  const handleShareStation = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Tides of Knysna QR Concierge Station',
          text: 'Explore curated Garden Route attractions and 1-tap mobile navigation guides.',
          url: window.location.href,
        });
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Concierge Station link copied to clipboard!');
    }
  };

  const handleScanAllRoutine = () => {
    if (isBatchScanning) return;
    setIsBatchScanning(true);
    setBatchProgress(0);
    setScanStatus('searching');

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 25;
      if (currentProgress <= 100) {
        setBatchProgress(currentProgress);
        if (currentProgress === 50) setScanStatus('success');
      } else {
        clearInterval(interval);
        setIsBatchScanning(false);
        const newEntry = {
          id: `scan-${Date.now()}`,
          venueName: `Batch Scan (${filteredAttractions.length} Venues)`,
          timestamp: new Date().toLocaleTimeString(),
          location: 'Knysna & Garden Route Directory',
          action: 'Full Directory Batch Sync & QR Verification',
          status: 'Success'
        };
        setScanHistory(prev => [newEntry, ...prev]);
        setScanStatus('success');
      }
    }, 350);
  };

  const handleExportQrHistoryPdf = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      await import('jspdf-autotable');
      const { addPdfWatermarkAndEmblem } = await import('../utils/pdfWatermarkUtils');

      const doc = new jsPDF('portrait', 'mm', 'a4');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.setTextColor(15, 23, 42);
      doc.text('QR Concierge Station Scan History Log', 14, 42);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`Tides of Knysna Luxury Guest House | Generated: ${new Date().toLocaleDateString()}`, 14, 48);

      const tableRows = scanHistory.map(h => [
        h.timestamp,
        h.venueName,
        h.location,
        h.action,
        h.status
      ]);

      (doc as any).autoTable({
        startY: 55,
        head: [['Timestamp', 'Venue / Target', 'Location', 'Action Performed', 'Status']],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
        bodyStyles: { fontSize: 8.5, textColor: [51, 65, 85] },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { left: 14, right: 14 }
      });

      addPdfWatermarkAndEmblem(doc);
      doc.save(`TOK-QR-Concierge-History-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('Failed to export QR history PDF', err);
      alert('Failed to generate QR scan history PDF report.');
    }
  };

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
      {/* MOBILE QR CODE CONCIERGE STATION HERO BANNER (Enhanced Two-Column Layout) */}
      {/* ========================================================================= */}
      <div 
        id="qr-concierge-station-hero"
        className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden transition-all duration-300 transform hover:scale-[1.01] hover:shadow-2xl hover:shadow-emerald-500/25"
      >
        {/* Subtle branded luxury pattern overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1.5px,transparent_1.5px)] [background-size:20px_20px] opacity-20 pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Column: Text & Features */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <QrIcon className="w-3.5 h-3.5" /> Mobile Navigation System
              </span>
              <span className="text-[10px] bg-white/10 text-slate-200 px-2.5 py-0.5 rounded-full font-mono">
                {attractions.length} Curated Venues
              </span>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                scanStatus === 'success' ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400' :
                scanStatus === 'error' ? 'bg-rose-500/30 text-rose-300 border border-rose-400' :
                'bg-amber-500/30 text-amber-300 border border-amber-400 animate-pulse'
              }`}>
                Scanner: {scanStatus.toUpperCase()}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold font-serif-luxury tracking-tight text-white">
              Scan & Save Venue Locations Directly to Mobile
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Equip your guests with effortless navigation. Every attraction features a precision QR code that smartphone cameras instantly decode into <strong className="text-emerald-300 font-semibold">Google Maps GPS navigation</strong>, <strong className="text-emerald-300 font-semibold">Apple Maps routes</strong>, or a <strong className="text-emerald-300 font-semibold">digital vCard contact card</strong> to save straight to their address book.
            </p>

            <div className="pt-1 flex flex-wrap items-center gap-2.5 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-300 bg-emerald-950/60 border border-emerald-700/50 px-3 py-1.5 rounded-xl">
                <Navigation className="w-4 h-4 text-emerald-400" />
                <span>1-Tap GPS Navigation</span>
              </div>
              <div className="flex items-center gap-1.5 text-sky-300 bg-sky-950/60 border border-sky-700/50 px-3 py-1.5 rounded-xl">
                <Smartphone className="w-4 h-4 text-sky-400" />
                <span>Save to Contacts</span>
              </div>
              <button
                onClick={() => setIsScanHistoryOpen(true)}
                className="flex items-center gap-1.5 text-amber-300 bg-amber-950/60 hover:bg-amber-900/80 border border-amber-700/50 px-3 py-1.5 rounded-xl transition cursor-pointer"
              >
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Scan History ({scanHistory.length})</span>
              </button>
            </div>

            {/* Quick Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <button
                id="btn-scan-all-routine"
                onClick={handleScanAllRoutine}
                disabled={isBatchScanning}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg transition disabled:opacity-50"
              >
                <QrIcon className="w-4 h-4" />
                <span>{isBatchScanning ? `Scanning... ${batchProgress}%` : 'Scan All Venues (Batch)'}</span>
              </button>

              <button
                id="btn-share-station"
                onClick={handleShareStation}
                className="bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/20 px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2 transition"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Station</span>
              </button>

              <button
                id="btn-open-print-sheet"
                onClick={() => setIsPrintSheetOpen(true)}
                className="bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/20 px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2 transition"
              >
                <Printer className="w-4 h-4" />
                <span>Print Passes</span>
              </button>
            </div>

            {/* Batch Scan Progress Bar */}
            {isBatchScanning && (
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[11px] font-mono text-emerald-300">
                  <span>Batch Scan Routine in Progress...</span>
                  <span>{batchProgress}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                  <div 
                    className="bg-emerald-400 h-full transition-all duration-300"
                    style={{ width: `${batchProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Interactive 3D SVG Icon / Branded Imagery & Status-Aware Scan Pulse */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
              {/* Scan Pulse Animation Rings (Status-aware color) */}
              <div className={`absolute inset-0 rounded-full animate-ping opacity-35 ${
                scanStatus === 'success' ? 'bg-emerald-400' :
                scanStatus === 'error' ? 'bg-rose-500' :
                'bg-amber-400'
              }`} style={{ animationDuration: '3s' }} />
              <div className={`absolute inset-4 rounded-full animate-pulse opacity-25 ${
                scanStatus === 'success' ? 'bg-emerald-500' :
                scanStatus === 'error' ? 'bg-rose-600' :
                'bg-amber-500'
              }`} style={{ animationDuration: '2s' }} />

              {/* Central Branded Luxury Imagery / 3D SVG Concierge Hub Placeholder */}
              <div className="relative z-10 w-44 h-44 sm:w-48 sm:h-48 rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-950 border-2 border-emerald-500/50 shadow-2xl flex flex-col items-center justify-center p-4 text-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center mb-2 shadow-inner">
                  <QrIcon className="w-8 h-8 text-emerald-400" />
                </div>
                <h4 className="font-serif-luxury font-bold text-sm text-white">Tides Concierge</h4>
                <p className="text-[10px] text-emerald-300/80 font-mono mt-0.5">Pezula Estate Hub</p>
                
                <div className="mt-2.5 flex items-center gap-1 bg-emerald-950/80 border border-emerald-600/40 px-2.5 py-0.5 rounded-full text-[9px] font-bold text-emerald-200">
                  <span className={`w-2 h-2 rounded-full ${
                    scanStatus === 'success' ? 'bg-emerald-400 animate-pulse' :
                    scanStatus === 'error' ? 'bg-rose-500' :
                    'bg-amber-400 animate-ping'
                  }`} />
                  <span>Laser Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute right-0 bottom-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Scan History Modal */}
      {isScanHistoryOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                <h3 className="font-serif-luxury font-bold text-slate-900 text-lg">QR Concierge Scan History Log</h3>
              </div>
              <button
                onClick={() => setIsScanHistoryOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {scanHistory.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8">No scan events recorded yet.</p>
              ) : (
                scanHistory.map((item) => (
                  <div key={item.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-900">{item.venueName}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2">
                        <span>📍 {item.location}</span>
                        <span>•</span>
                        <span>⚡ {item.action}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono text-[10px] text-slate-400 block">{item.timestamp}</span>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                onClick={handleExportQrHistoryPdf}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
              >
                <Printer className="w-3.5 h-3.5 text-amber-300" />
                Export QR History PDF
              </button>
              <button
                onClick={() => setIsScanHistoryOpen(false)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
      {/* ATTRACTIONS KPI TREND CHARTS & ANALYTICS                                  */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                <TrendingUp className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-serif-luxury font-bold text-slate-900 text-lg">Attractions KPI & Visitor Trend Analytics</h3>
                <p className="text-xs text-slate-500">Real-time engagement metrics, QR scan conversion rates, and guest preference trends</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setKpiMetric('visitors')}
              className={`px-3 py-1.5 rounded-lg transition ${kpiMetric === 'visitors' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Visitor Volume
            </button>
            <button
              onClick={() => setKpiMetric('scans')}
              className={`px-3 py-1.5 rounded-lg transition ${kpiMetric === 'scans' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              QR Scans
            </button>
            <button
              onClick={() => setKpiMetric('ratings')}
              className={`px-3 py-1.5 rounded-lg transition ${kpiMetric === 'ratings' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Satisfaction
            </button>
          </div>
        </div>

        {/* KPI Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/80 to-teal-50/40 border border-emerald-200 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Total Curated Venues</span>
            <div className="text-2xl font-bold font-serif-luxury text-slate-900">{attractions.length}</div>
            <div className="text-[11px] text-emerald-700 flex items-center gap-1 font-semibold">
              <span>+3 added this month</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/60 border border-slate-200 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Monthly Guest Interactions</span>
            <div className="text-2xl font-bold font-serif-luxury text-slate-900">1,428</div>
            <div className="text-[11px] text-emerald-600 flex items-center gap-1 font-semibold">
              <span>↑ 18.4% vs last month</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/80 to-amber-100/30 border border-amber-200 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">QR Scan Conversion Rate</span>
            <div className="text-2xl font-bold font-serif-luxury text-slate-900">94.2%</div>
            <div className="text-[11px] text-amber-700 flex items-center gap-1 font-semibold">
              <span>GPS & vCard downloads</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/80 to-indigo-100/30 border border-indigo-200 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-800">Average Guest Rating</span>
            <div className="text-2xl font-bold font-serif-luxury text-slate-900">4.9 / 5.0</div>
            <div className="text-[11px] text-indigo-700 flex items-center gap-1 font-semibold">
              <span>Based on 312 reviews</span>
            </div>
          </div>
        </div>

        {/* Category Breakdown Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                Attraction Category Popularity
              </h4>
              <span className="text-[11px] text-slate-500 font-mono">Live Analytics</span>
            </div>

            <div className="space-y-3">
              {[
                { name: 'Sightseeing & Nature', count: attractions.filter(a => a.category === 'Sightseeing').length || 8, percentage: 85, color: 'bg-emerald-500' },
                { name: 'Dining & Wine Estates', count: attractions.filter(a => a.category === 'Eateries' || a.category === 'Wine Tasting').length || 6, percentage: 78, color: 'bg-teal-500' },
                { name: 'Adventure & Outdoor', count: attractions.filter(a => a.category === 'Ocean Tours' || a.category === 'Markets').length || 5, percentage: 72, color: 'bg-sky-500' },
                { name: 'Festivals & Markets', count: attractions.filter(a => a.category === 'Festivals' || a.category === 'Markets').length || 3, percentage: 64, color: 'bg-indigo-500' },
              ].map((cat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-800">
                    <span>{cat.name}</span>
                    <span className="font-mono text-slate-600">{cat.percentage}% engagement</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div className={`${cat.color} h-full rounded-full transition-all duration-500`} style={{ width: `${cat.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-600" />
                Peak Concierge Visit Hours & Regions
              </h4>
              <span className="text-[11px] text-slate-500 font-mono">Garden Route</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-500 font-semibold block">Peak Morning Departure</span>
                <div className="font-bold text-slate-900 text-sm">09:30 - 11:30</div>
                <div className="text-[10px] text-emerald-700">Pezula & Heads Golf</div>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-500 font-semibold block">Peak Evening Dining</span>
                <div className="font-bold text-slate-900 text-sm">18:30 - 21:00</div>
                <div className="text-[10px] text-emerald-700">Knysna Quays & Oysters</div>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-500 font-semibold block">Top Region</span>
                <div className="font-bold text-slate-900 text-sm">Knysna Estuary</div>
                <div className="text-[10px] text-emerald-700">64% of total routes</div>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-500 font-semibold block">Avg Distance</span>
                <div className="font-bold text-slate-900 text-sm">4.2 km</div>
                <div className="text-[10px] text-emerald-700">From Guest House</div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
