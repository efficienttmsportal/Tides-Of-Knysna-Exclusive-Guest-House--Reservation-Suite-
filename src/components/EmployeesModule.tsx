import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  FileText, 
  Clock, 
  Calendar, 
  DollarSign, 
  Briefcase, 
  CheckCircle, 
  AlertCircle, 
  Printer, 
  Download, 
  Mail, 
  Search, 
  Edit3, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  UserCheck, 
  Phone, 
  MapPin, 
  Heart, 
  FileCheck, 
  ChevronRight, 
  Filter, 
  Sparkles,
  Layers,
  Award,
  CalendarDays,
  CreditCard,
  Building,
  Check,
  Send,
  TrendingUp,
  Target,
  CheckSquare,
  Square,
  UserX,
  Archive,
  RotateCcw,
  History,
  ShieldAlert
} from 'lucide-react';
import { DocumentActionBar } from './DocumentActionBar';
import { SalesPerformanceDashboard } from './SalesPerformanceDashboard';
import { PerformanceSummaryRow } from './PerformanceSummaryRow';
import { ClearRecordsModal } from './ClearRecordsModal';
import { DeleteEmployeeModal } from './DeleteEmployeeModal';
import { getStoredGuestSurveys, GuestSatisfactionRecord } from './GuestSatisfactionSurvey';
import { 
  EmployeeContact, 
  EmployeePayslip, 
  EmployeeLetterOfAppointment, 
  EmployeeLeaveForm,
  Reservation
} from '../types';
import { 
  INITIAL_EMPLOYEES, 
  INITIAL_PAYSLIPS, 
  INITIAL_LETTERS, 
  INITIAL_LEAVE_FORMS, 
  GUEST_HOUSE_INFO 
} from '../data/initialData';

export interface ShiftEntry {
  id: string;
  date: string;
  dayOfWeek: string;
  startTime: string;
  finishTime: string;
  breakMinutes: number;
  regularHours: number;
  overtimeHours: number;
  notes: string;
}

const DEFAULT_SHIFTS: ShiftEntry[] = [
  { id: 'sh-1', date: '2026-09-14', dayOfWeek: 'Mon', startTime: '07:30', finishTime: '16:30', breakMinutes: 60, regularHours: 8, overtimeHours: 0, notes: 'Morning guest arrival briefing' },
  { id: 'sh-2', date: '2026-09-15', dayOfWeek: 'Tue', startTime: '07:30', finishTime: '16:30', breakMinutes: 60, regularHours: 8, overtimeHours: 0, notes: 'Featherbed tour coordination' },
  { id: 'sh-3', date: '2026-09-16', dayOfWeek: 'Wed', startTime: '07:30', finishTime: '18:00', breakMinutes: 60, regularHours: 8, overtimeHours: 1.5, notes: 'VIP late arrival check-in' },
  { id: 'sh-4', date: '2026-09-17', dayOfWeek: 'Thu', startTime: '07:30', finishTime: '16:30', breakMinutes: 60, regularHours: 8, overtimeHours: 0, notes: 'Inventory stock replenishment' },
  { id: 'sh-5', date: '2026-09-18', dayOfWeek: 'Fri', startTime: '07:30', finishTime: '18:30', breakMinutes: 60, regularHours: 8, overtimeHours: 2, notes: 'Weekend guest turn-in preparation' },
  { id: 'sh-6', date: '2026-09-19', dayOfWeek: 'Sat', startTime: '08:00', finishTime: '14:00', breakMinutes: 30, regularHours: 5.5, overtimeHours: 0, notes: 'Weekend shift roster' },
];

export interface EmployeesModuleProps {
  reservations?: Reservation[];
  defaultTab?: 'contacts' | 'payslips' | 'letters' | 'leave' | 'sales' | 'shifts';
}

