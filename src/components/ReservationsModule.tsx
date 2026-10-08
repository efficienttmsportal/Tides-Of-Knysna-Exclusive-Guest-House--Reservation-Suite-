import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Calendar, 
  User, 
  CreditCard, 
  FileText, 
  Sparkles, 
  MapPin, 
  BedDouble, 
  Phone, 
  Mail, 
  Star, 
  Paperclip, 
  Upload, 
  Eye, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  ShieldCheck,
  Download,
  Printer,
  Compass,
  AlertTriangle,
  History,
  Clock,
  FolderOpen
} from 'lucide-react';
import { DocumentActionBar } from './DocumentActionBar';
import { DeleteOldReservationsModal } from './DeleteOldReservationsModal';
import { Reservation, DocumentAttachment, PaymentMethod, PaymentStatus } from '../types';
import { GUEST_HOUSE_INFO } from '../data/initialData';
import { CompanyInfoData } from './CompanyInfoModule';
import { GuestFolderModule } from './GuestFolderModule';

interface ReservationsModuleProps {
  reservations: Reservation[];
  onUpdateReservations: (updated: Reservation[]) => void;
  companyInfo?: CompanyInfoData;
}

export const ReservationsModule: React.FC<ReservationsModuleProps> = ({
  reservations,
  onUpdateReservations,
  companyInfo,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResId, setSelectedResId] = useState<string>(reservations[0]?.id || '');
  const [isEditing, setIsEditing] = useState(false);
  const [activeGuestFolderReservation, setActiveGuestFolderReservation] = useState<Reservation | null>(null);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [showDeleteOldModal, setShowDeleteOldModal] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'upcoming' | 'old'>('all');

  // Form State for active or new reservation
  const activeReservation = reservations.find(r => r.id === selectedResId) || reservations[0];

  // Helper to determine if a reservation checkout date has passed (Current date: 2026-09-27)
  const todayStr = '2026-09-27';
  const isOldReservation = (res: Reservation) => {
    return Boolean(res.checkOutDate && res.checkOutDate < todayStr);
  };

  const oldReservations = reservations.filter(isOldReservation);
  const upcomingReservations = reservations.filter(r => !isOldReservation(r));

  const [formData, setFormData] = useState<Partial<Reservation>>(
    activeReservation ? { ...activeReservation } : {}
  );

  // When selected reservation changes, update form data
  React.useEffect(() => {
    if (activeReservation) {
      setFormData({ ...activeReservation });
    }
  }, [selectedResId]);

  const filteredReservations = reservations
    .filter(r => {
      if (filterMode === 'upcoming') return !isOldReservation(r);
      if (filterMode === 'old') return isOldReservation(r);
      return true;
    })
    .filter(r => 
      r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.customerSurname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.reservationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.roomNumber.includes(searchTerm)
    );

  const handleStartNew = () => {
    const newId = `res-${Date.now()}`;
    const newResNumber = `TOK-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRes: Reservation = {
      id: newId,
      reservationNumber: newResNumber,
      customerName: '',
      customerSurname: '',
      email: '',
      contactNumber: '+27 ',
      idOrPassportNumber: '',
      roomNumber: '101',
      roomAllocation: 'Lagoon Serenade Suite (Executive King)',
      checkInDate: new Date().toISOString().split('T')[0],
      checkOutDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      numberOfGuests: 2,
      ratePerNightPerPerson: 2850,
      totalNights: 3,
      totalRoomCost: 8550,
      breakageDepositAmount: 2500,
      breakageDepositStatus: 'Held',
      paymentMethod: 'Credit Card',
      paymentStatus: 'Pending',
      salesPerson: GUEST_HOUSE_INFO.salesPerson,
      ratingService: 5,
      specialRequests: '',
      specialTravelRequirements: '',
      nearbySightseeingInterests: ['Featherbed Nature Reserve Eco Tour', 'Knysna Waterfront Lagoon Cruise'],
      documents: [],
      notes: '',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };
    setFormData(newRes);
    setSelectedResId(newId);
    setIsEditing(true);
  };

  const handleSaveForm = () => {
    if (!formData.customerName || !formData.customerSurname) {
      alert('Please enter guest name and surname.');
      return;
    }

    // Calculate nights & total
    const checkIn = new Date(formData.checkInDate || '');
    const checkOut = new Date(formData.checkOutDate || '');
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24))) || 1;
    const guests = formData.numberOfGuests || 1;
    const rate = formData.ratePerNightPerPerson || 2500;
    const totalCost = nights * rate;

    const updatedRes: Reservation = {
      ...(formData as Reservation),
      totalNights: nights,
      totalRoomCost: totalCost,
      id: formData.id || `res-${Date.now()}`,
      reservationNumber: formData.reservationNumber || `TOK-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: formData.createdAt || new Date().toISOString().replace('T', ' ').slice(0, 16)
    };

    const exists = reservations.some(r => r.id === updatedRes.id);
    let updatedList: Reservation[];
    if (exists) {
      updatedList = reservations.map(r => r.id === updatedRes.id ? updatedRes : r);
    } else {
      updatedList = [updatedRes, ...reservations];
    }

    onUpdateReservations(updatedList);
    setSelectedResId(updatedRes.id);
    setIsEditing(false);
  };

  const handleDelete = (id: string) => {
    const resToDelete = reservations.find(r => r.id === id);
    const isOld = resToDelete && isOldReservation(resToDelete);
    const confirmMsg = isOld 
      ? `Permanently delete old reservation #${resToDelete?.reservationNumber} (${resToDelete?.customerName} ${resToDelete?.customerSurname})?`
      : `Are you sure you want to cancel and remove reservation #${resToDelete?.reservationNumber || id}?`;

    if (confirm(confirmMsg)) {
      const updated = reservations.filter(r => r.id !== id);
      onUpdateReservations(updated);
      if (selectedResId === id && updated.length > 0) {
        setSelectedResId(updated[0].id);
      }
    }
  };

  const handleDeleteOldSelected = (ids: string[]) => {
    const updated = reservations.filter(r => !ids.includes(r.id));
    onUpdateReservations(updated);
    if (selectedResId && ids.includes(selectedResId)) {
      setSelectedResId(updated[0]?.id || '');
    }
  };

  const handleDeleteAllOld = () => {
    const updated = reservations.filter(r => !isOldReservation(r));
    onUpdateReservations(updated);
    if (selectedResId && activeReservation && isOldReservation(activeReservation)) {
      setSelectedResId(updated[0]?.id || '');
    }
  };

  const handleFileUpload = (file: File, type: string) => {
    const newDoc: DocumentAttachment = {
      id: `doc-${Date.now()}`,
      name: file.name,
      type: type as any,
      uploadedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      fileSize: `${(file.size / 1024).toFixed(1)} KB`
    };

    const updatedDocs = [...(formData.documents || []), newDoc];
    setFormData(prev => ({ ...prev, documents: updatedDocs }));

    // Also persist
    if (activeReservation) {
      const updatedList = reservations.map(r => 
        r.id === activeReservation.id ? { ...r, documents: updatedDocs } : r
      );
      onUpdateReservations(updatedList);
    }
  };

  const toggleSightseeingInterest = (place: string) => {
    const current = formData.nearbySightseeingInterests || [];
    if (current.includes(place)) {
      setFormData(prev => ({
        ...prev,
        nearbySightseeingInterests: current.filter(p => p !== place)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        nearbySightseeingInterests: [...current, place]
      }));
    }
  };

  const sightseeingOptions = [
    'Featherbed Nature Reserve Eco Tour',
    'Knysna Elephant Park Sanctuary',
    'Robberg Nature Reserve Peninsula Trail (Plett)',
    'Springtide Ocean & Lagoon Sunset Catamaran Cruise',
    'Bramon Wine Estate Cap Classique Tasting',
    'Tsitsikamma Canopy & Suspension Bridge Tour',
    'Simola Golf & Country Club Excursion',
    'Wild Oats Community Farmers Market (Sedgefield)'
  ];

  return (
    <div className="space-y-6">
      {/* Top Document Action Bar for Reservations */}
      <DocumentActionBar
        documentTitle={`Reservation Record - ${formData.customerName || ''} ${formData.customerSurname || ''}`}
        documentNumber={formData.reservationNumber}
        recipientEmail={formData.email}
        onSave={handleSaveForm}
        onUploadScan={handleFileUpload}
        customExtraButtons={
          <button
            onClick={() => setShowVoucherModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition shadow-sm"
          >
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
            View Guest Voucher
          </button>
        }
      />

      {/* Main Reservation Split Screen Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Reservation List & Filter (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs p-4 flex flex-col h-full no-print">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Guest Bookings Directory</h3>
              <span className="text-[11px] text-slate-500">{filteredReservations.length} records shown</span>
            </div>
            <div className="flex items-center gap-1.5">
              {oldReservations.length > 0 && (
                <button
                  id="btn-delete-old-reservations"
                  onClick={() => setShowDeleteOldModal(true)}
                  className="flex items-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-2 py-1.5 rounded-lg text-xs font-bold transition shadow-xs"
                  title="Open Delete Old Reservations Manager"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Delete Old ({oldReservations.length})</span>
                </button>
              )}
              <button
                id="btn-new-reservation"
                onClick={handleStartNew}
                className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                New Booking
              </button>
            </div>
          </div>

          {/* Filter Mode Selector */}
          <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl mb-3 text-[11px] font-semibold">
            <button
              onClick={() => setFilterMode('all')}
              className={`py-1 rounded-lg transition text-center ${
                filterMode === 'all' 
                  ? 'bg-white text-slate-900 shadow-xs font-bold' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({reservations.length})
            </button>
            <button
              onClick={() => setFilterMode('upcoming')}
              className={`py-1 rounded-lg transition text-center ${
                filterMode === 'upcoming' 
                  ? 'bg-white text-slate-900 shadow-xs font-bold' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active ({upcomingReservations.length})
            </button>
            <button
              onClick={() => setFilterMode('old')}
              className={`py-1 rounded-lg transition text-center flex items-center justify-center gap-1 ${
                filterMode === 'old' 
                  ? 'bg-rose-600 text-white shadow-xs font-bold' 
                  : 'text-rose-700 hover:text-rose-900'
              }`}
            >
              Past ({oldReservations.length})
            </button>
          </div>

          {/* Search bar */}
          <div className="relative mb-3">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, room, or ref #..."
              className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* List items */}
          <div className="space-y-2 overflow-y-auto max-h-[620px] pr-1">
            {filteredReservations.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No matching reservations found.
              </div>
            ) : (
              filteredReservations.map((res) => {
                const isSelected = res.id === selectedResId;
                const isOld = isOldReservation(res);
                return (
                  <div
                    key={res.id}
                    id={`res-item-${res.id}`}
                    onClick={() => {
                      setSelectedResId(res.id);
                      setIsEditing(false);
                    }}
                    className={`p-3 rounded-xl border transition cursor-pointer relative group ${
                      isSelected
                        ? 'bg-emerald-50/80 border-emerald-400 shadow-xs'
                        : isOld
                        ? 'bg-slate-50/80 hover:bg-slate-100 border-slate-200'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11px] font-bold text-emerald-800">
                          {res.reservationNumber}
                        </span>
                        {isOld && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 border border-rose-200">
                            Old / Past
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveGuestFolderReservation(res);
                          }}
                          className="p-1 rounded transition text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50"
                          title="Open Guest Folder, Invoices & Letters"
                        >
                          <FolderOpen className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 text-white">
                          Suite {res.roomNumber}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(res.id);
                          }}
                          className={`p-1 rounded transition text-slate-400 hover:text-rose-600 hover:bg-rose-50 ${
                            isOld ? 'opacity-90' : 'opacity-0 group-hover:opacity-100'
                          }`}
                          title={isOld ? "Delete old completed reservation" : "Delete reservation"}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="text-xs font-bold text-slate-900">
                      {res.customerName} {res.customerSurname}
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center justify-between mt-1">
                      <span>{res.checkInDate} → {res.checkOutDate}</span>
                      <span className="font-semibold text-slate-700">R {res.totalRoomCost.toLocaleString()}</span>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100 text-[10px]">
                      <span className={`px-1.5 py-0.5 rounded font-bold ${
                        res.paymentStatus === 'Paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : res.paymentStatus === 'Deposit Paid'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {res.paymentStatus}
                      </span>
                      <span className="text-slate-400">
                        Dep: <strong className="text-slate-600">R {res.breakageDepositAmount}</strong> ({res.breakageDepositStatus})
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Reservation Form & Detail View (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          {/* Header row */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-900 text-emerald-300">
                  {formData.reservationNumber || 'New Reservation'}
                </span>
                {activeReservation && isOldReservation(activeReservation) && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-rose-600" />
                    Past / Old Booking
                  </span>
                )}
                <span className="text-xs text-slate-400">
                  Created: {formData.createdAt || 'Just now'}
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-1">
                {formData.customerName || formData.customerSurname 
                  ? `${formData.customerName} ${formData.customerSurname}` 
                  : 'New Guest Stay Form'}
              </h2>
            </div>

            <div className="flex items-center gap-2 no-print">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 border ${
                  isEditing
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                {isEditing ? 'Viewing Mode' : 'Edit Form'}
              </button>

              <button
                onClick={handleSaveForm}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
              >
                Save Reservation
              </button>

              {activeReservation && (
                <button
                  type="button"
                  onClick={() => setActiveGuestFolderReservation(activeReservation)}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-emerald-300 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm border border-slate-700"
                  title="Open full guest dossier with Tax Invoice, receipts, letters & policies"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-emerald-400" />
                  Guest Folder & Invoicing
                </button>
              )}

              {formData.id && (
                activeReservation && isOldReservation(activeReservation) ? (
                  <button
                    onClick={() => handleDelete(formData.id!)}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                    title="Delete this old completed reservation"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Old Booking
                  </button>
                ) : (
                  <button
                    onClick={() => handleDelete(formData.id!)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition rounded-lg"
                    title="Delete reservation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )
              )}
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="space-y-6">
            {/* Section 1: Guest Personal & Identity Information */}
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <User className="w-4 h-4 text-emerald-600" />
                Guest Details & Identification
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Name</label>
                  <input
                    type="text"
                    value={formData.customerName || ''}
                    disabled={!isEditing}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                    placeholder="e.g. Julian"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Surname</label>
                  <input
                    type="text"
                    value={formData.customerSurname || ''}
                    disabled={!isEditing}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerSurname: e.target.value }))}
                    placeholder="e.g. Vanderbilt"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Passport / ID Number</label>
                  <input
                    type="text"
                    value={formData.idOrPassportNumber || ''}
                    disabled={!isEditing}
                    onChange={(e) => setFormData(prev => ({ ...prev, idOrPassportNumber: e.target.value }))}
                    placeholder="e.g. GB940281902"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-50 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    disabled={!isEditing}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="guest@example.com"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone Number</label>
                  <input
                    type="text"
                    value={formData.contactNumber || ''}
                    disabled={!isEditing}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactNumber: e.target.value }))}
                    placeholder="+27 82 555 4321"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sales Person / Concierge</label>
                  <input
                    type="text"
                    value={formData.salesPerson || GUEST_HOUSE_INFO.salesPerson}
                    disabled={!isEditing}
                    onChange={(e) => setFormData(prev => ({ ...prev, salesPerson: e.target.value }))}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-50"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Room Allocation & Stay Dates */}
            <div className="pt-2 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <BedDouble className="w-4 h-4 text-emerald-600" />
                Room Allocation & Dates of Stay
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Room Allocation</label>
                  <select
                    value={formData.roomNumber || '101'}
                    disabled={!isEditing}
                    onChange={(e) => {
                      const roomNo = e.target.value;
                      const roomObj = GUEST_HOUSE_INFO.rooms.find(r => r.number === roomNo);
                      setFormData(prev => ({
                        ...prev,
                        roomNumber: roomNo,
                        roomAllocation: roomObj ? `${roomObj.name} (${roomObj.type})` : `Suite ${roomNo}`,
                        ratePerNightPerPerson: roomObj ? roomObj.defaultRate : prev.ratePerNightPerPerson
                      }));
                    }}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-50"
                  >
                    {GUEST_HOUSE_INFO.rooms.map(room => (
                      <option key={room.number} value={room.number}>
                        Suite {room.number}: {room.name} (R {room.defaultRate}/nt)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Check-in Date</label>
                  <input
                    type="date"
                    value={formData.checkInDate || ''}
                    disabled={!isEditing}
                    onChange={(e) => setFormData(prev => ({ ...prev, checkInDate: e.target.value }))}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Check-out Date</label>
                  <input
                    type="date"
                    value={formData.checkOutDate || ''}
                    disabled={!isEditing}
                    onChange={(e) => setFormData(prev => ({ ...prev, checkOutDate: e.target.value }))}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Number of Guests</label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={formData.numberOfGuests || 2}
                    disabled={!isEditing}
                    onChange={(e) => setFormData(prev => ({ ...prev, numberOfGuests: parseInt(e.target.value) || 1 }))}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-50"
                  />
                </div>
              </div>

              {/* Financial calculations card */}
              <div className="mt-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block">Rate Per Night / Person:</span>
                  <div className="flex items-center gap-1 font-bold text-slate-900 mt-0.5">
                    <span>R</span>
                    <input
                      type="number"
                      value={formData.ratePerNightPerPerson || 2500}
                      disabled={!isEditing}
                      onChange={(e) => setFormData(prev => ({ ...prev, ratePerNightPerPerson: parseFloat(e.target.value) || 0 }))}
                      className="w-24 text-xs p-1 border rounded bg-white disabled:bg-transparent disabled:border-none"
                    />
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 block">Total Stay Duration:</span>
                  <strong className="text-slate-900 block mt-0.5">{formData.totalNights || 1} Nights</strong>
                </div>

                <div>
                  <span className="text-slate-500 block">Calculated Total Room Cost:</span>
                  <strong className="text-emerald-700 text-sm block mt-0.5">
                    R {((formData.totalNights || 1) * (formData.ratePerNightPerPerson || 2500)).toLocaleString()}
                  </strong>
                </div>

                <div>
                  <span className="text-slate-500 block">Breakage Deposit:</span>
                  <div className="flex items-center gap-1 font-bold text-slate-900 mt-0.5">
                    <span>R</span>
                    <input
                      type="number"
                      value={formData.breakageDepositAmount || 2500}
                      disabled={!isEditing}
                      onChange={(e) => setFormData(prev => ({ ...prev, breakageDepositAmount: parseFloat(e.target.value) || 0 }))}
                      className="w-20 text-xs p-1 border rounded bg-white disabled:bg-transparent disabled:border-none"
                    />
                    <span className="text-[10px] text-amber-700 font-semibold">({formData.breakageDepositStatus || 'Held'})</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Payment Method & Payment Status */}
            <div className="pt-2 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                Payment Method & Breakage Deposit Status
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={formData.paymentMethod || 'Credit Card'}
                    disabled={!isEditing}
                    onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value as PaymentMethod }))}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-50"
                  >
                    <option value="Credit Card">Credit Card (Visa / Mastercard / Amex)</option>
                    <option value="EFT / Bank Transfer">EFT / Electronic Bank Transfer</option>
                    <option value="Swift Wire Transfer">Swift Wire Transfer (International)</option>
                    <option value="PayPal">PayPal Global</option>
                    <option value="Apple Pay">Apple Pay</option>
                    <option value="Cash">Cash on Arrival</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Status</label>
                  <select
                    value={formData.paymentStatus || 'Pending'}
                    disabled={!isEditing}
                    onChange={(e) => setFormData(prev => ({ ...prev, paymentStatus: e.target.value as PaymentStatus }))}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-50"
                  >
                    <option value="Paid">Paid in Full</option>
                    <option value="Deposit Paid">Deposit Paid (Balance Pending)</option>
                    <option value="Pending">Pending Payment</option>
                    <option value="Overdue">Overdue</option>
                    <option value="Refunded">Refunded</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Breakage Deposit Security</label>
                  <select
                    value={formData.breakageDepositStatus || 'Held'}
                    disabled={!isEditing}
                    onChange={(e) => setFormData(prev => ({ ...prev, breakageDepositStatus: e.target.value as any }))}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-50"
                  >
                    <option value="Held">Deposit Held in Trust</option>
                    <option value="Inspected & Cleared">Inspected & Cleared (Departure Passed)</option>
                    <option value="Deduction Pending">Deduction Pending Inspection</option>
                    <option value="Refunded">Deposit Refunded to Guest</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 4: Special Requests & Special Travel Requirements */}
            <div className="pt-2 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Special Requests & Travel Requirements
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Special Requests Required (Hospitality & Suite Customization)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.specialRequests || ''}
                    disabled={!isEditing}
                    onChange={(e) => setFormData(prev => ({ ...prev, specialRequests: e.target.value }))}
                    placeholder="e.g. Moët Champagne on ice upon arrival, feather-free pillows, late check-in..."
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-50"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Special Travel Requirements Required (Logistics & Transfers)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.specialTravelRequirements || ''}
                    disabled={!isEditing}
                    onChange={(e) => setFormData(prev => ({ ...prev, specialTravelRequirements: e.target.value }))}
                    placeholder="e.g. VIP Shuttle from George Airport (GRJ), wheelchair ramp access, rental car parking..."
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-50"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Section 5: Sightseeing Nearby Preferences */}
            <div className="pt-2 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-emerald-600" />
                Sightseeing Nearby Excursions Requested by Guest
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {sightseeingOptions.map(option => {
                  const isChecked = (formData.nearbySightseeingInterests || []).includes(option);
                  return (
                    <label
                      key={option}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition ${
                        isChecked
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={!isEditing}
                        onChange={() => toggleSightseeingInterest(option)}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>{option}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Section 6: Scanned Documents & Uploaded Passports/IDs */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Paperclip className="w-4 h-4 text-emerald-600" />
                  Passports, ID Copies & Payment Breakage Uploads
                </h3>
                <span className="text-[11px] text-slate-500">
                  {(formData.documents || []).length} Document(s) Attached
                </span>
              </div>

              {(formData.documents || []).length === 0 ? (
                <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-500">
                  No scanned documents attached yet. Click <strong>"Scan / Upload"</strong> in the toolbar above to attach passport or proof of payment.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(formData.documents || []).map(doc => (
                    <div key={doc.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div className="truncate">
                          <div className="font-bold text-slate-800 truncate">{doc.name}</div>
                          <div className="text-[10px] text-slate-400">
                            {doc.type.toUpperCase()} • {doc.fileSize || '1.2 MB'} • Uploaded {doc.uploadedAt}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full shrink-0">
                        Verified
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* GUEST RESERVATION VOUCHER MODAL (A4 PRINTABLE DESIGN) */}
      {showVoucherModal && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-8 shadow-2xl border border-slate-200 relative my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 no-print">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Official Booking Confirmation & Guest Voucher
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5 text-emerald-400" />
                  Print A4 Voucher
                </button>
                <button
                  onClick={() => setShowVoucherModal(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Printable Voucher Content */}
            <div className="printable-area py-6 space-y-6 text-slate-900">
              {/* Header with logo & company name */}
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5">
                <div>
                  <h1 className="font-serif-luxury text-2xl font-bold tracking-tight text-slate-950">
                    {GUEST_HOUSE_INFO.name}
                  </h1>
                  <p className="text-xs text-emerald-700 italic font-medium">
                    "{GUEST_HOUSE_INFO.tagline}"
                  </p>
                  <div className="text-[11px] text-slate-600 mt-2 space-y-0.5">
                    <div>{GUEST_HOUSE_INFO.address}</div>
                    <div>Tel: {GUEST_HOUSE_INFO.contactNumbers} | Web: {GUEST_HOUSE_INFO.webAddress}</div>
                    <div>Email: {GUEST_HOUSE_INFO.email}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="inline-block px-3 py-1 bg-slate-900 text-emerald-400 rounded-lg text-xs font-bold font-mono">
                    CONFIRMATION #{formData.reservationNumber}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Date: {new Date().toLocaleDateString('en-ZA')}
                  </div>
                  <div className="text-[11px] text-slate-700 font-semibold mt-1">
                    Issued by: {formData.salesPerson || GUEST_HOUSE_INFO.salesPerson}
                  </div>
                </div>
              </div>

              {/* Guest & Stay details */}
              <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Guest Information
                  </span>
                  <div className="font-bold text-sm text-slate-900">
                    {formData.customerName} {formData.customerSurname}
                  </div>
                  <div className="text-slate-600 mt-1">Passport / ID: {formData.idOrPassportNumber || 'Verified on File'}</div>
                  <div className="text-slate-600">Email: {formData.email || 'N/A'}</div>
                  <div className="text-slate-600">Tel: {formData.contactNumber || 'N/A'}</div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Accommodation Details
                  </span>
                  <div className="font-bold text-sm text-slate-900">
                    Suite {formData.roomNumber} - {formData.roomAllocation}
                  </div>
                  <div className="text-slate-600 mt-1">
                    Check-in: <strong>{formData.checkInDate}</strong> (from 14:00)
                  </div>
                  <div className="text-slate-600">
                    Check-out: <strong>{formData.checkOutDate}</strong> (by 11:00)
                  </div>
                  <div className="text-slate-600">
                    Duration: {formData.totalNights} Night(s) for {formData.numberOfGuests} Guest(s)
                  </div>
                </div>
              </div>

              {/* Pricing breakdown */}
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-900 text-left text-slate-700 font-bold">
                    <th className="py-2">Description</th>
                    <th className="py-2 text-center">Nights</th>
                    <th className="py-2 text-right">Rate / Night</th>
                    <th className="py-2 text-right">Total (ZAR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="py-3 font-medium">
                      Luxury Suite Accommodation - {formData.roomAllocation}
                    </td>
                    <td className="py-3 text-center">{formData.totalNights}</td>
                    <td className="py-3 text-right">R {formData.ratePerNightPerPerson?.toLocaleString()}</td>
                    <td className="py-3 text-right font-bold">R {formData.totalRoomCost?.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-medium">
                      Refundable Breakage & Security Deposit
                    </td>
                    <td className="py-3 text-center">1</td>
                    <td className="py-3 text-right">R {formData.breakageDepositAmount?.toLocaleString()}</td>
                    <td className="py-3 text-right font-bold">R {formData.breakageDepositAmount?.toLocaleString()}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-900 font-bold text-sm">
                    <td colSpan={3} className="py-3 text-right">Total Reservation Amount:</td>
                    <td className="py-3 text-right text-emerald-800">
                      R {((formData.totalRoomCost || 0) + (formData.breakageDepositAmount || 0)).toLocaleString()}
                    </td>
                  </tr>
                  <tr className="text-xs text-slate-600">
                    <td colSpan={3} className="py-1 text-right">Payment Status:</td>
                    <td className="py-1 text-right font-bold">{formData.paymentStatus} ({formData.paymentMethod})</td>
                  </tr>
                </tfoot>
              </table>

              {/* Special instructions */}
              <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1.5 border border-slate-200">
                <div>
                  <strong>Special Requests:</strong> {formData.specialRequests || 'None specified.'}
                </div>
                <div>
                  <strong>Travel & Transfer Requirements:</strong> {formData.specialTravelRequirements || 'Standard arrival.'}
                </div>
                <div>
                  <strong>Selected Nearby Sightseeing:</strong> {(formData.nearbySightseeingInterests || []).join(', ') || 'Concierge available upon check-in.'}
                </div>
              </div>

              {/* Terms and conditions */}
              <div className="text-[10px] text-slate-500 leading-relaxed border-t border-slate-200 pt-4">
                <strong>Terms & Conditions:</strong> Check-in is between 14:00 and 19:00. Please notify management of late arrivals. The breakage deposit will be inspected upon departure and refunded within 48 hours to your original payment card or EFT bank account. All suites are strictly non-smoking.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Old Reservations Confirmation & Batch Modal */}
      <DeleteOldReservationsModal
        isOpen={showDeleteOldModal}
        onClose={() => setShowDeleteOldModal(false)}
        oldReservations={oldReservations}
        onDeleteSelected={handleDeleteOldSelected}
        onDeleteAll={handleDeleteAllOld}
      />

      {/* Resident Guest Folder & Invoicing Dossier Modal */}
      {activeGuestFolderReservation && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto no-print">
          <div className="bg-white rounded-3xl max-w-5xl w-full p-4 sm:p-6 my-6 shadow-2xl relative max-h-[92vh] overflow-y-auto border border-slate-200">
            <GuestFolderModule 
              reservation={activeGuestFolderReservation}
              companyInfo={companyInfo}
              isAdminView={true}
              onClose={() => setActiveGuestFolderReservation(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
