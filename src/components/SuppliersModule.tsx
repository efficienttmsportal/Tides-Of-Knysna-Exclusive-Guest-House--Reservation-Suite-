import React, { useState, useMemo } from 'react';
import {
  Building2,
  Phone,
  Mail,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Star,
  Check,
  Copy,
  ExternalLink,
  X,
  Send,
  Truck,
  ShieldCheck,
  Clock,
  FileText,
  ArrowUpDown,
  Tag,
  MapPin,
  Globe,
  SlidersHorizontal,
  LayoutGrid,
  Table as TableIcon,
  PhoneCall,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { SupplierContact } from '../types';
import { INITIAL_SUPPLIERS } from '../data/initialData';
import { DocumentActionBar } from './DocumentActionBar';

export const SuppliersModule: React.FC = () => {
  const [suppliers, setSuppliers] = useState<SupplierContact[]>(INITIAL_SUPPLIERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'name' | 'category' | 'rating'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Modals state
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<SupplierContact | null>(null);
  
  // Call Action Modal state
  const [callModalSupplier, setCallModalSupplier] = useState<SupplierContact | null>(null);
  
  // Email Action Modal state
  const [emailModalSupplier, setEmailModalSupplier] = useState<SupplierContact | null>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailTemplate, setEmailTemplate] = useState<'order' | 'quote' | 'urgent' | 'custom'>('order');
  const [emailBody, setEmailBody] = useState('');

  // Delete confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Copy feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form state for Add/Edit
  const [formData, setFormData] = useState<Partial<SupplierContact>>({
    companyName: '',
    category: 'Linens & Laundry',
    contactPerson: '',
    telephone: '',
    email: '',
    accountNumber: '',
    terms: '30 Days from statement',
    rating: 5,
    address: '',
    website: '',
    leadTimeDays: 2,
    notes: ''
  });

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    suppliers.forEach(s => set.add(s.category));
    return ['All', ...Array.from(set)];
  }, [suppliers]);

  // Filtered & Sorted suppliers
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(supplier => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !q ||
        supplier.companyName.toLowerCase().includes(q) ||
        supplier.contactPerson.toLowerCase().includes(q) ||
        supplier.category.toLowerCase().includes(q) ||
        supplier.email.toLowerCase().includes(q) ||
        supplier.telephone.toLowerCase().includes(q) ||
        (supplier.accountNumber && supplier.accountNumber.toLowerCase().includes(q)) ||
        (supplier.notes && supplier.notes.toLowerCase().includes(q));

      const matchesCat = selectedCategory === 'All' || supplier.category === selectedCategory;

      return matchesSearch && matchesCat;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.companyName.localeCompare(b.companyName);
      } else if (sortBy === 'category') {
        comparison = a.category.localeCompare(b.category);
      } else if (sortBy === 'rating') {
        comparison = b.rating - a.rating;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [suppliers, searchQuery, selectedCategory, sortBy, sortOrder]);

  // Copy to clipboard helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Open Add modal
  const handleOpenAdd = () => {
    setEditingSupplier(null);
    setFormData({
      companyName: '',
      category: 'Linens & Laundry',
      contactPerson: '',
      telephone: '',
      email: '',
      accountNumber: `ACC-${Math.floor(100 + Math.random() * 900)}`,
      terms: '30 Days from statement',
      rating: 5,
      address: 'Knysna, Garden Route, 6571',
      website: '',
      leadTimeDays: 2,
      notes: ''
    });
    setIsAddEditOpen(true);
  };

  // Open Edit modal
  const handleOpenEdit = (supplier: SupplierContact) => {
    setEditingSupplier(supplier);
    setFormData({ ...supplier });
    setIsAddEditOpen(true);
  };

  // Save supplier (Add or Edit)
  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName || !formData.contactPerson || !formData.email || !formData.telephone) {
      alert('Please fill in Company Name, Contact Person, Phone, and Email.');
      return;
    }

    if (editingSupplier) {
      // Update
      setSuppliers(prev => prev.map(s => s.id === editingSupplier.id ? { ...s, ...(formData as SupplierContact) } : s));
    } else {
      // Add new
      const newSup: SupplierContact = {
        id: `sup-${Date.now()}`,
        companyName: formData.companyName || 'Unnamed Supplier',
        category: formData.category || 'Amenities & Spa',
        contactPerson: formData.contactPerson || '',
        telephone: formData.telephone || '',
        email: formData.email || '',
        accountNumber: formData.accountNumber || `ACC-${Math.floor(100 + Math.random() * 900)}`,
        terms: formData.terms || '30 Days',
        rating: formData.rating || 5,
        address: formData.address || '',
        website: formData.website || '',
        leadTimeDays: formData.leadTimeDays || 2,
        notes: formData.notes || ''
      };
      setSuppliers(prev => [newSup, ...prev]);
    }
    setIsAddEditOpen(false);
  };

  // Delete supplier
  const handleDeleteSupplier = (id: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
    setDeleteConfirmId(null);
  };

  // Handle Call Action
  const handleCallAction = (supplier: SupplierContact) => {
    setCallModalSupplier(supplier);
  };

  // Handle Email Action
  const handleEmailAction = (supplier: SupplierContact) => {
    setEmailModalSupplier(supplier);
    setEmailTemplate('order');
    setEmailSubject(`[Tides of Knysna] Purchase Order Inquiry - ${supplier.companyName}`);
    setEmailBody(
      `Dear ${supplier.contactPerson},\n\nWe would like to place our replenishment order for Tides of Knysna Guest House on account ${supplier.accountNumber}.\n\nPlease find our required line items and confirm availability and delivery dispatch date.\n\nWarm regards,\nEleanor Sterling\nHead of Guest Experience & Operations\nTides of Knysna Exclusive Guest House\n+27 44 382 1234`
    );
  };

  // Update email template text
  const applyEmailTemplate = (template: 'order' | 'quote' | 'urgent' | 'custom', supplier: SupplierContact) => {
    setEmailTemplate(template);
    if (template === 'order') {
      setEmailSubject(`[Tides of Knysna] Stock Replenishment Order - ${supplier.companyName}`);
      setEmailBody(
        `Dear ${supplier.contactPerson},\n\nWe would like to place our scheduled replenishment order for Tides of Knysna Guest House on account ${supplier.accountNumber}.\n\nPlease provide delivery confirmation and dispatch ETA to 14 Waterfront Promenade, Knysna.\n\nWarm regards,\nEleanor Sterling\nTides of Knysna Exclusive Guest House`
      );
    } else if (template === 'quote') {
      setEmailSubject(`[Tides of Knysna] Request for Quotation & Price Sheet - ${supplier.companyName}`);
      setEmailBody(
        `Dear ${supplier.contactPerson},\n\nCould you please furnish us with your latest wholesale price list and seasonal stock catalog for ${supplier.category}?\n\nWe are planning our upcoming peak luxury season provisioning.\n\nWarm regards,\nEleanor Sterling\nTides of Knysna Exclusive Guest House`
      );
    } else if (template === 'urgent') {
      setEmailSubject(`[URGENT] Immediate Stock / Service Request - ${supplier.companyName}`);
      setEmailBody(
        `Dear ${supplier.contactPerson},\n\nThis is an urgent request for priority dispatch to Tides of Knysna Guest House for an in-house VIP guest suite requirement.\n\nPlease call us immediately on +27 82 555 4321 upon receipt of this message.\n\nSincerely,\nEleanor Sterling\nTides of Knysna Exclusive Guest House`
      );
    } else {
      setEmailSubject(`[Tides of Knysna] Inquiry for ${supplier.companyName}`);
      setEmailBody(`Dear ${supplier.contactPerson},\n\n`);
    }
  };

  // Badge color for category
  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'Linens & Laundry':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Amenities & Spa':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'Food & Beverage':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Wine & Spirits':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Plumbing & Electrical':
        return 'bg-cyan-50 text-cyan-800 border-cyan-200';
      case 'Security & CCTV':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div id="module-supplier-contacts" className="space-y-6 animate-in fade-in duration-300">
      {/* Top Document Action Bar */}
      <DocumentActionBar
        documentTitle="Official Approved Supplier & Vendor Contacts"
        documentNumber="SUP-PROC-2026"
        onSave={() => alert('Supplier contacts verified and cached locally.')}
      />

      {/* Procurement Overview Banner & Key Metrics */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-md">
        <div className="flex items-center justify-between flex-wrap gap-4 pb-5 border-b border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center font-bold shadow-inner">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif-luxury font-bold text-xl text-white tracking-wide">
                  Supplier & Vendor Directory
                </h2>
                <span className="bg-indigo-500/20 text-indigo-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-indigo-500/30">
                  Procurement Hub
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Centralized contact management, dispatch communication, and direct Call/Email actions for hospitality vendors
              </p>
            </div>
          </div>

          <button
            id="btn-add-supplier-top"
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add New Vendor
          </button>
        </div>

        {/* 4 Summary Micro-Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5 text-xs">
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Vendors</span>
            <span className="text-xl font-bold font-serif-luxury text-white mt-1 block">
              {suppliers.length} Approved
            </span>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-3 h-3" /> 100% Verified SLAs
            </span>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Core Categories</span>
            <span className="text-xl font-bold font-serif-luxury text-indigo-300 mt-1 block">
              {categories.length - 1} Sectors
            </span>
            <span className="text-[10px] text-slate-300 mt-0.5 block truncate">
              Linens, Amenities, Food & Wine
            </span>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Top 5-Star Partners</span>
            <span className="text-xl font-bold font-serif-luxury text-amber-400 mt-1 flex items-center gap-1.5">
              {suppliers.filter(s => s.rating === 5).length}
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            </span>
            <span className="text-[10px] text-slate-300 mt-0.5 block">
              Preferred tier accounts
            </span>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Average Dispatch Lead</span>
            <span className="text-xl font-bold font-serif-luxury text-emerald-400 mt-1 block">
              {(suppliers.reduce((acc, s) => acc + (s.leadTimeDays || 2), 0) / (suppliers.length || 1)).toFixed(1)} Days
            </span>
            <span className="text-[10px] text-slate-300 mt-0.5 block">
              Same-day / 48h emergency coverage
            </span>
          </div>
        </div>
      </div>

      {/* Search, Filter & Controls Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="input-search-suppliers"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by company name, contact person, phone, email, category, or account..."
              className="w-full pl-10 pr-9 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Controls: Sorting & View Mode */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-600">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-slate-700">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="name">Company Name</option>
                <option value="category">Category</option>
                <option value="rating">Rating</option>
              </select>
              <button
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="ml-1 text-slate-500 hover:text-slate-800 text-[10px] font-bold px-1 rounded hover:bg-slate-200"
                title={`Order: ${sortOrder.toUpperCase()}`}
              >
                {sortOrder === 'asc' ? 'ASC' : 'DESC'}
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
              <button
                id="btn-view-cards"
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition ${
                  viewMode === 'cards' 
                    ? 'bg-white text-slate-900 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Cards
              </button>
              <button
                id="btn-view-table"
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition ${
                  viewMode === 'table' 
                    ? 'bg-white text-slate-900 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                Table
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 text-xs no-scrollbar">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0 flex items-center gap-1">
            <Tag className="w-3 h-3" /> Categories:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {cat}
              {cat !== 'All' && (
                <span className="ml-1.5 text-[10px] opacity-70">
                  ({suppliers.filter(s => s.category === cat).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count Banner */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong>{filteredSuppliers.length}</strong> of <strong>{suppliers.length}</strong> vendors
          {selectedCategory !== 'All' && ` in "${selectedCategory}"`}
          {searchQuery && ` matching "${searchQuery}"`}
        </span>
        {(searchQuery || selectedCategory !== 'All') && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="text-emerald-700 hover:underline font-semibold"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* No results state */}
      {filteredSuppliers.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm space-y-3">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">No Vendors Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            No supplier records matched your query. Try searching for a different keyword, selecting "All" categories, or add a new vendor.
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs inline-flex items-center gap-2 hover:bg-emerald-500"
          >
            <Plus className="w-4 h-4" />
            Add New Supplier
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. CARD GRID VIEW                                                         */}
      {/* ========================================================================= */}
      {viewMode === 'cards' && filteredSuppliers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSuppliers.map(supplier => (
            <div
              key={supplier.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Header: Category & Rating & Quick Edit */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md border ${getCategoryBadgeClass(supplier.category)}`}>
                    {supplier.category}
                  </span>
                  
                  <div className="flex items-center gap-1">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < supplier.rating 
                              ? 'text-amber-400 fill-amber-400' 
                              : 'text-slate-200 fill-slate-100'
                          }`}
                        />
                      ))}
                    </div>

                    <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(supplier)}
                        className="p-1 text-slate-400 hover:text-emerald-700 hover:bg-slate-100 rounded"
                        title="Edit Supplier"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(supplier.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded"
                        title="Delete Supplier"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Company Name */}
                <h3 className="font-serif-luxury font-bold text-slate-900 text-base leading-snug group-hover:text-emerald-800 transition-colors">
                  {supplier.companyName}
                </h3>

                {/* Contact Person */}
                <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-600">
                  <span className="font-semibold text-slate-800">{supplier.contactPerson}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-[11px] text-slate-500 font-mono">Acc: {supplier.accountNumber}</span>
                </div>

                {/* Notes or description */}
                {supplier.notes && (
                  <p className="mt-2.5 text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100">
                    {supplier.notes}
                  </p>
                )}

                {/* Details list: Phone, Email, Location */}
                <div className="mt-3.5 space-y-1.5 text-xs">
                  {/* Phone */}
                  <div className="flex items-center justify-between text-slate-700">
                    <div className="flex items-center gap-2 truncate">
                      <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="font-mono text-slate-800">{supplier.telephone}</span>
                    </div>
                    <button
                      onClick={() => handleCopy(supplier.telephone, `phone-${supplier.id}`)}
                      className="text-[10px] text-slate-400 hover:text-slate-700 flex items-center gap-1 ml-2"
                      title="Copy Phone"
                    >
                      {copiedId === `phone-${supplier.id}` ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>

                  {/* Email */}
                  <div className="flex items-center justify-between text-slate-700">
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate text-slate-800 font-medium">{supplier.email}</span>
                    </div>
                    <button
                      onClick={() => handleCopy(supplier.email, `email-${supplier.id}`)}
                      className="text-[10px] text-slate-400 hover:text-slate-700 flex items-center gap-1 ml-2"
                      title="Copy Email"
                    >
                      {copiedId === `email-${supplier.id}` ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>

                  {/* Address */}
                  {supplier.address && (
                    <div className="flex items-center gap-2 text-slate-500 text-[11px] truncate">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{supplier.address}</span>
                    </div>
                  )}

                  {/* Payment Terms & Lead time */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      Lead: {supplier.leadTimeDays || 2}d
                    </span>
                    <span className="font-medium text-slate-600 truncate">
                      Terms: {supplier.terms}
                    </span>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS: Call & Email */}
              <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                <button
                  id={`btn-call-${supplier.id}`}
                  onClick={() => handleCallAction(supplier)}
                  className="w-full py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 shadow-xs"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-700" />
                  Call
                </button>

                <button
                  id={`btn-email-${supplier.id}`}
                  onClick={() => handleEmailAction(supplier)}
                  className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5 text-emerald-400" />
                  Email
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TABLE VIEW                                                             */}
      {/* ========================================================================= */}
      {viewMode === 'table' && filteredSuppliers.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-900 text-white uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-3">Company Name & Rating</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Contact Person</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Email Address</th>
                  <th className="px-4 py-3">Delivery Lead Time</th>
                  <th className="px-4 py-3">Account & Terms</th>
                  <th className="px-4 py-3 text-center">Call / Email Actions</th>
                  <th className="px-3 py-3 text-right">Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSuppliers.map(supplier => (
                  <tr key={supplier.id} className="hover:bg-slate-50 transition">
                    {/* Company Name */}
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900 text-sm">
                        {supplier.companyName}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-2.5 h-2.5 ${
                                i < supplier.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                        {supplier.address && (
                          <span className="text-[10px] text-slate-400 truncate max-w-[150px]">
                            • {supplier.address}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getCategoryBadgeClass(supplier.category)}`}>
                        {supplier.category}
                      </span>
                    </td>

                    {/* Contact Person */}
                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-800 block">{supplier.contactPerson}</span>
                      <span className="text-[10px] text-slate-400">Account Rep</span>
                    </td>

                    {/* Phone */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-mono text-slate-800">
                        <Phone className="w-3 h-3 text-emerald-600" />
                        <span>{supplier.telephone}</span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Mail className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span className="truncate max-w-[180px]">{supplier.email}</span>
                      </div>
                    </td>

                    {/* Delivery Lead Time */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        <span>{supplier.leadTimeDays || 2} Days</span>
                      </div>
                      <div className="text-[10px] text-slate-400">Average dispatch</div>
                    </td>

                    {/* Account & Terms */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-mono text-[11px] font-bold text-slate-700">{supplier.accountNumber}</div>
                      <div className="text-[10px] text-slate-400">{supplier.terms}</div>
                    </td>

                    {/* Call / Email Actions */}
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleCallAction(supplier)}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                          title={`Call ${supplier.contactPerson}`}
                        >
                          <PhoneCall className="w-3 h-3" />
                          Call
                        </button>
                        <button
                          onClick={() => handleEmailAction(supplier)}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition"
                          title={`Email ${supplier.contactPerson}`}
                        >
                          <Send className="w-3 h-3 text-emerald-400" />
                          Email
                        </button>
                      </div>
                    </td>

                    {/* Edit / Delete */}
                    <td className="px-3 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(supplier)}
                          className="p-1 text-slate-400 hover:text-emerald-700 hover:bg-slate-100 rounded"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(supplier.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. CALL ACTION MODAL / QUICK DIALER DIALOG                                */}
      {/* ========================================================================= */}
      {callModalSupplier && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Call Supplier Representative</h3>
                  <p className="text-xs text-slate-500">{callModalSupplier.companyName}</p>
                </div>
              </div>
              <button
                onClick={() => setCallModalSupplier(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-center space-y-2">
              <span className="text-[11px] text-slate-400 uppercase font-semibold block">Contact Representative</span>
              <div className="text-base font-bold text-slate-900">{callModalSupplier.contactPerson}</div>
              <div className="text-xl font-mono font-bold text-emerald-700 tracking-wider">
                {callModalSupplier.telephone}
              </div>
              <span className="text-xs text-slate-500 block">
                Category: <strong>{callModalSupplier.category}</strong> • Account: <strong className="font-mono">{callModalSupplier.accountNumber}</strong>
              </span>
            </div>

            <div className="text-xs text-slate-500 space-y-1">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Operating hours: Monday – Friday 07:00 – 17:30 (SAST)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>Quote guest house reference: <strong>Tides of Knysna (Eleanor Sterling)</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              {/* Native Dial link */}
              <a
                href={`tel:${callModalSupplier.telephone}`}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition"
              >
                <Phone className="w-4 h-4" />
                Open Phone Dialer
              </a>

              {/* Copy Number */}
              <button
                onClick={() => handleCopy(callModalSupplier.telephone, 'modal-phone')}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5 transition"
              >
                {copiedId === 'modal-phone' ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Number
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. EMAIL ACTION MODAL / QUICK COMPOSER                                    */}
      {/* ========================================================================= */}
      {emailModalSupplier && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center font-bold">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Compose Supplier Email</h3>
                  <p className="text-xs text-slate-500">To: {emailModalSupplier.contactPerson} ({emailModalSupplier.companyName})</p>
                </div>
              </div>
              <button
                onClick={() => setEmailModalSupplier(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Template Selector Pills */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Quick Template:
              </label>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => applyEmailTemplate('order', emailModalSupplier)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    emailTemplate === 'order'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Replenishment Order
                </button>
                <button
                  type="button"
                  onClick={() => applyEmailTemplate('quote', emailModalSupplier)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    emailTemplate === 'quote'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Price Quote Request
                </button>
                <button
                  type="button"
                  onClick={() => applyEmailTemplate('urgent', emailModalSupplier)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    emailTemplate === 'urgent'
                      ? 'bg-rose-700 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Urgent Delivery / Service
                </button>
                <button
                  type="button"
                  onClick={() => applyEmailTemplate('custom', emailModalSupplier)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    emailTemplate === 'custom'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Blank Draft
                </button>
              </div>
            </div>

            {/* Recipient & Subject */}
            <div className="space-y-2 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
                <span className="text-slate-500">Recipient Email:</span>
                <span className="font-mono font-bold text-slate-800">{emailModalSupplier.email}</span>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Subject Line:</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Message Body:</label>
                <textarea
                  rows={6}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 leading-relaxed font-sans"
                />
              </div>
            </div>

            {/* Actions: Mailto or Copy */}
            <div className="flex items-center gap-2 pt-2">
              <a
                href={`mailto:${emailModalSupplier.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition"
              >
                <Send className="w-4 h-4 text-emerald-400" />
                Launch Mail Client
              </a>

              <button
                onClick={() => handleCopy(`${emailSubject}\n\n${emailBody}`, 'modal-email')}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5 transition"
              >
                {copiedId === 'modal-email' ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Draft
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. ADD / EDIT SUPPLIER MODAL                                              */}
      {/* ========================================================================= */}
      {isAddEditOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 space-y-4 my-8 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {editingSupplier ? 'Edit Supplier Contact' : 'Register New Vendor'}
                  </h3>
                  <p className="text-xs text-slate-500">Approved procurement details, category & service terms</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddEditOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="space-y-4 text-xs">
              {/* Row 1: Company Name & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Company Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="e.g., Knysna Linen Mills (Pty) Ltd"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
                  >
                    <option value="Linens & Laundry">Linens & Laundry</option>
                    <option value="Amenities & Spa">Amenities & Spa</option>
                    <option value="Food & Beverage">Food & Beverage</option>
                    <option value="Wine & Spirits">Wine & Spirits</option>
                    <option value="Plumbing & Electrical">Plumbing & Electrical</option>
                    <option value="Security & CCTV">Security & CCTV</option>
                    <option value="Pool & Gardens">Pool & Gardens</option>
                    <option value="Transport & Shuttles">Transport & Shuttles</option>
                    <option value="Maintenance & Hardware">Maintenance & Hardware</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Contact Person & Account Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Contact Person / Rep <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="e.g., Gareth Thorne"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Account / Reference No.
                  </label>
                  <input
                    type="text"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    placeholder="e.g., ACC-KLM-402"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono"
                  />
                </div>
              </div>

              {/* Row 3: Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Phone / Telephone <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.telephone}
                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                    placeholder="e.g., +27 44 382 6610"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g., orders@knysnalinen.co.za"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Row 4: Terms, Lead Time & Rating */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Payment Terms
                  </label>
                  <input
                    type="text"
                    value={formData.terms}
                    onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                    placeholder="e.g., 30 Days from statement"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Lead Time (Days)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={30}
                    value={formData.leadTimeDays || 2}
                    onChange={(e) => setFormData({ ...formData, leadTimeDays: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Supplier Rating
                  </label>
                  <select
                    value={formData.rating || 5}
                    onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
                  >
                    <option value={5}>5 Stars - Premium Preferred</option>
                    <option value={4}>4 Stars - High Quality</option>
                    <option value={3}>3 Stars - Standard Vendor</option>
                    <option value={2}>2 Stars - Review Needed</option>
                    <option value={1}>1 Star - Probationary</option>
                  </select>
                </div>
              </div>

              {/* Row 5: Physical Address */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Physical Address / Depot Location
                </label>
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g., 14 Industrial Loop, Knysna, 6571"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              {/* Row 6: Procurement Notes */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Procurement Notes & Products Supplied
                </label>
                <textarea
                  rows={2}
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g., Primary supplier of 600TC Egyptian cotton percale sheets, lagoon towels and duvets."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddEditOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md transition"
                >
                  {editingSupplier ? 'Update Vendor' : 'Save Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. DELETE CONFIRMATION MODAL                                              */}
      {/* ========================================================================= */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Remove Supplier?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to remove this vendor from your active approved procurement list? Historical POs will retain their record.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteSupplier(deleteConfirmId)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
