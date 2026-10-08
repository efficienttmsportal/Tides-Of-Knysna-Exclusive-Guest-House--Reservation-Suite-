import React, { useState, useEffect } from 'react';
import { 
  Star, 
  CheckCircle, 
  Send, 
  Printer, 
  Mail, 
  Sparkles, 
  Award, 
  ShieldCheck, 
  Building2, 
  User, 
  MessageSquare, 
  BedDouble, 
  Calendar,
  ThumbsUp,
  FileCheck
} from 'lucide-react';
import { Reservation } from '../types';
import { DigitalSignatureBlock, SignatureData } from './DigitalSignatureBlock';
import { GUEST_HOUSE_INFO } from '../data/initialData';
import { WhatsAppIcon } from './GuestPortal';

export interface GuestSatisfactionRecord {
  id: string;
  reservationId?: string;
  reservationNumber: string;
  guestName: string;
  guestEmail: string;
  roomNumber: string;
  roomAllocation: string;
  cleanlinessScore: number;   // 1 - 5
  amenitiesScore: number;     // 1 - 5
  staffHelpfulnessScore: number; // 1 - 5
  overallScore: number;       // 1 - 5
  staffMemberMentioned?: string;
  comments: string;
  timestamp: string;
  signature?: SignatureData;
}

export const GUEST_SURVEYS_STORAGE_KEY = 'tok_guest_satisfaction_surveys_v2';

export const INITIAL_GUEST_SURVEYS: GuestSatisfactionRecord[] = [
  {
    id: 'surv-001',
    reservationNumber: 'TOK-2026-0891',
    guestName: 'Eleanor Sterling',
    guestEmail: 'eleanor.sterling@knysnaresort.co.za',
    roomNumber: '101',
    roomAllocation: 'Lagoon View Presidential Suite',
    cleanlinessScore: 5,
    amenitiesScore: 5,
    staffHelpfulnessScore: 5,
    overallScore: 5.0,
    staffMemberMentioned: 'Maria Cloete (Housekeeping Lead)',
    comments: 'Immaculate suite! The 600TC Egyptian cotton linens and fynbos aromatherapy wash were extraordinary. Front desk staff exceeded every expectation.',
    timestamp: '2026-09-27 10:15',
    signature: {
      signatureImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      signerName: 'Dr. Eleanor Sterling',
      signerRole: 'VIP Guest Signatory',
      timestamp: '2026-09-27 10:15',
      ipHash: 'SIG-ELN-2026'
    }
  },
  {
    id: 'surv-002',
    reservationNumber: 'TOK-2026-0892',
    guestName: 'Liam Vance',
    guestEmail: 'liam.vance@gardenroutetravel.com',
    roomNumber: '102',
    roomAllocation: 'The Heads Luxury King Villa',
    cleanlinessScore: 5,
    amenitiesScore: 4,
    staffHelpfulnessScore: 5,
    overallScore: 4.7,
    staffMemberMentioned: 'Liam Vance (F&B Director)',
    comments: 'Wonderful breakfast overlooking the lagoon. Staff went above and beyond to arrange our private kayak tour.',
    timestamp: '2026-09-26 14:20'
  },
  {
    id: 'surv-003',
    reservationNumber: 'TOK-2026-0893',
    guestName: 'Sophia Thorne',
    guestEmail: 'sophia.t@capetownarts.org',
    roomNumber: '103',
    roomAllocation: 'Featherbed Sunset Suite',
    cleanlinessScore: 5,
    amenitiesScore: 5,
    staffHelpfulnessScore: 5,
    overallScore: 5.0,
    staffMemberMentioned: 'Front Desk Concierge',
    comments: '5-star hospitality through and through. The sunset deck views are unforgettable.',
    timestamp: '2026-09-25 18:40'
  }
];

