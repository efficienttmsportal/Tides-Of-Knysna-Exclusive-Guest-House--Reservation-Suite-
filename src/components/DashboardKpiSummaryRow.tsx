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
  TrendingUp,
  BedDouble,
  DollarSign,
  ArrowUpRight,
  Sparkles,
  Calendar,
  CheckCircle,
  Percent,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Layers,
  ArrowRight,
  ShieldCheck,
  Activity
} from 'lucide-react';
import {
  MONTHLY_KPI_DATA,
  CURRENT_MONTH_WEEKLY_DATA,
  SUITE_PERFORMANCE_BREAKDOWN,
  MonthlyKpiRecord,
  WeeklyKpiRecord
} from '../data/dashboardKpiData';
import { Reservation } from '../types';

interface DashboardKpiSummaryRowProps {
  onSelectTab: (tab: string) => void;
  reservations?: Reservation[];
}

export interface KpiChartPoint {
  period: string;
  fullLabel: string;
  salesZar: number;
  salesTargetZar: number;
  priorYearZar: number;
  growthYoY: number;
  occupancyPct: number;
  occupancyTargetPct: number;
  adrZar: number;
  revParZar: number;
  occupiedNights: number;
  availableNights: number;
  roomSales: number;
  isCurrent: boolean;
}

