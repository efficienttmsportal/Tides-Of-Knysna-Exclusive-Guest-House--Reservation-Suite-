import React, { useState, useEffect } from 'react';
import { 
  Key, 
  Bluetooth, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Bell, 
  Wrench, 
  Star, 
  CheckCircle, 
  AlertTriangle, 
  Radio, 
  Clock, 
  Sparkles, 
  Plus, 
  Check, 
  Smartphone, 
  Send,
  PenTool
} from 'lucide-react';
import { Reservation } from '../types';
import { DigitalSignatureBlock, SignatureData } from './DigitalSignatureBlock';

export interface MaintenanceTicket {
  id: string;
  reservationId: string;
  roomNumber: string;
  category: 'Air Conditioning' | 'Plumbing & Hot Water' | 'Lighting & Electrical' | 'Wi-Fi & Entertainment' | 'Housekeeping & Linens' | 'General';
  description: string;
  priority: 'Normal' | 'Urgent';
  status: 'Open' | 'Dispatched' | 'Resolved';
  timestamp: string;
}

export interface GuestSurveyResult {
  id: string;
  reservationNumber: string;
  guestName: string;
  roomNumber: string;
  cleanlinessScore: number;
  amenitiesScore: number;
  staffScore: number;
  overallScore: number;
  comments: string;
  timestamp: string;
  signature?: SignatureData;
}

interface DigitalRoomAccessProps {
  reservation: Reservation;
  onUpdateReservation?: (updated: Reservation) => void;
}

const TICKETS_KEY = 'tok_guest_maintenance_tickets_v1';
const SURVEYS_KEY = 'tok_guest_surveys_aggregate_v1';

