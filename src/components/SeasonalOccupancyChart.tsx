import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ReferenceArea
} from 'recharts';
import {
  TrendingUp,
  Calendar,
  Sparkles,
  BedDouble,
  AlertTriangle,
  Package,
  Layers,
  CheckCircle,
  Clock,
  ArrowRight,
  Sliders,
  DollarSign
} from 'lucide-react';
import { Reservation, InventoryItem } from '../types';
import { GUEST_HOUSE_INFO } from '../data/initialData';

interface SeasonalOccupancyChartProps {
  reservations: Reservation[];
  inventory?: InventoryItem[];
  onSelectTab?: (tab: string) => void;
  onOpenSupplierModal?: (supplier: string) => void;
}

// 6-Month historical occupancy data across luxury suites
const HISTORICAL_OCCUPANCY_DATA = [
  {
    month: 'Apr 2026',
    label: 'April (Easter)',
    overall: 82,
    presidentialVilla: 90,
    executiveKing: 85,
    luxuryKingSpa: 80,
    forestQueen: 74,
    panoramicPenthouse: 88,
    superiorSuite: 75,
    event: 'Easter Laguna Holidays',
    highlight: false
  },
  {
    month: 'May 2026',
    label: 'May (Mid Autumn)',
    overall: 71,
    presidentialVilla: 78,
    executiveKing: 72,
    luxuryKingSpa: 68,
    forestQueen: 65,
    panoramicPenthouse: 76,
    superiorSuite: 67,
    event: 'Wine & Forest Trails',
    highlight: false
  },
  {
    month: 'Jun 2026',
    label: 'June (Whale Arrival)',
    overall: 78,
    presidentialVilla: 84,
    executiveKing: 79,
    luxuryKingSpa: 77,
    forestQueen: 70,
    panoramicPenthouse: 82,
    superiorSuite: 76,
    event: 'Southern Right Whale Arrival',
    highlight: false
  },
  {
    month: 'Jul 2026',
    label: 'July (Oyster Fest Peak)',
    overall: 96,
    presidentialVilla: 100,
    executiveKing: 98,
    luxuryKingSpa: 96,
    forestQueen: 92,
    panoramicPenthouse: 98,
    superiorSuite: 92,
    event: 'Knysna Oyster Festival (Peak Booking)',
    highlight: true
  },
  {
    month: 'Aug 2026',
    label: 'August (Late Winter)',
    overall: 81,
    presidentialVilla: 88,
    executiveKing: 82,
    luxuryKingSpa: 80,
    forestQueen: 75,
    panoramicPenthouse: 85,
    superiorSuite: 76,
    event: 'Golf & Coastal Birding Season',
    highlight: false
  },
  {
    month: 'Sep 2026',
    label: 'September (Spring Now)',
    overall: 88,
    presidentialVilla: 95,
    executiveKing: 90,
    luxuryKingSpa: 86,
    forestQueen: 82,
    panoramicPenthouse: 92,
    superiorSuite: 83,
    event: 'Heritage Month & Spring Regatta',
    highlight: true
  }
];

const ROOM_COLORS: Record<string, { stroke: string; label: string }> = {
  overall: { stroke: '#10b981', label: 'Overall Average (All Suites)' },
  presidentialVilla: { stroke: '#d97706', label: 'Presidential Villa (#102)' },
  panoramicPenthouse: { stroke: '#0284c7', label: 'Panoramic Penthouse (#105)' },
  executiveKing: { stroke: '#6366f1', label: 'Executive King (#101)' },
  luxuryKingSpa: { stroke: '#ec4899', label: 'Luxury King Spa (#103)' },
  forestQueen: { stroke: '#14b8a6', label: 'Forest Queen (#104)' },
  superiorSuite: { stroke: '#8b5cf6', label: 'Superior Suite (#106)' }
};

