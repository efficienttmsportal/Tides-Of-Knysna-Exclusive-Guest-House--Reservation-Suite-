import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Truck,
  Sparkles,
  X,
  Sliders,
  DollarSign,
  Package,
  Layers,
  Send,
  Save,
  Info,
  ArrowRight,
  Flame,
  ShieldCheck,
  ChevronDown,
  CalendarCheck
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine
} from 'recharts';
import { InventoryItem } from '../types';
import {
  calculateOrderDate,
  PredictiveOrderAnalysis
} from '../utils/predictiveOrderCalculator';

interface PredictiveOrderDateCalculatorModalProps {
  initialItem?: InventoryItem | null;
  allItems: InventoryItem[];
  onClose: () => void;
  onApplyItemSettings?: (itemId: string, settings: { dailyBurnRate: number; leadTimeDays: number; predictedOrderDate: string }) => void;
  onOpenSupplierEmail?: (supplierName: string, item: InventoryItem, suggestedQty: number, suggestedDate: string) => void;
}

export const PredictiveOrderDateCalculatorModal: React.FC<PredictiveOrderDateCalculatorModalProps> = ({
  initialItem,
  allItems,
  onClose,
  onApplyItemSettings,
  onOpenSupplierEmail
}) => {
  // Currently selected item in the calculator
  const [selectedItemId, setSelectedItemId] = useState<string>(
    initialItem?.id || allItems[0]?.id || ''
  );

  const activeItem = useMemo(() => {
    return allItems.find(i => i.id === selectedItemId) || allItems[0];
  }, [allItems, selectedItemId]);

  // Interactive calculation overrides
  const [occupancyRate, setOccupancyRate] = useState<number>(85); // 85% default high season
  const [customBurnRate, setCustomBurnRate] = useState<number | null>(null);
  const [customLeadTime, setCustomLeadTime] = useState<number | null>(null);
  const [customStock, setCustomStock] = useState<number | null>(null);
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  // Reset local overrides when switching items
  const handleSelectItem = (id: string) => {
    setSelectedItemId(id);
    setCustomBurnRate(null);
    setCustomLeadTime(null);
    setCustomStock(null);
    setIsSavedNotice(false);
  };

  // Prepare active item with any real-time stock overrides
  const effectiveItem = useMemo(() => {
    if (!activeItem) return null;
    return {
      ...activeItem,
      howManyOnHand: customStock !== null ? customStock : activeItem.howManyOnHand
    };
  }, [activeItem, customStock]);

  // Compute analysis
  const analysis: PredictiveOrderAnalysis | null = useMemo(() => {
    if (!effectiveItem) return null;
    return calculateOrderDate(effectiveItem, {
      occupancyRate,
      customBurnRate: customBurnRate !== null ? customBurnRate : undefined,
      customLeadTimeDays: customLeadTime !== null ? customLeadTime : undefined
    });
  }, [effectiveItem, occupancyRate, customBurnRate, customLeadTime]);

  if (!effectiveItem || !analysis) return null;

  const currentBurnRate = analysis.dailyBurnRate;
  const currentLeadTime = analysis.leadTimeDays;
  const estimatedOrderCost = analysis.recommendedOrderQty * effectiveItem.pricePerUnit;

  // Handle Save
  const handleSaveToItem = () => {
    if (onApplyItemSettings) {
      onApplyItemSettings(effectiveItem.id, {
        dailyBurnRate: currentBurnRate,
        leadTimeDays: currentLeadTime,
        predictedOrderDate: analysis.suggestedOrderDate
      });
      setIsSavedNotice(true);
      setTimeout(() => setIsSavedNotice(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto no-print animate-fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[92vh]">
        
        {/* MODAL HEADER */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950 text-white p-5 sm:p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-inner">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif-luxury font-bold text-white text-lg sm:text-xl">
                  Predictive 'Order Date' Calculator
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                  AI Lead-Time Forecast
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Calculates precise replenishment dates based on daily burn rate, lead times, and safety thresholds.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition border border-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL BODY (Scrollable) */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
          
          {/* ITEM SELECTOR BAR */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-1">
              <span className="font-bold text-slate-600 shrink-0 flex items-center gap-1.5">
                <Package className="w-4 h-4 text-emerald-600" />
                Selected Catalog Item:
              </span>
              <select
                value={effectiveItem.id}
                onChange={(e) => handleSelectItem(e.target.value)}
                className="bg-white border border-slate-300 text-slate-900 rounded-xl px-3 py-1.5 font-bold outline-none focus:ring-2 focus:ring-emerald-500 flex-1 max-w-md shadow-xs truncate"
              >
                {allItems.map(i => (
                  <option key={i.id} value={i.id}>
                    [{i.itemCode}] {i.itemDescription} ({i.howManyOnHand} {i.unit} on hand)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 text-slate-500 text-[11px] shrink-0">
              <span className="px-2 py-0.5 bg-slate-200/80 text-slate-700 rounded-md font-semibold">
                Category: {effectiveItem.category}
              </span>
              <span className="px-2 py-0.5 bg-slate-200/80 text-slate-700 rounded-md font-semibold">
                Supplier: {effectiveItem.supplier}
              </span>
            </div>
          </div>

          {/* DYNAMIC PREDICTIVE RESULT HIGHLIGHT BANNER */}
          <div className={`p-5 rounded-2xl border transition-all ${
            analysis.urgency === 'overdue' || analysis.urgency === 'immediate'
              ? 'bg-rose-50/90 border-rose-300 shadow-sm'
              : analysis.urgency === 'urgent'
              ? 'bg-amber-50/90 border-amber-300 shadow-sm'
              : 'bg-emerald-50/80 border-emerald-300 shadow-sm'
          }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                    analysis.urgency === 'overdue' || analysis.urgency === 'immediate'
                      ? 'bg-rose-600 text-white'
                      : analysis.urgency === 'urgent'
                      ? 'bg-amber-500 text-white'
                      : 'bg-emerald-600 text-white'
                  }`}>
                    {analysis.urgency === 'immediate' || analysis.urgency === 'overdue' ? (
                      <Flame className="w-3 h-3" />
                    ) : (
                      <CalendarCheck className="w-3 h-3" />
                    )}
                    {analysis.urgencyLabel}
                  </span>
                  <span className="text-xs text-slate-500">
                    Lead time factored: {currentLeadTime} days
                  </span>
                </div>

                <div className="pt-1">
                  <span className="text-xs text-slate-600 block">Suggested Reorder Date:</span>
                  <h4 className="text-2xl sm:text-3xl font-bold font-serif-luxury text-slate-900 flex items-baseline gap-2">
                    {analysis.suggestedOrderDateFormatted}
                    <span className="text-sm font-sans font-normal text-slate-600">
                      {analysis.daysUntilOrder === 0 ? '(Order Today / Imminent)' : `(in ${analysis.daysUntilOrder} days)`}
                    </span>
                  </h4>
                </div>

                <p className="text-xs text-slate-600 max-w-xl">
                  {analysis.daysUntilOrder === 0
                    ? `Current stock (${effectiveItem.howManyOnHand} ${effectiveItem.unit}) is at or below the safety threshold (${effectiveItem.whenToReorder} ${effectiveItem.unit}). Immediate order needed to avoid stockout.`
                    : `Stock will drop to the ${effectiveItem.whenToReorder} ${effectiveItem.unit} safety threshold in ${analysis.daysUntilReorderThreshold} days. Ordering on ${analysis.suggestedOrderDateFormatted} ensures replenishment arrives before safety stock is breached.`}
                </p>
              </div>

              {/* Quick Metrics Columns */}
              <div className="grid grid-cols-2 gap-2 text-xs shrink-0 bg-white/80 p-3.5 rounded-xl border border-slate-200/80">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Days to Stockout</span>
                  <strong className="text-sm font-bold text-slate-900 block mt-0.5">
                    {analysis.daysUntilZeroStock} Days
                  </strong>
                  <span className="text-[10px] text-slate-500">({analysis.stockoutDate})</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Suggested Order Qty</span>
                  <strong className="text-sm font-bold text-emerald-700 block mt-0.5">
                    +{analysis.recommendedOrderQty} {effectiveItem.unit}
                  </strong>
                  <span className="text-[10px] text-slate-500">~R {estimatedOrderCost.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* PARAMETERS ADJUSTMENT DECK (3 Columns) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            
            {/* 1. Daily Consumption Rate Controller */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <TrendingDown className="w-4 h-4 text-amber-600" />
                  Daily Burn Rate
                </span>
                <span className="font-mono font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-lg text-xs">
                  {currentBurnRate} {effectiveItem.unit}/day
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Rate at which guests and housekeeping consume this item daily.
              </p>

              {/* Slider */}
              <div className="space-y-1">
                <input
                  type="range"
                  min="0.1"
                  max="10"
                  step="0.1"
                  value={currentBurnRate}
                  onChange={(e) => setCustomBurnRate(parseFloat(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>0.1 /day</span>
                  <span>5.0 /day</span>
                  <span>10.0 /day</span>
                </div>
              </div>

              {/* Seasonal Preset Buttons */}
              <div className="pt-1 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Seasonal Occupancy Presets:
                </span>
                <div className="grid grid-cols-3 gap-1 text-[10px]">
                  <button
                    onClick={() => {
                      setOccupancyRate(50);
                      setCustomBurnRate(null);
                    }}
                    className={`p-1.5 rounded-lg border font-semibold transition ${
                      occupancyRate === 50 ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Low (50%)
                  </button>
                  <button
                    onClick={() => {
                      setOccupancyRate(75);
                      setCustomBurnRate(null);
                    }}
                    className={`p-1.5 rounded-lg border font-semibold transition ${
                      occupancyRate === 75 ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Mid (75%)
                  </button>
                  <button
                    onClick={() => {
                      setOccupancyRate(95);
                      setCustomBurnRate(null);
                    }}
                    className={`p-1.5 rounded-lg border font-semibold transition ${
                      occupancyRate === 95 ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Peak (95%)
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Supplier Delivery Lead Time */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-sky-600" />
                  Supplier Lead Time
                </span>
                <span className="font-mono font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-lg text-xs">
                  {currentLeadTime} Business Days
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Delivery duration from {effectiveItem.supplier} to Knysna guest house.
              </p>

              {/* Stepper Buttons */}
              <div className="grid grid-cols-4 gap-1.5 pt-2">
                {[1, 2, 3, 5].map(days => (
                  <button
                    key={days}
                    onClick={() => setCustomLeadTime(days)}
                    className={`py-2 rounded-xl font-bold border transition text-center ${
                      currentLeadTime === days
                        ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {days} {days === 1 ? 'Day' : 'Days'}
                  </button>
                ))}
              </div>

              <div className="text-[11px] text-slate-500 bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="font-semibold block text-slate-800">Buffer Rule:</span>
                Order triggered {currentLeadTime} days prior to hitting safety stock.
              </div>
            </div>

            {/* 3. Physical On Hand Stock Simulation */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-emerald-600" />
                  On-Hand Stock Simulation
                </span>
                <span className="font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-lg text-xs">
                  {effectiveItem.howManyOnHand} {effectiveItem.unit}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Simulate stock consumption or recent deliveries to see date update live.
              </p>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setCustomStock(Math.max(0, effectiveItem.howManyOnHand - 5))}
                  className="flex-1 py-1.5 bg-white hover:bg-rose-50 hover:text-rose-700 text-slate-700 border border-slate-200 rounded-xl font-bold transition shadow-xs"
                >
                  -5 Units
                </button>
                <button
                  onClick={() => setCustomStock(Math.max(0, effectiveItem.howManyOnHand - 1))}
                  className="flex-1 py-1.5 bg-white hover:bg-rose-50 hover:text-rose-700 text-slate-700 border border-slate-200 rounded-xl font-bold transition shadow-xs"
                >
                  -1
                </button>
                <button
                  onClick={() => setCustomStock(effectiveItem.howManyOnHand + 1)}
                  className="flex-1 py-1.5 bg-white hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 border border-slate-200 rounded-xl font-bold transition shadow-xs"
                >
                  +1
                </button>
                <button
                  onClick={() => setCustomStock(effectiveItem.howManyOnHand + 10)}
                  className="flex-1 py-1.5 bg-white hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 border border-slate-200 rounded-xl font-bold transition shadow-xs"
                >
                  +10
                </button>
              </div>

              {customStock !== null && (
                <button
                  onClick={() => setCustomStock(null)}
                  className="w-full text-center text-[10px] text-slate-500 hover:text-slate-800 underline"
                >
                  Reset to Actual On Hand ({activeItem.howManyOnHand})
                </button>
              )}
            </div>
          </div>

          {/* VISUAL RECHARTS DEPLETION CURVE & TIMELINE */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-emerald-400" />
                  Predictive Depletion Curve & Reorder Timeline
                </h4>
                <p className="text-[11px] text-slate-400">
                  Visualizes projected stock rundown vs safety threshold and scheduled order trigger date.
                </p>
              </div>

              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Stock Rundown
                </span>
                <span className="flex items-center gap-1.5 text-rose-400">
                  <span className="w-2.5 h-0.5 bg-rose-500"></span> Safety Buffer ({effectiveItem.whenToReorder})
                </span>
                <span className="flex items-center gap-1.5 text-amber-400">
                  <span className="w-2.5 h-0.5 bg-amber-400 border-dashed"></span> Suggested Order Point
                </span>
              </div>
            </div>

            <div className="h-56 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={analysis.dailyDepletionPoints}
                  margin={{ top: 10, right: 20, left: -10, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="depletionGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#64748b"
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    tickLine={false}
                    interval={Math.max(1, Math.floor(analysis.dailyDepletionPoints.length / 8))}
                  />
                  <YAxis
                    stroke="#64748b"
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    tickLine={false}
                    domain={[0, Math.max(effectiveItem.whenToReorder * 2, effectiveItem.howManyOnHand + 5)]}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                    formatter={(val: any) => [`${val} ${effectiveItem.unit}`, 'Projected Stock']}
                  />

                  {/* Safety Buffer Horizontal Reference Line */}
                  <ReferenceLine
                    y={effectiveItem.whenToReorder}
                    stroke="#f43f5e"
                    strokeDasharray="3 3"
                    label={{
                      value: `Safety Buffer (${effectiveItem.whenToReorder})`,
                      fill: '#f43f5e',
                      fontSize: 10,
                      position: 'insideTopRight'
                    }}
                  />

                  {/* Order Day Vertical Line */}
                  {analysis.daysUntilOrder >= 0 && analysis.daysUntilOrder < analysis.dailyDepletionPoints.length && (
                    <ReferenceLine
                      x={analysis.dailyDepletionPoints[analysis.daysUntilOrder]?.date}
                      stroke="#f59e0b"
                      strokeWidth={2}
                      label={{
                        value: 'ORDER DATE',
                        fill: '#fbbf24',
                        fontSize: 10,
                        fontWeight: 'bold',
                        position: 'top'
                      }}
                    />
                  )}

                  <Area
                    type="monotone"
                    dataKey="stockOnHand"
                    fill="url(#depletionGradient)"
                    stroke="#10b981"
                    strokeWidth={2.5}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* MODAL FOOTER ACTIONS */}
        <div className="bg-slate-50 p-4 sm:p-5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {isSavedNotice && (
              <span className="text-xs text-emerald-700 font-bold flex items-center gap-1 animate-fade-in">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Settings saved to inventory item!
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs border border-slate-200 transition shadow-xs"
            >
              Close
            </button>

            {onApplyItemSettings && (
              <button
                onClick={handleSaveToItem}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-xs"
              >
                <Save className="w-3.5 h-3.5 text-emerald-400" />
                Save Parameters
              </button>
            )}

            {onOpenSupplierEmail && (
              <button
                onClick={() => {
                  onOpenSupplierEmail(
                    effectiveItem.supplier,
                    effectiveItem,
                    analysis.recommendedOrderQty,
                    analysis.suggestedOrderDateFormatted
                  );
                  onClose();
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
              >
                <Send className="w-3.5 h-3.5" />
                Email Supplier with Order Date
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