export const DashboardKpiSummaryRow: React.FC<DashboardKpiSummaryRowProps> = ({
  onSelectTab,
  reservations = []
}) => {
  const [timeframe, setTimeframe] = useState<'monthly' | 'weekly'>('monthly');
  const [showDeepDive, setShowDeepDive] = useState(false);

  // Currency Formatter
  const formatZar = (val: number) => `R ${val.toLocaleString('en-ZA')}`;

  // Live reactive metrics from reservations list if populated
  const liveReservationRevenue = useMemo(() => {
    if (!reservations || reservations.length === 0) return 0;
    return reservations.reduce((sum, r) => sum + (r.totalRoomCost || 0), 0);
  }, [reservations]);

  const liveReservationNights = useMemo(() => {
    if (!reservations || reservations.length === 0) return 0;
    return reservations.reduce((sum, r) => sum + (r.totalNights || 1), 0);
  }, [reservations]);

  // Current month snapshot (September 2026 is index 5)
  const defaultCurrentMonth = MONTHLY_KPI_DATA[5];

  // Dynamic blend with live bookings
  const currentMonthData = useMemo(() => {
    if (liveReservationRevenue > 0) {
      const dynamicRoomSales = Math.max(defaultCurrentMonth.roomSales, liveReservationRevenue);
      const dynamicSalesZar = Math.max(
        defaultCurrentMonth.salesZar,
        dynamicRoomSales + Math.round(dynamicRoomSales * 0.37)
      );
      const dynamicNights = Math.max(defaultCurrentMonth.occupiedNights, liveReservationNights);
      const dynamicOccupancy = Math.min(100, Number(((dynamicNights / 180) * 100).toFixed(1)));
      const dynamicAdr = dynamicNights > 0 ? Math.round(dynamicRoomSales / dynamicNights) : defaultCurrentMonth.adrZar;
      const dynamicRevPar = Math.round(dynamicSalesZar / 180);
      const dynamicGrowth = Number(
        (((dynamicSalesZar - defaultCurrentMonth.priorYearZar) / defaultCurrentMonth.priorYearZar) * 100).toFixed(1)
      );

      return {
        ...defaultCurrentMonth,
        salesZar: dynamicSalesZar,
        roomSales: dynamicRoomSales,
        occupiedNights: dynamicNights,
        occupancyPct: dynamicOccupancy,
        adrZar: dynamicAdr,
        revParZar: dynamicRevPar,
        growthYoY: dynamicGrowth
      };
    }
    return defaultCurrentMonth;
  }, [liveReservationRevenue, liveReservationNights, defaultCurrentMonth]);

  const salesAttainmentPct = Math.round(
    (currentMonthData.salesZar / currentMonthData.salesTargetZar) * 100
  );

  // Standardized Chart Data for Recharts
  const chartData: KpiChartPoint[] = useMemo(() => {
    if (timeframe === 'monthly') {
      return MONTHLY_KPI_DATA.map((m) => {
        const isCurrent = m.shortMonth.includes('Sep');
        const activeMonth = isCurrent ? currentMonthData : m;
        return {
          period: activeMonth.shortMonth,
          fullLabel: activeMonth.month,
          salesZar: activeMonth.salesZar,
          salesTargetZar: activeMonth.salesTargetZar,
          priorYearZar: activeMonth.priorYearZar,
          growthYoY: activeMonth.growthYoY,
          occupancyPct: activeMonth.occupancyPct,
          occupancyTargetPct: activeMonth.occupancyTargetPct,
          adrZar: activeMonth.adrZar,
          revParZar: activeMonth.revParZar,
          occupiedNights: activeMonth.occupiedNights,
          availableNights: activeMonth.availableNights,
          roomSales: activeMonth.roomSales,
          isCurrent
        };
      });
    } else {
      return CURRENT_MONTH_WEEKLY_DATA.map((w) => ({
        period: w.shortWeek,
        fullLabel: w.week,
        salesZar: w.salesZar,
        salesTargetZar: 75000,
        priorYearZar: 62000,
        growthYoY: 18.5,
        occupancyPct: w.occupancyPct,
        occupancyTargetPct: 85.0,
        adrZar: w.adrZar,
        revParZar: w.revParZar,
        occupiedNights: Math.round((w.occupancyPct / 100) * 42),
        availableNights: 42,
        roomSales: Math.round(w.salesZar * 0.72),
        isCurrent: w.shortWeek.includes('W4')
      }));
    }
  }, [timeframe, currentMonthData]);

  // Custom Recharts Tooltip for Sales Growth
  const SalesTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-950/95 text-white p-3 rounded-xl border border-slate-800 shadow-xl text-xs space-y-1.5 min-w-[170px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1">
            <span className="font-bold text-emerald-400">{label}</span>
            {data.growthYoY && (
              <span className="text-[10px] text-emerald-300 font-semibold bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-800/60">
                +{data.growthYoY}% YoY
              </span>
            )}
          </div>
          <div className="space-y-1 pt-0.5">
            <div className="flex items-center justify-between gap-3 text-[11px]">
              <span className="text-slate-400">Total Sales:</span>
              <span className="font-mono font-bold text-white">{formatZar(data.salesZar)}</span>
            </div>
            {data.salesTargetZar && (
              <div className="flex items-center justify-between gap-3 text-[11px]">
                <span className="text-slate-400">Monthly Target:</span>
                <span className="font-mono text-slate-300">{formatZar(data.salesTargetZar)}</span>
              </div>
            )}
            {data.priorYearZar && (
              <div className="flex items-center justify-between gap-3 text-[11px]">
                <span className="text-slate-400">Prior Year:</span>
                <span className="font-mono text-slate-400">{formatZar(data.priorYearZar)}</span>
              </div>
            )}
            {data.roomSales && (
              <div className="border-t border-slate-800/80 pt-1 flex items-center justify-between text-[10px] text-slate-400">
                <span>Rooms / Suites:</span>
                <span className="font-mono text-emerald-300">{formatZar(data.roomSales)}</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Recharts Tooltip for Occupancy Rate
  const OccupancyTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-950/95 text-white p-3 rounded-xl border border-slate-800 shadow-xl text-xs space-y-1.5 min-w-[160px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1">
            <span className="font-bold text-sky-400">{label}</span>
            <span className="text-[10px] text-sky-300 font-semibold bg-sky-950 px-1.5 py-0.2 rounded border border-sky-800/60">
              {data.occupancyPct}%
            </span>
          </div>
          <div className="space-y-1 pt-0.5">
            <div className="flex items-center justify-between gap-3 text-[11px]">
              <span className="text-slate-400">Occupancy:</span>
              <span className="font-mono font-bold text-white">{data.occupancyPct}%</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-[11px]">
              <span className="text-slate-400">Benchmark Target:</span>
              <span className="font-mono text-slate-300">{data.occupancyTargetPct || 85}%</span>
            </div>
            {data.occupiedNights && (
              <div className="border-t border-slate-800/80 pt-1 flex items-center justify-between text-[10px] text-slate-400">
                <span>Occupied Nights:</span>
                <span className="font-mono text-sky-300">
                  {data.occupiedNights} / {data.availableNights}
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Recharts Tooltip for Average Daily Rate (ADR)
  const AdrTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-950/95 text-white p-3 rounded-xl border border-slate-800 shadow-xl text-xs space-y-1.5 min-w-[165px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1">
            <span className="font-bold text-amber-400">{label}</span>
            <span className="text-[10px] text-amber-300 font-semibold bg-amber-950 px-1.5 py-0.2 rounded border border-amber-800/60">
              ADR {formatZar(data.adrZar)}
            </span>
          </div>
          <div className="space-y-1 pt-0.5">
            <div className="flex items-center justify-between gap-3 text-[11px]">
              <span className="text-slate-400">Avg Daily Rate:</span>
              <span className="font-mono font-bold text-white">{formatZar(data.adrZar)}</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-[11px]">
              <span className="text-slate-400">RevPAR:</span>
              <span className="font-mono font-bold text-emerald-400">{formatZar(data.revParZar)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div id="dashboard-kpi-summary-row" className="space-y-4">
      {/* Top Header of the KPI Summary Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-slate-900 text-emerald-400 border border-slate-800 flex items-center justify-center shadow-xs">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Executive Operations Performance KPIs
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                Live Metrics
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Real-time visualization of monthly sales expansion, suite occupancy pacing, and ADR yields
            </p>
          </div>
        </div>

        {/* Controls: Timeframe switcher & Deep-dive toggle */}
        <div className="flex items-center gap-2">
          {/* Timeframe Switcher */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 text-xs border border-slate-200">
            <button
              id="btn-kpi-timeframe-monthly"
              onClick={() => setTimeframe('monthly')}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                timeframe === 'monthly'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Seasonal Trend (6 Mo)
            </button>
            <button
              id="btn-kpi-timeframe-weekly"
              onClick={() => setTimeframe('weekly')}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                timeframe === 'weekly'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              September Weekly Pacing
            </button>
          </div>

          {/* Deep-dive drawer trigger */}
          <button
            id="btn-toggle-kpi-deep-dive"
            onClick={() => setShowDeepDive(!showDeepDive)}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Suite Breakdown</span>
            {showDeepDive ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3-COLUMN RECHARTS KPI WIDGETS GRID                                        */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ======================================================================= */}
        {/* WIDGET 1: MONTHLY SALES GROWTH (RECHARTS BAR + TARGET LINE)             */}
        {/* ======================================================================= */}
        <div
          id="widget-monthly-sales-growth"
          className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
        >
          <div>
            {/* Widget Header */}
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Monthly Sales Growth
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-serif-luxury text-slate-900">
                    {formatZar(currentMonthData.salesZar)}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                    +{currentMonthData.growthYoY}% YoY
                  </span>
                </div>
              </div>

              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

            {/* Pacing progress bar & Target indicator */}
            <div className="space-y-1 mb-4">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>
                  Target: <strong className="text-slate-700">{formatZar(currentMonthData.salesTargetZar)}</strong>
                </span>
                <span className="font-bold text-emerald-700">{salesAttainmentPct}% Attained</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${Math.min(salesAttainmentPct, 100)}%` }}
                />
              </div>
            </div>

            {/* Recharts Chart for Monthly Sales */}
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 8, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="period"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 9, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => `R${val / 1000}k`}
                  />
                  <Tooltip content={<SalesTooltip />} cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }} />
                  <ReferenceLine
                    y={275000}
                    stroke="#059669"
                    strokeDasharray="3 3"
                    strokeWidth={1}
                  />
                  <Bar
                    dataKey="salesZar"
                    name="Actual Revenue"
                    radius={[6, 6, 0, 0]}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.isCurrent ? '#059669' : '#10b981'}
                        opacity={entry.isCurrent ? 1 : 0.75}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Widget Footer Meta */}
          <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Room Revenue: <strong className="text-slate-800">{formatZar(currentMonthData.roomSales)}</strong>
            </span>
            <button
              onClick={() => onSelectTab('accounting')}
              className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-0.5 hover:underline"
            >
              Accounts
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* WIDGET 2: GUEST OCCUPANCY RATE (RECHARTS AREA CHART + BENCHMARK LINE)   */}
        {/* ======================================================================= */}
        <div
          id="widget-guest-occupancy-rate"
          className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
        >
          <div>
            {/* Widget Header */}
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Guest Occupancy Rate
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-serif-luxury text-slate-900">
                    {currentMonthData.occupancyPct}%
                  </span>
                  <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    <CheckCircle className="w-3 h-3 text-sky-600" />
                    +6.7% vs 85% Target
                  </span>
                </div>
              </div>

              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
                <BedDouble className="w-5 h-5" />
              </div>
            </div>

            {/* Occupied Nights Breakdown */}
            <div className="space-y-1 mb-4">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>
                  Occupied: <strong className="text-slate-700">{currentMonthData.occupiedNights} Nights</strong>
                </span>
                <span>
                  Capacity: <strong className="text-slate-700">6 Suites (180 Nt)</strong>
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-500 rounded-full"
                  style={{ width: `${currentMonthData.occupancyPct}%` }}
                />
              </div>
            </div>

            {/* Recharts Area Chart for Occupancy */}
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 8, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="occupancyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="period"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[60, 100]}
                    tick={{ fontSize: 9, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => `${val}%`}
                  />
                  <Tooltip content={<OccupancyTooltip />} />
                  <ReferenceLine
                    y={85}
                    stroke="#0284c7"
                    strokeDasharray="3 3"
                    strokeWidth={1}
                    label={{
                      value: '85% Benchmark',
                      fill: '#0284c7',
                      fontSize: 9,
                      position: 'insideTopRight'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="occupancyPct"
                    stroke="#0284c7"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#occupancyGradient)"
                    dot={{ r: 3, fill: '#0284c7', strokeWidth: 1, stroke: '#ffffff' }}
                    activeDot={{ r: 5, fill: '#0369a1' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Widget Footer Meta */}
          <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              Peak Weekend Rate: <strong className="text-slate-800">100% Full</strong>
            </span>
            <button
              onClick={() => onSelectTab('reservations')}
              className="text-sky-700 hover:text-sky-800 font-bold flex items-center gap-0.5 hover:underline"
            >
              Bookings
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* WIDGET 3: AVERAGE DAILY RATE (ADR) & RevPAR (RECHARTS COMPOSED CHART)   */}
        {/* ======================================================================= */}
        <div
          id="widget-average-daily-rate"
          className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
        >
          <div>
            {/* Widget Header */}
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Average Daily Rate (ADR)
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-serif-luxury text-slate-900">
                    {formatZar(currentMonthData.adrZar)}
                  </span>
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    <ArrowUpRight className="w-3 h-3 text-amber-600" />
                    +16.4% YoY
                  </span>
                </div>
              </div>

              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>

            {/* RevPAR Snapshot indicator */}
            <div className="space-y-1 mb-4">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>
                  RevPAR: <strong className="text-emerald-700">{formatZar(currentMonthData.revParZar)}</strong>
                </span>
                <span>
                  Highest Suite ADR: <strong className="text-slate-700">R 5,850</strong>
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${Math.round((currentMonthData.revParZar / currentMonthData.adrZar) * 100)}%` }}
                />
              </div>
            </div>

            {/* Recharts Line / Composed Chart for ADR & RevPAR */}
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 10, right: 8, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="period"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={['dataMin - 300', 'dataMax + 300']}
                    tick={{ fontSize: 9, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => `R${val}`}
                  />
                  <Tooltip content={<AdrTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="adrZar"
                    name="ADR (Room Rate)"
                    stroke="#d97706"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#d97706', strokeWidth: 1, stroke: '#ffffff' }}
                    activeDot={{ r: 5, fill: '#b45309' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revParZar"
                    name="RevPAR Yield"
                    stroke="#10b981"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ r: 2.5, fill: '#10b981' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Widget Footer Meta */}
          <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              RevPAR Efficiency: <strong className="text-slate-800">91.7% Yield</strong>
            </span>
            <button
              onClick={() => onSelectTab('calendar')}
              className="text-amber-700 hover:text-amber-800 font-bold flex items-center gap-0.5 hover:underline"
            >
              Rates & Grid
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* EXPANDABLE SUITE-BY-SUITE PERFORMANCE DRAWER                              */}
      {/* ========================================================================= */}
      {showDeepDive && (
        <div
          id="suite-performance-deep-dive"
          className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold font-serif-luxury text-sm text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Suite-by-Suite Revenue & Yield Matrix (September 2026)
              </h3>
              <p className="text-xs text-slate-400">
                Individual unit yields across all 6 luxury lagoon suites for Tides of Knysna
              </p>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-800/60">
              Total Room Pool: 6 Luxury Units
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SUITE_PERFORMANCE_BREAKDOWN.map((s) => (
              <div
                key={s.suite}
                className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 hover:border-emerald-500/40 transition flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-white">{s.suite}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    ADR: <strong className="text-amber-400">{formatZar(s.adr)}</strong> / night
                  </div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">
                    Occupancy: {s.occupancy}%
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block uppercase">Est. Mo. Revenue</span>
                  <span className="text-xs font-mono font-bold text-white">
                    {formatZar(s.revenueZar)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
