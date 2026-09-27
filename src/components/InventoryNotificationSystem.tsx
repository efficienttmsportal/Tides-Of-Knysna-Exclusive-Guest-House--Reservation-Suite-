import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Bell,
  Mail,
  CheckCircle,
  TrendingUp,
  DollarSign,
  PackageCheck,
  Send,
  Sliders,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldAlert,
  Info,
  RefreshCw,
  Plus,
  FileSpreadsheet,
  Clock,
  Sparkles,
  X,
  ExternalLink,
  ChevronRight,
  ShoppingCart,
  Star,
  Copy,
  Check,
  Truck
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  AreaChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { InventoryItem, Reservation, SupplierContact } from '../types';
import { CompanyInfoData } from './CompanyInfoModule';
import { INITIAL_SUPPLIERS, GUEST_HOUSE_INFO } from '../data/initialData';

interface InventoryNotificationSystemProps {
  inventory: InventoryItem[];
  onUpdateInventory: (updated: InventoryItem[]) => void;
  reservations: Reservation[];
  companyInfo?: CompanyInfoData;
  onOpenAccounting?: () => void;
  onOpenSupplierModal?: (supplierName: string, item?: InventoryItem) => void;
}

export interface DispatchedAlertLog {
  id: string;
  timestamp: string;
  recipientEmail: string;
  itemCount: number;
  itemsSummary: string;
  totalEstimatedCostZar: number;
  status: 'Delivered' | 'Acknowledged';
}

