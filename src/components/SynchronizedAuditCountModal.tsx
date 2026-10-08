import React, { useState, useMemo } from 'react';
import {
  X,
  ClipboardCheck,
  Printer,
  Download,
  QrCode as QrIcon,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Plus,
  Minus,
  Check,
  FileSpreadsheet,
  Layers,
  Scale,
  Sparkles,
  Search,
  Lock,
  Unlock,
  Building2,
  MapPin
} from 'lucide-react';
import { InventoryItem } from '../types';

interface AuditItemCountState {
  itemId: string;
  itemCode: string;
  itemDescription: string;
  category: string;
  location: string;
  unitPrice: number;
  systemOnHand: number;
  physicalCount: number;
  notes: string;
}

interface SynchronizedAuditCountModalProps {
  isOpen: boolean;
  selectedItems: InventoryItem[];
  onClose: () => void;
  onApplyAuditCounts: (
    counts: {
      itemId: string;
      physicalCount: number;
      difference: number;
      unitPrice: number;
      notes: string;
    }[],
    auditReason: string,
    auditorName: string
  ) => void;
  onOpenQrScanner?: (item?: InventoryItem) => void;
  currentUser?: { fullName: string; role: string } | null;
}

const AUDIT_REASONS = [
  'End-of-Month Physical Stocktake',
  'Quarterly Financial Inventory Audit',
  'Weekly Housekeeping Linen & Towel Count',
  'Daily Fynbos Amenities Reconciliation',
  'Minibar & Beverage Cellar Spot Check',
  'Maintenance & Cleaning Chemical Audit',
  'Discrepancy Investigation & Shrinkage Write-off',
  'Annual Comprehensive Estate Asset Verification'
];

