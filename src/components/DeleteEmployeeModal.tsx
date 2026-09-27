import React, { useState } from 'react';
import { Trash2, AlertTriangle, X, CheckSquare, Square } from 'lucide-react';
import { EmployeeContact } from '../types';

interface DeleteEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeesToDelete: EmployeeContact[];
  onConfirmDelete: (deleteAssociatedRecords: boolean) => void;
}

export const DeleteEmployeeModal: React.FC<DeleteEmployeeModalProps> = ({
  isOpen,
  onClose,
  employeesToDelete,
  onConfirmDelete
}) => {
  const [deleteAssociatedRecords, setDeleteAssociatedRecords] = useState(true);

  if (!isOpen || employeesToDelete.length === 0) return null;

  const isMultiple = employeesToDelete.length > 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-rose-50 border-b border-rose-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                {isMultiple 
                  ? `Delete ${employeesToDelete.length} Employees?` 
                  : `Delete Employee Profile?`}
              </h3>
              <p className="text-xs text-rose-700">
                This action cannot be automatically undone.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            {isMultiple ? (
              <>Are you sure you want to permanently remove the following <strong>{employeesToDelete.length} employees</strong> from the app database?</>
            ) : (
              <>Are you sure you want to permanently remove <strong>{employeesToDelete[0].name} {employeesToDelete[0].surname}</strong> ({employeesToDelete[0].clockCardNo} • {employeesToDelete[0].employmentRole}) from the staff registry?</>
            )}
          </p>

          {/* List of employees being deleted */}
          <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs">
            {employeesToDelete.map(emp => (
              <div key={emp.id} className="flex items-center justify-between py-1 px-2 rounded bg-white border border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                    {emp.name.charAt(0)}{emp.surname.charAt(0)}
                  </div>
                  <span className="font-bold text-slate-800">{emp.name} {emp.surname}</span>
                  <span className="text-[10px] text-slate-500">({emp.clockCardNo})</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                  emp.status === 'Former' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                }`}>
                  {emp.status || 'Active'}
                </span>
              </div>
            ))}
          </div>

          {/* Option: delete associated records */}
          <div 
            onClick={() => setDeleteAssociatedRecords(!deleteAssociatedRecords)}
            className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl flex items-start gap-2.5 cursor-pointer text-xs"
          >
            <div className="mt-0.5 text-amber-700">
              {deleteAssociatedRecords ? (
                <CheckSquare className="w-4 h-4 text-emerald-600" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
            </div>
            <div>
              <div className="font-semibold text-slate-900">
                Purge linked operational records
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Automatically delete payslips, shifts, appointment letters, and leave applications associated with {isMultiple ? 'these employees' : 'this employee'}.
              </p>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirmDelete(deleteAssociatedRecords)}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {isMultiple ? `Delete ${employeesToDelete.length} Employees` : 'Delete Employee'}
          </button>
        </div>
      </div>
    </div>
  );
};
