import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell
} from 'recharts';
import {
  DollarSign,
  Star,
  Zap,
  TrendingUp,
  ArrowUpRight,
  ShieldCheck,
  Clock,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Award,
  Layers,
  Activity,
  SlidersHorizontal,
  Compass
} from 'lucide-react';
import {
  MONTHLY_SALES_SUMMARY,
  GUEST_SATISFACTION_METRICS,
  GUEST_SATISFACTION_TREND,
  OPERATIONAL_EFFICIENCY_METRICS,
  MONTHLY_EFFICIENCY_TREND
} from '../data/performanceSummaryData';

interface PerformanceSummaryRowProps {
  onViewSales?: () => void;
}

export const PerformanceSummaryRow: React.FC<PerformanceSummaryRowProps> = ({
  onViewSales
}) => {
  const [csatView, setCsatView] = useState<'touchpoints' | 'trend'>('touchpoints');
  const [salesTimeframe, setSalesTimeframe] = useState<'sep' | 'q3' | 'ytd'>('sep');
  const [showDeepDive, setShowDeepDive] = useState(false);

  // Currency Formatter
  const formatZar = (val: number) => `R ${val.toLocaleString('en-ZA')}`;

  // Current Month Snapshot (Sep 2026)
  const currentSales = MONTHLY_SALES_SUMMARY[5]; // Sep 2026
  const salesAttainment = Math.round((currentSales.actualZar / currentSales.targetZar) * 100);
  const salesVariance = currentSales.actualZar - currentSales.targetZar;

  // Filtered sales data based on range
  const salesDisplayData = useMemo(() => {
    if (salesTimeframe === 'sep') {
      return MONTHLY_SALES_SUMMARY.slice(2, 6); // Jun to Sep (clean 4 bars for summary card)
    } else if (salesTimeframe === 'q3') {
      return MONTHLY_SALES_SUMMARY.slice(3, 6); // Jul, Aug, Sep
    }
    return MONTHLY_SALES_SUMMARY.slice(0, 6); // Apr to Sep
  }, [salesTimeframe]);

  // Safe Tooltip for Sales
  const SalesTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950/95 text-white p-2.5 rounded-xl border border-slate-800 shadow-xl text-xs space-y-1">
          <p className="font-bold text-emerald-400 border-b border-slate-800 pb-1 text-[11px]">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-3 text-[10px]">
              <span className="text-slate-300 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}:
              </span>
              <span className="font-mono font-bold text-white">{formatZar(entry.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Safe Tooltip for CSAT
  const CsatTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-950/95 text-white p-2.5 rounded-xl border border-slate-800 shadow-xl text-xs space-y-1">
          <p className="font-bold text-amber-400 border-b border-slate-800 pb-1 text-[11px]">
            {data.department || label}
          </p>
          <div className="flex items-center justify-between gap-3 text-[10px]">
            <span className="text-slate-300">Rating:</span>
            <span className="font-mono font-bold text-amber-300">
              {data.rating ? `${data.rating} / 5.0` : `${data.csat} / 5.0`}
            </span>
          </div>
          {data.positivePct && (
            <div className="flex items-center justify-between gap-3 text-[10px]">
              <span className="text-slate-300">Positive:</span>
              <span className="font-mono font-bold text-emerald-400">{data.positivePct}%</span>
            </div>
          )}
          {data.reviewsCount && (
            <div className="flex items-center justify-between gap-3 text-[10px]">
              <span className="text-slate-300">Reviews:</span>
              <span className="font-mono text-slate-300">{data.reviewsCount}</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Safe Tooltip for Efficiency
  const EfficiencyTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-950/95 text-white p-2.5 rounded-xl border border-slate-800 shadow-xl text-xs space-y-1">
          <p className="font-bold text-cyan-400 border-b border-slate-800 pb-1 text-[11px]">Month: {label}</p>
          <div className="flex items-center justify-between gap-3 text-[10px]">
            <span className="text-slate-300">Total Efficiency:</span>
            <span className="font-mono font-bold text-cyan-300">{data.efficiencyIndex}%</span>
          </div>
          <div className="flex items-center justify-between gap-3 text-[10px]">
            <span className="text-slate-300">Room Turnaround:</span>
            <span className="font-mono font-bold text-purple-300">{data.roomTurnaroundMins} mins</span>
          </div>
          <div className="flex items-center justify-between gap-3 text-[10px]">
            <span className="text-slate-300">Inspection Pass:</span>
            <span className="font-mono font-bold text-emerald-400">{data.inspectionPassPct}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div id="executive-summary-row" className="mb-6 space-y-3">
      {/* Top Controls & Meta Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 px-4 py-2.5 shadow-xs flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center justify-center font-bold">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 tracking-wide">
                Management Insights Summary Row
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.2 rounded-full uppercase tracking-wider">
                Recharts Live
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Interactive high-level visualizations for Monthly Sales, Guest Satisfaction (CSAT), and Total Operational Efficiency
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Timeframe Selector */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-[11px] font-medium text-slate-600">
            <button
              onClick={() => setSalesTimeframe('sep')}
              className={`px-2 py-0.5 rounded-md transition ${
                salesTimeframe === 'sep' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'hover:text-slate-900'
              }`}
            >
              Recent
            </button>
            <button
              onClick={() => setSalesTimeframe('q3')}
              className={`px-2 py-0.5 rounded-md transition ${
                salesTimeframe === 'q3' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'hover:text-slate-900'
              }`}
            >
              Q3 Pacing
            </button>
            <button
              onClick={() => setSalesTimeframe('ytd')}
              className={`px-2 py-0.5 rounded-md transition ${
                salesTimeframe === 'ytd' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'hover:text-slate-900'
              }`}
            >
              YTD
            </button>
          </div>

          {/* Toggle Deep Dive */}
          <button
            id="btn-toggle-deep-dive"
            onClick={() => setShowDeepDive(prev => !prev)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            <SlidersHorizontal className="w-3 h-3 text-slate-500" />
            <span>{showDeepDive ? 'Hide Breakdown' : 'Deep Dive'}</span>
            {showDeepDive ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {/* Roster Link */}
          {onViewSales && (
            <button
              onClick={onViewSales}
              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline ml-1"
            >
              <span>Sales Roster</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3 RECHARTS WIDGETS SUMMARY ROW                                            */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ========================================================================= */}
        {/* WIDGET 1: MONTHLY SALES PERFORMANCE                                       */}
        {/* ========================================================================= */}
        <div
          id="widget-summary-monthly-sales"
          className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div>
            {/* Header & Badges */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center justify-center font-bold">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs leading-tight">Monthly Sales Pacing</h4>
                  <span className="text-[10px] text-slate-500">Actual vs Target Budget (ZAR)</span>
                </div>
              </div>

              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono">
                {salesAttainment}% Target
              </span>
            </div>

            {/* Metric Big Number */}
            <div className="flex items-baseline justify-between mb-2">
              <div>
                <span className="text-xl font-bold font-serif-luxury text-slate-900">
                  {formatZar(currentSales.actualZar)}
                </span>
                <span className="text-[10px] text-slate-400 ml-1.5 font-medium">Sep 2026 Actual</span>
              </div>
              <div className="text-[11px] text-emerald-700 font-bold flex items-center gap-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+{formatZar(salesVariance)} ahead</span>
              </div>
            </div>

            {/* Recharts Chart: Composed Bar + Line */}
            <div className="h-36 w-full -ml-3">
              <ResponsiveContainer width="100%" height={144}>
                <ComposedChart data={salesDisplayData} margin={{ top: 8, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="shortMonth" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v) => `R${v/1000}k`} tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<SalesTooltip />} />
                  <Bar dataKey="actualZar" name="Actual Sales" fill="#059669" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  <Line type="monotone" dataKey="targetZar" name="Target Plan" stroke="#0f172a" strokeWidth={2} strokeDasharray="3 3" dot={{ r: 3, fill: '#0f172a' }} />
                  <Line type="monotone" dataKey="priorYearZar" name="Prior Year" stroke="#f59e0b" strokeWidth={1.5} dot={{ r: 2.5, fill: '#f59e0b' }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Footer Highlights */}
          <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
            <span className="flex items-center gap-1 text-emerald-700 font-semibold">
              <Sparkles className="w-3 h-3 text-emerald-600" /> +23% YoY Growth
            </span>
            <span className="font-mono text-slate-600">Suites: R206k (68%)</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* WIDGET 2: GUEST SATISFACTION RATINGS (CSAT)                              */}
        {/* ========================================================================= */}
        <div
          id="widget-summary-guest-satisfaction"
          className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div>
            {/* Header & Badges */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/80 flex items-center justify-center font-bold">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs leading-tight">Guest Satisfaction Ratings</h4>
                  <span className="text-[10px] text-slate-500">Departmental CSAT & NPS Score</span>
                </div>
              </div>

              <button
                onClick={() => setCsatView(prev => prev === 'touchpoints' ? 'trend' : 'touchpoints')}
                className="text-[10px] font-semibold text-slate-600 hover:text-slate-900 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 flex items-center gap-1"
                title="Toggle between touchpoint ratings and 6-month trend"
              >
                {csatView === 'touchpoints' ? 'Trend' : 'Depts'}
              </button>
            </div>

            {/* Metric Big Number */}
            <div className="flex items-baseline justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold font-serif-luxury text-amber-500">4.95</span>
                <span className="text-xs text-slate-400 font-medium">/ 5.0</span>
                <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded font-mono ml-1">
                  NPS +88
                </span>
              </div>
              <div className="text-[11px] text-emerald-700 font-bold">
                98.8% Positive
              </div>
            </div>

            {/* Recharts Chart: Touchpoints Horizontal Bars or Monthly Trend */}
            <div className="h-36 w-full -ml-3">
              <ResponsiveContainer width="100%" height={144}>
                {csatView === 'touchpoints' ? (
                  <BarChart
                    data={GUEST_SATISFACTION_METRICS.slice(0, 4)}
                    layout="vertical"
                    margin={{ top: 4, right: 15, left: 10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" domain={[4.6, 5.0]} tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="department" tick={{ fontSize: 9, fill: '#334155' }} width={85} axisLine={false} tickLine={false} />
                    <Tooltip content={<CsatTooltip />} />
                    <ReferenceLine x={4.80} stroke="#ef4444" strokeDasharray="2 2" />
                    <Bar dataKey="rating" name="Rating" radius={[0, 4, 4, 0]} maxBarSize={14}>
                      {GUEST_SATISFACTION_METRICS.slice(0, 4).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.rating >= 4.95 ? '#059669' : '#d97706'} />
                      ))}
                    </Bar>
                  </BarChart>
                ) : (
                  <ComposedChart data={GUEST_SATISFACTION_TREND} margin={{ top: 8, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[4.80, 5.00]} tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CsatTooltip />} />
                    <Line type="monotone" dataKey="csat" name="CSAT" stroke="#d97706" strokeWidth={2.5} dot={{ r: 3, fill: '#d97706' }} />
                  </ComposedChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Footer Highlights */}
          <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
            <span className="flex items-center gap-1 text-slate-700">
              <ShieldCheck className="w-3 h-3 text-amber-500" /> Target 4.80 Exceeded
            </span>
            <span className="text-slate-500">142 guest surveys</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* WIDGET 3: TOTAL OPERATIONAL EFFICIENCY                                    */}
        {/* ========================================================================= */}
        <div
          id="widget-summary-operational-efficiency"
          className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div>
            {/* Header & Badges */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-700 border border-cyan-200/80 flex items-center justify-center font-bold">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs leading-tight">Total Operational Efficiency</h4>
                  <span className="text-[10px] text-slate-500">Quality Index & Turnaround Speed</span>
                </div>
              </div>

              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 font-mono">
                97.8% Optimal
              </span>
            </div>

            {/* Metric Big Number */}
            <div className="flex items-baseline justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold font-serif-luxury text-cyan-700">97.8%</span>
                <span className="text-xs text-slate-400 font-medium">Composite</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-cyan-800 font-bold">
                <Clock className="w-3 h-3 text-cyan-600" />
                <span>36m turnaround</span>
              </div>
            </div>

            {/* Recharts Chart: AreaChart for Efficiency Index */}
            <div className="h-36 w-full -ml-3">
              <ResponsiveContainer width="100%" height={144}>
                <AreaChart data={MONTHLY_EFFICIENCY_TREND} margin={{ top: 8, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="cyanRowGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0891b2" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#0891b2" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[92, 100]} tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                  <Tooltip content={<EfficiencyTooltip />} />
                  <ReferenceLine y={95} stroke="#0f172a" strokeDasharray="3 3" />
                  <Area
                    type="monotone"
                    dataKey="efficiencyIndex"
                    name="Efficiency Index"
                    stroke="#0891b2"
                    strokeWidth={2.2}
                    fillOpacity={1}
                    fill="url(#cyanRowGrad)"
                    dot={{ r: 3, fill: '#0891b2' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Footer Highlights */}
          <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
            <span className="flex items-center gap-1 text-slate-700 font-medium">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> 98.6% Cleanliness Pass
            </span>
            <span className="font-mono text-slate-600">SLA: 6.8m request</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* EXPANDABLE DEEP DIVE (Optional Breakdown for Management Inquiries)       */}
      {/* ========================================================================= */}
      {showDeepDive && (
        <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-lg animate-in fade-in duration-200 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <h4 className="font-bold text-sm text-white">Tri-Pillar Comprehensive Breakdown</h4>
            </div>
            <span className="text-xs text-slate-400 font-mono">Knysna Lagoon Luxury Guesthouse</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Sales Streams */}
            <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
              <h5 className="font-bold text-emerald-400 mb-2.5 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5" /> Revenue Streams (Sep)
              </h5>
              <div className="space-y-2 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-300">Lagoon Luxury Suites (68%)</span>
                  <span className="font-mono font-bold text-white">R 206,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Dining & Cellar (17%)</span>
                  <span className="font-mono font-bold text-white">R 51,200</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Lagoon Charters & Tours (10%)</span>
                  <span className="font-mono font-bold text-white">R 31,800</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Spa & Wellness (5%)</span>
                  <span className="font-mono font-bold text-white">R 16,000</span>
                </div>
              </div>
            </div>

            {/* Department CSAT Scores */}
            <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
              <h5 className="font-bold text-amber-400 mb-2.5 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 fill-amber-400" /> Touchpoint Ratings
              </h5>
              <div className="space-y-2 text-[11px]">
                {GUEST_SATISFACTION_METRICS.slice(0, 4).map((m, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-slate-300">{m.department}</span>
                    <span className="font-mono font-bold text-amber-300">{m.rating} / 5.0</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Operational Quality Standards */}
            <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
              <h5 className="font-bold text-cyan-400 mb-2.5 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" /> Core Operational Metrics
              </h5>
              <div className="space-y-2 text-[11px]">
                {OPERATIONAL_EFFICIENCY_METRICS.slice(0, 4).map((m, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-slate-300">{m.metric}</span>
                    <span className="font-mono font-bold text-cyan-300">{m.currentValue} {m.unit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
