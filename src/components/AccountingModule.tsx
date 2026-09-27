import React, { useState } from 'react';
import { 
  DollarSign, 
  FileText, 
  Plus, 
  Trash2, 
  Printer, 
  Mail, 
  Download, 
  TrendingUp, 
  BarChart3, 
  Calendar, 
  CheckCircle, 
  Building, 
  CreditCard,
  Layers,
  ArrowRight,
  Eye,
  Edit3
} from 'lucide-react';
import { DocumentActionBar } from './DocumentActionBar';
import { AccountingDocument, Reservation } from '../types';
import { INITIAL_ACCOUNTING_DOCS, GUEST_HOUSE_INFO } from '../data/initialData';
import { FiscalAnalyticsChart } from './FiscalAnalyticsChart';

export interface AccountingModuleProps {
  reservations?: Reservation[];
}

export const AccountingModule: React.FC<AccountingModuleProps> = ({ reservations = [] }) => {
  const [documents, setDocuments] = useState<AccountingDocument[]>(INITIAL_ACCOUNTING_DOCS);
  const [activeDocType, setActiveDocType] = useState<string>('All');
  const [selectedDocId, setSelectedDocId] = useState<string>(documents[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'documents' | 'trial_balance' | 'sales_graphs' | 'reconciliation'>('documents');
  const [isEditing, setIsEditing] = useState(false);

  const activeDoc = documents.find(d => d.id === selectedDocId) || documents[0];
  const [formData, setFormData] = useState<AccountingDocument>(activeDoc);

  React.useEffect(() => {
    if (activeDoc) {
      setFormData(activeDoc);
    }
  }, [selectedDocId]);

  const filteredDocs = activeDocType === 'All' 
    ? documents 
    : documents.filter(d => d.documentType === activeDocType);

  const generateAutoNumber = (type: string) => {
    const prefixMap: Record<string, string> = {
      'Invoice': 'INV',
      'Quote': 'QUO',
      'Purchase Order': 'PO',
      'Statement': 'STM',
      'Statement with Payment Stub': 'STM-STUB',
      'Credit Note': 'CRN',
      'Sales Invoice': 'SINV',
      'Estimate': 'EST'
    };
    const prefix = prefixMap[type] || 'DOC';
    const randNum = Math.floor(100 + Math.random() * 900);
    return `${prefix}-2026-0${randNum}`;
  };

  const handleCreateNewDoc = (type: AccountingDocument['documentType']) => {
    const newDocNumber = generateAutoNumber(type);
    const newDoc: AccountingDocument = {
      id: `acc-${Date.now()}`,
      documentType: type,
      documentNumber: newDocNumber,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      clientOrSupplierName: 'New Client / Guest',
      clientEmail: 'client@example.com',
      clientPhone: '+27 ',
      clientAddress: 'Garden Route, South Africa',
      items: [
        { description: 'Luxury Suite Accommodation (2 Nights)', quantity: 2, unitPrice: 2850, taxRate: 15, total: 5700 },
        { description: 'Gourmet Lagoon Breakfast & Amenities', quantity: 2, unitPrice: 350, taxRate: 15, total: 700 }
      ],
      subtotal: 6400,
      taxAmount: 960,
      discount: 0,
      grandTotal: 7360,
      amountPaid: 0,
      balanceDue: 7360,
      paymentStubDetails: type.includes('Stub') ? {
        accountNumber: GUEST_HOUSE_INFO.bankDetails.accountNumber,
        bankName: GUEST_HOUSE_INFO.bankDetails.bankName,
        branchCode: GUEST_HOUSE_INFO.bankDetails.branchCode,
        reference: `${newDocNumber} / Guest`
      } : undefined,
      notes: 'Thank you for your patronage with Tides of Knysna.',
      terms: 'Payment due within 14 days of issue.',
      status: 'Draft'
    };

    setDocuments([newDoc, ...documents]);
    setSelectedDocId(newDoc.id);
    setFormData(newDoc);
    setIsEditing(true);
  };

  const handleSaveDoc = () => {
    // recalculate totals
    const sub = formData.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
    const tax = sub * 0.15;
    const total = sub + tax - (formData.discount || 0);
    const balance = total - (formData.amountPaid || 0);

    const updated: AccountingDocument = {
      ...formData,
      subtotal: sub,
      taxAmount: tax,
      grandTotal: total,
      balanceDue: balance
    };

    setFormData(updated);
    setDocuments(documents.map(d => d.id === updated.id ? updated : d));
    setIsEditing(false);
  };

  const handleAddItem = () => {
    const newItem = { description: 'New Line Item', quantity: 1, unitPrice: 500, taxRate: 15, total: 500 };
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const handleRemoveItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, idx) => idx !== index)
    }));
  };

  const handleUpdateItem = (index: number, field: string, value: any) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
      total: field === 'quantity' 
        ? (value * updatedItems[index].unitPrice) 
        : field === 'unitPrice' 
        ? (updatedItems[index].quantity * value) 
        : updatedItems[index].total
    };
    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  return (
    <div className="space-y-6">
      {/* Top Document Action Bar */}
      <DocumentActionBar
        documentTitle={`${formData.documentType} - ${formData.documentNumber}`}
        documentNumber={formData.documentNumber}
        recipientEmail={formData.clientEmail}
        onSave={handleSaveDoc}
      />

      {/* Main Top Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-xl p-1 shadow-xs text-xs font-semibold no-print">
        <button
          onClick={() => setActiveTab('documents')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition ${
            activeTab === 'documents'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-emerald-400" />
          Financial Documents & Templates
        </button>

        <button
          onClick={() => setActiveTab('trial_balance')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition ${
            activeTab === 'trial_balance'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-emerald-400" />
          Trial Balance (Quarterly & Yearly)
        </button>

        <button
          onClick={() => setActiveTab('sales_graphs')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition ${
            activeTab === 'sales_graphs'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          Revenue Trends, Seasonal Bookings & Shifts (Line Charts)
        </button>

        <button
          onClick={() => setActiveTab('reconciliation')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition ${
            activeTab === 'reconciliation'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          Monthly & Quarterly Reconciliation
        </button>
      </div>

      {/* TAB 1: FINANCIAL DOCUMENTS & TEMPLATES */}
      {activeTab === 'documents' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Documents Directory & Filter (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-4 no-print">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Financial Document Hub</h3>
                <span className="text-[11px] text-slate-500">Auto-numbered quotes, invoices & statements</span>
              </div>
            </div>

            {/* Quick Generator Buttons */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Generate Editable Document:
              </span>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                <button
                  onClick={() => handleCreateNewDoc('Quote')}
                  className="p-1.5 bg-white hover:bg-emerald-50 rounded border border-slate-200 font-semibold text-slate-800 text-left transition"
                >
                  + Quotation
                </button>
                <button
                  onClick={() => handleCreateNewDoc('Invoice')}
                  className="p-1.5 bg-white hover:bg-emerald-50 rounded border border-slate-200 font-semibold text-slate-800 text-left transition"
                >
                  + Tax Invoice
                </button>
                <button
                  onClick={() => handleCreateNewDoc('Statement with Payment Stub')}
                  className="p-1.5 bg-white hover:bg-emerald-50 rounded border border-slate-200 font-semibold text-slate-800 text-left transition"
                >
                  + Statement + Stub
                </button>
                <button
                  onClick={() => handleCreateNewDoc('Purchase Order')}
                  className="p-1.5 bg-white hover:bg-emerald-50 rounded border border-slate-200 font-semibold text-slate-800 text-left transition"
                >
                  + Purchase Order
                </button>
                <button
                  onClick={() => handleCreateNewDoc('Credit Note')}
                  className="p-1.5 bg-white hover:bg-emerald-50 rounded border border-slate-200 font-semibold text-slate-800 text-left transition"
                >
                  + Credit Note
                </button>
                <button
                  onClick={() => handleCreateNewDoc('Estimate')}
                  className="p-1.5 bg-white hover:bg-emerald-50 rounded border border-slate-200 font-semibold text-slate-800 text-left transition"
                >
                  + Estimate
                </button>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex gap-1 overflow-x-auto pb-1 text-xs">
              {['All', 'Invoice', 'Statement with Payment Stub', 'Quote', 'Purchase Order', 'Credit Note'].map(t => (
                <button
                  key={t}
                  onClick={() => setActiveDocType(t)}
                  className={`px-2 py-1 rounded-md text-[11px] whitespace-nowrap transition ${
                    activeDocType === t 
                      ? 'bg-slate-900 text-white font-bold' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {t === 'Statement with Payment Stub' ? 'Statements' : t}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {filteredDocs.map(doc => {
                const isSelected = doc.id === selectedDocId;
                return (
                  <div
                    key={doc.id}
                    onClick={() => {
                      setSelectedDocId(doc.id);
                      setIsEditing(false);
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition ${
                      isSelected
                        ? 'bg-emerald-50/80 border-emerald-400 shadow-xs'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-bold text-emerald-800">{doc.documentNumber}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
                        {doc.documentType}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-900">{doc.clientOrSupplierName}</div>
                    <div className="text-[11px] text-slate-500 flex items-center justify-between mt-1">
                      <span>Date: {doc.date}</span>
                      <strong className="text-slate-800">R {doc.grandTotal.toLocaleString()}</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Full Official Printable Document (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6 printable-area">
            {/* Action toggle header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 no-print">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-900 text-emerald-400">
                  {formData.documentType}
                </span>
                <span className="text-xs font-mono font-bold text-slate-700">
                  #{formData.documentNumber}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition ${
                    isEditing 
                      ? 'bg-amber-50 text-amber-800 border-amber-300' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300'
                  }`}
                >
                  {isEditing ? 'Preview Document' : 'Edit Line Items'}
                </button>
                <button
                  onClick={handleSaveDoc}
                  className="px-3.5 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </div>

            {/* Official Guest House Letterhead Design */}
            <div className="space-y-6">
              {/* Document Header */}
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5">
                <div>
                  <h1 className="font-serif-luxury text-xl md:text-2xl font-bold text-slate-950">
                    {GUEST_HOUSE_INFO.name}
                  </h1>
                  <p className="text-xs text-emerald-700 font-medium italic">
                    "{GUEST_HOUSE_INFO.tagline}"
                  </p>
                  <div className="text-[11px] text-slate-600 mt-2 space-y-0.5">
                    <div>{GUEST_HOUSE_INFO.address}</div>
                    <div>Tel: {GUEST_HOUSE_INFO.contactNumbers} | VAT Reg: 4890281928</div>
                    <div>Email: {GUEST_HOUSE_INFO.email} | Web: {GUEST_HOUSE_INFO.webAddress}</div>
                  </div>
                </div>

                <div className="text-right">
                  <h2 className="text-xl font-bold text-slate-900 uppercase tracking-wider">
                    {formData.documentType}
                  </h2>
                  <div className="text-xs font-mono font-bold text-emerald-800 mt-1">
                    {formData.documentNumber}
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    Issue Date: <strong>{formData.date}</strong>
                  </div>
                  <div className="text-xs text-slate-600">
                    Due Date: <strong>{formData.dueDate}</strong>
                  </div>
                </div>
              </div>

              {/* Bill To / Recipient Details */}
              <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Billed To / Account Holder:
                  </span>
                  {isEditing ? (
                    <div className="space-y-1">
                      <input
                        type="text"
                        value={formData.clientOrSupplierName}
                        onChange={(e) => setFormData({ ...formData, clientOrSupplierName: e.target.value })}
                        className="w-full text-xs p-1 border rounded"
                        placeholder="Client name"
                      />
                      <input
                        type="text"
                        value={formData.clientAddress}
                        onChange={(e) => setFormData({ ...formData, clientAddress: e.target.value })}
                        className="w-full text-xs p-1 border rounded"
                        placeholder="Client address"
                      />
                      <input
                        type="email"
                        value={formData.clientEmail}
                        onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                        className="w-full text-xs p-1 border rounded"
                        placeholder="Client email"
                      />
                    </div>
                  ) : (
                    <div>
                      <div className="font-bold text-sm text-slate-900">{formData.clientOrSupplierName}</div>
                      <div className="text-slate-600 mt-0.5">{formData.clientAddress}</div>
                      <div className="text-slate-600">{formData.clientEmail}</div>
                      <div className="text-slate-600">{formData.clientPhone}</div>
                    </div>
                  )}
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Bank Remittance Particulars:
                  </span>
                  <div className="text-slate-700 space-y-0.5">
                    <div>Bank: <strong>{GUEST_HOUSE_INFO.bankDetails.bankName}</strong></div>
                    <div>Account: <strong>{GUEST_HOUSE_INFO.bankDetails.accountNumber}</strong></div>
                    <div>Branch Code: <strong>{GUEST_HOUSE_INFO.bankDetails.branchCode}</strong></div>
                    <div>Reference: <strong className="text-emerald-800">{formData.documentNumber}</strong></div>
                  </div>
                </div>
              </div>

              {/* Editable Items Table */}
              <div>
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-900 text-left text-slate-700 font-bold">
                      <th className="py-2.5">Item Description</th>
                      <th className="py-2.5 text-center w-16">Qty</th>
                      <th className="py-2.5 text-right w-28">Unit Price</th>
                      <th className="py-2.5 text-right w-24">Tax (15%)</th>
                      <th className="py-2.5 text-right w-28">Total (ZAR)</th>
                      {isEditing && <th className="py-2.5 text-center w-12 no-print"></th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {formData.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5">
                          {isEditing ? (
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => handleUpdateItem(idx, 'description', e.target.value)}
                              className="w-full text-xs p-1 border rounded"
                            />
                          ) : (
                            <span className="font-medium text-slate-900">{item.description}</span>
                          )}
                        </td>
                        <td className="py-2.5 text-center">
                          {isEditing ? (
                            <input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) => handleUpdateItem(idx, 'quantity', parseInt(e.target.value) || 1)}
                              className="w-14 text-xs p-1 border rounded text-center"
                            />
                          ) : (
                            item.quantity
                          )}
                        </td>
                        <td className="py-2.5 text-right">
                          {isEditing ? (
                            <input
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) => handleUpdateItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                              className="w-24 text-xs p-1 border rounded text-right"
                            />
                          ) : (
                            `R ${item.unitPrice.toLocaleString()}`
                          )}
                        </td>
                        <td className="py-2.5 text-right text-slate-500">
                          R {((item.quantity * item.unitPrice) * 0.15).toFixed(2)}
                        </td>
                        <td className="py-2.5 text-right font-bold text-slate-900">
                          R {(item.quantity * item.unitPrice).toLocaleString()}
                        </td>
                        {isEditing && (
                          <td className="py-2.5 text-center no-print">
                            <button
                              onClick={() => handleRemoveItem(idx)}
                              className="text-slate-400 hover:text-rose-600"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>

                {isEditing && (
                  <button
                    onClick={handleAddItem}
                    className="mt-2 text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 no-print"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Document Line Item
                  </button>
                )}
              </div>

              {/* Totals Summary */}
              <div className="flex justify-end pt-2">
                <div className="w-72 space-y-2 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span>R {formData.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>VAT (15%):</span>
                    <span>R {formData.taxAmount.toLocaleString()}</span>
                  </div>
                  {formData.discount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Discount / Privilege:</span>
                      <span>- R {formData.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-slate-900 text-sm pt-2 border-t border-slate-300">
                    <span>Grand Total:</span>
                    <span>R {formData.grandTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 text-[11px]">
                    <span>Amount Paid:</span>
                    <span>R {(formData.amountPaid || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-emerald-800 text-xs pt-1 border-t border-slate-200">
                    <span>Balance Due:</span>
                    <span>R {(formData.balanceDue || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* PAYMENT STUB (IF APPLICABLE) */}
              {formData.documentType.includes('Stub') && (
                <div className="border-t-2 border-dashed border-slate-400 pt-5 mt-6">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-300 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-emerald-700" />
                        Remittance Payment Stub (Please detach or attach with EFT)
                      </span>
                      <span className="font-mono text-xs font-bold text-emerald-800">
                        REF: {formData.documentNumber}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Client / Account:</span>
                        <strong className="text-slate-800">{formData.clientOrSupplierName}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Total Due:</span>
                        <strong className="text-emerald-800">R {formData.grandTotal.toLocaleString()}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Bank Account:</span>
                        <strong className="text-slate-800">FNB: {GUEST_HOUSE_INFO.bankDetails.accountNumber}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Amount Paid (ZAR):</span>
                        <div className="border-b border-slate-400 pb-0.5 mt-1 text-slate-400">R ______________</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Terms and notes */}
              <div className="pt-4 border-t border-slate-200 text-[10px] text-slate-500 space-y-1">
                <div><strong>Terms & Conditions:</strong> {formData.terms}</div>
                <div><strong>Special Notes:</strong> {formData.notes}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TRIAL BALANCE (YEARLY & QUARTERLY) */}
      {activeTab === 'trial_balance' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Tides of Knysna - Trial Balance (Quarterly & Yearly 2026)
              </h2>
              <p className="text-xs text-slate-500">
                Standard double-entry accounting ledger verification across all operational accounts
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Books Balanced (Debit = Credit)
              </span>
            </div>
          </div>

          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-bold text-left">
                <th className="py-2.5 px-3 rounded-l-lg">Account Code & Title</th>
                <th className="py-2.5 px-3">Classification</th>
                <th className="py-2.5 px-3 text-right">Debit (ZAR)</th>
                <th className="py-2.5 px-3 text-right rounded-r-lg">Credit (ZAR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              <tr>
                <td className="py-2.5 px-3 font-medium">1000 - FNB Primary Operational Cheque Acc</td>
                <td className="py-2.5 px-3 text-slate-500">Current Asset</td>
                <td className="py-2.5 px-3 text-right font-bold">R 482,190.00</td>
                <td className="py-2.5 px-3 text-right">-</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium">1010 - Breakage Deposits Trust Reserve</td>
                <td className="py-2.5 px-3 text-slate-500">Current Asset (Restricted)</td>
                <td className="py-2.5 px-3 text-right font-bold">R 45,500.00</td>
                <td className="py-2.5 px-3 text-right">-</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium">1200 - Accounts Receivable (Guest Bookings)</td>
                <td className="py-2.5 px-3 text-slate-500">Current Asset</td>
                <td className="py-2.5 px-3 text-right font-bold">R 128,400.00</td>
                <td className="py-2.5 px-3 text-right">-</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium">1500 - Linen, Furniture & Marine Assets</td>
                <td className="py-2.5 px-3 text-slate-500">Fixed Asset</td>
                <td className="py-2.5 px-3 text-right font-bold">R 1,840,000.00</td>
                <td className="py-2.5 px-3 text-right">-</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium">2000 - Accounts Payable (Suppliers & Linen)</td>
                <td className="py-2.5 px-3 text-slate-500">Current Liability</td>
                <td className="py-2.5 px-3 text-right">-</td>
                <td className="py-2.5 px-3 text-right font-bold">R 64,820.00</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium">2050 - Breakage Deposits Liability (Held)</td>
                <td className="py-2.5 px-3 text-slate-500">Current Liability</td>
                <td className="py-2.5 px-3 text-right">-</td>
                <td className="py-2.5 px-3 text-right font-bold">R 45,500.00</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium">4000 - Accommodation Room Revenue</td>
                <td className="py-2.5 px-3 text-slate-500">Operating Revenue</td>
                <td className="py-2.5 px-3 text-right">-</td>
                <td className="py-2.5 px-3 text-right font-bold">R 2,120,400.00</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium">4100 - Lagoon Excursion & Catering Income</td>
                <td className="py-2.5 px-3 text-slate-500">Ancillary Revenue</td>
                <td className="py-2.5 px-3 text-right">-</td>
                <td className="py-2.5 px-3 text-right font-bold">R 265,370.00</td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-900">
                <td colSpan={2} className="py-3 px-3 text-right">TOTAL TRIAL BALANCE:</td>
                <td className="py-3 px-3 text-right text-emerald-800">R 2,496,090.00</td>
                <td className="py-3 px-3 text-right text-emerald-800">R 2,496,090.00</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* TAB 3: SALES & MARKETING GRAPHS / FISCAL ANALYTICS */}
      {activeTab === 'sales_graphs' && (
        <div className="space-y-6">
          {/* Recharts Fiscal Analytics & Shift Line Chart */}
          <FiscalAnalyticsChart reservations={reservations} />

          {/* Suite Occupancy Breakdown & Historical Context */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Suite Occupancy Share */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm">Suite Occupancy Breakdown (FY 2026)</h3>
                <span className="text-[11px] text-emerald-600 font-bold">Lagoon Suites Top Demand</span>
              </div>
              <div className="space-y-3 text-xs">
                {[
                  { name: 'Suite 102 - Heads Panorama Villa', pct: 94, color: 'bg-emerald-600' },
                  { name: 'Suite 105 - Waterfront Penthouse', pct: 88, color: 'bg-blue-600' },
                  { name: 'Suite 101 - Lagoon Serenade', pct: 82, color: 'bg-indigo-600' },
                  { name: 'Suite 103 - Featherbed Haven', pct: 79, color: 'bg-cyan-600' },
                  { name: 'Suite 106 - Brenton Ocean Breeze', pct: 75, color: 'bg-teal-600' },
                  { name: 'Suite 104 - Outeniqua Canopy', pct: 71, color: 'bg-slate-600' },
                ].map(suite => (
                  <div key={suite.name}>
                    <div className="flex justify-between mb-0.5 font-medium text-slate-700">
                      <span>{suite.name}</span>
                      <strong>{suite.pct}% Occupancy</strong>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5">
                      <div className={`${suite.color} h-2.5 rounded-full`} style={{ width: `${suite.pct}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Knysna Tourism Seasonal Advisory */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm">Knysna Seasonal Tourism Calendar & Labor Strategy</h3>
                <span className="text-[11px] text-slate-500">FY2026 Cycle</span>
              </div>
              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100">
                  <strong className="text-emerald-900 block font-semibold">Summer Peak (Dec - Feb):</strong>
                  <span className="text-[11px] text-emerald-800">
                    Maximum international arrivals, full luxury occupancy (94-99%), and peak rostered shifts (395-460 hrs/mo) with full concierge & water sports active.
                  </span>
                </div>

                <div className="p-2.5 bg-amber-50/60 rounded-xl border border-amber-100">
                  <strong className="text-amber-900 block font-semibold">Winter Festival Surge (Knysna Oyster Fest - July):</strong>
                  <span className="text-[11px] text-amber-800">
                    Surge demand (61 bookings, 100% capacity) requiring +46 overtime shift hours to support festival tastings, lagoon excursions, and oyster gala turn-downs.
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <strong className="text-slate-900 block font-semibold">Autumn Maintenance & Deep Clean (May):</strong>
                  <span className="text-[11px] text-slate-600">
                    Off-peak shoulder (54% occupancy); shift hours scale down to 220 hrs for preventative maintenance, teak deck conditioning, and linen inventory audit.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: RECONCILIATION */}
      {activeTab === 'reconciliation' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Monthly & Quarterly Bank Reconciliation
              </h2>
              <p className="text-xs text-slate-500">
                FNB Cheque Account & Breakage Deposit Trust Reconciliation (September 2026)
              </p>
            </div>
            <button
              onClick={() => alert('Monthly reconciliation report generated and certified.')}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
            >
              Certify Monthly Recon
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-slate-500 block">Bank Statement Closing Balance:</span>
              <strong className="text-lg font-bold text-slate-900">R 482,190.00</strong>
              <span className="text-[11px] text-emerald-600 block">Direct FNB API feed matched</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-slate-500 block">General Ledger System Balance:</span>
              <strong className="text-lg font-bold text-slate-900">R 482,190.00</strong>
              <span className="text-[11px] text-emerald-600 block">All sales & PO entries posted</span>
            </div>

            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
              <span className="text-emerald-900 block font-semibold">Variance / Difference:</span>
              <strong className="text-lg font-bold text-emerald-800">R 0.00</strong>
              <span className="text-[11px] text-emerald-700 block">Zero variance - 100% reconciled</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
