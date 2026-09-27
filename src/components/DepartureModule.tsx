import React, { useState } from 'react';
import { 
  LogOut, 
  Key, 
  ShieldCheck, 
  Star, 
  Car, 
  Mail, 
  FileCheck, 
  CheckCircle, 
  AlertTriangle, 
  Check, 
  DollarSign, 
  Sparkles 
} from 'lucide-react';
import { DocumentActionBar } from './DocumentActionBar';
import { DepartureRecord, Reservation } from '../types';
import { GUEST_HOUSE_INFO } from '../data/initialData';

interface DepartureModuleProps {
  reservations: Reservation[];
}

export const DepartureModule: React.FC<DepartureModuleProps> = ({ reservations }) => {
  const [departures, setDepartures] = useState<DepartureRecord[]>([
    {
      id: "dep-001",
      reservationId: reservations[0]?.id || "res-001",
      guestName: "Julian Vanderbilt",
      roomNumber: "102",
      departureDateTime: "2026-09-29 11:00",
      keysReturned: true,
      roomInspectionDone: true,
      roomCondition: "Excellent",
      breakageDepositRefundAmount: 3500,
      breakageDepositRefunded: true,
      minibarSettled: true,
      invoiceEmailedToGuest: true,
      guestFeedbackRating: 5,
      feedbackComments: "Spectacular stay! The sunset lagoon cruise and attentive hospitality by Eleanor were beyond world-class. We will certainly return.",
      shuttleOrTaxiArranged: true,
      inspectingStaff: "Miriam Zulu & Dave Henderson"
    }
  ]);

  const [activeDep, setActiveDep] = useState<DepartureRecord>(departures[0]);
  const [isEditing, setIsEditing] = useState(false);

  const handleStartNewDeparture = (res: Reservation) => {
    const newRecord: DepartureRecord = {
      id: `dep-${Date.now()}`,
      reservationId: res.id,
      guestName: `${res.customerName} ${res.customerSurname}`,
      roomNumber: res.roomNumber,
      departureDateTime: `${res.checkOutDate} 10:30`,
      keysReturned: false,
      roomInspectionDone: false,
      roomCondition: 'Excellent',
      breakageDepositRefundAmount: res.breakageDepositAmount || 2500,
      breakageDepositRefunded: false,
      minibarSettled: false,
      invoiceEmailedToGuest: false,
      guestFeedbackRating: 5,
      feedbackComments: 'Delightful getaway on the Knysna lagoon.',
      shuttleOrTaxiArranged: true,
      inspectingStaff: 'Miriam Zulu'
    };
    setDepartures([newRecord, ...departures]);
    setActiveDep(newRecord);
    setIsEditing(true);
  };

  const handleToggle = (field: keyof DepartureRecord) => {
    if (!activeDep) return;
    const updated = {
      ...activeDep,
      [field]: !activeDep[field]
    };
    setActiveDep(updated);
    setDepartures(departures.map(d => d.id === updated.id ? updated : d));
  };

  return (
    <div className="space-y-6">
      <DocumentActionBar
        documentTitle={`Departure & Inspection Clearance - Suite ${activeDep?.roomNumber || '102'}`}
        documentNumber={activeDep?.id}
        onSave={() => alert('Departure checklist and deposit clearance recorded.')}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Departures list & Queue (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-4 no-print">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Departure & Inspection Queue</h3>
            <p className="text-[11px] text-slate-500">Manage suite signoff, deposit releases, and guest transport</p>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
            <span className="text-[11px] font-bold text-amber-900 block mb-1 uppercase tracking-wider">
              Pending Departures from Bookings:
            </span>
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {reservations.map(res => (
                <button
                  key={res.id}
                  onClick={() => handleStartNewDeparture(res)}
                  className="w-full text-left p-1.5 bg-white hover:bg-amber-100 rounded text-xs flex items-center justify-between border border-amber-100 transition"
                >
                  <span className="font-semibold text-slate-800">{res.customerName} {res.customerSurname}</span>
                  <span className="text-[10px] bg-slate-900 text-white px-1.5 py-0.5 rounded font-mono">
                    Out: {res.checkOutDate}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 max-h-[460px] overflow-y-auto">
            {departures.map(dep => {
              const isSelected = dep.id === activeDep?.id;
              return (
                <div
                  key={dep.id}
                  onClick={() => {
                    setActiveDep(dep);
                    setIsEditing(false);
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition ${
                    isSelected
                      ? 'bg-amber-50/80 border-amber-400 shadow-xs'
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-900">{dep.guestName}</span>
                    <span className="text-[10px] font-bold bg-slate-900 text-white px-2 py-0.5 rounded">
                      Suite {dep.roomNumber}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center justify-between">
                    <span>{dep.departureDateTime}</span>
                    <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                      dep.breakageDepositRefunded ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {dep.breakageDepositRefunded ? 'Deposit Cleared' : 'Pending Clearance'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Departure Checklist (8 cols) */}
        {activeDep && (
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6 printable-area">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
              <div>
                <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  Suite {activeDep.roomNumber} Departure Clearance
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-1">
                  Guest Departure: {activeDep.guestName}
                </h2>
                <div className="text-xs text-slate-500">
                  Scheduled Check-out: {activeDep.departureDateTime} | Inspecting Staff: {activeDep.inspectingStaff}
                </div>
              </div>

              <div className="flex items-center gap-2 no-print">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg border"
                >
                  {isEditing ? 'Save Changes' : 'Edit Inspection'}
                </button>
              </div>
            </div>

            {/* Departure Inspection Checklist Grid */}
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                Comprehensive Room Inspection & Handover Checklist
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* 1. Keys returned */}
                <div 
                  onClick={() => handleToggle('keysReturned')}
                  className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    activeDep.keysReturned ? 'bg-emerald-50/70 border-emerald-300' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Key className={`w-4 h-4 ${activeDep.keysReturned ? 'text-emerald-700' : 'text-slate-400'}`} />
                    <div>
                      <div className="font-bold text-slate-900">1. All Room Keys & Remotes Returned</div>
                      <div className="text-[11px] text-slate-500">Suite master keys and lagoon gate cards handed back</div>
                    </div>
                  </div>
                  <input type="checkbox" checked={activeDep.keysReturned} readOnly className="rounded text-emerald-600 focus:ring-emerald-500" />
                </div>

                {/* 2. Room inspection done */}
                <div 
                  onClick={() => handleToggle('roomInspectionDone')}
                  className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    activeDep.roomInspectionDone ? 'bg-emerald-50/70 border-emerald-300' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className={`w-4 h-4 ${activeDep.roomInspectionDone ? 'text-emerald-700' : 'text-slate-400'}`} />
                    <div>
                      <div className="font-bold text-slate-900">2. Physical Room Inspection Completed</div>
                      <div className="text-[11px] text-slate-500">Linens, furniture, fixtures, and spa bath checked</div>
                    </div>
                  </div>
                  <input type="checkbox" checked={activeDep.roomInspectionDone} readOnly className="rounded text-emerald-600 focus:ring-emerald-500" />
                </div>

                {/* 3. Minibar settled */}
                <div 
                  onClick={() => handleToggle('minibarSettled')}
                  className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    activeDep.minibarSettled ? 'bg-emerald-50/70 border-emerald-300' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <DollarSign className={`w-4 h-4 ${activeDep.minibarSettled ? 'text-emerald-700' : 'text-slate-400'}`} />
                    <div>
                      <div className="font-bold text-slate-900">3. Minibar & Refreshments Settled</div>
                      <div className="text-[11px] text-slate-500">Wine, Cap Classique, and artisanal snacks tallied</div>
                    </div>
                  </div>
                  <input type="checkbox" checked={activeDep.minibarSettled} readOnly className="rounded text-emerald-600 focus:ring-emerald-500" />
                </div>

                {/* 4. Invoice emailed */}
                <div 
                  onClick={() => handleToggle('invoiceEmailedToGuest')}
                  className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    activeDep.invoiceEmailedToGuest ? 'bg-emerald-50/70 border-emerald-300' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Mail className={`w-4 h-4 ${activeDep.invoiceEmailedToGuest ? 'text-emerald-700' : 'text-slate-400'}`} />
                    <div>
                      <div className="font-bold text-slate-900">4. Final Invoice & Statement Emailed</div>
                      <div className="text-[11px] text-slate-500">VAT compliant invoice dispatched to guest</div>
                    </div>
                  </div>
                  <input type="checkbox" checked={activeDep.invoiceEmailedToGuest} readOnly className="rounded text-emerald-600 focus:ring-emerald-500" />
                </div>

                {/* 5. Airport shuttle arranged */}
                <div 
                  onClick={() => handleToggle('shuttleOrTaxiArranged')}
                  className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    activeDep.shuttleOrTaxiArranged ? 'bg-emerald-50/70 border-emerald-300' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Car className={`w-4 h-4 ${activeDep.shuttleOrTaxiArranged ? 'text-emerald-700' : 'text-slate-400'}`} />
                    <div>
                      <div className="font-bold text-slate-900">5. Onward Transport & Shuttle Ready</div>
                      <div className="text-[11px] text-slate-500">Transfer arranged to George or Plett Airport</div>
                    </div>
                  </div>
                  <input type="checkbox" checked={activeDep.shuttleOrTaxiArranged} readOnly className="rounded text-emerald-600 focus:ring-emerald-500" />
                </div>

                {/* 6. Breakage Deposit Refund Status */}
                <div 
                  onClick={() => handleToggle('breakageDepositRefunded')}
                  className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    activeDep.breakageDepositRefunded ? 'bg-emerald-50/70 border-emerald-300' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className={`w-4 h-4 ${activeDep.breakageDepositRefunded ? 'text-emerald-700' : 'text-slate-400'}`} />
                    <div>
                      <div className="font-bold text-slate-900">6. Breakage Deposit Refund Cleared</div>
                      <div className="text-[11px] text-slate-500">
                        Refund: <strong>R {activeDep.breakageDepositRefundAmount}</strong> back to guest account
                      </div>
                    </div>
                  </div>
                  <input type="checkbox" checked={activeDep.breakageDepositRefunded} readOnly className="rounded text-emerald-600 focus:ring-emerald-500" />
                </div>
              </div>
            </div>

            {/* Room Condition & Damages Assessment */}
            <div className="pt-2 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Room Physical Condition Rating
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {(['Excellent', 'Minor Wear', 'Damages Noted'] as const).map(cond => (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => setActiveDep({ ...activeDep, roomCondition: cond })}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                      activeDep.roomCondition === cond
                        ? 'bg-slate-900 text-emerald-300 border-slate-900 shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {cond === 'Excellent' && <Sparkles className="w-3.5 h-3.5 text-emerald-400" />}
                    {cond === 'Damages Noted' && <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
                    {cond}
                  </button>
                ))}
              </div>
            </div>

            {/* Guest Feedback & Rating */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Guest Experience Rating & Review
                </h3>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setActiveDep({ ...activeDep, guestFeedbackRating: star })}
                      className="p-1 hover:scale-110 transition"
                    >
                      <Star className={`w-4 h-4 ${star <= activeDep.guestFeedbackRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-1">({activeDep.guestFeedbackRating}/5 Stars)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Departure Comments / Testimonial</label>
                <textarea
                  rows={3}
                  value={activeDep.feedbackComments}
                  disabled={!isEditing}
                  onChange={(e) => setActiveDep({ ...activeDep, feedbackComments: e.target.value })}
                  className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-50"
                ></textarea>
              </div>
            </div>

            {/* Signoff bar */}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs text-emerald-950">
              <div>
                <div className="font-bold">Departure & Breakage Deposit Status:</div>
                <div className="text-[11px] text-emerald-800">
                  {activeDep.breakageDepositRefunded 
                    ? `Full refund of R ${activeDep.breakageDepositRefundAmount} confirmed & processed.` 
                    : 'Inspection complete; awaiting accounts electronic release.'}
                </div>
              </div>
              <button
                onClick={() => {
                  const updated = {
                    ...activeDep,
                    keysReturned: true,
                    roomInspectionDone: true,
                    minibarSettled: true,
                    invoiceEmailedToGuest: true,
                    breakageDepositRefunded: true
                  };
                  setActiveDep(updated);
                  setDepartures(departures.map(d => d.id === updated.id ? updated : d));
                  alert(`Departure clearance signed off for Suite ${activeDep.roomNumber}! Breakage deposit refunded.`);
                }}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs shadow-sm no-print"
              >
                Sign Off & Release Breakage Deposit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