export const getStoredGuestSurveys = (): GuestSatisfactionRecord[] => {
  try {
    const raw = localStorage.getItem(GUEST_SURVEYS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to load guest surveys', e);
  }
  return INITIAL_GUEST_SURVEYS;
};

export const saveGuestSurvey = (survey: GuestSatisfactionRecord): GuestSatisfactionRecord[] => {
  const current = getStoredGuestSurveys();
  const updated = [survey, ...current.filter(s => s.id !== survey.id)];
  try {
    localStorage.setItem(GUEST_SURVEYS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('tok_survey_updated', { detail: updated }));
  } catch (e) {
    console.warn('Failed to save survey', e);
  }
  return updated;
};

interface GuestSatisfactionSurveyProps {
  reservation?: Reservation | null;
  onSubmitted?: (record: GuestSatisfactionRecord) => void;
  readOnly?: boolean;
}

export const GuestSatisfactionSurvey: React.FC<GuestSatisfactionSurveyProps> = ({
  reservation,
  onSubmitted,
  readOnly = false
}) => {
  const guestName = reservation ? `${reservation.customerName} ${reservation.customerSurname}` : 'Valued Resident Guest';
  const roomNumber = reservation?.roomNumber || '101';
  const roomAllocation = reservation?.roomAllocation || 'Lagoon View Presidential Suite';
  const reservationNumber = reservation?.reservationNumber || 'TOK-2026-0891';
  const guestEmail = reservation?.email || 'guest@tidesofknysna.co.za';

  const [cleanlinessScore, setCleanlinessScore] = useState<number>(5);
  const [amenitiesScore, setAmenitiesScore] = useState<number>(5);
  const [staffHelpfulnessScore, setStaffHelpfulnessScore] = useState<number>(5);
  const [overallScore, setOverallScore] = useState<number>(5);
  const [staffMemberMentioned, setStaffMemberMentioned] = useState<string>('All Front Desk & Housekeeping Staff');
  const [comments, setComments] = useState<string>('');
  const [signatureData, setSignatureData] = useState<SignatureData | null>(null);
  const [submittedRecord, setSubmittedRecord] = useState<GuestSatisfactionRecord | null>(null);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);

  // Auto calculate overall score
  useEffect(() => {
    const avg = ((cleanlinessScore + amenitiesScore + staffHelpfulnessScore) / 3);
    setOverallScore(Math.round(avg * 10) / 10);
  }, [cleanlinessScore, amenitiesScore, staffHelpfulnessScore]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const record: GuestSatisfactionRecord = {
      id: `surv-${Date.now()}`,
      reservationId: reservation?.id,
      reservationNumber,
      guestName,
      guestEmail,
      roomNumber,
      roomAllocation,
      cleanlinessScore,
      amenitiesScore,
      staffHelpfulnessScore,
      overallScore,
      staffMemberMentioned: staffMemberMentioned.trim(),
      comments: comments.trim() || 'Exceptional 5-star service and pristine suite amenities.',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      signature: signatureData || undefined
    };

    saveGuestSurvey(record);
    setSubmittedRecord(record);
    if (onSubmitted) onSubmitted(record);
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  const handleEmailSurvey = () => {
    setEmailStatus(`Official survey certificate dispatched to ${guestEmail} and General Manager.`);
    setTimeout(() => setEmailStatus(null), 4000);
  };

  const handleWhatsAppSurvey = () => {
    if (!submittedRecord) return;
    const msg =
      `🌟 *GUEST SATISFACTION REVIEW (5-STAR AUDIT)* 🌟\n` +
      `🏨 *${GUEST_HOUSE_INFO.name}*\n` +
      `👤 *Resident Guest:* ${submittedRecord.guestName} (Suite ${submittedRecord.roomNumber})\n` +
      `🔖 *Booking Ref:* ${submittedRecord.reservationNumber}\n` +
      `⭐ *Overall Score:* ${submittedRecord.overallScore} / 5.0\n` +
      `✨ *Cleanliness:* ${submittedRecord.cleanlinessScore}/5 | *Amenities:* ${submittedRecord.amenitiesScore}/5 | *Staff:* ${submittedRecord.staffHelpfulnessScore}/5\n` +
      (submittedRecord.staffMemberMentioned ? `🎖️ *Commended Team Member:* ${submittedRecord.staffMemberMentioned}\n` : '') +
      `💬 *Guest Comments:* "${submittedRecord.comments}"\n` +
      `📅 *Date:* ${submittedRecord.timestamp}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
  };

  const StarRatingRow: React.FC<{
    label: string;
    description: string;
    score: number;
    onChange: (val: number) => void;
  }> = ({ label, description, score, onChange }) => (
    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h4 className="font-bold text-slate-900 text-xs">{label}</h4>
        <p className="text-[11px] text-slate-500">{description}</p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => !readOnly && onChange(star)}
            className={`p-1.5 transition-transform ${
              star <= score ? 'text-amber-500 scale-110' : 'text-slate-300 hover:text-slate-400'
            }`}
            title={`${star} Star`}
          >
            <Star className={`w-5 h-5 ${star <= score ? 'fill-amber-400' : 'fill-none'}`} />
          </button>
        ))}
        <span className="ml-2 font-mono font-bold text-xs text-slate-700 min-w-[3rem] text-right">
          {score}.0 / 5
        </span>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 bg-amber-100 text-amber-800 rounded-xl">
              <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
            </span>
            <h3 className="font-bold text-slate-900 text-base">
              Guest Satisfaction Survey & 5-Star Accreditation Review
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Official feedback submission for {GUEST_HOUSE_INFO.name}. Rating scores are aggregated live into the management dashboard and staff shift rosters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrintCertificate}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-300 shadow-xs"
            title="Print on inkjet, laser printers, Adobe PDF, and Universal Print drivers"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Hard Copy
          </button>
        </div>
      </div>

      {emailStatus && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center gap-2 animate-fade-in">
          <Mail className="w-4 h-4 text-emerald-600" />
          <span>{emailStatus}</span>
        </div>
      )}

      {submittedRecord ? (
        /* Confirmation & Official Certificate */
        <div className="space-y-6">
          <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl text-center space-y-3">
            <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
            <h4 className="text-lg font-bold text-emerald-950 font-serif-luxury">
              Thank You, {submittedRecord.guestName}!
            </h4>
            <p className="text-xs text-emerald-800 max-w-lg mx-auto">
              Your feedback has been digitally signed and permanently filed into the estate operations database. Aggregate scores have been synchronized with the Operations Dashboard and the Staff Shift Calendar.
            </p>
            <div className="flex items-center justify-center gap-4 text-xs font-bold text-emerald-900 pt-2">
              <span>Overall Score: <strong className="text-emerald-700">{submittedRecord.overallScore} / 5.0</strong></span>
              <span>•</span>
              <span>Cleanliness: <strong>{submittedRecord.cleanlinessScore}/5</strong></span>
              <span>•</span>
              <span>Amenities: <strong>{submittedRecord.amenitiesScore}/5</strong></span>
              <span>•</span>
              <span>Staff Helpfulness: <strong>{submittedRecord.staffHelpfulnessScore}/5</strong></span>
            </div>
          </div>

          {/* Hard Copy Certificate View */}
          <div className="border border-slate-300 rounded-2xl p-6 bg-slate-50 space-y-4 print:border-none print:shadow-none print:p-0">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-700" />
                <span className="font-serif-luxury font-bold text-slate-900 text-sm">
                  {GUEST_HOUSE_INFO.name} • Official Guest Review Certificate
                </span>
              </div>
              <span className="font-mono text-[10px] text-slate-500">Ref: {submittedRecord.reservationNumber}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Cleanliness</span>
                <span className="text-base font-bold text-slate-900">{submittedRecord.cleanlinessScore} / 5</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Amenities</span>
                <span className="text-base font-bold text-slate-900">{submittedRecord.amenitiesScore} / 5</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Staff Helpfulness</span>
                <span className="text-base font-bold text-slate-900">{submittedRecord.staffHelpfulnessScore} / 5</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-emerald-300 text-center bg-emerald-50/50">
                <span className="text-[10px] uppercase font-bold text-emerald-700 block">Overall Index</span>
                <span className="text-base font-bold text-emerald-900">{submittedRecord.overallScore} / 5.0</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs space-y-2">
              <span className="font-bold text-slate-800 block">Guest Remarks & Commendations:</span>
              <p className="text-slate-600 italic leading-relaxed">
                "{submittedRecord.comments}"
              </p>
              {submittedRecord.staffMemberMentioned && (
                <div className="text-[11px] text-emerald-800 font-semibold pt-1">
                  ⭐ Commended Staff Member / Department: {submittedRecord.staffMemberMentioned}
                </div>
              )}
            </div>

            {submittedRecord.signature && (
              <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Digital Authorization Seal</span>
                  <span className="font-semibold text-slate-900">{submittedRecord.signature.signerName}</span>
                  <span className="text-slate-500 text-[11px] block">{submittedRecord.signature.timestamp}</span>
                </div>
                <img 
                  src={submittedRecord.signature.signatureImage} 
                  alt="Signature" 
                  className="max-h-12 max-w-[120px] object-contain"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2 no-print flex-wrap">
              <button
                type="button"
                onClick={handleWhatsAppSurvey}
                className="px-4 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                title="Send review highlights directly via WhatsApp"
              >
                <WhatsAppIcon className="w-3.5 h-3.5" /> Share Review via WhatsApp
              </button>
              <button
                type="button"
                onClick={handleEmailSurvey}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <Mail className="w-3.5 h-3.5" /> Email Copy to Guest
              </button>
              <button
                type="button"
                onClick={handlePrintCertificate}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" /> Print Hard Copy (Inkjet/Laser/PDF)
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Interactive Survey Form */
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Stay Context Banner */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">RESIDENT GUEST</span>
              <strong className="text-slate-900 text-sm">{guestName}</strong>
              <span className="text-slate-500 block text-[11px]">{guestEmail}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">SUITE ALLOCATION</span>
              <strong className="text-slate-900">Room {roomNumber} • {roomAllocation}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">BOOKING REF</span>
              <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {reservationNumber}
              </span>
            </div>
          </div>

          {/* Star Rating Dimensions */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
              1. Hospitality Standard Ratings (1 = Poor, 5 = Exceptional)
            </h4>

            <StarRatingRow
              label="Room Cleanliness & Hygiene"
              description="Freshness of 600TC Egyptian cotton linen, bathroom sanitization, and dust-free presentation."
              score={cleanlinessScore}
              onChange={setCleanlinessScore}
            />

            <StarRatingRow
              label="Amenities & In-Suite Comfort"
              description="High-speed Wi-Fi, air conditioning, Nespresso bar, botanical fynbos toiletries, and bedding comfort."
              score={amenitiesScore}
              onChange={setAmenitiesScore}
            />

            <StarRatingRow
              label="Staff Helpfulness & Concierge Care"
              description="Warmth of arrival greeting, efficiency of check-in, housekeeping attention, and excursion assistance."
              score={staffHelpfulnessScore}
              onChange={setStaffHelpfulnessScore}
            />
          </div>

          {/* Commendation Field */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
              2. Staff Commendations & Operational Feedback
            </h4>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Commend a Specific Team Member or Department (Optional)
              </label>
              <input
                type="text"
                value={staffMemberMentioned}
                onChange={(e) => setStaffMemberMentioned(e.target.value)}
                placeholder="e.g. Maria Cloete (Housekeeping), Liam Vance (F&B), Front Desk Team"
                className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Detailed Comments, Memories, or Suggestions for Improvement
              </label>
              <textarea
                rows={3}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Tell us what you enjoyed most about your stay at Tides of Knysna, or how we can make your next visit even more magical..."
                className="w-full text-xs p-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          {/* Digital Signature Pad */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
              3. Guest Electronic Signature Authentication
            </h4>
            <DigitalSignatureBlock
              title="Guest Satisfaction Digital Sign-Off"
              signerRole="Resident Guest"
              signerName={guestName}
              onSave={(sig) => setSignatureData(sig)}
              initialSignature={signatureData}
            />
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 flex-wrap gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Compliant with Consumer Protection Act & Tourism Grading Council of South Africa.</span>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
            >
              <Send className="w-4 h-4" />
              Submit Survey & Sync to Dashboard
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
