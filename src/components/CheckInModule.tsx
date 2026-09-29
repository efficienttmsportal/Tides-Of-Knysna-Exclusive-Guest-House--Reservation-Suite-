import React, { useState } from 'react';
import { 
  CheckSquare, 
  User, 
  Key, 
  ShieldCheck, 
  Wifi, 
  Wine, 
  Luggage, 
  FileCheck, 
  Clock, 
  Plus, 
  Printer, 
  Download,
  AlertCircle
} from 'lucide-react';
import { DocumentActionBar } from './DocumentActionBar';
import { CheckInRecord, Reservation } from '../types';
import { GUEST_HOUSE_INFO } from '../data/initialData';
import { DigitalSignatureBlock, SignatureData } from './DigitalSignatureBlock';

interface CheckInModuleProps {
  reservations: Reservation[];
}

export const CheckInModule: React.FC<CheckInModuleProps> = ({ reservations }) => {
  const [checkIns, setCheckIns] = useState<CheckInRecord[]>([
    {
      id: "chi-001",
      reservationId: reservations[0]?.id || "res-001",
      guestName: "Julian Vanderbilt",
      roomNumber: "102",
      arrivalDateTime: "2026-09-24 14:30",
      allocatedKeys: "Suite 102 Master Key + Lagoon Gate Card",
      welcomeDrinksServed: true,
      passportVerified: true,
      registrationFormSigned: true,
      breakageDepositCollected: true,
      wifiCredentialsProvided: true,
      luggageHandledBy: "Kobus Van Der Merwe",
      emergencyContactNoted: "+44 7700 900382 (Wife: Clara Vanderbilt)",
      dutyManager: "Eleanor Sterling",
      status: "Checked-In"
    },
    {
      id: "chi-002",
      reservationId: reservations[1]?.id || "res-002",
      guestName: "Dr. Anelisa Dlamini",
      roomNumber: "101",
      arrivalDateTime: "2026-09-23 15:00",
      allocatedKeys: "Suite 101 Brass Key",
      welcomeDrinksServed: true,
      passportVerified: true,
      registrationFormSigned: true,
      breakageDepositCollected: true,
      wifiCredentialsProvided: true,
      luggageHandledBy: "Front Desk Staff",
      emergencyContactNoted: "+27 83 452 9988",
      dutyManager: "Eleanor Sterling",
      status: "Checked-In"
    }
  ]);

  const [activeCheckIn, setActiveCheckIn] = useState<CheckInRecord>(checkIns[0]);
  const [isEditing, setIsEditing] = useState(false);

  const handleStartNewCheckIn = (res: Reservation) => {
    const newRecord: CheckInRecord = {
      id: `chi-${Date.now()}`,
      reservationId: res.id,
      guestName: `${res.customerName} ${res.customerSurname}`,
      roomNumber: res.roomNumber,
      arrivalDateTime: `${res.checkInDate} 14:00`,
      allocatedKeys: `Suite ${res.roomNumber} Keycard & Remote`,
      welcomeDrinksServed: false,
      passportVerified: (res.documents || []).some(d => d.type === 'passport' || d.type === 'id_card'),
      registrationFormSigned: false,
      breakageDepositCollected: res.breakageDepositStatus === 'Held',
      wifiCredentialsProvided: false,
      luggageHandledBy: 'Estate Concierge',
      emergencyContactNoted: res.contactNumber,
      dutyManager: GUEST_HOUSE_INFO.salesPerson,
      status: 'In Progress'
    };
    setCheckIns([newRecord, ...checkIns]);
    setActiveCheckIn(newRecord);
    setIsEditing(true);
  };

  const handleToggle = (field: keyof CheckInRecord) => {
    if (!activeCheckIn) return;
    const updated = {
      ...activeCheckIn,
      [field]: !activeCheckIn[field]
    };
    setActiveCheckIn(updated);
    setCheckIns(checkIns.map(c => c.id === updated.id ? updated : c));
  };

  return (
    <div className="space-y-6">
      <DocumentActionBar
        documentTitle={`Digital Check-In Registry - Suite ${activeCheckIn?.roomNumber || '101'}`}
        documentNumber={activeCheckIn?.id}
        onSave={() => alert('Check-In protocol saved to guest house cloud records.')}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Pending and Active Check-ins (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-4 no-print">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Arrival Registrations</h3>
            <p className="text-[11px] text-slate-500">Track and manage guest arrival checklists</p>
          </div>

          {/* Quick Add from Existing Reservations */}
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
            <span className="text-[11px] font-bold text-emerald-900 block mb-1 uppercase tracking-wider">
              Fast-Track Check-In:
            </span>
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {reservations.map(res => (
                <button
                  key={res.id}
                  onClick={() => handleStartNewCheckIn(res)}
                  className="w-full text-left p-1.5 bg-white hover:bg-emerald-100 rounded text-xs flex items-center justify-between border border-emerald-100 transition"
                >
                  <span className="font-semibold text-slate-800">{res.customerName} {res.customerSurname}</span>
                  <span className="text-[10px] bg-slate-900 text-white px-1.5 py-0.5 rounded font-mono">
                    Suite {res.roomNumber}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Existing Check-ins list */}
          <div className="space-y-2 max-h-[460px] overflow-y-auto">
            {checkIns.map(chi => {
              const isSelected = chi.id === activeCheckIn?.id;
              return (
                <div
                  key={chi.id}
                  onClick={() => {
                    setActiveCheckIn(chi);
                    setIsEditing(false);
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition ${
                    isSelected
                      ? 'bg-emerald-50/80 border-emerald-400 shadow-xs'
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-900">{chi.guestName}</span>
                    <span className="text-[10px] font-bold bg-slate-900 text-white px-2 py-0.5 rounded">
                      Suite {chi.roomNumber}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center justify-between">
                    <span>{chi.arrivalDateTime}</span>
                    <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                      chi.status === 'Checked-In' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {chi.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Active Check-in Form Checklist (8 cols) */}
        {activeCheckIn && (
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6 printable-area">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
              <div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {activeCheckIn.status}
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-1">
                  Digital Check-in Record: {activeCheckIn.guestName}
                </h2>
                <div className="text-xs text-slate-500">
                  Allocated: <strong>Suite {activeCheckIn.roomNumber}</strong> | Arrival: {activeCheckIn.arrivalDateTime}
                </div>
              </div>

              <div className="flex items-center gap-2 no-print">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg border"
                >
                  {isEditing ? 'Save Edits' : 'Edit Details'}
                </button>
              </div>
            </div>

            {/* Check-In Checklist Matrix */}
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                Mandatory Guest House Arrival Procedures
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* 1. Passport verified */}
                <div 
                  onClick={() => handleToggle('passportVerified')}
                  className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    activeCheckIn.passportVerified ? 'bg-emerald-50/70 border-emerald-300' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <User className={`w-4 h-4 ${activeCheckIn.passportVerified ? 'text-emerald-700' : 'text-slate-400'}`} />
                    <div>
                      <div className="font-bold text-slate-900">1. Passport / RSA ID Scanned</div>
                      <div className="text-[11px] text-slate-500">Identity verified against reservation</div>
                    </div>
                  </div>
                  <input type="checkbox" checked={activeCheckIn.passportVerified} readOnly className="rounded text-emerald-600 focus:ring-emerald-500" />
                </div>

                {/* 2. Breakage deposit */}
                <div 
                  onClick={() => handleToggle('breakageDepositCollected')}
                  className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    activeCheckIn.breakageDepositCollected ? 'bg-emerald-50/70 border-emerald-300' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className={`w-4 h-4 ${activeCheckIn.breakageDepositCollected ? 'text-emerald-700' : 'text-slate-400'}`} />
                    <div>
                      <div className="font-bold text-slate-900">2. Breakage Deposit Secured</div>
                      <div className="text-[11px] text-slate-500">Held securely in trust account</div>
                    </div>
                  </div>
                  <input type="checkbox" checked={activeCheckIn.breakageDepositCollected} readOnly className="rounded text-emerald-600 focus:ring-emerald-500" />
                </div>

                {/* 3. Welcome drinks */}
                <div 
                  onClick={() => handleToggle('welcomeDrinksServed')}
                  className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    activeCheckIn.welcomeDrinksServed ? 'bg-emerald-50/70 border-emerald-300' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Wine className={`w-4 h-4 ${activeCheckIn.welcomeDrinksServed ? 'text-emerald-700' : 'text-slate-400'}`} />
                    <div>
                      <div className="font-bold text-slate-900">3. Welcome Drinks Served</div>
                      <div className="text-[11px] text-slate-500">Chilled MCC bubbly or fresh juice</div>
                    </div>
                  </div>
                  <input type="checkbox" checked={activeCheckIn.welcomeDrinksServed} readOnly className="rounded text-emerald-600 focus:ring-emerald-500" />
                </div>

                {/* 4. Registration form signed */}
                <div 
                  onClick={() => handleToggle('registrationFormSigned')}
                  className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    activeCheckIn.registrationFormSigned ? 'bg-emerald-50/70 border-emerald-300' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <FileCheck className={`w-4 h-4 ${activeCheckIn.registrationFormSigned ? 'text-emerald-700' : 'text-slate-400'}`} />
                    <div>
                      <div className="font-bold text-slate-900">4. Registration Card Signed</div>
                      <div className="text-[11px] text-slate-500">Indemnity and house rules accepted</div>
                    </div>
                  </div>
                  <input type="checkbox" checked={activeCheckIn.registrationFormSigned} readOnly className="rounded text-emerald-600 focus:ring-emerald-500" />
                </div>

                {/* 5. Wi-Fi credentials */}
                <div 
                  onClick={() => handleToggle('wifiCredentialsProvided')}
                  className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    activeCheckIn.wifiCredentialsProvided ? 'bg-emerald-50/70 border-emerald-300' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Wifi className={`w-4 h-4 ${activeCheckIn.wifiCredentialsProvided ? 'text-emerald-700' : 'text-slate-400'}`} />
                    <div>
                      <div className="font-bold text-slate-900">5. High-Speed Wi-Fi Provided</div>
                      <div className="text-[11px] text-slate-500">Starlink SSID: Tides_Of_Knysna_Guest</div>
                    </div>
                  </div>
                  <input type="checkbox" checked={activeCheckIn.wifiCredentialsProvided} readOnly className="rounded text-emerald-600 focus:ring-emerald-500" />
                </div>

                {/* 6. Keys Handed over */}
                <div className="p-3.5 rounded-xl border bg-slate-50 border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Key className="w-4 h-4 text-emerald-700" />
                    <div>
                      <div className="font-bold text-slate-900">6. Suite Keys Issued</div>
                      <div className="text-[11px] text-slate-500">{activeCheckIn.allocatedKeys}</div>
                    </div>
                  </div>
                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                </div>
              </div>
            </div>

            {/* Duty details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100 text-xs">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Luggage Handled By</label>
                <input
                  type="text"
                  value={activeCheckIn.luggageHandledBy}
                  disabled={!isEditing}
                  onChange={(e) => setActiveCheckIn({ ...activeCheckIn, luggageHandledBy: e.target.value })}
                  className="w-full text-xs px-3 py-2 border rounded-lg bg-slate-50 disabled:bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Emergency Contact Number</label>
                <input
                  type="text"
                  value={activeCheckIn.emergencyContactNoted}
                  disabled={!isEditing}
                  onChange={(e) => setActiveCheckIn({ ...activeCheckIn, emergencyContactNoted: e.target.value })}
                  className="w-full text-xs px-3 py-2 border rounded-lg bg-slate-50 disabled:bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Duty Manager On Duty</label>
                <input
                  type="text"
                  value={activeCheckIn.dutyManager}
                  disabled={!isEditing}
                  onChange={(e) => setActiveCheckIn({ ...activeCheckIn, dutyManager: e.target.value })}
                  className="w-full text-xs px-3 py-2 border rounded-lg bg-slate-50 disabled:bg-slate-50"
                />
              </div>
            </div>

            {/* Digital Signatures for Check-In Record */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <DigitalSignatureBlock
                title="Guest Registration Signature"
                signerRole="Guest Signatory"
                signerName={activeCheckIn.guestName}
                onSave={(sig) => {
                  const updated = { ...activeCheckIn, registrationFormSigned: true };
                  setActiveCheckIn(updated);
                  setCheckIns(checkIns.map(c => c.id === updated.id ? updated : c));
                }}
              />
              <DigitalSignatureBlock
                title="Duty Manager Formal Sign-Off"
                signerRole="Estate Duty Manager"
                signerName={activeCheckIn.dutyManager}
                onSave={(sig) => {
                  const updated = { ...activeCheckIn, status: 'Checked-In' as const };
                  setActiveCheckIn(updated);
                  setCheckIns(checkIns.map(c => c.id === updated.id ? updated : c));
                }}
              />
            </div>

            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-center justify-between">
              <div>
                <div className="font-bold">Check-In Status: {activeCheckIn.status}</div>
                <div className="text-[11px] text-emerald-800">
                  Guest is officially logged as occupying Suite {activeCheckIn.roomNumber}.
                </div>
              </div>
              <button
                onClick={() => {
                  const updated = { ...activeCheckIn, status: 'Checked-In' as const };
                  setActiveCheckIn(updated);
                  setCheckIns(checkIns.map(c => c.id === updated.id ? updated : c));
                  alert('Check-In signed off successfully!');
                }}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs shadow-sm no-print"
              >
                Sign Off & Complete Check-In
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
