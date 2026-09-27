import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ComposedChart,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  Target,
  Award,
  DollarSign,
  Users,
  Plus,
  Filter,
  CheckCircle,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Sliders,
  X,
  Check,
  Search,
  FileSpreadsheet,
  Percent,
  Star,
  ShoppingBag,
  Compass,
  Utensils,
  Bed,
  Flower2,
  Printer,
  ChevronRight,
  Calculator,
  BarChart3,
  Zap
} from 'lucide-react';
import { 
  StaffSalesPerformance, 
  SalesDealRecord, 
  MonthlySalesTargetPlan,
  Reservation 
} from '../types';
import { 
  INITIAL_MONTHLY_TARGETS, 
  INITIAL_WEEKLY_PROGRESS, 
  INITIAL_STAFF_PERFORMANCE, 
  INITIAL_SALES_DEALS 
} from '../data/salesPerformanceData';
import { DocumentActionBar } from './DocumentActionBar';

interface SalesPerformanceDashboardProps {
  reservations?: Reservation[];
}

const CATEGORY_COLORS: Record<string, string> = {
  'Room Booking': '#059669', // Emerald
  'Dining & Wine Experience': '#d97706', // Amber
  'Excursions & Catamaran': '#0284c7', // Sky
  'Spa & Wellness Package': '#db2777', // Pink
};

const PIE_PALETTE = ['#059669', '#d97706', '#0284c7', '#db2777', '#8b5cf6'];

