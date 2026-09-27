import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  Legend,
  ReferenceLine
} from 'recharts';
import {
  TrendingUp,
  Target,
  Award,
  ChevronDown,
  ChevronUp,
  Sliders,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  Users,
  Calendar,
  Check,
  Zap,
  Info
} from 'lucide-react';
import { StaffSalesPerformance, MonthlySalesTargetPlan } from '../types';
import { INITIAL_STAFF_PERFORMANCE, INITIAL_MONTHLY_TARGETS } from '../data/salesPerformanceData';

interface PerformanceDashboardWidgetProps {
  onViewFullSalesModule?: () => void;
}

export const PerformanceDashboardWidget: React.FC<PerformanceDashboardWidgetProps> = ({
  onViewFullSalesModule
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>('Sep 2026');
  const [staffData, setStaffData] = useState<StaffSalesPerformance[]>(INITIAL_STAFF_PERFORMANCE);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'comparison' | 'percentages'>('comparison');

  // Overall calculations
  const totalTarget = useMemo(() => {
    return staffData.reduce((sum, s) => sum + s.monthlyTarget, 0);
  }, [staffData]);

  const totalActual = useMemo(() => {
    return staffData.reduce((sum, s) => sum + s.actualSales, 0);
  }, [staffData]);

  const achievementRate = totalTarget > 0 ? Math.round((totalActual / totalTarget) * 100) : 0;
  const netVariance = totalActual - totalTarget;

  // Chart data preparation
  const chartData = useMemo(() => {
    return staffData.map(staff => {
      const achievement = Math.round((staff.actualSales / staff.monthlyTarget) * 100);
      return {
        id: staff.staffId,
        name: staff.staffName.split(' ')[0], // First name for neat axis
        fullName: staff.staffName,
        role: staff.role,
        Target: staff.monthlyTarget,
        Actual: staff.actualSales,
        AchievementPct: achievement,
        Commission: staff.commissionEarned,
        Breakdown: staff.categoryBreakdown,
      };
    });
  }, [staffData]);

  // Find top performer
  const topPerformer = useMemo(() => {
    return [...staffData].sort((a, b) => (b.actualSales / b.monthlyTarget) - (a.actualSales / a.monthlyTarget))[0];
  }, [staffData]);

  const activeStaffDetail = selectedStaffId 
    ? staffData.find(s => s.staffId === selectedStaffId) || null
    : null;

  return (
    <div 
      id="widget-performance-dashboard"
      className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden transition-all duration-300 mb-6"
    >
      {/* Top Header / Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white px-5 py-3.5 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif-luxury font-bold text-white text-sm tracking-wide">
                Staff Sales Performance Dashboard
              </h3>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.2 rounded-full">
                {selectedMonth} Targets
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Live monthly revenue quotas vs. closed sales per staff member
            </p>
          </div>
        </div>

        {/* Quick Widget Controls */}
        <div className="flex items-center gap-2.5">
          {/* Month selector */}
          <div className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700 rounded-lg px-2.5 py-1 text-xs">
            <Calendar className="w-3 h-3 text-emerald-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-white font-medium text-xs focus:outline-none cursor-pointer"
            >
              {INITIAL_MONTHLY_TARGETS.map(m => (
                <option key={m.month} value={m.month} className="bg-slate-900 text-white">
                  {m.month}
                </option>
              ))}
            </select>
          </div>

          {/* Toggle view mode */}
          <div className="hidden sm:flex bg-slate-800/90 p-0.5 rounded-lg border border-slate-700 text-[11px]">
            <button
              onClick={() => setViewMode('comparison')}
              className={`px-2 py-1 rounded-md font-semibold transition ${
                viewMode === 'comparison' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Rand (ZAR)
            </button>
            <button
              onClick={() => setViewMode('percentages')}
              className={`px-2 py-1 rounded-md font-semibold transition ${
                viewMode === 'percentages' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              % Quota
            </button>
          </div>

          {/* Collapse/Expand Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition"
            title={isCollapsed ? 'Expand Widget' : 'Minimize Widget'}
            aria-label="Toggle Widget Visibility"
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Widget Body */}
      {!isCollapsed && (
        <div className="p-5 space-y-4">
          {/* Top Quick Stats Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
              <span className="text-[10px] text-slate-500 font-semibold uppercase block">Monthly Sales Total</span>
              <div className="text-base font-bold font-serif-luxury text-slate-900 mt-0.5">
                R {totalActual.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                <span>Target: R {totalTarget.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
              <span className="text-[10px] text-slate-500 font-semibold uppercase block">Team Quota Attainment</span>
              <div className="text-base font-bold font-serif-luxury text-emerald-700 mt-0.5 flex items-center gap-1">
                {achievementRate}%
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-[10px] text-emerald-600 font-medium">
                {netVariance >= 0 ? `+R ${netVariance.toLocaleString()} ahead` : `R ${Math.abs(netVariance).toLocaleString()} to target`}
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
              <span className="text-[10px] text-slate-500 font-semibold uppercase block">Top Sales Performer</span>
              <div className="text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-1 truncate">
                <Star className="w-3 h-3 text-amber-500 fill-amber-400 shrink-0" />
                <span className="truncate">{topPerformer?.staffName}</span>
              </div>
              <div className="text-[10px] text-slate-500">
                {Math.round((topPerformer?.actualSales / topPerformer?.monthlyTarget) * 100)}% quota achieved
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-slate-500 font-semibold uppercase block">Active Commission Pool</span>
                <div className="text-base font-bold font-serif-luxury text-slate-900 mt-0.5">
                  R {staffData.reduce((acc, s) => acc + s.commissionEarned, 0).toLocaleString()}
                </div>
              </div>
              {onViewFullSalesModule && (
                <button
                  onClick={onViewFullSalesModule}
                  className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 text-left hover:underline"
                >
                  Open Full Sales Tab →
                </button>
              )}
            </div>
          </div>

          {/* Recharts Bar Chart Container */}
          <div className="bg-slate-50/70 border border-slate-200/70 rounded-xl p-4">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/60 text-xs">
              <div className="flex items-center gap-2">
                <Target className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-bold text-slate-800">
                  {viewMode === 'comparison' 
                    ? 'Individual Target vs. Actual Revenue (ZAR)' 
                    : 'Target Attainment Percentage (%) per Staff Member'}
                </span>
              </div>

              <div className="flex items-center gap-3 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-slate-300"></span>
                  <span className="text-slate-600">Quota Target</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600"></span>
                  <span className="text-slate-800 font-semibold">Actual Closed</span>
                </div>
              </div>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {viewMode === 'comparison' ? (
                  <BarChart 
                    data={chartData} 
                    margin={{ top: 10, right: 10, left: 5, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                      tickLine={false}
                      axisLine={{ stroke: '#cbd5e1' }}
                    />
                    <YAxis 
                      tick={{ fontSize: 10, fill: '#94a3b8' }}
                      tickFormatter={(val) => `R ${val / 1000}k`}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      formatter={(val: any, name: any) => [
                        `R ${Number(val).toLocaleString()}`,
                        name === 'Actual' ? 'Actual Sales' : 'Monthly Target'
                      ]}
                      labelFormatter={(name) => {
                        const item = chartData.find(c => c.name === name);
                        return `${item?.fullName} (${item?.role})`;
                      }}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: '1px solid #334155',
                        borderRadius: '0.5rem',
                        color: '#ffffff',
                        fontSize: '11px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar dataKey="Target" fill="#cbd5e1" radius={[4, 4, 0, 0]} maxBarSize={32} />
                    <Bar 
                      dataKey="Actual" 
                      radius={[4, 4, 0, 0]} 
                      maxBarSize={32} 
                      className="cursor-pointer"
                      onClick={(data: any) => {
                        if (data && data.id) setSelectedStaffId(data.id);
                      }}
                    >
                      {chartData.map((entry) => (
                        <Cell 
                          key={`cell-${entry.id}`} 
                          fill={entry.Actual >= entry.Target ? '#059669' : '#f59e0b'}
                          stroke={selectedStaffId === entry.id ? '#0f172a' : 'none'}
                          strokeWidth={2}
                          onClick={() => setSelectedStaffId(entry.id)}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                ) : (
                  <BarChart 
                    data={chartData} 
                    margin={{ top: 10, right: 10, left: 5, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                      tickLine={false}
                      axisLine={{ stroke: '#cbd5e1' }}
                    />
                    <YAxis 
                      tick={{ fontSize: 10, fill: '#94a3b8' }}
                      tickFormatter={(val) => `${val}%`}
                      axisLine={false}
                      tickLine={false}
                    />
                    <ReferenceLine y={100} stroke="#059669" strokeDasharray="3 3" label={{ value: '100% Target', fill: '#059669', fontSize: 10, position: 'right' }} />
                    <Tooltip 
                      formatter={(val: any) => [`${val}%`, 'Target Attainment']}
                      labelFormatter={(name) => {
                        const item = chartData.find(c => c.name === name);
                        return `${item?.fullName} (${item?.role})`;
                      }}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '0.5rem',
                        color: '#ffffff',
                        fontSize: '11px'
                      }}
                    />
                    <Bar 
                      dataKey="AchievementPct" 
                      radius={[4, 4, 0, 0]} 
                      maxBarSize={36} 
                      className="cursor-pointer"
                      onClick={(data: any) => {
                        if (data && data.id) setSelectedStaffId(data.id);
                      }}
                    >
                      {chartData.map((entry) => (
                        <Cell 
                          key={`pct-cell-${entry.id}`} 
                          fill={entry.AchievementPct >= 100 ? '#059669' : '#f59e0b'}
                          stroke={selectedStaffId === entry.id ? '#0f172a' : 'none'}
                          strokeWidth={2}
                          onClick={() => setSelectedStaffId(entry.id)}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-slate-400 text-center mt-1">
              Click any bar to inspect individual staff revenue allocation and commission metrics.
            </p>
          </div>

          {/* Quick Staff Carousel / Pill Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {staffData.map(staff => {
              const ach = Math.round((staff.actualSales / staff.monthlyTarget) * 100);
              const isSelected = selectedStaffId === staff.staffId;
              const isMet = ach >= 100;

              return (
                <button
                  key={staff.staffId}
                  onClick={() => setSelectedStaffId(isSelected ? null : staff.staffId)}
                  className={`text-left p-2.5 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-500 shadow-xs'
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-bold text-slate-900 text-xs truncate">
                      {staff.staffName.split(' ')[0]}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                      isMet ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {ach}%
                    </span>
                  </div>
                  <div className="text-[11px] font-bold text-slate-700">
                    R {(staff.actualSales / 1000).toFixed(1)}k
                  </div>
                  <div className="text-[9px] text-slate-400 truncate">
                    Target: R {(staff.monthlyTarget / 1000).toFixed(0)}k
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Staff Detail Drilldown (if selected) */}
          {activeStaffDetail && (
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 text-xs animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-emerald-200/80 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                    {activeStaffDetail.avatarInitials}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900">{activeStaffDetail.staffName}</span>
                    <span className="text-slate-500 text-[11px] ml-1.5">• {activeStaffDetail.role}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="text-slate-600">
                    Monthly Quota: <strong className="text-slate-900">R {activeStaffDetail.monthlyTarget.toLocaleString()}</strong>
                  </span>
                  <span className="text-emerald-700 font-bold">
                    Actual: R {activeStaffDetail.actualSales.toLocaleString()} ({Math.round((activeStaffDetail.actualSales / activeStaffDetail.monthlyTarget) * 100)}%)
                  </span>
                  <span className="text-slate-600">
                    Commission: <strong className="text-emerald-700">R {activeStaffDetail.commissionEarned.toLocaleString()}</strong>
                  </span>
                  <button
                    onClick={() => setSelectedStaffId(null)}
                    className="text-slate-400 hover:text-slate-600 font-bold text-xs ml-2"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Service categories breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div className="bg-white p-2 rounded-lg border border-emerald-100">
                  <span className="text-slate-400 text-[9px] uppercase font-semibold block">Room Bookings</span>
                  <span className="font-bold text-slate-800">R {activeStaffDetail.categoryBreakdown.roomBookings.toLocaleString()}</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-emerald-100">
                  <span className="text-slate-400 text-[9px] uppercase font-semibold block">Dining & Wine</span>
                  <span className="font-bold text-slate-800">R {activeStaffDetail.categoryBreakdown.diningAndWine.toLocaleString()}</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-emerald-100">
                  <span className="text-slate-400 text-[9px] uppercase font-semibold block">Excursions & Tours</span>
                  <span className="font-bold text-slate-800">R {activeStaffDetail.categoryBreakdown.excursionsAndTours.toLocaleString()}</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-emerald-100">
                  <span className="text-slate-400 text-[9px] uppercase font-semibold block">Spa & Wellness</span>
                  <span className="font-bold text-slate-800">R {activeStaffDetail.categoryBreakdown.spaAndWellness.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
