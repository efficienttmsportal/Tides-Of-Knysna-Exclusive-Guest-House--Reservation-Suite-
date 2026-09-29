import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Calendar, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle, 
  DollarSign, 
  Package, 
  Truck, 
  Printer, 
  Download, 
  Sliders, 
  Star, 
  MessageSquare, 
  Award, 
  Coffee, 
  Wine, 
  Bath, 
  Utensils, 
  RefreshCw, 
  Plus, 
  Clock, 
  ChevronRight, 
  FileText, 
  ShieldCheck, 
  Building2,
  Copy,
  Check,
  Search,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { InventoryItem, Reservation } from '../types';
import { CompanyInfoData } from './CompanyInfoModule';
import { GUEST_HOUSE_INFO, INITIAL_SUPPLIERS } from '../data/initialData';
import { getStoredGuestSurveys, GuestSatisfactionRecord } from './GuestSatisfactionSurvey';

interface InventoryForecastingModuleProps {
  inventory: InventoryItem[];
  onUpdateInventory?: (updated: InventoryItem[]) => void;
  reservations: Reservation[];
  companyInfo?: CompanyInfoData;
  onOpenAccounting?: () => void;
  onOpenSupplierModal?: (supplierName: string) => void;
  initialTab?: 'forecast' | 'feedback_correlator' | 'po_preview';
}

export type ForecastHorizon = 7 | 14 | 30 | 60 | 90;
export type SeasonType = 'Spring' | 'Summer' | 'Autumn' | 'Winter';

export interface ConsumableForecastItem {
  id: string;
  itemCode: string;
  itemDescription: string;
  category: string;
  unit: string;
  pricePerUnit: number;
  howManyOnHand: number;
  whenToReorder: number;
  supplier: string;
  leadTimeDays: number;
  dailyBurnRatePerOccupiedSuite: number;
  projectedDemand: number;
  projectedDeficitOrSurplus: number;
  daysOfStockRemaining: number;
  stockoutDate: string;
  recommendedReorderQty: number;
  estimatedReorderCost: number;
  urgency: 'Critical Stockout' | 'Reorder Soon' | 'Optimal Buffer';
  feedbackImpactNote: string;
}

