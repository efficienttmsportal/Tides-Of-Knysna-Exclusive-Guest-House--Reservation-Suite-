import React, { useState, useRef } from 'react';
import { 
  Save, 
  Printer, 
  FileText, 
  Mail, 
  Scan, 
  Upload, 
  Check, 
  Download, 
  Share2, 
  X, 
  CloudCheck, 
  Send,
  Eye,
  FileCheck,
  PenTool
} from 'lucide-react';
import { GUEST_HOUSE_INFO } from '../data/initialData';
import { DigitalSignatureBlock, SignatureData } from './DigitalSignatureBlock';

interface DocumentActionBarProps {
  documentTitle: string;
  documentNumber?: string;
  onSave?: () => void;
  onPrint?: () => void;
  onPdf?: () => void;
  onEmail?: (emailData: { to: string; subject: string; message: string }) => void;
  onUploadScan?: (file: File, type: string) => void;
  onSignatureSaved?: (sig: SignatureData) => void;
  recipientEmail?: string;
  className?: string;
  customExtraButtons?: React.ReactNode;
}

export const DocumentActionBar: React.FC<DocumentActionBarProps> = ({
  documentTitle,
  documentNumber,
  onSave,
  onPrint,
  onPdf,
  onEmail,
  onUploadScan,
  onSignatureSaved,
  recipientEmail = '',
  className = '',
  customExtraButtons
}) => {
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);
  const [savedSignature, setSavedSignature] = useState<SignatureData | null>(null);
  const [emailTo, setEmailTo] = useState(recipientEmail || GUEST_HOUSE_INFO.email);
  const [emailSubject, setEmailSubject] = useState(
    `${GUEST_HOUSE_INFO.name} - ${documentTitle} ${documentNumber ? `(${documentNumber})` : ''}`
  );
  const [emailMessage, setEmailMessage] = useState(
    `Dear Valued Guest / Partner,\n\nPlease find attached the official copy of your ${documentTitle} from ${GUEST_HOUSE_INFO.name}.\n\nIf you have any questions or require modifications, please contact our guest experience team at ${GUEST_HOUSE_INFO.telephone}.\n\nWarm regards,\nEleanor Sterling\nHead of Guest Experience\n${GUEST_HOUSE_INFO.name}`
  );
  const [emailSentToast, setEmailSentToast] = useState(false);

  // Scan / Upload state
  const [selectedDocType, setSelectedDocType] = useState('passport');
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; size: string; previewUrl?: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    if (onSave) onSave();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const handlePdf = () => {
    if (onPdf) {
      onPdf();
    } else {
      // Standard browser print-to-PDF flow
      window.print();
    }
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (onEmail) {
      onEmail({ to: emailTo, subject: emailSubject, message: emailMessage });
    }
    setShowEmailModal(false);
    setEmailSentToast(true);
    setTimeout(() => setEmailSentToast(false), 3500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const preview = URL.createObjectURL(file);
      setUploadedFiles(prev => [
        ...prev,
        {
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          previewUrl: preview
        }
      ]);
      if (onUploadScan) {
        onUploadScan(file, selectedDocType);
      }
    }
  };

  return (
    <div className={`no-print flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm ${className}`}>
      {/* Title & Document Badge */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
          <FileText className="w-4 h-4" />
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Document Actions</span>
          <span className="text-sm font-bold text-slate-900">{documentTitle} {documentNumber && <span className="text-emerald-700">#{documentNumber}</span>}</span>
        </div>
      </div>

      {/* Action Buttons Toolbar */}
      <div className="flex items-center gap-2 flex-wrap ml-auto">
        {/* SAVE */}
        <button
          id={`btn-save-${documentTitle.toLowerCase().replace(/\s+/g, '-')}`}
          onClick={handleSave}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition border shadow-sm ${
            saveSuccess
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
          }`}
          title="Save changes to document"
        >
          {saveSuccess ? <Check className="w-3.5 h-3.5 text-white" /> : <Save className="w-3.5 h-3.5 text-emerald-700" />}
          {saveSuccess ? 'Saved to Cloud' : 'Save'}
        </button>

        {/* PRINT */}
        <button
          id={`btn-print-${documentTitle.toLowerCase().replace(/\s+/g, '-')}`}
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200 hover:text-slate-900 transition shadow-sm"
          title="Print document on any printer"
        >
          <Printer className="w-3.5 h-3.5 text-slate-600" />
          Print
        </button>

        {/* PDF */}
        <button
          id={`btn-pdf-${documentTitle.toLowerCase().replace(/\s+/g, '-')}`}
          onClick={handlePdf}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition shadow-sm"
          title="Generate & download PDF for any PDF reader/writer"
        >
          <FileText className="w-3.5 h-3.5 text-red-600" />
          PDF
        </button>

        {/* EMAIL */}
        <button
          id={`btn-email-${documentTitle.toLowerCase().replace(/\s+/g, '-')}`}
          onClick={() => setShowEmailModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition shadow-sm"
          title="Email document copy directly to guest or supplier"
        >
          <Mail className="w-3.5 h-3.5 text-blue-600" />
          Email
        </button>

        {/* SCAN / UPLOAD */}
        <button
          id={`btn-scan-${documentTitle.toLowerCase().replace(/\s+/g, '-')}`}
          onClick={() => setShowScanModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition shadow-sm"
          title="Scan and upload Passports, IDs, and Proof of Payment"
        >
          <Scan className="w-3.5 h-3.5 text-purple-600" />
          Scan / Upload
        </button>

        {/* DIGITAL SIGN */}
        <button
          id={`btn-sign-${documentTitle.toLowerCase().replace(/\s+/g, '-')}`}
          onClick={() => setShowSignModal(true)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition border shadow-sm ${
            savedSignature 
              ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
              : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
          }`}
          title="Sign document via touchscreen or mouse"
        >
          <PenTool className="w-3.5 h-3.5 text-emerald-600" />
          {savedSignature ? 'Signed ✓' : 'Digital Sign'}
        </button>

        {customExtraButtons}
      </div>

      {/* EMAIL TOAST */}
      {emailSentToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-emerald-500/40 flex items-center gap-3 animate-fade-in">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Check className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-emerald-300">Email Dispatched Successfully</div>
            <div className="text-[11px] text-slate-300">Copy of {documentTitle} delivered to {emailTo}</div>
          </div>
        </div>
      )}

      {/* EMAIL MODAL */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative animate-scale-up">
            <button 
              onClick={() => setShowEmailModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Send {documentTitle} over Email</h3>
                <p className="text-xs text-slate-500">Official dispatch from {GUEST_HOUSE_INFO.name}</p>
              </div>
            </div>

            <form onSubmit={handleSendEmail} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Recipient Email Address</label>
                <input 
                  type="email"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  required
                  placeholder="e.g. guest@example.com"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Subject Line</label>
                <input 
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  required
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Message Body</label>
                <textarea 
                  rows={5}
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  required
                  className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                ></textarea>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Attached: <strong>{documentTitle} {documentNumber ? `#${documentNumber}` : ''}.pdf</strong> (Certified Watermarked Copy)
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1.5 shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send Document Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SCAN & UPLOAD MODAL */}
      {showScanModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative">
            <button 
              onClick={() => setShowScanModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <Scan className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Scan & Document Uploader</h3>
                <p className="text-xs text-slate-500">Attach passports, IDs, breakage deposits, and payment proofs</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Document Classification</label>
                <select 
                  value={selectedDocType}
                  onChange={(e) => setSelectedDocType(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="passport">Guest Passport Scan / Copy</option>
                  <option value="id_card">National Identity Card (RSA Smart ID / Driver's License)</option>
                  <option value="proof_of_payment">Proof of Payment (Bank EFT / Swift Slip)</option>
                  <option value="breakage_receipt">Breakage Deposit Acknowledgment / Proof</option>
                  <option value="other">Other Official Document</option>
                </select>
              </div>

              {/* Upload Dropzone */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-purple-200 hover:border-purple-400 bg-purple-50/50 rounded-xl p-6 text-center cursor-pointer transition"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange}
                  multiple 
                  accept="image/*,.pdf" 
                  className="hidden" 
                />
                <Upload className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <div className="text-xs font-bold text-slate-800">Click to Scan or Upload File</div>
                <div className="text-[11px] text-slate-500 mt-1">Supports PNG, JPG, PDF up to 25MB</div>
              </div>

              {/* Uploaded List */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-700">Uploaded Scans:</div>
                  <div className="max-h-40 overflow-y-auto space-y-1.5">
                    {uploadedFiles.map((f, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-xs border border-slate-200">
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          <span className="font-medium text-slate-800 truncate">{f.name}</span>
                          <span className="text-[10px] text-slate-400">({f.size})</span>
                        </div>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">Attached</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowScanModal(false)}
                  className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                >
                  Done & Attach
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DIGITAL SIGNATURE MODAL */}
      {showSignModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 relative animate-scale-up space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Digital Document Sign-Off</h3>
                <p className="text-xs text-slate-500">Apply touchscreen or mouse signature to {documentTitle}</p>
              </div>
              <button 
                onClick={() => setShowSignModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <DigitalSignatureBlock
              title={`Authorization Signature • ${documentTitle}`}
              signerRole="Authorized Signatory"
              onSave={(sig) => {
                setSavedSignature(sig);
                if (onSignatureSaved) onSignatureSaved(sig);
                setShowSignModal(false);
              }}
              initialSignature={savedSignature}
            />

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowSignModal(false)}
                className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
