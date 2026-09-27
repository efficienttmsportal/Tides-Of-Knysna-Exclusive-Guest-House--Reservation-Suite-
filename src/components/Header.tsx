import React from 'react';
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
  FileSpreadsheet
} from 'lucide-react';
import { GUEST_HOUSE_INFO } from '../data/initialData';
import { UserAccount } from '../types';
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
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onOpenAuth,
  onLogout,
  onQuickGuestLogin,
  activeTab,
  setActiveTab,
  companyInfo,
  lowStockCount = 0
}) => {
  const info = companyInfo || (GUEST_HOUSE_INFO as any);

  // Format current SAST time
  const [timeStr, setTimeStr] = React.useState('');

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-xl no-print">
      {/* Top micro status bar */}
      <div className="bg-slate-950 px-4 py-1.5 border-b border-slate-800/80 text-xs text-slate-300 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Tides of Knysna Lagoon Terminal
          </span>
          <span className="hidden sm:inline text-slate-400">|</span>
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
          {/* Inventory Notification Bell */}
          <button
            onClick={() => setActiveTab('inventory')}
            className={`relative p-1.5 rounded-lg border transition flex items-center gap-1.5 text-xs ${
              lowStockCount > 0 
                ? 'bg-rose-950/60 border-rose-600 text-rose-300 hover:bg-rose-900/80 animate-pulse'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title={lowStockCount > 0 ? `${lowStockCount} items below reorder level - Click to view inventory alerts` : 'All inventory levels healthy'}
          >
            <Bell className="w-3.5 h-3.5" />
            {lowStockCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white font-bold text-[10px]">
                {lowStockCount}
              </span>
            )}
          </button>

          <div className="flex items-center gap-1 text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
            <Clock className="w-3 h-3 text-emerald-400" />
            <span>Knysna Time: {timeStr || '12:00:00'} (SAST)</span>
          </div>

          {currentUser ? (
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide uppercase ${
                currentUser.role === 'admin' 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
              }`}>
                {currentUser.role === 'admin' ? 'Administrator' : 'Guest Account Trial'}
              </span>
              <span className="text-slate-200 font-medium hidden sm:inline">{currentUser.fullName}</span>
              <button 
                id="btn-header-logout"
                onClick={onLogout}
                className="text-slate-400 hover:text-rose-400 p-1 transition"
                title="Log Out"
              >
                <LogOut className="w-3.5 h-3.5" />
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
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
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
              <h1 className="font-serif-luxury text-lg md:text-xl font-bold tracking-tight text-white group-hover:text-emerald-300 transition-colors">
                {info.name}
              </h1>
              <span className="hidden xl:inline-block px-2 py-0.5 text-[10px] uppercase font-bold tracking-widest bg-emerald-950 text-emerald-300 border border-emerald-700/60 rounded">
                Reservation Suite
              </span>
            </div>
            <p className="text-xs text-slate-300 italic hidden sm:block">
              "{info.tagline}"
            </p>
          </div>
        </div>

        {/* Quick shortcut pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* GUEST PORTAL PILL */}
          <button
            id="nav-pill-guestportal"
            onClick={() => setActiveTab('guestportal')}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition flex items-center gap-1 ${
              activeTab === 'guestportal'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                : 'bg-amber-950/40 text-amber-200 border border-amber-600/40 hover:bg-amber-900/60'
            }`}
          >
            <KeyRound className="w-3 h-3 text-amber-400" />
            Guest Portal
          </button>

          <button
            id="nav-pill-res"
            onClick={() => setActiveTab('reservations')}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition flex items-center gap-1 ${
              activeTab === 'reservations'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <span className="font-bold text-[10px] px-1 bg-black/20 rounded">R</span>
            Reservations
          </button>

          <button
            id="nav-pill-checkin"
            onClick={() => setActiveTab('checkin')}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition flex items-center gap-1 ${
              activeTab === 'checkin'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <span className="font-bold text-[10px] px-1 bg-black/20 rounded">CHI</span>
            Check-In
          </button>

          <button
            id="nav-pill-departure"
            onClick={() => setActiveTab('departure')}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition flex items-center gap-1 ${
              activeTab === 'departure'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <span className="font-bold text-[10px] px-1 bg-black/20 rounded">Dep</span>
            Departure
          </button>

          <button
            id="nav-pill-accounting"
            onClick={() => setActiveTab('accounting')}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition flex items-center gap-1 ${
              activeTab === 'accounting'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <span className="font-bold text-[10px] px-1 bg-black/20 rounded">Acc</span>
            Accounts
          </button>

          <button
            id="nav-pill-marketing"
            onClick={() => setActiveTab('marketing')}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition flex items-center gap-1 ${
              activeTab === 'marketing'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <span className="font-bold text-[10px] px-1 bg-black/20 rounded">Mark</span>
            Marketing
          </button>

          <button
            id="nav-pill-employees"
            onClick={() => setActiveTab('employees')}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition flex items-center gap-1 ${
              activeTab === 'employees'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <span className="font-bold text-[10px] px-1 bg-black/20 rounded">EMP</span>
            Employees
          </button>

          <button
            id="nav-pill-inventory"
            onClick={() => setActiveTab('inventory')}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition flex items-center gap-1 ${
              activeTab === 'inventory'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <span className="font-bold text-[10px] px-1 bg-black/20 rounded">Inv</span>
            Inventory
            {lowStockCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            )}
          </button>

          <button
            id="nav-pill-suppliers"
            onClick={() => setActiveTab('suppliers')}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition flex items-center gap-1 ${
              activeTab === 'suppliers'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <span className="font-bold text-[10px] px-1 bg-black/20 rounded">SCon</span>
            Suppliers
          </button>

          <button
            id="nav-pill-attractions"
            onClick={() => setActiveTab('attractions')}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition flex items-center gap-1 ${
              activeTab === 'attractions'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <span className="font-bold text-[10px] px-1 bg-black/20 rounded">MAP</span>
            Attractions
          </button>

          {/* COMPANY INFO ALL EDITABLE PILL */}
          <button
            id="nav-pill-company"
            onClick={() => setActiveTab('company')}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition flex items-center gap-1 ${
              activeTab === 'company'
                ? 'bg-indigo-600 text-white font-bold shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Building2 className="w-3 h-3 text-indigo-400" />
            Company Info
          </button>
        </div>
      </div>
    </header>
  );
};
