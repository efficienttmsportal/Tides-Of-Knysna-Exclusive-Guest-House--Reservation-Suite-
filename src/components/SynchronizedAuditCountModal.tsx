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
    auditorName: string,
    generalComment?: string
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

  const [auditedIds, setAuditedIds] = useState<Set<string>>(() => new Set());
  const [auditorName, setAuditorName] = useState(
    currentUser ? `${currentUser.fullName} (${currentUser.role})` : 'Eleanor Sterling (Head of Operations)'
  );
  const [auditReason, setAuditReason] = useState(AUDIT_REASONS[0]);
  const [searchFilter, setSearchFilter] = useState('');
  const [filterDiscrepancyOnly, setFilterDiscrepancyOnly] = useState(false);
  const [generalComment, setGeneralComment] = useState('');
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);
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

  // Aggregated Audit KPIs & Progress
  const totalSystemUnits = auditRows.reduce((sum, r) => sum + r.systemOnHand, 0);
  const totalPhysicalUnits = auditRows.reduce((sum, r) => sum + r.physicalCount, 0);
  const netUnitDifference = totalPhysicalUnits - totalSystemUnits;
  const auditedCount = auditedIds.size;
  const auditProgressPercent = selectedItems.length > 0 ? Math.min(100, Math.round((auditedCount / selectedItems.length) * 100)) : 0;

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

  // Count Adjustment & Audit Tracking Helpers
  const handleUpdatePhysicalCount = (itemId: string, newCount: number) => {
    const safeCount = Math.max(0, Math.floor(newCount || 0));
    setCounts((prev) => ({
      ...prev,
      [itemId]: {
        ...(prev[itemId] || { notes: '' }),
        physicalCount: safeCount
      }
    }));
    setAuditedIds((prev) => {
      const next = new Set(prev);
      next.add(itemId);
      return next;
    });
  };

  const handleToggleAudited = (itemId: string) => {
    setAuditedIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const handleMarkAllAudited = () => {
    const all = new Set<string>();
    selectedItems.forEach((i) => all.add(i.id));
    setAuditedIds(all);
    setToastMessage('Marked all batch items as audited.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleClearAudited = () => {
    setAuditedIds(new Set());
    setToastMessage('Cleared audit progress tracking.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleUpdateNotes = (itemId: string, notes: string) => {
    setCounts((prev) => ({
      ...prev,
      [itemId]: {
        ...(prev[itemId] || { physicalCount: 0 }),
        notes
      }
    }));
    setAuditedIds((prev) => {
      const next = new Set(prev);
      next.add(itemId);
      return next;
    });
  };

  const handleMatchAllToSystem = () => {
    const updated: Record<string, { physicalCount: number; notes: string }> = {};
    const all = new Set<string>();
    selectedItems.forEach((item) => {
      updated[item.id] = {
        physicalCount: item.howManyOnHand,
        notes: counts[item.id]?.notes || 'Physical verification confirmed equal to system on-hand'
      };
      all.add(item.id);
    });
    setCounts(updated);
    setAuditedIds(all);
    setToastMessage('Reset all physical counts to match system inventory values and marked as audited.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleZeroOutAll = () => {
    const updated: Record<string, { physicalCount: number; notes: string }> = {};
    const all = new Set<string>();
    selectedItems.forEach((item) => {
      updated[item.id] = {
        physicalCount: 0,
        notes: counts[item.id]?.notes || 'Physical recount pending'
      };
      all.add(item.id);
    });
    setCounts(updated);
    setAuditedIds(all);
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
      onApplyAuditCounts(payload, auditReason, auditorName, generalComment);
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
              onClick={() => setIsPrintPreviewOpen(true)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition"
              title="Open Print Preview Mode in Landscape format with company branding and Export PDF"
            >
              <Printer className="w-3.5 h-3.5 text-white" />
              Print Preview
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
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
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
                className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl font-medium text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 w-40"
              />
            </div>

            <div className="flex items-center gap-1.5 flex-1 min-w-[240px]">
              <span className="text-slate-500 font-bold text-[11px] shrink-0">General Comment / Code:</span>
              <input
                type="text"
                value={generalComment}
                onChange={(e) => setGeneralComment(e.target.value)}
                placeholder="Applicable to all audited items..."
                className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl font-medium text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 w-full"
              />
            </div>

            <button
              type="button"
              onClick={() => setIsTutorialOpen(true)}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl border border-emerald-300 transition flex items-center gap-1.5 shadow-2xs text-[11px] shrink-0"
              title="View QR Scanner & Barcode Audit Tutorial"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>QR Scanner Tutorial</span>
            </button>
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

        {/* VISUAL PROGRESS BAR & QR ASSET TAG TRACKING */}
        <div className="bg-indigo-50/70 border-b border-indigo-100 p-4 no-print">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs font-mono font-bold text-sm">
                {auditProgressPercent}%
              </div>
              <div className="flex-1 min-w-[220px]">
                <div className="flex justify-between items-center text-xs font-bold text-slate-800 mb-1">
                  <span className="flex items-center gap-1.5">
                    <QrIcon className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Batch Audit Progress (QR Asset Tags Verified)</span>
                  </span>
                  <span className="text-indigo-700 font-mono">
                    {auditedCount} / {selectedItems.length} Audited ({auditProgressPercent}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="bg-gradient-to-r from-indigo-600 to-emerald-500 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${auditProgressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleMarkAllAudited}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-xs transition flex items-center gap-1"
                title="Mark all items in this batch as audited"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Mark All Audited</span>
              </button>
              <button
                type="button"
                onClick={handleClearAudited}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-xl border border-slate-300 text-xs transition"
                title="Reset audited status for all items"
              >
                Reset Progress
              </button>
            </div>
          </div>
        </div>

        {/* COMPARISON TABLE */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-900 text-white uppercase text-[10px] tracking-wider sticky top-0 z-10">
              <tr>
                <th className="px-3 py-2.5 rounded-l-lg text-center w-14">Audited</th>
                <th className="px-3 py-2.5">Item Code & QR Tag</th>
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
                const isAudited = auditedIds.has(row.itemId);

                return (
                  <tr
                    key={row.itemId}
                    className={`hover:bg-slate-50/80 transition ${
                      isShortage ? 'bg-rose-50/30' : isSurplus ? 'bg-blue-50/20' : isAudited ? 'bg-emerald-50/20' : ''
                    }`}
                  >
                    {/* Audited Checkbox / Status */}
                    <td className="px-3 py-3 align-middle text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleAudited(row.itemId)}
                        className={`w-6 h-6 rounded-lg border flex items-center justify-center transition mx-auto cursor-pointer ${
                          isAudited
                            ? 'bg-emerald-600 border-emerald-700 text-white shadow-xs'
                            : 'bg-white border-slate-300 text-slate-300 hover:border-slate-400'
                        }`}
                        title={isAudited ? 'Marked as Audited (Click to unmark)' : 'Click to mark as Audited'}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </td>

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

        {/* QR SCANNER & BARCODE AUDIT TUTORIAL MODAL */}
        {isTutorialOpen && (
          <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in no-print">
            <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
              <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white p-5 flex items-center justify-between border-b border-emerald-900/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-serif-luxury font-bold text-base text-white">
                      QR Scanner & Barcode Audit Tutorial
                    </h4>
                    <p className="text-xs text-emerald-200/80">
                      Step-by-step guide for rapid physical stocktaking using QR asset tags.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsTutorialOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs text-slate-700 overflow-y-auto max-h-[70vh]">
                <div className="flex items-start gap-3.5 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">1</span>
                  <div>
                    <strong className="text-slate-900 block font-bold mb-0.5">Launch QR Asset Scanner</strong>
                    <p className="text-slate-600">
                      Click the "QR Asset Scanner" button in the Inventory Matrix batch toolbar or the top bar of this Synchronized Audit Modal to open the camera scanner interface.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">2</span>
                  <div>
                    <strong className="text-slate-900 block font-bold mb-0.5">Scan Asset Barcodes & Tags</strong>
                    <p className="text-slate-600">
                      Point your device camera at any asset tag or barcode (e.g. LIN-1001 for Egyptian Cotton Sheets). The system instantly matches and highlights the target SKU.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">3</span>
                  <div>
                    <strong className="text-slate-900 block font-bold mb-0.5">Verify Physical Bin Counts</strong>
                    <p className="text-slate-600">
                      Input actual physical stock counted on warehouse shelves. The system automatically computes variances, surpluses, shortages, and financial impact in ZAR.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">4</span>
                  <div>
                    <strong className="text-slate-900 block font-bold mb-0.5">Commit & Audit Trail Logging</strong>
                    <p className="text-slate-600">
                      Apply any general comment or reason code, then click "Commit & Synchronize Audit" to permanently update inventory and log the audit entry with full accountability.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setIsTutorialOpen(false)}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition shadow-md"
                >
                  Got It, Close Tutorial
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PRINT PREVIEW LANDSCAPE MODAL */}
        {isPrintPreviewOpen && (
          <div className="fixed inset-0 z-70 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6 animate-fade-in no-print">
            <style>{`
              @media print {
                @page { size: landscape; margin: 10mm; }
                body * { visibility: hidden; }
                #print-preview-container, #print-preview-container * { visibility: visible; }
                #print-preview-container { position: absolute; left: 0; top: 0; width: 100%; }
              }
            `}</style>
            <div id="print-preview-container" className="bg-white rounded-3xl max-w-7xl w-full max-h-[96vh] flex flex-col shadow-2xl border border-slate-300 overflow-hidden">
              {/* Preview Header Bar */}
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 no-print">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
                    <Printer className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Synchronized Audit Count — Landscape Print Preview</h3>
                    <p className="text-[11px] text-slate-400">Formatted for professional PDF export and landscape printing.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export PDF / Print Landscape</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPrintPreviewOpen(false)}
                    className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Printable Landscape Content */}
              <div className="p-8 overflow-y-auto space-y-6 bg-slate-50 print:bg-white print:p-4 text-slate-900 max-h-[82vh]">
                {/* Branding & Document Header */}
                <div className="border-b-2 border-slate-900 pb-6 flex flex-wrap justify-between items-start gap-4">
                  <div>
                    <h1 className="text-2xl font-bold font-serif-luxury text-slate-900 tracking-tight">
                      TIDES OF KNYSNA EXCLUSIVE GUEST HOUSE
                    </h1>
                    <p className="text-xs text-slate-600 font-medium uppercase tracking-wider mt-0.5">
                      Official Synchronized Physical Stocktake & Variance Reconciliation Report (Landscape Edition)
                    </p>
                    <div className="text-xs text-slate-700 mt-3 space-y-0.5">
                      <div><strong>Audit Reason:</strong> {auditReason}</div>
                      <div><strong>Lead Auditor:</strong> {auditorName}</div>
                      {generalComment && <div><strong>General Note:</strong> {generalComment}</div>}
                    </div>
                  </div>

                  <div className="text-right text-xs bg-slate-100 print:bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <div className="font-mono font-bold text-slate-900">BATCH REF: AUD-{Date.now().toString().slice(-6)}</div>
                    <div>Generated: {new Date().toLocaleDateString('en-ZA', { dateStyle: 'full' })}</div>
                    <div>Total Items Audited: <strong>{selectedItems.length}</strong></div>
                    <div>Net Unit Difference: <strong className={netUnitDifference >= 0 ? 'text-emerald-700' : 'text-rose-700'}>{netUnitDifference > 0 ? `+${netUnitDifference}` : netUnitDifference}</strong></div>
                  </div>
                </div>

                {/* KPI Summary Grid */}
                <div className="grid grid-cols-4 gap-4 text-xs">
                  <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">System Expected</span>
                    <div className="text-lg font-black font-mono text-slate-800">{totalSystemUnits} units</div>
                  </div>
                  <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Physical Counted</span>
                    <div className="text-lg font-black font-mono text-indigo-700">{totalPhysicalUnits} units</div>
                  </div>
                  <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Net Variance</span>
                    <div className={`text-lg font-black font-mono ${netUnitDifference >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {netUnitDifference > 0 ? `+${netUnitDifference}` : netUnitDifference} units
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Financial Impact</span>
                    <div className={`text-lg font-black font-mono ${totalFinancialVariance >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {totalFinancialVariance < 0 ? '-' : '+'}R {Math.abs(totalFinancialVariance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>

                {/* Landscape Table */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead className="bg-slate-900 text-white uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="px-3 py-3">Item Code</th>
                        <th className="px-3 py-3">Description</th>
                        <th className="px-3 py-3">Category</th>
                        <th className="px-3 py-3">Location</th>
                        <th className="px-3 py-3 text-right">Unit Price (ZAR)</th>
                        <th className="px-3 py-3 text-center">System</th>
                        <th className="px-3 py-3 text-center">Physical</th>
                        <th className="px-3 py-3 text-center">Variance</th>
                        <th className="px-3 py-3 text-right">Impact (ZAR)</th>
                        <th className="px-3 py-3">Auditor Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {auditRows.map((row) => {
                        const diff = row.physicalCount - row.systemOnHand;
                        const valueDiff = diff * row.unitPrice;
                        const isShortage = diff < 0;
                        const isSurplus = diff > 0;
                        const isBalanced = diff === 0;

                        return (
                          <tr key={row.itemId} className={isShortage ? 'bg-rose-50/40' : isSurplus ? 'bg-blue-50/30' : ''}>
                            <td className="px-3 py-2.5 font-mono font-bold">{row.itemCode}</td>
                            <td className="px-3 py-2.5 font-semibold text-slate-800">{row.itemDescription}</td>
                            <td className="px-3 py-2.5 text-slate-500">{row.category}</td>
                            <td className="px-3 py-2.5 text-slate-600">{row.location}</td>
                            <td className="px-3 py-2.5 text-right font-mono">R {row.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            <td className="px-3 py-2.5 text-center font-mono font-bold">{row.systemOnHand}</td>
                            <td className="px-3 py-2.5 text-center font-mono font-bold text-indigo-700">{row.physicalCount}</td>
                            <td className="px-3 py-2.5 text-center font-mono">
                              {isBalanced ? (
                                <span className="text-emerald-700 font-bold">0 (Ok)</span>
                              ) : isSurplus ? (
                                <span className="text-blue-700 font-bold">+{diff}</span>
                              ) : (
                                <span className="text-rose-700 font-bold">{diff}</span>
                              )}
                            </td>
                            <td className={`px-3 py-2.5 text-right font-mono font-bold ${isBalanced ? 'text-slate-400' : isSurplus ? 'text-blue-700' : 'text-rose-700'}`}>
                              {valueDiff < 0 ? '-' : valueDiff > 0 ? '+' : ''}R {Math.abs(valueDiff).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-3 py-2.5 text-slate-600 italic">{row.notes || '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Sign-off Footer */}
                <div className="pt-8 border-t border-slate-300 flex justify-between items-end text-xs text-slate-700">
                  <div className="space-y-4">
                    <div><strong>Lead Auditor Signature:</strong> ___________________________</div>
                    <div><strong>Operations Manager Approval:</strong> ___________________________</div>
                  </div>
                  <div className="text-right text-slate-500">
                    Tides of Knysna Exclusive Guest House • Internal Stock Verification System
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