export const SynchronizedAuditCountModal: React.FC<SynchronizedAuditCountModalProps> = ({
  isOpen,
  selectedItems,
  onClose,
  onApplyAuditCounts,
  onOpenQrScanner,
  currentUser
}) => {
  // Initialize physical counts initialized to current system counts
  const [counts, setCounts] = useState<Record<string, { physicalCount: number; notes: string }>>(() => {
    const initial: Record<string, { physicalCount: number; notes: string }> = {};
    selectedItems.forEach((item) => {
      initial[item.id] = {
        physicalCount: item.howManyOnHand,
        notes: ''
      };
    });
    return initial;
  });

  const [auditorName, setAuditorName] = useState(
    currentUser ? `${currentUser.fullName} (${currentUser.role})` : 'Eleanor Sterling (Head of Operations)'
  );
  const [auditReason, setAuditReason] = useState(AUDIT_REASONS[0]);
  const [searchFilter, setSearchFilter] = useState('');
  const [filterDiscrepancyOnly, setFilterDiscrepancyOnly] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen || selectedItems.length === 0) return null;

  // Build mapped audit rows
  const auditRows: AuditItemCountState[] = selectedItems.map((item) => {
    const currentEntry = counts[item.id] || { physicalCount: item.howManyOnHand, notes: '' };
    return {
      itemId: item.id,
      itemCode: item.itemCode,
      itemDescription: item.itemDescription,
      category: item.category,
      location: item.location || 'General Stores',
      unitPrice: item.pricePerUnit || 0,
      systemOnHand: item.howManyOnHand,
      physicalCount: currentEntry.physicalCount,
      notes: currentEntry.notes
    };
  });

  // Filtered rows for viewing
  const filteredRows = auditRows.filter((row) => {
    const matchesSearch =
      !searchFilter ||
      row.itemCode.toLowerCase().includes(searchFilter.toLowerCase()) ||
      row.itemDescription.toLowerCase().includes(searchFilter.toLowerCase()) ||
      row.location.toLowerCase().includes(searchFilter.toLowerCase()) ||
      row.category.toLowerCase().includes(searchFilter.toLowerCase());

    const diff = row.physicalCount - row.systemOnHand;
    const matchesDiscrepancy = !filterDiscrepancyOnly || diff !== 0;

    return matchesSearch && matchesDiscrepancy;
  });

  // Aggregated Audit KPIs
  const totalSystemUnits = auditRows.reduce((sum, r) => sum + r.systemOnHand, 0);
  const totalPhysicalUnits = auditRows.reduce((sum, r) => sum + r.physicalCount, 0);
  const netUnitDifference = totalPhysicalUnits - totalSystemUnits;

  let totalFinancialVariance = 0;
  let surplusItemCount = 0;
  let shortageItemCount = 0;
  let balancedItemCount = 0;

  auditRows.forEach((r) => {
    const diff = r.physicalCount - r.systemOnHand;
    totalFinancialVariance += diff * r.unitPrice;
    if (diff > 0) surplusItemCount++;
    else if (diff < 0) shortageItemCount++;
    else balancedItemCount++;
  });

  // Count Adjustment Helpers
  const handleUpdatePhysicalCount = (itemId: string, newCount: number) => {
    const safeCount = Math.max(0, Math.floor(newCount || 0));
    setCounts((prev) => ({
      ...prev,
      [itemId]: {
        ...(prev[itemId] || { notes: '' }),
        physicalCount: safeCount
      }
    }));
  };

  const handleUpdateNotes = (itemId: string, notes: string) => {
    setCounts((prev) => ({
      ...prev,
      [itemId]: {
        ...(prev[itemId] || { physicalCount: 0 }),
        notes
      }
    }));
  };

  const handleMatchAllToSystem = () => {
    const updated: Record<string, { physicalCount: number; notes: string }> = {};
    selectedItems.forEach((item) => {
      updated[item.id] = {
        physicalCount: item.howManyOnHand,
        notes: counts[item.id]?.notes || 'Physical verification confirmed equal to system on-hand'
      };
    });
    setCounts(updated);
    setToastMessage('Reset all physical counts to match system inventory values.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleZeroOutAll = () => {
    const updated: Record<string, { physicalCount: number; notes: string }> = {};
    selectedItems.forEach((item) => {
      updated[item.id] = {
        physicalCount: 0,
        notes: counts[item.id]?.notes || 'Physical recount pending'
      };
    });
    setCounts(updated);
  };

  // Commit and Synchronize all items
  const handleCommitAudit = () => {
    setIsApplying(true);

    const payload = auditRows.map((row) => ({
      itemId: row.itemId,
      physicalCount: row.physicalCount,
      difference: row.physicalCount - row.systemOnHand,
      unitPrice: row.unitPrice,
      notes: row.notes || (row.physicalCount === row.systemOnHand ? 'Physical count verified equal' : 'Synchronized audit discrepancy adjusted')
    }));

    setTimeout(() => {
      onApplyAuditCounts(payload, auditReason, auditorName);
      setIsApplying(false);
      onClose();
    }, 400);
  };

  // Export CSV Variance Sheet
  const handleExportCsvVariance = () => {
    const headers = [
      'Item Code',
      'Description',
      'Category',
      'Location',
      'Unit Cost (ZAR)',
      'System Stock',
      'Physical Count',
      'Variance (Units)',
      'Variance Status',
      'Financial Impact (ZAR)',
      'Auditor Notes'
    ];

    const rows = auditRows.map((r) => {
      const diff = r.physicalCount - r.systemOnHand;
      const status = diff === 0 ? 'BALANCED' : diff > 0 ? 'SURPLUS' : 'SHORTAGE';
      const financialImpact = diff * r.unitPrice;
      return [
        `"${r.itemCode}"`,
        `"${r.itemDescription.replace(/"/g, '""')}"`,
        `"${r.category}"`,
        `"${r.location}"`,
        r.unitPrice.toFixed(2),
        r.systemOnHand,
        r.physicalCount,
        diff > 0 ? `+${diff}` : diff,
        status,
        financialImpact.toFixed(2),
        `"${(r.notes || '').replace(/"/g, '""')}"`
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Tides_Knysna_Synchronized_Audit_Count_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setToastMessage('Exported Synchronized Audit Variance CSV successfully!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Universal Printing formatted for any laser/inkjet printer
  const handlePrintAuditSheet = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-4">
        {/* MODAL HEADER */}
        <div className="p-5 md:p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 no-print">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 flex items-center justify-center shadow-inner">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest font-bold px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  Bulk Stocktake Protocol
                </span>
                <span className="text-xs text-slate-300 font-bold">
                  {selectedItems.length} Items Selected
                </span>
              </div>
              <h2 className="text-lg md:text-xl font-bold font-serif-luxury text-white">
                Synchronized Audit Count & Variance Reconciler
              </h2>
              <p className="text-xs text-slate-300">
                Record physical vs system counts simultaneously, detect shortages/surpluses, and adjust stock in one synchronized batch.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenQrScanner && (
              <button
                type="button"
                onClick={() => onOpenQrScanner(selectedItems[0])}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition"
                title="Launch QR Asset Scanner for rapid barcode scanning during audit"
              >
                <QrIcon className="w-3.5 h-3.5" />
                QR Asset Scanner
              </button>
            )}

            <button
              type="button"
              onClick={handlePrintAuditSheet}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 border border-slate-700 transition"
              title="Print full physical audit sheet to any laser or inkjet printer"
            >
              <Printer className="w-3.5 h-3.5 text-indigo-400" />
              Print Sheet
            </button>

            <button
              type="button"
              onClick={handleExportCsvVariance}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 border border-slate-700 transition"
              title="Download variance report CSV"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              Export CSV
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE HEADER (Visible only when printing) */}
        <div className="hidden print:block p-6 border-b border-slate-300">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold font-serif-luxury text-slate-900">Tides of Knysna Luxury Guest House</h1>
              <p className="text-xs text-slate-600">Official Physical Stocktake & Synchronized Audit Variance Document</p>
              <div className="text-xs text-slate-700 mt-2">
                <span><strong>Audit Reason:</strong> {auditReason}</span> • <span><strong>Auditor:</strong> {auditorName}</span> • <span><strong>Date:</strong> {new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
            <div className="text-right text-xs">
              <div className="font-mono font-bold">BATCH REF: AUD-{Date.now().toString().slice(-6)}</div>
              <div>Items Counted: {selectedItems.length}</div>
              <div>Net Variance: {netUnitDifference > 0 ? `+${netUnitDifference}` : netUnitDifference} units</div>
            </div>
          </div>
        </div>

        {/* TOAST ALERT */}
        {toastMessage && (
          <div className="p-3 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between no-print">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              {toastMessage}
            </span>
            <button onClick={() => setToastMessage(null)} className="text-emerald-700 hover:text-emerald-950 font-bold">✕</button>
          </div>
        )}

        {/* AUDIT SUMMARY KPI RIBBON */}
        <div className="p-4 md:p-5 bg-slate-50 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs no-print">
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">System Expected</span>
            <div className="text-lg font-black text-slate-800 font-mono">{totalSystemUnits}</div>
            <span className="text-[10px] text-slate-500">Calculated On-Hand</span>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Physical Counted</span>
            <div className="text-lg font-black text-indigo-700 font-mono">{totalPhysicalUnits}</div>
            <span className="text-[10px] text-slate-500">Actual Units Verified</span>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Net Difference</span>
            <div className={`text-lg font-black font-mono flex items-center gap-1 ${
              netUnitDifference === 0 ? 'text-emerald-600' : netUnitDifference > 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}>
              {netUnitDifference > 0 ? `+${netUnitDifference}` : netUnitDifference}
              <span className="text-xs font-normal text-slate-500">units</span>
            </div>
            <span className="text-[10px] text-slate-500">
              {netUnitDifference === 0 ? '100% Balanced' : netUnitDifference > 0 ? 'Net Surplus' : 'Net Shortage (Shrinkage)'}
            </span>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Financial Variance</span>
            <div className={`text-lg font-black font-mono ${
              totalFinancialVariance === 0 ? 'text-emerald-600' : totalFinancialVariance > 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}>
              {totalFinancialVariance < 0 ? '-' : '+'}R {Math.abs(totalFinancialVariance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-slate-500">ZAR Balance Impact</span>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Variance Status</span>
            <div className="flex items-center gap-1.5 text-xs font-bold pt-0.5">
              <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px]">{balancedItemCount} Ok</span>
              <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px]">{surplusItemCount} +</span>
              <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px]">{shortageItemCount} -</span>
            </div>
            <span className="text-[10px] text-slate-400 block truncate">
              {shortageItemCount > 0 ? `⚠️ ${shortageItemCount} items below system` : 'All items accounted'}
            </span>
          </div>
        </div>

        {/* AUDIT PARAMETERS & QUICK ACTIONS BAR */}
        <div className="p-4 bg-slate-100/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs no-print">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-bold text-[11px]">Audit Reason:</span>
              <select
                value={auditReason}
                onChange={(e) => setAuditReason(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl font-medium text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {AUDIT_REASONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-bold text-[11px]">Auditor:</span>
              <input
                type="text"
                value={auditorName}
                onChange={(e) => setAuditorName(e.target.value)}
                placeholder="Auditor staff name"
                className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl font-medium text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 w-48"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleMatchAllToSystem}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-300 transition shadow-2xs flex items-center gap-1"
              title="Fast fill: Set all physical counts to match current system on-hand"
            >
              <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
              Match All to System
            </button>

            <button
              type="button"
              onClick={handleZeroOutAll}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-300 transition shadow-2xs text-[11px]"
              title="Reset all physical count fields to zero"
            >
              Zero Out
            </button>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter selected..."
                className="pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs w-36 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <label className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-slate-700 cursor-pointer text-[11px] font-semibold">
              <input
                type="checkbox"
                checked={filterDiscrepancyOnly}
                onChange={(e) => setFilterDiscrepancyOnly(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span>Discrepancies Only</span>
            </label>
          </div>
        </div>

        {/* COMPARISON TABLE */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-900 text-white uppercase text-[10px] tracking-wider sticky top-0 z-10">
              <tr>
                <th className="px-3 py-2.5 rounded-l-lg">Item Code</th>
                <th className="px-3 py-2.5">Description & Location</th>
                <th className="px-3 py-2.5 text-right">Unit Price</th>
                <th className="px-3 py-2.5 text-center">System On-Hand</th>
                <th className="px-3 py-2.5 text-center min-w-[160px]">Physical Count</th>
                <th className="px-3 py-2.5 text-center">Difference</th>
                <th className="px-3 py-2.5 text-right">Value Impact</th>
                <th className="px-3 py-2.5 min-w-[180px] rounded-r-lg">Auditor Observation / Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredRows.map((row) => {
                const diff = row.physicalCount - row.systemOnHand;
                const valueDiff = diff * row.unitPrice;
                const isShortage = diff < 0;
                const isSurplus = diff > 0;
                const isBalanced = diff === 0;

                return (
                  <tr
                    key={row.itemId}
                    className={`hover:bg-slate-50/80 transition ${
                      isShortage ? 'bg-rose-50/30' : isSurplus ? 'bg-blue-50/20' : ''
                    }`}
                  >
                    {/* Item Code & QR */}
                    <td className="px-3 py-3 align-top font-mono font-bold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <span>{row.itemCode}</span>
                        {onOpenQrScanner && (
                          <button
                            type="button"
                            onClick={() => {
                              const found = selectedItems.find((i) => i.id === row.itemId);
                              if (found) onOpenQrScanner(found);
                            }}
                            className="p-1 text-slate-400 hover:text-indigo-600 rounded transition no-print"
                            title={`Scan or view QR code for ${row.itemCode}`}
                          >
                            <QrIcon className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <span className="text-[10px] font-normal text-slate-400 block">{row.category}</span>
                    </td>

                    {/* Description & Location */}
                    <td className="px-3 py-3 align-top">
                      <div className="font-semibold text-slate-800 line-clamp-2">{row.itemDescription}</div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{row.location}</span>
                      </div>
                    </td>

                    {/* Unit Price */}
                    <td className="px-3 py-3 align-top text-right font-mono text-slate-600">
                      R {row.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>

                    {/* System On-Hand */}
                    <td className="px-3 py-3 align-top text-center font-mono font-bold text-slate-700 bg-slate-50/60">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-200/70 text-slate-800 text-xs">
                        {row.systemOnHand}
                      </span>
                    </td>

                    {/* Physical Count with Stepper Buttons */}
                    <td className="px-3 py-2 align-top text-center">
                      <div className="flex items-center justify-center gap-1 no-print">
                        <button
                          type="button"
                          onClick={() => handleUpdatePhysicalCount(row.itemId, row.physicalCount - 1)}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition border border-slate-300"
                          title="Decrease 1"
                        >
                          <Minus className="w-3 h-3" />
                        </button>

                        <input
                          type="number"
                          min="0"
                          value={row.physicalCount}
                          onChange={(e) => handleUpdatePhysicalCount(row.itemId, parseInt(e.target.value, 10) || 0)}
                          className={`w-16 text-center font-mono font-black text-sm py-1 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 ${
                            isShortage
                              ? 'border-rose-400 bg-rose-50 text-rose-900'
                              : isSurplus
                              ? 'border-blue-400 bg-blue-50 text-blue-900'
                              : 'border-emerald-400 bg-emerald-50 text-emerald-900'
                          }`}
                        />

                        <button
                          type="button"
                          onClick={() => handleUpdatePhysicalCount(row.itemId, row.physicalCount + 1)}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition border border-slate-300"
                          title="Increase 1"
                        >
                          <Plus className="w-3 h-3" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleUpdatePhysicalCount(row.itemId, row.systemOnHand)}
                          className="p-1 text-[10px] font-bold text-slate-400 hover:text-indigo-600 rounded"
                          title="Set to match system"
                        >
                          =
                        </button>
                      </div>

                      {/* Print-only physical count representation */}
                      <div className="hidden print:block font-mono font-bold text-sm">
                        {row.physicalCount}
                      </div>
                    </td>

                    {/* Difference */}
                    <td className="px-3 py-3 align-top text-center font-mono">
                      {isBalanced ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold inline-flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600" /> 0 (Match)
                        </span>
                      ) : isSurplus ? (
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold">
                          +{diff} Surplus
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px] font-bold">
                          {diff} Shortage
                        </span>
                      )}
                    </td>

                    {/* Financial Value Impact */}
                    <td className={`px-3 py-3 align-top text-right font-mono font-bold ${
                      isBalanced ? 'text-slate-400' : isSurplus ? 'text-blue-700' : 'text-rose-700'
                    }`}>
                      {valueDiff < 0 ? '-' : valueDiff > 0 ? '+' : ''}R {Math.abs(valueDiff).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Auditor Notes */}
                    <td className="px-3 py-2 align-top">
                      <input
                        type="text"
                        value={row.notes}
                        onChange={(e) => handleUpdateNotes(row.itemId, e.target.value)}
                        placeholder={
                          isShortage
                            ? 'Reason (e.g. 2 damaged, guest consumption)'
                            : isSurplus
                            ? 'Reason (e.g. Extra box found in cellar)'
                            : 'Physical condition verified ok'
                        }
                        className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 bg-white placeholder:text-slate-400"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredRows.length === 0 && (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Scale className="w-8 h-8 mx-auto text-slate-300" />
              <p className="font-semibold text-slate-600">No inventory items matched your filter criteria.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchFilter('');
                  setFilterDiscrepancyOnly(false);
                }}
                className="text-xs text-indigo-600 hover:underline"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 md:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 no-print">
          <div className="text-xs text-slate-600 space-y-0.5">
            <div>
              Ready to adjust <strong>{selectedItems.length}</strong> inventory records simultaneously under <strong>"{auditReason}"</strong>.
            </div>
            <div className="text-[11px] text-slate-500">
              Each adjustment automatically records detailed audit history logs with physical variance & financial impact.
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isApplying}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleCommitAudit}
              disabled={isApplying}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 hover:from-indigo-600 hover:to-indigo-700 text-white font-extrabold rounded-xl text-xs transition shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>
                {isApplying ? 'Applying Synchronized Audit...' : `Commit & Synchronize Audit (${selectedItems.length} Items)`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