export const SeasonalOccupancyChart: React.FC<SeasonalOccupancyChartProps> = ({
  reservations,
  inventory = [],
  onSelectTab,
  onOpenSupplierModal
}) => {
  const [activeView, setActiveView] = useState<'occupancy' | 'lowstock' | 'peaks'>('occupancy');
  const [visibleRooms, setVisibleRooms] = useState<Record<string, boolean>>({
    overall: true,
    presidentialVilla: true,
    panoramicPenthouse: true,
    executiveKing: true,
    luxuryKingSpa: true,
    forestQueen: false,
    superiorSuite: false
  });

  const toggleRoom = (key: string) => {
    setVisibleRooms(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Low stock inventory graph data
  const lowStockItems = useMemo(() => {
    return inventory
      .filter(item => item.howManyOnHand <= item.whenToReorder * 1.5)
      .sort((a, b) => (a.howManyOnHand / a.whenToReorder) - (b.howManyOnHand / b.whenToReorder))
      .slice(0, 8);
  }, [inventory]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
      {/* HEADER & VIEW SELECTOR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shadow-xs">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif-luxury font-bold text-slate-900 text-lg">
                Seasonal Occupancy & Peak Booking Analytics
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                Past 6 Months
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Correlating suite occupancy spikes with inventory burn rate and procurement lead times.
            </p>
          </div>
        </div>

        {/* Tab View Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <button
            onClick={() => setActiveView('occupancy')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              activeView === 'occupancy'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BedDouble className="w-3.5 h-3.5 text-emerald-600" />
            Suite Occupancy Trends
          </button>

          <button
            onClick={() => setActiveView('peaks')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              activeView === 'peaks'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Peak Booking Periods
          </button>

          <button
            onClick={() => setActiveView('lowstock')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              activeView === 'lowstock'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            Low Stock Supply Graph
          </button>
        </div>
      </div>

      {/* SUMMARY KPI TILES */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Occupancy</span>
          <div className="text-xl font-bold text-slate-900 mt-0.5">88%</div>
          <span className="text-[11px] text-emerald-600 font-semibold block">Spring High Season</span>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Peak Recorded Month</span>
          <div className="text-xl font-bold text-amber-700 mt-0.5">July (96%)</div>
          <span className="text-[11px] text-slate-500 block">Knysna Oyster Festival</span>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Top Demand Suite</span>
          <div className="text-sm font-bold text-slate-900 mt-0.5">Presidential Villa</div>
          <span className="text-[11px] text-emerald-700 font-semibold block">94.8% 6-Month Average</span>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Low Stock Supply Risk</span>
          <div className="text-xl font-bold text-rose-600 mt-0.5">
            {lowStockItems.filter(i => i.howManyOnHand <= i.whenToReorder).length} Critical Items
          </div>
          <span className="text-[11px] text-rose-600 font-semibold block">Replenishment required</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. OCCUPANCY LINE CHART VIEW                                              */}
      {/* ========================================================================= */}
      {activeView === 'occupancy' && (
        <div className="space-y-4">
          {/* Room Type Toggle Filters */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mr-1">
              Toggle Suite Lines:
            </span>
            {Object.entries(ROOM_COLORS).map(([key, config]) => {
              const isVisible = visibleRooms[key];
              return (
                <button
                  key={key}
                  onClick={() => toggleRoom(key)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1.5 border ${
                    isVisible
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white text-slate-400 border-slate-200 hover:text-slate-700'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{ backgroundColor: config.stroke }}
                  />
                  {config.label.split('(')[0].trim()}
                </button>
              );
            })}
          </div>

          {/* Line Chart */}
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={HISTORICAL_OCCUPANCY_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
                <YAxis
                  domain={[50, 100]}
                  tick={{ fontSize: 11, fill: '#475569' }}
                  axisLine={false}
                  tickLine={false}
                  unit="%"
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const cur = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3.5 rounded-2xl border border-slate-700 shadow-xl text-xs space-y-1.5">
                          <span className="font-bold text-emerald-400 block text-sm">{label}</span>
                          <span className="text-[11px] text-slate-300 block italic">Event: {cur.event}</span>
                          <div className="pt-1.5 space-y-1 border-t border-slate-800">
                            {payload.map((entry, idx) => (
                              <div key={idx} className="flex justify-between items-center gap-4 text-xs">
                                <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                  {entry.name}:
                                </span>
                                <strong className="font-mono text-white">{entry.value}%</strong>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ paddingBottom: 10, fontSize: 11 }}
                />
                <ReferenceLine y={90} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Peak Demand 90%', fill: '#d97706', fontSize: 10 }} />

                {visibleRooms.overall && (
                  <Line
                    type="monotone"
                    dataKey="overall"
                    name="Overall Average"
                    stroke={ROOM_COLORS.overall.stroke}
                    strokeWidth={3}
                    dot={{ r: 5, fill: ROOM_COLORS.overall.stroke }}
                    activeDot={{ r: 8 }}
                  />
                )}
                {visibleRooms.presidentialVilla && (
                  <Line
                    type="monotone"
                    dataKey="presidentialVilla"
                    name="Presidential Villa"
                    stroke={ROOM_COLORS.presidentialVilla.stroke}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                )}
                {visibleRooms.panoramicPenthouse && (
                  <Line
                    type="monotone"
                    dataKey="panoramicPenthouse"
                    name="Panoramic Penthouse"
                    stroke={ROOM_COLORS.panoramicPenthouse.stroke}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                )}
                {visibleRooms.executiveKing && (
                  <Line
                    type="monotone"
                    dataKey="executiveKing"
                    name="Executive King"
                    stroke={ROOM_COLORS.executiveKing.stroke}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                )}
                {visibleRooms.luxuryKingSpa && (
                  <Line
                    type="monotone"
                    dataKey="luxuryKingSpa"
                    name="Luxury King Spa"
                    stroke={ROOM_COLORS.luxuryKingSpa.stroke}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                )}
                {visibleRooms.forestQueen && (
                  <Line
                    type="monotone"
                    dataKey="forestQueen"
                    name="Forest Queen"
                    stroke={ROOM_COLORS.forestQueen.stroke}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                )}
                {visibleRooms.superiorSuite && (
                  <Line
                    type="monotone"
                    dataKey="superiorSuite"
                    name="Superior Suite"
                    stroke={ROOM_COLORS.superiorSuite.stroke}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. PEAK BOOKING PERIODS HIGHLIGHTS VIEW                                   */}
      {/* ========================================================================= */}
      {activeView === 'peaks' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1 text-xs">
          <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50/60 rounded-2xl border border-amber-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900">
                #1 Major Peak
              </span>
              <span className="font-bold text-amber-800 text-xs">July (96% Occ.)</span>
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Knysna Oyster Festival</h4>
            <p className="text-slate-600 text-xs leading-relaxed">
              Historic 10-day winter festival attracting international gourmands and endurance athletes. Presidential Villa & Penthouse reached 100% capacity.
            </p>
            <div className="pt-2 border-t border-amber-200/80 text-[11px] text-amber-900 font-semibold">
              Stock Impact: 3x consumption of champagne, sparkling waters, and oyster bar amenities.
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50/60 rounded-2xl border border-emerald-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-200 text-emerald-900">
                Current Spring Pacing
              </span>
              <span className="font-bold text-emerald-800 text-xs">September (88% Occ.)</span>
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Heritage Month & Spring Regatta</h4>
            <p className="text-slate-600 text-xs leading-relaxed">
              Warm lagoon breezes, whale watching catamaran tours, and high inbound UK/European visitor arrivals. Strong weekend bookings across all 6 luxury rooms.
            </p>
            <div className="pt-2 border-t border-emerald-200/80 text-[11px] text-emerald-900 font-semibold">
              Stock Impact: High rotation on 600TC Egyptian bath towels and botanical bath infusions.
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-sky-50 to-blue-50/60 rounded-2xl border border-sky-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-200 text-sky-900">
                Upcoming Surge
              </span>
              <span className="font-bold text-sky-800 text-xs">Dec - Jan (100% Projected)</span>
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Garden Route Festive Season</h4>
            <p className="text-slate-600 text-xs leading-relaxed">
              Peak summer school holidays, international yachting enthusiasts, and year-end luxury retreats. Standard lead time for supplier orders increases by 3-5 days.
            </p>
            <div className="pt-2 border-t border-sky-200/80 text-[11px] text-sky-900 font-semibold">
              Recommendation: Pre-order bulk amenities by October 25 to guarantee warehouse dispatch.
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. LOW STOCK SUPPLY GRAPH VIEW                                            */}
      {/* ========================================================================= */}
      {activeView === 'lowstock' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs">
            <div>
              <h4 className="font-bold text-slate-900 text-xs">On-Hand Stock vs Minimum Reorder Point</h4>
              <p className="text-[11px] text-slate-500">Items requiring urgent procurement replenishment during peak booking period.</p>
            </div>
            {onSelectTab && (
              <button
                onClick={() => onSelectTab('inventory')}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center gap-1 transition shadow-xs"
              >
                Go to Inventory Matrix &rarr;
              </button>
            )}
          </div>

          <div className="h-64 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={lowStockItems.map(i => ({
                  name: i.itemCode,
                  description: i.itemDescription,
                  onHand: i.howManyOnHand,
                  reorder: i.whenToReorder,
                  deficit: Math.max(0, i.whenToReorder - i.howManyOnHand),
                  supplier: i.supplier,
                  unit: i.unit
                }))}
                margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl border border-slate-700 shadow-xl text-xs space-y-1">
                          <span className="font-bold text-emerald-400 block">[{data.name}] {data.description}</span>
                          <div className="flex justify-between gap-4 text-slate-300">
                            <span>Current Stock:</span>
                            <strong className="text-white">{data.onHand} {data.unit}</strong>
                          </div>
                          <div className="flex justify-between gap-4 text-slate-300">
                            <span>Reorder Threshold:</span>
                            <span>{data.reorder} {data.unit}</span>
                          </div>
                          <div className="flex justify-between gap-4 text-slate-300">
                            <span>Supplier:</span>
                            <span>{data.supplier}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: 10, fontSize: 11 }} />
                <Bar dataKey="onHand" name="On Hand Units" fill="#0284c7" radius={[4, 4, 0, 0]} barSize={26} />
                <Bar dataKey="reorder" name="Reorder Point" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={26} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Contact Supplier Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-xs">
            {lowStockItems.slice(0, 3).map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2"
              >
                <div>
                  <span className="font-mono font-bold text-slate-900 block">{item.itemCode}</span>
                  <span className="text-[11px] text-slate-600 block truncate max-w-[170px]">{item.itemDescription}</span>
                  <span className="text-[10px] text-rose-600 font-bold">
                    Stock: {item.howManyOnHand} / Reorder: {item.whenToReorder} {item.unit}
                  </span>
                </div>
                {onOpenSupplierModal && (
                  <button
                    onClick={() => onOpenSupplierModal(item.supplier)}
                    className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold whitespace-nowrap transition"
                  >
                    Quick Order
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
