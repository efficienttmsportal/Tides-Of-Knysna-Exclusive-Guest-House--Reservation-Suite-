import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  ComposedChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import {
  TrendingUp,
  BarChart3,
  PieChart as PieIcon,
  DollarSign,
  Package,
  AlertTriangle,
  CheckCircle,
  Truck,
  Layers,
  ChevronDown,
  ChevronUp,
  Info,
  SlidersHorizontal,
  Sparkles,
  Calendar,
  Clock,
  CalendarCheck,
  Zap
} from 'lucide-react';
import { InventoryItem } from '../types';
import { calculateCatalogOrderDates } from '../utils/predictiveOrderCalculator';

interface InventoryChartsSectionProps {
  inventory: InventoryItem[];
  onSelectCategoryFilter?: (cat: string) => void;
  onOpenSupplierModal?: (supplierName: string) => void;
  onOpenPredictiveCalculator?: (item?: InventoryItem) => void;
}

const LUXURY_PALETTE = [
  '#059669', // Emerald
  '#0284c7', // Sky Blue
  '#d97706', // Amber
  '#6366f1', // Indigo
  '#ec4899', // Pink
  '#14b8a6', // Teal
  '#8b5cf6'  // Purple
];

const HEALTH_COLORS = {
  adequate: '#059669',  // Emerald
  reorder: '#f59e0b',   // Amber
  critical: '#e11d48'   // Rose
};

