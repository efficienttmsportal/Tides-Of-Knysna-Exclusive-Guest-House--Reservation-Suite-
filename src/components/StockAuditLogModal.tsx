import React, { useState, useMemo } from 'react';
import {
  X,
  History,
  Search,
  Filter,
  Download,
  Calendar,
  User,
  Package,
  Layers,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  FileSpreadsheet,
  QrCode,
  Sliders,
  DollarSign,
  Plus,
  RefreshCw,
  Trash2,
  Tag
} from 'lucide-react';
import { StockAuditLogEntry, InventoryItem } from '../types';

interface StockAuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: StockAuditLogEntry[];
  inventory: InventoryItem[];
  filterItemId?: string | null;
  onAddManualLog?: (entry: Omit<StockAuditLogEntry, 'id' | 'timestamp'>) => void;
  onClearLogs?: () => void;
}

export const StockAuditLogModal: React.FC<StockAuditLogModalProps> = ({
  isOpen,
  onClose,
  logs,
  inventory,
  filterItemId,
  onAddManualLog,
  onClearLogs
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActionType, setSelectedActionType] = useState<string>('All');
  const [selectedItemCode, setSelectedItemCode] = useState<string>(() => {
    if (filterItemId) {
      const found = inventory.find(i => i.id === filterItemId);
      return found ? found.itemCode : 'All';
    }
    return 'All';
  });

  // Manual log form modal inside audit log
  const [isManualRecountOpen, setIsManualRecountOpen] = useState(false);
  const [recountItemCode, setRecountItemCode] = useState(inventory[0]?.itemCode || '');
  const [recountNewQty, setRecountNewQty] = useState<number>(0);
  const [recountStaffName, setRecountStaffName] = useState('Eleanor Sterling (Head of Ops)');
  const [recountNotes, setRecountNotes] = useState('Routine mid-week physical suite stock verification');

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch =
        !searchQuery ||
        log.itemCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.itemDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.adjustedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.notes && log.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesAction = selectedActionType === 'All' || log.actionType === selectedActionType;
      const matchesItem = selectedItemCode === 'All' || log.itemCode === selectedItemCode;

      return matchesSearch && matchesAction && matchesItem;
    });
  }, [logs, searchQuery, selectedActionType, selectedItemCode]);

  // Aggregate statistics
  const stats = useMemo(() => {
    let totalIncreased = 0;
    let totalDecreased = 0;
    const staffCounts: Record<string, number> = {};

    logs.forEach(l => {
      if (l.deltaQty > 0) totalIncreased += l.deltaQty;
      if (l.deltaQty < 0) totalDecreased += Math.abs(l.deltaQty);
      staffCounts[l.adjustedBy] = (staffCounts[l.adjustedBy] || 0) + 1;
    });

    let topStaff = 'None';
    let maxCount = 0;
    Object.entries(staffCounts).forEach(([staff, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topStaff = staff;
      }
    });

    return {
      totalEntries: logs.length,
      totalIncreased,
      totalDecreased,
      topStaff
    };
  }, [logs]);

  // Handle Export Audit Log to CSV
  const handleExportCsv = () => {
    const headers = ['Timestamp', 'Item Code', 'Item Description', 'Action Type', 'Previous Qty', 'New Qty', 'Change (Delta)', 'Adjusted By', 'Notes / Reference'];
    const rows = filteredLogs.map(l => [
      `"${l.timestamp}"`,
      `"${l.itemCode}"`,
      `"${l.itemDescription.replace(/"/g, '""')}"`,
      `"${l.actionType}"`,
      l.previousQty,
      l.newQty,
      l.deltaQty > 0 ? `+${l.deltaQty}` : l.deltaQty,
      `"${l.adjustedBy.replace(/"/g, '""')}"`,
      `"${(l.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const timestamp = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `tides_of_knysna_stock_audit_log_${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Submit manual recount
  const handleRecountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const item = inventory.find(i => i.itemCode === recountItemCode);
    if (!item) return;

    if (onAddManualLog) {
      onAddManualLog({
        itemId: item.id,
        itemCode: item.itemCode,
        itemDescription: item.itemDescription,
        previousQty: item.howManyOnHand,
        newQty: recountNewQty,
        deltaQty: recountNewQty - item.howManyOnHand,
        adjustedBy: recountStaffName,
        actionType: 'Physical Stock Count',
        notes: recountNotes
      });
    }

    setIsManualRecountOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fade-in no-print">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* HEADER */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 font-bold">
              <History className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif-luxury font-bold text-lg text-white">
                  Stock Audit Trail & Change Log
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/40">
                  Accountability System
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Immutable historical records of stock adjustments, QR scans, reconciliations & user attributions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 border border-slate-700 transition"
              title="Export Audit Trail to CSV"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              Export CSV
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="bg-slate-50 p-4 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Audit Entries</span>
            <div className="text-base font-bold text-slate-900 mt-0.5">{stats.totalEntries} Adjustments</div>
            <span className="text-[10px] text-slate-500 block">All recorded stock events</span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Restocked Inflow</span>
            <div className="text-base font-bold text-emerald-700 mt-0.5 flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              +{stats.totalIncreased} Units
            </div>
            <span className="text-[10px] text-slate-500 block">Orders & manual replenish</span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Stock Consumed / Outflow</span>
            <div className="text-base font-bold text-rose-700 mt-0.5 flex items-center gap-1">
              <TrendingDown className="w-4 h-4 text-rose-600" />
              -{stats.totalDecreased} Units
            </div>
            <span className="text-[10px] text-slate-500 block">Guest consumption & QR checkouts</span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Top Operating Officer</span>
            <div className="text-xs font-bold text-slate-900 mt-0.5 truncate">{stats.topStaff}</div>
            <span className="text-[10px] text-indigo-600 font-semibold block">Primary verification user</span>
          </div>
        </div>

        {/* FILTERS & ACTIONS BAR */}
        <div className="p-4 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
            {/* Search Box */}
            <div className="relative flex-1 min-w-[180px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search audit trail by item, user, reason..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Action Type Filter */}
            <div className="flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={selectedActionType}
                onChange={(e) => setSelectedActionType(e.target.value)}
                className="px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-700 focus:outline-none"
              >
                <option value="All">All Actions ({logs.length})</option>
                <option value="Manual Adjustment">Manual Adjustments</option>
                <option value="QR Scan Adjustment">QR Asset Scans</option>
                <option value="Batch Restock">Batch Restocks</option>
                <option value="Batch Price Update">Batch Price Updates</option>
                <option value="Physical Stock Count">Physical Stock Counts</option>
                <option value="Purchase Order Received">POs Received</option>
              </select>
            </div>

            {/* Item Filter */}
            <select
              value={selectedItemCode}
              onChange={(e) => setSelectedItemCode(e.target.value)}
              className="px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-700 focus:outline-none max-w-[190px] truncate"
            >
              <option value="All">All Inventory Items</option>
              {inventory.map(item => (
                <option key={item.id} value={item.itemCode}>
                  [{item.itemCode}] {item.itemDescription.slice(0, 24)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            {onAddManualLog && (
              <button
                onClick={() => {
                  setRecountItemCode(inventory[0]?.itemCode || '');
                  setRecountNewQty(inventory[0]?.howManyOnHand || 0);
                  setIsManualRecountOpen(true);
                }}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Record Stock Count
              </button>
            )}

            {onClearLogs && logs.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to reset the stock audit log history?')) {
                    onClearLogs();
                  }
                }}
                className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition"
                title="Archive / Clear Audit Log"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* LOGS TABLE */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <History className="w-10 h-10 mx-auto text-slate-300" />
              <p className="font-semibold text-slate-600 text-sm">No audit records match your filters.</p>
              <p className="text-xs text-slate-400">Try broadening your search term or select "All Actions".</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-900 text-white uppercase text-[10px] tracking-wider font-semibold">
                  <tr>
                    <th className="px-3.5 py-3">Timestamp</th>
                    <th className="px-3.5 py-3">Item Details</th>
                    <th className="px-3.5 py-3">Operating Officer</th>
                    <th className="px-3.5 py-3">Action Type</th>
                    <th className="px-3.5 py-3 text-center">Previous → New</th>
                    <th className="px-3.5 py-3 text-center">Net Change</th>
                    <th className="px-3.5 py-3">Reason / Context</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.map((log) => {
                    const isPositive = log.deltaQty > 0;
                    const isZero = log.deltaQty === 0;

                    return (
                      <tr key={log.id} className="hover:bg-indigo-50/40 transition">
                        <td className="px-3.5 py-2.5 font-mono text-slate-500 whitespace-nowrap text-[11px]">
                          {log.timestamp}
                        </td>
                        <td className="px-3.5 py-2.5">
                          <span className="font-mono font-bold text-slate-900 block">{log.itemCode}</span>
                          <span className="text-[11px] text-slate-500 block truncate max-w-[200px]">
                            {log.itemDescription}
                          </span>
                        </td>
                        <td className="px-3.5 py-2.5">
                          <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                            <User className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            <span className="truncate max-w-[140px]">{log.adjustedBy}</span>
                          </div>
                        </td>
                        <td className="px-3.5 py-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1 ${
                            log.actionType === 'QR Scan Adjustment'
                              ? 'bg-sky-100 text-sky-800 border border-sky-200'
                              : log.actionType === 'Batch Restock'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : log.actionType === 'Batch Price Update'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : log.actionType === 'Physical Stock Count'
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : 'bg-slate-100 text-slate-800 border border-slate-200'
                          }`}>
                            {log.actionType === 'QR Scan Adjustment' && <QrCode className="w-3 h-3" />}
                            {log.actionType}
                          </span>
                        </td>
                        <td className="px-3.5 py-2.5 text-center font-mono text-slate-600">
                          <span className="text-slate-400">{log.previousQty}</span>
                          <span className="mx-1 text-slate-300">→</span>
                          <span className="font-bold text-slate-900">{log.newQty}</span>
                        </td>
                        <td className="px-3.5 py-2.5 text-center">
                          {isZero ? (
                            <span className="font-mono text-slate-400 font-bold">0</span>
                          ) : isPositive ? (
                            <span className="px-2 py-0.5 rounded-full font-mono text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              +{log.deltaQty}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full font-mono text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              {log.deltaQty}
                            </span>
                          )}
                        </td>
                        <td className="px-3.5 py-2.5 text-[11px] text-slate-600 max-w-[220px]">
                          <span className="line-clamp-2" title={log.notes}>
                            {log.notes || 'Routine housekeeping update'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>
            Displaying <strong className="text-slate-900">{filteredLogs.length}</strong> of <strong className="text-slate-900">{logs.length}</strong> records
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition shadow-xs"
          >
            Close Audit Trail
          </button>
        </div>

        {/* MODAL: RECORD PHYSICAL STOCK COUNT */}
        {isManualRecountOpen && (
          <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Physical Stock Recount Record</h4>
                    <p className="text-[11px] text-slate-500">Manual stock reconciliation log entry</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsManualRecountOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleRecountSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Select Item Code</label>
                  <select
                    value={recountItemCode}
                    onChange={(e) => {
                      setRecountItemCode(e.target.value);
                      const itm = inventory.find(i => i.itemCode === e.target.value);
                      if (itm) setRecountNewQty(itm.howManyOnHand);
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    {inventory.map(i => (
                      <option key={i.id} value={i.itemCode}>
                        [{i.itemCode}] {i.itemDescription} (Current: {i.howManyOnHand} {i.unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Verified On-Hand Quantity</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={recountNewQty}
                    onChange={(e) => setRecountNewQty(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Verifying Staff / Duty Officer</label>
                  <input
                    type="text"
                    required
                    value={recountStaffName}
                    onChange={(e) => setRecountStaffName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Audit Notes / Reason</label>
                  <textarea
                    rows={2}
                    value={recountNotes}
                    onChange={(e) => setRecountNotes(e.target.value)}
                    placeholder="e.g. Month-end inventory verification, room 102 mini-bar restock"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsManualRecountOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md"
                  >
                    Commit Audit Recount
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