export const SalesPerformanceDashboard: React.FC<SalesPerformanceDashboardProps> = ({
  reservations = []
}) => {
  // State
  const [selectedMonth, setSelectedMonth] = useState<string>('Sep 2026');
  const [monthlyTargets, setMonthlyTargets] = useState<MonthlySalesTargetPlan[]>(INITIAL_MONTHLY_TARGETS);
  const [weeklyProgress, setWeeklyProgress] = useState(INITIAL_WEEKLY_PROGRESS);
  const [staffPerformance, setStaffPerformance] = useState<StaffSalesPerformance[]>(INITIAL_STAFF_PERFORMANCE);
  const [deals, setDeals] = useState<SalesDealRecord[]>(INITIAL_SALES_DEALS);

  // Filters & selection
  const [selectedStaffId, setSelectedStaffId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [chartMetricView, setChartMetricView] = useState<'targets' | 'efficiency' | 'velocity' | 'commission'>('targets');

  // Quota Calculator state
  const [calcPropertyRevenueTarget, setCalcPropertyRevenueTarget] = useState<number>(300000);
  const [calcSeasonalityMultiplier, setCalcSeasonalityMultiplier] = useState<number>(1.15); // Spring Bloom Knysna Oyster season
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  // Modals
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [isNewDealModalOpen, setIsNewDealModalOpen] = useState(false);
  const [selectedStaffDetail, setSelectedStaffDetail] = useState<StaffSalesPerformance | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Target editing form state
  const [targetForm, setTargetForm] = useState<{ [staffId: string]: number }>(() => {
    const map: { [staffId: string]: number } = {};
    INITIAL_STAFF_PERFORMANCE.forEach(s => {
      map[s.staffId] = s.monthlyTarget;
    });
    return map;
  });

  // New Deal form state
  const [newDeal, setNewDeal] = useState<{
    staffId: string;
    guestName: string;
    serviceCategory: 'Room Booking' | 'Dining & Wine Experience' | 'Excursions & Catamaran' | 'Spa & Wellness Package';
    amountZar: number;
    referenceNumber: string;
  }>({
    staffId: INITIAL_STAFF_PERFORMANCE[0]?.staffId || '',
    guestName: '',
    serviceCategory: 'Room Booking',
    amountZar: 4500,
    referenceNumber: `TOK-SLS-${Math.floor(1000 + Math.random() * 9000)}`
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Calculations
  const currentMonthPlan = monthlyTargets.find(m => m.month === selectedMonth) || monthlyTargets[5];

  const totalActualSales = useMemo(() => {
    return staffPerformance.reduce((acc, curr) => acc + curr.actualSales, 0);
  }, [staffPerformance]);

  const totalMonthlyTarget = useMemo(() => {
    return staffPerformance.reduce((acc, curr) => acc + curr.monthlyTarget, 0);
  }, [staffPerformance]);

  const overallAchievementPercent = totalMonthlyTarget > 0 
    ? Math.round((totalActualSales / totalMonthlyTarget) * 100) 
    : 0;

  const totalCommissionPaid = useMemo(() => {
    return staffPerformance.reduce((acc, curr) => acc + curr.commissionEarned, 0);
  }, [staffPerformance]);

  const totalBookingsAndUpsells = useMemo(() => {
    return staffPerformance.reduce((acc, curr) => acc + curr.bookingsCount + curr.upsellCount, 0);
  }, [staffPerformance]);

  const avgDealValue = deals.length > 0 
    ? Math.round(deals.reduce((a, b) => a + b.amountZar, 0) / deals.length) 
    : 0;

  // Category revenue totals
  const categoryRevenueData = useMemo(() => {
    const totals: Record<string, number> = {
      'Room Bookings': 0,
      'Dining & Wine': 0,
      'Excursions & Catamaran': 0,
      'Spa & Wellness': 0,
    };

    staffPerformance.forEach(staff => {
      totals['Room Bookings'] += staff.categoryBreakdown.roomBookings;
      totals['Dining & Wine'] += staff.categoryBreakdown.diningAndWine;
      totals['Excursions & Catamaran'] += staff.categoryBreakdown.excursionsAndTours;
      totals['Spa & Wellness'] += staff.categoryBreakdown.spaAndWellness;
    });

    return Object.entries(totals).map(([name, value]) => ({
      name,
      value,
    }));
  }, [staffPerformance]);

  // Target vs Actual Chart Data
  const targetVsActualChartData = useMemo(() => {
    return staffPerformance.map(staff => ({
      name: staff.staffName.split(' ')[0], // First name for clean axis
      fullName: staff.staffName,
      Target: staff.monthlyTarget,
      Actual: staff.actualSales,
      Achievement: Math.round((staff.actualSales / staff.monthlyTarget) * 100),
      Commission: staff.commissionEarned,
      Role: staff.role
    }));
  }, [staffPerformance]);

  // Comprehensive Individual Performance Metrics for Recharts
  const individualMetricsChartData = useMemo(() => {
    return staffPerformance.map(staff => {
      const achievement = Math.round((staff.actualSales / staff.monthlyTarget) * 100);
      return {
        name: staff.staffName.split(' ')[0],
        fullName: staff.staffName,
        Role: staff.role,
        Target: staff.monthlyTarget,
        Actual: staff.actualSales,
        Achievement: achievement,
        ConversionRate: staff.conversionRate,
        CsatRating: staff.csatRating,
        CsatScaled: Math.round((staff.csatRating / 5.0) * 100),
        BookingsCount: staff.bookingsCount,
        UpsellCount: staff.upsellCount,
        TotalDeals: staff.bookingsCount + staff.upsellCount,
        Commission: staff.commissionEarned,
        CommissionRatePct: Math.round(staff.commissionRate * 100),
      };
    });
  }, [staffPerformance]);

  // Quota Calculator: calculate quotas dynamically across staff based on hotel target & role weights
  const calculateQuotasByRole = (basePropertyTarget: number, seasonalFactor: number) => {
    const totalEffectivePool = basePropertyTarget * seasonalFactor;
    // Relative revenue capacity weights by role
    const roleWeights: Record<string, number> = {
      'emp-001': 0.35, // Eleanor Sterling (Front Desk / Hospitality Supervisor - rooms & all)
      'emp-003': 0.22, // Francois Joubert (Culinary & Wine experiences)
      'emp-005': 0.18, // Jabu Nkosi (VIP Transfers, Catamaran, Featherbed tours)
      'emp-004': 0.14, // Kobus Van Der Merwe (Lagoon watercraft & bikes)
      'emp-002': 0.11, // Thandiwe Ndlovu (Guest Relations / Spa packages)
    };

    const newTargetMap: { [staffId: string]: number } = {};
    staffPerformance.forEach(staff => {
      const weight = roleWeights[staff.staffId] || (1 / staffPerformance.length);
      // Round to nearest R 1,000
      const quota = Math.round((totalEffectivePool * weight) / 1000) * 1000;
      newTargetMap[staff.staffId] = quota;
    });

    return newTargetMap;
  };

  const handleApplyCalculatedQuotas = () => {
    const calculated = calculateQuotasByRole(calcPropertyRevenueTarget, calcSeasonalityMultiplier);
    setTargetForm(calculated);
    showToast(`Calculated dynamic quotas for R ${(calcPropertyRevenueTarget * calcSeasonalityMultiplier).toLocaleString()} seasonal pool.`);
  };

  // Filtered staff list
  const filteredStaff = useMemo(() => {
    if (selectedStaffId === 'all') return staffPerformance;
    return staffPerformance.filter(s => s.staffId === selectedStaffId);
  }, [staffPerformance, selectedStaffId]);

  // Filtered deals ledger
  const filteredDeals = useMemo(() => {
    return deals.filter(deal => {
      const matchStaff = selectedStaffId === 'all' || deal.staffId === selectedStaffId;
      const matchCat = categoryFilter === 'all' || deal.serviceCategory === categoryFilter;
      const matchSearch = deal.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          deal.staffName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          deal.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStaff && matchCat && matchSearch;
    });
  }, [deals, selectedStaffId, categoryFilter, searchQuery]);

  // Top performer
  const topPerformer = useMemo(() => {
    return [...staffPerformance].sort((a, b) => (b.actualSales / b.monthlyTarget) - (a.actualSales / a.monthlyTarget))[0];
  }, [staffPerformance]);

  // Handle Save Targets
  const handleSaveTargets = () => {
    const updatedStaff = staffPerformance.map(s => {
      const newTarget = targetForm[s.staffId] || s.monthlyTarget;
      return {
        ...s,
        monthlyTarget: newTarget,
      };
    });
    setStaffPerformance(updatedStaff);

    // Update current month target in monthlyTargets plan
    const newTotalTarget = updatedStaff.reduce((sum, s) => sum + s.monthlyTarget, 0);
    setMonthlyTargets(prev => prev.map(m => m.month === selectedMonth ? { ...m, targetZar: newTotalTarget } : m));

    setIsTargetModalOpen(false);
    showToast(`Monthly sales targets updated successfully for ${selectedMonth}!`);
  };

  // Handle Add New Deal / Upsell
  const handleAddDeal = (e: React.FormEvent) => {
    e.preventDefault();
    const staff = staffPerformance.find(s => s.staffId === newDeal.staffId);
    if (!staff) return;

    const commissionZar = Math.round(newDeal.amountZar * staff.commissionRate);
    const dealItem: SalesDealRecord = {
      id: `deal-${Date.now()}`,
      staffId: newDeal.staffId,
      staffName: staff.staffName,
      guestName: newDeal.guestName || 'Walk-in Guest',
      date: new Date().toISOString().split('T')[0],
      serviceCategory: newDeal.serviceCategory,
      amountZar: Number(newDeal.amountZar),
      commissionZar,
      referenceNumber: newDeal.referenceNumber || `SLS-${Date.now().toString().slice(-4)}`,
      status: 'Confirmed'
    };

    setDeals([dealItem, ...deals]);

    // Update staff actual sales, commissions and category breakdown
    setStaffPerformance(prev => prev.map(s => {
      if (s.staffId !== staff.staffId) return s;
      const isRoom = newDeal.serviceCategory === 'Room Booking';
      return {
        ...s,
        actualSales: s.actualSales + dealItem.amountZar,
        commissionEarned: s.commissionEarned + commissionZar,
        bookingsCount: isRoom ? s.bookingsCount + 1 : s.bookingsCount,
        upsellCount: !isRoom ? s.upsellCount + 1 : s.upsellCount,
        categoryBreakdown: {
          ...s.categoryBreakdown,
          roomBookings: isRoom ? s.categoryBreakdown.roomBookings + dealItem.amountZar : s.categoryBreakdown.roomBookings,
          diningAndWine: newDeal.serviceCategory === 'Dining & Wine Experience' ? s.categoryBreakdown.diningAndWine + dealItem.amountZar : s.categoryBreakdown.diningAndWine,
          excursionsAndTours: newDeal.serviceCategory === 'Excursions & Catamaran' ? s.categoryBreakdown.excursionsAndTours + dealItem.amountZar : s.categoryBreakdown.excursionsAndTours,
          spaAndWellness: newDeal.serviceCategory === 'Spa & Wellness Package' ? s.categoryBreakdown.spaAndWellness + dealItem.amountZar : s.categoryBreakdown.spaAndWellness,
        }
      };
    }));

    // Update weekly chart actuals
    setWeeklyProgress(prev => {
      const copy = [...prev];
      const lastIdx = copy.length - 1;
      copy[lastIdx] = {
        ...copy[lastIdx],
        actualZar: copy[lastIdx].actualZar + dealItem.amountZar,
        cumulativeActual: copy[lastIdx].cumulativeActual + dealItem.amountZar
      };
      return copy;
    });

    setIsNewDealModalOpen(false);
    setNewDeal({
      staffId: staffPerformance[0]?.staffId || '',
      guestName: '',
      serviceCategory: 'Room Booking',
      amountZar: 4500,
      referenceNumber: `TOK-SLS-${Math.floor(1000 + Math.random() * 9000)}`
    });
    showToast(`Logged R ${dealItem.amountZar.toLocaleString()} deal credited to ${staff.staffName}!`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-emerald-500/50 flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Check className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Document Action Bar */}
      <DocumentActionBar
        documentTitle="Monthly Sales Target & Staff Performance Matrix"
        documentNumber={`SLS-PERF-${selectedMonth.replace(' ', '-').toUpperCase()}`}
        onSave={() => showToast('Sales performance audit & quotas filed into general ledger.')}
      />

      {/* Header Banner & Context Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-2xl p-6 border border-emerald-800/40 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                Hospitality Sales & Incentives Engine
              </span>
              <span className="text-slate-400 text-xs">•</span>
              <span className="text-xs text-slate-300 font-medium">BCEA & Commission Compliant</span>
            </div>
            <h2 className="text-2xl font-bold font-serif-luxury text-white">
              Sales Performance & Monthly Target Tracking
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
              Calculate, monitor, and incentivize frontline team performance across room reservations, 
              oyster & culinary tastings, catamaran lagoon cruises, and fynbos spa wellness bookings.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400 font-medium">Target Period:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent font-bold text-white focus:outline-none cursor-pointer"
              >
                {monthlyTargets.map(m => (
                  <option key={m.month} value={m.month} className="bg-slate-900 text-white">
                    {m.month}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setIsTargetModalOpen(true)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
            >
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              Adjust Targets
            </button>

            <button
              onClick={() => setIsNewDealModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-md"
            >
              <Plus className="w-4 h-4" />
              Log Deal / Upsell
            </button>
          </div>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Sales vs Target */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Monthly Sales vs Target</span>
            <div className={`p-2 rounded-xl ${overallAchievementPercent >= 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-serif-luxury text-slate-900">
            R {totalActualSales.toLocaleString()}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-slate-500">Target: R {totalMonthlyTarget.toLocaleString()}</span>
            <span className={`font-bold flex items-center gap-0.5 ${overallAchievementPercent >= 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {overallAchievementPercent >= 100 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              {overallAchievementPercent}% achieved
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                overallAchievementPercent >= 100 ? 'bg-emerald-600' : 'bg-amber-500'
              }`}
              style={{ width: `${Math.min(overallAchievementPercent, 100)}%` }}
            />
          </div>
        </div>

        {/* KPI 2: Target Surplus / Gap */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Net Target Variance</span>
            <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-bold font-serif-luxury ${totalActualSales >= totalMonthlyTarget ? 'text-emerald-700' : 'text-rose-600'}`}>
            {totalActualSales >= totalMonthlyTarget ? '+' : ''}R {(totalActualSales - totalMonthlyTarget).toLocaleString()}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>Month-on-Month Pace</span>
            <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
              +13.4% YoY
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {totalActualSales >= totalMonthlyTarget 
              ? 'Exceeded monthly forecast by 10.9%' 
              : 'Pacing required to hit target threshold'}
          </p>
        </div>

        {/* KPI 3: Staff Commissions Earned */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Staff Commissions Paid</span>
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-serif-luxury text-slate-900">
            R {totalCommissionPaid.toLocaleString()}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>Active Commissioned Staff</span>
            <span className="font-semibold text-slate-800">{staffPerformance.length} Team Members</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Avg. R {Math.round(totalCommissionPaid / staffPerformance.length).toLocaleString()} incentive per person
          </p>
        </div>

        {/* KPI 4: Deals & Upsells Closed */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Transactions & Upsells</span>
            <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-serif-luxury text-slate-900">
            {totalBookingsAndUpsells} Deals
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>Average Ticket</span>
            <span className="font-bold text-slate-800">R {avgDealValue.toLocaleString()}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Top Performer: <strong className="text-emerald-700">{topPerformer?.staffName.split(' ')[0]} ({Math.round((topPerformer?.actualSales / topPerformer?.monthlyTarget) * 100)}%)</strong>
          </p>
        </div>
      </div>

      {/* Charts Grid: Visualizing Targets & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart: Multi-Metric Individual Performance & Quotas (Recharts) - 2 cols on lg */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-serif-luxury font-bold text-slate-900 text-base flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-600" />
                Staff Performance & Sales Quotas: {selectedMonth}
              </h3>
              <p className="text-xs text-slate-500">
                {chartMetricView === 'targets' && 'Individual monthly sales targets vs actuals in South African Rands (ZAR)'}
                {chartMetricView === 'efficiency' && 'Closing conversion rate (%) & guest satisfaction score (CSAT) per staff member'}
                {chartMetricView === 'velocity' && 'Direct room reservations vs add-on experiential upsells closed per staff member'}
                {chartMetricView === 'commission' && 'Incentive commission yield and earnings accrued per staff member'}
              </p>
            </div>

            {/* Metric Mode Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1 text-xs">
              <button
                id="btn-metric-targets"
                onClick={() => setChartMetricView('targets')}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                  chartMetricView === 'targets'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Target className="w-3.5 h-3.5" />
                <span>Quotas vs Actuals</span>
              </button>

              <button
                id="btn-metric-efficiency"
                onClick={() => setChartMetricView('efficiency')}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                  chartMetricView === 'efficiency'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Percent className="w-3.5 h-3.5" />
                <span>Conversion & CSAT</span>
              </button>

              <button
                id="btn-metric-velocity"
                onClick={() => setChartMetricView('velocity')}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                  chartMetricView === 'velocity'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Deals & Upsells</span>
              </button>

              <button
                id="btn-metric-commission"
                onClick={() => setChartMetricView('commission')}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                  chartMetricView === 'commission'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Commissions</span>
              </button>
            </div>
          </div>

          {/* VIEW 1: TARGET VS ACTUAL (ZAR) */}
          {chartMetricView === 'targets' && (
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={targetVsActualChartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    tickFormatter={(val) => `R ${val / 1000}k`}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    formatter={(value: any, name: any) => [
                      `R ${Number(value).toLocaleString()}`,
                      name === 'Actual' ? 'Actual Closed' : 'Monthly Quota'
                    ]}
                    labelFormatter={(name) => {
                      const matched = targetVsActualChartData.find(d => d.name === name);
                      return `${matched?.fullName || name} (${matched?.Role || ''})`;
                    }}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#1e293b',
                      borderRadius: '0.75rem',
                      color: '#ffffff',
                      fontSize: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey="Target" fill="#cbd5e1" radius={[4, 4, 0, 0]} maxBarSize={36} />
                  <Bar dataKey="Actual" fill="#059669" radius={[4, 4, 0, 0]} maxBarSize={36}>
                    {targetVsActualChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.Actual >= entry.Target ? '#059669' : '#f59e0b'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* VIEW 2: CONVERSION & CSAT QUALITY MATRIX */}
          {chartMetricView === 'efficiency' && (
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={individualMetricsChartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis 
                    domain={[0, 100]}
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    tickFormatter={(val) => `${val}%`}
                    axisLine={false}
                    tickLine={false}
                  />
                  <ReferenceLine y={80} stroke="#94a3b8" strokeDasharray="3 3" label={{ value: '80% 5-Star Target', fill: '#64748b', fontSize: 10, position: 'top' }} />
                  <Tooltip 
                    formatter={(value: any, name: any, item: any) => {
                      if (name === 'ConversionRate') return [`${value}%`, 'Booking Conversion Rate'];
                      if (name === 'CsatScaled') return [`${item.payload.CsatRating} / 5.0 (${value}%)`, 'Guest CSAT Rating'];
                      return [value, name];
                    }}
                    labelFormatter={(name) => {
                      const matched = individualMetricsChartData.find(d => d.name === name);
                      return `${matched?.fullName || name} (${matched?.Role || ''})`;
                    }}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#1e293b',
                      borderRadius: '0.75rem',
                      color: '#ffffff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="ConversionRate" fill="#0284c7" radius={[4, 4, 0, 0]} maxBarSize={32} name="ConversionRate" />
                  <Line 
                    type="monotone" 
                    dataKey="CsatScaled" 
                    stroke="#f59e0b" 
                    strokeWidth={3} 
                    dot={{ r: 5, fill: '#f59e0b' }}
                    name="CsatScaled"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* VIEW 3: DEALS & UPSELL VELOCITY */}
          {chartMetricView === 'velocity' && (
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={individualMetricsChartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    formatter={(value: any, name: any, item: any) => {
                      if (name === 'BookingsCount') return [`${value} Suites`, 'Direct Room Bookings'];
                      if (name === 'UpsellCount') return [`${value} Experiences`, 'Dining / Tour Upsells'];
                      return [value, name];
                    }}
                    labelFormatter={(name) => {
                      const matched = individualMetricsChartData.find(d => d.name === name);
                      return `${matched?.fullName || name} (${matched?.Role || ''}) - Total: ${matched?.TotalDeals} Deals`;
                    }}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#1e293b',
                      borderRadius: '0.75rem',
                      color: '#ffffff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="BookingsCount" stackId="deals" fill="#059669" radius={[0, 0, 0, 0]} maxBarSize={36} name="BookingsCount" />
                  <Bar dataKey="UpsellCount" stackId="deals" fill="#d97706" radius={[4, 4, 0, 0]} maxBarSize={36} name="UpsellCount" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* VIEW 4: COMMISSION & INCENTIVE EARNINGS */}
          {chartMetricView === 'commission' && (
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={individualMetricsChartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    tickFormatter={(val) => `R ${val}`}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    formatter={(value: any, name: any, item: any) => [
                      `R ${Number(value).toLocaleString()} (${item.payload.CommissionRatePct}% rate)`,
                      'Commission Payout'
                    ]}
                    labelFormatter={(name) => {
                      const matched = individualMetricsChartData.find(d => d.name === name);
                      return `${matched?.fullName || name} (${matched?.Role || ''})`;
                    }}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#1e293b',
                      borderRadius: '0.75rem',
                      color: '#ffffff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="Commission" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={36}>
                    {individualMetricsChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-comm-${index}`} 
                        fill={entry.Commission > 4000 ? '#059669' : '#10b981'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Dynamic Footer Legend */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 flex-wrap gap-2">
            {chartMetricView === 'targets' && (
              <>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-slate-300"></span>
                  Grey: Monthly Target
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500"></span>
                  Green: Quota Met (&ge; 100%)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-amber-500"></span>
                  Amber: In Progress (&lt; 100%)
                </span>
              </>
            )}

            {chartMetricView === 'efficiency' && (
              <>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-sky-600"></span>
                  Blue Bars: Closing Conversion Rate (%)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  Amber Line: Guest CSAT Quality Score
                </span>
                <span className="text-slate-400">
                  Benchmarked to Knysna Luxury Hospitality standards
                </span>
              </>
            )}

            {chartMetricView === 'velocity' && (
              <>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600"></span>
                  Green: Direct Suite Bookings
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-amber-600"></span>
                  Amber: Dining, Catamaran & Spa Upsells
                </span>
              </>
            )}

            {chartMetricView === 'commission' && (
              <>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600"></span>
                  Calculated against contractual 5%-7% commission tiers
                </span>
                <span className="font-semibold text-emerald-700">
                  Total Cycle Accrual: R {totalCommissionPaid.toLocaleString()}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Revenue Distribution by Service Stream (Donut / Pie Chart) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-slate-100">
              <h3 className="font-serif-luxury font-bold text-slate-900 text-base flex items-center gap-2">
                <Utensils className="w-4 h-4 text-amber-600" />
                Revenue by Service Category
              </h3>
              <p className="text-xs text-slate-500">Staff sales distribution across service lines</p>
            </div>

            <div className="h-56 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryRevenueData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryRevenueData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_PALETTE[index % PIE_PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [`R ${Number(val).toLocaleString()}`, 'Total Revenue']}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '0.75rem',
                      color: '#ffffff',
                      fontSize: '11px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Pool</span>
                <span className="font-bold text-slate-900 text-sm">
                  R {(totalActualSales / 1000).toFixed(0)}k
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            {categoryRevenueData.map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span 
                    className="w-2.5 h-2.5 rounded-full" 
                    style={{ backgroundColor: PIE_PALETTE[idx % PIE_PALETTE.length] }} 
                  />
                  <span className="text-slate-700 font-medium">{item.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900">R {item.value.toLocaleString()}</span>
                  <span className="text-slate-400 text-[10px] ml-1.5">
                    ({Math.round((item.value / totalActualSales) * 100 || 0)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Chart: Cumulative Monthly Run Rate Pace (Area Chart) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-serif-luxury font-bold text-slate-900 text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Monthly Cumulative Run-Rate Pacing vs Target Path
            </h3>
            <p className="text-xs text-slate-500">
              Tracking progress curve week-by-week toward the R {totalMonthlyTarget.toLocaleString()} goal
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-slate-400 border-t-2 border-dashed border-slate-400"></span>
              <span className="text-slate-500">Required Target Pace</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-2 rounded-xs bg-emerald-500"></span>
              <span className="text-slate-900 font-bold">Actual Cumulative Sales</span>
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyProgress} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
              <defs>
                <linearGradient id="actualSalesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
              <YAxis 
                tick={{ fontSize: 10, fill: '#94a3b8' }} 
                tickFormatter={(val) => `R ${val / 1000}k`}
                axisLine={false} 
                tickLine={false} 
              />
              <Tooltip 
                formatter={(val: any, name: any) => [
                  `R ${Number(val).toLocaleString()}`,
                  name === 'cumulativeActual' ? 'Cumulative Actual' : 'Target Baseline'
                ]}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '0.75rem',
                  color: '#ffffff',
                  fontSize: '11px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="cumulativeActual" 
                stroke="#059669" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#actualSalesGrad)" 
              />
              <Line 
                type="monotone" 
                dataKey="cumulativeTarget" 
                stroke="#94a3b8" 
                strokeWidth={2} 
                strokeDasharray="4 4" 
                dot={{ r: 4, fill: '#94a3b8' }} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Staff Leaderboard & Individual Metric Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-serif-luxury font-bold text-slate-900 text-base flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              Staff Individual Sales Leaderboard & Performance Metrics
            </h3>
            <p className="text-xs text-slate-500">
              Detailed breakdown of quotas, closing efficiency, customer satisfaction ratings, and incentive pay
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Filter Member:</span>
            <select
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-700 bg-white font-semibold focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Team Members ({staffPerformance.length})</option>
              {staffPerformance.map(s => (
                <option key={s.staffId} value={s.staffId}>{s.staffName}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Staff Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStaff.map((staff, idx) => {
            const achPercent = Math.round((staff.actualSales / staff.monthlyTarget) * 100);
            const isExceeded = achPercent >= 100;
            const isTop = staff.staffId === topPerformer?.staffId;

            return (
              <div 
                key={staff.staffId}
                onClick={() => setSelectedStaffDetail(staff)}
                className="group border border-slate-200 hover:border-emerald-400 bg-slate-50/50 hover:bg-white rounded-xl p-4 transition-all duration-200 shadow-2xs hover:shadow-md cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center font-bold text-sm shadow-xs">
                        {staff.avatarInitials}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition">
                            {staff.staffName}
                          </h4>
                          {isTop && (
                            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-amber-300">
                              ★ Top
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500">{staff.role}</span>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isExceeded 
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
                        : 'bg-amber-50 border-amber-300 text-amber-800'
                    }`}>
                      {achPercent}% Target
                    </span>
                  </div>

                  {/* Financial Stats */}
                  <div className="grid grid-cols-2 gap-2 bg-white rounded-lg p-2.5 border border-slate-200/80 mb-3 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Actual Sales</span>
                      <span className="font-bold text-slate-900 text-sm">R {staff.actualSales.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Monthly Target</span>
                      <span className="font-semibold text-slate-600">R {staff.monthlyTarget.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1 mb-3">
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Quota Progress</span>
                      <span className="font-bold text-slate-700">{achPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${isExceeded ? 'bg-emerald-500' : 'bg-amber-500'}`}
                        style={{ width: `${Math.min(achPercent, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Secondary Metrics */}
                  <div className="grid grid-cols-3 gap-1 text-[11px] text-slate-600 border-t border-slate-100 pt-2.5">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block font-medium">Deals/Upsells</span>
                      <span className="font-bold text-slate-800">{staff.bookingsCount + staff.upsellCount} closed</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block font-medium">CSAT Score</span>
                      <span className="font-bold text-amber-600 flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                        {staff.csatRating}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block font-medium">Commission</span>
                      <span className="font-bold text-emerald-700">R {staff.commissionEarned.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-emerald-700 font-semibold group-hover:translate-x-0.5 transition">
                  <span>View Sales Dossier & Breakdown</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sales Transactions & Upsell Records Ledger */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-serif-luxury font-bold text-slate-900 text-base flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Direct Bookings & Add-On Sales Ledger
            </h3>
            <p className="text-xs text-slate-500">
              Itemized list of sales deals, guest booking commissions, and experiential upsells
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search guest, ref #, staff..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg w-56 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 font-medium focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Service Categories</option>
              <option value="Room Booking">Room Booking</option>
              <option value="Dining & Wine Experience">Dining & Wine Experience</option>
              <option value="Excursions & Catamaran">Excursions & Catamaran</option>
              <option value="Spa & Wellness Package">Spa & Wellness Package</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-3 py-2.5">Ref #</th>
                <th className="px-3 py-2.5">Date</th>
                <th className="px-3 py-2.5">Guest Name</th>
                <th className="px-3 py-2.5">Staff Member</th>
                <th className="px-3 py-2.5">Service Category</th>
                <th className="px-3 py-2.5 text-right">Deal Amount (ZAR)</th>
                <th className="px-3 py-2.5 text-right">Commission</th>
                <th className="px-3 py-2.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDeals.map((deal) => {
                const catColor = CATEGORY_COLORS[deal.serviceCategory] || '#059669';
                return (
                  <tr key={deal.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-3 py-2.5 font-mono font-bold text-slate-700">{deal.referenceNumber}</td>
                    <td className="px-3 py-2.5 text-slate-500">{deal.date}</td>
                    <td className="px-3 py-2.5 font-semibold text-slate-900">{deal.guestName}</td>
                    <td className="px-3 py-2.5 text-slate-700">{deal.staffName}</td>
                    <td className="px-3 py-2.5">
                      <span 
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold"
                        style={{ backgroundColor: `${catColor}15`, color: catColor }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: catColor }} />
                        {deal.serviceCategory}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right font-bold text-slate-900">
                      R {deal.amountZar.toLocaleString()}
                    </td>
                    <td className="px-3 py-2.5 text-right font-semibold text-emerald-700">
                      R {deal.commissionZar.toLocaleString()}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        {deal.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filteredDeals.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400">
                    No sales deals matched your search filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Adjust Targets with Smart Quota Calculator */}
      {isTargetModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-emerald-600" />
                <h3 className="font-serif-luxury font-bold text-slate-900 text-lg">
                  Configure Monthly Sales Targets ({selectedMonth})
                </h3>
              </div>
              <button 
                onClick={() => setIsTargetModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Smart Seasonality Quota Calculator */}
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-emerald-600" />
                  Smart Seasonality Quota Calculator
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  Algorithm Active
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] font-semibold text-emerald-900 block mb-1">
                    Property Target Pool (ZAR)
                  </label>
                  <input
                    type="number"
                    step="10000"
                    value={calcPropertyRevenueTarget}
                    onChange={(e) => setCalcPropertyRevenueTarget(Number(e.target.value))}
                    className="w-full text-xs font-bold px-2 py-1.5 border border-emerald-300 rounded-lg bg-white text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-emerald-900 block mb-1">
                    Seasonality Multiplier
                  </label>
                  <select
                    value={calcSeasonalityMultiplier}
                    onChange={(e) => setCalcSeasonalityMultiplier(Number(e.target.value))}
                    className="w-full text-xs font-bold px-2 py-1.5 border border-emerald-300 rounded-lg bg-white text-slate-800"
                  >
                    <option value={0.85}>Winter Low Season (0.85x)</option>
                    <option value={1.00}>Shoulder Season (1.00x)</option>
                    <option value={1.15}>Spring Oyster Festival (1.15x)</option>
                    <option value={1.45}>Summer Festive Peak (1.45x)</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-emerald-800">
                  Targeted Seasonal Pool: <strong>R {(calcPropertyRevenueTarget * calcSeasonalityMultiplier).toLocaleString()}</strong>
                </span>
                <button
                  type="button"
                  onClick={handleApplyCalculatedQuotas}
                  className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition"
                >
                  <Zap className="w-3 h-3 text-amber-300" />
                  Auto-Distribute Quotas
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              Adjust individual staff quotas below. Changes immediately update Recharts visualizations upon saving.
            </p>

            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {staffPerformance.map(staff => (
                <div key={staff.staffId} className="flex items-center justify-between gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs">{staff.staffName}</h5>
                    <span className="text-[10px] text-slate-500">{staff.role}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-500">R</span>
                    <input
                      type="number"
                      step="1000"
                      value={targetForm[staff.staffId] || staff.monthlyTarget}
                      onChange={(e) => setTargetForm({
                        ...targetForm,
                        [staff.staffId]: Number(e.target.value)
                      })}
                      className="w-28 text-xs font-bold px-2.5 py-1.5 border border-slate-300 rounded-lg text-right focus:outline-none focus:border-emerald-500 bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-100 p-2.5 rounded-xl flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">New Total Quota Sum:</span>
              <strong className="text-slate-900 font-bold text-sm">
                R {Object.values(targetForm).reduce((a, b) => a + b, 0).toLocaleString()}
              </strong>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsTargetModalOpen(false)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTargets}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                Save & Recalculate Quotas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Log New Deal / Upsell */}
      {isNewDealModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" />
                <h3 className="font-serif-luxury font-bold text-slate-900 text-lg">
                  Log New Booking or Add-on Upsell
                </h3>
              </div>
              <button 
                onClick={() => setIsNewDealModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDeal} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Attributed Staff Member</label>
                <select
                  value={newDeal.staffId}
                  onChange={(e) => setNewDeal({ ...newDeal, staffId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-medium"
                  required
                >
                  {staffPerformance.map(s => (
                    <option key={s.staffId} value={s.staffId}>
                      {s.staffName} ({s.role}) - Comm: {(s.commissionRate * 100).toFixed(0)}%
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Guest Name / Account</label>
                <input
                  type="text"
                  placeholder="e.g. Lord & Lady Pembroke"
                  value={newDeal.guestName}
                  onChange={(e) => setNewDeal({ ...newDeal, guestName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Service Stream</label>
                  <select
                    value={newDeal.serviceCategory}
                    onChange={(e) => setNewDeal({ ...newDeal, serviceCategory: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Room Booking">Room Booking</option>
                    <option value="Dining & Wine Experience">Dining & Wine Experience</option>
                    <option value="Excursions & Catamaran">Excursions & Catamaran</option>
                    <option value="Spa & Wellness Package">Spa & Wellness Package</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Deal Value (ZAR)</label>
                  <input
                    type="number"
                    step="100"
                    value={newDeal.amountZar}
                    onChange={(e) => setNewDeal({ ...newDeal, amountZar: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Booking / Receipt Reference</label>
                <input
                  type="text"
                  value={newDeal.referenceNumber}
                  onChange={(e) => setNewDeal({ ...newDeal, referenceNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  required
                />
              </div>

              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-emerald-900 text-[11px] flex items-center justify-between">
                <span>Calculated Commission Earned:</span>
                <strong className="text-emerald-800 text-xs">
                  R {Math.round(newDeal.amountZar * (staffPerformance.find(s => s.staffId === newDeal.staffId)?.commissionRate || 0.05)).toLocaleString()}
                </strong>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewDealModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-md flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Confirm & Credit Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Individual Staff Detail Dossier */}
      {selectedStaffDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center font-bold text-base shadow-xs">
                  {selectedStaffDetail.avatarInitials}
                </div>
                <div>
                  <h3 className="font-serif-luxury font-bold text-slate-900 text-lg">
                    {selectedStaffDetail.staffName}
                  </h3>
                  <span className="text-xs text-slate-500">{selectedStaffDetail.role}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedStaffDetail(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Performance Snapshot */}
            <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Target vs Actual</span>
                <span className="font-bold text-slate-900 text-sm">
                  R {selectedStaffDetail.actualSales.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  of R {selectedStaffDetail.monthlyTarget.toLocaleString()} ({Math.round((selectedStaffDetail.actualSales / selectedStaffDetail.monthlyTarget) * 100)}%)
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Commission ({(selectedStaffDetail.commissionRate * 100)}%)</span>
                <span className="font-bold text-emerald-700 text-sm">
                  R {selectedStaffDetail.commissionEarned.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-500 block">Accrued this cycle</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Guest CSAT</span>
                <span className="font-bold text-amber-600 text-sm flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {selectedStaffDetail.csatRating} / 5.0
                </span>
                <span className="text-[10px] text-slate-500 block">Based on feedback</span>
              </div>
            </div>

            {/* Category breakdown bars */}
            <div className="space-y-2 text-xs">
              <h5 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                Attributed Revenue Breakdown
              </h5>
              
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-slate-600 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Bed className="w-3.5 h-3.5 text-emerald-600" /> Room Bookings
                    </span>
                    <span className="font-bold text-slate-900">
                      R {selectedStaffDetail.categoryBreakdown.roomBookings.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-600 h-full rounded-full"
                      style={{ width: `${(selectedStaffDetail.categoryBreakdown.roomBookings / selectedStaffDetail.actualSales) * 100 || 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-600 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Utensils className="w-3.5 h-3.5 text-amber-600" /> Dining & Wine Experiences
                    </span>
                    <span className="font-bold text-slate-900">
                      R {selectedStaffDetail.categoryBreakdown.diningAndWine.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-amber-600 h-full rounded-full"
                      style={{ width: `${(selectedStaffDetail.categoryBreakdown.diningAndWine / selectedStaffDetail.actualSales) * 100 || 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-600 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-sky-600" /> Excursions & Catamaran
                    </span>
                    <span className="font-bold text-slate-900">
                      R {selectedStaffDetail.categoryBreakdown.excursionsAndTours.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-sky-600 h-full rounded-full"
                      style={{ width: `${(selectedStaffDetail.categoryBreakdown.excursionsAndTours / selectedStaffDetail.actualSales) * 100 || 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-600 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Flower2 className="w-3.5 h-3.5 text-pink-600" /> Spa & Wellness Packages
                    </span>
                    <span className="font-bold text-slate-900">
                      R {selectedStaffDetail.categoryBreakdown.spaAndWellness.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-pink-600 h-full rounded-full"
                      style={{ width: `${(selectedStaffDetail.categoryBreakdown.spaAndWellness / selectedStaffDetail.actualSales) * 100 || 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Conversion Rate: <strong className="text-slate-800">{selectedStaffDetail.conversionRate}%</strong>
              </span>
              <button
                onClick={() => setSelectedStaffDetail(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
