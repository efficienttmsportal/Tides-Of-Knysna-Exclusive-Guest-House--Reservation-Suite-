import React, { useState } from 'react';
import { InventoryItem } from '../types';
import { Truck, AlertTriangle, CheckCircle, TrendingUp, Clock, FileText, ExternalLink, ShieldCheck, BarChart3, Mail, RefreshCw } from 'lucide-react';

interface SupplierPerformanceModuleProps {
  inventory: InventoryItem[];
  onOpenSupplierModal: (supplierName: string, item?: InventoryItem) => void;
  onGenerateDraftPo: () => void;
}

export const SupplierPerformanceModule: React.FC<SupplierPerformanceModuleProps> = ({
  inventory,
  onOpenSupplierModal,
  onGenerateDraftPo
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

  // Mock performance metrics per vendor
  const vendorMetrics: { [key: string]: { leadTimeDays: number; fulfillmentAccuracy: number; monthlyOrdersAvg: number; rating: number } } = {
    'Garden Route Hospitality Supplies': { leadTimeDays: 2.1, fulfillmentAccuracy: 98.5, monthlyOrdersAvg: 6, rating: 4.9 },
    'Fynbos Botanicals & Toiletries': { leadTimeDays: 3.5, fulfillmentAccuracy: 96.2, monthlyOrdersAvg: 4, rating: 4.7 },
    'Garden Route Wine Merchants': { leadTimeDays: 1.8, fulfillmentAccuracy: 99.1, monthlyOrdersAvg: 8, rating: 5.0 },
    'EcoClean Hotel Products': { leadTimeDays: 4.0, fulfillmentAccuracy: 94.8, monthlyOrdersAvg: 3, rating: 4.5 },
  };

  const lowStockTotal = inventory.filter(i => i.howManyOnHand <= i.whenToReorder).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner & Quick Action */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1.5 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
            <BarChart3 className="w-3.5 h-3.5" />
            Vendor Analytics & D3 Performance Matrix
          </div>
          <h2 className="text-xl font-serif-luxury font-bold">Supplier Performance & Lead Time Analytics</h2>
          <p className="text-xs text-slate-300 max-w-2xl">
            Real-time tracking of vendor fulfillment accuracy, delivery lead times, order frequencies, and active stock alerts across Knysna & Garden Route approved suppliers.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
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

      {/* Overview Cards */}
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
            <span className="text-xs font-bold text-slate-500 uppercase">Avg Fulfillment Rate</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-serif-luxury font-bold text-slate-900">97.1%</div>
          <p className="text-[11px] text-slate-500">Exceeds hospitality benchmark (95%)</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Average Lead Time</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-serif-luxury font-bold text-slate-900">2.8 Days</div>
          <p className="text-[11px] text-slate-500">Regional Garden Route delivery</p>
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

      {/* Detailed Supplier Performance Cards & D3 Visualizations */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-serif-luxury font-bold text-slate-900 text-base">
              Vendor Lead Times, Fulfillment Accuracy & Order Frequency
            </h3>
            <p className="text-xs text-slate-500">Interactive D3 analytics breakdown for each major supplier</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {suppliersList.map(supName => {
            const data = supplierMap[supName];
            const metrics = vendorMetrics[supName] || { leadTimeDays: 2.5, fulfillmentAccuracy: 95.0, monthlyOrdersAvg: 5, rating: 4.8 };
            
            return (
              <div key={supName} className="bg-slate-50/80 rounded-2xl border border-slate-200 p-5 space-y-4 hover:border-emerald-300 transition shadow-xs">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-emerald-600" />
                      {supName}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">{data.items.length} catalog items managed · R {data.totalValue.toLocaleString()} asset valuation</p>
                  </div>
                  <button
                    onClick={() => onOpenSupplierModal(supName)}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs border border-slate-200 shadow-xs flex items-center gap-1 transition shrink-0"
                  >
                    Quick Contact & PO <ExternalLink className="w-3 h-3 text-emerald-600" />
                  </button>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Lead Time</span>
                    <span className="text-sm font-bold text-slate-900 font-mono">{metrics.leadTimeDays} Days</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Fulfillment</span>
                    <span className="text-sm font-bold text-emerald-700 font-mono">{metrics.fulfillmentAccuracy}%</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Order Freq</span>
                    <span className="text-sm font-bold text-indigo-700 font-mono">{metrics.monthlyOrdersAvg}/mo</span>
                  </div>
                </div>

                {/* Visual D3-style bars for fulfillment accuracy */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium">Fulfillment Accuracy Score</span>
                    <span className="font-bold text-slate-900 font-mono">{metrics.fulfillmentAccuracy}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-600 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${metrics.fulfillmentAccuracy}%` }}
                    ></div>
                  </div>
                </div>

                {/* Stock alerts for this supplier */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 text-xs">
                  <span className="text-slate-500 font-medium">Active Reorder Alerts:</span>
                  {data.lowStockCount > 0 ? (
                    <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 font-bold rounded-lg flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-rose-600" /> {data.lowStockCount} items need reorder
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-lg flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-600" /> Stock adequate
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
