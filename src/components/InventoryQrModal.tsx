import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  X, 
  QrCode as QrIcon, 
  Printer, 
  Download, 
  Copy, 
  Check, 
  Sparkles, 
  Package, 
  Layers, 
  Tag, 
  Building, 
  AlertTriangle, 
  CheckCircle, 
  ExternalLink, 
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck, 
  Smartphone,
  Scan,
  Camera,
  History,
  Mail,
  Plus,
  Minus,
  Star,
  Truck,
  Clock,
  Phone,
  Search
} from 'lucide-react';
import { InventoryItem, SupplierContact } from '../types';
import { INITIAL_SUPPLIERS } from '../data/initialData';

export type InventoryQrPayloadType = 'quick_scan' | 'json' | 'web_portal';

interface QrColorTheme {
  id: string;
  name: string;
  dark: string;
  light: string;
  borderClass: string;
  badgeClass: string;
}

const QR_THEMES: QrColorTheme[] = [
  { id: 'emerald', name: 'Lagoon Emerald', dark: '#064e3b', light: '#f0fdf4', borderClass: 'border-emerald-300', badgeClass: 'bg-emerald-600 text-white' },
  { id: 'slate', name: 'Midnight Slate', dark: '#0f172a', light: '#ffffff', borderClass: 'border-slate-300', badgeClass: 'bg-slate-900 text-white' },
  { id: 'azure', name: 'Ocean Azure', dark: '#0369a1', light: '#f0f9ff', borderClass: 'border-sky-300', badgeClass: 'bg-sky-600 text-white' },
  { id: 'gold', name: 'Cape Gold', dark: '#78350f', light: '#fffbeb', borderClass: 'border-amber-300', badgeClass: 'bg-amber-600 text-white' }
];

interface InventoryQrModalProps {
  items: InventoryItem[];
  allItems?: InventoryItem[];
  onClose: () => void;
  initialIndex?: number;
  initialViewMode?: 'single' | 'sheet' | 'scanner';
  onAdjustStock?: (itemId: string, delta: number, actionType?: any, notes?: string) => void;
  onOpenAuditLog?: (itemId?: string) => void;
  onOpenSupplierEmail?: (supplierName: string, item?: InventoryItem) => void;
}