export const EmployeesModule: React.FC<EmployeesModuleProps> = ({
  reservations = [],
  defaultTab = 'sales'
}) => {
  const [activeTab, setActiveTab] = useState<'contacts' | 'payslips' | 'letters' | 'leave' | 'sales' | 'shifts'>(defaultTab);

  // STORAGE KEYS FOR PERSISTENCE
  const EMPLOYEES_STORAGE_KEY = 'tok_employees_v2';
  const PAYSLIPS_STORAGE_KEY = 'tok_payslips_v2';
  const SHIFTS_STORAGE_KEY = 'tok_shifts_v2';
  const LETTERS_STORAGE_KEY = 'tok_letters_v2';
  const LEAVE_STORAGE_KEY = 'tok_leave_v2';

  // EMPLOYEES STATE WITH LOCALSTORAGE
  const [employees, setEmployees] = useState<EmployeeContact[]>(() => {
    try {
      const saved = localStorage.getItem(EMPLOYEES_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load employees from storage', e);
    }
    return INITIAL_EMPLOYEES;
  });

  const [selectedEmpId, setSelectedEmpId] = useState<string>(employees[0]?.id || '');
  const [contactSearch, setContactSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Former'>('All');
  const [selectedEmpIds, setSelectedEmpIds] = useState<Set<string>>(new Set());
  const [isEditingContact, setIsEditingContact] = useState(false);

  // Selected or Draft Employee
  const activeEmployee = employees.find(e => e.id === selectedEmpId) || employees[0];
  const [empForm, setEmpForm] = useState<EmployeeContact>(activeEmployee || {
    id: 'emp-init',
    name: 'New',
    surname: 'Employee',
    idNumber: '',
    spouseNameAndSurname: '',
    spouseIdNumber: '',
    contactNumbers: '',
    physicalAddress: '',
    postalAddress: '',
    nextOfKinName: '',
    nextOfKinRelationship: '',
    nextOfKinContact: '',
    maritalStatus: 'Single',
    employmentRole: 'Office Staff',
    clockCardNo: 'CLK-100',
    dateJoined: new Date().toISOString().split('T')[0],
    email: '',
    status: 'Active'
  });

  React.useEffect(() => {
    if (activeEmployee) {
      setEmpForm(activeEmployee);
    }
  }, [selectedEmpId]);

  // Persist employees
  React.useEffect(() => {
    try {
      localStorage.setItem(EMPLOYEES_STORAGE_KEY, JSON.stringify(employees));
    } catch (e) {
      console.warn('Failed to persist employees', e);
    }
  }, [employees]);

  // PAYSLIPS STATE WITH LOCALSTORAGE
  const [payslips, setPayslips] = useState<EmployeePayslip[]>(() => {
    try {
      const saved = localStorage.getItem(PAYSLIPS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load payslips from storage', e);
    }
    return INITIAL_PAYSLIPS;
  });

  const [selectedSlipId, setSelectedSlipId] = useState<string>(payslips[0]?.id || '');

  // Persist payslips
  React.useEffect(() => {
    try {
      localStorage.setItem(PAYSLIPS_STORAGE_KEY, JSON.stringify(payslips));
    } catch (e) {
      console.warn('Failed to persist payslips', e);
    }
  }, [payslips]);

  // SHIFTS STATE WITH LOCALSTORAGE
  const [shifts, setShifts] = useState<ShiftEntry[]>(() => {
    try {
      const saved = localStorage.getItem(SHIFTS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load shifts from storage', e);
    }
    return DEFAULT_SHIFTS;
  });

  const [showSlipPrintView, setShowSlipPrintView] = useState(false);

  // Persist shifts
  React.useEffect(() => {
    try {
      localStorage.setItem(SHIFTS_STORAGE_KEY, JSON.stringify(shifts));
    } catch (e) {
      console.warn('Failed to persist shifts', e);
    }
  }, [shifts]);

  const activeSlip = payslips.find(p => p.id === selectedSlipId) || payslips[0];
  const [slipForm, setSlipForm] = useState<EmployeePayslip>(activeSlip || {
    id: 'slip-default',
    slipNumber: 'PAY-2026-09-01',
    clockCardNo: 'CLK-101',
    nameAndSurname: 'Eleanor Sterling',
    staffCategory: 'Office Staff',
    payPeriod: 'September 2026',
    hoursWorked: 160,
    hourlyRate: 150,
    basicSalary: 24000,
    overtimeHours: 6,
    overtimeRate: 225,
    startTime: '07:30',
    finishTime: '16:30',
    allowances: 1500,
    deductionsUif: 177.12,
    deductionsTax: 2800,
    deductionsOther: 0,
    netPay: 23872.88,
    dateGenerated: '2026-09-25',
    status: 'Approved'
  });

  React.useEffect(() => {
    if (activeSlip) {
      setSlipForm(activeSlip);
    }
  }, [selectedSlipId]);

  // Calculate hours dynamically from shifts if requested
  const totalShiftRegHours = shifts.reduce((acc, s) => acc + (Number(s.regularHours) || 0), 0);
  const totalShiftOtHours = shifts.reduce((acc, s) => acc + (Number(s.overtimeHours) || 0), 0);

  // APPOINTMENT LETTERS STATE WITH LOCALSTORAGE
  const [letters, setLetters] = useState<EmployeeLetterOfAppointment[]>(() => {
    try {
      const saved = localStorage.getItem(LETTERS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load letters from storage', e);
    }
    return INITIAL_LETTERS;
  });

  const [selectedLetterId, setSelectedLetterId] = useState<string>(letters[0]?.id || '');
  const [showLetterPreview, setShowLetterPreview] = useState(true);

  // Persist letters
  React.useEffect(() => {
    try {
      localStorage.setItem(LETTERS_STORAGE_KEY, JSON.stringify(letters));
    } catch (e) {
      console.warn('Failed to persist letters', e);
    }
  }, [letters]);

  const activeLetter = letters.find(l => l.id === selectedLetterId) || letters[0];
  const [letterForm, setLetterForm] = useState<EmployeeLetterOfAppointment>(activeLetter || {
    id: 'let-default',
    date: '2026-09-18',
    employeeName: 'Eleanor Sterling',
    employeeIdNumber: '8503140092084',
    positionTitle: 'Hospitality Supervisor',
    department: 'Front Office & Guest Services',
    commencementDate: '2019-03-01',
    remuneration: 'ZAR 24,000.00 basic per month plus allowances',
    workingHours: '40 hours per week rostered flexibly',
    reportingTo: 'Managing Director - Tides of Knysna',
    probationPeriod: '3 (Three) Months from commencement date',
    authorizedSignatory: 'Managing Director - Tides of Knysna',
    signedByEmployee: true
  });

  React.useEffect(() => {
    if (activeLetter) {
      setLetterForm(activeLetter);
    }
  }, [selectedLetterId]);

  // LEAVE REQUESTS STATE WITH LOCALSTORAGE
  const [leaveForms, setLeaveForms] = useState<EmployeeLeaveForm[]>(() => {
    try {
      const saved = localStorage.getItem(LEAVE_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load leave forms from storage', e);
    }
    return INITIAL_LEAVE_FORMS;
  });

  const [selectedLeaveId, setSelectedLeaveId] = useState<string>(leaveForms[0]?.id || '');
  const [isCreatingLeave, setIsCreatingLeave] = useState(false);

  // Persist leave forms
  React.useEffect(() => {
    try {
      localStorage.setItem(LEAVE_STORAGE_KEY, JSON.stringify(leaveForms));
    } catch (e) {
      console.warn('Failed to persist leave forms', e);
    }
  }, [leaveForms]);

  const activeLeave = leaveForms.find(lf => lf.id === selectedLeaveId) || leaveForms[0];
  const [leaveFormState, setLeaveFormState] = useState<EmployeeLeaveForm>(activeLeave || {
    id: 'lev-default',
    nameAndSurname: 'Miriam Zulu',
    staffCategory: 'Office Staff',
    clockcardNo: 'CLK-102',
    leaveType: 'Annual Leave',
    dateFrom: '2026-10-05',
    dateEnd: '2026-10-09',
    totalDays: 5,
    reason: 'Family visit to Eastern Cape',
    employeeSignatureDate: '2026-09-18',
    managerApproval: 'Approved',
    managerSignatureDate: '2026-09-19'
  });

  React.useEffect(() => {
    if (activeLeave) {
      setLeaveFormState(activeLeave);
    }
  }, [selectedLeaveId]);

  // MODAL STATES
  const [isClearRecordsModalOpen, setIsClearRecordsModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [employeesToDelete, setEmployeesToDelete] = useState<EmployeeContact[]>([]);

  // Success Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // HANDLERS FOR EMPLOYEE CONTACTS
  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empForm.name || !empForm.surname) {
      showToast('Please enter employee name and surname.');
      return;
    }
    const exists = employees.some(e => e.id === empForm.id);
    if (exists) {
      setEmployees(employees.map(e => e.id === empForm.id ? empForm : e));
    } else {
      setEmployees([empForm, ...employees]);
      setSelectedEmpId(empForm.id);
    }
    setIsEditingContact(false);
    showToast(`Employee record for ${empForm.name} ${empForm.surname} saved successfully.`);
  };

  const handleAddNewEmployee = () => {
    const newId = `emp-${Date.now()}`;
    const clkNum = Math.floor(100 + Math.random() * 900);
    const newEmp: EmployeeContact = {
      id: newId,
      name: '',
      surname: '',
      idNumber: '',
      spouseNameAndSurname: '',
      spouseIdNumber: '',
      contactNumbers: '+27 ',
      physicalAddress: '',
      postalAddress: 'PO Box , Knysna, 6570',
      nextOfKinName: '',
      nextOfKinRelationship: '',
      nextOfKinContact: '+27 ',
      maritalStatus: 'Single',
      employmentRole: 'Office Staff',
      clockCardNo: `CLK-${clkNum}`,
      dateJoined: new Date().toISOString().split('T')[0],
      email: '',
      status: 'Active'
    };
    setEmpForm(newEmp);
    setSelectedEmpId(newId);
    setIsEditingContact(true);
  };

  // Employee Deletion Trigger
  const handleRequestDeleteEmployee = (emp: EmployeeContact) => {
    setEmployeesToDelete([emp]);
    setDeleteModalOpen(true);
  };

  const handleRequestDeleteBatch = () => {
    const selected = employees.filter(e => selectedEmpIds.has(e.id));
    if (selected.length === 0) return;
    setEmployeesToDelete(selected);
    setDeleteModalOpen(true);
  };

  const handleConfirmDeleteEmployees = (deleteAssociatedRecords: boolean) => {
    const idsToDelete = new Set(employeesToDelete.map(e => e.id));
    const namesToDelete = new Set(employeesToDelete.map(e => `${e.name} ${e.surname}`.toLowerCase()));
    const clockCardsToDelete = new Set(employeesToDelete.map(e => e.clockCardNo));

    const remaining = employees.filter(e => !idsToDelete.has(e.id));
    setEmployees(remaining);

    if (deleteAssociatedRecords) {
      setPayslips(payslips.filter(p => !namesToDelete.has(p.nameAndSurname.toLowerCase()) && !clockCardsToDelete.has(p.clockCardNo)));
      setLetters(letters.filter(l => !namesToDelete.has(l.employeeName.toLowerCase())));
      setLeaveForms(leaveForms.filter(lf => !namesToDelete.has(lf.nameAndSurname.toLowerCase()) && !clockCardsToDelete.has(lf.clockcardNo)));
    }

    const nextSelected = new Set(selectedEmpIds);
    idsToDelete.forEach(id => nextSelected.delete(id));
    setSelectedEmpIds(nextSelected);

    if (remaining.length > 0) {
      setSelectedEmpId(remaining[0].id);
    } else {
      setSelectedEmpId('');
    }

    setDeleteModalOpen(false);
    setEmployeesToDelete([]);
    showToast(`Permanently deleted ${idsToDelete.size} employee profile${idsToDelete.size > 1 ? 's' : ''}.`);
  };

  const handleBatchMarkStatus = (newStatus: 'Active' | 'Former') => {
    const updated = employees.map(emp => {
      if (selectedEmpIds.has(emp.id)) {
        return {
          ...emp,
          status: newStatus,
          terminationDate: newStatus === 'Former' ? new Date().toISOString().split('T')[0] : undefined
        };
      }
      return emp;
    });
    setEmployees(updated);
    setSelectedEmpIds(new Set());
    showToast(`Marked ${selectedEmpIds.size} staff members as ${newStatus}.`);
  };

  const handleDeleteAllFormerEmployees = () => {
    const former = employees.filter(e => e.status === 'Former' || e.status === 'Terminated' || e.status === 'Resigned');
    if (former.length === 0) {
      showToast('No former or inactive employees found.');
      return;
    }
    setEmployeesToDelete(former);
    setDeleteModalOpen(true);
  };

  // RECORD CLEARING HANDLERS
  const handleClearShifts = () => {
    setShifts([]);
    showToast('Biometric shift logs and clock card hours cleared.');
  };

  const handleClearPayslips = () => {
    setPayslips([]);
    setSelectedSlipId('');
    showToast('All historical payslip records cleared.');
  };

  const handleClearLeaveForms = () => {
    setLeaveForms([]);
    setSelectedLeaveId('');
    showToast('All leave application records cleared.');
  };

  const handleClearLetters = () => {
    setLetters([]);
    setSelectedLetterId('');
    showToast('All letters of appointment cleared.');
  };

  const handleClearAllRecords = () => {
    setShifts([]);
    setPayslips([]);
    setLeaveForms([]);
    setLetters([]);
    showToast('All operational logs (shifts, payslips, leave, letters) cleared.');
  };

  const handleRestoreDefaults = () => {
    setEmployees(INITIAL_EMPLOYEES);
    setPayslips(INITIAL_PAYSLIPS);
    setShifts(DEFAULT_SHIFTS);
    setLetters(INITIAL_LETTERS);
    setLeaveForms(INITIAL_LEAVE_FORMS);
    setSelectedEmpId(INITIAL_EMPLOYEES[0]?.id || '');
    setSelectedSlipId(INITIAL_PAYSLIPS[0]?.id || '');
    setSelectedLetterId(INITIAL_LETTERS[0]?.id || '');
    setSelectedLeaveId(INITIAL_LEAVE_FORMS[0]?.id || '');
    setSelectedEmpIds(new Set());
    showToast('Factory demonstration personnel and records restored.');
  };

  // INDIVIDUAL ITEM DELETIONS
  const handleDeletePayslip = (id: string) => {
    const next = payslips.filter(p => p.id !== id);
    setPayslips(next);
    if (selectedSlipId === id && next.length > 0) {
      setSelectedSlipId(next[0].id);
      setSlipForm(next[0]);
    }
    showToast('Payslip record removed.');
  };

  const handleDeleteLetter = (id: string) => {
    const next = letters.filter(l => l.id !== id);
    setLetters(next);
    if (selectedLetterId === id && next.length > 0) {
      setSelectedLetterId(next[0].id);
      setLetterForm(next[0]);
    }
    showToast('Letter of appointment removed.');
  };

  const handleDeleteLeaveForm = (id: string) => {
    const next = leaveForms.filter(lf => lf.id !== id);
    setLeaveForms(next);
    if (selectedLeaveId === id && next.length > 0) {
      setSelectedLeaveId(next[0].id);
      setLeaveFormState(next[0]);
    }
    showToast('Leave application removed.');
  };

  // HANDLERS FOR PAYSLIP
  const handleUpdatePayslipCalculations = (updated: Partial<EmployeePayslip>) => {
    const next = { ...slipForm, ...updated };
    // Basic calculation
    const basic = Number(next.hoursWorked || 0) * Number(next.hourlyRate || 0);
    const overtime = Number(next.overtimeHours || 0) * Number(next.overtimeRate || 0);
    const gross = basic + overtime + Number(next.allowances || 0);
    
    // Auto calculate UIF for RSA if Office Staff
    let uif = Number(next.deductionsUif || 0);
    if (next.staffCategory === 'Office Staff') {
      uif = Math.min(gross * 0.01, 177.12);
    }

    const totalDeductions = uif + Number(next.deductionsTax || 0) + Number(next.deductionsOther || 0);
    const net = Math.max(0, gross - totalDeductions);

    const calculated = {
      ...next,
      basicSalary: Number(basic.toFixed(2)),
      overtimeRate: Number(next.overtimeRate || (next.hourlyRate * 1.5).toFixed(2)),
      deductionsUif: Number(uif.toFixed(2)),
      netPay: Number(net.toFixed(2))
    };

    setSlipForm(calculated);
  };

  const handleSavePayslip = () => {
    setPayslips(payslips.map(p => p.id === slipForm.id ? slipForm : p));
    showToast(`Payslip ${slipForm.slipNumber} for ${slipForm.nameAndSurname} saved.`);
  };

  const handleCreateNewPayslip = () => {
    const rand = Math.floor(10 + Math.random() * 90);
    const matchedEmp = employees.find(e => e.id === selectedEmpId) || employees[0];
    const newSlip: EmployeePayslip = {
      id: `slip-${Date.now()}`,
      slipNumber: `PAY-2026-10-${rand}`,
      clockCardNo: matchedEmp?.clockCardNo || `CLK-${rand}`,
      nameAndSurname: matchedEmp ? `${matchedEmp.name} ${matchedEmp.surname}` : 'New Staff Member',
      staffCategory: matchedEmp?.employmentRole === 'Sub-Contractor' ? 'Sub-Contractor' : 'Office Staff',
      payPeriod: 'October 2026',
      hoursWorked: 160,
      hourlyRate: 150,
      basicSalary: 24000,
      overtimeHours: 6,
      overtimeRate: 225,
      startTime: '07:30',
      finishTime: '16:30',
      allowances: 1500,
      deductionsUif: 177.12,
      deductionsTax: 2800,
      deductionsOther: 0,
      netPay: 23872.88,
      dateGenerated: new Date().toISOString().split('T')[0],
      status: 'Draft'
    };
    setPayslips([newSlip, ...payslips]);
    setSelectedSlipId(newSlip.id);
    setSlipForm(newSlip);
    showToast('New payslip template initialized.');
  };

  // Add shift row
  const handleAddShiftRow = () => {
    const newRow: ShiftEntry = {
      id: `sh-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      dayOfWeek: 'Mon',
      startTime: slipForm.startTime || '07:30',
      finishTime: slipForm.finishTime || '16:30',
      breakMinutes: 60,
      regularHours: 8,
      overtimeHours: 0,
      notes: 'Standard hospitality duty'
    };
    const nextShifts = [...shifts, newRow];
    setShifts(nextShifts);
  };

  const handleSyncShiftsToPayslip = () => {
    handleUpdatePayslipCalculations({
      hoursWorked: totalShiftRegHours,
      overtimeHours: totalShiftOtHours
    });
    showToast(`Synced ${totalShiftRegHours} regular hours & ${totalShiftOtHours} overtime hours into payslip!`);
  };

  // APPOINTMENT LETTER HANDLERS
  const handleSaveLetter = () => {
    setLetters(letters.map(l => l.id === letterForm.id ? letterForm : l));
    showToast(`Letter of Appointment for ${letterForm.employeeName} saved.`);
  };

  const handleCreateNewLetter = () => {
    const matchedEmp = employees.find(e => e.id === selectedEmpId) || employees[0];
    const newLetter: EmployeeLetterOfAppointment = {
      id: `let-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      employeeName: matchedEmp ? `${matchedEmp.name} ${matchedEmp.surname}` : 'Candidate Name',
      employeeIdNumber: matchedEmp?.idNumber || '9001010000080',
      positionTitle: matchedEmp?.employmentRole || 'Guest House Hospitality Officer',
      department: 'Guest Services & Lagoon Operations',
      commencementDate: new Date().toISOString().split('T')[0],
      remuneration: 'ZAR 22,500.00 per month gross, payable monthly in arrears',
      workingHours: '40 hours per week rostered flexibly according to guest house occupancy',
      reportingTo: 'Eleanor Sterling (Head of Guest Experience)',
      probationPeriod: '3 (Three) Months from commencement date',
      authorizedSignatory: 'Managing Director - Tides of Knysna',
      signedByEmployee: false
    };
    setLetters([newLetter, ...letters]);
    setSelectedLetterId(newLetter.id);
    setLetterForm(newLetter);
    showToast('New Letter of Appointment generated.');
  };

  // LEAVE FORM HANDLERS
  const handleSaveLeave = (e: React.FormEvent) => {
    e.preventDefault();
    const exists = leaveForms.some(lf => lf.id === leaveFormState.id);
    if (exists) {
      setLeaveForms(leaveForms.map(lf => lf.id === leaveFormState.id ? leaveFormState : lf));
    } else {
      setLeaveForms([leaveFormState, ...leaveForms]);
      setSelectedLeaveId(leaveFormState.id);
    }
    setIsCreatingLeave(false);
    showToast(`Leave application for ${leaveFormState.nameAndSurname} saved.`);
  };

  const handleCreateNewLeave = () => {
    const matchedEmp = employees.find(e => e.id === selectedEmpId) || employees[0];
    const newLeave: EmployeeLeaveForm = {
      id: `lev-${Date.now()}`,
      nameAndSurname: matchedEmp ? `${matchedEmp.name} ${matchedEmp.surname}` : '',
      staffCategory: matchedEmp?.employmentRole === 'Sub-Contractor' ? 'Sub-Contractor' : 'Office Staff',
      clockcardNo: matchedEmp?.clockCardNo || 'CLK-101',
      leaveType: 'Annual Leave',
      dateFrom: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      dateEnd: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      totalDays: 4,
      reason: 'Personal leave / Rest and recuperation',
      employeeSignatureDate: new Date().toISOString().split('T')[0],
      managerApproval: 'Pending',
    };
    setLeaveFormState(newLeave);
    setSelectedLeaveId(newLeave.id);
    setIsCreatingLeave(true);
  };

  const formerCount = employees.filter(e => e.status === 'Former' || e.status === 'Terminated' || e.status === 'Resigned').length;
  const activeStaffCount = employees.length - formerCount;

  // Filtered employees
  const filteredEmployees = employees.filter(e => {
    const fullName = `${e.name} ${e.surname}`.toLowerCase();
    const matchesSearch = fullName.includes(contactSearch.toLowerCase()) || 
                          e.clockCardNo.toLowerCase().includes(contactSearch.toLowerCase()) ||
                          e.email.toLowerCase().includes(contactSearch.toLowerCase());
    const matchesRole = roleFilter === 'All' || e.employmentRole === roleFilter;
    const isFormer = e.status === 'Former' || e.status === 'Terminated' || e.status === 'Resigned';
    const matchesStatus = statusFilter === 'All' 
      ? true 
      : statusFilter === 'Active' 
        ? !isFormer 
        : isFormer;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-emerald-500/50 flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Check className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Module Title & Top Stats Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl no-print relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-full bg-radial from-emerald-600/10 to-transparent pointer-events-none"></div>
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-emerald-400 text-xs uppercase tracking-widest font-bold block">
                  Human Resources & Personnel Terminal
                </span>
                <h2 className="text-2xl font-bold font-serif-luxury text-white">
                  Employees & Staff Management
                </h2>
              </div>
            </div>
            <p className="text-slate-300 text-xs max-w-2xl leading-relaxed">
              Official operational HR console for <strong className="text-emerald-300">{GUEST_HOUSE_INFO.name}</strong>. 
              Manage complete employee contact dossiers, calculate clock-card hours worked with BCEA payslips, 
              issue legal letters of appointment, and process formal staff leave applications.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700/60 text-center">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Active Staff</div>
              <div className="text-lg font-bold text-emerald-400">{activeStaffCount}</div>
            </div>
            {formerCount > 0 && (
              <div className="bg-slate-800/80 px-3.5 py-2 rounded-xl border border-rose-500/40 text-center">
                <div className="text-[10px] text-rose-300 uppercase font-semibold">Former Staff</div>
                <div className="text-lg font-bold text-rose-400">{formerCount}</div>
              </div>
            )}
            <div className="bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700/60 text-center">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Generated Payslips</div>
              <div className="text-lg font-bold text-slate-200">{payslips.length}</div>
            </div>
            <div className="bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700/60 text-center">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Pending Leave</div>
              <div className="text-lg font-bold text-amber-400">
                {leaveForms.filter(lf => lf.managerApproval === 'Pending').length}
              </div>
            </div>
            <button
              onClick={() => setIsClearRecordsModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition border border-rose-400/40"
              title="Clear historical records, purge former employees, or reset operational logs"
            >
              <Trash2 className="w-4 h-4 text-white" />
              <span>Clear Records & Purge Data</span>
            </button>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center gap-2 overflow-x-auto">
          <button
            id="tab-emp-sales"
            onClick={() => setActiveTab('sales')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'sales'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Sales Performance & Targets
          </button>

          <button
            id="tab-emp-contacts"
            onClick={() => setActiveTab('contacts')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'contacts'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            Employee Contact Details ({employees.length})
          </button>

          <button
            id="tab-emp-payslips"
            onClick={() => setActiveTab('payslips')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
              activeTab === 'payslips'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Payslip Templates & Hours Tracking
          </button>

          <button
            id="tab-emp-letters"
            onClick={() => setActiveTab('letters')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
              activeTab === 'letters'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Letter of Appointment Generator
          </button>

          <button
            id="tab-emp-leave"
            onClick={() => setActiveTab('leave')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
              activeTab === 'leave'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            Leave Request Forms
          </button>

          <button
            id="tab-emp-shifts"
            onClick={() => setActiveTab('shifts')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'shifts'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                : 'bg-amber-950/40 text-amber-200 border border-amber-600/40 hover:bg-amber-900/60'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            Shift Calendar & Guest CSAT Reviews
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PERFORMANCE SUMMARY ROW (Monthly Sales, Guest CSAT & Operational Index)  */}
      {/* ========================================================================= */}
      <PerformanceSummaryRow onViewSales={() => setActiveTab('sales')} />

      {/* ========================================================================= */}
      {/* 1. EMPLOYEE CONTACT DETAILS TAB                                          */}
      {/* ========================================================================= */}
      {activeTab === 'contacts' && (
        <div className="space-y-6">
          <DocumentActionBar
            documentTitle={`Employee Contact Dossier - ${empForm.name} ${empForm.surname}`}
            documentNumber={empForm.clockCardNo}
            recipientEmail={empForm.email}
            onSave={() => showToast('Employee records safely synced to storage.')}
            customExtraButtons={
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsClearRecordsModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition"
                  title="Clear records and purge old employees"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear Records
                </button>
                <button
                  onClick={handleAddNewEmployee}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Add New Employee
                </button>
              </div>
            }
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Employee Roster Directory */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3.5 no-print">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-600" />
                    Staff Roster ({filteredEmployees.length})
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    {activeStaffCount} active • {formerCount} former
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {formerCount > 0 && (
                    <button
                      onClick={handleDeleteAllFormerEmployees}
                      className="text-[11px] text-rose-600 hover:text-rose-700 font-bold px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 border border-rose-200 flex items-center gap-1 transition"
                      title="Purge all former employees"
                    >
                      <UserX className="w-3 h-3" />
                      Purge Former
                    </button>
                  )}
                  <button
                    onClick={handleAddNewEmployee}
                    className="text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 border border-emerald-200"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    New
                  </button>
                </div>
              </div>

              {/* Status Filter Tabs (All, Active, Former) */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => setStatusFilter('All')}
                  className={`flex-1 py-1 px-2 rounded-lg font-semibold transition text-center ${
                    statusFilter === 'All'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  All ({employees.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('Active')}
                  className={`flex-1 py-1 px-2 rounded-lg font-semibold transition text-center ${
                    statusFilter === 'Active'
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Active ({activeStaffCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('Former')}
                  className={`flex-1 py-1 px-2 rounded-lg font-semibold transition text-center ${
                    statusFilter === 'Former'
                      ? 'bg-white text-rose-700 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Former ({formerCount})
                </button>
              </div>

              {/* Search & Role Filters */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={contactSearch}
                    onChange={(e) => setContactSearch(e.target.value)}
                    placeholder="Search by name, clock #, email..."
                    className="w-full text-xs pl-8 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                  />
                </div>

                <div className="flex items-center gap-1 text-[11px] overflow-x-auto pb-1">
                  {['All', 'Office Staff', 'Sub-Contractor', 'Hospitality Supervisor', 'Housekeeping', 'Estate Maintenance'].map(role => (
                    <button
                      key={role}
                      onClick={() => setRoleFilter(role)}
                      className={`px-2 py-0.5 rounded whitespace-nowrap transition ${
                        roleFilter === role
                          ? 'bg-slate-900 text-white font-semibold'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {role === 'Hospitality Supervisor' ? 'Supervisor' : role}
                    </button>
                  ))}
                </div>

                {/* Bulk Select Control Bar */}
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 text-slate-500">
                  <button
                    onClick={() => {
                      if (selectedEmpIds.size === filteredEmployees.length && filteredEmployees.length > 0) {
                        setSelectedEmpIds(new Set());
                      } else {
                        setSelectedEmpIds(new Set(filteredEmployees.map(e => e.id)));
                      }
                    }}
                    className="hover:text-slate-900 flex items-center gap-1 font-medium"
                  >
                    {selectedEmpIds.size > 0 && selectedEmpIds.size === filteredEmployees.length ? (
                      <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Square className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <span>{selectedEmpIds.size === filteredEmployees.length && filteredEmployees.length > 0 ? 'Deselect All' : 'Select All Filtered'}</span>
                  </button>

                  {formerCount > 0 && (
                    <button
                      onClick={() => {
                        const formerIds = employees.filter(e => e.status === 'Former' || e.status === 'Terminated' || e.status === 'Resigned').map(e => e.id);
                        setSelectedEmpIds(new Set(formerIds));
                      }}
                      className="text-rose-600 hover:text-rose-700 font-semibold"
                    >
                      Select All Former
                    </button>
                  )}
                </div>
              </div>

              {/* Batch Action Toolbar when items selected */}
              {selectedEmpIds.size > 0 && (
                <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg border border-slate-700 space-y-2 animate-in fade-in text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5" />
                      {selectedEmpIds.size} Staff Selected
                    </span>
                    <button
                      onClick={() => setSelectedEmpIds(new Set())}
                      className="text-[11px] text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    <button
                      onClick={() => handleBatchMarkStatus('Former')}
                      className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-semibold text-[11px] transition text-center"
                    >
                      Mark as Former
                    </button>
                    <button
                      onClick={() => handleBatchMarkStatus('Active')}
                      className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-semibold text-[11px] transition text-center"
                    >
                      Mark as Active
                    </button>
                  </div>
                  <button
                    onClick={handleRequestDeleteBatch}
                    className="w-full py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Selected ({selectedEmpIds.size})
                  </button>
                </div>
              )}

              {/* List of Employees */}
              <div className="space-y-2 max-h-[540px] overflow-y-auto pr-1">
                {filteredEmployees.map(emp => {
                  const isSelected = emp.id === selectedEmpId;
                  const isChecked = selectedEmpIds.has(emp.id);
                  const isFormer = emp.status === 'Former' || emp.status === 'Terminated' || emp.status === 'Resigned';

                  return (
                    <div
                      key={emp.id}
                      onClick={() => {
                        setSelectedEmpId(emp.id);
                        setEmpForm(emp);
                        setIsEditingContact(false);
                      }}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between gap-2 ${
                        isSelected 
                          ? 'bg-emerald-50/80 border-emerald-500 shadow-xs' 
                          : isFormer
                            ? 'bg-rose-50/40 border-rose-200 hover:bg-rose-50/70'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Checkbox */}
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            const next = new Set(selectedEmpIds);
                            if (next.has(emp.id)) next.delete(emp.id);
                            else next.add(emp.id);
                            setSelectedEmpIds(next);
                          }}
                          className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                          title="Select for batch operations"
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300" />
                          )}
                        </div>

                        {/* Avatar */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                          isFormer
                            ? 'bg-rose-100 text-rose-800'
                            : isSelected 
                              ? 'bg-emerald-600 text-white' 
                              : 'bg-slate-100 text-slate-700'
                        }`}>
                          {emp.name.charAt(0)}{emp.surname.charAt(0)}
                        </div>

                        {/* Name & details */}
                        <div className="min-w-0 truncate">
                          <div className="font-bold text-slate-900 truncate flex items-center gap-1.5">
                            <span className="truncate">{emp.name} {emp.surname}</span>
                            {isFormer && (
                              <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-rose-100 text-rose-800 border border-rose-200 shrink-0">
                                {emp.status || 'Former'}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                            <span className="font-semibold text-emerald-700">{emp.clockCardNo}</span>
                            <span>•</span>
                            <span className="truncate">{emp.employmentRole}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions on the right */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRequestDeleteEmployee(emp);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Delete employee off app"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </div>
                  );
                })}

                {filteredEmployees.length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    No employees matched the query or filter.
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Detailed Interactive Form & Official Dossier */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 printable-area">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6 flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-base shadow-sm">
                      {empForm.name ? empForm.name.charAt(0) : '?'}{empForm.surname ? empForm.surname.charAt(0) : '?'}
                    </div>
                    <div>
                      <h3 className="font-serif-luxury text-lg font-bold text-slate-900">
                        {empForm.name || 'New'} {empForm.surname || 'Employee'}
                      </h3>
                      <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[11px]">
                          Clock Card: {empForm.clockCardNo}
                        </span>
                        <span>•</span>
                        <span>Joined: {empForm.dateJoined}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 no-print">
                    <button
                      type="button"
                      onClick={() => setIsEditingContact(!isEditingContact)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 transition"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                      {isEditingContact ? 'View Mode' : 'Edit Information'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRequestDeleteEmployee(empForm)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 flex items-center gap-1.5 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete Profile
                    </button>
                  </div>
                </div>

                {/* FORM VIEW / DETAILS */}
                <form onSubmit={handleSaveContact} className="space-y-6">
                  {/* Section 1: Basic & Identification */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2 border-b border-slate-100 pb-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                      1. Employment & Personal Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Employee First Name *</label>
                        <input
                          type="text"
                          required
                          value={empForm.name}
                          onChange={(e) => setEmpForm({ ...empForm, name: e.target.value })}
                          className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
                          placeholder="e.g. Eleanor"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Employee Surname *</label>
                        <input
                          type="text"
                          required
                          value={empForm.surname}
                          onChange={(e) => setEmpForm({ ...empForm, surname: e.target.value })}
                          className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
                          placeholder="e.g. Sterling"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">RSA ID / Passport Number *</label>
                        <input
                          type="text"
                          required
                          value={empForm.idNumber}
                          onChange={(e) => setEmpForm({ ...empForm, idNumber: e.target.value })}
                          className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
                          placeholder="e.g. 8503140092084"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Employment Status</label>
                        <select
                          value={empForm.status || 'Active'}
                          onChange={(e) => setEmpForm({ ...empForm, status: e.target.value as any })}
                          className={`w-full text-xs px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 font-bold ${
                            empForm.status === 'Former' || empForm.status === 'Terminated' || empForm.status === 'Resigned'
                              ? 'bg-rose-50 border-rose-300 text-rose-800'
                              : 'bg-emerald-50 border-emerald-300 text-emerald-800'
                          }`}
                        >
                          <option value="Active">Active Employee</option>
                          <option value="Former">Former / Old Employee</option>
                          <option value="Resigned">Resigned</option>
                          <option value="Terminated">Terminated</option>
                        </select>
                      </div>

                      {(empForm.status === 'Former' || empForm.status === 'Terminated' || empForm.status === 'Resigned') && (
                        <div>
                          <label className="block text-xs font-semibold text-rose-700 mb-1">Departure / Termination Date</label>
                          <input
                            type="date"
                            value={empForm.terminationDate || ''}
                            onChange={(e) => setEmpForm({ ...empForm, terminationDate: e.target.value })}
                            className="w-full text-xs px-3 py-2 border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 bg-rose-50/50"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Employment Role / Designation</label>
                        <select
                          value={empForm.employmentRole}
                          onChange={(e) => setEmpForm({ ...empForm, employmentRole: e.target.value as any })}
                          className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
                        >
                          <option value="Office Staff">Office Staff</option>
                          <option value="Sub-Contractor">Sub-Contractor (Independent)</option>
                          <option value="Hospitality Supervisor">Hospitality Supervisor</option>
                          <option value="Housekeeping">Housekeeping & Laundry</option>
                          <option value="Estate Maintenance">Estate Maintenance & Gardens</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Clock Card Number</label>
                        <input
                          type="text"
                          required
                          value={empForm.clockCardNo}
                          onChange={(e) => setEmpForm({ ...empForm, clockCardNo: e.target.value })}
                          className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-emerald-50 font-bold text-emerald-800"
                          placeholder="CLK-101"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Date Joined / Commenced</label>
                        <input
                          type="date"
                          value={empForm.dateJoined}
                          onChange={(e) => setEmpForm({ ...empForm, dateJoined: e.target.value })}
                          className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Official / Personal Email</label>
                        <input
                          type="email"
                          value={empForm.email}
                          onChange={(e) => setEmpForm({ ...empForm, email: e.target.value })}
                          className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
                          placeholder="staff@tidesofknysna.co.za"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Direct Contact Numbers *</label>
                        <input
                          type="text"
                          required
                          value={empForm.contactNumbers}
                          onChange={(e) => setEmpForm({ ...empForm, contactNumbers: e.target.value })}
                          className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
                          placeholder="+27 82 555 4321"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Marital Status</label>
                        <select
                          value={empForm.maritalStatus}
                          onChange={(e) => setEmpForm({ ...empForm, maritalStatus: e.target.value as any })}
                          className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
                        >
                          <option value="Single">Single</option>
                          <option value="Married">Married</option>
                          <option value="Divorced">Divorced</option>
                          <option value="Widowed">Widowed</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Addresses */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2 border-b border-slate-100 pb-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      2. Residential & Postal Address
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Physical Residential Address *</label>
                        <textarea
                          rows={2}
                          required
                          value={empForm.physicalAddress}
                          onChange={(e) => setEmpForm({ ...empForm, physicalAddress: e.target.value })}
                          className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
                          placeholder="Street Address, Suburb, Town, Postal Code"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Postal Address</label>
                        <textarea
                          rows={2}
                          value={empForm.postalAddress}
                          onChange={(e) => setEmpForm({ ...empForm, postalAddress: e.target.value })}
                          className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
                          placeholder="P.O. Box / Private Bag, Town, Postal Code"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Spouse Details */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2 border-b border-slate-100 pb-1.5">
                      <Heart className="w-3.5 h-3.5 text-rose-500" />
                      3. Spouse Details (if applicable)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Spouse Name and Surname</label>
                        <input
                          type="text"
                          value={empForm.spouseNameAndSurname}
                          onChange={(e) => setEmpForm({ ...empForm, spouseNameAndSurname: e.target.value })}
                          className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
                          placeholder="e.g. David Sterling or None (Single)"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Spouse RSA ID Number</label>
                        <input
                          type="text"
                          value={empForm.spouseIdNumber}
                          onChange={(e) => setEmpForm({ ...empForm, spouseIdNumber: e.target.value })}
                          className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
                          placeholder="e.g. 8309195029081 or N/A"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 4: Next of Kin (Emergency) */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2 border-b border-slate-100 pb-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                      4. Emergency Next of Kin Contact
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Next of Kin Full Name *</label>
                        <input
                          type="text"
                          required
                          value={empForm.nextOfKinName}
                          onChange={(e) => setEmpForm({ ...empForm, nextOfKinName: e.target.value })}
                          className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
                          placeholder="e.g. David Sterling"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Relationship *</label>
                        <input
                          type="text"
                          required
                          value={empForm.nextOfKinRelationship}
                          onChange={(e) => setEmpForm({ ...empForm, nextOfKinRelationship: e.target.value })}
                          className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
                          placeholder="e.g. Spouse / Brother / Parent"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Next of Kin Contact Number *</label>
                        <input
                          type="text"
                          required
                          value={empForm.nextOfKinContact}
                          onChange={(e) => setEmpForm({ ...empForm, nextOfKinContact: e.target.value })}
                          className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
                          placeholder="+27 82 441 9920"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Form Submission Buttons */}
                  <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3 no-print">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md transition"
                    >
                      <Check className="w-4 h-4" />
                      Save Employee Record
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. PAYSLIPS & HOURS TRACKING TAB                                         */}
      {/* ========================================================================= */}
      {activeTab === 'payslips' && (
        <div className="space-y-6">
          <DocumentActionBar
            documentTitle={`Staff Payslip - ${slipForm.slipNumber}`}
            documentNumber={slipForm.slipNumber}
            onSave={handleSavePayslip}
            customExtraButtons={
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClearPayslips}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition"
                  title="Clear all payslip history"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear All Payslips
                </button>
                <button
                  onClick={() => setShowSlipPrintView(!showSlipPrintView)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                    showSlipPrintView 
                      ? 'bg-slate-900 text-white border-slate-900' 
                      : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  {showSlipPrintView ? 'Show Editor' : 'Formal Payslip View'}
                </button>
                <button
                  onClick={handleCreateNewPayslip}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Payslip
                </button>
              </div>
            }
          />

          {/* Payslip Selector & Quick Status Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4 no-print">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-bold text-slate-600">Select Existing Payslip:</span>
              <div className="flex items-center gap-2 flex-wrap">
                {payslips.map(ps => (
                  <div key={ps.id} className="flex items-center">
                    <button
                      onClick={() => {
                        setSelectedSlipId(ps.id);
                        setSlipForm(ps);
                      }}
                      className={`px-3 py-1 rounded-l-lg text-xs font-semibold transition border ${
                        ps.id === selectedSlipId
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {ps.slipNumber} ({ps.nameAndSurname.split(' ')[0]})
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePayslip(ps.id);
                      }}
                      className={`px-1.5 py-1 text-xs border-y border-r rounded-r-lg transition ${
                        ps.id === selectedSlipId
                          ? 'bg-emerald-700 border-emerald-600 text-emerald-100 hover:text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                      }`}
                      title="Delete this payslip"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {payslips.length === 0 && (
                  <span className="text-xs text-slate-400 italic">No payslips recorded. Click 'New Payslip' to start.</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 ml-auto text-xs">
              <span className="text-slate-500">Pay Status:</span>
              <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                slipForm.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                slipForm.status === 'Paid' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {slipForm.status}
              </span>
            </div>
          </div>

          {/* Printable Formal Payslip Template */}
          {showSlipPrintView ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-4xl mx-auto shadow-md printable-area space-y-6">
              {/* Formal Company Header */}
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold text-xs">
                      TK
                    </div>
                    <h2 className="font-serif-luxury text-xl font-bold tracking-tight text-slate-950">
                      {GUEST_HOUSE_INFO.name}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-600 italic">"Elegant Escapes and Fun Adventures at Tides of Knysna"</p>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    {GUEST_HOUSE_INFO.address}<br />
                    Tel: {GUEST_HOUSE_INFO.contactNumbers} | Email: {GUEST_HOUSE_INFO.email}<br />
                    VAT Registration No: 4890281928 | SARS PAYE Ref: 792019482
                  </p>
                </div>

                <div className="text-right">
                  <div className="inline-block bg-slate-900 text-white font-bold text-xs px-3 py-1 rounded tracking-widest uppercase mb-1">
                    Confidential Payslip
                  </div>
                  <div className="text-sm font-bold text-emerald-800">#{slipForm.slipNumber}</div>
                  <div className="text-xs text-slate-500">Pay Period: <strong className="text-slate-800">{slipForm.payPeriod}</strong></div>
                  <div className="text-xs text-slate-500">Date Issued: {slipForm.dateGenerated}</div>
                </div>
              </div>

              {/* Employee Particulars Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Employee Name & Surname</span>
                  <strong className="text-slate-900 text-sm">{slipForm.nameAndSurname}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Clock Card Number</span>
                  <strong className="text-emerald-800 font-bold">{slipForm.clockCardNo}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Staff Category</span>
                  <strong className="text-slate-900">{slipForm.staffCategory}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Standard Shift Times</span>
                  <strong className="text-slate-900">{slipForm.startTime} - {slipForm.finishTime}</strong>
                </div>
              </div>

              {/* Earnings & Deductions Breakdown Table */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Earnings Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-emerald-900 text-white text-xs font-bold px-4 py-2 uppercase tracking-wider">
                    Earnings Breakdown
                  </div>
                  <table className="w-full text-xs text-left">
                    <tbody className="divide-y divide-slate-100">
                      <tr className="hover:bg-slate-50">
                        <td className="px-4 py-2 text-slate-600">Basic Hours ({slipForm.hoursWorked} hrs @ R{slipForm.hourlyRate}/hr)</td>
                        <td className="px-4 py-2 font-bold text-slate-900 text-right">R {Number(slipForm.basicSalary).toFixed(2)}</td>
                      </tr>
                      <tr className="hover:bg-slate-50">
                        <td className="px-4 py-2 text-slate-600">Overtime Hours ({slipForm.overtimeHours} hrs @ R{slipForm.overtimeRate}/hr)</td>
                        <td className="px-4 py-2 font-bold text-slate-900 text-right">R {(slipForm.overtimeHours * slipForm.overtimeRate).toFixed(2)}</td>
                      </tr>
                      <tr className="hover:bg-slate-50">
                        <td className="px-4 py-2 text-slate-600">Travel / Hospitality Allowances</td>
                        <td className="px-4 py-2 font-bold text-slate-900 text-right">R {Number(slipForm.allowances).toFixed(2)}</td>
                      </tr>
                    </tbody>
                    <tfoot className="bg-slate-50 border-t border-slate-200 font-bold">
                      <tr>
                        <td className="px-4 py-2 text-slate-800">Total Gross Earnings</td>
                        <td className="px-4 py-2 text-emerald-800 text-right">
                          R {(Number(slipForm.basicSalary) + (slipForm.overtimeHours * slipForm.overtimeRate) + Number(slipForm.allowances)).toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Deductions Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-900 text-white text-xs font-bold px-4 py-2 uppercase tracking-wider">
                    Statutory Deductions & Other
                  </div>
                  <table className="w-full text-xs text-left">
                    <tbody className="divide-y divide-slate-100">
                      <tr className="hover:bg-slate-50">
                        <td className="px-4 py-2 text-slate-600">UIF (Unemployment Insurance Fund 1%)</td>
                        <td className="px-4 py-2 font-bold text-rose-700 text-right">- R {Number(slipForm.deductionsUif).toFixed(2)}</td>
                      </tr>
                      <tr className="hover:bg-slate-50">
                        <td className="px-4 py-2 text-slate-600">PAYE / Income Tax Withholding</td>
                        <td className="px-4 py-2 font-bold text-rose-700 text-right">- R {Number(slipForm.deductionsTax).toFixed(2)}</td>
                      </tr>
                      <tr className="hover:bg-slate-50">
                        <td className="px-4 py-2 text-slate-600">Staff Loan / Other Deductions</td>
                        <td className="px-4 py-2 font-bold text-rose-700 text-right">- R {Number(slipForm.deductionsOther).toFixed(2)}</td>
                      </tr>
                    </tbody>
                    <tfoot className="bg-slate-50 border-t border-slate-200 font-bold">
                      <tr>
                        <td className="px-4 py-2 text-slate-800">Total Deductions</td>
                        <td className="px-4 py-2 text-rose-800 text-right">
                          - R {(Number(slipForm.deductionsUif) + Number(slipForm.deductionsTax) + Number(slipForm.deductionsOther)).toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* NET REMUNERATION BANNER */}
              <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white p-5 rounded-2xl flex items-center justify-between shadow-lg">
                <div>
                  <span className="text-emerald-400 text-xs uppercase font-bold tracking-widest block">Net Salary Payable</span>
                  <div className="text-3xl font-extrabold text-white mt-1">
                    R {Number(slipForm.netPay).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <span className="text-xs text-slate-300">Direct Electronic Funds Transfer (EFT) to registered bank account</span>
                </div>
                <div className="text-right text-xs text-slate-300 border-l border-emerald-500/30 pl-6">
                  <div>Bank: <strong>First National Bank (FNB)</strong></div>
                  <div>Account: •••• •••• 1293</div>
                  <div className="text-emerald-400 font-semibold mt-1">Status: {slipForm.status}</div>
                </div>
              </div>

              {/* Signatures Block */}
              <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200 text-xs">
                <div>
                  <div className="border-b border-slate-400 pb-1 h-12 flex items-end">
                    <span className="font-serif-luxury italic text-slate-700">Eleanor Sterling</span>
                  </div>
                  <div className="text-[11px] font-bold text-slate-800 mt-1">Authorized Payroll Officer</div>
                  <div className="text-[10px] text-slate-500">Tides of Knysna Management</div>
                </div>

                <div>
                  <div className="border-b border-slate-400 pb-1 h-12 flex items-end">
                    <span className="font-serif-luxury italic text-slate-700">{slipForm.nameAndSurname}</span>
                  </div>
                  <div className="text-[11px] font-bold text-slate-800 mt-1">Employee Signature</div>
                  <div className="text-[10px] text-slate-500">Acknowledged receipt of payslip and hours stated</div>
                </div>
              </div>
            </div>
          ) : (
            /* Payslip Interactive Editor & Shift Log */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Payslip Financial Inputs */}
              <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    Payslip Particulars
                  </h3>
                  <span className="text-xs font-mono font-bold text-emerald-700">{slipForm.slipNumber}</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Employee Name & Surname</label>
                    <select
                      value={slipForm.nameAndSurname}
                      onChange={(e) => {
                        const emp = employees.find(emp => `${emp.name} ${emp.surname}` === e.target.value);
                        if (emp) {
                          setSlipForm({
                            ...slipForm,
                            nameAndSurname: `${emp.name} ${emp.surname}`,
                            clockCardNo: emp.clockCardNo,
                            staffCategory: emp.employmentRole === 'Sub-Contractor' ? 'Sub-Contractor' : 'Office Staff'
                          });
                        }
                      }}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
                    >
                      {employees.map(e => (
                        <option key={e.id} value={`${e.name} ${e.surname}`}>
                          {e.name} {e.surname} ({e.clockCardNo})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Staff Category</label>
                      <select
                        value={slipForm.staffCategory}
                        onChange={(e) => handleUpdatePayslipCalculations({ staffCategory: e.target.value as any })}
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
                      >
                        <option value="Office Staff">Office Staff</option>
                        <option value="Sub-Contractor">Sub-Contractor</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Pay Period</label>
                      <input
                        type="text"
                        value={slipForm.payPeriod}
                        onChange={(e) => setSlipForm({ ...slipForm, payPeriod: e.target.value })}
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
                        placeholder="e.g. September 2026"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Regular Hours Worked</label>
                      <input
                        type="number"
                        step="0.5"
                        value={slipForm.hoursWorked}
                        onChange={(e) => handleUpdatePayslipCalculations({ hoursWorked: parseFloat(e.target.value) || 0 })}
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Hourly Rate (ZAR)</label>
                      <input
                        type="number"
                        step="1"
                        value={slipForm.hourlyRate}
                        onChange={(e) => handleUpdatePayslipCalculations({ hourlyRate: parseFloat(e.target.value) || 0 })}
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Overtime Hours</label>
                      <input
                        type="number"
                        step="0.5"
                        value={slipForm.overtimeHours}
                        onChange={(e) => handleUpdatePayslipCalculations({ overtimeHours: parseFloat(e.target.value) || 0 })}
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Overtime Rate (1.5x)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={slipForm.overtimeRate}
                        onChange={(e) => handleUpdatePayslipCalculations({ overtimeRate: parseFloat(e.target.value) || 0 })}
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Shift Start Time</label>
                      <input
                        type="time"
                        value={slipForm.startTime}
                        onChange={(e) => setSlipForm({ ...slipForm, startTime: e.target.value })}
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Shift Finish Time</label>
                      <input
                        type="time"
                        value={slipForm.finishTime}
                        onChange={(e) => setSlipForm({ ...slipForm, finishTime: e.target.value })}
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Allowances (Travel/Tips)</label>
                      <input
                        type="number"
                        value={slipForm.allowances}
                        onChange={(e) => handleUpdatePayslipCalculations({ allowances: parseFloat(e.target.value) || 0 })}
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">PAYE Tax Deduction</label>
                      <input
                        type="number"
                        value={slipForm.deductionsTax}
                        onChange={(e) => handleUpdatePayslipCalculations({ deductionsTax: parseFloat(e.target.value) || 0 })}
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-rose-700"
                      />
                    </div>
                  </div>

                  {/* Summary Box */}
                  <div className="bg-slate-900 text-white p-4 rounded-xl mt-4 space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>Basic Pay:</span>
                      <span>R {Number(slipForm.basicSalary).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>Overtime Pay:</span>
                      <span>R {(slipForm.overtimeHours * slipForm.overtimeRate).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>UIF (1%):</span>
                      <span>- R {Number(slipForm.deductionsUif).toFixed(2)}</span>
                    </div>
                    <div className="border-t border-slate-700 pt-2 flex justify-between items-center text-sm font-bold">
                      <span className="text-emerald-400">Net Remuneration:</span>
                      <span className="text-emerald-300 text-base">R {Number(slipForm.netPay).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={handleSavePayslip}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 shadow-sm transition"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Save Payslip
                    </button>
                    {payslips.length > 0 && (
                      <button
                        type="button"
                        onClick={() => handleDeletePayslip(slipForm.id)}
                        className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                        title="Delete this payslip"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => setShowSlipPrintView(true)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      View
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Clock Card Interactive Hours Tracker */}
              <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      Clock Card Shift Log & Hours Tracking
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Live daily roster for Clock Card <strong>{slipForm.clockCardNo}</strong> ({slipForm.nameAndSurname})
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={handleAddShiftRow}
                      className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Add Shift
                    </button>
                    <button
                      onClick={handleSyncShiftsToPayslip}
                      className="px-3 py-1 text-xs font-bold bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Sync into Payslip
                    </button>
                    {shifts.length > 0 && (
                      <button
                        onClick={handleClearShifts}
                        className="px-2.5 py-1 text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg flex items-center gap-1"
                        title="Clear all recorded shift rows"
                      >
                        <Trash2 className="w-3 h-3" />
                        Clear Shifts
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setShifts(DEFAULT_SHIFTS);
                        showToast('Reset shifts to standard weekly roster.');
                      }}
                      className="px-2 py-1 text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg flex items-center gap-1"
                      title="Reset shifts to standard roster"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset
                    </button>
                  </div>
                </div>

                {/* Hours Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="px-3 py-2">Date / Day</th>
                        <th className="px-3 py-2">Start</th>
                        <th className="px-3 py-2">Finish</th>
                        <th className="px-3 py-2">Break</th>
                        <th className="px-3 py-2">Reg. Hrs</th>
                        <th className="px-3 py-2">OT Hrs</th>
                        <th className="px-3 py-2">Duty / Notes</th>
                        <th className="px-2 py-2"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {shifts.map((s, idx) => (
                        <tr key={s.id} className="hover:bg-slate-50/80">
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={s.date}
                              onChange={(e) => {
                                const copy = [...shifts];
                                copy[idx].date = e.target.value;
                                setShifts(copy);
                              }}
                              className="w-20 px-1 py-0.5 border border-slate-200 rounded text-slate-800 text-[11px]"
                            />
                            <span className="text-[10px] text-slate-400 block">{s.dayOfWeek}</span>
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="time"
                              value={s.startTime}
                              onChange={(e) => {
                                const copy = [...shifts];
                                copy[idx].startTime = e.target.value;
                                setShifts(copy);
                              }}
                              className="w-16 px-1 py-0.5 border border-slate-200 rounded text-[11px]"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="time"
                              value={s.finishTime}
                              onChange={(e) => {
                                const copy = [...shifts];
                                copy[idx].finishTime = e.target.value;
                                setShifts(copy);
                              }}
                              className="w-16 px-1 py-0.5 border border-slate-200 rounded text-[11px]"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              value={s.breakMinutes}
                              onChange={(e) => {
                                const copy = [...shifts];
                                copy[idx].breakMinutes = parseInt(e.target.value) || 0;
                                setShifts(copy);
                              }}
                              className="w-12 px-1 py-0.5 border border-slate-200 rounded text-[11px]"
                            />
                            <span className="text-[10px] text-slate-400">m</span>
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              step="0.5"
                              value={s.regularHours}
                              onChange={(e) => {
                                const copy = [...shifts];
                                copy[idx].regularHours = parseFloat(e.target.value) || 0;
                                setShifts(copy);
                              }}
                              className="w-12 px-1 py-0.5 border border-slate-200 rounded font-bold text-slate-800 text-[11px]"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              step="0.5"
                              value={s.overtimeHours}
                              onChange={(e) => {
                                const copy = [...shifts];
                                copy[idx].overtimeHours = parseFloat(e.target.value) || 0;
                                setShifts(copy);
                              }}
                              className="w-12 px-1 py-0.5 border border-slate-200 rounded font-bold text-amber-700 text-[11px]"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={s.notes}
                              onChange={(e) => {
                                const copy = [...shifts];
                                copy[idx].notes = e.target.value;
                                setShifts(copy);
                              }}
                              className="w-full px-1.5 py-0.5 border border-slate-200 rounded text-[11px]"
                            />
                          </td>
                          <td className="px-2 py-2 text-right">
                            <button
                              onClick={() => setShifts(shifts.filter(item => item.id !== s.id))}
                              className="text-slate-400 hover:text-rose-500 p-1"
                              title="Delete Shift Row"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50 font-bold border-t border-slate-200 text-xs">
                      <tr>
                        <td colSpan={4} className="px-3 py-2 text-right text-slate-600">Total Tracked Hours:</td>
                        <td className="px-3 py-2 text-emerald-800">{totalShiftRegHours} hrs</td>
                        <td className="px-3 py-2 text-amber-700">{totalShiftOtHours} hrs</td>
                        <td colSpan={2} className="px-3 py-2 text-slate-500 text-[11px]">
                          Grand Total: {totalShiftRegHours + totalShiftOtHours} hrs
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span className="text-emerald-900">
                      Hours log is verified against biometric clock card <strong>{slipForm.clockCardNo}</strong>.
                    </span>
                  </div>
                  <button
                    onClick={handleSyncShiftsToPayslip}
                    className="px-3 py-1 bg-emerald-700 text-white font-bold rounded-lg text-xs hover:bg-emerald-800 transition"
                  >
                    Apply Total ({totalShiftRegHours}h)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. LETTER OF APPOINTMENT GENERATOR TAB                                   */}
      {/* ========================================================================= */}
      {activeTab === 'letters' && (
        <div className="space-y-6">
          <DocumentActionBar
            documentTitle={`Letter of Appointment - ${letterForm.employeeName}`}
            documentNumber={letterForm.id}
            onSave={handleSaveLetter}
            customExtraButtons={
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClearLetters}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition"
                  title="Clear all appointment letters"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear All Letters
                </button>
                <button
                  onClick={() => setShowLetterPreview(!showLetterPreview)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                    showLetterPreview 
                      ? 'bg-slate-900 text-white border-slate-900' 
                      : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  {showLetterPreview ? 'Edit Fields' : 'Preview Document'}
                </button>
                <button
                  onClick={handleCreateNewLetter}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Appointment Letter
                </button>
              </div>
            }
          />

          {/* Letters Selector Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4 no-print">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-bold text-slate-600">Select Appointment Letter:</span>
              <div className="flex items-center gap-2 flex-wrap">
                {letters.map(l => (
                  <div key={l.id} className="flex items-center">
                    <button
                      onClick={() => {
                        setSelectedLetterId(l.id);
                        setLetterForm(l);
                      }}
                      className={`px-3 py-1 rounded-l-lg text-xs font-semibold transition border ${
                        l.id === selectedLetterId
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {l.employeeName} ({l.date})
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteLetter(l.id);
                      }}
                      className={`px-1.5 py-1 text-xs border-y border-r rounded-r-lg transition ${
                        l.id === selectedLetterId
                          ? 'bg-emerald-700 border-emerald-600 text-emerald-100 hover:text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                      }`}
                      title="Delete this letter"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {letters.length === 0 && (
                  <span className="text-xs text-slate-400 italic">No appointment letters on record. Click 'New Appointment Letter' to create.</span>
                )}
              </div>
            </div>
            {letters.length > 0 && (
              <button
                type="button"
                onClick={() => handleDeleteLetter(letterForm.id)}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
                title="Delete currently selected letter"
              >
                <Trash2 className="w-3 h-3" />
                Delete Selected Letter
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Letter Generator Controls (if in edit mode) */}
            {!showLetterPreview && (
              <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 no-print">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Edit3 className="w-4 h-4 text-emerald-600" />
                  Appointment Letter Parameters
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Select Candidate / Employee</label>
                    <select
                      value={letterForm.employeeName}
                      onChange={(e) => {
                        const matched = employees.find(emp => `${emp.name} ${emp.surname}` === e.target.value);
                        if (matched) {
                          setLetterForm({
                            ...letterForm,
                            employeeName: `${matched.name} ${matched.surname}`,
                            employeeIdNumber: matched.idNumber,
                            positionTitle: matched.employmentRole
                          });
                        }
                      }}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
                    >
                      {employees.map(e => (
                        <option key={e.id} value={`${e.name} ${e.surname}`}>
                          {e.name} {e.surname} ({e.employmentRole})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Employee RSA ID / Passport</label>
                    <input
                      type="text"
                      value={letterForm.employeeIdNumber}
                      onChange={(e) => setLetterForm({ ...letterForm, employeeIdNumber: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Position / Job Title</label>
                    <input
                      type="text"
                      value={letterForm.positionTitle}
                      onChange={(e) => setLetterForm({ ...letterForm, positionTitle: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Department</label>
                    <input
                      type="text"
                      value={letterForm.department}
                      onChange={(e) => setLetterForm({ ...letterForm, department: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Date of Letter</label>
                      <input
                        type="date"
                        value={letterForm.date}
                        onChange={(e) => setLetterForm({ ...letterForm, date: e.target.value })}
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Commencement Date</label>
                      <input
                        type="date"
                        value={letterForm.commencementDate}
                        onChange={(e) => setLetterForm({ ...letterForm, commencementDate: e.target.value })}
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Remuneration Package</label>
                    <textarea
                      rows={2}
                      value={letterForm.remuneration}
                      onChange={(e) => setLetterForm({ ...letterForm, remuneration: e.target.value })}
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Working Hours & Roster</label>
                    <textarea
                      rows={2}
                      value={letterForm.workingHours}
                      onChange={(e) => setLetterForm({ ...letterForm, workingHours: e.target.value })}
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Reporting Line</label>
                      <input
                        type="text"
                        value={letterForm.reportingTo}
                        onChange={(e) => setLetterForm({ ...letterForm, reportingTo: e.target.value })}
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Probation Period</label>
                      <input
                        type="text"
                        value={letterForm.probationPeriod}
                        onChange={(e) => setLetterForm({ ...letterForm, probationPeriod: e.target.value })}
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Authorized Employer Signatory</label>
                    <input
                      type="text"
                      value={letterForm.authorizedSignatory}
                      onChange={(e) => setLetterForm({ ...letterForm, authorizedSignatory: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="chk-emp-signed"
                      checked={letterForm.signedByEmployee}
                      onChange={(e) => setLetterForm({ ...letterForm, signedByEmployee: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <label htmlFor="chk-emp-signed" className="text-xs font-semibold text-slate-700 cursor-pointer">
                      Mark as Countersigned & Accepted by Employee
                    </label>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={handleSaveLetter}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs"
                    >
                      Save Letter
                    </button>
                    <button
                      onClick={() => setShowLetterPreview(true)}
                      className="px-4 py-2 bg-slate-800 text-white font-bold rounded-lg text-xs"
                    >
                      Preview
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Document Preview (Letterhead) */}
            <div className={`${showLetterPreview ? 'lg:col-span-12' : 'lg:col-span-7'} space-y-4`}>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-10 max-w-4xl mx-auto printable-area space-y-6 text-slate-900 font-serif leading-relaxed">
                {/* Official Letterhead Header */}
                <div className="text-center border-b-2 border-emerald-900 pb-6 space-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-700 to-slate-900 text-white mx-auto flex items-center justify-center font-bold text-lg shadow-sm">
                    TK
                  </div>
                  <h1 className="font-serif-luxury text-2xl font-bold tracking-tight text-slate-950 uppercase pt-2">
                    {GUEST_HOUSE_INFO.name}
                  </h1>
                  <p className="text-xs text-emerald-800 font-sans font-bold tracking-widest uppercase">
                    Boutique Hospitality & Luxury Guest Sanctuary
                  </p>
                  <p className="text-[11px] text-slate-500 font-sans">
                    {GUEST_HOUSE_INFO.address} | Tel: {GUEST_HOUSE_INFO.contactNumbers} | {GUEST_HOUSE_INFO.webAddress}
                  </p>
                </div>

                {/* Date & Addressee */}
                <div className="font-sans text-xs flex justify-between items-start pt-2">
                  <div>
                    <div className="font-semibold text-slate-500">PRIVATE & CONFIDENTIAL</div>
                    <div className="text-sm font-bold text-slate-900 mt-1">{letterForm.employeeName}</div>
                    <div className="text-slate-600">ID / Passport No: <strong>{letterForm.employeeIdNumber}</strong></div>
                    <div className="text-slate-600">Garden Route, Western Cape</div>
                  </div>
                  <div className="text-right">
                    <div className="text-slate-500">Date: <strong className="text-slate-800">{letterForm.date}</strong></div>
                    <div className="text-slate-500">Reference: <strong className="text-emerald-700">APP-{letterForm.id.slice(-6)}</strong></div>
                  </div>
                </div>

                {/* Letter Body */}
                <div className="space-y-4 text-xs font-sans text-slate-800 leading-relaxed pt-2">
                  <h3 className="text-base font-bold font-serif-luxury text-slate-950 border-b border-slate-200 pb-1">
                    FORMAL LETTER OF APPOINTMENT: {letterForm.positionTitle.toUpperCase()}
                  </h3>

                  <p>
                    Dear {letterForm.employeeName},
                  </p>

                  <p>
                    On behalf of <strong>{GUEST_HOUSE_INFO.name}</strong>, we are delighted to formally offer you appointment as{' '}
                    <strong>{letterForm.positionTitle}</strong> within our <strong>{letterForm.department}</strong>, subject to the terms and conditions outlined hereunder and governed by the Basic Conditions of Employment Act (BCEA) of the Republic of South Africa.
                  </p>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <span className="font-bold text-slate-700 block">1. Commencement Date:</span>
                        <span className="text-slate-900">{letterForm.commencementDate}</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-700 block">2. Reporting Line:</span>
                        <span className="text-slate-900">{letterForm.reportingTo}</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-700 block">3. Remuneration:</span>
                        <span className="text-emerald-800 font-bold">{letterForm.remuneration}</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-700 block">4. Probationary Period:</span>
                        <span className="text-slate-900">{letterForm.probationPeriod}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">5. Working Hours & Shift Roster</h4>
                    <p className="text-slate-700">
                      {letterForm.workingHours}. Working hours may be adjusted in accordance with guest occupancy levels, 
                      hospitality events, and seasonal requirements, with due regard to statutory rest intervals.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">6. Standard Leave Entitlements</h4>
                    <p className="text-slate-700">
                      You are entitled to 21 consecutive days of fully paid Annual Leave per completed 12-month cycle, 
                      paid Sick Leave upon provision of a registered medical practitioner's certificate, and Family Responsibility 
                      Leave in accordance with South African labour statutes.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">7. Confidentiality & Guest House Standards</h4>
                    <p className="text-slate-700">
                      As an exclusive establishment accommodating VIP patrons and international guests, 
                      strict confidentiality regarding guest identities, booking itineraries, and proprietary 
                      operations is an express condition of your employment.
                    </p>
                  </div>

                  <p className="pt-2">
                    Please confirm your acceptance of this appointment by signing and dating the acceptance section below and returning a copy to Human Resources.
                  </p>
                </div>

                {/* Signatures Area */}
                <div className="pt-8 border-t border-slate-300 font-sans text-xs space-y-6">
                  {/* Employer Signatory */}
                  <div>
                    <p className="text-slate-600 mb-2">Yours faithfully,</p>
                    <div className="border-b border-slate-400 pb-1 h-10 w-64 flex items-end">
                      <span className="font-serif-luxury italic text-slate-800 font-bold">{letterForm.authorizedSignatory}</span>
                    </div>
                    <div className="font-bold text-slate-900 mt-1">{letterForm.authorizedSignatory}</div>
                    <div className="text-[11px] text-slate-500">For and on behalf of {GUEST_HOUSE_INFO.name}</div>
                  </div>

                  {/* Employee Acceptance Block */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                      Employee Acceptance of Appointment
                    </h4>
                    <p className="text-[11px] text-slate-600">
                      I, <strong>{letterForm.employeeName}</strong> (ID: {letterForm.employeeIdNumber}), hereby confirm my acceptance of the appointment and agree to be bound by the terms and conditions outlined in this letter and guest house regulations.
                    </p>
                    <div className="grid grid-cols-2 gap-6 pt-3">
                      <div>
                        <div className="border-b border-slate-400 pb-1 h-8 flex items-end">
                          <span className="font-serif-luxury italic text-slate-800">
                            {letterForm.signedByEmployee ? letterForm.employeeName : ''}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1">Signature of Employee</div>
                      </div>
                      <div>
                        <div className="border-b border-slate-400 pb-1 h-8 flex items-end">
                          <span className="text-slate-800 text-xs">{letterForm.signedByEmployee ? letterForm.commencementDate : ''}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1">Date Signed</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. LEAVE REQUEST FORMS TAB                                               */}
      {/* ========================================================================= */}
      {activeTab === 'leave' && (
        <div className="space-y-6">
          <DocumentActionBar
            documentTitle={`Leave Application - ${leaveFormState.nameAndSurname}`}
            documentNumber={leaveFormState.clockcardNo}
            onSave={() => showToast('Leave application saved.')}
            customExtraButtons={
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClearLeaveForms}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition"
                  title="Clear all leave request records"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear All Leave Records
                </button>
                <button
                  onClick={handleCreateNewLeave}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Leave Application
                </button>
              </div>
            }
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Leave Applications Registry */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-4 no-print">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-emerald-600" />
                  Leave Applications ({leaveForms.length})
                </h3>
                <div className="flex items-center gap-2">
                  {leaveForms.length > 0 && (
                    <button
                      onClick={handleClearLeaveForms}
                      className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1"
                      title="Clear all leave records"
                    >
                      <Trash2 className="w-3 h-3" />
                      Clear All
                    </button>
                  )}
                  <button
                    onClick={handleCreateNewLeave}
                    className="text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    New Request
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-[550px] overflow-y-auto">
                {leaveForms.map(lf => {
                  const isSelected = lf.id === selectedLeaveId;
                  return (
                    <div
                      key={lf.id}
                      onClick={() => {
                        setSelectedLeaveId(lf.id);
                        setLeaveFormState(lf);
                        setIsCreatingLeave(false);
                      }}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition ${
                        isSelected 
                          ? 'bg-emerald-50 border-emerald-500 shadow-xs' 
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900">{lf.nameAndSurname}</span>
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            lf.managerApproval === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                            lf.managerApproval === 'Declined' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {lf.managerApproval}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteLeaveForm(lf.id);
                            }}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Delete this leave request"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <div className="text-slate-500 flex items-center justify-between text-[11px]">
                        <span>{lf.leaveType} ({lf.totalDays} Days)</span>
                        <span className="text-slate-400">{lf.dateFrom} to {lf.dateEnd}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate mt-1 italic">
                        "{lf.reason}"
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Interactive Leave Application Certificate Form */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 printable-area">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6 flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                      <CalendarDays className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-serif-luxury font-bold text-slate-900 text-base">
                        Staff Leave Application & Approval Form
                      </h3>
                      <p className="text-xs text-slate-500">{GUEST_HOUSE_INFO.name} Human Resources Protocol</p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    leaveFormState.managerApproval === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                    leaveFormState.managerApproval === 'Declined' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    Status: {leaveFormState.managerApproval}
                  </span>
                </div>

                <form onSubmit={handleSaveLeave} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Employee Name & Surname *</label>
                      <select
                        value={leaveFormState.nameAndSurname}
                        onChange={(e) => {
                          const emp = employees.find(emp => `${emp.name} ${emp.surname}` === e.target.value);
                          if (emp) {
                            setLeaveFormState({
                              ...leaveFormState,
                              nameAndSurname: `${emp.name} ${emp.surname}`,
                              clockcardNo: emp.clockCardNo,
                              staffCategory: emp.employmentRole === 'Sub-Contractor' ? 'Sub-Contractor' : 'Office Staff'
                            });
                          }
                        }}
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
                      >
                        {employees.map(e => (
                          <option key={e.id} value={`${e.name} ${e.surname}`}>
                            {e.name} {e.surname}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Staff Category</label>
                      <select
                        value={leaveFormState.staffCategory}
                        onChange={(e) => setLeaveFormState({ ...leaveFormState, staffCategory: e.target.value as any })}
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
                      >
                        <option value="Office Staff">Office Staff</option>
                        <option value="Sub-Contractor">Sub-Contractor</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Clock Card Number</label>
                      <input
                        type="text"
                        value={leaveFormState.clockcardNo}
                        onChange={(e) => setLeaveFormState({ ...leaveFormState, clockcardNo: e.target.value })}
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-emerald-50 font-bold text-emerald-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Type of Leave Requested *</label>
                      <select
                        value={leaveFormState.leaveType}
                        onChange={(e) => setLeaveFormState({ ...leaveFormState, leaveType: e.target.value as any })}
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white font-semibold text-slate-800"
                      >
                        <option value="Annual Leave">Annual Leave (Paid)</option>
                        <option value="Sick Leave">Sick Leave (Medical Certificate)</option>
                        <option value="Maternity / Paternity">Maternity / Paternity Leave</option>
                        <option value="Family Responsibility">Family Responsibility Leave</option>
                        <option value="Study Leave">Study / Exam Leave</option>
                        <option value="Unpaid Leave">Unpaid Leave</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Date From *</label>
                      <input
                        type="date"
                        required
                        value={leaveFormState.dateFrom}
                        onChange={(e) => setLeaveFormState({ ...leaveFormState, dateFrom: e.target.value })}
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Date End (Inclusive) *</label>
                      <input
                        type="date"
                        required
                        value={leaveFormState.dateEnd}
                        onChange={(e) => setLeaveFormState({ ...leaveFormState, dateEnd: e.target.value })}
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Total Days of Leave *</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={leaveFormState.totalDays}
                        onChange={(e) => setLeaveFormState({ ...leaveFormState, totalDays: parseInt(e.target.value) || 1 })}
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-bold"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-slate-700 font-semibold mb-1">Reason / Purpose of Leave *</label>
                      <input
                        type="text"
                        required
                        value={leaveFormState.reason}
                        onChange={(e) => setLeaveFormState({ ...leaveFormState, reason: e.target.value })}
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                        placeholder="e.g. Annual family holiday or medical procedure"
                      />
                    </div>
                  </div>

                  {/* Manager Approval Box */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 mt-4">
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Management Review & Approval
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">Manager Decision</label>
                        <select
                          value={leaveFormState.managerApproval}
                          onChange={(e) => setLeaveFormState({ 
                            ...leaveFormState, 
                            managerApproval: e.target.value as any,
                            managerSignatureDate: new Date().toISOString().split('T')[0]
                          })}
                          className={`w-full text-xs px-3 py-2 border rounded-lg font-bold ${
                            leaveFormState.managerApproval === 'Approved' ? 'bg-emerald-50 border-emerald-400 text-emerald-800' :
                            leaveFormState.managerApproval === 'Declined' ? 'bg-rose-50 border-rose-400 text-rose-800' : 'bg-white border-slate-300 text-amber-700'
                          }`}
                        >
                          <option value="Pending">Pending Review</option>
                          <option value="Approved">Approved (Roster Covered)</option>
                          <option value="Declined">Declined (Peak Season / Staff Shortage)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">Review Date</label>
                        <input
                          type="date"
                          value={leaveFormState.managerSignatureDate || new Date().toISOString().split('T')[0]}
                          onChange={(e) => setLeaveFormState({ ...leaveFormState, managerSignatureDate: e.target.value })}
                          className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2 no-print">
                    {leaveForms.length > 0 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteLeaveForm(leaveFormState.id)}
                        className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Application
                      </button>
                    )}
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md"
                    >
                      <Check className="w-4 h-4" />
                      Save & Confirm Leave Form
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. SALES PERFORMANCE & MONTHLY TARGETS DASHBOARD                         */}
      {/* ========================================================================= */}
      {activeTab === 'sales' && (
        <SalesPerformanceDashboard reservations={reservations} />
      )}

      {/* ========================================================================= */}
      {/* 6. STAFF SHIFT CALENDAR & GUEST CSAT REVIEWS                              */}
      {/* ========================================================================= */}
      {activeTab === 'shifts' && (() => {
        const storedSurveys = getStoredGuestSurveys();
        const totalSurv = storedSurveys.length;
        const avgStaffHelp = totalSurv > 0
          ? (storedSurveys.reduce((acc, s) => acc + s.staffHelpfulnessScore, 0) / totalSurv).toFixed(1)
          : '5.0';
        const avgClean = totalSurv > 0
          ? (storedSurveys.reduce((acc, s) => acc + s.cleanlinessScore, 0) / totalSurv).toFixed(1)
          : '5.0';

        const shiftSlots = [
          { shiftName: 'Morning Reception & Breakfast Briefing', time: '06:30 - 15:00', defaultStaff: 'Maria Cloete', role: 'Housekeeping & Welcome Protocol' },
          { shiftName: 'Executive Day Operations & Concierge', time: '08:00 - 17:00', defaultStaff: 'Eleanor Sterling', role: 'Duty Manager & Excursion Bookings' },
          { shiftName: 'Sunset Terrace & F&B Lounge Service', time: '14:00 - 22:30', defaultStaff: 'Liam Vance', role: 'F&B Director & Lagoon Sundowners' },
          { shiftName: 'Night Security & Late Check-In Roster', time: '22:00 - 07:00', defaultStaff: 'Sipho Ndlovu', role: 'Night Duty & Keycard Escort' }
        ];

        return (
          <div className="space-y-6">
            <DocumentActionBar
              documentTitle="Staff Shift Calendar & Duty Roster"
              documentNumber="ROST-2026-WK39"
              onSave={() => showToast('Staff shift roster and guest satisfaction metrics saved.')}
            />

            {/* Top Quality & Staff CSAT Header */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-emerald-950 text-white rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="p-2 bg-amber-500/20 text-amber-300 rounded-xl border border-amber-500/30">
                      <Clock className="w-5 h-5" />
                    </span>
                    <h3 className="font-serif-luxury font-bold text-lg text-white">
                      Hospitality Shift Calendar & Resident Guest Reviews
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300">
                    Live operational duty schedule synchronized with resident guest satisfaction ratings and staff commendations.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-700 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Staff Helpfulness CSAT</span>
                    <span className="text-xl font-black text-amber-400 font-serif-luxury">{avgStaffHelp} / 5.0</span>
                  </div>
                  <div className="bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-700 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Cleanliness Index</span>
                    <span className="text-xl font-black text-emerald-400 font-serif-luxury">{avgClean} / 5.0</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 flex-wrap gap-2">
                <span>Roster Week: 28 September - 04 October 2026</span>
                <span className="text-emerald-400">✓ Fully Staffed & Graded 5-Star Service Standard</span>
              </div>
            </div>

            {/* Shift Calendar Grid */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  Weekly Duty Shifts & On-Call Coverage
                </h4>
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Shift Roster (Laser/Inkjet)
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {shiftSlots.map((slot, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">{slot.shiftName}</span>
                      <span className="text-[10px] font-mono font-bold bg-slate-200 text-slate-800 px-2 py-0.5 rounded">
                        {slot.time}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-1">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Assigned Team Member</span>
                        <strong className="text-slate-900">{slot.defaultStaff}</strong>
                      </div>
                      <span className="text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                        {slot.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Guest Satisfaction Feedback Tied to Shifts */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-500" />
                    Resident Guest Commendations Awarded to Shift Staff
                  </h4>
                  <p className="text-xs text-slate-500">
                    Real-time feedback captured from the Guest Satisfaction Survey module.
                  </p>
                </div>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  {storedSurveys.length} Verified Entries
                </span>
              </div>

              <div className="space-y-3">
                {storedSurveys.map((surv) => (
                  <div key={surv.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong className="text-slate-900">{surv.guestName}</strong>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500">Suite {surv.roomNumber} ({surv.roomAllocation})</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-[10px] font-mono text-slate-400">{surv.timestamp}</span>
                      </div>
                      <p className="text-slate-600 italic">"{surv.comments}"</p>
                      {surv.staffMemberMentioned && (
                        <div className="text-[11px] text-emerald-800 font-bold flex items-center gap-1 pt-0.5">
                          ⭐ Commendation: {surv.staffMemberMentioned}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block font-bold">Staff Helpfulness</span>
                        <span className="text-sm font-black text-amber-600">{surv.staffHelpfulnessScore} / 5</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Clear Records & Staff Data Maintenance Modal */}
      <ClearRecordsModal
        isOpen={isClearRecordsModalOpen}
        onClose={() => setIsClearRecordsModalOpen(false)}
        employees={employees}
        payslips={payslips}
        shifts={shifts}
        letters={letters}
        leaveForms={leaveForms}
        onDeleteOldEmployees={handleDeleteAllFormerEmployees}
        onClearShifts={handleClearShifts}
        onClearPayslips={handleClearPayslips}
        onClearLeaveForms={handleClearLeaveForms}
        onClearLetters={handleClearLetters}
        onClearAllRecords={handleClearAllRecords}
        onRestoreDefaults={handleRestoreDefaults}
      />

      {/* Delete Employee Confirmation Modal */}
      <DeleteEmployeeModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setEmployeesToDelete([]);
        }}
        employeesToDelete={employeesToDelete}
        onConfirmDelete={handleConfirmDeleteEmployees}
      />
    </div>
  );
};
