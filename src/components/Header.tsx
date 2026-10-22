import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Building2, 
  Phone, 
  Mail, 
  User, 
  ShieldCheck, 
  LogOut, 
  Sparkles, 
  Compass, 
  Clock, 
  KeyRound,
  FileCheck,
  Bell,
  FileSpreadsheet,
  AlertTriangle,
  Star,
  Truck,
  CheckCircle2,
  Package,
  ExternalLink,
  X,
  Search,
  Layers,
  ChevronRight,
  BarChart3,
  Printer
} from 'lucide-react';
import { GUEST_HOUSE_INFO } from '../data/initialData';
import { UserAccount, InventoryItem } from '../types';
import { CompanyInfoData } from './CompanyInfoModule';

interface HeaderProps {
  currentUser: UserAccount | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onQuickGuestLogin: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  companyInfo?: CompanyInfoData;
  lowStockCount?: number;
  inventory?: InventoryItem[];
  onJumpToInventoryItem?: (item: InventoryItem) => void;
  onJumpToSupplierRating?: (item: InventoryItem | null, supplierName?: string) => void;
  onOpenPrintHub?: () => void;
  globalCurrency?: string;
  onCurrencyChange?: (c: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onOpenAuth,
  onLogout,
  onQuickGuestLogin,
  activeTab,
  setActiveTab,
  companyInfo,
  lowStockCount = 0,
  inventory,
  onJumpToInventoryItem,
  onJumpToSupplierRating,
  onOpenPrintHub,
  globalCurrency = 'ZAR',
  onCurrencyChange
}) => {
  const info = companyInfo || (GUEST_HOUSE_INFO as any);

  // Format current SAST time
  const [timeStr, setTimeStr] = useState('');
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationSearch, setNotificationSearch] = useState('');
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };
    if (isNotificationOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsNotificationOpen(false);
      }
    };
    if (isNotificationOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isNotificationOpen]);

  // Compute items below their reorder threshold
  const lowStockItems = useMemo(() => {
    if (!inventory || inventory.length === 0) return [];
    return inventory.filter(item => item.howManyOnHand <= item.whenToReorder);
  }, [inventory]);

  const effectiveLowStockCount = inventory ? lowStockItems.length : (lowStockCount || 0);

  // Filtered list based on search query in notification dropdown
  const filteredLowStockItems = useMemo(() => {
    if (!notificationSearch.trim()) return lowStockItems;
    const q = notificationSearch.toLowerCase().trim();
    return lowStockItems.filter(i => 
      i.itemDescription.toLowerCase().includes(q) ||
      i.itemCode.toLowerCase().includes(q) ||
      (i.supplier && i.supplier.toLowerCase().includes(q)) ||
      (i.category && i.category.toLowerCase().includes(q))
    );
  }, [lowStockItems, notificationSearch]);

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-xl no-print">
      {/* Top micro status bar */}
      <div 
        style={{ backgroundColor: '#ff1804' }}
        className="px-4 py-1.5 border-b border-slate-800/80 text-xs text-slate-300 flex flex-wrap items-center justify-between gap-3"
      >
        <div 
          style={{ backgroundColor: '#067d7e' }}
          className="flex items-center gap-4 flex-wrap rounded-lg px-2 py-0.5"
        >
          <span 
            style={{ backgroundColor: '#00575c' }}
            className="flex items-center gap-1.5 text-emerald-400 font-medium px-2 py-0.5 rounded"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Tides of Knysna Lagoon Terminal
          </span>
          <span 
            style={{ backgroundColor: '#0193ab' }}
            className="hidden sm:inline text-slate-400 px-1 rounded"
          >
            |
          </span>
          <span className="hidden md:flex items-center gap-1 text-slate-300">
            <Phone className="w-3 h-3 text-emerald-400" />
            <strong className="text-slate-200">Front Desk:</strong> {info.contactNumbers}
          </span>
          <span className="hidden lg:inline text-slate-400">|</span>
          <span className="hidden lg:flex items-center gap-1 text-slate-300">
            <Mail className="w-3 h-3 text-emerald-400" />
            {info.email}
          </span>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          {/* Inventory Notification Bell & Dropdown */}
          <div className="relative" ref={notificationRef}>
            <button
              id="btn-inventory-notification-bell"
              style={{ backgroundColor: '#00537d' }}
              onClick={() => setIsNotificationOpen(prev => !prev)}
              aria-expanded={isNotificationOpen}
              className={`relative p-1.5 rounded-lg border transition flex items-center gap-1.5 text-xs select-none ${
                effectiveLowStockCount > 0 
                  ? 'border-rose-500 text-rose-300 hover:bg-rose-900 shadow-sm shadow-rose-900/50'
                  : 'border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
              title={effectiveLowStockCount > 0 ? `${effectiveLowStockCount} items below reorder threshold - Click to view alerts` : 'All inventory levels healthy'}
            >
              <div className="relative">
                <Bell className={`w-3.5 h-3.5 ${effectiveLowStockCount > 0 ? 'text-rose-400' : 'text-slate-400'}`} />
                {effectiveLowStockCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                )}
              </div>
              {effectiveLowStockCount > 0 ? (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white font-extrabold text-[10px] tracking-tight">
                  {effectiveLowStockCount}
                </span>
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              )}
            </button>

            {/* Notification Dropdown Panel */}
            {isNotificationOpen && (
              <div 
                className="absolute right-0 top-full mt-2 w-80 sm:w-[460px] max-w-[94vw] bg-slate-900/98 backdrop-blur-md border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden text-slate-100 divide-y divide-slate-800/80 animate-in fade-in zoom-in-95 duration-150"
                role="dialog"
                aria-label="Low Stock Reorder Notifications"
              >
                {/* Dropdown Header */}
                <div className="p-3.5 bg-gradient-to-r from-slate-900 via-rose-950/50 to-slate-900 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      effectiveLowStockCount > 0 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    }`}>
                      {effectiveLowStockCount > 0 ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5 font-serif-luxury tracking-wide">
                        Inventory Reorder Alerts
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {effectiveLowStockCount > 0 
                          ? `${effectiveLowStockCount} item${effectiveLowStockCount === 1 ? '' : 's'} below reorder threshold`
                          : 'All items currently meet safety stock levels'}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsNotificationOpen(false)}
                    className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
                    title="Close notification panel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Search Filter Input (if multiple items) */}
                {lowStockItems.length > 2 && (
                  <div className="p-2.5 bg-slate-950/70 border-b border-slate-800/80">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        value={notificationSearch}
                        onChange={(e) => setNotificationSearch(e.target.value)}
                        placeholder="Search alerts by item, code, or vendor..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-7 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                      />
                      {notificationSearch && (
                        <button
                          onClick={() => setNotificationSearch('')}
                          className="absolute right-2.5 top-2 text-slate-400 hover:text-white"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Dropdown Items Body */}
                <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-800/70 p-2 space-y-2">
                  {lowStockItems.length === 0 ? (
                    <div className="p-6 text-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-200">Optimal Stock Health</h5>
                        <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                          Every inventory item is currently above its reorder trigger point. No emergency replenishment required.
                        </p>
                      </div>
                      <div className="flex items-center justify-center gap-2 pt-2">
                        <button
                          onClick={() => {
                            setActiveTab('inventory');
                            setIsNotificationOpen(false);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
                        >
                          Open Inventory Matrix
                        </button>
                        <button
                          onClick={() => {
                            if (onJumpToSupplierRating) {
                              onJumpToSupplierRating(null);
                            } else {
                              setActiveTab('inventory');
                            }
                            setIsNotificationOpen(false);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 text-indigo-200 text-xs font-semibold border border-indigo-700/50 transition flex items-center gap-1"
                        >
                          <BarChart3 className="w-3 h-3 text-indigo-400" />
                          Supplier Rating Dashboard
                        </button>
                      </div>
                    </div>
                  ) : filteredLowStockItems.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No low stock items match "{notificationSearch}".
                    </div>
                  ) : (
                    filteredLowStockItems.map(item => {
                      const deficit = Math.max(1, item.whenToReorder - item.howManyOnHand);
                      const percent = Math.min(100, Math.round((item.howManyOnHand / Math.max(1, item.whenToReorder)) * 100));
                      const isCritical = item.howManyOnHand === 0 || item.howManyOnHand <= item.whenToReorder * 0.3;

                      return (
                        <div 
                          key={item.id}
                          className="p-3 bg-slate-800/70 hover:bg-slate-800/90 rounded-xl border border-slate-700/60 transition space-y-2 group"
                        >
                          {/* Header meta */}
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-900 text-emerald-400 border border-slate-700">
                                {item.itemCode}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900/80 text-slate-300 border border-slate-700/80 truncate max-w-[130px]">
                                {item.category}
                              </span>
                            </div>
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                              isCritical 
                                ? 'bg-rose-950 text-rose-300 border border-rose-600 animate-pulse' 
                                : 'bg-amber-950/80 text-amber-300 border border-amber-600/60'
                            }`}>
                              <AlertTriangle className="w-2.5 h-2.5" />
                              {isCritical ? 'Critical Shortfall' : 'Reorder Triggered'}
                            </span>
                          </div>

                          {/* Title & Description */}
                          <div>
                            <h5 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                              {item.itemDescription}
                            </h5>
                            <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                              <span className="flex items-center gap-1 text-slate-300">
                                <Truck className="w-3 h-3 text-amber-400 shrink-0" />
                                <strong className="text-slate-200">{item.supplier}</strong>
                              </span>
                              <span>•</span>
                              <span>📍 {item.location || 'Main Storage'}</span>
                            </p>
                          </div>

                          {/* Stock numbers & progress bar */}
                          <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
                            <div className="flex items-center justify-between text-xs font-mono">
                              <span className="text-slate-400 flex items-center gap-1">
                                On Hand: 
                                <strong className="text-rose-400 text-sm">{item.howManyOnHand} {item.unit}</strong>
                              </span>
                              <span className="text-slate-400">
                                Reorder Par: <strong className="text-slate-200">{item.whenToReorder} {item.unit}</strong>
                              </span>
                              <span className="text-[11px] font-bold text-rose-400 bg-rose-950/80 px-1.5 py-0.5 rounded border border-rose-900/80">
                                Deficit: -{deficit}
                              </span>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-300 ${
                                  percent <= 20 ? 'bg-rose-600' : percent <= 50 ? 'bg-rose-500' : 'bg-amber-500'
                                }`}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>

                          {/* Action Buttons to Jump */}
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              onClick={() => {
                                if (onJumpToInventoryItem) {
                                  onJumpToInventoryItem(item);
                                } else {
                                  setActiveTab('inventory');
                                }
                                setIsNotificationOpen(false);
                              }}
                              className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-sm transition"
                              title="Jump directly to this item in the Inventory Matrix"
                            >
                              <Layers className="w-3.5 h-3.5 text-emerald-200" />
                              Jump to Matrix
                            </button>

                            <button
                              onClick={() => {
                                if (onJumpToSupplierRating) {
                                  onJumpToSupplierRating(item, item.supplier);
                                } else {
                                  setActiveTab('inventory');
                                }
                                setIsNotificationOpen(false);
                              }}
                              className="flex-1 bg-slate-900 hover:bg-slate-700 text-amber-300 border border-amber-500/40 hover:border-amber-400 px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition"
                              title={`View rating and lead time analytics for ${item.supplier}`}
                            >
                              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                              Supplier Rating
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Dropdown Footer */}
                <div className="p-3 bg-slate-950/90 flex items-center justify-between gap-2 text-xs flex-wrap">
                  <button
                    onClick={() => {
                      setActiveTab('inventory');
                      setIsNotificationOpen(false);
                    }}
                    className="text-slate-300 hover:text-emerald-400 font-semibold flex items-center gap-1 transition"
                  >
                    <Layers className="w-3.5 h-3.5 text-emerald-400" />
                    View Full Matrix
                  </button>

                  <button
                    onClick={() => {
                      if (onJumpToSupplierRating) {
                        onJumpToSupplierRating(null);
                      } else {
                        setActiveTab('inventory');
                      }
                      setIsNotificationOpen(false);
                    }}
                    className="text-amber-300 hover:text-amber-200 font-semibold flex items-center gap-1 transition"
                  >
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    Supplier Rating Dashboard
                    <ChevronRight className="w-3 h-3 text-amber-400" />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div 
            style={{ backgroundColor: '#4aef56' }}
            className="flex items-center gap-1.5 text-xs bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-slate-200"
          >
            <span 
              style={{ backgroundColor: '#0569a2' }}
              className="text-emerald-400 font-bold hidden sm:inline px-1 rounded"
            >
              Currency:
            </span>
            <select
              style={{ backgroundColor: '#0c7e00' }}
              value={globalCurrency}
              onChange={(e) => onCurrencyChange?.(e.target.value)}
              className="text-white text-xs font-bold rounded px-1.5 py-0.5 outline-none border border-slate-700 cursor-pointer"
            >
              <option value="ZAR">ZAR (R)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="AUD">AUD (A$)</option>
              <option value="CAD">CAD (C$)</option>
              <option value="JPY">JPY (¥)</option>
              <option value="CHF">CHF (CHF)</option>
              <option value="NZD">NZD (NZ$)</option>
              <option value="SGD">SGD (S$)</option>
              <option value="INR">INR (₹)</option>
            </select>
          </div>

          <div 
            style={{ backgroundColor: '#46dcd0' }}
            className="flex items-center gap-1 text-slate-900 px-2 py-0.5 rounded border border-slate-800"
          >
            <Clock className="w-3 h-3 text-slate-950" />
            <span>Knysna Time: {timeStr || '12:00:00'} (SAST)</span>
          </div>

          {/* UNIVERSAL PRINT HUB TRIGGER */}
          <button
            id="btn-header-print-hub"
            style={{ backgroundColor: '#2800fb' }}
            onClick={onOpenPrintHub || (() => window.print())}
            className="hover:opacity-90 text-white px-2.5 py-0.5 rounded text-xs border border-rose-600 transition flex items-center gap-1 font-bold shadow-xs"
            title="Open Universal Document Print Hub (Inkjet, Laserjet, Inktank Compatible)"
          >
            <Printer className="w-3.5 h-3.5 text-white" />
            <span 
              style={{ backgroundColor: '#09d8f1' }}
              className="hidden md:inline px-1 py-0.5 rounded"
            >
              Print Hub
            </span>
          </button>

          {currentUser ? (
            <div className="flex items-center gap-2">
              <span 
                style={{ backgroundColor: '#0ad7f7', color: '#042d64' }}
                className="px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide uppercase text-white border border-purple-400/40"
              >
                {currentUser.role === 'admin' ? 'Administrator' : 'Guest Account Trial'}
              </span>
              <span className="text-slate-200 font-medium hidden sm:inline">{currentUser.fullName}</span>
              <button 
                id="btn-header-logout"
                onClick={onLogout}
                className="text-slate-400 hover:text-rose-400 p-1 transition"
                title="Log Out"
              >
                <LogOut style={{ backgroundColor: '#93e90c' }} className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button 
                id="btn-quick-guest"
                onClick={() => {
                  onQuickGuestLogin();
                  setActiveTab('guestportal');
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-0.5 rounded text-xs font-semibold flex items-center gap-1 transition shadow-sm"
              >
                <KeyRound className="w-3 h-3" />
                Guest Portal (Trial)
              </button>
              <button 
                id="btn-header-login"
                onClick={onOpenAuth}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-0.5 rounded text-xs border border-slate-700 transition"
              >
                Sign In / Join
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main branding & navigation bar */}
      <div 
        style={{ backgroundColor: '#f3ffd6' }}
        className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4"
      >
        {/* Brand identity */}
        <div 
          onClick={() => setActiveTab('dashboard')} 
          className="flex items-center gap-3.5 cursor-pointer group"
          id="brand-header-link"
        >
          {/* Custom SVG logo crest */}
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-600 via-teal-800 to-slate-900 border border-emerald-400/40 shadow-lg flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform">
            <svg viewBox="0 0 100 100" className="w-8 h-8 text-emerald-200">
              <path d="M15,65 Q50,25 85,65 Q70,75 50,65 Q30,55 15,65 Z" fill="currentColor" opacity="0.9" />
              <path d="M22,50 Q50,15 78,50 Q65,60 50,50 Q35,40 22,50 Z" fill="#93c5fd" opacity="0.7" />
              <circle cx="50" cy="30" r="7" fill="#f8fafc" />
            </svg>
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 style={{ color: '#1908ea' }} className="font-serif-luxury text-lg md:text-xl font-bold tracking-tight group-hover:text-emerald-300 transition-colors">
                {info.name}
              </h1>
              <span className="hidden xl:inline-block px-2 py-0.5 text-[10px] uppercase font-bold tracking-widest bg-emerald-950 text-emerald-300 border border-emerald-700/60 rounded">
                Reservation Suite
              </span>
            </div>
            <p style={{ color: '#0f0f0f' }} className="text-xs italic hidden sm:block">
              "{info.tagline}"
            </p>
          </div>
        </div>

        {/* Quick shortcut pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* GUEST PORTAL PILL */}
          <button
            id="nav-pill-guestportal"
            style={{ backgroundColor: '#a1ffbf', color: '#0b0b0b' }}
            onClick={() => setActiveTab('guestportal')}
            className="px-2.5 py-1 text-xs rounded-md font-medium transition flex items-center gap-1 shadow-md hover:opacity-90"
          >
            <KeyRound style={{ color: '#0e0e0e' }} className="w-3 h-3" />
            Guest Portal
          </button>

          {/* UNIVERSAL PRINT HUB PILL */}
          <button
            id="nav-pill-printhub"
            style={{ backgroundColor: '#fb9471', color: '#0d0c0c' }}
            onClick={onOpenPrintHub || (() => window.print())}
            className="px-2.5 py-1 text-xs rounded-md font-bold transition flex items-center gap-1 hover:opacity-90 border border-slate-700 shadow-xs"
            title="Open Universal Document Print & Export Hub"
          >
            <Printer style={{ color: '#080707' }} className="w-3 h-3" />
            Print Hub
          </button>

          <button
            id="nav-pill-res"
            style={{ backgroundColor: '#94f16e', color: '#0e0d0d' }}
            onClick={() => setActiveTab('reservations')}
            className="px-2.5 py-1 text-xs rounded-md font-medium transition flex items-center gap-1 hover:opacity-90 shadow-md"
          >
            <span className="font-bold text-[10px] px-1 bg-black/20 rounded">R</span>
            Reservations
          </button>

          <button
            id="nav-pill-checkin"
            style={{ backgroundColor: '#fc7ed3', color: '#131212' }}
            onClick={() => setActiveTab('checkin')}
            className="px-2.5 py-1 text-xs rounded-md font-medium transition flex items-center gap-1 hover:opacity-90 shadow-md"
          >
            <span className="font-bold text-[10px] px-1 bg-black/20 rounded">CHI</span>
            Check-In
          </button>

          <button
            id="nav-pill-departure"
            style={{ backgroundColor: '#ffff00', color: '#000000' }}
            onClick={() => setActiveTab('departure')}
            className="px-2.5 py-1 text-xs rounded-md font-medium transition flex items-center gap-1 hover:opacity-90 shadow-md"
          >
            <span className="font-bold text-[10px] px-1 bg-black/20 rounded">Dep</span>
            Departure
          </button>

          <button
            id="nav-pill-accounting"
            style={{ backgroundColor: '#02c20a', color: '#0a0a0a' }}
            onClick={() => setActiveTab('accounting')}
            className="px-2.5 py-1 text-xs rounded-md font-medium transition flex items-center gap-1 hover:opacity-90 shadow-md"
          >
            <span className="font-bold text-[10px] px-1 bg-black/20 rounded">Acc</span>
            Accounts
          </button>

          <button
            id="nav-pill-marketing"
            style={{ backgroundColor: '#ea60e2', color: '#0b0b0b' }}
            onClick={() => setActiveTab('marketing')}
            className="px-2.5 py-1 text-xs rounded-md font-medium transition flex items-center gap-1 shadow-md hover:opacity-90"
          >
            <span className="font-bold text-[10px] px-1 bg-black/20 rounded">Mark</span>
            Marketing
          </button>

          <button
            id="nav-pill-employees"
            style={{ backgroundColor: '#ec7b93', color: '#0b0b0b' }}
            onClick={() => setActiveTab('employees')}
            className="px-2.5 py-1 text-xs rounded-md font-medium transition flex items-center gap-1 hover:opacity-90 shadow-md"
          >
            <span className="font-bold text-[10px] px-1 bg-black/20 rounded">EMP</span>
            Employees
          </button>

          <button
            id="nav-pill-inventory"
            style={{ backgroundColor: '#6f5ef8', color: '#060606' }}
            onClick={() => setActiveTab('inventory')}
            className="px-2.5 py-1 text-xs rounded-md font-medium transition flex items-center gap-1 shadow-md hover:opacity-90"
          >
            <span className="font-bold text-[10px] px-1 bg-black/20 rounded">Inv</span>
            Inventory
            {lowStockCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            )}
          </button>

          <button
            id="nav-pill-suppliers"
            style={{ backgroundColor: '#76bc67', color: '#0e0d0d' }}
            onClick={() => setActiveTab('suppliers')}
            className="px-2.5 py-1 text-xs rounded-md font-medium transition flex items-center gap-1 hover:opacity-90 shadow-md"
          >
            <span className="font-bold text-[10px] px-1 bg-black/20 rounded">SCon</span>
            Suppliers
          </button>

          <button
            id="nav-pill-attractions"
            style={{ backgroundColor: '#bc957d', color: '#0d0c0c' }}
            onClick={() => setActiveTab('attractions')}
            className="px-2.5 py-1 text-xs rounded-md font-medium transition flex items-center gap-1 hover:opacity-90 shadow-md"
          >
            <span className="font-bold text-[10px] px-1 bg-black/20 rounded">MAP</span>
            Attractions
          </button>

          {/* COMPANY INFO ALL EDITABLE PILL */}
          <button
            id="nav-pill-company"
            style={{ backgroundColor: '#abb565', color: '#0b0b0b' }}
            onClick={() => setActiveTab('company')}
            className="px-2.5 py-1 text-xs rounded-md font-medium transition flex items-center gap-1 hover:opacity-90 shadow-md"
          >
            <Building2 className="w-3 h-3 text-white" />
            Company Info
          </button>

          <button
            id="nav-pill-addressbook"
            style={{ backgroundColor: '#6ea5aa', color: '#0d0c0c' }}
            onClick={() => setActiveTab('addressbook')}
            className="px-2.5 py-1 text-xs rounded-md font-medium transition flex items-center gap-1 hover:opacity-90 shadow-md"
          >
            <span className="font-bold text-[10px] px-1 bg-black/20 rounded">AB</span>
            Guest Address Book
          </button>

          <button
            id="nav-pill-minutes"
            style={{ backgroundColor: '#60de0a', color: '#060606' }}
            onClick={() => setActiveTab('minutes')}
            className="px-2.5 py-1 text-xs rounded-md font-medium transition flex items-center gap-1 shadow-md hover:opacity-90"
          >
            <span className="font-bold text-[10px] px-1 bg-black/20 rounded">MIN</span>
            Meeting Minutes
          </button>
        </div>
      </div>
    </header>
  );
};
