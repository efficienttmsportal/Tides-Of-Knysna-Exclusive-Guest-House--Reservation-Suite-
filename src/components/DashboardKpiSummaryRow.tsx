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
  TrendingDown,
  BedDouble,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  ArrowUp,
  ArrowDown,
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
  Activity,
  Table,
  FileSpreadsheet,
  Utensils,
  Wine,
  Compass,
  BarChart3,
  Download
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { D3MonthlySalesLineChart, TWELVE_MONTHS_HISTORICAL_SALES } from './D3MonthlySalesLineChart';
import {
  MONTHLY_KPI_DATA,
  CURRENT_MONTH_WEEKLY_DATA,
  SUITE_PERFORMANCE_BREAKDOWN,
  MonthlyKpiRecord,
  WeeklyKpiRecord
} from '../data/dashboardKpiData';
import { MONTHLY_SALES_SUMMARY } from '../data/performanceSummaryData';
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
  const [showMonthlyDetails, setShowMonthlyDetails] = useState(false);
  const [widgetDisplayMode, setWidgetDisplayMode] = useState<'chart' | 'd3' | 'table'>('chart');
  const [selectedRevenueSource, setSelectedRevenueSource] = useState<'ALL' | 'rooms' | 'dining' | 'spa' | 'bar' | 'tours'>('ALL');
  const [isRevenueTableHeightened, setIsRevenueTableHeightened] = useState(false);
  const [selectedMonthlyRecord, setSelectedMonthlyRecord] = useState<string | null>(null);
  const [simulatedGrowth, setSimulatedGrowth] = useState<number | null>(null);

  // Currency Formatter
  const formatZar = (val: number) => `R ${val.toLocaleString('en-ZA')}`;

  // Live reactive metrics from reservations list if populated
  const liveReservationRevenue = useMemo(() => {
    if (!reservations || reservations.length === 0) return 0;
    return reservations.reduce((sum, r) => sum + (r.totalRoomCost || 0), 0);
  }, [reservations]);

  // Breakdown of monthly revenue by source (Room Bookings, Dining, Spa, Bar, Tours)
  const monthlyRevenueBySource = useMemo(() => {
    return MONTHLY_SALES_SUMMARY.map((m) => {
      const isCurrent = m.shortMonth.includes('Sep');
      const isPacing = m.shortMonth.includes('Oct');
      
      // Calculate dynamic room revenue if live bookings exist
      const roomsZar = isCurrent && liveReservationRevenue > 0
        ? Math.max(m.roomsZar, liveReservationRevenue)
        : m.roomsZar;
        
      // Dining and Bar breakdown from F&B / cellar inventory and services
      const diningZar = Math.round(m.diningZar * 0.62);
      const barZar = m.diningZar - diningZar;
      const spaZar = m.spaZar;
      const toursZar = m.toursZar;
      const totalSales = roomsZar + diningZar + barZar + spaZar + toursZar;
      const attainment = Math.round((totalSales / m.targetZar) * 100);

      return {
        month: m.month,
        shortMonth: m.shortMonth,
        roomsZar,
        diningZar,
        barZar,
        spaZar,
        toursZar,
        totalSales,
        targetZar: m.targetZar,
        priorYearZar: m.priorYearZar,
        growthPct: m.growthPct,
        attainment,
        isCurrent,
        isPacing
      };
    });
  }, [liveReservationRevenue]);

  // Aggregate totals across all sources for the active season
  const sourceTotals = useMemo(() => {
    return monthlyRevenueBySource.reduce(
      (acc, curr) => ({
        rooms: acc.rooms + curr.roomsZar,
        dining: acc.dining + curr.diningZar,
        bar: acc.bar + curr.barZar,
        spa: acc.spa + curr.spaZar,
        tours: acc.tours + curr.toursZar,
        total: acc.total + curr.totalSales,
        target: acc.target + curr.targetZar
      }),
      { rooms: 0, dining: 0, bar: 0, spa: 0, tours: 0, total: 0, target: 0 }
    );
  }, [monthlyRevenueBySource]);

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

  const effectiveGrowth = simulatedGrowth !== null ? simulatedGrowth : currentMonthData.growthYoY;
  const isPositiveGrowth = effectiveGrowth >= 0;

  // Exports tabular revenue breakdown into PDF with dynamic trend badge
  const handleDownloadGrowthReportPdf = () => {
    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'pt',
        format: 'a4'
      });

      // Top decorative banner
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, 842, 64, 'F');

      // Header title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.setTextColor(255, 255, 255);
      doc.text('DE HOOP COLLECTION - MONTHLY SALES GROWTH & REVENUE BREAKDOWN', 30, 30);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text(
        `Executive Management Report | Generated: ${new Date().toLocaleDateString('en-ZA', { dateStyle: 'full' })} at ${new Date().toLocaleTimeString('en-ZA')}`,
        30,
        48
      );

      // Trend Badge in PDF Header
      const trendIsPositive = isPositiveGrowth;
      const badgeBg = trendIsPositive ? [236, 253, 245] : [255, 241, 242]; // emerald-50 or rose-50
      const badgeBorder = trendIsPositive ? [16, 185, 129] : [244, 63, 94]; // emerald-500 or rose-500
      const badgeText = trendIsPositive ? [4, 120, 87] : [190, 18, 60]; // emerald-700 or rose-700
      
      doc.setFillColor(badgeBg[0], badgeBg[1], badgeBg[2]);
      doc.setDrawColor(badgeBorder[0], badgeBorder[1], badgeBorder[2]);
      doc.setLineWidth(1);
      doc.roundedRect(560, 14, 252, 36, 6, 6, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(badgeText[0], badgeText[1], badgeText[2]);
      const arrowSymbol = trendIsPositive ? '^ ' : 'v ';
      doc.text(
        `TREND BADGE: ${arrowSymbol}${trendIsPositive ? '+' : ''}${effectiveGrowth}% YoY GROWTH`,
        572,
        31
      );
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(
        trendIsPositive ? 'Positive Sales Expansion' : 'Sales Contraction / Review Required',
        572,
        43
      );

      // Section metadata
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Monthly Revenue Source Audit (Lodging, Dining, Cellar Bar, Botanical Spa & Charters)', 30, 88);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(
        `Total Season Revenue: ${formatZar(sourceTotals.total)}  |  Total Target: ${formatZar(sourceTotals.target)}  |  Attainment: ${Math.round((sourceTotals.total / sourceTotals.target) * 100)}%  |  Active Period: September 2026 (${formatZar(currentMonthData.salesZar)})`,
        30,
        102
      );

      // AutoTable
      const headers = [
        'Month / Period',
        'Room Bookings',
        'Dining & Cuisine',
        'Bar & Cellar',
        'Spa & Wellness',
        'Tours & Charters',
        'Total Revenue',
        'Target',
        'Attainment',
        'YoY Growth',
        'Status'
      ];

      const rows = monthlyRevenueBySource.map((r) => [
        r.month + (r.isCurrent ? ' (Live)' : r.isPacing ? ' (Forecast)' : ''),
        formatZar(r.roomsZar),
        formatZar(r.diningZar),
        formatZar(r.barZar),
        formatZar(r.spaZar),
        formatZar(r.toursZar),
        formatZar(r.totalSales),
        formatZar(r.targetZar),
        `${r.attainment}%`,
        `${r.growthPct >= 0 ? '+' : ''}${r.growthPct}%`,
        r.attainment >= 100 ? 'Target Exceeded' : 'Pacing On Track'
      ]);

      const footerRow = [
        'Total (7 Months)',
        formatZar(sourceTotals.rooms),
        formatZar(sourceTotals.dining),
        formatZar(sourceTotals.bar),
        formatZar(sourceTotals.spa),
        formatZar(sourceTotals.tours),
        formatZar(sourceTotals.total),
        formatZar(sourceTotals.target),
        `${Math.round((sourceTotals.total / sourceTotals.target) * 100)}%`,
        `${isPositiveGrowth ? '+' : ''}${effectiveGrowth}%`,
        'Active Season'
      ];

      autoTable(doc, {
        head: [headers],
        body: rows,
        foot: [footerRow],
        startY: 114,
        theme: 'grid',
        styles: {
          font: 'helvetica',
          cellPadding: 4.5
        },
        headStyles: {
          fillColor: [15, 23, 42],
          textColor: [255, 255, 255],
          fontSize: 8,
          fontStyle: 'bold',
          halign: 'left'
        },
        bodyStyles: {
          fontSize: 7.5,
          textColor: [51, 65, 85]
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        footStyles: {
          fillColor: [241, 245, 249],
          textColor: [15, 23, 42],
          fontSize: 8,
          fontStyle: 'bold'
        },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 95 },
          6: { fontStyle: 'bold', textColor: [15, 23, 42] },
          7: { textColor: [100, 116, 139] },
          8: { halign: 'center' },
          9: { fontStyle: 'bold', halign: 'center' },
          10: { halign: 'center' }
        },
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index === 9) {
            const rawVal = String(data.cell.raw);
            if (rawVal.startsWith('+')) {
              data.cell.styles.textColor = [5, 150, 105]; // emerald-600
            } else if (rawVal.startsWith('-')) {
              data.cell.styles.textColor = [225, 29, 72]; // rose-600
            }
          }
          if (data.section === 'body' && data.column.index === 10) {
            const rawVal = String(data.cell.raw);
            if (rawVal === 'Target Exceeded') {
              data.cell.styles.textColor = [4, 120, 87];
              data.cell.styles.fontStyle = 'bold';
            }
          }
        }
      });

      // Bottom footer branding
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(148, 163, 184);
      doc.text(
        'Confidential - De Hoop Luxury Nature Reserve Operations & Executive Finance Audit',
        30,
        pageHeight - 16
      );

      doc.save(`DeHoop_Growth_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('Error generating PDF report:', err);
    }
  };

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

  // 12-Month Historical Sales Dataset with live updates for active month
  const twelveMonthSalesData = useMemo(() => {
    return TWELVE_MONTHS_HISTORICAL_SALES.map((item) => {
      if (item.shortMonth.includes('Sep')) {
        return {
          ...item,
          salesZar: currentMonthData.salesZar,
          targetZar: currentMonthData.salesTargetZar,
          growthYoY: effectiveGrowth,
          isCurrent: true
        };
      }
      return item;
    });
  }, [currentMonthData.salesZar, currentMonthData.salesTargetZar, effectiveGrowth]);

  // Custom Recharts Tooltip for Sales Growth
  const SalesTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-950/95 text-white p-3 rounded-xl border border-slate-800 shadow-xl text-xs space-y-1.5 min-w-[170px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1">
            <span className="font-bold text-emerald-400">{label}</span>
            {data.growthYoY !== undefined && (
              <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border flex items-center gap-0.5 ${
                data.growthYoY >= 0
                  ? 'text-emerald-300 bg-emerald-950/80 border-emerald-800/60'
                  : 'text-rose-300 bg-rose-950/80 border-rose-800/60'
              }`}>
                {data.growthYoY >= 0 ? (
                  <ArrowUpRight className="w-2.5 h-2.5 text-emerald-400" />
                ) : (
                  <ArrowDownRight className="w-2.5 h-2.5 text-rose-400" />
                )}
                <span>{data.growthYoY >= 0 ? `+${data.growthYoY}%` : `${data.growthYoY}%`} YoY</span>
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
        {/* WIDGET 1: MONTHLY SALES GROWTH (RECHARTS BAR + SOURCE BREAKDOWN TABLE)  */}
        {/* ======================================================================= */}
        <div
          id="widget-monthly-sales-growth"
          className={`bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-lg hover:border-emerald-300 transition-all duration-500 ease-in-out flex flex-col justify-between group ${
            showMonthlyDetails ? 'lg:col-span-3 ring-2 ring-emerald-500/25 shadow-md' : 'lg:col-span-1'
          }`}
        >
          <div>
            {/* Widget Header */}
            <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Monthly Sales Growth
                </span>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-2xl font-bold font-serif-luxury text-slate-900">
                    {formatZar(currentMonthData.salesZar)}
                  </span>

                  {/* Trend Indicator Icon (Upward or Downward Arrow) next to Growth Percentage */}
                  <div className="flex items-center gap-1.5">
                    <span
                      id="widget-monthly-sales-growth-badge"
                      onClick={() => setSimulatedGrowth(isPositiveGrowth ? -8.4 : 23.0)}
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border shadow-2xs transition-all duration-300 cursor-pointer ${
                        isPositiveGrowth
                          ? 'text-emerald-700 bg-emerald-50 border-emerald-200/80 hover:bg-emerald-100 animate-pulse'
                          : 'text-rose-700 bg-rose-50 border-rose-200/80 hover:bg-rose-100 animate-pulse'
                      }`}
                      title={
                        isPositiveGrowth
                          ? 'Positive YoY Sales Growth (Click to toggle negative scenario)'
                          : 'Negative YoY Sales Contraction (Click to toggle positive scenario)'
                      }
                    >
                      {/* Dynamically colored upward or downward arrow trend indicator icon */}
                      {isPositiveGrowth ? (
                        <ArrowUp className="w-3.5 h-3.5 text-emerald-600 animate-bounce shrink-0 trend-indicator-icon upward-arrow" />
                      ) : (
                        <ArrowDown className="w-3.5 h-3.5 text-rose-600 animate-bounce shrink-0 trend-indicator-icon downward-arrow" />
                      )}
                      <span className="growth-percentage-value">
                        {isPositiveGrowth ? `+${effectiveGrowth}%` : `${effectiveGrowth}%`} YoY
                      </span>
                    </span>

                    {/* Quick Trend Indicator Scenario Switcher */}
                    <div className="hidden xl:flex items-center text-[10px] bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setSimulatedGrowth(null)}
                        className={`px-1.5 py-0.5 rounded font-medium transition ${
                          simulatedGrowth === null ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                        }`}
                        title="Use live calculated growth rate"
                      >
                        Live
                      </button>
                      <button
                        type="button"
                        onClick={() => setSimulatedGrowth(23.0)}
                        className={`px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5 transition ${
                          simulatedGrowth === 23.0 ? 'bg-emerald-100 text-emerald-800 font-bold shadow-2xs' : 'text-slate-500 hover:text-emerald-700'
                        }`}
                        title="Simulate positive growth (+23%)"
                      >
                        <ArrowUp className="w-2.5 h-2.5 text-emerald-600" />
                        <span>+23%</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSimulatedGrowth(-8.4)}
                        className={`px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5 transition ${
                          simulatedGrowth === -8.4 ? 'bg-rose-100 text-rose-800 font-bold shadow-2xs' : 'text-slate-500 hover:text-rose-700'
                        }`}
                        title="Simulate negative contraction (-8.4%)"
                      >
                        <ArrowDown className="w-2.5 h-2.5 text-rose-600" />
                        <span>-8.4%</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* View Mode Toggle: Chart vs 12-Mo D3 Line vs Source Breakdown */}
                <div className="bg-slate-100 p-0.5 rounded-xl flex items-center border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setWidgetDisplayMode('chart')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                      widgetDisplayMode === 'chart'
                        ? 'bg-white text-slate-800 shadow-2xs font-bold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                    title="Display animated sales growth bar chart"
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="hidden sm:inline">Chart</span>
                  </button>
                  <button
                    type="button"
                    id="btn-widget-d3-line-mode"
                    onClick={() => setWidgetDisplayMode('d3')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                      widgetDisplayMode === 'd3'
                        ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                    title="Display small D3-based line chart rendering the last 12 months"
                  >
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="hidden sm:inline">12-Mo D3</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setWidgetDisplayMode('table')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                      widgetDisplayMode === 'table'
                        ? 'bg-white text-slate-800 shadow-2xs font-bold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                    title="Display tabular breakdown by revenue source"
                  >
                    <Table className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="hidden sm:inline">By Source</span>
                  </button>
                </div>

                {/* Direct Row Heightening Comfort Toggle in Header */}
                <button
                  type="button"
                  id="btn-toggle-row-heightening"
                  onClick={() => setIsRevenueTableHeightened(!isRevenueTableHeightened)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                    isRevenueTableHeightened
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs font-bold ring-2 ring-indigo-400/20'
                      : 'bg-white text-slate-700 hover:text-slate-900 border-slate-200 hover:bg-slate-50'
                  }`}
                  title="Toggle row heightening for reading and touch comfort"
                >
                  <span className="font-mono text-[11px]">↕️</span>
                  <span>{isRevenueTableHeightened ? 'Compact Rows' : 'Heighten Rows'}</span>
                </button>

                <button
                  type="button"
                  id="btn-view-details-monthly-sales"
                  onClick={() => setShowMonthlyDetails(!showMonthlyDetails)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all duration-300 shadow-2xs border ${
                    showMonthlyDetails
                      ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300'
                  }`}
                  title="Expand card to view detailed tabular breakdown of individual revenue sources"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>{showMonthlyDetails ? 'Collapse' : 'View Details'}</span>
                  {showMonthlyDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {/* Animated Growth Widget Icon with Ping Halo */}
                <div className="relative group/icon">
                  <span className={`animate-ping absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full opacity-75 ${
                    isPositiveGrowth ? 'bg-emerald-400' : 'bg-rose-400'
                  }`}></span>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs border transition-transform duration-300 group-hover/icon:scale-110 ${
                    isPositiveGrowth
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100 group-hover/icon:bg-emerald-100'
                      : 'bg-rose-50 text-rose-700 border-rose-100 group-hover/icon:bg-rose-100'
                  }`}>
                    {isPositiveGrowth ? (
                      <TrendingUp className="w-5 h-5 animate-pulse text-emerald-600" />
                    ) : (
                      <TrendingDown className="w-5 h-5 animate-pulse text-rose-600" />
                    )}
                  </div>
                </div>
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
                  className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min(salesAttainmentPct, 100)}%` }}
                />
              </div>
            </div>

            {/* Conditional Compact View (Chart or Compact Source Table) */}
            {(!showMonthlyDetails && widgetDisplayMode === 'table') ? (
              /* Compact Source Breakdown Table with Row Heightening & Trend Indicators */
              <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs my-2">
                <table className="w-full text-[11px] text-left">
                  <thead className="bg-slate-50 text-slate-600 uppercase text-[9px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-2.5 py-2">Source</th>
                      <th className="px-2.5 py-2">Sep Actual</th>
                      <th className="px-2.5 py-2 text-right">Mix %</th>
                      <th className="px-2.5 py-2 text-right">YoY Trend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className={`hover:bg-purple-50/40 border-l-4 border-l-purple-500 transition-all ${isRevenueTableHeightened ? 'h-14 py-3 row-heightened' : 'h-8 py-1.5'}`}>
                      <td className={`px-2.5 ${isRevenueTableHeightened ? 'py-3' : 'py-1.5'} font-semibold text-slate-800 flex items-center gap-1.5`}>
                        <BedDouble className="w-3.5 h-3.5 text-purple-600" />
                        Room Bookings
                      </td>
                      <td className={`px-2.5 ${isRevenueTableHeightened ? 'py-3' : 'py-1.5'} font-mono font-bold text-purple-900`}>
                        {formatZar(monthlyRevenueBySource[5].roomsZar)}
                      </td>
                      <td className={`px-2.5 ${isRevenueTableHeightened ? 'py-3' : 'py-1.5'} font-mono text-slate-500 text-right`}>
                        {Math.round((monthlyRevenueBySource[5].roomsZar / monthlyRevenueBySource[5].totalSales) * 100)}%
                      </td>
                      <td className={`px-2.5 ${isRevenueTableHeightened ? 'py-3' : 'py-1.5'} text-right`}>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <ArrowUp className="w-2.5 h-2.5 text-emerald-600 shrink-0 trend-indicator-icon upward-arrow" />
                          +22.4%
                        </span>
                      </td>
                    </tr>
                    <tr className={`hover:bg-amber-50/40 border-l-4 border-l-amber-500 transition-all ${isRevenueTableHeightened ? 'h-14 py-3 row-heightened' : 'h-8 py-1.5'}`}>
                      <td className={`px-2.5 ${isRevenueTableHeightened ? 'py-3' : 'py-1.5'} font-semibold text-slate-800 flex items-center gap-1.5`}>
                        <Utensils className="w-3.5 h-3.5 text-amber-600" />
                        Dining & Cuisine
                      </td>
                      <td className={`px-2.5 ${isRevenueTableHeightened ? 'py-3' : 'py-1.5'} font-mono font-bold text-amber-900`}>
                        {formatZar(monthlyRevenueBySource[5].diningZar)}
                      </td>
                      <td className={`px-2.5 ${isRevenueTableHeightened ? 'py-3' : 'py-1.5'} font-mono text-slate-500 text-right`}>
                        {Math.round((monthlyRevenueBySource[5].diningZar / monthlyRevenueBySource[5].totalSales) * 100)}%
                      </td>
                      <td className={`px-2.5 ${isRevenueTableHeightened ? 'py-3' : 'py-1.5'} text-right`}>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <ArrowUp className="w-2.5 h-2.5 text-emerald-600 shrink-0 trend-indicator-icon upward-arrow" />
                          +18.1%
                        </span>
                      </td>
                    </tr>
                    <tr className={`hover:bg-rose-50/40 border-l-4 border-l-rose-500 transition-all ${isRevenueTableHeightened ? 'h-14 py-3 row-heightened' : 'h-8 py-1.5'}`}>
                      <td className={`px-2.5 ${isRevenueTableHeightened ? 'py-3' : 'py-1.5'} font-semibold text-slate-800 flex items-center gap-1.5`}>
                        <Wine className="w-3.5 h-3.5 text-rose-600" />
                        Bar & Cellar
                      </td>
                      <td className={`px-2.5 ${isRevenueTableHeightened ? 'py-3' : 'py-1.5'} font-mono font-bold text-rose-900`}>
                        {formatZar(monthlyRevenueBySource[5].barZar)}
                      </td>
                      <td className={`px-2.5 ${isRevenueTableHeightened ? 'py-3' : 'py-1.5'} font-mono text-slate-500 text-right`}>
                        {Math.round((monthlyRevenueBySource[5].barZar / monthlyRevenueBySource[5].totalSales) * 100)}%
                      </td>
                      <td className={`px-2.5 ${isRevenueTableHeightened ? 'py-3' : 'py-1.5'} text-right`}>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
                          <ArrowDown className="w-2.5 h-2.5 text-rose-600 shrink-0 trend-indicator-icon downward-arrow" />
                          -4.2%
                        </span>
                      </td>
                    </tr>
                    <tr className={`hover:bg-pink-50/40 border-l-4 border-l-pink-500 transition-all ${isRevenueTableHeightened ? 'h-14 py-3 row-heightened' : 'h-8 py-1.5'}`}>
                      <td className={`px-2.5 ${isRevenueTableHeightened ? 'py-3' : 'py-1.5'} font-semibold text-slate-800 flex items-center gap-1.5`}>
                        <Sparkles className="w-3.5 h-3.5 text-pink-600" />
                        Spa & Wellness
                      </td>
                      <td className={`px-2.5 ${isRevenueTableHeightened ? 'py-3' : 'py-1.5'} font-mono font-bold text-pink-900`}>
                        {formatZar(monthlyRevenueBySource[5].spaZar)}
                      </td>
                      <td className={`px-2.5 ${isRevenueTableHeightened ? 'py-3' : 'py-1.5'} font-mono text-slate-500 text-right`}>
                        {Math.round((monthlyRevenueBySource[5].spaZar / monthlyRevenueBySource[5].totalSales) * 100)}%
                      </td>
                      <td className={`px-2.5 ${isRevenueTableHeightened ? 'py-3' : 'py-1.5'} text-right`}>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <ArrowUp className="w-2.5 h-2.5 text-emerald-600 shrink-0 trend-indicator-icon upward-arrow" />
                          +14.8%
                        </span>
                      </td>
                    </tr>
                    <tr className="bg-slate-50 font-bold border-t border-slate-200">
                      <td className={`px-2.5 ${isRevenueTableHeightened ? 'py-3' : 'py-1.5'} text-slate-900`}>Total Month Sales</td>
                      <td className={`px-2.5 ${isRevenueTableHeightened ? 'py-3' : 'py-1.5'} font-mono text-emerald-800`}>
                        {formatZar(monthlyRevenueBySource[5].totalSales)}
                      </td>
                      <td className={`px-2.5 ${isRevenueTableHeightened ? 'py-3' : 'py-1.5'} font-mono text-slate-700 text-right`}>100%</td>
                      <td className={`px-2.5 ${isRevenueTableHeightened ? 'py-3' : 'py-1.5'} text-right`}>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${
                          isPositiveGrowth
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}>
                          {isPositiveGrowth ? (
                            <ArrowUp className="w-2.5 h-2.5 text-emerald-600 shrink-0 trend-indicator-icon upward-arrow" />
                          ) : (
                            <ArrowDown className="w-2.5 h-2.5 text-rose-600 shrink-0 trend-indicator-icon downward-arrow" />
                          )}
                          {isPositiveGrowth ? `+${effectiveGrowth}%` : `${effectiveGrowth}%`}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (!showMonthlyDetails && widgetDisplayMode === 'd3') ? (
              /* Small D3-based Line Chart for Last 12 Months */
              <div className="my-2">
                <D3MonthlySalesLineChart
                  data={twelveMonthSalesData}
                  height={175}
                  isCompact={true}
                  formatZar={formatZar}
                />
              </div>
            ) : (
              /* Animated Recharts Chart for Monthly Sales */
              <div className={`${showMonthlyDetails ? 'h-48' : 'h-44'} w-full transition-all`}>
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
                      isAnimationActive={true}
                      animationDuration={1000}
                      animationEasing="ease-out"
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
            )}

            {/* Expanded Tabular Breakdown of Individual Monthly Revenue Sources */}
            {showMonthlyDetails && (
              <div className="mt-5 pt-4 border-t border-slate-100 space-y-4">
                {/* Header Controls for Table */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shadow-xs">
                      <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Revenue Breakdown by Source (Room Bookings, Dining, Spa, Bar)
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Seasonal performance audit detailing suite lodging, restaurant dining, wellness spa, and cellar bar
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Active Trend Badge in Expanded View */}
                    <div
                      id="expanded-growth-trend-badge"
                      className={`trend-badge px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 border shadow-2xs transition-all ${
                        isPositiveGrowth
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}
                      title={isPositiveGrowth ? 'Active Trend: Positive YoY Sales Expansion' : 'Active Trend: Negative YoY Sales Contraction'}
                    >
                      {isPositiveGrowth ? (
                        <ArrowUp className="w-3.5 h-3.5 text-emerald-600 animate-bounce shrink-0" />
                      ) : (
                        <ArrowDown className="w-3.5 h-3.5 text-rose-600 animate-bounce shrink-0" />
                      )}
                      <span>
                        {isPositiveGrowth ? `+${effectiveGrowth}%` : `${effectiveGrowth}%`} YoY Trend
                      </span>
                    </div>

                    {/* Download Growth Report Button */}
                    <button
                      type="button"
                      id="btn-download-growth-report"
                      onClick={handleDownloadGrowthReportPdf}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs hover:shadow border border-emerald-800 cursor-pointer"
                      title="Export tabular revenue source breakdown into PDF format using jsPDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Growth Report</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsRevenueTableHeightened(!isRevenueTableHeightened)}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition border ${
                        isRevenueTableHeightened
                          ? 'bg-indigo-600 text-white font-bold border-indigo-600'
                          : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                      }`}
                      title="Toggle row heightening for reading comfort (inventory style)"
                    >
                      <span>↕️ {isRevenueTableHeightened ? 'Compact Rows' : 'Heighten Rows'}</span>
                    </button>
                    {selectedMonthlyRecord && (
                      <button
                        type="button"
                        onClick={() => setSelectedMonthlyRecord(null)}
                        className="px-2 py-1 rounded-md text-xs text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 transition font-medium"
                      >
                        Clear Selection
                      </button>
                    )}
                  </div>
                </div>

                {/* Source Mix Summary Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  <div className="bg-purple-50/70 border border-purple-200/80 rounded-xl p-2.5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-purple-700 uppercase flex items-center gap-1">
                        <BedDouble className="w-3 h-3 text-purple-600" />
                        Room Bookings
                      </span>
                      <span className="text-[10px] font-mono font-bold text-purple-800">
                        {Math.round((sourceTotals.rooms / sourceTotals.total) * 100)}%
                      </span>
                    </div>
                    <div className="text-base font-bold font-serif-luxury text-purple-950">
                      {formatZar(sourceTotals.rooms)}
                    </div>
                    <span className="text-[10px] text-purple-600 block">7-Month Suites Lodging</span>
                  </div>

                  <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-2.5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-amber-700 uppercase flex items-center gap-1">
                        <Utensils className="w-3 h-3 text-amber-600" />
                        Dining & Cuisine
                      </span>
                      <span className="text-[10px] font-mono font-bold text-amber-800">
                        {Math.round((sourceTotals.dining / sourceTotals.total) * 100)}%
                      </span>
                    </div>
                    <div className="text-base font-bold font-serif-luxury text-amber-950">
                      {formatZar(sourceTotals.dining)}
                    </div>
                    <span className="text-[10px] text-amber-600 block">Gourmet Breakfast & Dinners</span>
                  </div>

                  <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-2.5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-rose-700 uppercase flex items-center gap-1">
                        <Wine className="w-3 h-3 text-rose-600" />
                        Bar & Cellar
                      </span>
                      <span className="text-[10px] font-mono font-bold text-rose-800">
                        {Math.round((sourceTotals.bar / sourceTotals.total) * 100)}%
                      </span>
                    </div>
                    <div className="text-base font-bold font-serif-luxury text-rose-950">
                      {formatZar(sourceTotals.bar)}
                    </div>
                    <span className="text-[10px] text-rose-600 block">Cap Classique & Cellar</span>
                  </div>

                  <div className="bg-pink-50/70 border border-pink-200/80 rounded-xl p-2.5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-pink-700 uppercase flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-pink-600" />
                        Spa & Wellness
                      </span>
                      <span className="text-[10px] font-mono font-bold text-pink-800">
                        {Math.round((sourceTotals.spa / sourceTotals.total) * 100)}%
                      </span>
                    </div>
                    <div className="text-base font-bold font-serif-luxury text-pink-950">
                      {formatZar(sourceTotals.spa)}
                    </div>
                    <span className="text-[10px] text-pink-600 block">Botanical Spa Treatments</span>
                  </div>

                  <div className="bg-sky-50/70 border border-sky-200/80 rounded-xl p-2.5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-sky-700 uppercase flex items-center gap-1">
                        <Compass className="w-3 h-3 text-sky-600" />
                        Tours & Charters
                      </span>
                      <span className="text-[10px] font-mono font-bold text-sky-800">
                        {Math.round((sourceTotals.tours / sourceTotals.total) * 100)}%
                      </span>
                    </div>
                    <div className="text-base font-bold font-serif-luxury text-sky-950">
                      {formatZar(sourceTotals.tours)}
                    </div>
                    <span className="text-[10px] text-sky-600 block">Lagoon Catamaran & Trails</span>
                  </div>
                </div>

                {/* Small D3-based Line Chart: 12 Months Historical Visual Context */}
                <div id="section-d3-monthly-sales-history" className="transition-all">
                  <D3MonthlySalesLineChart
                    data={twelveMonthSalesData}
                    height={185}
                    isCompact={false}
                    formatZar={formatZar}
                  />
                </div>

                {/* Source Filter Tabs */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase mr-1">Highlight Source:</span>
                  {[
                    { id: 'ALL', label: 'All Revenue Sources', icon: null },
                    { id: 'rooms', label: 'Room Bookings', icon: <BedDouble className="w-3 h-3 text-purple-600" /> },
                    { id: 'dining', label: 'Dining', icon: <Utensils className="w-3 h-3 text-amber-600" /> },
                    { id: 'spa', label: 'Spa & Wellness', icon: <Sparkles className="w-3 h-3 text-pink-600" /> },
                    { id: 'bar', label: 'Bar & Cellar', icon: <Wine className="w-3 h-3 text-rose-600" /> },
                    { id: 'tours', label: 'Tours & Excursions', icon: <Compass className="w-3 h-3 text-sky-600" /> }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSelectedRevenueSource(tab.id as any)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                        selectedRevenueSource === tab.id
                          ? 'bg-slate-900 text-white font-bold shadow-xs'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>

                {/* Responsive Breakdown Table with Inventory Row Style */}
                <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="px-3 py-2.5 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={selectedMonthlyRecord === 'ALL'}
                            onChange={() => setSelectedMonthlyRecord(selectedMonthlyRecord === 'ALL' ? null : 'ALL')}
                            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                            title="Select all periods"
                          />
                        </th>
                        <th className="px-3 py-2.5">Month / Period</th>
                        <th className={`px-3 py-2.5 ${selectedRevenueSource === 'rooms' ? 'bg-purple-100/70 text-purple-900 font-extrabold' : ''}`}>
                          Room Bookings
                        </th>
                        <th className={`px-3 py-2.5 ${selectedRevenueSource === 'dining' ? 'bg-amber-100/70 text-amber-900 font-extrabold' : ''}`}>
                          Dining
                        </th>
                        <th className={`px-3 py-2.5 ${selectedRevenueSource === 'bar' ? 'bg-rose-100/70 text-rose-900 font-extrabold' : ''}`}>
                          Bar & Cellar
                        </th>
                        <th className={`px-3 py-2.5 ${selectedRevenueSource === 'spa' ? 'bg-pink-100/70 text-pink-900 font-extrabold' : ''}`}>
                          Spa & Wellness
                        </th>
                        <th className={`px-3 py-2.5 ${selectedRevenueSource === 'tours' ? 'bg-sky-100/70 text-sky-900 font-extrabold' : ''}`}>
                          Tours & Charters
                        </th>
                        <th className="px-3 py-2.5">Total Revenue</th>
                        <th className="px-3 py-2.5">Target</th>
                        <th className="px-3 py-2.5">Attainment</th>
                        <th className="px-3 py-2.5">YoY Growth</th>
                        <th className="px-3 py-2.5 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {monthlyRevenueBySource.map((record) => {
                        const isSelected = selectedMonthlyRecord === 'ALL' || selectedMonthlyRecord === record.month;
                        const isTargetMet = record.attainment >= 100;

                        // Inventory row style class mirroring App.tsx
                        const priorityBgClass = isSelected
                          ? 'bg-emerald-50/85 border-l-4 border-l-emerald-600'
                          : record.isCurrent
                          ? 'bg-emerald-50/40 hover:bg-emerald-50/70 border-l-4 border-l-emerald-500'
                          : record.isPacing
                          ? 'bg-amber-50/30 hover:bg-amber-50/50 border-l-4 border-l-amber-400'
                          : isTargetMet
                          ? 'hover:bg-slate-50 border-l-4 border-l-teal-500'
                          : 'hover:bg-slate-50 border-l-4 border-l-slate-300';

                        return (
                          <tr
                            key={record.month}
                            className={`transition-all duration-150 ${priorityBgClass} ${isRevenueTableHeightened ? 'h-16 py-3.5 row-heightened' : 'h-10 py-2'}`}
                          >
                            <td className={`px-3 ${isRevenueTableHeightened ? 'py-3.5' : 'py-2'} text-center`}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => setSelectedMonthlyRecord(selectedMonthlyRecord === record.month ? null : record.month)}
                                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                              />
                            </td>
                            <td className={`px-3 ${isRevenueTableHeightened ? 'py-3.5' : 'py-2'} font-mono font-bold text-slate-800`}>
                              <div className="flex items-center gap-1.5">
                                <span>{record.month}</span>
                                {record.isCurrent && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-emerald-600 text-white uppercase tracking-wider">
                                    Live
                                  </span>
                                )}
                                {record.isPacing && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300 uppercase">
                                    Forecast
                                  </span>
                                )}
                              </div>
                            </td>
                            {/* Room Bookings */}
                            <td className={`px-3 ${isRevenueTableHeightened ? 'py-3.5' : 'py-2'} ${selectedRevenueSource === 'rooms' ? 'bg-purple-50/60 font-extrabold' : ''}`}>
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-bold text-purple-900">
                                  {formatZar(record.roomsZar)}
                                </span>
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-purple-50 text-purple-800 border border-purple-200 flex items-center gap-0.5">
                                  <BedDouble className="w-2.5 h-2.5 text-purple-600" />
                                  Suites
                                </span>
                              </div>
                            </td>
                            {/* Dining */}
                            <td className={`px-3 ${isRevenueTableHeightened ? 'py-3.5' : 'py-2'} ${selectedRevenueSource === 'dining' ? 'bg-amber-50/60 font-extrabold' : ''}`}>
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-bold text-amber-900">
                                  {formatZar(record.diningZar)}
                                </span>
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-0.5">
                                  <Utensils className="w-2.5 h-2.5 text-amber-600" />
                                  Dining
                                </span>
                              </div>
                            </td>
                            {/* Bar & Cellar */}
                            <td className={`px-3 ${isRevenueTableHeightened ? 'py-3.5' : 'py-2'} ${selectedRevenueSource === 'bar' ? 'bg-rose-50/60 font-extrabold' : ''}`}>
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-bold text-rose-900">
                                  {formatZar(record.barZar)}
                                </span>
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-0.5">
                                  <Wine className="w-2.5 h-2.5 text-rose-600" />
                                  Bar
                                </span>
                              </div>
                            </td>
                            {/* Spa & Wellness */}
                            <td className={`px-3 ${isRevenueTableHeightened ? 'py-3.5' : 'py-2'} ${selectedRevenueSource === 'spa' ? 'bg-pink-50/60 font-extrabold' : ''}`}>
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-bold text-pink-900">
                                  {formatZar(record.spaZar)}
                                </span>
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-pink-50 text-pink-800 border border-pink-200 flex items-center gap-0.5">
                                  <Sparkles className="w-2.5 h-2.5 text-pink-600" />
                                  Spa
                                </span>
                              </div>
                            </td>
                            {/* Tours & Charters */}
                            <td className={`px-3 ${isRevenueTableHeightened ? 'py-3.5' : 'py-2'} ${selectedRevenueSource === 'tours' ? 'bg-sky-50/60 font-extrabold' : ''}`}>
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-bold text-sky-900">
                                  {formatZar(record.toursZar)}
                                </span>
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-sky-50 text-sky-800 border border-sky-200 flex items-center gap-0.5">
                                  <Compass className="w-2.5 h-2.5 text-sky-600" />
                                  Tours
                                </span>
                              </div>
                            </td>
                            {/* Total Sales */}
                            <td className={`px-3 ${isRevenueTableHeightened ? 'py-3.5' : 'py-2'} font-mono font-bold text-slate-900`}>
                              {formatZar(record.totalSales)}
                            </td>
                            {/* Monthly Target */}
                            <td className={`px-3 ${isRevenueTableHeightened ? 'py-3.5' : 'py-2'} font-mono text-slate-500`}>
                              {formatZar(record.targetZar)}
                            </td>
                            {/* Attainment Progress */}
                            <td className={`px-3 ${isRevenueTableHeightened ? 'py-3.5' : 'py-2'}`}>
                              <div className="w-28 space-y-1">
                                <div className="flex items-center justify-between text-[10px]">
                                  <span className="font-bold text-slate-700">{record.attainment}%</span>
                                  <span className="text-slate-400">
                                    {record.totalSales >= record.targetZar ? 'Exceeded' : 'Pacing'}
                                  </span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all duration-700 ${
                                      record.attainment >= 100 ? 'bg-emerald-500' : 'bg-amber-500'
                                    }`}
                                    style={{ width: `${Math.min(record.attainment, 100)}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            {/* YoY Growth with Dynamic Trend Indicator */}
                            <td className={`px-3 ${isRevenueTableHeightened ? 'py-3.5' : 'py-2'} font-bold`}>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] inline-flex items-center gap-1 border shadow-2xs transition-all ${
                                  record.growthPct >= 0
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : 'bg-rose-50 text-rose-800 border-rose-200'
                                }`}
                                title={record.growthPct >= 0 ? 'Positive YoY growth' : 'Negative YoY contraction'}
                              >
                                {record.growthPct >= 0 ? (
                                  <ArrowUp className="w-3 h-3 text-emerald-600 shrink-0 trend-indicator-icon upward-arrow" />
                                ) : (
                                  <ArrowDown className="w-3 h-3 text-rose-600 shrink-0 trend-indicator-icon downward-arrow" />
                                )}
                                <span>{record.growthPct >= 0 ? `+${record.growthPct}%` : `${record.growthPct}%`}</span>
                              </span>
                            </td>
                            {/* Status */}
                            <td className={`px-3 ${isRevenueTableHeightened ? 'py-3.5' : 'py-2'} text-center`}>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  isTargetMet
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {isTargetMet ? 'Target Exceeded' : 'Pacing On Track'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-bold text-slate-800 text-[11px]">
                      <tr>
                        <td className="px-3 py-2.5 text-center">Σ</td>
                        <td className="px-3 py-2.5 font-bold uppercase tracking-wider text-slate-700">
                          Total (7 Months)
                        </td>
                        <td className="px-3 py-2.5 font-mono text-purple-900 font-bold">
                          {formatZar(sourceTotals.rooms)}
                        </td>
                        <td className="px-3 py-2.5 font-mono text-amber-900 font-bold">
                          {formatZar(sourceTotals.dining)}
                        </td>
                        <td className="px-3 py-2.5 font-mono text-rose-900 font-bold">
                          {formatZar(sourceTotals.bar)}
                        </td>
                        <td className="px-3 py-2.5 font-mono text-pink-900 font-bold">
                          {formatZar(sourceTotals.spa)}
                        </td>
                        <td className="px-3 py-2.5 font-mono text-sky-900 font-bold">
                          {formatZar(sourceTotals.tours)}
                        </td>
                        <td className="px-3 py-2.5 font-mono text-slate-900 font-extrabold">
                          {formatZar(sourceTotals.total)}
                        </td>
                        <td className="px-3 py-2.5 font-mono text-slate-600">
                          {formatZar(sourceTotals.target)}
                        </td>
                        <td className="px-3 py-2.5 text-emerald-700 font-bold" colSpan={3}>
                          Overall Attainment: {Math.round((sourceTotals.total / sourceTotals.target) * 100)}%
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Bottom Report Download Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">Financial Audit Export:</span>
                    <span>Generates comprehensive monthly revenue source report formatted for PDF download with jsPDF.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      id="expanded-growth-trend-badge-bottom"
                      className={`trend-badge px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1 border ${
                        isPositiveGrowth
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}
                    >
                      {isPositiveGrowth ? (
                        <ArrowUp className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <ArrowDown className="w-3 h-3 text-rose-600" />
                      )}
                      <span>{isPositiveGrowth ? `+${effectiveGrowth}%` : `${effectiveGrowth}%`} Trend Badge</span>
                    </div>
                    <button
                      type="button"
                      id="btn-download-growth-report-bottom"
                      onClick={handleDownloadGrowthReportPdf}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs hover:shadow border border-emerald-800 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Growth Report (PDF)</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Widget Footer Meta */}
          <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Room Revenue: <strong className="text-slate-800">{formatZar(currentMonthData.roomSales)}</strong>
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowMonthlyDetails(!showMonthlyDetails)}
                className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 hover:underline"
              >
                <span>{showMonthlyDetails ? 'Close Details' : 'View Details'}</span>
                {showMonthlyDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => onSelectTab('accounting')}
                className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-0.5 hover:underline"
              >
                Accounts
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
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
