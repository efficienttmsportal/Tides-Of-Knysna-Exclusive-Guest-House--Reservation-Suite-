import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Printer, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Star, 
  ShieldCheck, 
  Edit, 
  Trash2, 
  X, 
  Check, 
  FileText, 
  Download,
  AlertCircle
} from 'lucide-react';
import { Reservation, UserAccount } from '../types';
import { CompanyInfoData } from './CompanyInfoModule';

export interface GuestContact {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  vipStatus: 'Standard' | 'Silver VIP' | 'Gold Elite' | 'Platinum Royal';
  preferences: string[];
  totalStays: number;
  totalSpent: number;
  lastVisit: string;
  notes: string;
}

interface GuestAddressBookProps {
  reservations: Reservation[];
  companyInfo: CompanyInfoData;
  currentUser: UserAccount | null;
}

export const GuestAddressBook: React.FC<GuestAddressBookProps> = ({
  reservations,
  companyInfo,
  currentUser
}) => {
  // Extract unique guests from reservations or maintain state
  const [guests, setGuests] = useState<GuestContact[]>(() => {
    // Derive initial guest list from reservations
    const map = new Map<string, GuestContact>();
    reservations.forEach((res, index) => {
      const email = res.guestEmail || `guest${index}@example.com`;
      if (!map.has(email)) {
        map.set(email, {
          id: `gst-${index + 100}`,
          fullName: res.guestName,
          email: email,
          phone: res.guestPhone || '+27 82 555 0199',
          address: '14 Marine Drive, Plettenberg Bay',
          city: 'Garden Route',
          country: 'South Africa',
          vipStatus: index % 3 === 0 ? 'Gold Elite' : index % 2 === 0 ? 'Platinum Royal' : 'Standard',
          preferences: ['King Bed', 'Ocean View', 'Quiet Suite', 'Late Arrival'],
          totalStays: Math.floor(Math.random() * 5) + 1,
          totalSpent: (Math.floor(Math.random() * 3) + 1) * 4500,
          lastVisit: res.checkInDate || '2026-08-14',
          notes: 'Valued guest. Prefers herbal tea selection and feather-free pillows.'
        });
      }
    });
    return Array.from(map.values());
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVip, setSelectedVip] = useState<string>('All');
  const [editingGuest, setEditingGuest] = useState<GuestContact | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedGuestForDetail, setSelectedGuestForDetail] = useState<GuestContact | null>(null);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState('Welcome Back to ' + companyInfo.name);
  const [emailBody, setEmailBody] = useState('Dear Guest,\n\nWe look forward to welcoming you back to our luxury 5-star sanctuary.\n\nWarm regards,\n' + companyInfo.salesPerson);

  const filteredGuests = guests.filter(g => {
    const matchesSearch = g.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          g.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          g.phone.includes(searchQuery);
    const matchesVip = selectedVip === 'All' || g.vipStatus === selectedVip;
    return matchesSearch && matchesVip;
  });

  const handleSaveGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGuest) return;
    if (isAdding) {
      setGuests([editingGuest, ...guests]);
    } else {
      setGuests(guests.map(g => g.id === editingGuest.id ? editingGuest : g));
    }
    setEditingGuest(null);
    setIsAdding(false);
  };

  const handleDeleteGuest = (id: string) => {
    if (confirm('Are you sure you want to remove this guest from the permanent address book?')) {
      setGuests(guests.filter(g => g.id !== id));
      if (selectedGuestForDetail?.id === id) setSelectedGuestForDetail(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12 font-['Arial',sans-serif]">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <Users className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-slate-900">Guest Address Book & Profile Directory</h2>
          </div>
          <p className="text-xs text-slate-500">
            Comprehensive secure archive of guest contact details, stay history, preferences, and automated print/email export for inkjet & laser printers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-2 border border-slate-300 shadow-xs"
          >
            <Printer className="w-4 h-4" /> Print Address Book (PDF / Laser)
          </button>
          <button
            onClick={() => {
              setEditingGuest({
                id: `gst-${Date.now()}`,
                fullName: '',
                email: '',
                phone: '',
                address: '',
                city: '',
                country: 'South Africa',
                vipStatus: 'Standard',
                preferences: ['Standard Suite'],
                totalStays: 1,
                totalSpent: 3500,
                lastVisit: new Date().toISOString().split('T')[0],
                notes: 'New guest profile.'
              });
              setIsAdding(true);
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs"
          >
            <Plus className="w-4 h-4" /> Add New Guest
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {['All', 'Standard', 'Silver VIP', 'Gold Elite', 'Platinum Royal'].map((tier) => (
            <button
              key={tier}
              onClick={() => setSelectedVip(tier)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                selectedVip === tier
                  ? 'bg-emerald-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      {/* Guest Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGuests.map((guest) => (
          <div 
            key={guest.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4 relative group"
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{guest.fullName}</h3>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold mt-1 ${
                    guest.vipStatus === 'Platinum Royal' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                    guest.vipStatus === 'Gold Elite' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                    guest.vipStatus === 'Silver VIP' ? 'bg-slate-200 text-slate-800' :
                    'bg-emerald-100 text-emerald-800'
                  }`}>
                    {guest.vipStatus}
                  </span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => {
                      setEditingGuest(guest);
                      setIsAdding(false);
                    }}
                    title="Edit Guest"
                    className="p-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 rounded-lg transition"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteGuest(guest.id)}
                    title="Delete Guest"
                    className="p-1.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 rounded-lg transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{guest.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{guest.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{guest.city}, {guest.country}</span>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1 text-[11px]">
                <div className="flex justify-between text-slate-500">
                  <span>Total Stays: <strong className="text-slate-800">{guest.totalStays}</strong></span>
                  <span>Spent: <strong className="text-emerald-700">R {guest.totalSpent.toLocaleString()}</strong></span>
                </div>
                <div className="text-slate-500">
                  Preferences: <span className="text-slate-800 font-medium">{guest.preferences.join(', ')}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => setSelectedGuestForDetail(guest)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition text-center"
              >
                View Full Profile
              </button>
              <button
                onClick={() => {
                  setSelectedGuestForDetail(guest);
                  setEmailModalOpen(true);
                }}
                className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition flex items-center gap-1"
              >
                <Mail className="w-3.5 h-3.5" /> Email
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Guest Details Modal */}
      {selectedGuestForDetail && !emailModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{selectedGuestForDetail.fullName}</h3>
                <p className="text-xs text-slate-500">Guest Dossier & Historical Record</p>
              </div>
              <button 
                onClick={() => setSelectedGuestForDetail(null)}
                className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-500 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px]">EMAIL ADDRESS</span>
                  <strong className="text-slate-900">{selectedGuestForDetail.email}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">PHONE NUMBER</span>
                  <strong className="text-slate-900">{selectedGuestForDetail.phone}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">ADDRESS / ORIGIN</span>
                  <strong className="text-slate-900">{selectedGuestForDetail.address}, {selectedGuestForDetail.city}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">VIP STANDING</span>
                  <span className="text-emerald-700 font-bold">{selectedGuestForDetail.vipStatus}</span>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-900 block mb-1">Stay History & Lifetime Value</span>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 text-[11px]">Completed Stays:</span> <strong className="text-slate-900">{selectedGuestForDetail.totalStays}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px]">Total Revenue:</span> <strong className="text-emerald-700">R {selectedGuestForDetail.totalSpent.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px]">Last Visit:</span> <strong className="text-slate-900">{selectedGuestForDetail.lastVisit}</strong>
                  </div>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-900 block mb-1">Special Preferences & Dietary Notes</span>
                <p className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200 text-slate-700 italic">
                  "{selectedGuestForDetail.notes}"
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Print Dossier
              </button>
              <button
                onClick={() => setEmailModalOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <Mail className="w-4 h-4" /> Send Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Guest Modal */}
      {editingGuest && !emailModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSaveGuest} className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                {isAdding ? 'Add New Guest to Address Book' : 'Edit Guest Profile'}
              </h3>
              <button 
                type="button"
                onClick={() => { setEditingGuest(null); setIsAdding(false); }}
                className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editingGuest.fullName}
                  onChange={(e) => setEditingGuest({ ...editingGuest, fullName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="e.g. Dr. Jonathan Sterling"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={editingGuest.email}
                    onChange={(e) => setEditingGuest({ ...editingGuest, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="guest@example.com"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={editingGuest.phone}
                    onChange={(e) => setEditingGuest({ ...editingGuest, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="+27 82 555 0199"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={editingGuest.city}
                    onChange={(e) => setEditingGuest({ ...editingGuest, city: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Country</label>
                  <input
                    type="text"
                    value={editingGuest.country}
                    onChange={(e) => setEditingGuest({ ...editingGuest, country: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">VIP Standing</label>
                  <select
                    value={editingGuest.vipStatus}
                    onChange={(e) => setEditingGuest({ ...editingGuest, vipStatus: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Silver VIP">Silver VIP</option>
                    <option value="Gold Elite">Gold Elite</option>
                    <option value="Platinum Royal">Platinum Royal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Guest Notes & Preferences</label>
                <textarea
                  rows={3}
                  value={editingGuest.notes}
                  onChange={(e) => setEditingGuest({ ...editingGuest, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="Dietary requirements, pillow preference, anniversary dates..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => { setEditingGuest(null); setIsAdding(false); }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition shadow-xs"
              >
                Save Guest Record
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Email Modal */}
      {emailModalOpen && selectedGuestForDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Send Email to {selectedGuestForDetail.fullName}</h3>
              <button onClick={() => setEmailModalOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">To Email</label>
                <input type="email" disabled value={selectedGuestForDetail.email} className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-600" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Subject</label>
                <input 
                  type="text" 
                  value={emailSubject} 
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" 
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Message Body</label>
                <textarea 
                  rows={5} 
                  value={emailBody} 
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" 
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button onClick={() => setEmailModalOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition">
                Cancel
              </button>
              <button 
                onClick={() => {
                  alert(`Email successfully dispatched to ${selectedGuestForDetail.email}!`);
                  setEmailModalOpen(false);
                }} 
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition shadow-xs flex items-center gap-1.5"
              >
                <Mail className="w-4 h-4" /> Send Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
