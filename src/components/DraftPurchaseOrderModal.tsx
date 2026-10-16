import React, { useState } from 'react';
import { InventoryItem, CompanyInfoData } from '../types';
import { Mail, CheckCircle, X, Download, Copy, Send, Truck, AlertTriangle, FileText, Check, Sparkles, Calculator, Zap, ShieldCheck } from 'lucide-react';
import { calculateOrderDate, getDailyBurnRate, getSupplierLeadTime } from '../utils/predictiveOrderCalculator';
import { playLaserTagSound } from '../utils/audioUtils';

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

  // Filter low stock items (on hand <= reorder threshold or emergency level)
  const lowStockItems = inventory.filter(i => {
    const threshold = i.emergencyStockLevel !== undefined ? i.emergencyStockLevel : i.whenToReorder;
    return i.howManyOnHand <= threshold;
  });

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
  const [useSmartReplenishment, setUseSmartReplenishment] = useState(true);

  const activeItems = bySupplier[selectedSupplier] || lowStockItems;

  // Smart Replenishment Helper
  const getSmartReplenishment = (item: InventoryItem) => {
    const analysis = calculateOrderDate(item);
    const dailyBurnRate = analysis.dailyBurnRate;
    const monthlyMovingAvg = Number((dailyBurnRate * 30).toFixed(1));
    const leadTimeDays = analysis.leadTimeDays;
    const smartQty = analysis.recommendedOrderQty;
    const standardQty = Math.max(1, (item.whenToReorder * 2) - item.howManyOnHand);
    const suggestedQty = useSmartReplenishment ? smartQty : standardQty;

    return {
      dailyBurnRate,
      monthlyMovingAvg,
      leadTimeDays,
      smartQty,
      standardQty,
      suggestedQty
    };
  };

  const totalEstimatedCost = activeItems.reduce((sum, item) => {
    const { suggestedQty } = getSmartReplenishment(item);
    return sum + (item.pricePerUnit * suggestedQty);
  }, 0);

  const generateEmailBody = (supName: string, items: InventoryItem[]) => {
    const itemListText = items.map(item => {
      const { dailyBurnRate, monthlyMovingAvg, leadTimeDays, suggestedQty } = getSmartReplenishment(item);
      return `- [${item.itemCode}] ${item.itemDescription}:
    Order Qty = ${suggestedQty} ${item.unit}
    Current On Hand = ${item.howManyOnHand} ${item.unit} | Reorder Threshold = ${item.whenToReorder} ${item.unit}
    30-Day Moving Avg = ${monthlyMovingAvg} ${item.unit}/mo (${dailyBurnRate} ${item.unit}/day)
    Supplier Lead Time = ${leadTimeDays} days
    Est. Unit Price = R ${item.pricePerUnit} (Subtotal: R ${(item.pricePerUnit * suggestedQty).toLocaleString()})`;
    }).join('\n\n');

    const totalCost = items.reduce((s, i) => s + i.pricePerUnit * getSmartReplenishment(i).suggestedQty, 0);

    return `Subject: URGENT PURCHASE ORDER REQUISITION - ${companyInfo.name}
To: Orders / Sales Department (${supName})
From: ${companyInfo.salesPerson} (${companyInfo.email})
Delivery Address: ${companyInfo.address}, ${companyInfo.postalCode}

Dear ${supName} Team,

Please find below our automated stock replenishment purchase order requisition compiled from our inventory control system for ${companyInfo.name}.
Quantities are calculated via our Smart Replenishment engine based on a 30-day moving average of consumption and your verified delivery lead times.

ORDER ITEMS REQUIRED:
${itemListText}

TOTAL ESTIMATED REQUISITION: R ${totalCost.toLocaleString()}

Please confirm receipt of this purchase order, issue a pro-forma invoice, and confirm expected dispatch / delivery schedule to our Knysna property within 24 hours.

Kind regards,
${companyInfo.salesPerson}
Head of Procurement & Operations
${companyInfo.name}
Tel: ${companyInfo.telephone} | Web: ${companyInfo.webAddress}`;
  };

  const handleCopy = (supName: string, items: InventoryItem[]) => {
    const text = generateEmailBody(supName, items);
    navigator.clipboard.writeText(text);
    playLaserTagSound();
    setCopiedSupplier(supName);
    setTimeout(() => setCopiedSupplier(null), 3000);
  };

  const handleSendDraft = (supName: string, items: InventoryItem[]) => {
    const emailBody = generateEmailBody(supName, items);
    const mailtoUrl = `mailto:orders@supplier.co.za?subject=${encodeURIComponent(`Purchase Order Requisition - ${companyInfo.name}`)}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoUrl;

    playLaserTagSound();
    setSentSuccess(`Email draft opened for ${supName} with Smart Replenishment quantities!`);
    if (onConfirmOrderSent) {
      onConfirmOrderSent(items.map(i => i.id));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in no-print">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/30">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif-luxury font-bold text-lg">Automated Draft Purchase Order Generator</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-400 text-slate-950 flex items-center gap-1 shadow-xs">
                  <Sparkles className="w-3 h-3 text-slate-950" />
                  Smart Replenishment Active
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Calculates optimal reorder quantities based on 30-day moving averages and supplier lead times
              </p>
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
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-3.5 rounded-2xl flex items-center justify-between text-xs font-semibold animate-fade-in">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{sentSuccess}</span>
                  </div>
                  <button onClick={() => setSentSuccess(null)} className="text-emerald-700 hover:text-emerald-900">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Smart Replenishment Banner & Toggle */}
              <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 text-white p-4 rounded-2xl border border-emerald-700/60 shadow-md flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-emerald-300 flex items-center gap-1.5">
                      <span>Smart Replenishment Engine</span>
                      <span className="px-1.5 py-0.2 bg-emerald-500 text-slate-950 font-black text-[9px] rounded-full">30-DAY MOVING AVG</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Evaluates rolling 30-day consumption rate & supplier delivery lead time to avoid stockouts while minimizing holding costs.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setUseSmartReplenishment(true)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      useSmartReplenishment
                        ? 'bg-emerald-500 text-slate-950 shadow-sm'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Smart Optimal Qty
                  </button>
                  <button
                    onClick={() => setUseSmartReplenishment(false)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      !useSmartReplenishment
                        ? 'bg-slate-200 text-slate-900 shadow-sm'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Standard (2x Threshold)
                  </button>
                </div>
              </div>

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
                        {bySupplier[selectedSupplier].length} low-stock items included · Estimated Total: <strong className="text-emerald-700">R {totalEstimatedCost.toLocaleString()}</strong>
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

                  {/* Items Table with Smart Replenishment columns */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="px-3 py-2.5">Item Code</th>
                          <th className="px-3 py-2.5">Description</th>
                          <th className="px-3 py-2.5">On Hand</th>
                          <th className="px-3 py-2.5">Reorder Level</th>
                          <th className="px-3 py-2.5">30-Day Moving Avg</th>
                          <th className="px-3 py-2.5">Supplier Lead Time</th>
                          <th className="px-3 py-2.5 bg-emerald-50/70 text-emerald-900 font-extrabold">
                            <span className="flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-emerald-600" />
                              Suggested Order Qty
                            </span>
                          </th>
                          <th className="px-3 py-2.5">Unit Price</th>
                          <th className="px-3 py-2.5">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {bySupplier[selectedSupplier].map(item => {
                          const { dailyBurnRate, monthlyMovingAvg, leadTimeDays, suggestedQty, smartQty, standardQty } = getSmartReplenishment(item);
                          const subtotal = item.pricePerUnit * suggestedQty;

                          return (
                            <tr key={item.id} className="hover:bg-slate-50">
                              <td className="px-3 py-2.5 font-mono font-bold text-slate-700">{item.itemCode}</td>
                              <td className="px-3 py-2.5 font-semibold text-slate-900">{item.itemDescription}</td>
                              <td className="px-3 py-2.5 font-bold text-rose-600">{item.howManyOnHand} {item.unit}</td>
                              <td className="px-3 py-2.5 text-slate-500">{item.whenToReorder} {item.unit}</td>
                              <td className="px-3 py-2.5 text-slate-600">
                                <div><strong className="text-slate-800">{monthlyMovingAvg}</strong> {item.unit}/mo</div>
                                <div className="text-[10px] text-slate-400">({dailyBurnRate} {item.unit}/day)</div>
                              </td>
                              <td className="px-3 py-2.5 text-slate-700 font-medium">
                                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
                                  {leadTimeDays} days
                                </span>
                              </td>
                              <td className="px-3 py-2.5 bg-emerald-50/50 font-bold text-emerald-800">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-sm font-extrabold">{suggestedQty} {item.unit}</span>
                                  {useSmartReplenishment && (
                                    <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-mono font-bold">
                                      OPTIMAL
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-3 py-2.5 text-slate-700">R {item.pricePerUnit}</td>
                              <td className="px-3 py-2.5 font-bold text-slate-900 font-mono">R {subtotal.toLocaleString()}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Email Textarea Preview */}
                  <div className="space-y-1.5 pt-2">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                      <span>Formatted Email Body Preview:</span>
                      <span className="text-[10px] text-emerald-700 font-normal">Pre-filled with recipient address, item details, & suggested restock</span>
                    </label>
                    <textarea
                      readOnly
                      rows={9}
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
