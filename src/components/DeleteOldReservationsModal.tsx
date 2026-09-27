import React, { useState } from 'react';
import { 
  Trash2, 
  AlertTriangle, 
  X, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  BedDouble, 
  User, 
  DollarSign, 
  ShieldAlert,
  Archive,
  CheckSquare,
  Square
} from 'lucide-react';
import { Reservation } from '../types';

interface DeleteOldReservationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  oldReservations: Reservation[];
  onDeleteSelected: (ids: string[]) => void;
  onDeleteAll: () => void;
}

export const DeleteOldReservationsModal: React.FC<DeleteOldReservationsModalProps> = ({
  isOpen,
  onClose,
  oldReservations,
  onDeleteSelected,
  onDeleteAll,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(() => oldReservations.map(r => r.id));
  const [confirmStep, setConfirmStep] = useState(false);

  // Sync selected IDs if oldReservations changes
  React.useEffect(() => {
    setSelectedIds(oldReservations.map(r => r.id));
  }, [oldReservations]);

  if (!isOpen) return null;

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === oldReservations.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(oldReservations.map(r => r.id));
    }
  };

  const handleExecuteDelete = () => {
    if (selectedIds.length === 0) return;
    if (selectedIds.length === oldReservations.length) {
      onDeleteAll();
    } else {
      onDeleteSelected(selectedIds);
    }
    setConfirmStep(false);
    onClose();
  };

  const getDaysAgo = (checkoutDate: string) => {
    const today = new Date('2026-09-27');
    const outDate = new Date(checkoutDate);
    const diffTime = today.getTime() - outDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return 'Concluded today';
    if (diffDays === 1) return 'Checked out yesterday';
    return `Checked out ${diffDays} days ago`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Purge & Delete Old Reservations
              </h2>
              <p className="text-xs text-rose-200/80">
                Safely remove completed and past guest bookings whose checkout dates have passed.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Close Dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {oldReservations.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">No Past / Old Reservations Found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                All current reservations have upcoming or active stay dates. No outdated bookings require purging at this time.
              </p>
            </div>
          ) : (
            <>
              {/* Info Banner */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3 text-xs text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">
                    Found {oldReservations.length} completed / past reservation{oldReservations.length > 1 ? 's' : ''}.
                  </span>
                  <p className="text-amber-800/90 mt-0.5 leading-relaxed">
                    These bookings concluded prior to today (September 27, 2026). You can choose to delete individual records or clean out all past reservation files to keep your system directory current.
                  </p>
                </div>
              </div>

              {/* Table Controls */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
                <button
                  onClick={handleSelectAll}
                  className="flex items-center gap-1.5 font-bold text-slate-700 hover:text-slate-900 transition"
                >
                  {selectedIds.length === oldReservations.length ? (
                    <CheckSquare className="w-4 h-4 text-rose-600" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400" />
                  )}
                  {selectedIds.length === oldReservations.length ? 'Deselect All' : 'Select All'} ({selectedIds.length}/{oldReservations.length} Selected)
                </button>
                <span className="text-[11px] text-slate-500">
                  Total Value of Past Bookings: <strong className="text-slate-800">R {oldReservations.reduce((sum, r) => sum + r.totalRoomCost, 0).toLocaleString()}</strong>
                </span>
              </div>

              {/* Old Reservations List */}
              <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                {oldReservations.map((res) => {
                  const isChecked = selectedIds.includes(res.id);
                  return (
                    <div
                      key={res.id}
                      onClick={() => toggleSelect(res.id)}
                      className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                        isChecked
                          ? 'bg-rose-50/60 border-rose-300 shadow-xs'
                          : 'bg-white hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // handled by parent div onClick
                          className="mt-1 w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-900">
                              {res.reservationNumber}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 text-white">
                              Suite {res.roomNumber}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                              {getDaysAgo(res.checkOutDate)}
                            </span>
                          </div>

                          <div className="text-xs font-bold text-slate-800">
                            {res.customerName} {res.customerSurname}
                          </div>

                          <div className="text-[11px] text-slate-500 flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              {res.checkInDate} → {res.checkOutDate} ({res.totalNights} nights)
                            </span>
                            <span>•</span>
                            <span className="font-semibold text-slate-700">
                              R {res.totalRoomCost.toLocaleString()} ({res.paymentStatus})
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSelected([res.id]);
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete this record only"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Confirmation Step if clicked */}
              {confirmStep && (
                <div className="p-4 bg-rose-100/70 border border-rose-300 rounded-xl space-y-2 animate-in fade-in">
                  <div className="flex items-center gap-2 font-bold text-rose-900 text-xs">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    Please Confirm Permanent Record Deletion
                  </div>
                  <p className="text-xs text-rose-800">
                    Are you sure you want to permanently delete {selectedIds.length} old reservation{selectedIds.length > 1 ? 's' : ''}? This action cannot be reversed.
                  </p>
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={handleExecuteDelete}
                      className="px-3.5 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-bold transition shadow-sm"
                    >
                      Yes, Permanently Delete {selectedIds.length} Booking{selectedIds.length > 1 ? 's' : ''}
                    </button>
                    <button
                      onClick={() => setConfirmStep(false)}
                      className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-white transition"
          >
            Close
          </button>

          {oldReservations.length > 0 && !confirmStep && (
            <div className="flex items-center gap-2">
              <button
                disabled={selectedIds.length === 0}
                onClick={() => setConfirmStep(true)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold rounded-lg transition flex items-center gap-1.5 shadow-sm"
              >
                <Trash2 className="w-4 h-4" />
                Delete Selected ({selectedIds.length}) Old Bookings
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