export const InventoryQrModal: React.FC<InventoryQrModalProps> = ({
  items,
  allItems,
  onClose,
  initialIndex = 0,
  initialViewMode = 'single',
  onAdjustStock,
  onOpenAuditLog,
  onOpenSupplierEmail
}) => {
  const catalogPool = allItems || items;
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [activePayloadType, setActivePayloadType] = useState<InventoryQrPayloadType>('quick_scan');
  const [selectedTheme, setSelectedTheme] = useState<QrColorTheme>(QR_THEMES[0]);
  const [viewMode, setViewMode] = useState<'single' | 'sheet' | 'scanner'>(initialViewMode);

  // Scanner state
  const [scannedItemId, setScannedItemId] = useState<string>(items[initialIndex]?.id || catalogPool[0]?.id || '');
  const [scanQuery, setScanQuery] = useState('');
  const [isScanningSimulated, setIsScanningSimulated] = useState(false);
  const [scanNotice, setScanNotice] = useState<string | null>(null);
  
  // Single QR code data URL
  const [singleQrDataUrl, setSingleQrDataUrl] = useState<string>('');
  
  // Map of item id -> QR data URL for batch sheet
  const [batchQrMap, setBatchQrMap] = useState<Record<string, string>>({});
  
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const activeItem = items[currentIndex] || items[0];

  // Helper to generate payload string based on format
  const getPayloadString = (item: InventoryItem, format: InventoryQrPayloadType): string => {
    if (!item) return '';
    if (format === 'quick_scan') {
      return `TOK-INV:${item.itemCode}|${item.itemDescription.slice(0, 30)}|QTY:${item.howManyOnHand}${item.unit}|REORDER:${item.whenToReorder}|ZAR${item.pricePerUnit}|SUPPLIER:${item.supplier}`;
    }
    if (format === 'json') {
      return JSON.stringify({
        system: 'Tides of Knysna Hospitality',
        itemCode: item.itemCode,
        description: item.itemDescription,
        category: item.category,
        unit: item.unit,
        priceZar: item.pricePerUnit,
        onHand: item.howManyOnHand,
        reorderThreshold: item.whenToReorder,
        status: item.howManyOnHand <= item.whenToReorder ? 'REORDER_TRIGGERED' : 'ADEQUATE',
        supplier: item.supplier,
        lastRestocked: item.lastRestocked || null
      });
    }
    // web_portal
    return `https://tidesofknysna.co.za/portal/inventory?code=${encodeURIComponent(item.itemCode)}`;
  };

  // Generate single QR code
  useEffect(() => {
    if (!activeItem) return;
    setIsGenerating(true);
    const payload = getPayloadString(activeItem, activePayloadType);

    QRCode.toDataURL(payload, {
      width: 480,
      margin: 2,
      color: {
        dark: selectedTheme.dark,
        light: selectedTheme.light
      },
      errorCorrectionLevel: 'H'
    })
      .then(url => {
        setSingleQrDataUrl(url);
        setIsGenerating(false);
      })
      .catch(err => {
        console.error('Failed to generate single QR', err);
        setIsGenerating(false);
      });
  }, [activeItem, activePayloadType, selectedTheme]);

  // Generate batch QR sheet if viewMode === 'sheet' or multiple items
  useEffect(() => {
    if (items.length <= 1 && viewMode !== 'sheet') return;
    
    let isCancelled = false;
    const generateAll = async () => {
      const newMap: Record<string, string> = {};
      for (const item of items) {
        if (isCancelled) break;
        const payload = getPayloadString(item, activePayloadType);
        try {
          const url = await QRCode.toDataURL(payload, {
            width: 280,
            margin: 1.5,
            color: {
              dark: selectedTheme.dark,
              light: selectedTheme.light
            },
            errorCorrectionLevel: 'M'
          });
          newMap[item.id] = url;
        } catch (e) {
          console.error('Batch QR generate error', e);
        }
      }
      if (!isCancelled) {
        setBatchQrMap(newMap);
      }
    };

    generateAll();
    return () => {
      isCancelled = true;
    };
  }, [items, activePayloadType, selectedTheme, viewMode]);

  // Download Single PNG
  const handleDownloadPng = () => {
    if (!singleQrDataUrl || !activeItem) return;
    const a = document.createElement('a');
    a.href = singleQrDataUrl;
    a.download = `TOK-QR-${activeItem.itemCode}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Copy Payload text
  const handleCopyPayload = () => {
    if (!activeItem) return;
    const text = getPayloadString(activeItem, activePayloadType);
    navigator.clipboard.writeText(text);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  // Print Action
  const handlePrint = () => {
    window.print();
  };

  if (!activeItem) return null;

  const isLowStock = activeItem.howManyOnHand <= activeItem.whenToReorder;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fade-in no-print-bg overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* MODAL HEADER */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center">
              <QrIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif-luxury font-bold text-base sm:text-lg text-white">
                  Inventory QR Code Asset Tag Generator
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {items.length === 1 ? '1 Item' : `${items.length} Selected Items`}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Instant scannable 2D QR asset tags for warehouse bin labels, shelf tags & mobile stocktaking.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-slate-800 p-0.5 rounded-lg border border-slate-700 flex text-xs font-semibold mr-1">
              <button
                onClick={() => setViewMode('single')}
                className={`px-2.5 py-1 rounded-md transition ${
                  viewMode === 'single' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Single Tag
              </button>
              {items.length > 1 && (
                <button
                  onClick={() => setViewMode('sheet')}
                  className={`px-2.5 py-1 rounded-md transition ${
                    viewMode === 'sheet' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Print Sheet ({items.length})
                </button>
              )}
              <button
                onClick={() => setViewMode('scanner')}
                className={`px-2.5 py-1 rounded-md transition flex items-center gap-1.5 ${
                  viewMode === 'scanner' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Scan className="w-3.5 h-3.5 text-emerald-300" />
                QR Asset Scanner
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition"
              title="Print Asset Tags"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Print Labels</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CONTROLS SUB-HEADER */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 no-print">
          {/* Format Selector */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Data Payload:</span>
            <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200">
              <button
                onClick={() => setActivePayloadType('quick_scan')}
                className={`px-2.5 py-1 rounded-md font-semibold transition ${
                  activePayloadType === 'quick_scan'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Stocktake Scanner
              </button>
              <button
                onClick={() => setActivePayloadType('json')}
                className={`px-2.5 py-1 rounded-md font-semibold transition ${
                  activePayloadType === 'json'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Structured JSON
              </button>
              <button
                onClick={() => setActivePayloadType('web_portal')}
                className={`px-2.5 py-1 rounded-md font-semibold transition ${
                  activePayloadType === 'web_portal'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Mobile URL
              </button>
            </div>
          </div>

          {/* Theme Palette */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Tag Palette:</span>
            <div className="flex items-center gap-1.5">
              {QR_THEMES.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme)}
                  className={`w-6 h-6 rounded-full border-2 transition flex items-center justify-center ${
                    selectedTheme.id === theme.id ? 'ring-2 ring-slate-900 ring-offset-1 scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: theme.dark, borderColor: theme.light }}
                  title={theme.name}
                />
              ))}
            </div>
          </div>

          {/* Item Carousel Switcher (if in single mode & multiple items) */}
          {viewMode === 'single' && items.length > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentIndex(prev => (prev > 0 ? prev - 1 : items.length - 1))}
                className="p-1 rounded-lg border border-slate-300 hover:bg-white text-slate-600"
                title="Previous item"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-mono text-xs font-bold text-slate-700">
                {currentIndex + 1} / {items.length}
              </span>
              <button
                onClick={() => setCurrentIndex(prev => (prev < items.length - 1 ? prev + 1 : 0))}
                className="p-1 rounded-lg border border-slate-300 hover:bg-white text-slate-600"
                title="Next item"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* MODAL BODY */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
          
          {/* ========================================================================= */}
          {/* VIEW 1: SINGLE ITEM ASSET TAG VIEW                                       */}
          {/* ========================================================================= */}
          {viewMode === 'single' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Physical Asset Tag Preview */}
              <div className="md:col-span-6 flex flex-col items-center">
                <div 
                  id="printable-inventory-asset-tag"
                  className={`bg-white p-5 rounded-2xl border-2 ${selectedTheme.borderClass} shadow-lg max-w-sm w-full space-y-4 text-center transition`}
                >
                  {/* Tag Brand Banner */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div className="text-left">
                      <span className="font-serif-luxury text-xs font-bold text-slate-900 tracking-tight block">
                        Tides of Knysna
                      </span>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold block">
                        Asset & Inventory Tag
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-100 text-slate-700">
                      {activeItem.itemCode}
                    </span>
                  </div>

                  {/* QR Image Box */}
                  <div className="relative p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-center mx-auto w-52 h-52 shadow-inner">
                    {isGenerating ? (
                      <div className="flex flex-col items-center gap-2 text-xs text-slate-400">
                        <QrIcon className="w-8 h-8 animate-pulse text-emerald-600" />
                        <span>Rendering QR Code...</span>
                      </div>
                    ) : singleQrDataUrl ? (
                      <img 
                        src={singleQrDataUrl} 
                        alt={`QR Code for ${activeItem.itemCode}`}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-xs text-slate-400">No QR Code</span>
                    )}
                  </div>

                  {/* Item Description & Specs on Tag */}
                  <div className="space-y-1.5 text-left">
                    <h4 className="font-bold text-slate-900 text-xs leading-snug line-clamp-2">
                      {activeItem.itemDescription}
                    </h4>
                    <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1 border-t border-slate-100">
                      <span className="text-slate-400">Category:</span>
                      <span className="font-medium text-slate-800">{activeItem.category}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-600">
                      <span className="text-slate-400">Stock on Hand:</span>
                      <span className={`font-bold ${isLowStock ? 'text-rose-600' : 'text-emerald-700'}`}>
                        {activeItem.howManyOnHand} {activeItem.unit}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-600">
                      <span className="text-slate-400">Reorder Threshold:</span>
                      <span className="font-semibold text-slate-700">{activeItem.whenToReorder} {activeItem.unit}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-600">
                      <span className="text-slate-400">Procurement Supplier:</span>
                      <span className="text-slate-800 truncate max-w-[150px]">{activeItem.supplier}</span>
                    </div>
                  </div>

                  {/* Tag Footer */}
                  <div className="text-[9px] text-slate-400 pt-1 border-t border-dashed border-slate-200 flex items-center justify-between">
                    <span>Scan with Mobile Camera / Laser</span>
                    <span className="font-mono text-emerald-600 font-bold">TOK-2026</span>
                  </div>
                </div>

                {/* Quick actions for tag */}
                <div className="flex items-center gap-2 mt-4 w-full max-w-sm no-print">
                  <button
                    onClick={handleDownloadPng}
                    className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download PNG
                  </button>
                  <button
                    onClick={handleCopyPayload}
                    className="flex-1 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
                  >
                    {copiedPayload ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        Copied Payload!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        Copy Payload
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Right Column: Encoded Data Inspector & Scanner Simulator */}
              <div className="md:col-span-6 space-y-4">
                
                {/* Item Details Card */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-emerald-600" />
                      Live Stock Record
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isLowStock ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {isLowStock ? 'Reorder Alert Triggered' : 'Stock Level Adequate'}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-700">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Inventory ID:</span>
                      <span className="font-mono font-bold text-slate-900">{activeItem.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Official Item Code:</span>
                      <span className="font-mono font-bold text-emerald-700">{activeItem.itemCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Unit Replacement Cost:</span>
                      <span className="font-bold text-slate-900">R {activeItem.pricePerUnit} per {activeItem.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Reorder Threshold:</span>
                      <span className="font-bold text-slate-900">{activeItem.whenToReorder} {activeItem.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Current Stock Count:</span>
                      <span className="font-bold text-slate-900">{activeItem.howManyOnHand} {activeItem.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Last Replenished Date:</span>
                      <span className="font-medium text-slate-800">{activeItem.lastRestocked || 'Not recorded'}</span>
                    </div>
                  </div>
                </div>

                {/* Encoded String Inspector */}
                <div className="bg-slate-900 text-slate-200 p-4 rounded-2xl shadow-xs space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <Smartphone className="w-3.5 h-3.5" />
                      Scanner Optical Payload
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {activePayloadType.toUpperCase()}
                    </span>
                  </div>

                  <div className="p-2.5 bg-black/40 rounded-xl border border-slate-800 font-mono text-[11px] break-all leading-relaxed text-emerald-300">
                    {getPayloadString(activeItem, activePayloadType)}
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                    When scanned with a camera, mobile device, or Honeywell/Zebra warehouse scanner, this QR tag instantly reveals the item specification and triggers inventory reconciliation.
                  </p>
                </div>

                {/* Practical Shelf Mounting Instructions */}
                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 text-xs text-blue-900 space-y-1">
                  <h5 className="font-bold flex items-center gap-1.5 text-blue-800">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    Hospitality Asset Tagging Best Practice
                  </h5>
                  <p className="text-[11px] leading-relaxed text-blue-800">
                    Affix these QR labels onto storeroom shelving bins (Linens, Charlotte Rhys Toiletries, Wine Cellar Racks). Housekeeping and Butler staff scan the QR code to perform instant daily stock counts without typing item codes.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 2: MULTI-ITEM PRINTABLE ASSET SHEET VIEW                             */}
          {/* ========================================================================= */}
          {viewMode === 'sheet' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between text-xs no-print">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-slate-800">
                    Printable Shelf Label Sheet ({items.length} Asset Tags)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Ready for A4 / Letter Sticky Label Paper</span>
                  <button
                    onClick={handlePrint}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print All Tags Now
                  </button>
                </div>
              </div>

              {/* Grid of Printable QR Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {items.map(item => {
                  const qr = batchQrMap[item.id];
                  const itemIsLow = item.howManyOnHand <= item.whenToReorder;

                  return (
                    <div
                      key={item.id}
                      className="bg-white p-4 rounded-xl border border-slate-300 shadow-xs flex flex-col justify-between space-y-3 text-left print:break-inside-avoid print:border-black"
                    >
                      <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                        <div>
                          <span className="font-serif-luxury font-bold text-slate-900 text-xs block">
                            Tides of Knysna
                          </span>
                          <span className="font-mono text-[10px] font-bold text-emerald-800">
                            {item.itemCode}
                          </span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 font-medium text-slate-600 truncate max-w-[100px]">
                          {item.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-24 h-24 bg-white p-1 rounded-lg border border-slate-200 shrink-0 flex items-center justify-center">
                          {qr ? (
                            <img src={qr} alt={`QR for ${item.itemCode}`} className="w-full h-full object-contain" />
                          ) : (
                            <span className="text-[9px] text-slate-400">Loading...</span>
                          )}
                        </div>

                        <div className="space-y-1 text-[11px] flex-1">
                          <h5 className="font-bold text-slate-900 line-clamp-2 leading-snug">
                            {item.itemDescription}
                          </h5>
                          <div className="text-slate-600">
                            OnHand: <strong className={itemIsLow ? 'text-rose-600' : 'text-slate-900'}>{item.howManyOnHand} {item.unit}</strong>
                          </div>
                          <div className="text-slate-500">
                            Reorder: <strong>{item.whenToReorder} {item.unit}</strong>
                          </div>
                          <div className="text-slate-500 truncate">
                            Vendor: {item.supplier}
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-dashed border-slate-200 pt-1 text-[9px] text-slate-400 flex justify-between">
                        <span>Shelf Label ID: {item.id}</span>
                        <span className="font-bold text-slate-700">R {item.pricePerUnit}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 3: INTERACTIVE QR ASSET SCANNER & STOCKTAKE VIEW                    */}
          {/* ========================================================================= */}
          {viewMode === 'scanner' && (() => {
            const currentScanned = catalogPool.find(i => i.id === scannedItemId) || catalogPool[0];
            const matchedSupplier = currentScanned ? INITIAL_SUPPLIERS.find(s => 
              s.companyName.toLowerCase().includes(currentScanned.supplier.toLowerCase()) ||
              currentScanned.supplier.toLowerCase().includes(s.companyName.toLowerCase())
            ) || {
              companyName: currentScanned.supplier,
              contactPerson: 'Procurement Dispatch',
              telephone: '+27 44 382 5000',
              email: 'orders@vendor-supplies.co.za',
              accountNumber: 'ACC-TOK-881',
              terms: '30 Days',
              rating: 5,
              leadTimeDays: 2
            } : null;

            const isBelowReorder = currentScanned && currentScanned.howManyOnHand <= currentScanned.whenToReorder;

            const handleSimulateScan = (itemId: string) => {
              setIsScanningSimulated(true);
              setScannedItemId(itemId);
              setTimeout(() => {
                setIsScanningSimulated(false);
                setScanNotice(`Scanned & Verified tag for ${catalogPool.find(i => i.id === itemId)?.itemCode}`);
                setTimeout(() => setScanNotice(null), 3000);
              }, 400);
            };

            return (
              <div className="space-y-5">
                {/* Scanner Interface Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Left Column: Simulated Camera Viewfinder */}
                  <div className="lg:col-span-5 bg-slate-950 text-white rounded-3xl p-5 border border-slate-800 flex flex-col justify-between relative overflow-hidden shadow-2xl min-h-[360px]">
                    <div className="flex items-center justify-between text-xs z-10">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                        <Camera className="w-4 h-4" />
                        <span>HD Optical Asset Lens</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                        LIVE READY
                      </span>
                    </div>

                    {/* Viewfinder Target Graphic with Laser Scanning Line */}
                    <div className="my-auto py-6 flex flex-col items-center justify-center relative">
                      <div className="w-52 h-52 border-2 border-dashed border-emerald-500/60 rounded-2xl relative flex items-center justify-center p-3 bg-emerald-950/20 backdrop-blur-xs">
                        {/* Laser line animation */}
                        <div className="absolute inset-x-2 h-0.5 bg-emerald-400 shadow-[0_0_12px_#34d399] animate-bounce pointer-events-none" />
                        
                        {/* Corners */}
                        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-400 rounded-tl-md" />
                        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-400 rounded-tr-md" />
                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-400 rounded-bl-md" />
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-400 rounded-br-md" />

                        {singleQrDataUrl && (
                          <img
                            src={singleQrDataUrl}
                            alt="Current Target QR"
                            className="w-36 h-36 object-contain opacity-80 filter brightness-110"
                          />
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 mt-3 font-mono">
                        Target QR tag inside frame to decode
                      </span>
                    </div>

                    {/* Simulator Selector */}
                    <div className="z-10 pt-2 border-t border-slate-800/80 space-y-2">
                      <label className="text-[10px] uppercase font-bold text-slate-400 block">
                        Simulate Scanning Shelf Bin Tag:
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={scannedItemId}
                          onChange={(e) => handleSimulateScan(e.target.value)}
                          className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                        >
                          {catalogPool.map(i => (
                            <option key={i.id} value={i.id}>
                              [{i.itemCode}] {i.itemDescription} ({i.howManyOnHand} {i.unit})
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleSimulateScan(scannedItemId)}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-sm transition shrink-0"
                        >
                          <Scan className="w-3.5 h-3.5" />
                          Scan
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Decoded Asset Card & Action Controls */}
                  {currentScanned && (
                    <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-5 space-y-4 shadow-sm flex flex-col justify-between">
                      {/* Scan feedback notice */}
                      {scanNotice && (
                        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between animate-fade-in">
                          <span className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                            {scanNotice}
                          </span>
                        </div>
                      )}

                      <div>
                        {/* Tag Header */}
                        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-base font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                                {currentScanned.itemCode}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                {currentScanned.category}
                              </span>
                            </div>
                            <h4 className="font-serif-luxury font-bold text-slate-900 text-base mt-1.5">
                              {currentScanned.itemDescription}
                            </h4>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Rate Per Unit</span>
                            <span className="text-sm font-bold text-emerald-700 font-mono">
                              R {currentScanned.pricePerUnit} / {currentScanned.unit}
                            </span>
                          </div>
                        </div>

                        {/* Stock Status Bar */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-3">
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">On Hand Stock</span>
                            <div className="text-lg font-bold text-slate-900 font-mono mt-0.5">
                              {currentScanned.howManyOnHand} {currentScanned.unit}
                            </div>
                          </div>

                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Reorder Threshold</span>
                            <div className="text-lg font-bold text-amber-700 font-mono mt-0.5">
                              {currentScanned.whenToReorder} {currentScanned.unit}
                            </div>
                          </div>

                          <div className={`p-3 rounded-xl border col-span-2 sm:col-span-1 ${
                            isBelowReorder ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          }`}>
                            <span className="text-[10px] uppercase font-bold opacity-70 block">Safety State</span>
                            <div className="text-xs font-bold mt-1 flex items-center gap-1">
                              {isBelowReorder ? (
                                <>
                                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                                  Deficit: Reorder Needed
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                  Buffer Adequate
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Matched Supplier Database Info with 5-Star Rating & Lead Time */}
                        {matchedSupplier && (
                          <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200 space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                                <Truck className="w-3.5 h-3.5 text-indigo-600" />
                                {matchedSupplier.companyName}
                              </span>
                              {/* 5-Star Rating System */}
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3.5 h-3.5 ${
                                      i < (matchedSupplier.rating || 5)
                                        ? 'text-amber-400 fill-amber-400'
                                        : 'text-slate-200'
                                    }`}
                                  />
                                ))}
                                <span className="font-bold text-amber-800 text-[10px] ml-1">
                                  {matchedSupplier.rating || 5}.0
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-600 pt-1 border-t border-slate-200/60">
                              <div>
                                <span className="text-slate-400 block">Contact Rep:</span>
                                <strong className="text-slate-800">{matchedSupplier.contactPerson}</strong>
                              </div>
                              <div>
                                <span className="text-slate-400 block">Average Delivery Time:</span>
                                <strong className="text-slate-800 flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-blue-500" />
                                  {matchedSupplier.leadTimeDays || 2} Business Days
                                </strong>
                              </div>
                              <div>
                                <span className="text-slate-400 block">Vendor Account:</span>
                                <strong className="text-emerald-700 font-mono">{matchedSupplier.accountNumber}</strong>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* AUTOMATED PRE-FILLED SUPPLIER EMAIL TRIGGER BANNER */}
                        {isBelowReorder && matchedSupplier && (
                          <div className="p-3.5 bg-gradient-to-r from-rose-50 via-amber-50 to-orange-50 rounded-2xl border border-rose-200 text-xs space-y-2 mt-3 animate-fade-in">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-rose-900 flex items-center gap-1.5">
                                <AlertTriangle className="w-4 h-4 text-rose-600 animate-pulse" />
                                Automated Reorder Level Trigger Activated
                              </span>
                              <span className="text-[10px] bg-rose-600 text-white font-bold px-2 py-0.5 rounded-full">
                                Threshold Crossed
                              </span>
                            </div>
                            <p className="text-[11px] text-rose-800 leading-relaxed">
                              On-hand quantity ({currentScanned.howManyOnHand}) is at or below the reorder point ({currentScanned.whenToReorder}). A draft procurement email has been prepared with {matchedSupplier.companyName}'s details ({matchedSupplier.email}).
                            </p>
                            {onOpenSupplierEmail && (
                              <button
                                onClick={() => onOpenSupplierEmail(matchedSupplier.companyName, currentScanned)}
                                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition"
                              >
                                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                                Review & Trigger Pre-filled Draft Email to Supplier &rarr;
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* QUICK ADJUSTMENT & AUDIT LOG BUTTONS */}
                      <div className="pt-3 border-t border-slate-100 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                            Quick Stocktake Actions:
                          </span>
                          {onOpenAuditLog && (
                            <button
                              onClick={() => onOpenAuditLog(currentScanned.id)}
                              className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 text-[11px]"
                            >
                              <History className="w-3 h-3" />
                              View Stock Audit Log for this Item
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => onAdjustStock && onAdjustStock(currentScanned.id, -1, 'QR Scan Adjustment', 'Guest unit consumption via QR asset scanner')}
                            className="py-2.5 px-3 bg-slate-100 hover:bg-rose-100 hover:text-rose-700 text-slate-800 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 border border-slate-200"
                          >
                            <Minus className="w-3.5 h-3.5" />
                            -1 Consumed
                          </button>

                          <button
                            onClick={() => onAdjustStock && onAdjustStock(currentScanned.id, 1, 'QR Scan Adjustment', 'Single unit restock via QR asset scanner')}
                            className="py-2.5 px-3 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-700 text-slate-800 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 border border-slate-200"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            +1 Restocked
                          </button>

                          <button
                            onClick={() => onAdjustStock && onAdjustStock(currentScanned.id, 10, 'QR Scan Adjustment', 'Batch shelf replenishment (+10) via QR asset scanner')}
                            className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-sm"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            +10 Batch
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>

        {/* MODAL FOOTER */}
        <div className="bg-slate-100 border-t border-slate-200 p-4 px-6 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 no-print">
          <div className="flex items-center gap-2 text-slate-500">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Compatible with standard optical smartphone cameras & Bluetooth 2D barcode scanners.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-200 text-slate-700 font-bold rounded-xl border border-slate-300 transition"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition"
            >
              <Printer className="w-3.5 h-3.5" />
              Print QR Tags
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