export const InventoryNotificationSystem: React.FC<InventoryNotificationSystemProps> = ({
  inventory,
  onUpdateInventory,
  reservations,
  companyInfo,
  onOpenAccounting
}) => {
  // Low Stock Items Calculation
  const lowStockItems = useMemo(() => {
    return inventory.filter(item => item.howManyOnHand <= item.whenToReorder);
  }, [inventory]);

  const criticalStockItems = useMemo(() => {
    return lowStockItems.filter(item => item.howManyOnHand <= Math.floor(item.whenToReorder / 2));
  }, [lowStockItems]);

  // Operations Manager Email Target
  const defaultOpsEmail = companyInfo?.adminEmail || 'qsappinfo@gmail.com';
  const [opsManagerEmail, setOpsManagerEmail] = useState(defaultOpsEmail);
  const [emailSubject, setEmailSubject] = useState(`[ACTION REQUIRED] Low Inventory Alert - ${lowStockItems.length} items below reorder threshold`);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSentSuccess, setEmailSentSuccess] = useState(false);

  // Toast Notification Banner state
  const [showToastAlert, setShowToastAlert] = useState(lowStockItems.length > 0);
  const [toastDismissed, setToastDismissed] = useState(false);

  // Active view tab within notification system
  const [activeTab, setActiveTab] = useState<'alerts' | 'forecasting' | 'history'>('alerts');

  // Occupancy Simulation Slider for Revenue & Depletion Forecasting
  const [simulatedOccupancy, setSimulatedOccupancy] = useState<number>(85); // 85% default high season

  // Automated Supplier Pre-filled Draft Email State
  const [supplierDraftTarget, setSupplierDraftTarget] = useState<{
    item: InventoryItem;
    supplier: SupplierContact;
    suggestedQty: number;
  } | null>(null);
  const [supplierDraftSubject, setSupplierDraftSubject] = useState<string>('');
  const [supplierDraftBody, setSupplierDraftBody] = useState<string>('');
  const [supplierDraftCopied, setSupplierDraftCopied] = useState<boolean>(false);
  const [autoSupplierDraftEnabled, setAutoSupplierDraftEnabled] = useState<boolean>(true);

  // Helper to match vendor from supplier database
  const getSupplierRecord = (supplierName: string, item?: InventoryItem): SupplierContact => {
    const cleanName = supplierName.trim().toLowerCase();
    const found = INITIAL_SUPPLIERS.find(s => 
      s.companyName.toLowerCase().includes(cleanName) ||
      cleanName.includes(s.companyName.toLowerCase())
    );
    if (found) return found;
    return {
      id: `sup-auto`,
      companyName: supplierName,
      category: item?.category || 'Hospitality Supplies',
      contactPerson: 'Dispatch & Order Desk',
      telephone: '+27 44 382 5000',
      email: `orders@${cleanName.replace(/[^a-z0-9]/g, '') || 'vendor'}.co.za`,
      accountNumber: 'ACC-TOK-881',
      terms: '30 Days from statement',
      rating: 5,
      leadTimeDays: 2
    };
  };

  const handleOpenSupplierDraft = (item: InventoryItem) => {
    const sup = getSupplierRecord(item.supplier, item);
    const recQty = Math.max(10, (item.whenToReorder * 2) - item.howManyOnHand);
    const propName = companyInfo?.name || GUEST_HOUSE_INFO.name;
    const propAddress = companyInfo?.address || GUEST_HOUSE_INFO.address;
    const contactPerson = companyInfo?.salesPerson || 'Head of Guest Experience & Operations';
    const contactPhone = companyInfo?.telephone || GUEST_HOUSE_INFO.telephone;

    const subject = `[URGENT PROCUREMENT PO] ${propName} - Stock Replenishment for [${item.itemCode}]`;
    const body = `Dear ${sup.contactPerson} (${sup.companyName}),\n\n` +
      `Please accept this formal replenishment purchase request from ${propName}.\n\n` +
      `Our on-hand inventory has crossed its safety reorder threshold and requires urgent fulfillment.\n\n` +
      `ACCOUNT DETAILS:\n` +
      `Account Number: ${sup.accountNumber}\n` +
      `Agreed Payment Terms: ${sup.terms}\n` +
      `Standard Delivery Lead Time: ${sup.leadTimeDays || 2} Business Days\n\n` +
      `REQUIRED LINE ITEM SPECIFICATION:\n` +
      `----------------------------------------\n` +
      `• Item Code: ${item.itemCode}\n` +
      `  Description: ${item.itemDescription}\n` +
      `  Category: ${item.category}\n` +
      `  Current On-Hand Stock: ${item.howManyOnHand} ${item.unit} (Reorder Point: ${item.whenToReorder} ${item.unit})\n` +
      `  Requested Order Quantity: ${recQty} ${item.unit}\n` +
      `  Agreed Unit Price: R ${item.pricePerUnit} / ${item.unit}\n` +
      `  Total Purchase Commitment: R ${(recQty * item.pricePerUnit).toLocaleString()}\n` +
      `----------------------------------------\n\n` +
      `DELIVERY DESTINATION:\n` +
      `${propName}\n` +
      `${propAddress}\n` +
      `Attn: Receiving Concierge & Operations Desk\n\n` +
      `Please reply with written confirmation of order receipt and estimated delivery dispatch date.\n\n` +
      `Warm regards,\n` +
      `${contactPerson}\n` +
      `${propName}\n` +
      `Direct Contact: ${contactPhone}`;

    setSupplierDraftTarget({ item, supplier: sup, suggestedQty: recQty });
    setSupplierDraftSubject(subject);
    setSupplierDraftBody(body);
  };

  // Dispatched Alert Logs
  const [alertLogs, setAlertLogs] = useState<DispatchedAlertLog[]>([
    {
      id: 'log-001',
      timestamp: '2026-09-24 08:30',
      recipientEmail: defaultOpsEmail,
      itemCount: 2,
      itemsSummary: 'TOI-2001 (Fynbos Hand Wash), CLN-5001 (Eco-Sanitizer 5L)',
      totalEstimatedCostZar: 4260,
      status: 'Acknowledged'
    }
  ]);

  // Handle Quick Replenish
  const handleQuickRestock = (itemId: string, addQty: number) => {
    const updated = inventory.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          howManyOnHand: item.howManyOnHand + addQty,
          lastRestocked: new Date().toISOString().split('T')[0]
        };
      }
      return item;
    });
    onUpdateInventory(updated);
  };

  // Handle Dispatch Email to Operations Manager
  const handleDispatchEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingEmail(true);

    setTimeout(() => {
      setIsSendingEmail(false);
      setEmailSentSuccess(true);

      const totalCost = lowStockItems.reduce((acc, i) => acc + (i.pricePerUnit * (i.whenToReorder * 2 - i.howManyOnHand)), 0);
      const newLog: DispatchedAlertLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleString('en-ZA', { dateStyle: 'short', timeStyle: 'short' }),
        recipientEmail: opsManagerEmail,
        itemCount: lowStockItems.length,
        itemsSummary: lowStockItems.map(i => `${i.itemCode} (${i.itemDescription.slice(0, 20)}...)`).join(', '),
        totalEstimatedCostZar: totalCost,
        status: 'Delivered'
      };

      setAlertLogs(prev => [newLog, ...prev]);

      setTimeout(() => {
        setEmailSentSuccess(false);
        setIsEmailModalOpen(false);
      }, 2500);
    }, 1200);
  };

  // -------------------------------------------------------------------------
  // REVENUE & INVENTORY FORECASTING CALCULATIONS
  // -------------------------------------------------------------------------
  // 6-Month forward projection combining booked revenue with amenity burn rates
  const forecastingData = useMemo(() => {
    const months = ['Oct 2026', 'Nov 2026', 'Dec 2026', 'Jan 2027', 'Feb 2027', 'Mar 2027'];
    const baseOccupancyRates = [0.82, 0.88, 0.96, 0.94, 0.86, 0.78]; // Peak Garden Route season
    const avgSuiteRate = 3200;
    const totalSuites = 6;
    const daysPerMonth = 30;
    const availableNights = totalSuites * daysPerMonth; // 180 room nights

    // Scale by user's simulated occupancy modifier
    const occupancyMultiplier = simulatedOccupancy / 85;

    return months.map((m, idx) => {
      const monthOccupancy = Math.min(1.0, baseOccupancyRates[idx] * occupancyMultiplier);
      const occupiedNights = Math.round(availableNights * monthOccupancy);
      
      // Projected gross revenue
      const roomRevenue = occupiedNights * avgSuiteRate;
      const ancillaryRevenue = Math.round(roomRevenue * 0.28); // F&B, wine bar, excursions
      const totalProjectedRevenue = roomRevenue + ancillaryRevenue;

      // Projected inventory & supply replenishment expenses (linens, amenities, toiletries, wines)
      const linenCost = occupiedNights * 85;
      const toiletriesCost = occupiedNights * 115;
      const barRestockCost = occupiedNights * 140;
      const cleaningSuppliesCost = occupiedNights * 45;
      const totalRestockExpense = Math.round(linenCost + toiletriesCost + barRestockCost + cleaningSuppliesCost);

      const projectedNetOperating = totalProjectedRevenue - totalRestockExpense;

      return {
        month: m,
        occupancyPct: Math.round(monthOccupancy * 100),
        occupiedNights,
        projectedRevenue: totalProjectedRevenue,
        restockExpense: totalRestockExpense,
        netOperating: projectedNetOperating,
        marginPct: Number(((projectedNetOperating / totalProjectedRevenue) * 100).toFixed(1))
      };
    });
  }, [simulatedOccupancy]);

  // Daily 30-Day Inventory Depletion Trajectory for Charlotte Rhys Hand Wash (TOI-2001)
  const depletionTrajectory = useMemo(() => {
    const dailyPoints = [];
    const startingStock = 18;
    const reorderThreshold = 20;
    const dailyBurnRate = (simulatedOccupancy / 100) * 1.8; // units per day

    for (let day = 1; day <= 30; day++) {
      const currentStock = Math.max(0, Math.round((startingStock - (day * dailyBurnRate)) * 10) / 10);
      dailyPoints.push({
        day: `Day ${day}`,
        stockOnHand: currentStock,
        reorderThreshold: reorderThreshold,
        stockoutDanger: currentStock <= reorderThreshold ? currentStock : null
      });
    }
    return dailyPoints;
  }, [simulatedOccupancy]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ========================================================================= */}
      {/* 1. REAL-TIME TOAST / ALERT BANNER                                        */}
      {/* ========================================================================= */}
      {lowStockItems.length > 0 && !toastDismissed && (
        <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-rose-950 text-white p-4 sm:p-5 rounded-2xl border border-amber-600/50 shadow-xl flex flex-wrap items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Operations Alert
                </span>
                <span className="text-[10px] bg-rose-500 text-white font-bold px-2 py-0.5 rounded-full">
                  {lowStockItems.length} Items Below Reorder Point
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Critical stocks detected on <strong>{lowStockItems.map(i => i.itemDescription).slice(0, 2).join(', ')}</strong>
                {lowStockItems.length > 2 && ` and ${lowStockItems.length - 2} more`}. Immediate procurement action recommended.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEmailModalOpen(true)}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition"
            >
              <Mail className="w-3.5 h-3.5" />
              Alert Operations Manager
            </button>

            <button
              onClick={() => setActiveTab('forecasting')}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs flex items-center gap-1.5 border border-slate-700 transition"
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              View Revenue Forecast
            </button>

            <button
              onClick={() => setToastDismissed(true)}
              className="p-2 text-slate-400 hover:text-white rounded-lg transition"
              title="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Container Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif-luxury font-bold text-slate-900 text-xl">
                Inventory Alerts & Revenue Forecasting Engine
              </h2>
              {lowStockItems.length > 0 ? (
                <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold uppercase rounded-full">
                  {lowStockItems.length} Low Stock Triggered
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase rounded-full">
                  All Stocks Healthy
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Automated reorder triggers, email dispatch to operations manager ({opsManagerEmail}), and predictive demand modelling.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEmailModalOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition"
          >
            <Mail className="w-4 h-4" />
            Dispatch Ops Email
          </button>

          {onOpenAccounting && (
            <button
              onClick={onOpenAccounting}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition"
            >
              <ShoppingCart className="w-4 h-4 text-emerald-400" />
              Create Purchase Order
            </button>
          )}
        </div>
      </div>

      {/* Sub Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeTab === 'alerts'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-amber-500" />
          Active Reorder Triggers ({lowStockItems.length})
        </button>

        <button
          onClick={() => setActiveTab('forecasting')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeTab === 'forecasting'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-emerald-500" />
          Revenue & Depletion Forecasting (Recharts)
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeTab === 'history'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Clock className="w-4 h-4 text-blue-500" />
          Dispatched Email Logs ({alertLogs.length})
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ACTIVE REORDER TRIGGERS                                            */}
      {/* ========================================================================= */}
      {activeTab === 'alerts' && (
        <div className="space-y-6">
          {lowStockItems.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="font-serif-luxury font-bold text-slate-900 text-lg">
                All Inventory Levels Are Healthy
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No items are currently below their safety reorder thresholds. The notification engine is monitoring stock counts 24/7.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* AUTOMATED SUPPLIER EMAIL TRIGGERS TABLE */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950 text-white rounded-2xl p-5 border border-slate-800 shadow-md space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white flex items-center gap-2">
                        Automated Supplier Email Triggers
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          Supplier Database Synced
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Whenever an item crosses its reorder point, a pre-filled draft email is automatically compiled for instant dispatch.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400">Auto-Draft Engine:</span>
                    <button
                      onClick={() => setAutoSupplierDraftEnabled(prev => !prev)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                        autoSupplierDraftEnabled
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {autoSupplierDraftEnabled ? 'Active (Auto-Generates)' : 'Paused'}
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto pt-1">
                  <table className="w-full text-xs text-left">
                    <thead className="text-[10px] uppercase text-slate-400 border-b border-slate-800 tracking-wider">
                      <tr>
                        <th className="py-2 px-3">Item Code & Name</th>
                        <th className="py-2 px-3">Stock vs Reorder</th>
                        <th className="py-2 px-3">Matched Vendor & Rating</th>
                        <th className="py-2 px-3">Lead Time</th>
                        <th className="py-2 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {lowStockItems.map(item => {
                        const sup = getSupplierRecord(item.supplier, item);
                        const recQty = Math.max(10, (item.whenToReorder * 2) - item.howManyOnHand);

                        return (
                          <tr key={item.id} className="hover:bg-slate-800/40 transition">
                            <td className="py-2.5 px-3">
                              <span className="font-mono font-bold text-emerald-400 block">{item.itemCode}</span>
                              <span className="text-slate-300 block text-[11px] truncate max-w-[180px]">{item.itemDescription}</span>
                            </td>
                            <td className="py-2.5 px-3 font-mono">
                              <span className="text-rose-400 font-bold">{item.howManyOnHand} {item.unit}</span>
                              <span className="text-slate-500 text-[10px] block">Reorder: {item.whenToReorder} {item.unit}</span>
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="font-bold text-white block truncate max-w-[160px]">{sup.companyName}</span>
                              <div className="flex items-center gap-1 mt-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-2.5 h-2.5 ${
                                      i < (sup.rating || 5)
                                        ? 'text-amber-400 fill-amber-400'
                                        : 'text-slate-600'
                                    }`}
                                  />
                                ))}
                                <span className="text-[10px] text-slate-400 ml-1">{sup.email}</span>
                              </div>
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="text-slate-300 flex items-center gap-1 text-[11px]">
                                <Clock className="w-3 h-3 text-sky-400" />
                                {sup.leadTimeDays || 2} Days
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <button
                                onClick={() => handleOpenSupplierDraft(item)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 ml-auto shadow-xs transition"
                              >
                                <Mail className="w-3.5 h-3.5" />
                                Trigger Draft Email (+{recQty})
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* CARDS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {lowStockItems.map(item => {
                const deficit = item.whenToReorder - item.howManyOnHand;
                const recommendedOrder = item.whenToReorder * 2 - item.howManyOnHand;
                const estCost = recommendedOrder * item.pricePerUnit;
                const isCritical = item.howManyOnHand <= Math.floor(item.whenToReorder / 2);

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {item.itemCode}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                          isCritical
                            ? 'bg-rose-100 text-rose-800 animate-pulse'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          <AlertTriangle className="w-3 h-3" />
                          {isCritical ? 'Critical Stock' : 'Reorder Needed'}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-bold text-slate-900 text-sm leading-snug">
                          {item.itemDescription}
                        </h4>
                        <span className="text-[11px] text-slate-500 block mt-0.5">{item.category}</span>
                      </div>

                      {/* Stock Comparison Grid */}
                      <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-bold">On Hand</span>
                          <span className="text-base font-bold text-rose-600">
                            {item.howManyOnHand} {item.unit}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-bold">Reorder Level</span>
                          <span className="text-base font-bold text-slate-700">
                            {item.whenToReorder} {item.unit}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1 text-xs text-slate-600">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Supplier:</span>
                          <span className="font-medium text-slate-800">{item.supplier}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Unit Price:</span>
                          <span className="font-bold text-slate-900">R {item.pricePerUnit}</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-slate-100">
                          <span className="text-slate-500 font-semibold">Recommended Batch:</span>
                          <span className="font-bold text-emerald-700">+{recommendedOrder} {item.unit} (R {estCost.toLocaleString()})</span>
                        </div>
                      </div>
                    </div>

                    {/* Replenish Quick Actions */}
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Quick Replenish:</div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleQuickRestock(item.id, 10)}
                          className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1"
                        >
                          <Plus className="w-3 h-3 text-emerald-600" />
                          +10
                        </button>
                        <button
                          onClick={() => handleQuickRestock(item.id, recommendedOrder)}
                          className="flex-1 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3 text-emerald-600" />
                          Restock Full
                        </button>
                      </div>
                    </div>

                    {/* Trigger Pre-filled Draft Email to Supplier */}
                    <div className="pt-2 border-t border-slate-100">
                      <button
                        onClick={() => handleOpenSupplierDraft(item)}
                        className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 shadow-xs"
                      >
                        <Mail className="w-3.5 h-3.5 text-emerald-400" />
                        Trigger Pre-filled Email to Supplier
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    )}

      {/* ========================================================================= */}
      {/* TAB 2: REVENUE & DEPLETION FORECASTING (RECHARTS)                         */}
      {/* ========================================================================= */}
      {activeTab === 'forecasting' && (
        <div className="space-y-6">
          {/* Simulation Slider Control Bar */}
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-5 rounded-2xl shadow-lg border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span className="text-xs uppercase font-bold tracking-wider text-emerald-300">
                  Hospitality Forward Simulator
                </span>
              </div>
              <h3 className="font-serif-luxury font-bold text-lg">
                Revenue vs Restock Burn Rate Modeling
              </h3>
              <p className="text-xs text-slate-300 max-w-xl">
                Adjust projected monthly occupancy to see how higher guest turnover accelerates amenity depletion and impacts operating margins.
              </p>
            </div>

            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 w-full sm:w-64 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-300">Simulated Occupancy:</span>
                <span className="text-emerald-400 font-mono text-sm">{simulatedOccupancy}%</span>
              </div>
              <input
                type="range"
                min={40}
                max={100}
                step={5}
                value={simulatedOccupancy}
                onChange={(e) => setSimulatedOccupancy(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Low (40%)</span>
                <span>Season Avg (85%)</span>
                <span>Peak (100%)</span>
              </div>
            </div>
          </div>

          {/* Forecasting KPIs Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                6-Month Projected Revenue
              </span>
              <span className="text-2xl font-bold text-slate-900 mt-1 block">
                R {forecastingData.reduce((acc, d) => acc + d.projectedRevenue, 0).toLocaleString()}
              </span>
              <span className="text-[11px] text-emerald-600 font-medium block mt-1">
                At {simulatedOccupancy}% avg occupancy
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Projected Stock Restock Cost
              </span>
              <span className="text-2xl font-bold text-rose-600 mt-1 block">
                R {forecastingData.reduce((acc, d) => acc + d.restockExpense, 0).toLocaleString()}
              </span>
              <span className="text-[11px] text-slate-500 block mt-1">
                Linens, Amenities, Bar & Kitchen
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Net Hospitality Gross Margin
              </span>
              <span className="text-2xl font-bold text-emerald-700 mt-1 block">
                R {forecastingData.reduce((acc, d) => acc + d.netOperating, 0).toLocaleString()}
              </span>
              <span className="text-[11px] text-emerald-600 font-medium block mt-1">
                ~{forecastingData[0]?.marginPct}% Operating Margin
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Days of Amenity Runway
              </span>
              <span className="text-2xl font-bold text-amber-600 mt-1 block">
                {Math.max(1, Math.round(18 / ((simulatedOccupancy / 100) * 1.8)))} Days
              </span>
              <span className="text-[11px] text-amber-700 font-medium block mt-1">
                Before TOI-2001 reaches 0 units
              </span>
            </div>
          </div>

          {/* Recharts Chart 1: 6-Month Projected Monthly Revenue vs Restock Expenses */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
              <div>
                <h3 className="font-serif-luxury font-bold text-slate-900 text-base">
                  Monthly Revenue Forecast vs Inventory Procurement Outflow
                </h3>
                <p className="text-xs text-slate-500">
                  Visualizes forward revenue pacing alongside expected consumable replenishment expenses.
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 font-medium text-slate-600">
                  <span className="w-3 h-3 bg-emerald-600 rounded"></span> Projected Revenue (ZAR)
                </span>
                <span className="flex items-center gap-1.5 font-medium text-slate-600">
                  <span className="w-3 h-1.5 bg-rose-500 rounded"></span> Restock Cost (ZAR)
                </span>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={forecastingData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis 
                    yAxisId="left"
                    tick={{ fontSize: 11, fill: '#64748b' }} 
                    axisLine={false} 
                    tickLine={false} 
                    tickFormatter={(val) => `R ${val / 1000}k`}
                  />
                  <Tooltip 
                    formatter={(val: any, name: any) => [`R ${Number(val).toLocaleString()}`, name === 'projectedRevenue' ? 'Projected Revenue' : 'Restock Cost']}
                    labelStyle={{ fontWeight: 'bold', color: '#0f172a' }}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar yAxisId="left" dataKey="projectedRevenue" name="projectedRevenue" fill="#059669" radius={[6, 6, 0, 0]} barSize={34} />
                  <Line yAxisId="left" type="monotone" dataKey="restockExpense" name="restockExpense" stroke="#e11d48" strokeWidth={3} dot={{ r: 4, fill: '#e11d48' }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recharts Chart 2: 30-Day Inventory Depletion Trajectory */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
              <div>
                <h3 className="font-serif-luxury font-bold text-slate-900 text-base">
                  30-Day Consumable Depletion Runout Forecast (Charlotte Rhys Toiletries)
                </h3>
                <p className="text-xs text-slate-500">
                  Trajectory models stock depletion over the next 30 days under {simulatedOccupancy}% occupancy.
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <span className="w-3 h-3 bg-cyan-500 rounded"></span> Projected Units on Hand
                </span>
                <span className="flex items-center gap-1.5 text-rose-600 font-medium">
                  <span className="w-3 h-0.5 bg-rose-500"></span> Safety Reorder Level (20 Units)
                </span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={depletionTrajectory} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                  <defs>
                    <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748b' }} interval={2} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    formatter={(val: any) => [`${val} Bottles`, 'Stock on Hand']}
                    labelStyle={{ fontWeight: 'bold', color: '#0f172a' }}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  />
                  <ReferenceLine y={20} stroke="#f43f5e" strokeDasharray="4 4" strokeWidth={2} label={{ value: 'Reorder Level: 20', fill: '#f43f5e', fontSize: 10, position: 'right' }} />
                  <Area type="monotone" dataKey="stockOnHand" stroke="#0891b2" strokeWidth={2.5} fillOpacity={1} fill="url(#colorStock)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: DISPATCHED EMAIL LOGS                                              */}
      {/* ========================================================================= */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-serif-luxury font-bold text-slate-900 text-base">
              Operations Manager Alert Audit History
            </h3>
            <p className="text-xs text-slate-500">
              Complete dispatch record of automated and manual emails sent to {opsManagerEmail}.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-3 py-2.5">Date & Time</th>
                  <th className="px-3 py-2.5">Recipient</th>
                  <th className="px-3 py-2.5">Items Flagged</th>
                  <th className="px-3 py-2.5">Summary</th>
                  <th className="px-3 py-2.5">Est. Replenishment (ZAR)</th>
                  <th className="px-3 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {alertLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2.5 font-mono text-slate-600">{log.timestamp}</td>
                    <td className="px-3 py-2.5 font-semibold text-slate-900">{log.recipientEmail}</td>
                    <td className="px-3 py-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                        {log.itemCount} Items
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-slate-600 max-w-xs truncate">{log.itemsSummary}</td>
                    <td className="px-3 py-2.5 font-bold text-slate-800">R {log.totalEstimatedCostZar.toLocaleString()}</td>
                    <td className="px-3 py-2.5">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* OPERATIONS MANAGER EMAIL DISPATCH MODAL                                   */}
      {/* ========================================================================= */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in no-print">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif-luxury font-bold text-base">
                    Trigger Operations Manager Email Alert
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Dispatches formal stock replenishment notice with vendor lead times.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsEmailModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Email Form */}
            <form onSubmit={handleDispatchEmail} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              {emailSentSuccess && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl flex items-center gap-2 font-medium">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Alert dispatched successfully to {opsManagerEmail}. Log entry recorded.</span>
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-bold uppercase tracking-wider text-[10px] mb-1">
                  Recipient Operations Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={opsManagerEmail}
                  onChange={(e) => setOpsManagerEmail(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold uppercase tracking-wider text-[10px] mb-1">
                  Subject Line <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>

              {/* Itemized Shortage Preview */}
              <div className="space-y-2">
                <span className="block text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                  Itemized Stock Shortage Preview ({lowStockItems.length} Items)
                </span>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-[11px] text-left">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="p-2">Item Code</th>
                        <th className="p-2">Description</th>
                        <th className="p-2">On Hand</th>
                        <th className="p-2">Threshold</th>
                        <th className="p-2">Supplier</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {lowStockItems.map(i => (
                        <tr key={i.id}>
                          <td className="p-2 font-mono font-bold text-slate-700">{i.itemCode}</td>
                          <td className="p-2 text-slate-800 font-medium">{i.itemDescription}</td>
                          <td className="p-2 font-bold text-rose-600">{i.howManyOnHand} {i.unit}</td>
                          <td className="p-2 text-slate-500">{i.whenToReorder} {i.unit}</td>
                          <td className="p-2 text-slate-600">{i.supplier}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 space-y-1 text-[11px]">
                <p><strong>Sender:</strong> Tides of Knysna Automated Inventory Monitor (sys-notify@tidesofknysna.co.za)</p>
                <p><strong>Forecast Impact:</strong> Current forward bookings require restock within 4 days to preserve 5-star service standards.</p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEmailModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingEmail}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md transition disabled:opacity-50"
                >
                  {isSendingEmail ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Dispatching to Operations...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Send Alert to Operations Manager
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PRE-FILLED DRAFT EMAIL TO SUPPLIER                                 */}
      {/* ========================================================================= */}
      {supplierDraftTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in no-print">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif-luxury font-bold text-base text-white">
                    Automated Supplier Restock Email Draft
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Pre-filled with {supplierDraftTarget.supplier.companyName} account, terms & order specs.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSupplierDraftTarget(null)}
                className="text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Supplier Meta Banner */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Vendor</span>
                  <span className="font-bold text-slate-900 block truncate">{supplierDraftTarget.supplier.companyName}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Recipient Email</span>
                  <span className="font-bold text-emerald-700 block truncate">{supplierDraftTarget.supplier.email}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">5-Star Rating</span>
                  <div className="flex items-center gap-1 mt-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < (supplierDraftTarget.supplier.rating || 5)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    ))}
                    <span className="text-[10px] font-bold text-amber-800 ml-1">
                      {supplierDraftTarget.supplier.rating || 5}.0
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Lead Time</span>
                  <span className="font-bold text-slate-900 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-sky-500" />
                    {supplierDraftTarget.supplier.leadTimeDays || 2} Days
                  </span>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-slate-700 font-bold uppercase tracking-wider text-[10px] mb-1">
                  Email Subject
                </label>
                <input
                  type="text"
                  value={supplierDraftSubject}
                  onChange={(e) => setSupplierDraftSubject(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* Message Body */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                    Pre-filled Purchase Order Specification
                  </label>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(supplierDraftBody);
                      setSupplierDraftCopied(true);
                      setTimeout(() => setSupplierDraftCopied(false), 2500);
                    }}
                    className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 hover:underline"
                  >
                    {supplierDraftCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {supplierDraftCopied ? 'Copied to Clipboard' : 'Copy Draft'}
                  </button>
                </div>
                <textarea
                  rows={10}
                  value={supplierDraftBody}
                  onChange={(e) => setSupplierDraftBody(e.target.value)}
                  className="w-full p-3 font-mono text-[11px] bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none leading-relaxed"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-[11px] text-slate-500">
                Triggering opens your default email client with recipient & body pre-encoded.
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSupplierDraftTarget(null)}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-xl border border-slate-300 transition"
                >
                  Cancel
                </button>
                <a
                  href={`mailto:${supplierDraftTarget.supplier.email}?subject=${encodeURIComponent(supplierDraftSubject)}&body=${encodeURIComponent(supplierDraftBody)}`}
                  onClick={() => {
                    const totalCost = supplierDraftTarget.suggestedQty * supplierDraftTarget.item.pricePerUnit;
                    const newLog: DispatchedAlertLog = {
                      id: `log-${Date.now()}`,
                      timestamp: new Date().toLocaleString('en-ZA', { dateStyle: 'short', timeStyle: 'short' }),
                      recipientEmail: supplierDraftTarget.supplier.email,
                      itemCount: 1,
                      itemsSummary: `${supplierDraftTarget.item.itemCode} to ${supplierDraftTarget.supplier.companyName} (+${supplierDraftTarget.suggestedQty})`,
                      totalEstimatedCostZar: totalCost,
                      status: 'Delivered'
                    };
                    setAlertLogs(prev => [newLog, ...prev]);
                    setTimeout(() => setSupplierDraftTarget(null), 800);
                  }}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-2 shadow-md transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  Open in Mail Client & Send
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
