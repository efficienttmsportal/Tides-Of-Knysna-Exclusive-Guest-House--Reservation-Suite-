import React, { useState } from 'react';
import { 
  Trash2, 
  AlertTriangle, 
  X, 
  CheckCircle2, 
  RotateCcw, 
  Users, 
  Clock, 
  FileText, 
  CalendarDays, 
  ShieldAlert,
  Archive,
  UserX
} from 'lucide-react';
import { 
  EmployeeContact, 
  EmployeePayslip, 
  EmployeeLetterOfAppointment, 
  EmployeeLeaveForm 
} from '../types';
import { ShiftEntry } from './EmployeesModule';

interface ClearRecordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: EmployeeContact[];
  payslips: EmployeePayslip[];
  shifts: ShiftEntry[];
  letters: EmployeeLetterOfAppointment[];
  leaveForms: EmployeeLeaveForm[];
  onDeleteOldEmployees: () => void;
  onClearShifts: () => void;
  onClearPayslips: () => void;
  onClearLeaveForms: () => void;
  onClearLetters: () => void;
  onClearAllRecords: () => void;
  onRestoreDefaults: () => void;
}

export const ClearRecordsModal: React.FC<ClearRecordsModalProps> = ({
  isOpen,
  onClose,
  employees,
  payslips,
  shifts,
  letters,
  leaveForms,
  onDeleteOldEmployees,
  onClearShifts,
  onClearPayslips,
  onClearLeaveForms,
  onClearLetters,
  onClearAllRecords,
  onRestoreDefaults,
}) => {
  const [confirmTarget, setConfirmTarget] = useState<string | null>(null);
  const [confirmInput, setConfirmInput] = useState('');
  const [successNote, setSuccessNote] = useState<string | null>(null);

  if (!isOpen) return null;

  const formerEmployees = employees.filter(e => 
    e.status === 'Former' || e.status === 'Terminated' || e.status === 'Resigned'
  );

  const handleAction = (targetKey: string, actionFn: () => void, label: string) => {
    actionFn();
    setConfirmTarget(null);
    setConfirmInput('');
    setSuccessNote(`Successfully processed: ${label}`);
    setTimeout(() => setSuccessNote(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-slate-800 to-rose-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Clear Records & Staff Data Management
              </h2>
              <p className="text-xs text-slate-300">
                Purge historical logs, delete former employees, and clean operational data.
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

        {/* Feedback Alert */}
        {successNote && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successNote}</span>
          </div>
        )}

        {/* Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Section 1: Old / Former Employees Removal */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4.5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                  <UserX className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">
                    Purge Former & Inactive Staff Records
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Permanently delete staff profiles marked as Former, Resigned, or Terminated.
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                {formerEmployees.length} Old / Former Found
              </span>
            </div>

            {formerEmployees.length > 0 ? (
              <div className="bg-white rounded-lg border border-slate-200 p-2.5 space-y-1.5">
                <div className="text-[11px] font-semibold text-slate-600 mb-1">Identified former personnel:</div>
                <div className="flex flex-wrap gap-1.5">
                  {formerEmployees.map(emp => (
                    <span 
                      key={emp.id} 
                      className="px-2 py-1 rounded bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-medium flex items-center gap-1.5"
                    >
                      <span>{emp.name} {emp.surname}</span>
                      <span className="text-[10px] bg-rose-200 text-rose-900 px-1 rounded font-bold">{emp.status || 'Former'}</span>
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-slate-500 italic bg-white p-2.5 rounded-lg border border-slate-200">
                No employees are currently marked as Former or Terminated. You can mark any employee as Former in the roster to purge them here, or use the multi-select checkboxes to delete immediately.
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                disabled={formerEmployees.length === 0}
                onClick={() => handleAction('former_staff', onDeleteOldEmployees, `Deleted ${formerEmployees.length} former employee record(s)`)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                  formerEmployees.length > 0
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-sm cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <UserX className="w-3.5 h-3.5" />
                Delete All Former Employees ({formerEmployees.length})
              </button>
            </div>
          </div>

          {/* Section 2: Operational Records Granular Purge */}
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              Granular Operational Records Clearing
            </h3>
            <p className="text-[11px] text-slate-500 mb-3">
              Clear specific transaction histories while keeping employee contact dossiers intact.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Shifts / Clock Cards */}
              <div className="border border-slate-200 rounded-xl p-3.5 bg-white flex flex-col justify-between hover:border-slate-300 transition">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      Shift Log & Clock Cards
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {shifts.length} Rows
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Daily biometric shifts, worked hours, and duty logs.
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 mt-2 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Empties table</span>
                  <button
                    disabled={shifts.length === 0}
                    onClick={() => handleAction('shifts', onClearShifts, 'Clock card shifts log emptied')}
                    className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 transition ${
                      shifts.length > 0
                        ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear Shift Log
                  </button>
                </div>
              </div>

              {/* Payslip History */}
              <div className="border border-slate-200 rounded-xl p-3.5 bg-white flex flex-col justify-between hover:border-slate-300 transition">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      Generated Payslips
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {payslips.length} Slips
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    BCEA confidential payslips and payroll disbursements.
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 mt-2 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Removes all slips</span>
                  <button
                    disabled={payslips.length === 0}
                    onClick={() => handleAction('payslips', onClearPayslips, 'Payslip history records cleared')}
                    className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 transition ${
                      payslips.length > 0
                        ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear Payslips
                  </button>
                </div>
              </div>

              {/* Leave Applications */}
              <div className="border border-slate-200 rounded-xl p-3.5 bg-white flex flex-col justify-between hover:border-slate-300 transition">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <CalendarDays className="w-3.5 h-3.5 text-purple-600" />
                      Staff Leave Applications
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {leaveForms.length} Forms
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Annual, sick, and family leave requests and approvals.
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 mt-2 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Empties registry</span>
                  <button
                    disabled={leaveForms.length === 0}
                    onClick={() => handleAction('leave', onClearLeaveForms, 'Leave application records cleared')}
                    className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 transition ${
                      leaveForms.length > 0
                        ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear Leave Requests
                  </button>
                </div>
              </div>

              {/* Appointment Letters */}
              <div className="border border-slate-200 rounded-xl p-3.5 bg-white flex flex-col justify-between hover:border-slate-300 transition">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Archive className="w-3.5 h-3.5 text-teal-600" />
                      Appointment Letters
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {letters.length} Letters
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Legal contracts and BCEA appointment documents.
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 mt-2 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Empties contracts</span>
                  <button
                    disabled={letters.length === 0}
                    onClick={() => handleAction('letters', onClearLetters, 'Appointment letters cleared')}
                    className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 transition ${
                      letters.length > 0
                        ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear Letters
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: High-Impact Operations */}
          <div className="pt-2 border-t border-slate-200">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              Batch Wipe & Demo Recovery
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Wipe all records */}
              <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl space-y-2">
                <div className="font-bold text-xs text-rose-900">
                  Wipe All Operational Logs
                </div>
                <p className="text-[11px] text-rose-700">
                  Clears all shifts, payslips, leaves, and letters at once. Active employee profiles remain safe.
                </p>
                {confirmTarget === 'all_records' ? (
                  <div className="space-y-2 pt-1">
                    <p className="text-[10px] font-bold text-rose-800">
                      Type <span className="underline">CLEAR</span> to confirm:
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={confirmInput}
                        onChange={(e) => setConfirmInput(e.target.value)}
                        placeholder="Type CLEAR"
                        className="w-full text-xs px-2.5 py-1 border border-rose-300 rounded bg-white font-mono uppercase"
                      />
                      <button
                        disabled={confirmInput.trim().toUpperCase() !== 'CLEAR'}
                        onClick={() => handleAction('all_records', onClearAllRecords, 'All operational history logs wiped')}
                        className={`px-3 py-1 text-xs font-bold rounded text-white shrink-0 ${
                          confirmInput.trim().toUpperCase() === 'CLEAR'
                            ? 'bg-rose-600 hover:bg-rose-700 cursor-pointer'
                            : 'bg-slate-300 cursor-not-allowed'
                        }`}
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => { setConfirmTarget(null); setConfirmInput(''); }}
                        className="px-2 py-1 text-xs text-slate-600 hover:text-slate-800"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => { setConfirmTarget('all_records'); setConfirmInput(''); }}
                    className="w-full py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Wipe All History Records
                  </button>
                )}
              </div>

              {/* Restore Demonstration defaults */}
              <div className="p-3.5 bg-slate-100 border border-slate-200 rounded-xl space-y-2">
                <div className="font-bold text-xs text-slate-900">
                  Restore Factory Demo Data
                </div>
                <p className="text-[11px] text-slate-600">
                  Reloads default Knysna staff profiles, sample payslips, shift schedules, and letters.
                </p>
                <button
                  onClick={() => handleAction('restore_demo', onRestoreDefaults, 'Restored initial demonstration data')}
                  className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-lg transition flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                  Restore Initial Demonstration Data
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Changes are permanently saved to browser storage.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition"
          >
            Done & Close
          </button>
        </div>
      </div>
    </div>
  );
};
