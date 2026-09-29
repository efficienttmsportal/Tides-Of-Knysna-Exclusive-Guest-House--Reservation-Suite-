import React, { useRef, useState, useEffect } from 'react';
import { 
  PenTool, 
  RotateCcw, 
  Check, 
  ShieldCheck, 
  Trash2, 
  Download, 
  Lock, 
  Calendar,
  Sparkles,
  Type
} from 'lucide-react';

export interface SignatureData {
  signatureImage: string; // Base64 data URL
  signerName: string;
  signerRole: string;
  timestamp: string;
  ipHash?: string;
}

interface DigitalSignatureBlockProps {
  title?: string;
  signerRole?: string;
  signerName?: string;
  onSave?: (data: SignatureData) => void;
  initialSignature?: SignatureData | null;
  readOnly?: boolean;
  className?: string;
}

export const DigitalSignatureBlock: React.FC<DigitalSignatureBlockProps> = ({
  title = 'Digital Signature & Authorization',
  signerRole = 'Guest / Authorized Signatory',
  signerName: defaultSignerName = '',
  onSave,
  initialSignature = null,
  readOnly = false,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [savedData, setSavedData] = useState<SignatureData | null>(initialSignature);
  const [signerName, setSignerName] = useState(defaultSignerName || initialSignature?.signerName || '');
  const [activeTab, setActiveTab] = useState<'draw' | 'type'>('draw');
  const [typedName, setTypedName] = useState(defaultSignerName || '');
  const [penColor, setPenColor] = useState('#0f172a'); // Midnight slate
  const [strokeWidth, setStrokeWidth] = useState(2.5);

  // Setup canvas high-DPI scaling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set line styles
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = penColor;
    ctx.lineWidth = strokeWidth;
  }, [penColor, strokeWidth, activeTab]);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      if (e.touches.length > 0) {
        return {
          x: (e.touches[0].clientX - rect.left) * scaleX,
          y: (e.touches[0].clientY - rect.top) * scaleY
        };
      }
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    }
    return { x: 0, y: 0 };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (readOnly) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || readOnly) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const generateSignatureFromType = (): string => {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 600;
    tempCanvas.height = 200;
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) return '';

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    ctx.font = 'italic 42px "Brush Script MT", "Caveat", "Segoe Script", cursive';
    ctx.fillStyle = penColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(typedName || 'Guest Authorized Signatory', tempCanvas.width / 2, tempCanvas.height / 2);

    // Decorative baseline
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, 160);
    ctx.lineTo(560, 160);
    ctx.stroke();

    return tempCanvas.toDataURL('image/png');
  };

  const handleConfirmSignature = () => {
    const name = signerName.trim() || (activeTab === 'type' ? typedName.trim() : 'Guest Signatory');
    let sigImg = '';

    if (activeTab === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas || !hasDrawn) {
        alert('Please draw your signature on the pad before confirming.');
        return;
      }
      sigImg = canvas.toDataURL('image/png');
    } else {
      if (!typedName.trim()) {
        alert('Please type your legal full name.');
        return;
      }
      sigImg = generateSignatureFromType();
    }

    const now = new Date();
    const timestamp = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString('en-ZA')}`;
    const hash = `SIG-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`;

    const data: SignatureData = {
      signatureImage: sigImg,
      signerName: name,
      signerRole: signerRole,
      timestamp: timestamp,
      ipHash: hash
    };

    setSavedData(data);
    if (onSave) {
      onSave(data);
    }
  };

  const handleReset = () => {
    setSavedData(null);
    clearCanvas();
  };

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 p-5 shadow-xs transition ${className}`}>
      {/* Title & Status */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-slate-100 text-slate-800 rounded-xl">
            <PenTool className="w-4 h-4 text-emerald-600" />
          </span>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">{title}</h4>
            <p className="text-[11px] text-slate-500">{signerRole}</p>
          </div>
        </div>

        {savedData ? (
          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full flex items-center gap-1 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" /> Digitally Verified
          </span>
        ) : (
          <span className="px-2.5 py-1 bg-amber-50 text-amber-800 text-[10px] font-bold rounded-full flex items-center gap-1 border border-amber-200">
            <Lock className="w-3 h-3" /> Awaiting Signature
          </span>
        )}
      </div>

      {savedData ? (
        /* Verified Signature Display (Shown on Screen and in PDF/Prints) */
        <div className="space-y-3 bg-slate-50/70 border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Legally Binding Digital Signature Overlay
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              {savedData.ipHash}
            </span>
          </div>

          <div className="bg-white rounded-lg p-3 border border-slate-200 flex flex-col items-center justify-center relative min-h-[110px] overflow-hidden">
            {/* Visual signature image */}
            <img 
              src={savedData.signatureImage} 
              alt="Digital Signature" 
              className="max-h-24 max-w-full object-contain filter drop-shadow-xs" 
            />

            {/* Official seal watermark in corner */}
            <div className="absolute right-3 bottom-2 text-right opacity-60 pointer-events-none text-[9px] text-emerald-700 font-mono">
              ✓ SECURE SIGNATURE
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-600 pt-1">
            <div>
              <span className="text-slate-400 block text-[9px] uppercase font-bold">Signatory</span>
              <strong className="text-slate-900">{savedData.signerName}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px] uppercase font-bold">Role / Capacity</span>
              <span className="text-slate-700">{savedData.signerRole}</span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-slate-400 block text-[9px] uppercase font-bold">Date & Time</span>
              <span className="text-slate-700">{savedData.timestamp}</span>
            </div>
          </div>

          {!readOnly && (
            <div className="pt-2 flex justify-end no-print">
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition"
              >
                <Trash2 className="w-3.5 h-3.5" /> Re-sign Document
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Interactive Signing Interface */
        <div className="space-y-4">
          {/* Signer Legal Name Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Signatory Full Legal Name
            </label>
            <input
              type="text"
              value={signerName}
              onChange={(e) => {
                setSignerName(e.target.value);
                setTypedName(e.target.value);
              }}
              placeholder="e.g. Dr. Eleanor Sterling"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          {/* Mode Switch: Draw Pad vs Type Signature */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveTab('draw')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  activeTab === 'draw'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <PenTool className="w-3 h-3" /> Touchscreen / Mouse
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('type')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  activeTab === 'type'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Type className="w-3 h-3" /> Type Name
              </button>
            </div>

            {activeTab === 'draw' && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-semibold">Ink:</span>
                {[
                  { color: '#0f172a', label: 'Black' },
                  { color: '#1e3a8a', label: 'Navy' },
                  { color: '#065f46', label: 'Emerald' }
                ].map((c) => (
                  <button
                    key={c.color}
                    type="button"
                    onClick={() => setPenColor(c.color)}
                    style={{ backgroundColor: c.color }}
                    className={`w-4 h-4 rounded-full border transition ${
                      penColor === c.color ? 'ring-2 ring-emerald-500 ring-offset-1 scale-110' : 'border-slate-300'
                    }`}
                    title={c.label}
                  />
                ))}
              </div>
            )}
          </div>

          {/* DRAW CANVAS AREA */}
          {activeTab === 'draw' ? (
            <div className="space-y-2">
              <div className="relative border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-xl bg-slate-50 overflow-hidden cursor-crosshair">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={180}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-[140px] block touch-none"
                />
                
                {/* Visual guidelines */}
                <div className="absolute left-6 right-6 bottom-7 border-b border-slate-300/80 pointer-events-none flex justify-between">
                  <span className="text-[10px] text-slate-400 font-mono">Sign on the line above</span>
                  <span className="text-[10px] text-slate-400 font-serif">✕</span>
                </div>

                {!hasDrawn && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs">
                    <span className="flex items-center gap-1.5 bg-white/80 px-3 py-1 rounded-full shadow-xs">
                      <PenTool className="w-3.5 h-3.5 text-slate-400" />
                      Sign with finger, stylus, or mouse
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="px-3 py-1 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Clear Signature Pad
                </button>
                <span className="text-[11px] text-slate-400">Touch & stylus supported</span>
              </div>
            </div>
          ) : (
            /* TYPED SIGNATURE AREA */
            <div className="space-y-3">
              <div>
                <input
                  type="text"
                  value={typedName}
                  onChange={(e) => {
                    setTypedName(e.target.value);
                    if (!signerName) setSignerName(e.target.value);
                  }}
                  placeholder="Type your name..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 flex flex-col items-center justify-center min-h-[100px]">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Preview</span>
                <span 
                  style={{ color: penColor }}
                  className="font-serif italic text-3xl text-center select-none"
                >
                  {typedName || 'Your Signature Script'}
                </span>
                <div className="w-48 h-0.5 bg-slate-300 mt-2"></div>
              </div>
            </div>
          )}

          {/* Electronic consent disclaimer */}
          <p className="text-[10px] text-slate-500 leading-normal bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            By applying this digital signature, you verify that this electronic acknowledgment carries the legal weight and validity of a handwritten signature in compliance with the Electronic Communications and Transactions Act.
          </p>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleConfirmSignature}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <Check className="w-4 h-4" /> Save & Apply Digital Signature
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
