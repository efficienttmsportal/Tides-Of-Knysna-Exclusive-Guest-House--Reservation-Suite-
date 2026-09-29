import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  CheckSquare, 
  LogOut, 
  DollarSign, 
  Megaphone, 
  Users, 
  Truck, 
  BookUser, 
  CalendarDays, 
  Database, 
  Video, 
  MapPin, 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  BedDouble, 
  ArrowRight,
  Clock,
  Compass,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  FolderOpen,
  KeyRound,
  Building2,
  Star,
  ThumbsUp,
  MessageSquare,
  Award
} from 'lucide-react';
import { GUEST_HOUSE_INFO } from '../data/initialData';
import { Reservation, UserAccount, InventoryItem } from '../types';
import { DashboardKpiSummaryRow } from './DashboardKpiSummaryRow';
import { CompanyInfoData } from './CompanyInfoModule';
import { SeasonalOccupancyChart } from './SeasonalOccupancyChart';
import { getStoredGuestSurveys, GuestSatisfactionRecord } from './GuestSatisfactionSurvey';

interface DashboardViewProps {
  reservations: Reservation[];
  onSelectTab: (tab: string) => void;
  currentUser: UserAccount | null;
  onOpenAuth: () => void;
  companyInfo?: CompanyInfoData;
  inventory?: InventoryItem[];
  onOpenSupplierModal?: (supplier: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  reservations,
  onSelectTab,
  currentUser,
  onOpenAuth,
  companyInfo,
  inventory,
  onOpenSupplierModal,
}) => {
  const info = companyInfo || (GUEST_HOUSE_INFO as any);
  const totalReservations = reservations.length;
  const totalRevenue = reservations.reduce((acc, r) => acc + r.totalRoomCost, 0);
  const totalDepositsHeld = reservations
    .filter(r => r.breakageDepositStatus === 'Held')
    .reduce((acc, r) => acc + r.breakageDepositAmount, 0);

  // Guest Satisfaction Survey Aggregate State
  const [surveys, setSurveys] = useState<GuestSatisfactionRecord[]>(() => getStoredGuestSurveys());

  useEffect(() => {
    const handleUpdate = () => {
      setSurveys(getStoredGuestSurveys());
    };
    window.addEventListener('tok_survey_updated', handleUpdate);
    return () => window.removeEventListener('tok_survey_updated', handleUpdate);
  }, []);

  const totalSurveys = surveys.length;
  const avgCleanliness = totalSurveys > 0
    ? (surveys.reduce((acc, s) => acc + s.cleanlinessScore, 0) / totalSurveys).toFixed(1)
    : '5.0';
  const avgAmenities = totalSurveys > 0
    ? (surveys.reduce((acc, s) => acc + s.amenitiesScore, 0) / totalSurveys).toFixed(1)
    : '5.0';
  const avgStaff = totalSurveys > 0
    ? (surveys.reduce((acc, s) => acc + s.staffHelpfulnessScore, 0) / totalSurveys).toFixed(1)
    : '5.0';
  const avgOverall = totalSurveys > 0
    ? (surveys.reduce((acc, s) => acc + s.overallScore, 0) / totalSurveys).toFixed(1)
    : '5.0';

  const modules = [
    {
      code: 'PORTAL',
      tab: 'guestportal',
      title: 'Guest Self-Service Portal',
      desc: 'Booking ref & surname login, digital keyless PIN, special requests & concierge excursions',
      icon: KeyRound,
      color: 'from-amber-600 to-amber-900',
      badge: 'Guest Access Hub'
    },
    {
      code: 'R',
      tab: 'reservations',
      title: 'Reservations',
      desc: 'Booking engine, guest allocations, stay dates, rates & vouchers',
      icon: BedDouble,
      color: 'from-blue-600 to-indigo-800',
      badge: `${totalReservations} Active Bookings`
    },
    {
      code: 'CHI',
      tab: 'checkin',
      title: 'Check-In',
      desc: 'Arrival registration, passport verification, key issuance & welcome protocol',
      icon: CheckSquare,
      color: 'from-emerald-600 to-teal-800',
      badge: 'Arrivals Terminal'
    },
    {
      code: 'Dep',
      tab: 'departure',
      title: 'Departure',
      desc: 'Room inspections, breakage deposit refund processing & guest feedback',
      icon: LogOut,
      color: 'from-amber-600 to-orange-800',
      badge: 'Inspection & Refunds'
    },
    {
      code: 'Acc',
      tab: 'accounting',
      title: 'Accounting & Finance',
      desc: 'Invoices, Quotes, POs, Statements with payment stubs, Trial Balance & Sales graphs',
      icon: DollarSign,
      color: 'from-emerald-700 to-slate-900',
      badge: 'Auto-Numbered Templates'
    },
    {
      code: 'Mark',
      tab: 'marketing',
      title: 'Marketing & Sales',
      desc: 'Instagram/Facebook templates, hashtag generator, letterheads, business cards & specials',
      icon: Megaphone,
      color: 'from-purple-600 to-pink-800',
      badge: 'Social & Brand Studio'
    },
    {
      code: 'EMP',
      tab: 'employees',
      title: 'Employees & HR',
      desc: 'Sales performance dashboard, monthly targets, clockcard payslips, appointments & leave',
      icon: Users,
      color: 'from-slate-700 to-slate-950',
      badge: 'Sales Pacing & HR Hub'
    },
    {
      code: 'Inv',
      tab: 'inventory',
      title: 'Inventory & Stock Control',
      desc: '600TC linens, amenities, fynbos toiletries, automated ops reorder email alerts & revenue forecasting',
      icon: FileSpreadsheet,
      color: 'from-cyan-700 to-blue-900',
      badge: 'Reorder Alerts Active'
    },
    {
      code: 'CO',
      tab: 'company',
      title: 'Company Information',
      desc: 'All editable establishment details: branding, telephone, admin email, bank details & room inventory',
      icon: Building2,
      color: 'from-indigo-700 to-slate-900',
      badge: 'All Editable Profile'
    },
    {
      code: 'Chk',
      tab: 'checklists',
      title: '5-Area Checklists',
      desc: 'Inspection checklists: Bathrooms, Bedrooms, Kitchen/Dining, Outdoor, Elevator',
      icon: CheckCircle,
      color: 'from-emerald-800 to-green-950',
      badge: 'Quality Control'
    },
    {
      code: 'SCon',
      tab: 'suppliers',
      title: 'Supplier Contacts',
      desc: 'Vendors for laundry, fine wine, indigenous botanicals, marine and maintenance',
      icon: Truck,
      color: 'from-indigo-700 to-slate-900',
      badge: 'Procurement Hub'
    },
    {
      code: 'Adbook',
      tab: 'addressbook',
      title: 'Address Book',
      desc: 'VIP guests, luxury travel advisors, inbound operators & local concierges',
      icon: BookUser,
      color: 'from-slate-800 to-blue-950',
      badge: 'Guest Directory'
    },
    {
      code: 'Cal',
      tab: 'calendar',
      title: 'Calendar & Availability',
      desc: 'Interactive month schedule and occupancy grid for all 6 luxury lagoon suites',
      icon: CalendarDays,
      color: 'from-teal-700 to-emerald-950',
      badge: 'Room Availability Grid'
    },
    {
      code: 'Bend',
      tab: 'backend',
      title: 'Backend & Cloud Backup',
      desc: 'Cloud storage synchronization, JSON data backup, restore, folder & file management',
      icon: Database,
      color: 'from-slate-900 to-emerald-950',
      badge: 'Cloud Sync Engine'
    },
    {
      code: 'MET',
      tab: 'meetings',
      title: 'Meetings & Events',
      desc: 'Executive boardroom schedule, daily morning briefings & hospitality conferences',
      icon: Video,
      color: 'from-blue-800 to-slate-900',
      badge: 'Boardroom Scheduler'
    },
    {
      code: 'MAP',
      tab: 'attractions',
      title: 'Maps & Guest Attractions',
      desc: 'Knysna, Plettenberg Bay, Port Elizabeth: Sightseeing, Car Hire, Tours, Wine, Emergency',
      icon: MapPin,
      color: 'from-emerald-600 to-blue-900',
      badge: 'Garden Route Directory'
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Hero Banner with authentic hospitality aesthetics */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white p-8 md:p-12 shadow-2xl border border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.18),transparent_50%)] pointer-events-none"></div>
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-12 translate-y-12">
          <svg width="400" height="400" viewBox="0 0 200 200">
            <path d="M20,120 Q60,40 100,120 T180,120" stroke="white" strokeWidth="6" fill="none" />
            <path d="M20,140 Q60,60 100,140 T180,140" stroke="#34d399" strokeWidth="6" fill="none" />
          </svg>
        </div>

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Exclusive Hospitality Operations Hub
          </div>

          <h1 className="font-serif-luxury text-3xl md:text-5xl font-bold tracking-tight text-white leading-tight">
            {info.name}
          </h1>

          <p className="text-emerald-300 text-base md:text-lg font-medium italic">
            "{info.tagline}"
          </p>

          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Welcome to the centralized management suite designed for world-class tourism on South Africa's Garden Route. Effortlessly coordinate guest bookings, financial accounting, employee operations, digital check-in/departures, and marketing campaigns.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              id="hero-btn-guestportal"
              onClick={() => onSelectTab('guestportal')}
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg transition flex items-center gap-2"
            >
              <KeyRound className="w-4 h-4 text-slate-950" />
              Guest Portal
            </button>
            <button
              id="hero-btn-new-res"
              onClick={() => onSelectTab('reservations')}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg transition flex items-center gap-2"
            >
              <BedDouble className="w-4 h-4" />
              Manage Reservations (R)
            </button>
            <button
              id="hero-btn-accounting"
              onClick={() => onSelectTab('accounting')}
              className="px-5 py-2.5 bg-slate-800/90 hover:bg-slate-700 text-slate-100 rounded-xl font-bold text-xs uppercase tracking-wider border border-slate-700 shadow-md transition flex items-center gap-2"
            >
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Accounts & Templates (Acc)
            </button>
            <button
              id="hero-btn-attractions"
              onClick={() => onSelectTab('attractions')}
              className="px-5 py-2.5 bg-blue-900/60 hover:bg-blue-800 text-blue-200 rounded-xl font-bold text-xs uppercase tracking-wider border border-blue-700/60 shadow-md transition flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-blue-300" />
              Guest Attractions (MAP)
            </button>
            <button
              id="hero-btn-company"
              onClick={() => onSelectTab('company')}
              className="px-5 py-2.5 bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 rounded-xl font-bold text-xs uppercase tracking-wider border border-indigo-700/60 shadow-md transition flex items-center gap-2"
            >
              <Building2 className="w-4 h-4 text-indigo-300" />
              Company Info
            </button>
          </div>
        </div>
      </div>

      {/* Top-Level Summary Row of KPI Widgets (Recharts) */}
      <DashboardKpiSummaryRow onSelectTab={onSelectTab} reservations={reservations} />

      {/* Real-time Hospitality Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Active Stays</span>
            <span className="text-2xl font-bold text-slate-900">{totalReservations} Suites</span>
            <span className="text-[11px] text-emerald-600 font-medium block mt-1">High Seasonal Occupancy (85%)</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <BedDouble className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Booked Revenue</span>
            <span className="text-2xl font-bold text-slate-900">R {totalRevenue.toLocaleString()}</span>
            <span className="text-[11px] text-emerald-600 font-medium block mt-1">+18.4% vs Previous Month</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Breakage Deposits Held</span>
            <span className="text-2xl font-bold text-slate-900">R {totalDepositsHeld.toLocaleString()}</span>
            <span className="text-[11px] text-slate-500 font-medium block mt-1">Held in Secure Trust Account</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Active User Session</span>
            <span className="text-sm font-bold text-slate-900 truncate max-w-[130px] block">
              {currentUser ? currentUser.fullName : 'Guest Trial Mode'}
            </span>
            <button
              onClick={onOpenAuth}
              className="text-[11px] text-emerald-700 font-bold hover:underline block mt-1"
            >
              Switch or Sign In →
            </button>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Seasonal Occupancy Tracking & Peak Periods Analytics with Low Stock Graph */}
      <SeasonalOccupancyChart
        reservations={reservations}
        inventory={inventory}
        onSelectTab={onSelectTab}
        onOpenSupplierModal={onOpenSupplierModal}
      />

      {/* 5-STAR GUEST SATISFACTION & ACCREDITATION AUDIT CARD */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 flex items-center justify-center font-bold shadow-xs">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold tracking-wider text-amber-700">
                  Guest Quality & Accreditation Metrics
                </span>
                <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-200">
                  TGCSA 5-Star Graded
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 font-serif-luxury">
                Guest Satisfaction Survey Aggregate Scores ({totalSurveys} Verified Resident Reviews)
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onSelectTab('inventory-forecast')}
              className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              title="View consumables demand forecast correlated with guest cleanliness & amenity feedback"
            >
              <TrendingUp className="w-3.5 h-3.5 text-amber-700" />
              Stock Forecast & Feedback
            </button>
            <button
              onClick={() => onSelectTab('guestportal')}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              Open Guest Portal Survey
            </button>
            <button
              onClick={() => onSelectTab('employees')}
              className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              Staff Shift Calendar
            </button>
          </div>
        </div>

        {/* 4 Score Metric Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Overall Satisfaction</span>
            <div className="flex items-center justify-center gap-1 text-amber-500">
              <Star className="w-5 h-5 fill-amber-400" />
              <span className="text-2xl font-black text-slate-900 font-serif-luxury">{avgOverall}</span>
              <span className="text-xs text-slate-400 font-mono">/ 5.0</span>
            </div>
            <span className="text-[11px] text-emerald-700 font-bold block">Superior 5-Star Standard</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Room Cleanliness</span>
            <div className="text-2xl font-black text-slate-900 font-serif-luxury">
              {avgCleanliness} <span className="text-xs text-slate-400 font-mono font-normal">/ 5.0</span>
            </div>
            <span className="text-[11px] text-slate-500 block">600TC Linen & Hygiene</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Amenities & Comfort</span>
            <div className="text-2xl font-black text-slate-900 font-serif-luxury">
              {avgAmenities} <span className="text-xs text-slate-400 font-mono font-normal">/ 5.0</span>
            </div>
            <span className="text-[11px] text-slate-500 block">Wi-Fi, Spa, Nespresso & Plunge</span>
          </div>

          <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 text-center space-y-1">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Staff Helpfulness</span>
            <div className="text-2xl font-black text-emerald-950 font-serif-luxury">
              {avgStaff} <span className="text-xs text-emerald-700 font-mono font-normal">/ 5.0</span>
            </div>
            <span className="text-[11px] text-emerald-700 font-bold block">Concierge & Housekeeping Care</span>
          </div>
        </div>

        {/* Recent Resident Reviews & Staff Commendations */}
        <div className="pt-2 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            Latest Guest Testimonials & Staff Commendations:
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {surveys.slice(0, 2).map((s) => (
              <div key={s.id} className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <strong className="text-slate-900">{s.guestName}</strong>
                    <span className="text-[10px] text-slate-500">• Room {s.roomNumber}</span>
                  </div>
                  <div className="flex items-center gap-0.5 text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span className="font-bold text-[11px] text-slate-800">{s.overallScore}</span>
                  </div>
                </div>
                <p className="text-slate-600 italic text-[11px] line-clamp-2">
                  "{s.comments}"
                </p>
                {s.staffMemberMentioned && (
                  <div className="text-[10.5px] text-emerald-800 font-semibold pt-0.5">
                    ⭐ Commendation: {s.staffMemberMentioned}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Suite Modules Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Operations & Management Dashboard</h2>
            <p className="text-xs text-slate-500">Access all specialized departments with full editing, export, printing, and email capabilities</p>
          </div>
          <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            14 Active Integrated Modules
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.code}
                id={`card-module-${m.code.toLowerCase()}`}
                onClick={() => onSelectTab(m.tab)}
                className="group bg-white rounded-2xl border border-slate-200 hover:border-emerald-400/80 p-5 shadow-xs hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-11 h-11 rounded-xl bg-slate-900 text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors flex items-center justify-center font-bold shadow-sm">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded text-[11px] font-black bg-slate-100 text-slate-700 group-hover:bg-emerald-50 group-hover:text-emerald-800 transition">
                        {m.code}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                        {m.badge}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-700 transition">
                    {m.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {m.desc}
                  </p>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700 group-hover:text-emerald-800">
                  <span>Open {m.code} Terminal</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Guest House Quick Overview Card */}
      <div className="bg-slate-900 text-slate-200 rounded-2xl p-6 border border-slate-800 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Tides of Knysna Lagoon Overview & Luxury Suites
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Current room configurations, standard rates per person/night & maximum capacities
            </p>
          </div>
          <button
            onClick={() => onSelectTab('reservations')}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow-sm"
          >
            Create New Booking +
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-4">
          {GUEST_HOUSE_INFO.rooms.map((room) => (
            <div key={room.number} className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 hover:border-emerald-500/40 transition">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-black text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                  Suite {room.number}
                </span>
                <span className="text-xs text-slate-300 font-bold">R {room.defaultRate.toLocaleString()} / night</span>
              </div>
              <div className="text-xs font-bold text-white">{room.name}</div>
              <div className="text-[11px] text-slate-400 mt-0.5 flex items-center justify-between">
                <span>{room.type}</span>
                <span>Max {room.capacity} Guests</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
