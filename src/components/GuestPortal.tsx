import React, { useState, useMemo } from 'react';
import { 
  KeyRound, 
  BedDouble, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  CheckCircle, 
  Sparkles, 
  MapPin, 
  Phone, 
  Mail, 
  Compass, 
  Send, 
  Wifi, 
  Key, 
  AlertCircle, 
  LogOut, 
  Utensils, 
  Search, 
  ExternalLink, 
  Printer, 
  Copy, 
  Check, 
  Wine, 
  Car, 
  FileText, 
  Info,
  ChevronRight,
  BookmarkPlus
} from 'lucide-react';
import { Reservation, AttractionItem } from '../types';
import { ATTRACTIONS_DIRECTORY, GUEST_HOUSE_INFO } from '../data/initialData';
import { CompanyInfoData } from './CompanyInfoModule';

interface GuestPortalProps {
  reservations: Reservation[];
  onUpdateReservations: (updated: Reservation[]) => void;
  companyInfo?: CompanyInfoData;
  initialBookingRef?: string;
  initialSurname?: string;
}

export const GuestPortal: React.FC<GuestPortalProps> = ({
  reservations,
  onUpdateReservations,
  companyInfo,
  initialBookingRef = '',
  initialSurname = ''
}) => {
  // Login form state
  const [bookingRefInput, setBookingRefInput] = useState(initialBookingRef);
  const [surnameInput, setSurnameInput] = useState(initialSurname);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Authenticated reservation state
  const [activeReservationId, setActiveReservationId] = useState<string | null>(() => {
    if (initialBookingRef && initialSurname) {
      const match = reservations.find(r => 
        r.reservationNumber.trim().toUpperCase() === initialBookingRef.trim().toUpperCase() &&
        r.customerSurname.trim().toLowerCase() === initialSurname.trim().toLowerCase()
      );
      return match ? match.id : null;
    }
    return null;
  });

  // UI state inside portal
  const [activePortalTab, setActivePortalTab] = useState<'stay' | 'requests' | 'recommendations' | 'concierge'>('stay');
  const [copiedWifi, setCopiedWifi] = useState(false);
  const [copiedPin, setCopiedPin] = useState(false);

  // Special request submission form state
  const [newRequestType, setNewRequestType] = useState('Champagne & Refreshments');
  const [newRequestDetails, setNewRequestDetails] = useState('');
  const [requestSubmittedSuccess, setRequestSubmittedSuccess] = useState(false);

  // Local attractions directory filtering
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookingRequestSent, setBookingRequestSent] = useState<string | null>(null);

  // Find currently authenticated reservation
  const currentReservation = useMemo(() => {
    return reservations.find(r => r.id === activeReservationId) || null;
  }, [reservations, activeReservationId]);

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const ref = bookingRefInput.trim().toUpperCase();
    const surname = surnameInput.trim().toLowerCase();

    if (!ref || !surname) {
      setLoginError('Please provide both your Booking Reference and Surname.');
      return;
    }

    const matched = reservations.find(r => 
      r.reservationNumber.trim().toUpperCase() === ref &&
      r.customerSurname.trim().toLowerCase() === surname
    );

    if (matched) {
      setActiveReservationId(matched.id);
      setLoginError(null);
    } else {
      setLoginError('No matching reservation found. Please double-check your booking reference (e.g. TOK-2026-0891) and surname.');
    }
  };

  // Quick Demo Login Handler
  const handleQuickDemoLogin = (res: Reservation) => {
    setBookingRefInput(res.reservationNumber);
    setSurnameInput(res.customerSurname);
    setActiveReservationId(res.id);
    setLoginError(null);
  };

  const handleLogout = () => {
    setActiveReservationId(null);
    setBookingRefInput('');
    setSurnameInput('');
  };

  // Copy helpers
  const handleCopyWifi = () => {
    navigator.clipboard.writeText('TidesExclusive_Guest5G | Pass: LagoonView2026!');
    setCopiedWifi(true);
    setTimeout(() => setCopiedWifi(false), 2000);
  };

  const handleCopyPin = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 2000);
  };

  // Handle Special Request Submission
  const handleSubmitSpecialRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentReservation || !newRequestDetails.trim()) return;

    const formattedRequest = `[${newRequestType}] ${newRequestDetails.trim()}`;
    const updatedSpecialRequests = currentReservation.specialRequests 
      ? `${currentReservation.specialRequests} \n• ${formattedRequest}`
      : `• ${formattedRequest}`;

    const updatedList = reservations.map(r => 
      r.id === currentReservation.id 
        ? { ...r, specialRequests: updatedSpecialRequests }
        : r
    );

    onUpdateReservations(updatedList);
    setNewRequestDetails('');
    setRequestSubmittedSuccess(true);
    setTimeout(() => setRequestSubmittedSuccess(false), 4000);
  };

  // Handle Concierge Excursion Booking
  const handleRequestExcursion = (attraction: AttractionItem) => {
    if (!currentReservation) return;

    const conciergeNote = `Guest requested concierge arrangement for: ${attraction.name} (${attraction.category}, ${attraction.distanceFromGuestHouse})`;
    const updatedSpecialRequests = currentReservation.specialRequests 
      ? `${currentReservation.specialRequests} \n• [Concierge Booking]: ${attraction.name} (${attraction.contactNumber})`
      : `• [Concierge Booking]: ${attraction.name} (${attraction.contactNumber})`;

    const updatedInterests = currentReservation.nearbySightseeingInterests.includes(attraction.name)
      ? currentReservation.nearbySightseeingInterests
      : [...currentReservation.nearbySightseeingInterests, attraction.name];

    const updatedList = reservations.map(r => 
      r.id === currentReservation.id 
        ? { 
            ...r, 
            specialRequests: updatedSpecialRequests,
            nearbySightseeingInterests: updatedInterests,
            notes: r.notes ? `${r.notes}\n${conciergeNote}` : conciergeNote
          }
        : r
    );

    onUpdateReservations(updatedList);
    setBookingRequestSent(attraction.id);
    setTimeout(() => setBookingRequestSent(null), 3500);
  };

  // Filter recommendations
  const categories = ['All', 'Sightseeing', 'Eateries', 'Wine Tasting', 'Ocean Tours', 'Car Hire', 'Emergency Services'];
  const filteredAttractions = useMemo(() => {
    return ATTRACTIONS_DIRECTORY.filter(item => {
      const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch = !searchQuery || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.region.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // If not logged in, show secure login portal
  if (!currentReservation) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 animate-fade-in space-y-8">
        {/* Welcome Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Tides of Knysna Concierge Service
          </div>
          <h1 className="font-serif-luxury text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            Guest Self-Service Portal
          </h1>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Access your confirmed booking details, customize room amenities, submit special requests to your private butler, and explore curated Garden Route experiences.
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden max-w-xl mx-auto">
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 p-6 text-white text-center border-b border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <KeyRound className="w-6 h-6" />
            </div>
            <h2 className="font-serif-luxury text-xl font-bold">Secure Guest Verification</h2>
            <p className="text-xs text-slate-300 mt-1">
              Enter your official booking confirmation reference and guest surname as issued on your reservation voucher.
            </p>
          </div>

          <form onSubmit={handleLogin} className="p-6 md:p-8 space-y-4">
            {loginError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Booking Reference Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. TOK-2026-0891"
                  value={bookingRefInput}
                  onChange={(e) => setBookingRefInput(e.target.value)}
                  className="w-full text-sm font-mono font-bold px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none uppercase placeholder:font-sans placeholder:font-normal placeholder:text-slate-400"
                  required
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Found on your booking confirmation email or SMS voucher.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Guest Surname (Last Name) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Vanderbilt"
                value={surnameInput}
                onChange={(e) => setSurnameInput(e.target.value)}
                className="w-full text-sm font-semibold px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none placeholder:text-slate-400"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition shadow-lg flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              Sign In to My Guest Portal
            </button>
          </form>

          {/* Quick Demo Access Bar */}
          <div className="bg-slate-50 p-5 border-t border-slate-100 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <span>Instant Test Logins (Demo Profiles)</span>
              <span className="text-emerald-600 font-medium">Click to Authenticate</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {reservations.slice(0, 4).map(res => (
                <button
                  key={res.id}
                  type="button"
                  onClick={() => handleQuickDemoLogin(res)}
                  className="text-left p-2.5 bg-white hover:bg-emerald-50/60 rounded-xl border border-slate-200 hover:border-emerald-300 transition text-xs group"
                >
                  <div className="font-bold text-slate-900 group-hover:text-emerald-800">
                    {res.customerName} {res.customerSurname}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Ref: <strong className="text-slate-700">{res.reservationNumber}</strong> • Room {res.roomNumber}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center max-w-3xl mx-auto">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <BedDouble className="w-5 h-5 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-slate-800 text-xs">Room & Stay Details</h4>
            <p className="text-[11px] text-slate-500">Live view of suite allocation, stay dates, and door access keys.</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <Sparkles className="w-5 h-5 text-amber-500 mx-auto" />
            <h4 className="font-bold text-slate-800 text-xs">Special Requests</h4>
            <p className="text-[11px] text-slate-500">Request airport pickups, champagne on ice, or dietary accommodations.</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <Compass className="w-5 h-5 text-blue-600 mx-auto" />
            <h4 className="font-bold text-slate-800 text-xs">Concierge Excursions</h4>
            <p className="text-[11px] text-slate-500">Curated lagoon cruises, oyster dining, and guided forest tours.</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate door key PIN simulation
  const roomPinCode = `*${currentReservation.roomNumber}${currentReservation.customerSurname.length}7#`;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Welcome Card with Reservation Status */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <BedDouble className="w-48 h-48 text-emerald-400" />
        </div>

        <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                Booking Confirmed
              </span>
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-200 border border-slate-700">
                Ref: {currentReservation.reservationNumber}
              </span>
              <span className="text-xs text-slate-400">
                Room {currentReservation.roomNumber}
              </span>
            </div>

            <h1 className="font-serif-luxury text-2xl md:text-3xl font-bold tracking-tight text-white">
              Welcome, {currentReservation.customerName} {currentReservation.customerSurname}
            </h1>

            <p className="text-sm text-emerald-200/90 font-medium">
              {currentReservation.roomAllocation}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  <strong>Check-in:</strong> {currentReservation.checkInDate}
                </span>
              </div>
              <span className="text-slate-600">|</span>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  <strong>Check-out:</strong> {currentReservation.checkOutDate}
                </span>
              </div>
              <span className="text-slate-600">|</span>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>{currentReservation.totalNights} Nights • {currentReservation.numberOfGuests} Guests</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Stay Pass
            </button>

            <button
              onClick={handleLogout}
              className="px-3.5 py-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-rose-800/50 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        <button
          onClick={() => setActivePortalTab('stay')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activePortalTab === 'stay'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <BedDouble className="w-4 h-4 text-emerald-500" />
          My Reservation & Access
        </button>

        <button
          onClick={() => setActivePortalTab('requests')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition relative ${
            activePortalTab === 'requests'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          Special Requests & Butler
          {currentReservation.specialRequests && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          )}
        </button>

        <button
          onClick={() => setActivePortalTab('recommendations')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activePortalTab === 'recommendations'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Compass className="w-4 h-4 text-blue-500" />
          Local Area Recommendations ({ATTRACTIONS_DIRECTORY.length})
        </button>

        <button
          onClick={() => setActivePortalTab('concierge')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activePortalTab === 'concierge'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Phone className="w-4 h-4 text-emerald-600" />
          Direct Front Desk & Transfers
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: RESERVATION & ACCESS DETAILS                                       */}
      {/* ========================================================================= */}
      {activePortalTab === 'stay' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Room Credentials & Digital Key */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
                <Key className="w-4 h-4 text-emerald-600" />
                Suite Access & Keyless PIN
              </h3>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Suite Electronic Door Code</span>
                  <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    Active on Arrival
                  </span>
                </div>
                <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200">
                  <span className="text-xl font-mono font-bold tracking-widest text-slate-900">
                    {roomPinCode}
                  </span>
                  <button
                    onClick={() => handleCopyPin(roomPinCode)}
                    className="p-1.5 text-slate-500 hover:text-emerald-700 rounded transition"
                    title="Copy PIN"
                  >
                    {copiedPin ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Enter PIN followed by # on the digital touchpad outside Suite {currentReservation.roomNumber}.
                </p>
              </div>

              {/* Wi-Fi Credentials */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 flex items-center gap-1.5 font-semibold">
                    <Wifi className="w-3.5 h-3.5 text-blue-600" />
                    High-Speed Fibre Wi-Fi
                  </span>
                  <span className="text-[10px] text-blue-700 font-bold bg-blue-100 px-2 py-0.5 rounded">
                    Uncapped 200Mbps
                  </span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">SSID:</span>
                    <strong className="text-slate-800">TidesExclusive_Guest5G</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Password:</span>
                    <strong className="font-mono text-emerald-700">LagoonView2026!</strong>
                  </div>
                </div>
                <button
                  onClick={handleCopyWifi}
                  className="w-full py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 flex items-center justify-center gap-1.5 transition"
                >
                  {copiedWifi ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      Copied Credentials!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      Copy Wi-Fi Password
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Check-In / Check-Out Timings */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3 text-xs">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                Operational Hours & Procedures
              </h3>
              <div className="space-y-2 text-slate-600">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="font-semibold text-slate-700">Standard Check-In:</span>
                  <span>14:00 - 20:00</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="font-semibold text-slate-700">Standard Check-Out:</span>
                  <span>10:30</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="font-semibold text-slate-700">Artisanal Breakfast:</span>
                  <span>07:30 - 10:30 (Dining Deck)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="font-semibold text-slate-700">Evening Sundowner Bar:</span>
                  <span>17:00 - 20:30 (Lagoon Lounge)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Two Columns: Reservation Accounting & Itinerary */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
                <div>
                  <h3 className="font-serif-luxury font-bold text-slate-900 text-base">
                    Stay Accounting & Settlement Summary
                  </h3>
                  <p className="text-xs text-slate-500">Official reservation cost and breakage guarantee deposit.</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  currentReservation.paymentStatus === 'Paid'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  Payment: {currentReservation.paymentStatus}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Suite Rate / Night</span>
                  <span className="text-sm font-bold text-slate-900">R {currentReservation.ratePerNightPerPerson.toLocaleString()}</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Per Person Sharing</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Nights</span>
                  <span className="text-sm font-bold text-slate-900">{currentReservation.totalNights} Nights</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">{currentReservation.numberOfGuests} Guests</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Accommodation</span>
                  <span className="text-sm font-bold text-emerald-700">R {currentReservation.totalRoomCost.toLocaleString()}</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Method: {currentReservation.paymentMethod}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Breakage Deposit</span>
                  <span className="text-sm font-bold text-slate-900">R {currentReservation.breakageDepositAmount.toLocaleString()}</span>
                  <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
                    {currentReservation.breakageDepositStatus}
                  </span>
                </div>
              </div>

              {/* Guest Profile & Contact Info on Record */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Primary Guest Contact Record
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Email Address</span>
                    <span className="font-medium text-slate-800">{currentReservation.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Phone Number</span>
                    <span className="font-medium text-slate-800">{currentReservation.contactNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Passport / ID Reference</span>
                    <span className="font-medium text-slate-800 font-mono">{currentReservation.idOrPassportNumber}</span>
                  </div>
                </div>
              </div>

              {/* Notes or Special Travel Requirements */}
              {(currentReservation.specialTravelRequirements || currentReservation.notes) && (
                <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 text-xs text-blue-900 space-y-1">
                  <h4 className="font-bold flex items-center gap-1.5 text-blue-800">
                    <Info className="w-3.5 h-3.5 text-blue-600" />
                    Special Travel & Transfer Arrangements
                  </h4>
                  {currentReservation.specialTravelRequirements && (
                    <p className="leading-relaxed">{currentReservation.specialTravelRequirements}</p>
                  )}
                  {currentReservation.notes && (
                    <p className="text-slate-600 italic text-[11px] mt-1">Note: {currentReservation.notes}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SPECIAL REQUESTS & BUTLER FORM                                     */}
      {/* ========================================================================= */}
      {activePortalTab === 'requests' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Submit New Request Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-serif-luxury font-bold text-slate-900 text-base flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  Request Bespoke Amenities & Concierge Services
                </h3>
                <p className="text-xs text-slate-500">
                  Our front-of-house team will prepare your suite according to your specific preferences.
                </p>
              </div>

              {requestSubmittedSuccess && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-fade-in font-medium">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Your request has been delivered to Head of Concierge Eleanor Sterling and added to your file.</span>
                </div>
              )}

              <form onSubmit={handleSubmitSpecialRequest} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Category of Request
                  </label>
                  <select
                    value={newRequestType}
                    onChange={(e) => setNewRequestType(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="Champagne & Refreshments">Moët / Cap Classique Champagne on Ice</option>
                    <option value="Airport Transfer & Shuttles">VIP Airport Shuttle (George GRJ / Plett Airport)</option>
                    <option value="Dietary & Dining Preferences">Dietary Requirements (Vegan, Gluten-Free, Halal, Kosher)</option>
                    <option value="Pillow & Bedding Menu">Pillow Menu (Firm Down, Soft Memory Foam, Lavender Aroma)</option>
                    <option value="Celebration & Anniversary Surprise">Anniversary / Birthday Room Turndown & Flowers</option>
                    <option value="Lagoon Excursion Concierge">Knysna Oyster Tasting & Private Catamaran</option>
                    <option value="Housekeeping & Timing">Late Check-Out / Early Luggage Drop-off</option>
                    <option value="Other Bespoke Request">Other Special Requirement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Request Details & Special Instructions <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={newRequestDetails}
                    onChange={(e) => setNewRequestDetails(e.target.value)}
                    placeholder="e.g. Please arrange a bottle of chilled Cap Classique with artisanal cheese platter at 17:30 on our private sunset deck..."
                    className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none placeholder:text-slate-400"
                    required
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-slate-500">
                    Concierge response guaranteed within 60 minutes.
                  </span>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Submit Request to Butler
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Existing Requests On File */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
                <FileText className="w-4 h-4 text-emerald-600" />
                Current Requests on Record
              </h3>

              {currentReservation.specialRequests ? (
                <div className="space-y-2">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                    {currentReservation.specialRequests}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Registered with Duty Manager Eleanor Sterling</span>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-slate-400 text-xs space-y-1 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <Sparkles className="w-6 h-6 mx-auto text-slate-300 mb-1" />
                  <p className="font-semibold text-slate-600">No requests submitted yet</p>
                  <p className="text-[11px]">Use the form on the left to request amenities or airport transfers.</p>
                </div>
              )}
            </div>

            {/* Quick Contact Card */}
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-5 rounded-2xl space-y-3">
              <h4 className="font-serif-luxury font-bold text-xs uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                Urgent Assistance
              </h4>
              <p className="text-xs text-slate-300">
                Arriving in the next 2 hours or require immediate assistance?
              </p>
              <div className="pt-1">
                <a
                  href={`tel:${GUEST_HOUSE_INFO.mobile}`}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Call Butler Direct: {GUEST_HOUSE_INFO.mobile}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: LOCAL AREA RECOMMENDATIONS DIRECTORY                               */}
      {/* ========================================================================= */}
      {activePortalTab === 'recommendations' && (
        <div className="space-y-6">
          {/* Search & Filter Header */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-serif-luxury font-bold text-slate-900 text-base">
                  Curated Knysna & Garden Route Directory
                </h3>
                <p className="text-xs text-slate-500">
                  Exclusive guest recommendations handpicked by the Tides of Knysna concierge.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search dining, tours, wines..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-emerald-600 text-white font-bold shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {bookingRequestSent && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-fade-in font-medium">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Excursion request added to your booking! Our concierge will arrange reservations on your behalf.</span>
            </div>
          )}

          {/* Recommendations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAttractions.map(item => {
              const isAlreadyRequested = currentReservation.nearbySightseeingInterests?.includes(item.name);

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                        {item.category}
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {item.distanceFromGuestHouse}
                      </span>
                    </div>

                    <h4 className="font-serif-luxury font-bold text-slate-900 text-base leading-snug">
                      {item.name}
                    </h4>

                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {item.description}
                    </p>

                    {item.highlights && item.highlights.length > 0 && (
                      <div className="pt-1 flex flex-wrap gap-1">
                        {item.highlights.slice(0, 3).map((h, i) => (
                          <span key={i} className="text-[10px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded border border-slate-100">
                            • {h}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1 truncate max-w-[170px]">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {item.contactNumber}
                      </span>

                      {item.website && (
                        <a
                          href={item.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1 text-[11px]"
                        >
                          Visit Site
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    <button
                      onClick={() => handleRequestExcursion(item)}
                      disabled={isAlreadyRequested || bookingRequestSent === item.id}
                      className={`w-full py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        isAlreadyRequested
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 cursor-default'
                          : 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm'
                      }`}
                    >
                      {isAlreadyRequested ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          Concierge Arranging
                        </>
                      ) : (
                        <>
                          <BookmarkPlus className="w-3.5 h-3.5 text-emerald-400" />
                          Request Concierge Booking
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: DIRECT FRONT DESK & TRANSFERS                                      */}
      {/* ========================================================================= */}
      {activePortalTab === 'concierge' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="font-serif-luxury font-bold text-slate-900 text-base flex items-center gap-2 border-b border-slate-100 pb-3">
              <Phone className="w-4 h-4 text-emerald-600" />
              Direct Front Desk & Operations Contact
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Front Desk Landline</span>
                <span className="text-sm font-bold text-slate-900">{GUEST_HOUSE_INFO.telephone}</span>
                <p className="text-[11px] text-slate-500 mt-0.5">Available 07:00 - 22:00 daily.</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Duty Manager Mobile & WhatsApp</span>
                <span className="text-sm font-bold text-emerald-700">{GUEST_HOUSE_INFO.mobile}</span>
                <p className="text-[11px] text-slate-500 mt-0.5">24/7 on-call for arrivals and guest emergencies.</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Concierge Email</span>
                <span className="text-sm font-bold text-slate-900">{GUEST_HOUSE_INFO.email}</span>
                <p className="text-[11px] text-slate-500 mt-0.5">For formal travel itineraries and special dietary sheets.</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">GPS Coordinates</span>
                <span className="text-sm font-bold text-slate-900">-34.0354° S, 23.0465° E</span>
                <p className="text-[11px] text-slate-500 mt-0.5">{GUEST_HOUSE_INFO.address}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="font-serif-luxury font-bold text-slate-900 text-base flex items-center gap-2 border-b border-slate-100 pb-3">
              <Car className="w-4 h-4 text-blue-600" />
              Airport Transfers & Private Shuttles
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              We provide luxury, private door-to-door transfers connecting directly to George Airport (GRJ - 65 km / 50 min) and Plettenberg Bay Airport (PBZ - 32 km / 30 min).
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 text-emerald-900 flex items-center justify-between">
                <div>
                  <strong className="block">George Airport (GRJ) Transfer</strong>
                  <span className="text-[11px] text-emerald-700">Mercedes-Benz V-Class (Up to 6 guests)</span>
                </div>
                <span className="font-bold text-sm">R 1,250</span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 text-emerald-900 flex items-center justify-between">
                <div>
                  <strong className="block">Plettenberg Bay Airport (PBZ)</strong>
                  <span className="text-[11px] text-emerald-700">Luxury Executive Sedan (Up to 3 guests)</span>
                </div>
                <span className="font-bold text-sm">R 850</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setActivePortalTab('requests');
                  setNewRequestType('Airport Transfer & Shuttles');
                  setNewRequestDetails('Please arrange private airport transfer from George Airport (GRJ). Flight details: [Insert flight number & arrival time].');
                }}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Car className="w-3.5 h-3.5 text-emerald-400" />
                Book Airport Transfer Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