export const InventoryChartsSection: React.FC<InventoryChartsSectionProps> = ({
  inventory,
  onSelectCategoryFilter,
  onOpenSupplierModal,
  onOpenPredictiveCalculator
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeChartView, setActiveChartView] = useState<'valuation' | 'volume' | 'health' | 'suppliers' | 'predictive'>('valuation');

  // Predictive Order Date Analyses across all items
  const predictiveOrderList = useMemo(() => {
    return calculateCatalogOrderDates(inventory);
  }, [inventory]);

  // Key KPI Calculations
  const kpis = useMemo(() => {
    let totalValuation = 0;
    let totalUnits = 0;
    let lowStockCount = 0;
    let criticalCount = 0;
    let restockCapitalNeeded = 0;
    const suppliersSet = new Set<string>();

    inventory.forEach(item => {
      const val = item.pricePerUnit * item.howManyOnHand;
      totalValuation += val;
      totalUnits += item.howManyOnHand;
      suppliersSet.add(item.supplier);

      if (item.howManyOnHand <= item.whenToReorder) {
        lowStockCount++;
        const deficit = Math.max(10, item.whenToReorder * 2 - item.howManyOnHand);
        restockCapitalNeeded += deficit * item.pricePerUnit;

        if (item.howManyOnHand <= Math.floor(item.whenToReorder / 2)) {
          criticalCount++;
        }
      }
    });

    return {
      totalValuation,
      totalUnits,
      lowStockCount,
      criticalCount,
      restockCapitalNeeded,
      uniqueSuppliers: suppliersSet.size
    };
  }, [inventory]);

  // Chart 1: Stock Valuation & Units by Category
  const categoryChartData = useMemo(() => {
    const map: Record<string, { totalValuation: number; totalOnHand: number; totalReorderLevel: number; itemCount: number }> = {};

    inventory.forEach(item => {
      const cat = item.category || 'Other';
      if (!map[cat]) {
        map[cat] = { totalValuation: 0, totalOnHand: 0, totalReorderLevel: 0, itemCount: 0 };
      }
      map[cat].totalValuation += item.pricePerUnit * item.howManyOnHand;
      map[cat].totalOnHand += item.howManyOnHand;
      map[cat].totalReorderLevel += item.whenToReorder;
      map[cat].itemCount += 1;
    });

    return Object.entries(map).map(([category, stats], idx) => ({
      category: category.length > 18 ? category.slice(0, 16) + '..' : category,
      fullCategory: category,
      valuationZar: stats.totalValuation,
      onHandUnits: stats.totalOnHand,
      reorderThreshold: stats.totalReorderLevel,
      itemCount: stats.itemCount,
      color: LUXURY_PALETTE[idx % LUXURY_PALETTE.length]
    })).sort((a, b) => b.valuationZar - a.valuationZar);
  }, [inventory]);

  // Chart 2: Health Breakdown (Donut)
  const healthChartData = useMemo(() => {
    let adequateCount = 0;
    let reorderCount = 0;
    let criticalCount = 0;

    inventory.forEach(item => {
      if (item.howManyOnHand <= Math.floor(item.whenToReorder / 2)) {
        criticalCount++;
      } else if (item.howManyOnHand <= item.whenToReorder) {
        reorderCount++;
      } else {
        adequateCount++;
      }
    });

    return [
      { name: 'Adequate Stock', value: adequateCount, color: HEALTH_COLORS.adequate, desc: 'Safe buffer above reorder point' },
      { name: 'Reorder Level', value: reorderCount, color: HEALTH_COLORS.reorder, desc: 'Stock at or below reorder threshold' },
      { name: 'Critical Stock', value: criticalCount, color: HEALTH_COLORS.critical, desc: 'Under 50% safety stock' }
    ].filter(d => d.value > 0);
  }, [inventory]);

  // Chart 3: Top Suppliers by Stock Valuation
  const supplierChartData = useMemo(() => {
    const map: Record<string, { totalVal: number; itemsCount: number; lowStockItems: number }> = {};

    inventory.forEach(item => {
      const sup = item.supplier || 'Unassigned';
      if (!map[sup]) {
        map[sup] = { totalVal: 0, itemsCount: 0, lowStockItems: 0 };
      }
      map[sup].totalVal += item.pricePerUnit * item.howManyOnHand;
      map[sup].itemsCount += 1;
      if (item.howManyOnHand <= item.whenToReorder) {
        map[sup].lowStockItems += 1;
      }
    });

    return Object.entries(map)
      .map(([supplier, stats]) => ({
        supplier: supplier.length > 20 ? supplier.slice(0, 18) + '...' : supplier,
        fullSupplier: supplier,
        stockValuation: stats.totalVal,
        itemsCount: stats.itemsCount,
        lowStockItems: stats.lowStockItems
      }))
      .sort((a, b) => b.stockValuation - a.stockValuation)
      .slice(0, 6);
  }, [inventory]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in space-y-4">
      
      {/* SECTION HEADER WITH COLLAPSE TOGGLE */}
      <div className="p-5 sm:p-6 pb-0 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-sm">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif-luxury font-bold text-slate-900 text-base sm:text-lg">
                Inventory Analytics & Stock Valuation Charts
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                Live Visuals
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Interactive distribution graphs for stock valuation, volume buffers, health ratios, and vendor allocations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Chart View Selector Buttons */}
          <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex items-center gap-1 text-xs">
            <button
              onClick={() => {
                setActiveChartView('valuation');
                setIsExpanded(true);
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeChartView === 'valuation'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              Valuation by Category
            </button>

            <button
              onClick={() => {
                setActiveChartView('volume');
                setIsExpanded(true);
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeChartView === 'volume'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Package className="w-3.5 h-3.5 text-sky-600" />
              Units vs Safety Level
            </button>

            <button
              onClick={() => {
                setActiveChartView('health');
                setIsExpanded(true);
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeChartView === 'health'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PieIcon className="w-3.5 h-3.5 text-amber-600" />
              Health Donut
            </button>

            <button
              onClick={() => {
                setActiveChartView('suppliers');
                setIsExpanded(true);
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeChartView === 'suppliers'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Truck className="w-3.5 h-3.5 text-indigo-600" />
              Top Suppliers
            </button>

            <button
              onClick={() => {
                setActiveChartView('predictive');
                setIsExpanded(true);
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeChartView === 'predictive'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              Predictive Order Dates
            </button>
          </div>

          <button
            onClick={() => setIsExpanded(prev => !prev)}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition border border-slate-200"
            title={isExpanded ? 'Collapse charts' : 'Expand charts'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* KPI METRIC TILES */}
      <div className="px-5 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Total Stock Holding Value</span>
            <span className="text-lg font-bold text-emerald-700 block mt-0.5">
              R {kpis.totalValuation.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-500">Across {inventory.length} catalog items</span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Total Physical Units</span>
            <span className="text-lg font-bold text-slate-900 block mt-0.5">
              {kpis.totalUnits.toLocaleString()} Units
            </span>
            <span className="text-[11px] text-slate-500">On hand in guest house inventory</span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Reorder Deficit Capital</span>
            <span className={`text-lg font-bold block mt-0.5 ${kpis.lowStockCount > 0 ? 'text-amber-600' : 'text-emerald-700'}`}>
              R {kpis.restockCapitalNeeded.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-500">
              {kpis.lowStockCount > 0 ? `${kpis.lowStockCount} items below threshold` : 'All safety buffers intact'}
            </span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Active Approved Vendors</span>
            <span className="text-lg font-bold text-indigo-700 block mt-0.5">
              {kpis.uniqueSuppliers} Suppliers
            </span>
            <span className="text-[11px] text-slate-500">With 1-3 days average delivery</span>
          </div>
        </div>
      </div>

      {/* EXPANDABLE CHART VIEWPORT */}
      {isExpanded && (
        <div className="px-5 sm:px-6 pb-6 animate-fade-in">
          
          {/* ========================================================================= */}
          {/* VIEW 1: VALUATION BY CATEGORY                                            */}
          {/* ========================================================================= */}
          {activeChartView === 'valuation' && (
            <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Stock Holding Valuation by Department (ZAR)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Calculated as on-hand physical quantity multiplied by wholesale unit replacement cost.
                  </p>
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  Total Valuation: <strong className="text-emerald-700">R {kpis.totalValuation.toLocaleString()}</strong>
                </div>
              </div>

              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryChartData} margin={{ top: 15, right: 25, left: 15, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis 
                      dataKey="category" 
                      tick={{ fontSize: 11, fill: '#475569' }} 
                      axisLine={false} 
                      tickLine={false} 
                    />
                    <YAxis 
                      tick={{ fontSize: 11, fill: '#475569' }} 
                      axisLine={false} 
                      tickLine={false}
                      tickFormatter={(v) => `R ${v >= 1000 ? `${Math.round(v / 1000)}k` : v}`} 
                    />
                    <Tooltip 
                      formatter={(val: any) => [`R ${Number(val).toLocaleString()}`, 'Holding Valuation']}
                      labelFormatter={(label, payload) => {
                        const item = payload[0]?.payload;
                        return item ? `${item.fullCategory} (${item.itemCount} items)` : label;
                      }}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar 
                      dataKey="valuationZar" 
                      name="Valuation (ZAR)" 
                      radius={[8, 8, 0, 0]} 
                      barSize={40}
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Category Breakdown Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-2 text-xs border-t border-slate-200/60">
                {categoryChartData.map((cat, i) => (
                  <button
                    key={i}
                    onClick={() => onSelectCategoryFilter && onSelectCategoryFilter(cat.fullCategory)}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-700 flex items-center gap-1.5 transition text-[11px]"
                  >
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }}></span>
                    <span className="font-semibold">{cat.fullCategory}:</span>
                    <strong className="text-slate-900">R {cat.valuationZar.toLocaleString()}</strong>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 2: UNITS VS SAFETY LEVEL                                            */}
          {/* ========================================================================= */}
          {activeChartView === 'volume' && (
            <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Stock Quantity On Hand vs Minimum Safety Reorder Threshold
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Compares current physical units with prescribed minimum levels to flag department safety buffers.
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1.5 text-sky-700 font-semibold">
                    <span className="w-3 h-3 bg-sky-600 rounded"></span> On Hand Units
                  </span>
                  <span className="flex items-center gap-1.5 text-rose-600 font-semibold">
                    <span className="w-3 h-1.5 bg-rose-500 rounded"></span> Reorder Threshold
                  </span>
                </div>
              </div>

              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={categoryChartData} margin={{ top: 15, right: 25, left: 15, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis 
                      dataKey="category" 
                      tick={{ fontSize: 11, fill: '#475569' }} 
                      axisLine={false} 
                      tickLine={false} 
                    />
                    <YAxis 
                      tick={{ fontSize: 11, fill: '#475569' }} 
                      axisLine={false} 
                      tickLine={false} 
                    />
                    <Tooltip 
                      formatter={(val: any, name: any) => [
                        `${val} Units`,
                        name === 'onHandUnits' ? 'On Hand' : 'Safety Reorder Level'
                      ]}
                      labelFormatter={(label, payload) => {
                        const item = payload[0]?.payload;
                        return item ? item.fullCategory : label;
                      }}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #cbd5e1' }}
                    />
                    <Bar dataKey="onHandUnits" name="onHandUnits" fill="#0284c7" radius={[6, 6, 0, 0]} barSize={36} />
                    <Line type="monotone" dataKey="reorderThreshold" name="reorderThreshold" stroke="#e11d48" strokeWidth={3} dot={{ r: 5, fill: '#e11d48' }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 3: HEALTH BREAKDOWN (DONUT)                                         */}
          {/* ========================================================================= */}
          {activeChartView === 'health' && (
            <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Inventory Stock Health & Reorder Ratio
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Proportion of catalog items at safe levels versus those requiring procurement action.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-3">
                <div className="md:col-span-6 h-64 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={healthChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {healthChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(val: any, name: any) => [`${val} Items (${Math.round((Number(val) / inventory.length) * 100)}%)`, name]}
                        contentStyle={{ borderRadius: '12px', border: '1px solid #cbd5e1' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="md:col-span-6 space-y-3">
                  {healthChartData.map((slice, i) => (
                    <div key={i} className="p-3.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between shadow-xs">
                      <div className="flex items-center gap-3">
                        <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: slice.color }}></span>
                        <div>
                          <strong className="block text-slate-900 text-xs">{slice.name}</strong>
                          <span className="text-[11px] text-slate-500">{slice.desc}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-bold text-slate-900 block">{slice.value} Items</span>
                        <span className="text-[10px] font-semibold text-slate-400">
                          {Math.round((slice.value / inventory.length) * 100)}% of Catalog
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 4: TOP SUPPLIERS BY VALUE                                           */}
          {/* ========================================================================= */}
          {activeChartView === 'suppliers' && (
            <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Top Approved Suppliers by Stock Valuation Share
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Click any supplier row to open the Quick Contact & Direct Email dialog.
                  </p>
                </div>
                <span className="text-xs text-slate-400">Click vendor for contact card</span>
              </div>

              <div className="space-y-2 pt-1">
                {supplierChartData.map((sup, idx) => {
                  const sharePct = Math.round((sup.stockValuation / kpis.totalValuation) * 100);
                  return (
                    <div
                      key={idx}
                      onClick={() => onOpenSupplierModal && onOpenSupplierModal(sup.fullSupplier)}
                      className="p-3.5 bg-white hover:bg-emerald-50/70 rounded-xl border border-slate-200 hover:border-emerald-300 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition">
                          #{idx + 1}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 text-xs group-hover:text-emerald-800 transition block">
                            {sup.fullSupplier}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {sup.itemsCount} catalog items • {sup.lowStockItems > 0 ? (
                              <strong className="text-rose-600 font-bold">{sup.lowStockItems} low stock alerts</strong>
                            ) : (
                              'Healthy buffer'
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-right">
                        <div className="w-28 hidden md:block">
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${sharePct}%` }}></div>
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-0.5">{sharePct}% of capital</span>
                        </div>

                        <div>
                          <span className="font-bold text-slate-900 text-sm block">
                            R {sup.stockValuation.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-emerald-700 font-semibold group-hover:underline">
                            Quick Contact & Email &rarr;
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 5: PREDICTIVE RUNOUT & ORDER DATES                                  */}
          {/* ========================================================================= */}
          {activeChartView === 'predictive' && (
            <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    Predictive Stock Runout & Reorder Lead Time Analytics
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Calculated order dates based on daily burn rate, lead times, and minimum safety buffers.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-rose-50 text-rose-800 border border-rose-200 font-bold px-2.5 py-1 rounded-lg">
                    {predictiveOrderList.filter(p => p.daysUntilOrder === 0).length} Immediate Reorders
                  </span>
                  {onOpenPredictiveCalculator && (
                    <button
                      onClick={() => onOpenPredictiveCalculator()}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow-xs transition"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Open Calculator
                    </button>
                  )}
                </div>
              </div>

              {/* Chart showing Days to Order Date */}
              <div className="h-64 w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={predictiveOrderList.map(p => ({
                      code: p.item.itemCode,
                      description: p.item.itemDescription,
                      daysUntilOrder: p.daysUntilOrder,
                      daysUntilZero: p.daysUntilZeroStock,
                      currentStock: p.currentStock,
                      reorderLevel: p.safetyBufferUnits,
                      urgency: p.urgency,
                      dateFormatted: p.suggestedOrderDateFormatted,
                      item: p.item
                    }))}
                    margin={{ top: 15, right: 20, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="code" tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} label={{ value: 'Days to Reorder', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white p-3 rounded-xl border border-slate-700 shadow-xl text-xs space-y-1">
                              <span className="font-bold text-emerald-400 block">[{data.code}] {data.description}</span>
                              <div className="flex justify-between gap-4 text-slate-300">
                                <span>Suggested Order Date:</span>
                                <strong className="text-white">{data.dateFormatted}</strong>
                              </div>
                              <div className="flex justify-between gap-4 text-slate-300">
                                <span>Days Until Order:</span>
                                <strong className={data.daysUntilOrder === 0 ? 'text-rose-400' : 'text-emerald-400'}>
                                  {data.daysUntilOrder === 0 ? 'Order Now (Today)' : `${data.daysUntilOrder} days`}
                                </strong>
                              </div>
                              <div className="flex justify-between gap-4 text-slate-300">
                                <span>Stock Runway to Zero:</span>
                                <span>{data.daysUntilZero} days</span>
                              </div>
                              <div className="flex justify-between gap-4 text-slate-400 text-[10px] pt-1 border-t border-slate-800">
                                <span>On Hand / Reorder Point:</span>
                                <span>{data.currentStock} / {data.reorderLevel} units</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <ReferenceLine y={5} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: '5-Day Urgent Buffer', fill: '#d97706', fontSize: 10 }} />
                    <Bar
                      dataKey="daysUntilOrder"
                      name="Days to Order Date"
                      radius={[6, 6, 0, 0]}
                      barSize={34}
                      onClick={(entry: any) => onOpenPredictiveCalculator && onOpenPredictiveCalculator(entry?.payload?.item || entry?.item)}
                      cursor="pointer"
                    >
                      {predictiveOrderList.map((entry, idx) => (
                        <Cell
                          key={`cell-${idx}`}
                          fill={
                            entry.daysUntilOrder === 0
                              ? '#e11d48'
                              : entry.daysUntilOrder <= 5
                              ? '#f59e0b'
                              : entry.daysUntilOrder <= 14
                              ? '#0284c7'
                              : '#059669'
                          }
                        />
                      ))}
                    </Bar>
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* Cards breakdown for quick reorders */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
                {predictiveOrderList.slice(0, 3).map((itemAnalysis, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-2 hover:border-emerald-300 transition"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-slate-700 text-[11px]">{itemAnalysis.item.itemCode}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          itemAnalysis.urgency === 'immediate' || itemAnalysis.urgency === 'overdue'
                            ? 'bg-rose-100 text-rose-800'
                            : itemAnalysis.urgency === 'urgent'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {itemAnalysis.urgencyLabel}
                        </span>
                      </div>
                      <h5 className="font-bold text-slate-900 text-xs mt-1 truncate">{itemAnalysis.item.itemDescription}</h5>
                      <span className="text-[11px] text-slate-500 block">Supplier: {itemAnalysis.item.supplier}</span>
                    </div>

                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 space-y-0.5 text-[11px]">
                      <div className="flex justify-between text-slate-600">
                        <span>Suggested Order Date:</span>
                        <strong className="text-slate-900">{itemAnalysis.suggestedOrderDateFormatted}</strong>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Lead Time:</span>
                        <span>{itemAnalysis.leadTimeDays} days</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Suggested Order Batch:</span>
                        <strong className="text-emerald-700">+{itemAnalysis.recommendedOrderQty} {itemAnalysis.item.unit}</strong>
                      </div>
                    </div>

                    {onOpenPredictiveCalculator && (
                      <button
                        onClick={() => onOpenPredictiveCalculator(itemAnalysis.item)}
                        className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
                      >
                        <Sparkles className="w-3 h-3 text-emerald-400" />
                        Calculate & Adjust Date
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
