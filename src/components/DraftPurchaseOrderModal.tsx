import React, { useState } from 'react';
import { InventoryItem, CompanyInfoData } from '../types';
import { Mail, CheckCircle, X, Download, Copy, Send, Truck, AlertTriangle, FileText, Check } from 'lucide-react';

interface DraftPurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventoryItem[];
  companyInfo: CompanyInfoData;
  onConfirmOrderSent?: (orderedItemIds: string[]) => void;
}

export const DraftPurchaseOrderModal: React.FC<DraftPurchaseOrderModalProps> = ({
  isOpen,
  onClose,
  inventory,
  companyInfo,
  onConfirmOrderSent
}) => {
  if (!isOpen) return null;

  // Filter low stock items
  const lowStockItems = inventory.filter(i => i.howManyOnHand <= i.whenToReorder);

  // Group by supplier
  const bySupplier: { [supplierName: string]: InventoryItem[] } = {};
  lowStockItems.forEach(item => {
    const sup = item.supplier || 'General Supplier';
    if (!bySupplier[sup]) bySupplier[sup] = [];
    bySupplier[sup].push(item);
  });

  const suppliers = Object.keys(bySupplier);
  const [selectedSupplier, setSelectedSupplier] = useState<string>(suppliers[0] || '');
  const [copiedSupplier, setCopiedSupplier] = useState<string | null>(null);
  const [sentSuccess, setSentSuccess] = useState<string | null>(null);

  const activeItems = bySupplier[selectedSupplier] || lowStockItems;

  const totalEstimatedCost = activeItems.reduce((sum, item) => {
    const qtyNeeded = Math.max(1, (item.whenToReorder * 2) - item.howManyOnHand);
    return sum + (item.pricePerUnit * qtyNeeded);
  }, 0);

  const generateEmailBody = (supName: string, items: InventoryItem[]) => {
    const itemListText = items.map(item => {
      const qtyNeeded = Math.max(1, (item.whenToReorder * 2) - item.howManyOnHand);
      return `- [${item.itemCode}] ${item.itemDescription}: Qty Needed = ${qtyNeeded} ${item.unit} (Current On Hand: ${item.howManyOnHand}, Reorder Threshold: ${item.whenToReorder}) - Est. Unit Price: R ${item.pricePerUnit}`;
    }).join('\n');

    return `Subject: URGENT PURCHASE ORDER REQUISITION - ${companyInfo.name}
To: Orders / Sales Department (${supName})
From: ${companyInfo.salesPerson} (${companyInfo.email})
Delivery Address: ${companyInfo.address}, ${companyInfo.postalCode}

Dear ${supName} Team,

Please find below our automated low-stock replenishment purchase order requisition compiled from our inventory control system for ${companyInfo.name}.

ORDER ITEMS REQUIRED:
${itemListText}

TOTAL ESTIMATED COST: R ${items.reduce((s, i) => s + i.pricePerUnit * Math.max(1, i.whenToReorder * 2 - i.howManyOnHand), 0).toLocaleString()}

Please confirm receipt of this order, pro-forma invoice, and estimated delivery lead time to our Knysna property within 24 hours.

Kind regards,
${companyInfo.salesPerson}
Head of Procurement & Operations
${companyInfo.name}
Tel: ${companyInfo.telephone} | Web: ${companyInfo.webAddress}`;
  };

  const handleCopy = (supName: string, items: InventoryItem[]) => {
    const text = generateEmailBody(supName, items);
    navigator.clipboard.writeText(text);
    setCopiedSupplier(supName);
    setTimeout(() => setCopiedSupplier(null), 3000);
  };

  const handleSendDraft = (supName: string, items: InventoryItem[]) => {
    const emailBody = generateEmailBody(supName, items);
    const mailtoUrl = `mailto:orders@supplier.co.za?subject=${encodeURIComponent(`Purchase Order Requisition - ${companyInfo.name}`)}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoUrl;

    setSentSuccess(`Email draft successfully opened for ${supName}!`);
    if (onConfirmOrderSent) {
      onConfirmOrderSent(items.map(i => i.id));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in no-print">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/30">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-luxury font-bold text-lg">Automated Draft Purchase Order Generator</h3>
              <p className="text-xs text-slate-300">Compiles all low stock items into formatted supplier email drafts</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
          {lowStockItems.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
              <h4 className="font-serif-luxury font-bold text-slate-900 text-base">All Inventory Stock Levels Are Adequate</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No items currently fall below their reorder threshold. There are no low stock items requiring purchase order generation at this time.
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs"
              >
                Close Window
              </button>
            </div>
          ) : (
            <>
              {sentSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-3.5 rounded-2xl flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{sentSuccess}</span>
                  </div>
                  <button onClick={() => setSentSuccess(null)} className="text-emerald-700 hover:text-emerald-900">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Supplier Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                <span className="text-xs font-bold text-slate-500 uppercase shrink-0">Select Supplier:</span>
                {suppliers.map(sup => {
                  const count = bySupplier[sup].length;
                  return (
                    <button
                      key={sup}
                      onClick={() => setSelectedSupplier(sup)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 border ${
                        selectedSupplier === sup
                          ? 'bg-slate-900 text-white border-slate-950 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Truck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{sup}</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${selectedSupplier === sup ? 'bg-emerald-500 text-slate-950' : 'bg-slate-200 text-slate-700'}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Selected Supplier Draft Preview */}
              {selectedSupplier && bySupplier[selectedSupplier] && (
                <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
                    <div>
                      <h4 className="font-serif-luxury font-bold text-slate-900 text-sm">
                        Purchase Order Draft for: {selectedSupplier}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {bySupplier[selectedSupplier].length} low-stock items included · Estimated Total: R {bySupplier[selectedSupplier].reduce((s, i) => s + i.pricePerUnit * Math.max(1, i.whenToReorder * 2 - i.howManyOnHand), 0).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(selectedSupplier, bySupplier[selectedSupplier])}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center gap-1.5 transition border border-slate-200 shadow-xs"
                      >
                        {copiedSupplier === selectedSupplier ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied Draft to Clipboard
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-600" /> Copy Email Draft
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleSendDraft(selectedSupplier, bySupplier[selectedSupplier])}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Open Email Draft in Client
                      </button>
                    </div>
                  </div>

                  {/* Items Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="px-3 py-2">Item Code</th>
                          <th className="px-3 py-2">Description</th>
                          <th className="px-3 py-2">On Hand</th>
                          <th className="px-3 py-2">Reorder Level</th>
                          <th className="px-3 py-2">Suggested Order Qty</th>
                          <th className="px-3 py-2">Unit Price</th>
                          <th className="px-3 py-2">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {bySupplier[selectedSupplier].map(item => {
                          const qtyNeeded = Math.max(1, (item.whenToReorder * 2) - item.howManyOnHand);
                          const subtotal = item.pricePerUnit * qtyNeeded;
                          return (
                            <tr key={item.id} className="hover:bg-slate-50">
                              <td className="px-3 py-2 font-mono font-bold text-slate-700">{item.itemCode}</td>
                              <td className="px-3 py-2 font-semibold text-slate-900">{item.itemDescription}</td>
                              <td className="px-3 py-2 font-bold text-rose-600">{item.howManyOnHand} {item.unit}</td>
                              <td className="px-3 py-2 text-slate-500">{item.whenToReorder} {item.unit}</td>
                              <td className="px-3 py-2 font-bold text-emerald-700">{qtyNeeded} {item.unit}</td>
                              <td className="px-3 py-2 text-slate-700">R {item.pricePerUnit}</td>
                              <td className="px-3 py-2 font-bold text-slate-900 font-mono">R {subtotal.toLocaleString()}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Email Textarea Preview */}
                  <div className="space-y-1.5 pt-2">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Formatted Email Body Preview:
                    </label>
                    <textarea
                      readOnly
                      rows={8}
                      value={generateEmailBody(selectedSupplier, bySupplier[selectedSupplier])}
                      className="w-full font-mono text-[11px] bg-slate-900 text-slate-100 p-3.5 rounded-2xl border border-slate-800 outline-none resize-none"
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 font-medium">
            Total Low Stock Requisition Items: <strong className="text-slate-900">{lowStockItems.length} items</strong> across <strong className="text-slate-900">{suppliers.length} vendors</strong>
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