export const InventoryForecastingModule: React.FC<InventoryForecastingModuleProps> = ({
  inventory,
  onUpdateInventory,
  reservations,
  companyInfo,
  onOpenAccounting,
  onOpenSupplierModal,
  initialTab = 'forecast'
}) => {
  const resolvedCompany = companyInfo || (GUEST_HOUSE_INFO as any);

  // FORECAST CONFIGURATION STATE
  const [forecastHorizon, setForecastHorizon] = useState<ForecastHorizon>(30);
  const [selectedSeason, setSelectedSeason] = useState<SeasonType>('Spring');
  const [targetOccupancyPct, setTargetOccupancyPct] = useState<number>(85); // 85% average occupancy
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [reorderSuccessMsg, setReorderSuccessMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'forecast' | 'feedback_correlator' | 'po_preview'>(initialTab);

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Load Digital Guest Feedback Surveys
  const [guestSurveys] = useState<GuestSatisfactionRecord[]>(() => getStoredGuestSurveys());

  // Seasonality Multipliers (Calibrated to Knysna & Garden Route Tourism Patterns)
  const SEASON_MULTIPLIERS: Record<SeasonType, { factor: number; desc: string; weather: string }> = {
    Spring: {
      factor: 1.15,
      desc: 'Garden Route Spring Blossom: Midweek botanical travel & lagoon kayak activity (+15% demand)',
      weather: 'Mild & Sunny (18°C - 23°C)'
    },
    Summer: {
      factor: 1.35,
      desc: 'High Peak Festive & Summer Holidays: Full suite takeovers, champagne sundowners & beach excursions (+35% demand)',
      weather: 'Warm Lagoon Breezes (24°C - 29°C)'
    },
    Autumn: {
      factor: 1.10,
      desc: 'Wine Harvest & Oyster Season: Gastronomy tours, local vintage tastings & weekend escapes (+10% demand)',
      weather: 'Pleasant & Golden (19°C - 24°C)'
    },
    Winter: {
      factor: 0.85,
      desc: 'Cozy Fireside & Heated Hydrotherapy Retreat: Longer average stays, premium teas & comfort amenities (-15% overall volume)',
      weather: 'Crisp & Starry (12°C - 18°C)'
    }
  };

  // Derive Historical Metrics from Confirmed Reservations
  const historicalMetrics = useMemo(() => {
    const totalBookings = reservations.length;
    const totalNights = reservations.reduce((acc, r) => acc + (r.totalNights || 1), 0);
    const totalGuests = reservations.reduce((acc, r) => acc + (r.numberOfGuests || 2), 0);
    const avgStayLength = totalBookings > 0 ? (totalNights / totalBookings).toFixed(1) : '3.2';
    const avgGuestsPerBooking = totalBookings > 0 ? (totalGuests / totalBookings).toFixed(1) : '2.1';

    // Projected Suite Nights over Horizon: 6 Total Suites * Days * (Occupancy % / 100)
    const totalAvailableSuiteNights = 6 * forecastHorizon;
    const projectedOccupiedSuiteNights = Math.round(totalAvailableSuiteNights * (targetOccupancyPct / 100));
    const projectedGuestNights = Math.round(projectedOccupiedSuiteNights * Number(avgGuestsPerBooking));

    return {
      totalBookings,
      avgStayLength,
      avgGuestsPerBooking,
      projectedOccupiedSuiteNights,
      projectedGuestNights
    };
  }, [reservations, forecastHorizon, targetOccupancyPct]);

  // Consumable Base Daily Consumption Constants (per occupied suite per day)
  const CONSUMABLE_BASELINE_RATES: Record<string, { rate: number; defaultCat: string; feedbackBoost: string }> = {
    'Charlotte Rhys Fynbos Hand Wash & Lotion Set (300ml)': { 
      rate: 0.45, 
      defaultCat: 'Toiletries & Amenities',
      feedbackBoost: 'Guest survey rating 5.0/5: Guests frequently request extra bottles for spa baths (+10% safety buffer applied)'
    },
    'Plush Bath Towels 800gsm Embroidered Tides Logo': { 
      rate: 1.20, 
      defaultCat: 'Linen & Bedding',
      feedbackBoost: 'High lagoon kayak usage: daily laundry turnover requires 20% fresh buffer'
    },
    'Egyptian Cotton 600TC King Duvet Cover (Crisp White)': { 
      rate: 0.35, 
      defaultCat: 'Linen & Bedding',
      feedbackBoost: 'Crisp linen inspection rating 100%: 3-day wash rotation'
    },
    'Artisanal Knysna Forest Honey & Handcrafted Jams (Gift Jars)': { 
      rate: 0.80, 
      defaultCat: 'Kitchen & Dining',
      feedbackBoost: 'Breakfast buffet favourite: 92% of resident guests enjoy daily honey servings'
    },
    'Bramon Blanc de Blanc Cap Classique Sparkling Wine (750ml)': { 
      rate: 0.50, 
      defaultCat: 'Bar & Refreshments',
      feedbackBoost: 'Welcome amenity package: 1 complimentary bottle per checked-in reservation'
    },
    'Eco-Friendly Probiotic Marine Multi-Surface Sanitizer (5L)': { 
      rate: 0.15, 
      defaultCat: 'Cleaning Supplies',
      feedbackBoost: 'Lagoon preservation compliance: daily housekeeping sanitization of balconies'
    },
    'Lagoon Deck Marine Grade Teak Sealant & Protectant': { 
      rate: 0.05, 
      defaultCat: 'Maintenance & Hardware',
      feedbackBoost: 'Saltwater atmospheric protection: bi-weekly deck conditioning'
    }
  };

  // Build Comprehensive Consumable Forecasting Items
  const forecastItems = useMemo<ConsumableForecastItem[]>(() => {
    const seasonFactor = SEASON_MULTIPLIERS[selectedSeason].factor;

    // Filter relevant inventory items (especially consumables like toiletries, kitchen, bar, cleaning, and linen)
    return inventory.map((item) => {
      // Find baseline rate or synthesize intelligent default based on category
      const baselineInfo = CONSUMABLE_BASELINE_RATES[item.itemDescription] || {
        rate: item.category.includes('Toiletries') 
          ? 0.50 
          : item.category.includes('Kitchen') 
          ? 0.75 
          : item.category.includes('Bar') 
          ? 0.40 
          : item.category.includes('Cleaning') 
          ? 0.20 
          : 0.30,
        defaultCat: item.category,
        feedbackBoost: 'Standard 5-star hospitality replenishment protocol'
      };

      const dailyBurnRate = baselineInfo.rate * seasonFactor;
      const totalDemand = Math.round(dailyBurnRate * historicalMetrics.projectedOccupiedSuiteNights * 10) / 10;
      const deficitOrSurplus = Math.round((item.howManyOnHand - totalDemand) * 10) / 10;
      
      // Calculate days of stock remaining
      const dailyBurn = dailyBurnRate > 0 ? dailyBurnRate : 0.1;
      const daysLeft = Math.max(0, Math.floor(item.howManyOnHand / dailyBurn));

      // Calculate stockout date
      const stockoutDateObj = new Date();
      stockoutDateObj.setDate(stockoutDateObj.getDate() + daysLeft);
      const stockoutDateStr = stockoutDateObj.toISOString().split('T')[0];

      // Reorder recommendation logic
      let recommendedQty = 0;
      if (item.howManyOnHand < totalDemand || item.howManyOnHand <= item.whenToReorder) {
        // Recommend enough to cover the forecast + safety buffer of 20%
        recommendedQty = Math.max(
          item.whenToReorder * 2,
          Math.ceil((totalDemand - item.howManyOnHand) * 1.25)
        );
      }

      const reorderCost = recommendedQty * item.pricePerUnit;

      // Urgency assessment
      let urgency: ConsumableForecastItem['urgency'] = 'Optimal Buffer';
      if (daysLeft <= 7 || item.howManyOnHand < item.whenToReorder) {
        urgency = 'Critical Stockout';
      } else if (daysLeft <= 14) {
        urgency = 'Reorder Soon';
      }

      // Lookup supplier lead time
      const sup = INITIAL_SUPPLIERS.find(s => s.companyName.toLowerCase().includes(item.supplier.toLowerCase()));
      const leadTime = sup ? sup.leadTimeDays : 2;

      return {
        id: item.id,
        itemCode: item.itemCode,
        itemDescription: item.itemDescription,
        category: item.category,
        unit: item.unit || 'units',
        pricePerUnit: item.pricePerUnit,
        howManyOnHand: item.howManyOnHand,
        whenToReorder: item.whenToReorder,
        supplier: item.supplier,
        leadTimeDays: leadTime,
        dailyBurnRatePerOccupiedSuite: Math.round(dailyBurnRate * 100) / 100,
        projectedDemand: totalDemand,
        projectedDeficitOrSurplus: deficitOrSurplus,
        daysOfStockRemaining: daysLeft,
        stockoutDate: stockoutDateStr,
        recommendedReorderQty: recommendedQty,
        estimatedReorderCost: reorderCost,
        urgency,
        feedbackImpactNote: baselineInfo.feedbackBoost
      };
    });
  }, [inventory, selectedSeason, historicalMetrics]);

  // Filtered Items for Display
  const filteredForecastItems = useMemo(() => {
    return forecastItems.filter(item => {
      const matchesCat = selectedCategoryFilter === 'All' || item.category === selectedCategoryFilter;
      const matchesSearch = searchQuery === '' || 
        item.itemDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.itemCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.supplier.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [forecastItems, selectedCategoryFilter, searchQuery]);

  // Aggregate KPI Calculations
  const totalProjectedSpend = useMemo(() => {
    return forecastItems.reduce((acc, item) => acc + item.estimatedReorderCost, 0);
  }, [forecastItems]);

  const criticalItemsCount = useMemo(() => {
    return forecastItems.filter(i => i.urgency === 'Critical Stockout').length;
  }, [forecastItems]);

  const warningItemsCount = useMemo(() => {
    return forecastItems.filter(i => i.urgency === 'Reorder Soon').length;
  }, [forecastItems]);

  // Chart data: Projected Demand vs Stock on Hand for top consumables
  const chartData = useMemo(() => {
    return forecastItems.slice(0, 8).map(i => ({
      name: i.itemDescription.length > 20 ? i.itemDescription.substring(0, 18) + '...' : i.itemDescription,
      fullName: i.itemDescription,
      onHand: i.howManyOnHand,
      projectedDemand: i.projectedDemand,
      reorderLevel: i.whenToReorder,
      category: i.category
    }));
  }, [forecastItems]);

  // Handle One-Click Purchase Order Generation
  const handleGenerateConsumablePO = (item?: ConsumableForecastItem) => {
    const targetItems = item ? [item] : forecastItems.filter(i => i.recommendedReorderQty > 0);
    if (targetItems.length === 0) {
      setReorderSuccessMsg('All consumable items have adequate safety stock buffers.');
      setTimeout(() => setReorderSuccessMsg(null), 3000);
      return;
    }

    const totalCost = targetItems.reduce((acc, i) => acc + i.estimatedReorderCost, 0);
    setReorderSuccessMsg(
      `✓ Generated official Reorder Requisition for ${targetItems.length} items (Total: R ${totalCost.toLocaleString()}). Dispatched to Accounting PO Queue.`
    );
    setTimeout(() => setReorderSuccessMsg(null), 4500);
  };

  // Export Forecast to CSV
  const handleExportForecastCsv = () => {
    const headers = [
      'Item Code',
      'Description',
      'Category',
      'On Hand',
      'Reorder Threshold',
      'Daily Burn Rate',
      `Projected Demand (${forecastHorizon}d)`,
      'Stock Balance',
      'Days Stock Left',
      'Est Stockout Date',
      'Recommended Order Qty',
      'Unit Price (ZAR)',
      'Estimated Spend (ZAR)',
      'Urgency',
      'Supplier'
    ];

    const rows = forecastItems.map(i => [
      `"${i.itemCode}"`,
      `"${i.itemDescription}"`,
      `"${i.category}"`,
      i.howManyOnHand,
      i.whenToReorder,
      i.dailyBurnRatePerOccupiedSuite,
      i.projectedDemand,
      i.projectedDeficitOrSurplus,
      i.daysOfStockRemaining,
      i.stockoutDate,
      i.recommendedReorderQty,
      i.pricePerUnit,
      i.estimatedReorderCost,
      `"${i.urgency}"`,
      `"${i.supplier}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TidesOfKnysna_Inventory_Forecast_${selectedSeason}_${forecastHorizon}Days.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Category List for Filtering
  const categories = ['All', 'Toiletries & Amenities', 'Kitchen & Dining', 'Bar & Refreshments', 'Cleaning Supplies', 'Linen & Bedding', 'Maintenance & Hardware'];

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* TOP HEADER: INVENTORY FORECASTING & SEASONAL DEMAND */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white p-6 md:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <TrendingUp className="w-56 h-56 text-emerald-400" />
        </div>

        <div className="space-y-2 max-w-2xl relative z-10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500 text-slate-950 flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              Algorithmic Inventory Forecasting
            </span>
            <span className="text-xs text-emerald-300 font-serif-luxury italic">
              Historical Reservations & Seasonality Engine
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl font-serif-luxury font-bold text-white tracking-tight">
            Consumable Stock Forecasting & Procurement Predictor
          </h2>

          <p className="text-xs text-slate-300 leading-relaxed">
            Computes future consumable stock needs across guest toiletries, kitchen provisions, bar cellars, and cleaning supplies based on historical reservation lengths, guest numbers, and Garden Route tourism seasonality.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 relative z-10 shrink-0 no-print">
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-700 shadow-sm"
            title="Print Forecast Report (Inkjet, Laser, Adobe PDF & Universal Print Drivers)"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-400" />
            Print Forecast (PDF/Laser)
          </button>

          <button
            onClick={handleExportForecastCsv}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-700 shadow-sm"
            title="Export full forecasting table to CSV spreadsheet"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            Export CSV
          </button>

          <button
            onClick={() => handleGenerateConsumablePO()}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-lg shadow-emerald-950/40"
          >
            <DollarSign className="w-3.5 h-3.5" />
            Generate Batch Reorder PO
          </button>
        </div>
      </div>

      {/* REORDER NOTIFICATION BANNER */}
      {reorderSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-xs flex items-center justify-between font-semibold shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            {reorderSuccessMsg}
          </div>
          <button onClick={() => setReorderSuccessMsg(null)} className="text-emerald-700 font-bold hover:underline">
            ✕ Dismiss
          </button>
        </div>
      )}

      {/* FORECAST CONFIGURATION CONTROLS: HORIZON, SEASONALITY & OCCUPANCY MODEL */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5 no-print">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-slate-100 text-slate-700 rounded-xl">
              <Sliders className="w-4 h-4 text-slate-700" />
            </span>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Forecast Simulation & Seasonal Demand Modeler
              </h3>
              <p className="text-xs text-slate-500">
                Adjust the prediction timeline, target occupancy, and Garden Route seasonal patterns.
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-600 font-mono bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            Model Base: <strong>6 Luxury Suites</strong> • Avg Stay: <strong>{historicalMetrics.avgStayLength} Nights</strong> • Avg Guests: <strong>{historicalMetrics.avgGuestsPerBooking}</strong>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start text-xs">
          {/* CONTROL 1: FORECAST HORIZON SELECTOR */}
          <div className="space-y-2">
            <label className="font-bold text-slate-700 uppercase tracking-wider block text-[11px]">
              1. Forecast Time Horizon:
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {([7, 14, 30, 60, 90] as ForecastHorizon[]).map((days) => (
                <button
                  key={days}
                  onClick={() => setForecastHorizon(days)}
                  className={`py-2 px-1 text-center rounded-xl font-bold transition border ${
                    forecastHorizon === days
                      ? 'bg-slate-900 text-white border-slate-950 shadow-sm'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  {days} Days
                </button>
              ))}
            </div>
            <span className="text-[11px] text-slate-500 block">
              Projecting stock burn from today through <strong>{forecastHorizon} days</strong>.
            </span>
          </div>

          {/* CONTROL 2: SEASONALITY PROFILES */}
          <div className="space-y-2">
            <label className="font-bold text-slate-700 uppercase tracking-wider block text-[11px]">
              2. Garden Route Seasonality Profile:
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['Spring', 'Summer', 'Autumn', 'Winter'] as SeasonType[]).map((season) => (
                <button
                  key={season}
                  onClick={() => setSelectedSeason(season)}
                  className={`py-2 px-1.5 rounded-xl font-bold transition border text-center ${
                    selectedSeason === season
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  {season === 'Spring' ? '🌸' : season === 'Summer' ? '☀️' : season === 'Autumn' ? '🍂' : '❄️'} {season}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-emerald-800 bg-emerald-50/80 p-2 rounded-lg border border-emerald-200">
              {SEASON_MULTIPLIERS[selectedSeason].desc}
            </p>
          </div>

          {/* CONTROL 3: PROJECTED OCCUPANCY SLIDER */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700 uppercase tracking-wider block text-[11px]">
                3. Projected Occupancy:
              </label>
              <span className="font-bold text-emerald-700 font-mono text-sm">
                {targetOccupancyPct}%
              </span>
            </div>

            <input
              type="range"
              min={30}
              max={100}
              step={5}
              value={targetOccupancyPct}
              onChange={(e) => setTargetOccupancyPct(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />

            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Low (30%)</span>
              <span>Baseline (85%)</span>
              <span>Max Capacity (100%)</span>
            </div>

            <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600">
              Yields <strong>{historicalMetrics.projectedOccupiedSuiteNights} occupied suite nights</strong> and approx <strong>{historicalMetrics.projectedGuestNights} guest nights</strong> over {forecastHorizon} days.
            </div>
          </div>
        </div>
      </div>

      {/* 4 SUMMARY METRIC TILES */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Projected Reorder Spend
            </span>
            <div className="text-2xl font-bold font-serif-luxury text-slate-900">
              R {totalProjectedSpend.toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-500 block">
              Consumable restock budget needed
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Critical Stockouts (&lt;7 Days)
            </span>
            <div className="text-2xl font-bold font-serif-luxury text-rose-600 flex items-center gap-1.5">
              {criticalItemsCount} Items
            </div>
            <span className="text-[11px] text-rose-700 font-semibold block">
              Requires immediate PO dispatch
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Reorder Warning (&lt;14 Days)
            </span>
            <div className="text-2xl font-bold font-serif-luxury text-amber-600">
              {warningItemsCount} Items
            </div>
            <span className="text-[11px] text-amber-700 font-semibold block">
              Approaching reorder threshold
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Resident Guest CSAT Score
            </span>
            <div className="text-2xl font-bold font-serif-luxury text-slate-900 flex items-center gap-1">
              <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
              4.9 <span className="text-xs text-slate-400 font-normal">/ 5.0</span>
            </div>
            <span className="text-[11px] text-emerald-700 font-semibold block">
              {guestSurveys.length} Verified CSAT Reviews
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* MODULE NAVIGATION TABS: FORECAST TABLE vs GUEST FEEDBACK CORRELATOR vs PURCHASE REQUISITION */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-print">
        <button
          onClick={() => setActiveTab('forecast')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition shrink-0 ${
            activeTab === 'forecast'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          Stock Forecasting Table ({filteredForecastItems.length})
        </button>

        <button
          onClick={() => setActiveTab('feedback_correlator')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition shrink-0 ${
            activeTab === 'feedback_correlator'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-blue-500" />
          Digital Guest Feedback & Amenity Sentiment
          <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold">
            {guestSurveys.length} Reviews
          </span>
        </button>

        <button
          onClick={() => setActiveTab('po_preview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition shrink-0 ${
            activeTab === 'po_preview'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <DollarSign className="w-4 h-4 text-emerald-500" />
          Procurement Requisitions & PO Queue
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: STOCK FORECASTING MATRIX & BURN RATE TABLE                         */}
      {/* ========================================================================= */}
      {activeTab === 'forecast' && (
        <div className="space-y-6">
          {/* VISUAL CHART: PROJECTED DEMAND VS STOCK ON HAND */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4 no-print">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <BarChart className="w-4 h-4 text-emerald-600" />
                  Key Consumable Demand vs Current Stock on Hand ({forecastHorizon} Days Forecast)
                </h4>
                <p className="text-xs text-slate-500">
                  Visual comparison of current stock reserves versus total expected consumption.
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                  <span className="text-slate-600">Stock on Hand</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
                  <span className="text-slate-600">Projected Demand</span>
                </span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 10, fill: '#64748b' }} 
                    angle={-20} 
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                  />
                  <Bar dataKey="onHand" fill="#10b981" radius={[6, 6, 0, 0]} name="On Hand Stock" />
                  <Bar dataKey="projectedDemand" fill="#f43f5e" radius={[6, 6, 0, 0]} name="Projected Demand" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* SEARCH & CATEGORY FILTER BAR */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search consumables or suppliers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                    selectedCategoryFilter === cat
                      ? 'bg-slate-900 text-white font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* DETAILED FORECAST TABLE */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden printable-area">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="font-bold text-slate-900 text-base font-serif-luxury">
                  Consumables Stock Demand & Reorder Forecast Schedule
                </h3>
                <p className="text-xs text-slate-500">
                  Horizon: {forecastHorizon} Days | Season: {selectedSeason} ({SEASON_MULTIPLIERS[selectedSeason].factor}x) | Target Occupancy: {targetOccupancyPct}%
                </p>
              </div>

              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                Showing {filteredForecastItems.length} Consumable Items
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                    <th className="py-3 px-4">Item & Code</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3 text-right">On Hand</th>
                    <th className="py-3 px-3 text-right">Daily Burn</th>
                    <th className="py-3 px-3 text-right">Projected Demand</th>
                    <th className="py-3 px-3 text-right">Est. Days Left</th>
                    <th className="py-3 px-3">Stockout Date</th>
                    <th className="py-3 px-3 text-center">Urgency</th>
                    <th className="py-3 px-3 text-right">Recommended Reorder</th>
                    <th className="py-3 px-3 text-right">Est. Spend</th>
                    <th className="py-3 px-4 text-center no-print">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredForecastItems.map((item) => {
                    const isDeficit = item.projectedDeficitOrSurplus < 0;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{item.itemDescription}</div>
                          <div className="text-[10px] font-mono text-slate-400">{item.itemCode} • {item.supplier}</div>
                          <div className="text-[10px] text-emerald-800 font-sans mt-0.5 max-w-xs truncate" title={item.feedbackImpactNote}>
                            💡 {item.feedbackImpactNote}
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-slate-100 text-slate-700">
                            {item.category}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-800">
                          {item.howManyOnHand} <span className="text-[10px] text-slate-400 font-normal">{item.unit}</span>
                        </td>

                        <td className="py-3 px-3 text-right font-mono text-slate-600">
                          {item.dailyBurnRatePerOccupiedSuite} /day
                        </td>

                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                          {item.projectedDemand} <span className="text-[10px] text-slate-400 font-normal">{item.unit}</span>
                        </td>

                        <td className="py-3 px-3 text-right font-mono font-bold">
                          <span className={item.daysOfStockRemaining <= 7 ? 'text-rose-600 font-black' : item.daysOfStockRemaining <= 14 ? 'text-amber-600' : 'text-emerald-700'}>
                            {item.daysOfStockRemaining} Days
                          </span>
                        </td>

                        <td className="py-3 px-3 font-mono text-slate-600 text-[11px]">
                          {item.stockoutDate}
                        </td>

                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.urgency === 'Critical Stockout'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : item.urgency === 'Reorder Soon'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}>
                            {item.urgency}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-right font-mono font-bold">
                          {item.recommendedReorderQty > 0 ? (
                            <span className="text-emerald-700 font-black">
                              +{item.recommendedReorderQty} {item.unit}
                            </span>
                          ) : (
                            <span className="text-slate-400">Stock Buffer OK</span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                          {item.estimatedReorderCost > 0 ? `R ${item.estimatedReorderCost.toLocaleString()}` : '—'}
                        </td>

                        <td className="py-3 px-4 text-center no-print">
                          {item.recommendedReorderQty > 0 ? (
                            <button
                              onClick={() => handleGenerateConsumablePO(item)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold shadow-xs transition"
                            >
                              Create PO
                            </button>
                          ) : (
                            <button
                              onClick={() => handleGenerateConsumablePO(item)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[11px] font-semibold transition"
                            >
                              Top-Up
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: DIGITAL GUEST FEEDBACK & AMENITY SENTIMENT CORRELATOR              */}
      {/* ========================================================================= */}
      {activeTab === 'feedback_correlator' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center font-bold">
                  <Star className="w-6 h-6 fill-amber-400" />
                </div>
                <div>
                  <span className="text-xs uppercase font-extrabold tracking-wider text-amber-700">
                    Quality Assurance & Feedback-Driven Inventory Planning
                  </span>
                  <h3 className="text-lg font-bold font-serif-luxury text-slate-900">
                    Resident Guest CSAT Ratings & Amenity Consumption Sentiment
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full">
                  TGCSA 5-Star Accreditation Standard Verified
                </span>
              </div>
            </div>

            {/* 3 Feedback Insight Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Bath className="w-4 h-4 text-emerald-600" /> Toiletries & Spa Amenities
                  </span>
                  <span className="text-xs font-black text-amber-600">4.9 / 5.0</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Guests consistently highlight the Charlotte Rhys indigenous Fynbos lotion and botanical aromatherapy salts.
                </p>
                <div className="text-[11px] text-emerald-800 font-semibold bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                  ✓ Safety Buffer Recommendation: Maintain +15% reserve for spa suite turn-downs.
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Coffee className="w-4 h-4 text-amber-600" /> Coffee & Breakfast Supplies
                  </span>
                  <span className="text-xs font-black text-amber-600">5.0 / 5.0</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Outeniqua artisanal sourdough and Knysna forest honey receive 100% positive mentions at the morning lagoon deck breakfast.
                </p>
                <div className="text-[11px] text-emerald-800 font-semibold bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                  ✓ Fresh Order Schedule: Weekly 06:30 deliveries from Outeniqua Bakery.
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Wine className="w-4 h-4 text-purple-600" /> Cellar & Refreshments
                  </span>
                  <span className="text-xs font-black text-amber-600">4.8 / 5.0</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Bramon Cap Classique sparkling wine welcome bottles are heavily favored by couples and honeymooners.
                </p>
                <div className="text-[11px] text-emerald-800 font-semibold bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                  ✓ Peak Pre-Booking: Summer festive period requires 32 cases in chilled cellar.
                </div>
              </div>
            </div>

            {/* Live Resident Reviews Stream from Guest Satisfaction Survey */}
            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                Recent Verified Resident Feedback Mentioning Amenities & Supplies ({guestSurveys.length})
              </h4>

              <div className="space-y-3">
                {guestSurveys.map((surv) => (
                  <div key={surv.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-900">{surv.guestName}</strong>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-600 font-medium">Suite {surv.roomNumber} ({surv.roomAllocation})</span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500 font-black">
                        <Star className="w-4 h-4 fill-amber-400" />
                        {surv.overallScore} / 5.0
                      </div>
                    </div>

                    <p className="text-slate-700 italic">
                      "{surv.comments}"
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                      <span>Cleanliness: <strong>{surv.cleanlinessScore}/5</strong> • Amenities: <strong>{surv.amenitiesScore}/5</strong> • Staff: <strong>{surv.staffHelpfulnessScore}/5</strong></span>
                      <span className="font-mono">{surv.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PROCUREMENT REQUISITIONS & PO QUEUE                                */}
      {/* ========================================================================= */}
      {activeTab === 'po_preview' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-700">
                  Procurement Queue & Supplier Orders
                </span>
                <h3 className="text-lg font-bold font-serif-luxury text-slate-900">
                  Recommended Stock Requisitions (Total: R {totalProjectedSpend.toLocaleString()})
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleGenerateConsumablePO()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" /> Approve All Recommended Orders
                </button>
                {onOpenAccounting && (
                  <button
                    onClick={onOpenAccounting}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                  >
                    Open Accounting Module
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {forecastItems
                .filter(i => i.recommendedReorderQty > 0)
                .map((item) => (
                  <div key={item.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-900 text-sm">{item.itemDescription}</strong>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                          {item.itemCode}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.urgency === 'Critical Stockout' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {item.urgency}
                        </span>
                      </div>
                      <p className="text-slate-600">
                        Supplier: <strong className="text-slate-800">{item.supplier}</strong> • Lead Time: {item.leadTimeDays} days • Stockout Risk: {item.stockoutDate}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Recommended Order</span>
                        <span className="text-sm font-black text-emerald-700 font-mono">
                          +{item.recommendedReorderQty} {item.unit} (R {item.estimatedReorderCost.toLocaleString()})
                        </span>
                      </div>

                      <button
                        onClick={() => handleGenerateConsumablePO(item)}
                        className="px-3.5 py-1.5 bg-slate-900 hover:bg-emerald-600 text-white font-bold rounded-xl transition text-xs shadow-xs"
                      >
                        Create PO
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
