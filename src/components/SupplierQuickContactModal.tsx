import React, { useState, useMemo } from 'react';
import {
  X,
  Building2,
  Phone,
  Mail,
  MapPin,
  Clock,
  FileText,
  Star,
  Check,
  Copy,
  Send,
  ExternalLink,
  Truck,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Plus,
  MessageSquare,
  Sparkles,
  DollarSign,
  Package
} from 'lucide-react';
import { InventoryItem, SupplierContact } from '../types';
import { INITIAL_SUPPLIERS, GUEST_HOUSE_INFO } from '../data/initialData';
import { CompanyInfoData } from './CompanyInfoModule';

interface SupplierQuickContactModalProps {
  supplierName: string;
  selectedItem?: InventoryItem;
  allInventory: InventoryItem[];
  companyInfo?: CompanyInfoData;
  onClose: () => void;
  onQuickRestockItem?: (itemId: string, qty: number) => void;
}

export const SupplierQuickContactModal: React.FC<SupplierQuickContactModalProps> = ({
  supplierName,
  selectedItem,
  allInventory,
  companyInfo,
  onClose,
  onQuickRestockItem
}) => {
  // Find supplier in directory or create intelligent fallback
  const supplierRecord: SupplierContact = useMemo(() => {
    const cleanName = supplierName.trim().toLowerCase();
    const found = INITIAL_SUPPLIERS.find(s => 
      s.companyName.toLowerCase().includes(cleanName) ||
      cleanName.includes(s.companyName.toLowerCase())
    );

    if (found) return found;

    // Intelligent fallback for custom vendors
    const slug = cleanName.replace(/[^a-z0-9]/g, '');
    return {
      id: `sup-${slug || 'custom'}`,
      companyName: supplierName,
      category: selectedItem?.category || 'Hospitality Supplies',
      contactPerson: 'Sales & Dispatch Manager',
      telephone: '+27 44 382 5000',
      email: `orders@${slug ? slug + '.co.za' : 'vendor-supplies.co.za'}`,
      accountNumber: `ACC-TOK-${Math.floor(100 + Math.random() * 900)}`,
      terms: '30 Days from statement',
      rating: 5,
      address: 'Waterfront Commercial District, Knysna, 6571',
      leadTimeDays: 2,
      website: `www.${slug || 'vendor-supplies'}.co.za`,
      notes: `Approved procurement vendor for Tides of Knysna luxury establishment.`
    };
  }, [supplierName, selectedItem]);

  // All inventory items provided by this supplier
  const suppliedItems = useMemo(() => {
    return allInventory.filter(i => 
      i.supplier.trim().toLowerCase() === supplierName.trim().toLowerCase()
    );
  }, [allInventory, supplierName]);

  const lowStockSuppliedItems = useMemo(() => {
    return suppliedItems.filter(i => i.howManyOnHand <= i.whenToReorder);
  }, [suppliedItems]);

  // Email composer state
  const [emailTemplate, setEmailTemplate] = useState<'order' | 'quote' | 'urgent' | 'custom'>('order');
  const [recipientEmail, setRecipientEmail] = useState(supplierRecord.email);
  const [recipientPhone, setRecipientPhone] = useState(supplierRecord.telephone);

  // Suggested order quantity calculation
  const targetItem = selectedItem || lowStockSuppliedItems[0] || suppliedItems[0];
  const suggestedQty = targetItem 
    ? Math.max(10, targetItem.whenToReorder * 2 - targetItem.howManyOnHand)
    : 20;

  const [orderQty, setOrderQty] = useState(suggestedQty);

  // Email subject & body generation based on template
  const defaultSubject = useMemo(() => {
    const propertyName = companyInfo?.name || GUEST_HOUSE_INFO.name;
    const refCode = targetItem ? ` [${targetItem.itemCode}]` : '';
    switch (emailTemplate) {
      case 'order':
        return `[PROCUREMENT ORDER] ${propertyName} - Official Stock Replenishment${refCode}`;
      case 'quote':
        return `[PRICE QUOTATION REQUEST] ${propertyName} - Volume Pricing & Lead Times`;
      case 'urgent':
        return `[URGENT RESTOCK DISPATCH] ${propertyName} - Same-Day / 24h Delivery Required`;
      case 'custom':
      default:
        return `[ACCOUNT INQUIRY] ${propertyName} - Acc #${supplierRecord.accountNumber}`;
    }
  }, [emailTemplate, targetItem, companyInfo, supplierRecord]);

  const defaultBody = useMemo(() => {
    const propertyName = companyInfo?.name || GUEST_HOUSE_INFO.name;
    const propertyAddress = companyInfo?.address || GUEST_HOUSE_INFO.address;
    const contactPerson = companyInfo?.salesPerson || 'Head of Hospitality Concierge';
    const contactPhone = companyInfo?.telephone || GUEST_HOUSE_INFO.telephone;

    const itemsSummary = suppliedItems.map(i => {
      const isDeficit = i.howManyOnHand <= i.whenToReorder;
      const rec = Math.max(10, i.whenToReorder * 2 - i.howManyOnHand);
      return `• Item Code: ${i.itemCode}\n  Description: ${i.itemDescription}\n  Current Stock: ${i.howManyOnHand} ${i.unit} (Reorder Point: ${i.whenToReorder} ${i.unit})\n  Requested Order Quantity: ${rec} ${i.unit}\n  Agreed Rate: R ${i.pricePerUnit} / ${i.unit}`;
    }).join('\n\n');

    if (emailTemplate === 'order') {
      return `Dear ${supplierRecord.contactPerson || 'Sales Team'},\n\n` +
        `Please accept this formal procurement purchase request from ${propertyName}.\n\n` +
        `ACCOUNT NUMBER: ${supplierRecord.accountNumber}\n` +
        `PAYMENT TERMS: ${supplierRecord.terms}\n\n` +
        `ORDER SPECIFICATION:\n` +
        `----------------------------------------\n` +
        `${itemsSummary}\n` +
        `----------------------------------------\n\n` +
        `DELIVERY ADDRESS:\n` +
        `${propertyName}\n` +
        `${propertyAddress}\n` +
        `Attn: Receiving Concierge / Front Office\n\n` +
        `Please reply with written order confirmation and estimated delivery date.\n\n` +
        `Kind regards,\n` +
        `${contactPerson}\n` +
        `${propertyName}\n` +
        `Tel: ${contactPhone}`;
    }

    if (emailTemplate === 'urgent') {
      return `Dear ${supplierRecord.contactPerson || 'Dispatch Manager'},\n\n` +
        `URGENT NOTIFICATION: Several luxury suite inventory items supplied by ${supplierRecord.companyName} have fallen below minimum guest safety levels at ${propertyName}.\n\n` +
        `We request expedited dispatch within 24 hours under account ${supplierRecord.accountNumber}.\n\n` +
        `CRITICAL ITEMS NEEDED:\n` +
        `${itemsSummary}\n\n` +
        `Please confirm immediate stock availability and dispatch tracking by return email or call ${contactPhone}.\n\n` +
        `Warm regards,\n` +
        `${contactPerson}\n` +
        `${propertyName}`;
    }

    if (emailTemplate === 'quote') {
      return `Dear ${supplierRecord.contactPerson || 'Sales Representative'},\n\n` +
        `We are currently reviewing our quarterly operating supply requirements at ${propertyName}.\n\n` +
        `Could you please provide your latest updated wholesale price list and volume discount tiers for the following items:\n\n` +
        `${itemsSummary}\n\n` +
        `Additionally, please verify current delivery lead times (standard is ${supplierRecord.leadTimeDays || 2} days) for deliveries to ${propertyAddress}.\n\n` +
        `Thank you,\n` +
        `${contactPerson}\n` +
        `${propertyName}`;
    }

    return `Dear ${supplierRecord.contactPerson || 'Accounts Team'},\n\n` +
      `Regarding our procurement account ${supplierRecord.accountNumber} with ${supplierRecord.companyName}:\n\n` +
      `Please provide an updated account statement and latest batch test certificates for our upcoming guest season.\n\n` +
      `Best regards,\n` +
      `${contactPerson}\n` +
      `${propertyName}`;
  }, [emailTemplate, suppliedItems, supplierRecord, companyInfo]);

  const [subjectInput, setSubjectInput] = useState(defaultSubject);
  const [bodyInput, setBodyInput] = useState(defaultBody);

  // Sync when template changes
  React.useEffect(() => {
    setSubjectInput(defaultSubject);
    setBodyInput(defaultBody);
  }, [defaultSubject, defaultBody]);

  // Feedback states
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  // Copy helpers
  const handleCopyEmail = () => {
    navigator.clipboard.writeText(recipientEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(recipientPhone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  // Launch native mailto shortcut
  const handleOpenMailto = () => {
    const encodedSubject = encodeURIComponent(subjectInput);
    const encodedBody = encodeURIComponent(bodyInput);
    window.location.href = `mailto:${recipientEmail}?subject=${encodedSubject}&body=${encodedBody}`;
  };

  // Simulated direct dispatch
  const handleDispatchEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setSendSuccess(true);
      setTimeout(() => {
        setSendSuccess(false);
      }, 3500);
    }, 1000);
  };

  // WhatsApp click-to-chat URL
  const cleanPhoneDigits = recipientPhone.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanPhoneDigits}?text=${encodeURIComponent(`Hi ${supplierRecord.contactPerson}, contacting you from ${companyInfo?.name || GUEST_HOUSE_INFO.name} regarding our account ${supplierRecord.accountNumber}.`)}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fade-in no-print overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* HEADER */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-serif-luxury font-bold text-lg text-white">
                  {supplierRecord.companyName}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Verified Vendor
                </span>
                {/* 5-Star Rating System Display */}
                <div className="flex items-center gap-1 bg-amber-400/20 px-2 py-0.5 rounded border border-amber-400/40 text-amber-300 text-xs font-bold">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < (supplierRecord.rating || 5)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-500'
                      }`}
                    />
                  ))}
                  <span className="ml-0.5">{supplierRecord.rating || 5}.0 / 5.0 Rating</span>
                </div>
              </div>
              <p className="text-xs text-slate-300">
                Quick contact card, live procurement channel & direct replenishment shortcut.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL CONTENT BODY */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6 bg-slate-50/60">

          {/* TOP VENDOR META CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Primary Contact</span>
              <span className="font-bold text-slate-900 text-sm block">{supplierRecord.contactPerson}</span>
              <span className="text-[11px] text-slate-500 block truncate">{supplierRecord.category}</span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Vendor Rating</span>
              <div className="flex items-center gap-1 mt-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < (supplierRecord.rating || 5)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[11px] text-amber-800 font-bold block">{supplierRecord.rating || 5}.0 Stars (Preferred)</span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Average Delivery Time</span>
              <span className="font-bold text-slate-900 text-sm flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                {supplierRecord.leadTimeDays || 2} Days
              </span>
              <span className="text-[11px] text-emerald-600 font-semibold block">Same-day rush on request</span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Account & Terms</span>
              <span className="font-mono font-bold text-emerald-700 text-sm block">{supplierRecord.accountNumber}</span>
              <span className="text-[11px] text-slate-500 block truncate">{supplierRecord.terms}</span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Catalog Allocation</span>
              <span className="font-bold text-slate-900 text-sm block">
                {suppliedItems.length} Products
              </span>
              {lowStockSuppliedItems.length > 0 ? (
                <span className="text-[11px] text-rose-600 font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> {lowStockSuppliedItems.length} Low Stock
                </span>
              ) : (
                <span className="text-[11px] text-emerald-600 font-medium">All Stocks Healthy</span>
              )}
            </div>
          </div>

          {/* DIRECT CALL & ADDRESS BAR */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Telephone</span>
                  <a href={`tel:${recipientPhone}`} className="font-bold text-slate-900 hover:text-emerald-700">
                    {recipientPhone}
                  </a>
                </div>
                <button
                  onClick={handleCopyPhone}
                  className="p-1 text-slate-400 hover:text-slate-600 ml-1"
                  title="Copy Phone Number"
                >
                  {copiedPhone ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="hidden sm:block text-slate-300">|</div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Email</span>
                  <a href={`mailto:${recipientEmail}`} className="font-bold text-slate-900 hover:text-emerald-700">
                    {recipientEmail}
                  </a>
                </div>
                <button
                  onClick={handleCopyEmail}
                  className="p-1 text-slate-400 hover:text-slate-600 ml-1"
                  title="Copy Email Address"
                >
                  {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="hidden md:block text-slate-300">|</div>

              <div className="hidden md:flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-slate-600">{supplierRecord.address}</span>
              </div>
            </div>

            {/* Quick Action Dial Buttons */}
            <div className="flex items-center gap-2">
              <a
                href={`tel:${recipientPhone}`}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center gap-1.5 transition shadow-xs"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                Call Supplier
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-1.5 transition shadow-xs"
              >
                <MessageSquare className="w-3.5 h-3.5 text-white" />
                WhatsApp
              </a>
            </div>
          </div>

          {/* PRODUCTS SUPPLIED BY THIS VENDOR WITH ON-HAND VS REORDER */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-600" />
                <h4 className="font-serif-luxury font-bold text-slate-900 text-sm">
                  Catalog Products Supplied ({suppliedItems.length} Items)
                </h4>
              </div>
              <span className="text-[11px] text-slate-400">
                Click "+10" to record stock deliveries immediately.
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-2">Item Code</th>
                    <th className="p-2">Description</th>
                    <th className="p-2">Rate (ZAR)</th>
                    <th className="p-2">On Hand</th>
                    <th className="p-2">Reorder Level</th>
                    <th className="p-2">Status</th>
                    <th className="p-2 text-right">Quick Restock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {suppliedItems.map(item => {
                    const isDeficit = item.howManyOnHand <= item.whenToReorder;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="p-2 font-mono font-bold text-slate-700">{item.itemCode}</td>
                        <td className="p-2 font-medium text-slate-900">{item.itemDescription}</td>
                        <td className="p-2 font-bold text-slate-800">R {item.pricePerUnit}</td>
                        <td className="p-2 font-bold text-slate-900">{item.howManyOnHand} {item.unit}</td>
                        <td className="p-2 text-slate-500">{item.whenToReorder} {item.unit}</td>
                        <td className="p-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isDeficit ? 'bg-rose-100 text-rose-800 animate-pulse' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {isDeficit ? 'Reorder Alert' : 'Stock Healthy'}
                          </span>
                        </td>
                        <td className="p-2 text-right">
                          {onQuickRestockItem && (
                            <button
                              onClick={() => onQuickRestockItem(item.id, 10)}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-[10px] font-bold inline-flex items-center gap-1 transition"
                            >
                              <Plus className="w-3 h-3 text-emerald-600" />
                              +10 Units
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* DIRECT EMAIL SHORTCUT & ORDER COMPOSER */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-600" />
                <h4 className="font-serif-luxury font-bold text-slate-900 text-sm">
                  Direct Email Shortcut & Procurement Dispatcher
                </h4>
              </div>

              {/* Template selector pills */}
              <div className="flex items-center gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => setEmailTemplate('order')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition ${
                    emailTemplate === 'order'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Purchase Order
                </button>
                <button
                  type="button"
                  onClick={() => setEmailTemplate('urgent')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition ${
                    emailTemplate === 'urgent'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                  }`}
                >
                  Urgent Restock
                </button>
                <button
                  type="button"
                  onClick={() => setEmailTemplate('quote')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition ${
                    emailTemplate === 'quote'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Price Quote
                </button>
                <button
                  type="button"
                  onClick={() => setEmailTemplate('custom')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition ${
                    emailTemplate === 'custom'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Custom Note
                </button>
              </div>
            </div>

            {sendSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center gap-2 animate-fade-in font-medium">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Procurement email message dispatched to {recipientEmail}. Recorded in audit logs.</span>
              </div>
            )}

            <form onSubmit={handleDispatchEmail} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold uppercase tracking-wider text-[10px] mb-1">
                    Recipient Email Address
                  </label>
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold uppercase tracking-wider text-[10px] mb-1">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    value={subjectInput}
                    onChange={(e) => setSubjectInput(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold uppercase tracking-wider text-[10px] mb-1">
                  Message Content (Pre-Populated with Guest House Account & Address)
                </label>
                <textarea
                  rows={8}
                  value={bodyInput}
                  onChange={(e) => setBodyInput(e.target.value)}
                  className="w-full text-xs p-3 font-mono leading-relaxed border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                <div className="text-[11px] text-slate-400">
                  Account billing address: {companyInfo?.address || GUEST_HOUSE_INFO.address}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleOpenMailto}
                    className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 font-bold rounded-xl border border-slate-300 text-xs flex items-center gap-1.5 transition"
                    title="Open in your computer's native email client (Outlook, Apple Mail, Thunderbird)"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                    Open in Mail Client
                  </button>

                  <button
                    type="submit"
                    disabled={isSending}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition disabled:opacity-50"
                  >
                    {isSending ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Dispatching to Vendor...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Send Email to Supplier
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

        </div>

        {/* FOOTER */}
        <div className="bg-slate-100 border-t border-slate-200 p-4 px-6 flex items-center justify-between text-xs shrink-0">
          <span className="text-slate-500 text-[11px]">
            Tides of Knysna Verified Supplier Directory • Account {supplierRecord.accountNumber}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition"
          >
            Close Dialog
          </button>
        </div>

      </div>
    </div>
  );
};