export const DigitalRoomAccess: React.FC<DigitalRoomAccessProps> = ({
  reservation,
  onUpdateReservation
}) => {
  // Access authorization status
  const [accessStatus, setAccessStatus] = useState<'pending' | 'requested' | 'authorized'>(() => {
    return reservation.paymentStatus === 'Paid' || !!reservation.roomNumber ? 'authorized' : 'pending';
  });

  const [notificationSent, setNotificationSent] = useState(false);

  // BLE unlock simulation state
  const [bleState, setBleState] = useState<'idle' | 'scanning' | 'handshake' | 'unlocked' | 'error'>('idle');
  const [lockCountdown, setLockCountdown] = useState<number>(0);
  const [rssi, setRssi] = useState<number>(-62);

  // Maintenance ticketing state
  const [tickets, setTickets] = useState<MaintenanceTicket[]>(() => {
    try {
      const saved = localStorage.getItem(TICKETS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    return [
      {
        id: 'tic-101',
        reservationId: reservation.id,
        roomNumber: reservation.roomNumber,
        category: 'Housekeeping & Linens',
        description: 'Extra hypoallergenic feather-free pillows requested for king bed.',
        priority: 'Normal',
        status: 'Dispatched',
        timestamp: '2026-09-28 09:30'
      }
    ];
  });

  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [ticketCategory, setTicketCategory] = useState<MaintenanceTicket['category']>('Air Conditioning');
  const [ticketDescription, setTicketDescription] = useState('');
  const [ticketPriority, setTicketPriority] = useState<'Normal' | 'Urgent'>('Normal');
  const [ticketSuccessNotice, setTicketSuccessNotice] = useState(false);

  // Guest satisfaction survey state
  const [cleanlinessScore, setCleanlinessScore] = useState(5);
  const [amenitiesScore, setAmenitiesScore] = useState(5);
  const [staffScore, setStaffScore] = useState(5);
  const [surveyComments, setSurveyComments] = useState('');
  const [surveySignature, setSurveySignature] = useState<SignatureData | null>(null);
  const [surveySubmitted, setSurveySubmitted] = useState(false);

  // BLE Unlock sequence simulation
  const handleTriggerBleUnlock = () => {
    if (accessStatus !== 'authorized') {
      alert('Digital Key access is pending front desk authorization. Please tap "Request Key Access" first.');
      return;
    }

    setBleState('scanning');
    setRssi(-54);

    // Sequence 1: Scanning for door lock beacon
    setTimeout(() => {
      setBleState('handshake');
      
      // Sequence 2: 256-bit AES Token exchange
      setTimeout(() => {
        setBleState('unlocked');
        setLockCountdown(8);

        // Optional haptic vibration
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate([100, 50, 100]);
        }
      }, 1400);
    }, 1200);
  };

  // Auto relock countdown
  useEffect(() => {
    if (bleState === 'unlocked' && lockCountdown > 0) {
      const timer = setInterval(() => {
        setLockCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setBleState('idle');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [bleState, lockCountdown]);

  // Request Key Access to Front Desk
  const handleRequestKeyAccess = () => {
    setNotificationSent(true);
    setAccessStatus('requested');

    // Simulate front desk automated verification
    setTimeout(() => {
      setAccessStatus('authorized');
      setNotificationSent(false);
    }, 2800);
  };

  // Submit maintenance ticket
  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketDescription.trim()) return;

    const newTicket: MaintenanceTicket = {
      id: `tic-${Date.now().toString().slice(-4)}`,
      reservationId: reservation.id,
      roomNumber: reservation.roomNumber,
      category: ticketCategory,
      description: ticketDescription.trim(),
      priority: ticketPriority,
      status: 'Open',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };

    const updated = [newTicket, ...tickets];
    setTickets(updated);
    try {
      localStorage.setItem(TICKETS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }

    setTicketDescription('');
    setShowNewTicketModal(false);
    setTicketSuccessNotice(true);
    setTimeout(() => setTicketSuccessNotice(false), 4000);
  };

  // Submit Guest Satisfaction Survey
  const handleSubmitSurvey = (e: React.FormEvent) => {
    e.preventDefault();
    const overall = Number(((cleanlinessScore + amenitiesScore + staffScore) / 3).toFixed(1));

    const survey: GuestSurveyResult = {
      id: `srv-${Date.now()}`,
      reservationNumber: reservation.reservationNumber,
      guestName: `${reservation.customerName} ${reservation.customerSurname}`,
      roomNumber: reservation.roomNumber,
      cleanlinessScore,
      amenitiesScore,
      staffScore,
      overallScore: overall,
      comments: surveyComments.trim() || 'Exceptional 5-star experience!',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      signature: surveySignature || undefined
    };

    try {
      const existingStr = localStorage.getItem(SURVEYS_KEY);
      const existing: GuestSurveyResult[] = existingStr ? JSON.parse(existingStr) : [];
      const updated = [survey, ...existing];
      localStorage.setItem(SURVEYS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }

    setSurveySubmitted(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Digital Room Access & Mobile Key */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border-b border-slate-100 pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                <Smartphone className="w-5 h-5" />
              </span>
              <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-800">
                Digital Mobile Key Access
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500 font-mono">Room {reservation.roomNumber}</span>
            </div>
            <h2 className="text-xl md:text-2xl font-serif-luxury font-bold text-slate-900">
              {reservation.roomAllocation}
            </h2>
            <p className="text-xs text-slate-500">
              Touchless Bluetooth Low Energy (BLE) mobile room entry & instant engineering concierge.
            </p>
          </div>

          {/* Authorization Status Badge */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Lock Authorization</span>
              <strong className={`text-xs ${
                accessStatus === 'authorized' ? 'text-emerald-700' :
                accessStatus === 'requested' ? 'text-amber-600' :
                'text-slate-600'
              }`}>
                {accessStatus === 'authorized' ? 'Access Granted & Active' :
                 accessStatus === 'requested' ? 'Authorizing with Front Desk...' :
                 'Awaiting Activation'}
              </strong>
            </div>

            {accessStatus === 'authorized' ? (
              <span className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl border border-emerald-200 flex items-center gap-2">
                <ShieldCheck className="w-6 h-6" />
              </span>
            ) : accessStatus === 'requested' ? (
              <span className="p-3 bg-amber-100 text-amber-700 rounded-2xl border border-amber-200 animate-pulse flex items-center gap-2">
                <Radio className="w-6 h-6" />
              </span>
            ) : (
              <button
                onClick={handleRequestKeyAccess}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs"
              >
                <Bell className="w-4 h-4" /> Request Key Access
              </button>
            )}
          </div>
        </div>

        {/* Status notification toast */}
        {notificationSent && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2 animate-fade-in">
            <Radio className="w-4 h-4 text-amber-600 animate-spin" />
            <span>
              Secure push notification dispatched to Front Desk terminal. Authenticating biometric token...
            </span>
          </div>
        )}

        {/* Interactive BLE Door Lock Pad */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Mobile Key Card Interface */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden border border-slate-700">
            {/* Background design elements */}
            <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
              <Key className="w-40 h-40 text-emerald-400" />
            </div>

            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bluetooth className={`w-5 h-5 ${bleState !== 'idle' ? 'text-blue-400 animate-pulse' : 'text-slate-400'}`} />
                  <span className="text-xs font-mono tracking-wider text-slate-300">BLE 5.3 ENCRYPTED</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-emerald-300 border border-emerald-400/30">
                  RSSI: {rssi} dBm
                </span>
              </div>

              <div className="text-center py-2 space-y-2">
                <div className="text-3xl font-mono font-bold tracking-widest text-emerald-400">
                  SUITE {reservation.roomNumber}
                </div>
                <p className="text-xs text-slate-300">
                  {bleState === 'scanning' ? 'Discovering Door Lock Beacon...' :
                   bleState === 'handshake' ? 'Verifying 256-bit AES Token...' :
                   bleState === 'unlocked' ? 'DOOR UNLOCKED • PULL HANDLE' :
                   'Hold device within 1 meter of door lock'}
                </p>
              </div>

              {/* Main Interactive Button */}
              <div className="flex flex-col items-center justify-center">
                <button
                  onClick={handleTriggerBleUnlock}
                  disabled={bleState === 'scanning' || bleState === 'handshake'}
                  className={`w-full py-4 rounded-2xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-3 shadow-lg active:scale-95 ${
                    bleState === 'unlocked'
                      ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-400/50'
                      : bleState === 'scanning' || bleState === 'handshake'
                      ? 'bg-blue-600 text-white cursor-wait animate-pulse'
                      : accessStatus !== 'authorized'
                      ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:shadow-emerald-600/30'
                  }`}
                >
                  {bleState === 'unlocked' ? (
                    <>
                      <Unlock className="w-5 h-5 text-slate-950 animate-bounce" />
                      UNLOCKED ({lockCountdown}s auto-lock)
                    </>
                  ) : bleState === 'scanning' ? (
                    <>
                      <Radio className="w-5 h-5 text-white animate-spin" />
                      Scanning Lock Beacon...
                    </>
                  ) : bleState === 'handshake' ? (
                    <>
                      <ShieldCheck className="w-5 h-5 text-white animate-pulse" />
                      Security Handshake...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      Tap to Unlock Suite Door (BLE)
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-700/60">
                <span>Lock ID: KNYSNA-LK-{reservation.roomNumber}</span>
                <span>Token Expiry: {reservation.checkOutDate}</span>
              </div>
            </div>
          </div>

          {/* Access Instructions & Backup PIN */}
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                How Touchless Mobile Key Works
              </h4>
              <p className="text-slate-600 leading-relaxed">
                When within range of Suite {reservation.roomNumber}, tap the unlock button above. Your phone transmits a hardware-verified rolling cryptographic handshake over Bluetooth Low Energy.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Physical Keypad Backup PIN</span>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                  24/7 Active
                </span>
              </div>
              <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
                <span className="font-mono text-lg font-bold text-slate-900 tracking-wider">
                  *{reservation.roomNumber}{reservation.customerSurname.length}7#
                </span>
                <span className="text-[11px] text-slate-500">Keypad entry code</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Maintenance Ticketing & Engineering Concierge */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-2 bg-blue-100 text-blue-800 rounded-xl">
                <Wrench className="w-5 h-5" />
              </span>
              <h3 className="font-bold text-slate-900 text-base">In-Suite Maintenance & Service Requests</h3>
            </div>
            <p className="text-xs text-slate-500">
              Need assistance with air conditioning, lighting, hot water, or linens? Log a ticket directly with engineering.
            </p>
          </div>

          <button
            onClick={() => setShowNewTicketModal(true)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" /> Report Issue / Request Service
          </button>
        </div>

        {ticketSuccessNotice && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Service request dispatched! An engineering specialist has been alerted to Suite {reservation.roomNumber}.</span>
          </div>
        )}

        {/* Existing Tickets List */}
        <div className="space-y-3">
          {tickets.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No active maintenance tickets for Suite {reservation.roomNumber}.
            </div>
          ) : (
            tickets.map((t) => (
              <div 
                key={t.id} 
                className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{t.category}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      t.priority === 'Urgent' ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {t.priority}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500">{t.timestamp}</span>
                  </div>
                  <p className="text-slate-600">{t.description}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 border ${
                    t.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                    t.status === 'Dispatched' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                    'bg-amber-100 text-amber-800 border-amber-200'
                  }`}>
                    {t.status === 'Resolved' ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {t.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Guest Satisfaction Survey & Digital Signature Review Widget */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 bg-amber-100 text-amber-800 rounded-xl">
              <Star className="w-5 h-5" />
            </span>
            <h3 className="font-bold text-slate-900 text-base">Guest Satisfaction Survey & Experience Review</h3>
          </div>
          <p className="text-xs text-slate-500">
            Rate your stay and authenticate your review with your digital signature. Aggregate feedback is reviewed directly by the General Manager.
          </p>
        </div>

        {surveySubmitted ? (
          <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2">
            <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-emerald-900 text-base">Thank You for Your Feedback!</h4>
            <p className="text-xs text-emerald-700 max-w-md mx-auto">
              Your scores for cleanliness, amenities, and staff helpfulness have been recorded with your verified digital signature.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmitSurvey} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Room Cleanliness */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-center">
                <span className="text-xs font-bold text-slate-700 block">Room Cleanliness</span>
                <div className="flex items-center justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setCleanlinessScore(star)}
                      className={`p-1.5 transition ${star <= cleanlinessScore ? 'text-amber-500 scale-110' : 'text-slate-300 hover:text-slate-400'}`}
                    >
                      <Star className="w-5 h-5 fill-current" />
                    </button>
                  ))}
                </div>
                <span className="text-[11px] text-slate-500 font-bold block">{cleanlinessScore} of 5 Stars</span>
              </div>

              {/* Amenities & Comfort */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-center">
                <span className="text-xs font-bold text-slate-700 block">Amenities & Comfort</span>
                <div className="flex items-center justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setAmenitiesScore(star)}
                      className={`p-1.5 transition ${star <= amenitiesScore ? 'text-amber-500 scale-110' : 'text-slate-300 hover:text-slate-400'}`}
                    >
                      <Star className="w-5 h-5 fill-current" />
                    </button>
                  ))}
                </div>
                <span className="text-[11px] text-slate-500 font-bold block">{amenitiesScore} of 5 Stars</span>
              </div>

              {/* Staff Helpfulness */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-center">
                <span className="text-xs font-bold text-slate-700 block">Staff Helpfulness</span>
                <div className="flex items-center justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setStaffScore(star)}
                      className={`p-1.5 transition ${star <= staffScore ? 'text-amber-500 scale-110' : 'text-slate-300 hover:text-slate-400'}`}
                    >
                      <Star className="w-5 h-5 fill-current" />
                    </button>
                  ))}
                </div>
                <span className="text-[11px] text-slate-500 font-bold block">{staffScore} of 5 Stars</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Comments, Suggestions, or Staff Commendations
              </label>
              <textarea
                rows={3}
                value={surveyComments}
                onChange={(e) => setSurveyComments(e.target.value)}
                placeholder="Share your thoughts on your stay, breakfast, or concierge recommendations..."
                className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            {/* Embedded Digital Signature Block for the Survey */}
            <div>
              <DigitalSignatureBlock
                title="Guest Verification Signature"
                signerRole="Guest Signatory"
                signerName={`${reservation.customerName} ${reservation.customerSurname}`}
                onSave={(sig) => setSurveySignature(sig)}
                initialSignature={surveySignature}
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
              >
                <Send className="w-4 h-4" /> Submit Survey & Signed Review
              </button>
            </div>
          </form>
        )}
      </div>

      {/* New Maintenance Ticket Modal */}
      {showNewTicketModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateTicket} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Wrench className="w-4 h-4 text-emerald-600" />
                Report Maintenance / Request Service
              </h4>
              <button
                type="button"
                onClick={() => setShowNewTicketModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Issue Category</label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                >
                  <option value="Air Conditioning">Air Conditioning & Climate</option>
                  <option value="Plumbing & Hot Water">Plumbing & Hot Water</option>
                  <option value="Lighting & Electrical">Lighting & Electrical</option>
                  <option value="Wi-Fi & Entertainment">Wi-Fi & Entertainment</option>
                  <option value="Housekeeping & Linens">Housekeeping & Extra Linens</option>
                  <option value="General">General In-Suite Assistance</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Priority</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTicketPriority('Normal')}
                    className={`py-2 rounded-xl font-bold border transition ${
                      ticketPriority === 'Normal' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Normal Service
                  </button>
                  <button
                    type="button"
                    onClick={() => setTicketPriority('Urgent')}
                    className={`py-2 rounded-xl font-bold border transition ${
                      ticketPriority === 'Urgent' ? 'bg-rose-600 text-white' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Urgent / Priority
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={ticketDescription}
                  onChange={(e) => setTicketDescription(e.target.value)}
                  placeholder="Please describe the issue in detail..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowNewTicketModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition flex items-center gap-1.5 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" /> Dispatch Ticket
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
