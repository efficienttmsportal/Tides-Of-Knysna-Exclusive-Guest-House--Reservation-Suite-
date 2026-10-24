import React, { useState } from 'react';
import { InventoryItem } from '../types';
import { 
  Truck, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  Clock, 
  FileText, 
  ExternalLink, 
  ShieldCheck, 
  BarChart3, 
  Mail, 
  RefreshCw, 
  Star, 
  Layers, 
  X, 
  ChevronRight,
  Download,
  Printer
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from 'recharts';
import { playLaserTagSound } from '../utils/audioUtils';

interface SupplierPerformanceModuleProps {
  inventory: InventoryItem[];
  onOpenSupplierModal: (supplierName: string, item?: InventoryItem) => void;
  onGenerateDraftPo: () => void;
  targetSupplier?: string | null;
  targetItem?: InventoryItem | null;
  onClearTargetSupplier?: () => void;
  onJumpToMatrix?: (item: InventoryItem) => void;
}

export const SupplierPerformanceModule: React.FC<SupplierPerformanceModuleProps> = ({
  inventory,
  onOpenSupplierModal,
  onGenerateDraftPo,
  targetSupplier,
  targetItem,
  onClearTargetSupplier,
  onJumpToMatrix
}) => {
  // Aggregate inventory by supplier
  const supplierMap: { [supplierName: string]: { items: InventoryItem[]; lowStockCount: number; totalValue: number } } = {};

  inventory.forEach(item => {
    const sup = item.supplier || 'General Supplier';
    if (!supplierMap[sup]) {
      supplierMap[sup] = { items: [], lowStockCount: 0, totalValue: 0 };
    }
    supplierMap[sup].items.push(item);
    supplierMap[sup].totalValue += item.pricePerUnit * item.howManyOnHand;
    if (item.howManyOnHand <= item.whenToReorder) {
      supplierMap[sup].lowStockCount += 1;
    }
  });

  const suppliersList = Object.keys(supplierMap);

  // Mock performance metrics & ratings per vendor (include one with > 14 days lead time for visual alert demonstration)
  const vendorMetrics: { [key: string]: { leadTimeDays: number; fulfillmentAccuracy: number; monthlyOrdersAvg: number; rating: number; totalAudits: number } } = {
    'Garden Route Hospitality Supplies': { leadTimeDays: 2.1, fulfillmentAccuracy: 98.5, monthlyOrdersAvg: 6, rating: 4.9, totalAudits: 24 },
    'Fynbos Botanicals & Toiletries': { leadTimeDays: 3.5, fulfillmentAccuracy: 96.2, monthlyOrdersAvg: 4, rating: 4.7, totalAudits: 18 },
    'Garden Route Wine Merchants': { leadTimeDays: 1.8, fulfillmentAccuracy: 99.1, monthlyOrdersAvg: 8, rating: 5.0, totalAudits: 31 },
    'EcoClean Hotel Products': { leadTimeDays: 16.5, fulfillmentAccuracy: 88.0, monthlyOrdersAvg: 2, rating: 3.8, totalAudits: 11 }, // Bottleneck supplier > 14 days lead time
  };

  // Prepare chart data for lead times across all suppliers
  const chartData = suppliersList.map(sup => {
    const metrics = vendorMetrics[sup] || { leadTimeDays: 3.0, fulfillmentAccuracy: 95.0, rating: 4.5 };
    const isBottleneck = metrics.leadTimeDays > 14;
    return {
      supplier: sup.length > 22 ? sup.substring(0, 20) + '...' : sup,
      fullName: sup,
      leadTimeDays: metrics.leadTimeDays,
      isBottleneck,
      rating: metrics.rating,
      fulfillment: metrics.fulfillmentAccuracy
    };
  });

  const lowStockTotal = inventory.filter(i => i.howManyOnHand <= i.whenToReorder).length;
  const bottleneckSuppliers = chartData.filter(d => d.isBottleneck);

  // Supplier Export (CSV) with Bottleneck Alerts
  const handleExportSupplierCsv = () => {
    const exportRows = suppliersList.map(sup => {
      const metrics = vendorMetrics[sup] || { leadTimeDays: 3.0, fulfillmentAccuracy: 95.0, monthlyOrdersAvg: 3, rating: 4.5 };
      const data = supplierMap[sup];
      const isBottleneck = metrics.leadTimeDays > 14;
      return {
        supplierName: sup,
        catalogItems: data.items.length,
        assetValuationZar: data.totalValue,
        leadTimeDays: metrics.leadTimeDays,
        isLeadTimeBottleneck: isBottleneck ? 'YES (> 14 Days)' : 'NO (Normal SLA)',
        fulfillmentAccuracyPct: metrics.fulfillmentAccuracy,
        vendorRating: metrics.rating,
        lowStockAlerts: data.lowStockCount,
        exportedAt: new Date().toISOString()
      };
    });

    const headers = ['Supplier Name', 'Catalog Items', 'Asset Valuation (ZAR)', 'Lead Time (Days)', 'Lead Time Bottleneck (>14d)', 'Fulfillment Accuracy (%)', 'Vendor Rating', 'Low Stock Alerts', 'Exported At'];
    const csvContent = 'data:text/csv;charset=utf-8,' + [
      headers.join(','),
      ...exportRows.map(r => [
        `"${r.supplierName.replace(/"/g, '""')}"`,
        r.catalogItems,
        r.assetValuationZar,
        r.leadTimeDays,
        `"${r.isLeadTimeBottleneck}"`,
        r.fulfillmentAccuracyPct,
        r.vendorRating,
        r.lowStockAlerts,
        `"${r.exportedAt}"`
      ].join(','))
    ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TOK-Supplier-Performance-Audit-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    playLaserTagSound();
  };

  // Quick-Report PDF Export using jspdf, jspdf-autotable, and addPdfWatermarkAndEmblem
  const handleExportSupplierPdf = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      await import('jspdf-autotable');
      const { addPdfWatermarkAndEmblem } = await import('../utils/pdfWatermarkUtils');

      const doc = new jsPDF('portrait', 'mm', 'a4');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.setTextColor(15, 23, 42);
      doc.text('Supplier Performance & Lead Time Quick-Report', 14, 42);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`Tides of Knysna Luxury Guest House | Generated on: ${new Date().toLocaleDateString()}`, 14, 48);

      const tableRows = suppliersList.map(sup => {
        const metrics = vendorMetrics[sup] || { leadTimeDays: 3.0, fulfillmentAccuracy: 95.0, monthlyOrdersAvg: 3, rating: 4.5 };
        const data = supplierMap[sup];
        const isBottleneck = metrics.leadTimeDays > 14;
        return [
          sup,
          data.items.length,
          `R ${data.totalValue.toLocaleString()}`,
          `${metrics.leadTimeDays} Days`,
          isBottleneck ? 'Bottleneck (>14d)' : 'Normal SLA',
          `${metrics.fulfillmentAccuracy}%`,
          `${metrics.rating} / 5.0`,
          data.lowStockCount
        ];
      });

      (doc as any).autoTable({
        startY: 55,
        head: [['Supplier Name', 'Items', 'Valuation', 'Lead Time', 'SLA Status', 'Fulfillment', 'Rating', 'Low Stock']],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
        bodyStyles: { fontSize: 8.5, textColor: [51, 65, 85] },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { left: 14, right: 14 }
      });

      addPdfWatermarkAndEmblem(doc);
      doc.save(`TOK-Supplier-Performance-QuickReport-${new Date().toISOString().split('T')[0]}.pdf`);
      playLaserTagSound();
    } catch (err) {
      console.error('Failed to export supplier PDF', err);
      alert('Failed to generate supplier performance PDF.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Targeted Focus Banner (When jumped from Reorder Notification) */}
      {targetSupplier && (
        <div className="bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-amber-500/15 border-2 border-amber-500/50 rounded-3xl p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-bold shadow-md">
              <Star className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-extrabold uppercase tracking-widest bg-amber-500/20 text-amber-800 border border-amber-500/40 px-2 py-0.5 rounded-full">
                  Focused Vendor
                </span>
                <h3 className="font-serif-luxury font-bold text-slate-900 text-base">
                  {targetSupplier}
                </h3>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                {targetItem ? (
                  <span>
                    Viewing performance rating for replenishment of <strong>{targetItem.itemDescription}</strong> ({targetItem.itemCode}) — Current stock: <strong className="text-rose-600">{targetItem.howManyOnHand} {targetItem.unit}</strong> (Par: {targetItem.whenToReorder} {targetItem.unit}).
                  </span>
                ) : (
                  <span>Supplier rating, delivery reliability, and order SLA dashboard.</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
            {targetItem && onJumpToMatrix && (
              <button
                onClick={() => onJumpToMatrix(targetItem)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
              >
                <Layers className="w-3.5 h-3.5" />
                View in Inventory Matrix
              </button>
            )}
            {onClearTargetSupplier && (
              <button
                onClick={onClearTargetSupplier}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs border border-slate-300 shadow-xs flex items-center gap-1 transition"
              >
                <X className="w-3.5 h-3.5" />
                Clear Focus
              </button>
            )}
          </div>
        </div>
      )}

      {/* Top Banner & Quick Action */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1.5 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
            <BarChart3 className="w-3.5 h-3.5" />
            Vendor Analytics & Rating Scorecard
          </div>
          <h2 className="text-xl font-serif-luxury font-bold">Supplier Performance & Lead Time Analytics</h2>
          <p className="text-xs text-slate-300 max-w-2xl">
            Real-time tracking of vendor fulfillment accuracy, delivery lead times (with visual bottleneck alerts for SLA &gt; 14 days), and reorder analytics.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <button
            onClick={handleExportSupplierCsv}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center gap-1.5 border border-slate-700 transition"
            title="Export Supplier Performance & Lead Times to CSV"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            Export Supplier CSV
          </button>
          <button
            onClick={handleExportSupplierPdf}
            className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition"
            title="Export Supplier Performance & Lead Times to Branded PDF Quick-Report"
          >
            <FileText className="w-4 h-4 text-amber-300" />
            Quick-Report PDF
          </button>
          <button
            onClick={onGenerateDraftPo}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-lg transition"
            title="Compile all low stock items into a draft purchase order email"
          >
            <Mail className="w-4 h-4" />
            Generate Draft Purchase Order ({lowStockTotal} Low Stock)
          </button>
        </div>
      </div>

      {/* Bottleneck Warning Banner if any supplier > 14 days lead time */}
      {bottleneckSuppliers.length > 0 && (
        <div className="bg-rose-50 border-2 border-rose-300 text-rose-900 p-4 rounded-2xl flex items-center justify-between text-xs font-semibold animate-pulse">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <strong className="font-bold text-rose-950">🚨 Supply Chain Bottleneck Alert:</strong>{' '}
              {bottleneckSuppliers.map(s => s.fullName).join(', ')} exceed{bottleneckSuppliers.length === 1 ? 's' : ''} the 14-day lead time threshold (Highlighted in Red on chart below).
            </div>
          </div>
          <span className="px-2.5 py-1 bg-rose-200 text-rose-900 rounded-lg text-[10px] font-mono font-bold uppercase shrink-0">
            SLA BREACH
          </span>
        </div>
      )}

      {/* OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Active Vendors</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-serif-luxury font-bold text-slate-900">{suppliersList.length}</div>
          <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> All verified & audited
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Avg Vendor Rating</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Star className="w-4 h-4 fill-amber-500" />
            </div>
          </div>
          <div className="text-2xl font-serif-luxury font-bold text-slate-900 flex items-center gap-1.5">
            4.6 <span className="text-xs font-sans font-bold text-amber-500">/ 5.0</span>
          </div>
          <p className="text-[11px] text-amber-700 font-semibold flex items-center gap-1">
            <Star className="w-3 h-3 fill-amber-500" /> 95.9% Fulfillment SLA
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Bottleneck Suppliers (&gt;14d)</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-serif-luxury font-bold text-rose-600">{bottleneckSuppliers.length}</div>
          <p className="text-[11px] text-rose-700 font-medium">Requires lead time review</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Low Stock Triggers</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-serif-luxury font-bold text-rose-600">{lowStockTotal}</div>
          <p className="text-[11px] text-rose-700 font-medium">Requires PO reorder action</p>
        </div>
      </div>

      {/* RECHARTS VISUALIZATION: AVERAGE LEAD TIMES WITH RED ALERT OVERLAY FOR > 14 DAYS */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-serif-luxury font-bold text-slate-900 text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              Supplier Delivery Lead Times (Days) & Bottleneck Alert Analysis
            </h3>
            <p className="text-xs text-slate-500">
              Visualizing average delivery lead times across all active inventory suppliers. Suppliers exceeding the 14-day SLA threshold are highlighted in <strong className="text-rose-600">red alert</strong>.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-emerald-600 inline-block"></span>
              <span className="text-slate-600">Normal Lead Time (≤ 14d)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-rose-600 inline-block animate-pulse"></span>
              <span className="text-slate-600">Bottleneck Alert (&gt; 14d)</span>
            </span>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="supplier" 
                tick={{ fontSize: 11, fill: '#475569' }} 
                interval={0} 
                angle={-15} 
                textAnchor="end" 
              />
              <YAxis 
                tick={{ fontSize: 11, fill: '#475569' }} 
                unit=" days" 
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 border border-slate-700">
                        <div className="font-bold text-amber-400">{data.fullName}</div>
                        <div>Average Lead Time: <strong className={data.isBottleneck ? 'text-rose-400 font-extrabold' : 'text-emerald-300'}>{data.leadTimeDays} Days</strong></div>
                        <div>Vendor Rating: <strong>{data.rating} / 5.0</strong></div>
                        <div>Fulfillment SLA: <strong>{data.fulfillment}%</strong></div>
                        {data.isBottleneck && (
                          <div className="text-rose-400 font-bold pt-1 border-t border-slate-800 mt-1">
                            ⚠️ SLA Bottleneck Alert (&gt;14d limit)
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="leadTimeDays" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.isBottleneck ? '#e11d48' : '#059669'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Supplier Performance Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-serif-luxury font-bold text-slate-900 text-base">
              Vendor Scorecards & Active Stock Alerts
            </h3>
            <p className="text-xs text-slate-500">Detailed performance metrics and low stock replenishment items per vendor</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {suppliersList.map(supName => {
            const data = supplierMap[supName];
            const metrics = vendorMetrics[supName] || { leadTimeDays: 2.5, fulfillmentAccuracy: 95.0, monthlyOrdersAvg: 5, rating: 4.8, totalAudits: 15 };
            const isTargeted = targetSupplier === supName;
            const isBottleneck = metrics.leadTimeDays > 14;
            const vendorLowStockItems = data.items.filter(i => i.howManyOnHand <= i.whenToReorder);
            
            return (
              <div 
                key={supName}
                id={`supplier-card-${encodeURIComponent(supName)}`}
                className={`rounded-2xl border p-5 space-y-4 transition-all duration-300 shadow-xs ${
                  isTargeted 
                    ? 'bg-amber-50/60 border-2 border-amber-500 ring-4 ring-amber-400/30 shadow-lg'
                    : isBottleneck
                    ? 'bg-rose-50/40 border-2 border-rose-300 hover:border-rose-400'
                    : 'bg-slate-50/80 border-slate-200 hover:border-emerald-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        <Truck className={`w-4 h-4 ${isBottleneck ? 'text-rose-600' : 'text-emerald-600'}`} />
                        {supName}
                      </h4>
                      {isBottleneck && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-600 text-white flex items-center gap-1 shadow-xs animate-pulse">
                          ⚠️ Bottleneck (&gt;14d)
                        </span>
                      )}
                      {isTargeted && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-slate-950 flex items-center gap-1 shadow-xs">
                          <Star className="w-2.5 h-2.5 fill-slate-950" /> Focused Vendor
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{data.items.length} catalog items managed · R {data.totalValue.toLocaleString()} asset valuation</p>
                  </div>
                  
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="px-2.5 py-1 bg-amber-50 border border-amber-200/90 rounded-xl text-amber-800 font-extrabold text-xs flex items-center gap-1 shadow-xs">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      {metrics.rating.toFixed(1)}
                    </div>
                    <button
                      onClick={() => onOpenSupplierModal(supName)}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs border border-slate-200 shadow-xs flex items-center gap-1 transition"
                    >
                      Contact <ExternalLink className="w-3 h-3 text-emerald-600" />
                    </button>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-white p-2 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Rating</span>
                    <span className="text-xs font-bold text-amber-700 flex items-center justify-center gap-0.5 font-mono">
                      <Star className="w-3 h-3 fill-amber-500" /> {metrics.rating}
                    </span>
                  </div>
                  <div className={`p-2 rounded-xl border ${isBottleneck ? 'bg-rose-100 border-rose-300' : 'bg-white border-slate-200'}`}>
                    <span className={`text-[10px] font-bold uppercase block ${isBottleneck ? 'text-rose-700' : 'text-slate-400'}`}>Lead Time</span>
                    <span className={`text-xs font-bold font-mono ${isBottleneck ? 'text-rose-900 font-black' : 'text-slate-900'}`}>{metrics.leadTimeDays}d</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Fulfillment</span>
                    <span className="text-xs font-bold text-emerald-700 font-mono">{metrics.fulfillmentAccuracy}%</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Order Freq</span>
                    <span className="text-xs font-bold text-indigo-700 font-mono">{metrics.monthlyOrdersAvg}/mo</span>
                  </div>
                </div>

                {/* Visual fulfillment accuracy bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium">Fulfillment SLA Benchmark (95% Target)</span>
                    <span className="font-bold text-slate-900 font-mono">{metrics.fulfillmentAccuracy}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${isBottleneck ? 'bg-rose-600' : 'bg-emerald-600'}`} 
                      style={{ width: `${metrics.fulfillmentAccuracy}%` }}
                    ></div>
                  </div>
                </div>

                {/* Low Stock Items specifically for this vendor */}
                {vendorLowStockItems.length > 0 && (
                  <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-rose-800 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        {vendorLowStockItems.length} Low Stock Item{vendorLowStockItems.length === 1 ? '' : 's'} From This Vendor:
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {vendorLowStockItems.map(item => (
                        <div key={item.id} className="flex items-center justify-between gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-rose-100 text-xs">
                          <div className="truncate">
                            <span className="font-bold text-slate-800">{item.itemDescription}</span>
                            <span className="ml-1 text-[11px] text-slate-400">({item.itemCode})</span>
                            <span className="ml-1 text-rose-600 font-semibold font-mono">
                              [{item.howManyOnHand}/{item.whenToReorder} {item.unit}]
                            </span>
                          </div>
                          {onJumpToMatrix && (
                            <button
                              onClick={() => onJumpToMatrix(item)}
                              className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded text-[10px] border border-emerald-200 shrink-0 flex items-center gap-1 transition"
                              title="Jump directly to this item in the Inventory Matrix"
                            >
                              <Layers className="w-2.5 h-2.5" /> Matrix
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stock alerts summary */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/80 text-xs">
                  <span className="text-slate-500 font-medium">Vendor Stock Status:</span>
                  {data.lowStockCount > 0 ? (
                    <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 font-bold rounded-lg flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-rose-600" /> {data.lowStockCount} items need replenishment
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-lg flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-600" /> Stock par levels healthy
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
