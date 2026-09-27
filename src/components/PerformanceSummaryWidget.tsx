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
  Legend,
  Cell,
  ReferenceLine,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import {
  TrendingUp,
  Award,
  Star,
  Zap,
  Clock,
  CheckCircle,
  Users,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  ShieldCheck,
  Sparkles,
  SlidersHorizontal,
  Compass,
  DollarSign,
  HeartHandshake,
  Activity,
  Layers,
  BarChart3,
  Calendar,
  Eye
} from 'lucide-react';
import {
  MONTHLY_SALES_SUMMARY,
  GUEST_SATISFACTION_METRICS,
  GUEST_SATISFACTION_TREND,
  OPERATIONAL_EFFICIENCY_METRICS,
  MONTHLY_EFFICIENCY_TREND
} from '../data/performanceSummaryData';

interface PerformanceSummaryWidgetProps {
  onViewSalesModule?: () => void;
}

type TabType = 'overview' | 'sales' | 'satisfaction' | 'efficiency';

export const PerformanceSummaryWidget: React.FC<PerformanceSummaryWidgetProps> = ({
  onViewSalesModule
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [timeRange, setTimeRange] = useState<'sep' | 'q3' | 'ytd'>('sep');

  // Format currency in ZAR
  const formatZar = (val: number) => `R ${val.toLocaleString('en-ZA')}`;

  // Filtered sales data based on range
  const salesDisplayData = useMemo(() => {
    if (timeRange === 'sep') {
      return MONTHLY_SALES_SUMMARY.slice(0, 6); // Apr to Sep
    } else if (timeRange === 'q3') {
      return MONTHLY_SALES_SUMMARY.slice(3, 6); // Jul, Aug, Sep
    }
    return MONTHLY_SALES_SUMMARY;
  }, [timeRange]);

  // Current month (Sep 2026) snapshot
  const currentSales = MONTHLY_SALES_SUMMARY[5]; // Sep 2026
  const salesAttainment = Math.round((currentSales.actualZar / currentSales.targetZar) * 100);
  const salesVariance = currentSales.actualZar - currentSales.targetZar;

  // Average CSAT
  const avgCsat = useMemo(() => {
    const total = GUEST_SATISFACTION_METRICS.reduce((acc, m) => acc + m.rating, 0);
    return (total / GUEST_SATISFACTION_METRICS.length).toFixed(2);
  }, []);

  // Composite Efficiency
  const compositeEfficiency = useMemo(() => {
    const latest = MONTHLY_EFFICIENCY_TREND[MONTHLY_EFFICIENCY_TREND.length - 1];
    return latest.efficiencyIndex;
  }, []);

  // Safe Tooltip for Sales
  const CustomSalesTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950 text-white p-3 rounded-xl border border-slate-800 shadow-xl text-xs space-y-1">
          <p className="font-bold text-emerald-400 text-xs border-b border-slate-800 pb-1">{label}</p>
          {payload.map((item: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between gap-3 text-[11px]">
              <span className="text-slate-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                {item.name}:
              </span>
              <span className="font-mono font-bold text-white">{formatZar(item.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Safe Tooltip for CSAT
  const CustomCsatTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-950 text-white p-3 rounded-xl border border-slate-800 shadow-xl text-xs space-y-1">
          <p className="font-bold text-amber-400 text-xs border-b border-slate-800 pb-1">{data.department}</p>
          <div className="flex items-center justify-between gap-4 text-[11px]">
            <span className="text-slate-300">CSAT Score:</span>
            <span className="font-mono font-bold text-amber-300">{data.rating} / 5.0</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-[11px]">
            <span className="text-slate-300">Positive Feedback:</span>
            <span className="font-mono font-bold text-emerald-400">{data.positivePct}%</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-[11px]">
            <span className="text-slate-300">Reviewed Guests:</span>
            <span className="font-mono text-slate-300">{data.reviewsCount} reviews</span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Safe Tooltip for Efficiency
  const CustomEfficiencyTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950 text-white p-3 rounded-xl border border-slate-800 shadow-xl text-xs space-y-1">
          <p className="font-bold text-cyan-400 text-xs border-b border-slate-800 pb-1">Month: {label}</p>
          {payload.map((item: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between gap-3 text-[11px]">
              <span className="text-slate-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                {item.name}:
              </span>
              <span className="font-mono font-bold text-white">
                {item.value} {item.unit || '%'}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div
      id="widget-performance-summary"
      className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden mb-6 transition-all duration-300"
    >
      {/* Top Gradient Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white px-5 py-4 border-b border-slate-800">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold shadow-inner">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif-luxury font-bold text-white text-base tracking-wide">
                  Performance Summary
                </h3>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 uppercase tracking-wider">
                  Executive Suite Tri-Pillar
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Real-time visualization of monthly sales pacing, guest satisfaction ratings (CSAT), and operational efficiency
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Time range selector */}
            <div className="flex items-center bg-slate-800/90 border border-slate-700/80 rounded-xl p-0.5 text-xs">
              <button
                onClick={() => setTimeRange('sep')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  timeRange === 'sep' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Sep 2026
              </button>
              <button
                onClick={() => setTimeRange('q3')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  timeRange === 'q3' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Q3 Pacing
              </button>
              <button
                onClick={() => setTimeRange('ytd')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  timeRange === 'ytd' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Year-to-Date
              </button>
            </div>

            {/* Collapse toggle */}
            <button
              id="btn-toggle-summary-collapse"
              onClick={() => setIsCollapsed(prev => !prev)}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition"
              title={isCollapsed ? 'Expand Widget' : 'Minimize Widget'}
            >
              {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* 4 Core KPI Micro-Cards (Always visible for fast scanning) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4 text-xs">
          {/* Pillar 1: Monthly Sales */}
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60 relative overflow-hidden group hover:border-emerald-500/40 transition">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-emerald-400" /> Monthly Sales
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.2 rounded font-mono">
                {salesAttainment}% Target
              </span>
            </div>
            <div className="text-xl font-bold font-serif-luxury text-white">
              {formatZar(currentSales.actualZar)}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-emerald-400">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+{formatZar(salesVariance)} ahead of target</span>
            </div>
          </div>

          {/* Pillar 2: Guest Satisfaction */}
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60 relative overflow-hidden group hover:border-amber-500/40 transition">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> Guest CSAT Score
              </span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.2 rounded font-mono">
                NPS +88
              </span>
            </div>
            <div className="text-xl font-bold font-serif-luxury text-amber-400 flex items-center gap-1.5">
              <span>{avgCsat}</span>
              <span className="text-xs text-slate-400 font-normal">/ 5.0</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>98.8% positive guest reviews</span>
            </div>
          </div>

          {/* Pillar 3: Operational Efficiency */}
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60 relative overflow-hidden group hover:border-cyan-500/40 transition">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
                <Zap className="w-3 h-3 text-cyan-400" /> Efficiency Index
              </span>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-bold px-1.5 py-0.2 rounded font-mono">
                Optimal
              </span>
            </div>
            <div className="text-xl font-bold font-serif-luxury text-cyan-400">
              {compositeEfficiency}%
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Target: &gt;95.0% SLA compliance</span>
            </div>
          </div>

          {/* Pillar 4: Suite Turnaround Speed */}
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60 relative overflow-hidden group hover:border-purple-500/40 transition">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
                <Clock className="w-3 h-3 text-purple-400" /> Suite Turnaround
              </span>
              <span className="text-[10px] bg-purple-500/20 text-purple-300 font-bold px-1.5 py-0.2 rounded font-mono">
                9 mins fast
              </span>
            </div>
            <div className="text-xl font-bold font-serif-luxury text-white flex items-center gap-1">
              <span>36</span>
              <span className="text-xs text-slate-400 font-normal">minutes</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-emerald-400">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>98.6% first-pass audit rating</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Body (Recharts Visualizations) */}
      {!isCollapsed && (
        <div className="p-5 space-y-5 animate-in fade-in duration-200">
          {/* Sub-Tab Navigation Bar */}
          <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                id="btn-tab-overview"
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                  activeTab === 'overview'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                Tri-Pillar Overview
              </button>

              <button
                id="btn-tab-sales"
                onClick={() => setActiveTab('sales')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                  activeTab === 'sales'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                Monthly Sales
              </button>

              <button
                id="btn-tab-satisfaction"
                onClick={() => setActiveTab('satisfaction')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                  activeTab === 'satisfaction'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                Guest Satisfaction (CSAT)
              </button>

              <button
                id="btn-tab-efficiency"
                onClick={() => setActiveTab('efficiency')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                  activeTab === 'efficiency'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-cyan-600" />
                Operational Efficiency
              </button>
            </div>

            {onViewSalesModule && (
              <button
                onClick={onViewSalesModule}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
              >
                <span>Open Detailed Sales Roster</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* ========================================================================= */}
          {/* TAB 1: TRI-PILLAR OVERVIEW                                                */}
          {/* ========================================================================= */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Chart 1: Monthly Sales Pacing */}
              <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                      Monthly Sales vs Target
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded">
                      +23% YoY
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Actual revenue vs monthly target budget (ZAR)
                  </p>

                  <div className="h-52 w-full">
                    <ResponsiveContainer width="100%" height={208}>
                      <ComposedChart data={salesDisplayData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="shortMonth" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={(v) => `R${v/1000}k`} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomSalesTooltip />} />
                        <Bar dataKey="actualZar" name="Actual Sales" fill="#059669" radius={[4, 4, 0, 0]} maxBarSize={28} />
                        <Line type="monotone" dataKey="targetZar" name="Target Plan" stroke="#0f172a" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-600 flex items-center justify-between">
                  <span>Sep Actual: <strong>{formatZar(currentSales.actualZar)}</strong></span>
                  <span className="text-emerald-700 font-bold">111% Attainment</span>
                </div>
              </div>

              {/* Chart 2: Guest Satisfaction by Touchpoint */}
              <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      Guest Satisfaction (CSAT)
                    </span>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded">
                      {avgCsat} / 5.0
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Guest survey ratings across hospitality departments
                  </p>

                  <div className="h-52 w-full">
                    <ResponsiveContainer width="100%" height={208}>
                      <BarChart
                        data={GUEST_SATISFACTION_METRICS}
                        layout="vertical"
                        margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                        <XAxis type="number" domain={[4.5, 5.0]} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="department" tick={{ fontSize: 9, fill: '#334155' }} width={85} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomCsatTooltip />} />
                        <ReferenceLine x={4.8} stroke="#ef4444" strokeDasharray="3 3" />
                        <Bar dataKey="rating" name="CSAT Score" radius={[0, 4, 4, 0]} maxBarSize={16}>
                          {GUEST_SATISFACTION_METRICS.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.rating >= 4.95 ? '#059669' : '#d97706'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-600 flex items-center justify-between">
                  <span>Top Dept: <strong>Suite Cleanliness (4.98)</strong></span>
                  <span className="text-amber-700 font-bold">Target 4.80 Exceeded</span>
                </div>
              </div>

              {/* Chart 3: Operational Efficiency Index */}
              <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-cyan-600" />
                      Operational Efficiency %
                    </span>
                    <span className="text-[10px] font-bold text-cyan-800 bg-cyan-100/80 px-2 py-0.5 rounded">
                      {compositeEfficiency}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3">
                    6-month operational and SLA fulfillment pacing
                  </p>

                  <div className="h-52 w-full">
                    <ResponsiveContainer width="100%" height={208}>
                      <AreaChart data={MONTHLY_EFFICIENCY_TREND} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="efficiencyGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0891b2" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#0891b2" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <YAxis domain={[90, 100]} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                        <Tooltip content={<CustomEfficiencyTooltip />} />
                        <ReferenceLine y={95} stroke="#0f172a" strokeDasharray="3 3" label={{ value: 'Target 95%', position: 'insideTopLeft', fontSize: 9, fill: '#64748b' }} />
                        <Area type="monotone" dataKey="efficiencyIndex" name="Efficiency Score" stroke="#0891b2" strokeWidth={2.5} fillOpacity={1} fill="url(#efficiencyGrad)" dot={{ r: 3, fill: '#0891b2' }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-600 flex items-center justify-between">
                  <span>Room Turnaround: <strong>36 mins</strong></span>
                  <span className="text-cyan-700 font-bold">98.6% Inspection Pass</span>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: DETAILED MONTHLY SALES VISUALIZATION                               */}
          {/* ========================================================================= */}
          {activeTab === 'sales' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Main Composed Sales Chart */}
                <div className="lg:col-span-2 bg-slate-50/70 rounded-xl p-4 border border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-slate-900 text-xs">Monthly Sales Trajectory vs Target Plan</h4>
                    <div className="flex items-center gap-3 text-[11px]">
                      <span className="flex items-center gap-1 text-slate-600">
                        <span className="w-2.5 h-2.5 rounded bg-emerald-600"></span> Actual Sales
                      </span>
                      <span className="flex items-center gap-1 text-slate-600">
                        <span className="w-2.5 h-2.5 rounded bg-slate-900"></span> Target
                      </span>
                      <span className="flex items-center gap-1 text-slate-600">
                        <span className="w-2.5 h-1 rounded bg-amber-500"></span> Prior Year
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3">All figures in South African Rand (ZAR)</p>

                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height={256}>
                      <ComposedChart data={salesDisplayData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={(v) => `R${v/1000}k`} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomSalesTooltip />} />
                        <Bar dataKey="actualZar" name="Actual Sales" fill="#059669" radius={[4, 4, 0, 0]} maxBarSize={36} />
                        <Line type="monotone" dataKey="targetZar" name="Target Plan" stroke="#0f172a" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="priorYearZar" name="Prior Year" stroke="#f59e0b" strokeWidth={1.5} dot={{ r: 3 }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Sales Breakdown by Stream */}
                <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs mb-1">September Revenue Streams</h4>
                    <p className="text-[11px] text-slate-500 mb-3">Breakdown of R305,000 recorded turnover</p>

                    <div className="space-y-2.5 text-xs">
                      <div>
                        <div className="flex justify-between text-slate-700 font-medium mb-1 text-[11px]">
                          <span>Luxury Suite Bookings (68%)</span>
                          <span className="font-bold font-mono">R 206,000</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-600 rounded-full" style={{ width: '68%' }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-slate-700 font-medium mb-1 text-[11px]">
                          <span>Lagoon Dining & Cellar (17%)</span>
                          <span className="font-bold font-mono">R 51,200</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-600 rounded-full" style={{ width: '17%' }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-slate-700 font-medium mb-1 text-[11px]">
                          <span>Excursions & Lagoon Charters (10%)</span>
                          <span className="font-bold font-mono">R 31,800</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: '10%' }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-slate-700 font-medium mb-1 text-[11px]">
                          <span>Spa & Wellness Experiences (5%)</span>
                          <span className="font-bold font-mono">R 16,000</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500 rounded-full" style={{ width: '5%' }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/80 mt-4 text-[11px] text-emerald-900 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Peak Spring Season sales pace is running <strong>11% ahead</strong> of target with all 6 lagoon suites booked for the upcoming weekend.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: GUEST SATISFACTION RATINGS VISUALIZATION                           */}
          {/* ========================================================================= */}
          {activeTab === 'satisfaction' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* CSAT Department Breakdown */}
              <div className="lg:col-span-2 bg-slate-50/70 rounded-xl p-4 border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-slate-900 text-xs">Departmental Guest Satisfaction Ratings (0 - 5.0)</h4>
                  <span className="text-[11px] text-slate-500 font-medium">142 Verified Guest Surveys (Sep 2026)</span>
                </div>
                <p className="text-[11px] text-slate-500 mb-3">Red dashed indicator shows luxury 5-star target (4.80)</p>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height={256}>
                    <BarChart
                      data={GUEST_SATISFACTION_METRICS}
                      margin={{ top: 10, right: 20, left: 10, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="department" tick={{ fontSize: 10, fill: '#334155' }} angle={-15} textAnchor="end" interval={0} axisLine={false} tickLine={false} />
                      <YAxis domain={[4.6, 5.0]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomCsatTooltip />} />
                      <ReferenceLine y={4.80} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Target 4.80', position: 'insideTopLeft', fontSize: 10, fill: '#ef4444' }} />
                      <Bar dataKey="rating" name="Rating" radius={[4, 4, 0, 0]} maxBarSize={36}>
                        {GUEST_SATISFACTION_METRICS.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.rating >= 4.95 ? '#059669' : '#f59e0b'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* CSAT Monthly Trend & NPS Highlights */}
              <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs mb-1">6-Month CSAT Trajectory</h4>
                  <p className="text-[11px] text-slate-500 mb-3">Continuous satisfaction progression</p>

                  <div className="h-36 w-full">
                    <ResponsiveContainer width="100%" height={144}>
                      <LineChart data={GUEST_SATISFACTION_TREND} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <YAxis domain={[4.80, 5.00]} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <Tooltip />
                        <Line type="monotone" dataKey="csat" name="CSAT" stroke="#059669" strokeWidth={2.5} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-4 space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200">
                      <span className="text-slate-600">Net Promoter Score (NPS)</span>
                      <span className="font-bold text-emerald-700 font-mono text-sm">+88 (World Class)</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200">
                      <span className="text-slate-600">5-Star Rating Ratio</span>
                      <span className="font-bold text-slate-900 font-mono text-sm">89.4%</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 text-[11px] text-slate-500 italic">
                  "Guests particularly lauded the immaculate Egyptian linen hygiene and Eleanor's bespoke sunset oyster cruise reservations."
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: OPERATIONAL EFFICIENCY METRICS                                     */}
          {/* ========================================================================= */}
          {activeTab === 'efficiency' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* 6-Month Efficiency Trend Chart */}
                <div className="lg:col-span-2 bg-slate-50/70 rounded-xl p-4 border border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-slate-900 text-xs">Operational SLA Compliance Index & Room Turnaround</h4>
                    <span className="text-[11px] text-cyan-700 font-bold">97.8% Composite Pacing</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3">Turnaround minutes (lower is better) vs Overall Quality Index (higher is better)</p>

                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height={256}>
                      <ComposedChart data={MONTHLY_EFFICIENCY_TREND} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <YAxis yAxisId="left" domain={[90, 100]} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                        <YAxis yAxisId="right" orientation="right" domain={[30, 50]} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}m`} />
                        <Tooltip content={<CustomEfficiencyTooltip />} />
                        <Bar yAxisId="left" dataKey="inspectionPassPct" name="Inspection Pass %" fill="#0891b2" radius={[4, 4, 0, 0]} maxBarSize={28} />
                        <Line yAxisId="right" type="monotone" dataKey="roomTurnaroundMins" name="Turnaround Mins" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4 }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Core SLA Audit Cards */}
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs px-1">Audited Operational KPIs</h4>
                  {OPERATIONAL_EFFICIENCY_METRICS.slice(0, 4).map((m, idx) => (
                    <div key={idx} className="bg-slate-50/70 p-3 rounded-xl border border-slate-200 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-slate-800">{m.metric}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                          {m.currentValue} {m.unit}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>Target: {m.targetValue} {m.unit}</span>
                        <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                          <CheckCircle className="w-3 h-3" /> Exceeded
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
