import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  KeyRound, 
  BedDouble, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  CheckCircle, 
  Sparkles, 
  MapPin, 
  Phone, 
  Mail, 
  Compass, 
  Send, 
  Wifi, 
  Key, 
  AlertCircle, 
  LogOut, 
  Utensils, 
  Search, 
  ExternalLink, 
  Printer, 
  Copy, 
  Check, 
  Wine, 
  Car, 
  FileText, 
  Info,
  ChevronRight,
  BookmarkPlus,
  Smartphone,
  Wrench,
  Star,
  Trash2,
  Lock,
  Radio,
  Scan,
  Upload,
  Shield,
  Award,
  Share2,
  Tag,
  AlertTriangle,
  Plus,
  Edit,
  Eye,
  RefreshCw,
  FileCheck,
  FolderOpen,
  Download
} from 'lucide-react';
import { Reservation, AttractionItem, MarketingSpecial } from '../types';
import { ATTRACTIONS_DIRECTORY, GUEST_HOUSE_INFO, INITIAL_SPECIALS } from '../data/initialData';
import { CompanyInfoData } from './CompanyInfoModule';
import { DigitalRoomAccess } from './DigitalRoomAccess';
import { DigitalSignatureBlock } from './DigitalSignatureBlock';
import { GuestSatisfactionSurvey } from './GuestSatisfactionSurvey';
import { GuestFolderModule, UploadedPolicyDocument } from './GuestFolderModule';

export const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.711 1.456h.005c6.554 0 11.89-5.336 11.893-11.893a11.82 11.82 0 00-3.48-8.413z"/>
  </svg>
);

export interface EstatePolicyItem {
  id: string;
  title: string;
  category: 'Check-In/Out' | 'Quiet Hours' | 'Safety' | 'Non-Smoking' | 'Deposit' | 'General';
  content: string;
  strictness: 'Mandatory' | 'Standard' | 'Information';
}

export const DEFAULT_ESTATE_POLICIES: EstatePolicyItem[] = [
  {
    id: 'pol-1',
    title: 'Check-In & Check-Out Protocol',
    category: 'Check-In/Out',
    content: 'Check-In is from 14:00 to 20:00. Check-Out is strictly by 10:30 to enable exhaustive multi-stage sanitization. Late check-out is subject to prior authorization and R350/hr fee.',
    strictness: 'Mandatory'
  },
  {
    id: 'pol-2',
    title: 'Lagoon Sanctuary & Quiet Hours',
    category: 'Quiet Hours',
    content: 'Quiet hours are observed strictly between 22:00 and 07:00. Knysna Lagoon is a designated Ramsar environmental sanctuary. Loud music, parties, and disturbance are strictly prohibited.',
    strictness: 'Mandatory'
  },
  {
    id: 'pol-3',
    title: 'Strictly 100% Non-Smoking Establishment',
    category: 'Non-Smoking',
    content: 'All interior suites, balconies, bathrooms, and corridors are strictly 100% non-smoking (including e-cigarettes and vaping). Designated garden gazebos are provided. A R2,500 ionization cleaning fee is charged for breaches.',
    strictness: 'Mandatory'
  },
  {
    id: 'pol-4',
    title: 'Swimming Pool & Kayak Safety Protocols',
    category: 'Safety',
    content: 'The plunge pools are open from 07:00 to 21:00. No glassware is permitted within 3 meters of pool decks. Certified lifejackets must be worn at all times when operating estate lagoon kayaks.',
    strictness: 'Standard'
  },
  {
    id: 'pol-5',
    title: 'Breakage Deposit & Pre-Authorization Audit',
    category: 'Deposit',
    content: 'A refundable breakage deposit of R1,500 is pre-authorized on arrival. Deposits are audited and released within 48 hours following room departure inspection.',
    strictness: 'Mandatory'
  },
  {
    id: 'pol-6',
    title: 'Valuables & Digital Electronic Safes',
    category: 'General',
    content: 'Digital laptop safes are provided in each suite wardrobe. Management and staff accept no liability for cash, jewellery, or electronics left unattended outside the safe.',
    strictness: 'Information'
  }
];

interface GuestPortalProps {
  reservations: Reservation[];
  onUpdateReservations: (updated: Reservation[]) => void;
  companyInfo?: CompanyInfoData;
  initialBookingRef?: string;
  initialSurname?: string;
}

export const GuestPortal: React.FC<GuestPortalProps> = ({
  reservations,
  onUpdateReservations,
  companyInfo,
  initialBookingRef = '',
  initialSurname = ''
}) => {
  // Login form state
  const [bookingRefInput, setBookingRefInput] = useState(initialBookingRef);
  const [surnameInput, setSurnameInput] = useState(initialSurname);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Authenticated reservation state
  const [activeReservationId, setActiveReservationId] = useState<string | null>(() => {
    if (initialBookingRef && initialSurname) {
      const match = reservations.find(r => 
        r.reservationNumber.trim().toUpperCase() === initialBookingRef.trim().toUpperCase() &&
        r.customerSurname.trim().toLowerCase() === initialSurname.trim().toLowerCase()
      );
      return match ? match.id : null;
    }
    return null;
  });

  // UI state inside portal
  const [activePortalTab, setActivePortalTab] = useState<
    'digitalkey' | 'stay' | 'survey' | 'specials' | 'policies' | 'requests' | 'recommendations' | 'concierge' | 'guestfolder'
  >('digitalkey');
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [portalAdminNotice, setPortalAdminNotice] = useState<string | null>(null);
  const [copiedWifi, setCopiedWifi] = useState(false);
  const [copiedPin, setCopiedPin] = useState(false);

  // Uploaded Official Policy Documents (Synchronized with Admin Portal)
  const [uploadedPolicies, setUploadedPolicies] = useState<UploadedPolicyDocument[]>(() => {
    try {
      const saved = localStorage.getItem('tok_uploaded_policy_docs_v2');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load uploaded policies in guest portal', e);
    }
    return [
      {
        id: 'up-pol-1',
        title: 'TGCSA 5-Star Graded Guest Estate Bylaws & Code of Conduct',
        category: 'Estate Bylaws',
        strictness: 'Mandatory',
        fileName: 'Tides_of_Knysna_Official_Bylaws_2026.pdf',
        fileSize: '412 KB',
        fileType: 'application/pdf',
        uploadedAt: '2026-09-15 09:30',
        uploadedBy: 'Admin',
        notes: 'Official Tourism Grading Council South Africa luxury estate compliance documentation.'
      },
      {
        id: 'up-pol-2',
        title: 'Knysna Ramsar Environmental Lagoon Protection Protocol',
        category: 'Environmental Sanctuary',
        strictness: 'Mandatory',
        fileName: 'Knysna_Lagoon_Sanctuary_Quiet_Hours_Gazette.pdf',
        fileSize: '284 KB',
        fileType: 'application/pdf',
        uploadedAt: '2026-09-18 14:10',
        uploadedBy: 'Admin',
        notes: 'Mandatory silence hours (22:00 - 07:00) and marine sanctuary protection guidelines.'
      },
      {
        id: 'up-pol-3',
        title: 'Water Safety, Heated Plunge Pool & Kayak Indemnity Protocol',
        category: 'Safety & Indemnity',
        strictness: 'Standard',
        fileName: 'Kayak_and_Pool_Safety_Guidelines.pdf',
        fileSize: '198 KB',
        fileType: 'application/pdf',
        uploadedAt: '2026-09-22 11:45',
        uploadedBy: 'Admin',
        notes: 'Certified lifejacket requirements and complimentary kayak navigation zone map.'
      }
    ];
  });
  const [guestPolicyUploadTitle, setGuestPolicyUploadTitle] = useState('');
  const [guestPolicyCategory, setGuestPolicyCategory] = useState('Guest Signed Agreement');
  const [isGuestUploadingPolicy, setIsGuestUploadingPolicy] = useState(false);

  // Estate Policies State (Loaded & Editable by Admin)
  const [policies, setPolicies] = useState<EstatePolicyItem[]>(() => {
    try {
      const saved = localStorage.getItem('tok_estate_policies_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load estate policies', e);
    }
    return DEFAULT_ESTATE_POLICIES;
  });

  // Marketing Specials State (Visible to Resident Guests)
  const [specials, setSpecials] = useState<MarketingSpecial[]>(() => {
    try {
      const saved = localStorage.getItem('tok_marketing_specials_v2');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load specials in portal', e);
    }
    return INITIAL_SPECIALS;
  });

  // Sync specials when marketing updates
  useEffect(() => {
    const handleSpecialsUpdate = (e: any) => {
      if (e.detail) {
        setSpecials(e.detail);
      } else {
        try {
          const saved = localStorage.getItem('tok_marketing_specials_v2');
          if (saved) setSpecials(JSON.parse(saved));
        } catch (err) {}
      }
    };
    window.addEventListener('tok_specials_updated', handleSpecialsUpdate);
    return () => window.removeEventListener('tok_specials_updated', handleSpecialsUpdate);
  }, []);

  // Save policies helper
  const handleSavePolicies = (updated: EstatePolicyItem[]) => {
    setPolicies(updated);
    try {
      localStorage.setItem('tok_estate_policies_v1', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save policies', e);
    }
  };

  const handleGuestPolicyUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsGuestUploadingPolicy(true);
    const reader = new FileReader();
    reader.onload = () => {
      const newPolicy: UploadedPolicyDocument = {
        id: `up-pol-${Date.now()}`,
        title: guestPolicyUploadTitle.trim() || file.name.replace(/\.[^/.]+$/, ""),
        category: guestPolicyCategory,
        strictness: 'Mandatory',
        fileName: file.name,
        fileSize: `${Math.round(file.size / 1024)} KB`,
        fileType: file.type || 'application/octet-stream',
        uploadedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        uploadedBy: 'Guest',
        dataUrl: reader.result as string,
        notes: `Uploaded by Guest (${currentReservation?.customerName || ''} ${currentReservation?.customerSurname || ''}) via Resident Portal.`
      };

      const updated = [newPolicy, ...uploadedPolicies];
      setUploadedPolicies(updated);
      try {
        localStorage.setItem('tok_uploaded_policy_docs_v2', JSON.stringify(updated));
      } catch (err) {}
      setIsGuestUploadingPolicy(false);
      setGuestPolicyUploadTitle('');
      setPortalAdminNotice(`✓ Successfully uploaded document: "${newPolicy.title}"`);
      setTimeout(() => setPortalAdminNotice(null), 4000);
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadPolicy = (policy: UploadedPolicyDocument) => {
    if (policy.dataUrl) {
      const a = document.createElement('a');
      a.href = policy.dataUrl;
      a.download = policy.fileName;
      a.click();
    } else {
      const text = `TIDES OF KNYSNA - ESTATE POLICY\n\nTitle: ${policy.title}\nCategory: ${policy.category}\nStrictness: ${policy.strictness}\nUploaded: ${policy.uploadedAt}\n\nAll guests and visitors are requested to abide by these guidelines.`;
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = policy.fileName.endsWith('.txt') ? policy.fileName : `${policy.fileName}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
    setPortalAdminNotice(`Downloaded: ${policy.title}`);
    setTimeout(() => setPortalAdminNotice(null), 3000);
  };

  // Estate Broadcast Banner (Managed by Admin)
  const [broadcastNotice, setBroadcastNotice] = useState<string>(() => {
    return localStorage.getItem('tok_portal_admin_broadcast_v1') || 
      '🌅 Welcome to Tides of Knysna. Sunset lagoon catamaran cruise departs daily at 17:30 from the private jetty. Inquire with reception.';
  });

  // Email Stay Pass & Scan ID Modals
  const [isEmailPassModalOpen, setIsEmailPassModalOpen] = useState(false);
  const [emailToInput, setEmailToInput] = useState('');
  const [emailPassSentSuccess, setEmailPassSentSuccess] = useState(false);

  // WhatsApp Stay Pass & Interactive FAB Modals
  const [isWhatsAppPassModalOpen, setIsWhatsAppPassModalOpen] = useState(false);
  const [whatsAppRecipientPhone, setWhatsAppRecipientPhone] = useState('');
  const [isWhatsAppFabOpen, setIsWhatsAppFabOpen] = useState(false);
  const [whatsAppNotice, setWhatsAppNotice] = useState<string | null>(null);

  const [isScanIdModalOpen, setIsScanIdModalOpen] = useState(false);
  const [uploadedIdDoc, setUploadedIdDoc] = useState<{ name: string; url: string; docType: string } | null>(null);
  const [idScanVerified, setIdScanVerified] = useState(false);
  const idFileInputRef = useRef<HTMLInputElement>(null);

  // Admin Modal Sub-Tab State
  const [adminModalTab, setAdminModalTab] = useState<'housekeeping' | 'policies' | 'broadcast'>('housekeeping');
  const [newPolicyTitle, setNewPolicyTitle] = useState('');
  const [newPolicyCategory, setNewPolicyCategory] = useState<EstatePolicyItem['category']>('General');
  const [newPolicyContent, setNewPolicyContent] = useState('');
  const [newPolicyStrictness, setNewPolicyStrictness] = useState<EstatePolicyItem['strictness']>('Standard');
  const [adminBroadcastInput, setAdminBroadcastInput] = useState(broadcastNotice);
  const [specialClaimSuccess, setSpecialClaimSuccess] = useState<string | null>(null);

  // Special request submission form state
  const [newRequestType, setNewRequestType] = useState('Champagne & Refreshments');
  const [newRequestDetails, setNewRequestDetails] = useState('');
  const [requestSubmittedSuccess, setRequestSubmittedSuccess] = useState(false);

  // Local attractions directory filtering
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookingRequestSent, setBookingRequestSent] = useState<string | null>(null);

  // Find currently authenticated reservation
  const currentReservation = useMemo(() => {
    return reservations.find(r => r.id === activeReservationId) || null;
  }, [reservations, activeReservationId]);

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const ref = bookingRefInput.trim().toUpperCase();
    const surname = surnameInput.trim().toLowerCase();

    if (!ref || !surname) {
      setLoginError('Please provide both your Booking Reference and Surname.');
      return;
    }

    const matched = reservations.find(r => 
      r.reservationNumber.trim().toUpperCase() === ref &&
      r.customerSurname.trim().toLowerCase() === surname
    );

    if (matched) {
      setActiveReservationId(matched.id);
      setLoginError(null);
    } else {
      setLoginError('No matching reservation found. Please double-check your booking reference (e.g. TOK-2026-0891) and surname.');
    }
  };

  // Quick Demo Login Handler
  const handleQuickDemoLogin = (res: Reservation) => {
    setBookingRefInput(res.reservationNumber);
    setSurnameInput(res.customerSurname);
    setActiveReservationId(res.id);
    setLoginError(null);
  };

  const handleLogout = () => {
    setActiveReservationId(null);
    setBookingRefInput('');
    setSurnameInput('');
  };

  // Copy helpers
  const handleCopyWifi = () => {
    navigator.clipboard.writeText('TidesExclusive_Guest5G | Pass: LagoonView2026!');
    setCopiedWifi(true);
    setTimeout(() => setCopiedWifi(false), 2000);
  };

  const handleCopyPin = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 2000);
  };

  // Handle Special Request Submission
  const handleSubmitSpecialRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentReservation || !newRequestDetails.trim()) return;

    const formattedRequest = `[${newRequestType}] ${newRequestDetails.trim()}`;
    const updatedSpecialRequests = currentReservation.specialRequests 
      ? `${currentReservation.specialRequests} \n• ${formattedRequest}`
      : `• ${formattedRequest}`;

    const updatedList = reservations.map(r => 
      r.id === currentReservation.id 
        ? { ...r, specialRequests: updatedSpecialRequests }
        : r
    );

    onUpdateReservations(updatedList);
    setNewRequestDetails('');
    setRequestSubmittedSuccess(true);
    setTimeout(() => setRequestSubmittedSuccess(false), 4000);
  };

  // Handle Concierge Excursion Booking
  const handleRequestExcursion = (attraction: AttractionItem) => {
    if (!currentReservation) return;

    const conciergeNote = `Guest requested concierge arrangement for: ${attraction.name} (${attraction.category}, ${attraction.distanceFromGuestHouse})`;
    const updatedSpecialRequests = currentReservation.specialRequests 
      ? `${currentReservation.specialRequests} \n• [Concierge Booking]: ${attraction.name} (${attraction.contactNumber})`
      : `• [Concierge Booking]: ${attraction.name} (${attraction.contactNumber})`;

    const updatedInterests = currentReservation.nearbySightseeingInterests.includes(attraction.name)
      ? currentReservation.nearbySightseeingInterests
      : [...currentReservation.nearbySightseeingInterests, attraction.name];

    const updatedList = reservations.map(r => 
      r.id === currentReservation.id 
        ? { 
            ...r, 
            specialRequests: updatedSpecialRequests,
            nearbySightseeingInterests: updatedInterests,
            notes: r.notes ? `${r.notes}\n${conciergeNote}` : conciergeNote
          }
        : r
    );

    onUpdateReservations(updatedList);
    setBookingRequestSent(attraction.id);
    setTimeout(() => setBookingRequestSent(null), 3500);
  };

  // WhatsApp Concierge Helpers
  const dutyManagerPhone = companyInfo?.mobile || GUEST_HOUSE_INFO.mobile;
  const cleanManagerPhone = dutyManagerPhone.replace(/[^0-9]/g, '');

  const getStayPassWhatsAppText = (res: Reservation) => {
    return (
      `✨ *TIDES OF KNYSNA - GUEST STAY PASS* ✨\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `👤 *Guest Name:* ${res.customerName} ${res.customerSurname}\n` +
      `🔖 *Booking Reference:* ${res.reservationNumber}\n` +
      `🏨 *Suite Allocation:* Room ${res.roomNumber} (${res.roomAllocation})\n` +
      `📅 *Dates:* ${res.checkInDate} ➔ ${res.checkOutDate} (${res.totalNights} Nights)\n` +
      `👥 *Guests:* ${res.numberOfGuests}\n` +
      `🔑 *Suite Keypad PIN:* *${res.roomNumber}${res.customerSurname.length}7#\n` +
      `📶 *Wi-Fi Network:* TidesExclusive_Guest5G\n` +
      `🔐 *Wi-Fi Password:* LagoonView2026!\n` +
      `⏰ *Check-In:* 14:00 - 20:00 | *Check-Out:* 10:30\n` +
      `📍 *Address:* 14 Waterfront Promenade, Knysna Lagoon Vista\n` +
      `📞 *24/7 Duty Manager (Eleanor):* ${dutyManagerPhone}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `_Tides of Knysna - Where Elegance Meets Adventures ★★★★★_`
    );
  };

  const handleOpenWhatsAppStayPass = (targetPhone?: string) => {
    if (!currentReservation) return;
    const text = getStayPassWhatsAppText(currentReservation);
    const phone = (targetPhone || currentReservation.contactNumber || dutyManagerPhone).replace(/[^0-9]/g, '');
    const url = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(text)}` : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleChatWithManagerWhatsApp = (customTopic?: string) => {
    if (!currentReservation) {
      const text = `Hello Eleanor, I am a guest contacting Tides of Knysna Concierge regarding my booking verification.`;
      window.open(`https://wa.me/${cleanManagerPhone}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
      return;
    }
    const intro = `Hello Eleanor, contacting you from Suite ${currentReservation.roomNumber} (${currentReservation.customerName} ${currentReservation.customerSurname}, Ref: ${currentReservation.reservationNumber}).`;
    const fullText = customTopic ? `${intro}\n\n${customTopic}` : intro;
    window.open(`https://wa.me/${cleanManagerPhone}?text=${encodeURIComponent(fullText)}`, '_blank', 'noopener,noreferrer');
  };

  const handleWhatsAppButlerRequest = (reqType: string, reqDetails: string) => {
    if (!currentReservation) return;
    const msg = 
      `🛎️ *NEW BUTLER SERVICE REQUEST*\n` +
      `🏨 *Suite:* Room ${currentReservation.roomNumber} (${currentReservation.roomAllocation})\n` +
      `👤 *Guest:* ${currentReservation.customerName} ${currentReservation.customerSurname} (Ref: ${currentReservation.reservationNumber})\n` +
      `🏷️ *Category:* ${reqType}\n` +
      `📝 *Details:* ${reqDetails}\n` +
      `⏰ *Requested:* ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}\n\n` +
      `Please confirm receipt and estimated delivery to our suite. Thank you!`;
    window.open(`https://wa.me/${cleanManagerPhone}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
  };

  const handleWhatsAppBookAttraction = (att: AttractionItem) => {
    if (!currentReservation) return;
    const msg =
      `🧭 *CONCIERGE EXCURSION INQUIRY*\n` +
      `🏨 *From Suite:* Room ${currentReservation.roomNumber} (${currentReservation.customerName} ${currentReservation.customerSurname})\n` +
      `📍 *Attraction:* *${att.name}* (${att.category})\n` +
      `🚗 *Location:* ${att.address} (~${att.distanceFromGuestHouse})\n` +
      `⏰ *Hours:* ${att.openingTime || '08:00'} - ${att.closingTime || '17:00'} (Duration: ${att.recommendedDuration || '2 hours'})\n` +
      `📞 *Venue Tel:* ${att.contactNumber}\n\n` +
      `Hi Eleanor, could you please assist with availability, tickets, or transport arrangements for this experience?`;
    window.open(`https://wa.me/${cleanManagerPhone}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
  };

  const handleWhatsAppClaimSpecial = (sp: MarketingSpecial) => {
    if (!currentReservation) return;
    const msg =
      `🎁 *RESIDENT SPECIAL OFFER CLAIM*\n` +
      `🏨 *Suite:* Room ${currentReservation.roomNumber} (${currentReservation.customerName} ${currentReservation.customerSurname})\n` +
      `🔖 *Special:* *${sp.title}*\n` +
      `🏷️ *Promo Code:* ${sp.promoCode} (${sp.discountPercent}% Off)\n` +
      `⏳ *Validity:* Until ${sp.validUntil}\n\n` +
      `Hi Eleanor, please apply this privilege to our stay account and arrange any inclusions!`;
    window.open(`https://wa.me/${cleanManagerPhone}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
  };

  // Filter recommendations
  const categories = ['All', 'Sightseeing', 'Eateries', 'Wine Tasting', 'Ocean Tours', 'Car Hire', 'Emergency Services'];
  const filteredAttractions = useMemo(() => {
    return ATTRACTIONS_DIRECTORY.filter(item => {
      const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch = !searchQuery || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.region.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // If not logged in, show secure login portal
  if (!currentReservation) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 animate-fade-in space-y-8">
        {/* Welcome Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Tides of Knysna Concierge Service
          </div>
          <h1 className="font-serif-luxury text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            Guest Self-Service Portal
          </h1>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Access your confirmed booking details, customize room amenities, submit special requests to your private butler, and explore curated Garden Route experiences.
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden max-w-xl mx-auto">
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 p-6 text-white text-center border-b border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <KeyRound className="w-6 h-6" />
            </div>
            <h2 className="font-serif-luxury text-xl font-bold">Secure Guest Verification</h2>
            <p className="text-xs text-slate-300 mt-1">
              Enter your official booking confirmation reference and guest surname as issued on your reservation voucher.
            </p>
          </div>

          <form onSubmit={handleLogin} className="p-6 md:p-8 space-y-4">
            {loginError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Booking Reference Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. TOK-2026-0891"
                  value={bookingRefInput}
                  onChange={(e) => setBookingRefInput(e.target.value)}
                  className="w-full text-sm font-mono font-bold px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none uppercase placeholder:font-sans placeholder:font-normal placeholder:text-slate-400"
                  required
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Found on your booking confirmation email or SMS voucher.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Guest Surname (Last Name) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Vanderbilt"
                value={surnameInput}
                onChange={(e) => setSurnameInput(e.target.value)}
                className="w-full text-sm font-semibold px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none placeholder:text-slate-400"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition shadow-lg flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              Sign In to My Guest Portal
            </button>
          </form>

          {/* Quick Demo Access Bar */}
          <div className="bg-slate-50 p-5 border-t border-slate-100 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <span>Instant Test Logins (Demo Profiles)</span>
              <span className="text-emerald-600 font-medium">Click to Authenticate</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {reservations.slice(0, 4).map(res => (
                <button
                  key={res.id}
                  type="button"
                  onClick={() => handleQuickDemoLogin(res)}
                  className="text-left p-2.5 bg-white hover:bg-emerald-50/60 rounded-xl border border-slate-200 hover:border-emerald-300 transition text-xs group"
                >
                  <div className="font-bold text-slate-900 group-hover:text-emerald-800">
                    {res.customerName} {res.customerSurname}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Ref: <strong className="text-slate-700">{res.reservationNumber}</strong> • Room {res.roomNumber}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Instant WhatsApp Verification Support Card */}
        <div className="bg-gradient-to-r from-emerald-950/90 via-slate-900 to-emerald-900 border border-emerald-500/40 rounded-3xl p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-4 max-w-xl mx-auto shadow-lg">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#25D366]/20 border border-[#25D366]/40 text-[#25D366] flex items-center justify-center shrink-0">
              <WhatsAppIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">Need Login or Booking Help?</span>
                <span className="text-[10px] bg-[#25D366] text-slate-950 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  24/7 Live
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Message Duty Manager Eleanor on WhatsApp for instant booking reference recovery.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleChatWithManagerWhatsApp('Hi Eleanor, I need assistance logging into my Tides of Knysna Guest Self-Service Portal.')}
            className="px-4 py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 transition shadow-md shrink-0 w-full sm:w-auto justify-center"
          >
            <WhatsAppIcon className="w-4 h-4" />
            <span>Chat on WhatsApp</span>
          </button>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center max-w-3xl mx-auto">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <BedDouble className="w-5 h-5 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-slate-800 text-xs">Room & Stay Details</h4>
            <p className="text-[11px] text-slate-500">Live view of suite allocation, stay dates, and door access keys.</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <Sparkles className="w-5 h-5 text-amber-500 mx-auto" />
            <h4 className="font-bold text-slate-800 text-xs">Special Requests</h4>
            <p className="text-[11px] text-slate-500">Request airport pickups, champagne on ice, or dietary accommodations.</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <Compass className="w-5 h-5 text-blue-600 mx-auto" />
            <h4 className="font-bold text-slate-800 text-xs">Concierge Excursions</h4>
            <p className="text-[11px] text-slate-500">Curated lagoon cruises, oyster dining, and guided forest tours.</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate door key PIN simulation
  const roomPinCode = `*${currentReservation.roomNumber}${currentReservation.customerSurname.length}7#`;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Welcome Card with Reservation Status */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <BedDouble className="w-48 h-48 text-emerald-400" />
        </div>

        <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                Booking Confirmed
              </span>
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-200 border border-slate-700">
                Ref: {currentReservation.reservationNumber}
              </span>
              <span className="text-xs text-slate-400">
                Room {currentReservation.roomNumber}
              </span>
            </div>

            <h1 className="font-serif-luxury text-2xl md:text-3xl font-bold tracking-tight text-white">
              Welcome, {currentReservation.customerName} {currentReservation.customerSurname}
            </h1>

            <p className="text-sm text-emerald-200/90 font-medium">
              {currentReservation.roomAllocation}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  <strong>Check-in:</strong> {currentReservation.checkInDate}
                </span>
              </div>
              <span className="text-slate-600">|</span>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  <strong>Check-out:</strong> {currentReservation.checkOutDate}
                </span>
              </div>
              <span className="text-slate-600">|</span>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>{currentReservation.totalNights} Nights • {currentReservation.numberOfGuests} Guests</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActivePortalTab('guestfolder')}
              className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition shadow-md"
              title="Open full guest folder with Tax Invoice, receipts, welcome letters, policies and vouchers"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              Invoicing & Folder (14 Docs)
            </button>

            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition shadow-xs"
              title="Print Stay Pass & Key Dossier (Laser, Inkjet, Adobe PDF & Universal Print Drivers)"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-400" />
              Print Pass
            </button>

            <button
              onClick={() => {
                setEmailToInput(currentReservation.email || '');
                setIsEmailPassModalOpen(true);
              }}
              className="px-3 py-1.5 bg-blue-900/60 hover:bg-blue-800 text-blue-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-blue-700/60 transition shadow-xs"
              title="Share / Email stay pass and room access details directly to guest"
            >
              <Mail className="w-3.5 h-3.5 text-blue-400" />
              Email Pass
            </button>

            <button
              onClick={() => {
                setWhatsAppRecipientPhone(currentReservation.contactNumber || '');
                setIsWhatsAppPassModalOpen(true);
              }}
              className="px-3 py-1.5 bg-[#25D366]/20 hover:bg-[#25D366]/30 text-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-[#25D366]/40 transition shadow-xs"
              title="Send stay pass, door PIN, and Wi-Fi credentials via WhatsApp"
            >
              <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366]" />
              WhatsApp Pass
            </button>

            <button
              onClick={() => handleChatWithManagerWhatsApp()}
              className="px-3 py-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
              title="Chat live with Duty Manager & Concierge Eleanor Sterling on WhatsApp"
            >
              <WhatsAppIcon className="w-3.5 h-3.5 text-slate-950" />
              WhatsApp Butler
            </button>

            <button
              onClick={() => setIsScanIdModalOpen(true)}
              className="px-3 py-1.5 bg-purple-900/60 hover:bg-purple-800 text-purple-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-purple-700/60 transition shadow-xs"
              title="Scan or upload passport/ID document for swift registration"
            >
              <Scan className="w-3.5 h-3.5 text-purple-400" />
              {uploadedIdDoc ? 'ID Verified ✓' : 'Scan ID'}
            </button>

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-rose-800/50 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>

        {/* ESSENTIAL RESIDENT STAY CREDENTIALS & SIGHTSEEING QUICK BAR */}
        <div className="relative z-10 mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 text-xs">
          <div className="bg-slate-900/90 p-3 rounded-2xl border border-slate-800/80 space-y-1">
            <span className="text-slate-400 block text-[10px] uppercase font-bold flex items-center gap-1">
              <Calendar className="w-3 h-3 text-emerald-400" /> Stay Dates & Window
            </span>
            <div className="font-bold text-white text-[11px] truncate">{currentReservation.checkInDate} → {currentReservation.checkOutDate}</div>
            <span className="text-[10px] text-emerald-400 block font-semibold">{currentReservation.totalNights} Days / Nights Duration</span>
          </div>

          <div className="bg-slate-900/90 p-3 rounded-2xl border border-slate-800/80 space-y-1">
            <span className="text-slate-400 block text-[10px] uppercase font-bold flex items-center gap-1">
              <Wifi className="w-3 h-3 text-emerald-400" /> High-Speed Wi-Fi
            </span>
            <div className="font-mono font-bold text-emerald-300 text-xs flex items-center justify-between">
              <span>LagoonView2026!</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText('LagoonView2026!');
                  setCopiedWifi(true);
                  setTimeout(() => setCopiedWifi(false), 2000);
                }}
                className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/40"
              >
                {copiedWifi ? 'Copied' : 'Copy'}
              </button>
            </div>
            <span className="text-[10px] text-slate-400 block truncate">SSID: TidesExclusive_Guest5G</span>
          </div>

          <div className="bg-slate-900/90 p-3 rounded-2xl border border-slate-800/80 space-y-1">
            <span className="text-slate-400 block text-[10px] uppercase font-bold flex items-center gap-1">
              <Key className="w-3 h-3 text-amber-400" /> Suite Door PIN
            </span>
            <div className="font-mono font-bold text-amber-300 text-xs flex items-center justify-between">
              <span>{roomPinCode}</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(roomPinCode);
                  setCopiedPin(true);
                  setTimeout(() => setCopiedPin(false), 2000);
                }}
                className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/40"
              >
                {copiedPin ? 'Copied' : 'Copy'}
              </button>
            </div>
            <span className="text-[10px] text-slate-400 block truncate">Suite {currentReservation.roomNumber} Keyless</span>
          </div>

          <div className="bg-slate-900/90 p-3 rounded-2xl border border-slate-800/80 space-y-1">
            <span className="text-slate-400 block text-[10px] uppercase font-bold flex items-center gap-1">
              <Compass className="w-3 h-3 text-blue-400" /> Sightseeing Guide
            </span>
            <button
              type="button"
              onClick={() => setActivePortalTab('recommendations')}
              className="text-left font-bold text-blue-300 hover:text-blue-200 text-[11px] block truncate"
            >
              {ATTRACTIONS_DIRECTORY.length} Curated Venues →
            </button>
            <span className="text-[10px] text-slate-400 block">Hours & Directions</span>
          </div>

          <div className="col-span-2 sm:col-span-4 lg:col-span-1 bg-slate-900/90 p-3 rounded-2xl border border-slate-800/80 space-y-1">
            <span className="text-slate-400 block text-[10px] uppercase font-bold flex items-center gap-1">
              <Phone className="w-3 h-3 text-rose-400" /> 24/7 Emergency
            </span>
            <div className="font-mono font-bold text-white text-[11px] truncate">{dutyManagerPhone}</div>
            <div className="text-[10px] text-rose-300 flex items-center gap-1 truncate">
              <span>Police 10111</span>
              <span>•</span>
              <span>Hosp: +27 44 384 1083</span>
            </div>
          </div>
        </div>
      </div>

      {/* ESTATE BROADCAST NOTICE (CONFIGURED VIA ADMIN BUTTON) */}
      {broadcastNotice && (
        <div className="bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-transparent p-3.5 rounded-2xl border border-amber-500/30 flex items-center justify-between gap-3 text-xs shadow-xs no-print">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 bg-amber-500/20 text-amber-800 rounded-lg shrink-0">
              <Sparkles className="w-4 h-4 text-amber-600" />
            </span>
            <div className="text-slate-800">
              <strong className="text-amber-900 font-bold block sm:inline mr-2">Estate Manager Notice:</strong>
              <span>{broadcastNotice}</span>
            </div>
          </div>
          <span className="text-[10px] text-amber-700 bg-amber-100 font-mono font-bold px-2 py-0.5 rounded-full shrink-0">
            Active Bulletin
          </span>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto no-print">
        <button
          onClick={() => setActivePortalTab('digitalkey')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition shrink-0 ${
            activePortalTab === 'digitalkey'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Smartphone className="w-4 h-4 text-emerald-500" />
          Mobile Key & Concierge
        </button>

        <button
          onClick={() => setActivePortalTab('stay')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition shrink-0 ${
            activePortalTab === 'stay'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <BedDouble className="w-4 h-4 text-emerald-500" />
          My Reservation & Access
        </button>

        <button
          onClick={() => setActivePortalTab('survey')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition shrink-0 ${
            activePortalTab === 'survey'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Star className="w-4 h-4 text-amber-400" />
          Satisfaction Survey
          <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-bold border border-amber-300">
            5★ CSAT
          </span>
        </button>

        <button
          onClick={() => setActivePortalTab('specials')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition shrink-0 ${
            activePortalTab === 'specials'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Tag className="w-4 h-4 text-emerald-500" />
          Specials & Packages
          <span className="text-[10px] bg-emerald-100 text-emerald-900 px-1.5 py-0.2 rounded font-bold border border-emerald-300">
            15-25% Off
          </span>
        </button>

        <button
          onClick={() => setActivePortalTab('policies')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition shrink-0 ${
            activePortalTab === 'policies'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <FileText className="w-4 h-4 text-blue-500" />
          Estate Policies & Rules
        </button>

        <button
          onClick={() => setActivePortalTab('requests')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition relative shrink-0 ${
            activePortalTab === 'requests'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          Special Requests & Butler
          {currentReservation.specialRequests && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          )}
        </button>

        <button
          onClick={() => setActivePortalTab('recommendations')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition shrink-0 ${
            activePortalTab === 'recommendations'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Compass className="w-4 h-4 text-blue-500" />
          Local Recommendations ({ATTRACTIONS_DIRECTORY.length})
        </button>

        <button
          onClick={() => setActivePortalTab('concierge')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition shrink-0 ${
            activePortalTab === 'concierge'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Phone className="w-4 h-4 text-emerald-600" />
          Front Desk & Transfers
        </button>

        <button
          onClick={() => setActivePortalTab('guestfolder')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition shrink-0 ${
            activePortalTab === 'guestfolder'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-emerald-50 text-emerald-950 hover:bg-emerald-100 border border-emerald-300'
          }`}
        >
          <FolderOpen className="w-4 h-4 text-emerald-600" />
          My Invoicing & Guest Folder
          <span className="text-[10px] bg-emerald-200 text-emerald-950 px-1.5 py-0.2 rounded font-bold border border-emerald-400">
            14 Docs
          </span>
        </button>

        {/* ADMIN BUTTON IN GUEST PORTAL FOR HOUSEKEEPING & POLICY MANAGEMENT */}
        <button
          onClick={() => setIsAdminPanelOpen(true)}
          className="ml-auto px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl text-xs font-extrabold flex items-center gap-1.5 border border-amber-300 transition shrink-0 shadow-xs"
          title="Guest Portal Administration, Data Housekeeping & Policy Management"
        >
          <Wrench className="w-3.5 h-3.5 text-amber-700" />
          Admin Portal Controls
        </button>
      </div>

      {portalAdminNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center justify-between">
          <span>{portalAdminNotice}</span>
          <button onClick={() => setPortalAdminNotice(null)} className="text-emerald-700 font-bold">✕</button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 0: DIGITAL MOBILE KEY & SERVICE CONCIERGE                             */}
      {/* ========================================================================= */}
      {activePortalTab === 'digitalkey' && (
        <DigitalRoomAccess 
          reservation={currentReservation}
          onUpdateReservation={(updated) => {
            const updatedList = reservations.map(r => r.id === updated.id ? updated : r);
            onUpdateReservations(updatedList);
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* TAB 1: RESERVATION & ACCESS DETAILS                                       */}
      {/* ========================================================================= */}
      {activePortalTab === 'stay' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Room Credentials & Digital Key */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
                <Key className="w-4 h-4 text-emerald-600" />
                Suite Access & Keyless PIN
              </h3>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Suite Electronic Door Code</span>
                  <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    Active on Arrival
                  </span>
                </div>
                <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200">
                  <span className="text-xl font-mono font-bold tracking-widest text-slate-900">
                    {roomPinCode}
                  </span>
                  <button
                    onClick={() => handleCopyPin(roomPinCode)}
                    className="p-1.5 text-slate-500 hover:text-emerald-700 rounded transition"
                    title="Copy PIN"
                  >
                    {copiedPin ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      const text = `🔑 *Suite ${currentReservation.roomNumber} Keypad PIN:* ${roomPinCode}\n📍 14 Waterfront Promenade, Knysna`;
                      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
                    }}
                    className="w-full py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold border border-emerald-200 flex items-center justify-center gap-1.5 transition"
                    title="Send door PIN to travel partner on WhatsApp"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366]" />
                    WhatsApp Door PIN
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Enter PIN followed by # on the digital touchpad outside Suite {currentReservation.roomNumber}.
                </p>
              </div>

              {/* Wi-Fi Credentials */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 flex items-center gap-1.5 font-semibold">
                    <Wifi className="w-3.5 h-3.5 text-blue-600" />
                    High-Speed Fibre Wi-Fi
                  </span>
                  <span className="text-[10px] text-blue-700 font-bold bg-blue-100 px-2 py-0.5 rounded">
                    Uncapped 200Mbps
                  </span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">SSID:</span>
                    <strong className="text-slate-800">TidesExclusive_Guest5G</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Password:</span>
                    <strong className="font-mono text-emerald-700">LagoonView2026!</strong>
                  </div>
                </div>
                <button
                  onClick={handleCopyWifi}
                  className="w-full py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 flex items-center justify-center gap-1.5 transition mb-2"
                >
                  {copiedWifi ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      Copied Credentials!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      Copy Wi-Fi Password
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    const text = `📶 *Tides of Knysna Wi-Fi Access*\nSSID: TidesExclusive_Guest5G\nPassword: LagoonView2026!\n📍 High-Speed Fibre in Suite ${currentReservation.roomNumber}`;
                    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
                  }}
                  className="w-full py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold border border-emerald-200 flex items-center justify-center gap-1.5 transition"
                  title="Share Wi-Fi credentials on WhatsApp"
                >
                  <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366]" />
                  Share Wi-Fi via WhatsApp
                </button>
              </div>
            </div>

            {/* Check-In / Check-Out Timings */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3 text-xs">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                Operational Hours & Procedures
              </h3>
              <div className="space-y-2 text-slate-600">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="font-semibold text-slate-700">Standard Check-In:</span>
                  <span>14:00 - 20:00</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="font-semibold text-slate-700">Standard Check-Out:</span>
                  <span>10:30</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="font-semibold text-slate-700">Artisanal Breakfast:</span>
                  <span>07:30 - 10:30 (Dining Deck)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="font-semibold text-slate-700">Evening Sundowner Bar:</span>
                  <span>17:00 - 20:30 (Lagoon Lounge)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Two Columns: Reservation Accounting & Itinerary */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
                <div>
                  <h3 className="font-serif-luxury font-bold text-slate-900 text-base">
                    Stay Accounting & Settlement Summary
                  </h3>
                  <p className="text-xs text-slate-500">Official reservation cost and breakage guarantee deposit.</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  currentReservation.paymentStatus === 'Paid'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  Payment: {currentReservation.paymentStatus}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Suite Rate / Night</span>
                  <span className="text-sm font-bold text-slate-900">R {currentReservation.ratePerNightPerPerson.toLocaleString()}</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Per Person Sharing</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Nights</span>
                  <span className="text-sm font-bold text-slate-900">{currentReservation.totalNights} Nights</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">{currentReservation.numberOfGuests} Guests</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Accommodation</span>
                  <span className="text-sm font-bold text-emerald-700">R {currentReservation.totalRoomCost.toLocaleString()}</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Method: {currentReservation.paymentMethod}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Breakage Deposit</span>
                  <span className="text-sm font-bold text-slate-900">R {currentReservation.breakageDepositAmount.toLocaleString()}</span>
                  <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
                    {currentReservation.breakageDepositStatus}
                  </span>
                </div>
              </div>

              {/* Guest Profile & Contact Info on Record */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Primary Guest Contact Record
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Email Address</span>
                    <span className="font-medium text-slate-800">{currentReservation.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Phone Number</span>
                    <span className="font-medium text-slate-800">{currentReservation.contactNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Passport / ID Reference</span>
                    <span className="font-medium text-slate-800 font-mono">{currentReservation.idOrPassportNumber}</span>
                  </div>
                </div>
              </div>

              {/* Notes or Special Travel Requirements */}
              {(currentReservation.specialTravelRequirements || currentReservation.notes) && (
                <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 text-xs text-blue-900 space-y-1">
                  <h4 className="font-bold flex items-center gap-1.5 text-blue-800">
                    <Info className="w-3.5 h-3.5 text-blue-600" />
                    Special Travel & Transfer Arrangements
                  </h4>
                  {currentReservation.specialTravelRequirements && (
                    <p className="leading-relaxed">{currentReservation.specialTravelRequirements}</p>
                  )}
                  {currentReservation.notes && (
                    <p className="text-slate-600 italic text-[11px] mt-1">Note: {currentReservation.notes}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SPECIAL REQUESTS & BUTLER FORM                                     */}
      {/* ========================================================================= */}
      {activePortalTab === 'requests' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Submit New Request Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-serif-luxury font-bold text-slate-900 text-base flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  Request Bespoke Amenities & Concierge Services
                </h3>
                <p className="text-xs text-slate-500">
                  Our front-of-house team will prepare your suite according to your specific preferences.
                </p>
              </div>

              {requestSubmittedSuccess && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-fade-in font-medium">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Your request has been delivered to Head of Concierge Eleanor Sterling and added to your file.</span>
                </div>
              )}

              <form onSubmit={handleSubmitSpecialRequest} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Category of Request
                  </label>
                  <select
                    value={newRequestType}
                    onChange={(e) => setNewRequestType(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="Champagne & Refreshments">Moët / Cap Classique Champagne on Ice</option>
                    <option value="Airport Transfer & Shuttles">VIP Airport Shuttle (George GRJ / Plett Airport)</option>
                    <option value="Dietary & Dining Preferences">Dietary Requirements (Vegan, Gluten-Free, Halal, Kosher)</option>
                    <option value="Pillow & Bedding Menu">Pillow Menu (Firm Down, Soft Memory Foam, Lavender Aroma)</option>
                    <option value="Celebration & Anniversary Surprise">Anniversary / Birthday Room Turndown & Flowers</option>
                    <option value="Lagoon Excursion Concierge">Knysna Oyster Tasting & Private Catamaran</option>
                    <option value="Housekeeping & Timing">Late Check-Out / Early Luggage Drop-off</option>
                    <option value="Other Bespoke Request">Other Special Requirement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Request Details & Special Instructions <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={newRequestDetails}
                    onChange={(e) => setNewRequestDetails(e.target.value)}
                    placeholder="e.g. Please arrange a bottle of chilled Cap Classique with artisanal cheese platter at 17:30 on our private sunset deck..."
                    className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none placeholder:text-slate-400"
                    required
                  />
                </div>

                <div className="flex items-center justify-between pt-2 flex-wrap gap-2">
                  <span className="text-[11px] text-slate-500">
                    Concierge response guaranteed within 60 minutes.
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleWhatsAppButlerRequest(newRequestType, newRequestDetails || 'Please contact our suite regarding special arrangements.')}
                      className="px-4 py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-md transition"
                      title="Send request immediately via WhatsApp to Butler"
                    >
                      <WhatsAppIcon className="w-3.5 h-3.5" />
                      Send via WhatsApp
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Submit to Butler
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Existing Requests On File */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
                <FileText className="w-4 h-4 text-emerald-600" />
                Current Requests on Record
              </h3>

              {currentReservation.specialRequests ? (
                <div className="space-y-2">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                    {currentReservation.specialRequests}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Registered with Duty Manager Eleanor Sterling</span>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-slate-400 text-xs space-y-1 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <Sparkles className="w-6 h-6 mx-auto text-slate-300 mb-1" />
                  <p className="font-semibold text-slate-600">No requests submitted yet</p>
                  <p className="text-[11px]">Use the form on the left to request amenities or airport transfers.</p>
                </div>
              )}
            </div>

            {/* Quick Contact Card */}
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-5 rounded-2xl space-y-3">
              <h4 className="font-serif-luxury font-bold text-xs uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                Urgent Assistance
              </h4>
              <p className="text-xs text-slate-300">
                Arriving in the next 2 hours or require immediate assistance?
              </p>
              <div className="pt-1 flex flex-col gap-2">
                <a
                  href={`https://wa.me/${cleanManagerPhone}?text=${encodeURIComponent(`Hello Eleanor, urgent assistance requested for Suite ${currentReservation.roomNumber} (${currentReservation.customerName} ${currentReservation.customerSurname}).`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-bold rounded-lg text-xs transition"
                >
                  <WhatsAppIcon className="w-3.5 h-3.5 text-slate-950" />
                  Chat Butler on WhatsApp: {dutyManagerPhone}
                </a>
                <a
                  href={`tel:${dutyManagerPhone}`}
                  className="inline-flex items-center justify-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg text-xs transition"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Call Butler Direct: {dutyManagerPhone}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: LOCAL AREA RECOMMENDATIONS DIRECTORY                               */}
      {/* ========================================================================= */}
      {activePortalTab === 'recommendations' && (
        <div className="space-y-6">
          {/* Search & Filter Header */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-serif-luxury font-bold text-slate-900 text-base">
                  Curated Knysna & Garden Route Directory
                </h3>
                <p className="text-xs text-slate-500">
                  Exclusive guest recommendations handpicked by the Tides of Knysna concierge.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search dining, tours, wines..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-emerald-600 text-white font-bold shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {bookingRequestSent && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-fade-in font-medium">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Excursion request added to your booking! Our concierge will arrange reservations on your behalf.</span>
            </div>
          )}

          {/* Recommendations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAttractions.map(item => {
              const isAlreadyRequested = currentReservation.nearbySightseeingInterests?.includes(item.name);

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                        {item.category}
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {item.distanceFromGuestHouse}
                      </span>
                    </div>

                    <h4 className="font-serif-luxury font-bold text-slate-900 text-base leading-snug">
                      {item.name}
                    </h4>

                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {item.description}
                    </p>

                    {item.highlights && item.highlights.length > 0 && (
                      <div className="pt-1 flex flex-wrap gap-1">
                        {item.highlights.slice(0, 3).map((h, i) => (
                          <span key={i} className="text-[10px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded border border-slate-100">
                            • {h}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1 truncate max-w-[170px]">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {item.contactNumber}
                      </span>

                      {item.website && (
                        <a
                          href={item.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1 text-[11px]"
                        >
                          Visit Site
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRequestExcursion(item)}
                        disabled={isAlreadyRequested || bookingRequestSent === item.id}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                          isAlreadyRequested
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 cursor-default'
                            : 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm'
                        }`}
                      >
                        {isAlreadyRequested ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            Concierge Arranging
                          </>
                        ) : (
                          <>
                            <BookmarkPlus className="w-3.5 h-3.5 text-emerald-400" />
                            Request Concierge Booking
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleWhatsAppBookAttraction(item)}
                        className="px-2.5 py-2 bg-[#25D366]/20 hover:bg-[#25D366] text-emerald-900 hover:text-slate-950 border border-[#25D366]/40 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 shrink-0"
                        title="Book or inquire about this attraction via WhatsApp"
                      >
                        <WhatsAppIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: DIRECT FRONT DESK & TRANSFERS                                      */}
      {/* ========================================================================= */}
      {activePortalTab === 'concierge' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="font-serif-luxury font-bold text-slate-900 text-base flex items-center gap-2 border-b border-slate-100 pb-3">
              <Phone className="w-4 h-4 text-emerald-600" />
              Direct Front Desk & Operations Contact
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Front Desk Landline</span>
                <span className="text-sm font-bold text-slate-900">{GUEST_HOUSE_INFO.telephone}</span>
                <p className="text-[11px] text-slate-500 mt-0.5">Available 07:00 - 22:00 daily.</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Duty Manager Mobile & WhatsApp</span>
                  <span className="text-sm font-bold text-emerald-700">{dutyManagerPhone}</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">24/7 on-call for arrivals and guest emergencies.</p>
                </div>
                <a
                  href={`https://wa.me/${cleanManagerPhone}?text=${encodeURIComponent(`Hello Eleanor, contacting you from Suite ${currentReservation.roomNumber} (${currentReservation.customerName} ${currentReservation.customerSurname}).`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition"
                >
                  <WhatsAppIcon className="w-4 h-4 text-slate-950" />
                  Open WhatsApp Chat with Duty Manager
                </a>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Concierge Email</span>
                <span className="text-sm font-bold text-slate-900">{GUEST_HOUSE_INFO.email}</span>
                <p className="text-[11px] text-slate-500 mt-0.5">For formal travel itineraries and special dietary sheets.</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">GPS Coordinates</span>
                <span className="text-sm font-bold text-slate-900">-34.0354° S, 23.0465° E</span>
                <p className="text-[11px] text-slate-500 mt-0.5">{GUEST_HOUSE_INFO.address}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="font-serif-luxury font-bold text-slate-900 text-base flex items-center gap-2 border-b border-slate-100 pb-3">
              <Car className="w-4 h-4 text-blue-600" />
              Airport Transfers & Private Shuttles
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              We provide luxury, private door-to-door transfers connecting directly to George Airport (GRJ - 65 km / 50 min) and Plettenberg Bay Airport (PBZ - 32 km / 30 min).
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 text-emerald-900 flex items-center justify-between">
                <div>
                  <strong className="block">George Airport (GRJ) Transfer</strong>
                  <span className="text-[11px] text-emerald-700">Mercedes-Benz V-Class (Up to 6 guests)</span>
                </div>
                <span className="font-bold text-sm">R 1,250</span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 text-emerald-900 flex items-center justify-between">
                <div>
                  <strong className="block">Plettenberg Bay Airport (PBZ)</strong>
                  <span className="text-[11px] text-emerald-700">Luxury Executive Sedan (Up to 3 guests)</span>
                </div>
                <span className="font-bold text-sm">R 850</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => {
                  const text = `🚗 *AIRPORT TRANSFER REQUEST*\n🏨 Suite ${currentReservation.roomNumber} (${currentReservation.customerName} ${currentReservation.customerSurname})\nHi Eleanor, please book an airport transfer for our party. Route: George Airport (GRJ) / Plett. Flight details: ...`;
                  window.open(`https://wa.me/${cleanManagerPhone}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
                }}
                className="flex-1 py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
              >
                <WhatsAppIcon className="w-3.5 h-3.5" />
                Book via WhatsApp
              </button>
              <button
                onClick={() => {
                  setActivePortalTab('requests');
                  setNewRequestType('Airport Transfer & Shuttles');
                  setNewRequestDetails('Please arrange private airport transfer from George Airport (GRJ). Flight details: [Insert flight number & arrival time].');
                }}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Car className="w-3.5 h-3.5 text-emerald-400" />
                Book In Portal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: GUEST SATISFACTION SURVEY & REVIEW AUDIT                           */}
      {/* ========================================================================= */}
      {activePortalTab === 'survey' && (
        <div className="space-y-6">
          <GuestSatisfactionSurvey 
            reservation={currentReservation}
            onSubmitted={(record) => {
              setPortalAdminNotice(`Thank you, ${record.guestName}! Your 5-star review (Score: ${record.overallScore}/5.0) has been archived and shared with management.`);
            }}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: GUEST SPECIALS & SEASONAL PRIVILEGES (FULL IMAGERY & HASHTAGS)     */}
      {/* ========================================================================= */}
      {activePortalTab === 'specials' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950">
                  Exclusive Guest Privileges
                </span>
                <span className="text-xs text-emerald-300 font-serif-luxury italic">
                  Garden Route Seasonal Offers
                </span>
              </div>
              <h2 className="text-xl font-bold font-serif-luxury text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                Special Packages & Seasonal Resident Privileges
              </h2>
              <p className="text-xs text-slate-300">
                Unlock direct savings up to 25%, complimentary catamaran cruises, couples spa treatments, and private transfers.
              </p>
            </div>

            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-700 shrink-0 shadow-xs"
              title="Print Specials Catalogue (Laser, Inkjet & Adobe PDF)"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-400" />
              Print Specials Brochure
            </button>
          </div>

          {specialClaimSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-xs flex items-center justify-between font-semibold shadow-xs">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                {specialClaimSuccess}
              </div>
              <button onClick={() => setSpecialClaimSuccess(null)} className="text-emerald-700 font-bold">✕</button>
            </div>
          )}

          {/* Specials Catalog Grid with Full High-Res Imagery */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {specials.map((sp) => (
              <div 
                key={sp.id} 
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between group"
              >
                <div>
                  {/* Full Marketing Photography */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                    {sp.imageUrl ? (
                      <img 
                        src={sp.imageUrl} 
                        alt={sp.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                        Tides of Knysna Photography
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full bg-slate-900/90 text-white font-mono text-[10px] font-bold border border-slate-700 shadow-sm backdrop-blur-xs">
                        {sp.promoCode}
                      </span>
                      {sp.season && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-bold text-[10px] uppercase shadow-sm">
                          {sp.season}
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-3 right-3 bg-amber-400 text-slate-950 px-3 py-1 rounded-xl text-xs font-black shadow-md uppercase tracking-wider">
                      {sp.discountPercent}% Direct Saving
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <h3 className="font-serif-luxury font-bold text-slate-900 text-base leading-snug group-hover:text-emerald-700 transition">
                      {sp.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {sp.description}
                    </p>

                    {/* Inclusions */}
                    {sp.inclusions && sp.inclusions.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                          Package Inclusions:
                        </span>
                        <ul className="space-y-1 text-[11px] text-slate-700">
                          {sp.inclusions.map((inc, i) => (
                            <li key={i} className="flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="truncate">{inc}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Hashtags */}
                    {sp.hashtags && sp.hashtags.length > 0 && (
                      <div className="pt-2 flex flex-wrap gap-1">
                        {sp.hashtags.slice(0, 4).map((tag, i) => (
                          <span key={i} className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-slate-100 flex items-center justify-between gap-2 mt-2 flex-wrap">
                  <span className="text-[11px] text-slate-400 font-medium">
                    Valid until: {sp.validUntil}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleWhatsAppClaimSpecial(sp)}
                      className="px-3 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs shrink-0"
                      title="Claim this special via WhatsApp with Eleanor"
                    >
                      <WhatsAppIcon className="w-3.5 h-3.5" />
                      Claim on WhatsApp
                    </button>
                    <button
                      onClick={() => {
                        if (!currentReservation) return;
                        const specialNote = `[Special Privilege Claimed: ${sp.title} (${sp.promoCode} - ${sp.discountPercent}% Off)]`;
                        const updatedReqs = currentReservation.specialRequests 
                          ? `${currentReservation.specialRequests} \n• ${specialNote}` 
                          : `• ${specialNote}`;
                        const updatedList = reservations.map(r => r.id === currentReservation.id ? { ...r, specialRequests: updatedReqs } : r);
                        onUpdateReservations(updatedList);
                        setSpecialClaimSuccess(`Successfully attached "${sp.title}" to your suite reservation! Front desk has been notified.`);
                        setTimeout(() => setSpecialClaimSuccess(null), 5000);
                      }}
                      className="px-3 py-2 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Request For Stay
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: ESTATE POLICIES & HOUSE RULES                                      */}
      {/* ========================================================================= */}
      {activePortalTab === 'policies' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs uppercase font-extrabold tracking-wider text-blue-700">
                    Official House Rules & Guest Protocol
                  </span>
                  <h3 className="text-lg font-bold font-serif-luxury text-slate-900">
                    Estate Regulations, Legal Bylaws & Operational Standards
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                  title="Print House Rules for hard copy filing on any printer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Policies (Laser/Inkjet)
                </button>

                <button
                  onClick={() => {
                    if (uploadedPolicies[0]) {
                      handleDownloadPolicy(uploadedPolicies[0]);
                    } else {
                      window.print();
                    }
                  }}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                  title="Download offline policies dossier"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  Download Policies
                </button>

                <button
                  onClick={() => setIsAdminPanelOpen(true)}
                  className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Wrench className="w-3.5 h-3.5 text-amber-700" />
                  Admin Edit Policies
                </button>
              </div>
            </div>

            {/* Uploaded Official Policy Documentation Repository */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Official Uploaded Policy Documents & Gazette Notices ({uploadedPolicies.length} Available)
                </h4>
                <span className="text-[10px] text-slate-400">Downloadable & Printable</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {uploadedPolicies.map((up) => (
                  <div key={up.id} className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 flex flex-col justify-between gap-3 text-xs">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-emerald-900 border border-emerald-300">
                          {up.category}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500">
                          {up.fileSize}
                        </span>
                      </div>
                      <strong className="block text-slate-900 line-clamp-2">{up.title}</strong>
                      <p className="text-[11px] text-slate-500">{up.notes || up.fileName}</p>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-emerald-200/60">
                      <button
                        type="button"
                        onClick={() => handleDownloadPolicy(up)}
                        className="flex-1 py-1.5 bg-white hover:bg-emerald-100 text-emerald-900 rounded-lg font-bold border border-emerald-300 text-[11px] flex items-center justify-center gap-1 transition"
                      >
                        <Download className="w-3 h-3" />
                        Download
                      </button>
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="p-1.5 bg-white hover:bg-emerald-100 text-slate-700 rounded-lg border border-emerald-200 transition"
                        title="Print policy"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const text = `📜 *TIDES OF KNYSNA POLICY*\n*${up.title}*\nCategory: ${up.category}\nOfficial bylaws available on guest portal.`;
                          window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
                        }}
                        className="p-1.5 bg-[#25D366]/20 hover:bg-[#25D366]/30 text-emerald-900 rounded-lg border border-[#25D366]/40 transition"
                        title="Share on WhatsApp"
                      >
                        <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Guest & Admin Upload Document Box */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-3 no-print">
                <div className="flex items-center justify-between">
                  <strong className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-emerald-600" />
                    Upload Policy Agreement / Guest Acceptance File
                  </strong>
                  <span className="text-[10px] text-slate-400">PDF, DOCX, TXT, PNG, JPG</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={guestPolicyUploadTitle}
                    onChange={(e) => setGuestPolicyUploadTitle(e.target.value)}
                    placeholder="Document Title (e.g. Signed Pet Protocol)"
                    className="px-3 py-1.5 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />

                  <select
                    value={guestPolicyCategory}
                    onChange={(e) => setGuestPolicyCategory(e.target.value)}
                    className="px-3 py-1.5 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="Guest Signed Agreement">Guest Signed Agreement</option>
                    <option value="Estate Protocol">Estate Protocol</option>
                    <option value="Environmental Sanctuary">Environmental Sanctuary</option>
                    <option value="Safety & Indemnity">Safety & Indemnity</option>
                    <option value="Special House Rules">Special House Rules</option>
                  </select>

                  <label className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition shadow-xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isGuestUploadingPolicy ? 'Uploading...' : 'Browse & Upload Document'}</span>
                    <input
                      type="file"
                      accept=".pdf,.docx,.txt,.png,.jpg,.jpeg"
                      onChange={handleGuestPolicyUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Standard Estate Policies Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {policies.map((pol) => (
                <div key={pol.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                        {pol.category}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        pol.strictness === 'Mandatory' 
                          ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                          : pol.strictness === 'Standard'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}>
                        {pol.strictness}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm">
                      {pol.title}
                    </h4>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {pol.content}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400">
                    <span>TGCSA Standard 5-Star Compliance</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                </div>
              ))}
            </div>

            {/* WhatsApp Policy Inquiry Card */}
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#25D366]/20 text-[#25D366] flex items-center justify-center shrink-0">
                  <WhatsAppIcon className="w-5 h-5" />
                </div>
                <div>
                  <strong className="text-emerald-900 block">Questions About House Rules or Check-Out Times?</strong>
                  <span className="text-emerald-700 text-[11px]">Chat directly with Front Desk & Estate Management on WhatsApp.</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleChatWithManagerWhatsApp('Hi Eleanor, I have a question regarding estate policies and procedures during our stay.')}
                className="px-4 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-xs shrink-0"
              >
                <WhatsAppIcon className="w-3.5 h-3.5" />
                Ask on WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 8: GUEST FOLDER & COMPLETE INVOICING DOSSIER                          */}
      {/* ========================================================================= */}
      {activePortalTab === 'guestfolder' && (
        <div className="space-y-6">
          <GuestFolderModule 
            reservation={currentReservation}
            companyInfo={companyInfo}
            isAdminView={false}
          />
        </div>
      )}

      {/* Admin Portal Control, Housekeeping & Policy Management Modal */}
      {isAdminPanelOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto no-print">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl space-y-6 my-8 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <span className="p-2.5 bg-amber-500/20 text-amber-800 rounded-2xl border border-amber-500/30">
                  <Wrench className="w-5 h-5 text-amber-700" />
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-base font-serif-luxury">
                    Guest Portal Administration & Data Housekeeping
                  </h3>
                  <p className="text-xs text-slate-500">
                    Regular maintenance, purge expired tickets, synchronize policies, and broadcast bulletins.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsAdminPanelOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
              >
                ✕
              </button>
            </div>

            {/* Admin Sub-Tabs */}
            <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold gap-1">
              <button
                onClick={() => setAdminModalTab('housekeeping')}
                className={`flex-1 py-2 rounded-lg transition ${
                  adminModalTab === 'housekeeping'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🧹 Data Housekeeping
              </button>
              <button
                onClick={() => setAdminModalTab('policies')}
                className={`flex-1 py-2 rounded-lg transition ${
                  adminModalTab === 'policies'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📜 Load & Edit Policies ({policies.length})
              </button>
              <button
                onClick={() => setAdminModalTab('broadcast')}
                className={`flex-1 py-2 rounded-lg transition ${
                  adminModalTab === 'broadcast'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📢 Broadcast Bulletin
              </button>
            </div>

            {/* SUB-PANEL 1: DATA HOUSEKEEPING */}
            {adminModalTab === 'housekeeping' && (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Trash2 className="w-4 h-4 text-rose-600" /> Purge Maintenance Tickets & Room Access Cache
                  </h4>
                  <p className="text-slate-600">
                    Permanently cleans out temporary guest maintenance reports, reset simulated BLE key pairings, and clear session cache.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem('tok_guest_maintenance_tickets_v1');
                      setPortalAdminNotice('✓ Temporary maintenance tickets and BLE key credentials purged successfully.');
                      setIsAdminPanelOpen(false);
                    }}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl border border-rose-200 transition flex items-center gap-1.5 shadow-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Purge Maintenance Tickets
                  </button>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" /> Reset Guest Requests on Active Reservation
                  </h4>
                  <p className="text-slate-600">
                    Clears completed concierge and special butler requests for currently displayed reservation.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (!currentReservation) return;
                      const updated = reservations.map(r => r.id === currentReservation.id ? { ...r, specialRequests: '' } : r);
                      onUpdateReservations(updated);
                      setPortalAdminNotice('✓ Special requests and butler notes cleared for this reservation.');
                      setIsAdminPanelOpen(false);
                    }}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Reset Special Requests
                  </button>
                </div>
              </div>
            )}

            {/* SUB-PANEL 2: POLICIES MANAGEMENT */}
            {adminModalTab === 'policies' && (
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between pb-1">
                  <span className="font-bold text-slate-900">Manage Estate House Rules</span>
                  <button
                    type="button"
                    onClick={() => {
                      handleSavePolicies(DEFAULT_ESTATE_POLICIES);
                      setPortalAdminNotice('✓ Reset policies to standard TGCSA 5-star guidelines.');
                    }}
                    className="text-xs text-blue-700 hover:underline font-semibold"
                  >
                    Reset to 5-Star Defaults
                  </button>
                </div>

                <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                  {policies.map((p, idx) => (
                    <div key={p.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <strong className="text-slate-900">{p.title}</strong>
                          <span className="text-[10px] bg-slate-200 px-1.5 py-0.2 rounded font-mono">{p.category}</span>
                        </div>
                        <p className="text-slate-600 text-[11px] leading-relaxed">{p.content}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = policies.filter(item => item.id !== p.id);
                          handleSavePolicies(updated);
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Delete policy"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Form to Add New Policy */}
                <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-2">
                  <span className="font-bold text-emerald-900 block">Add New Estate Policy</span>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Policy Title (e.g. Drone Photography)"
                      value={newPolicyTitle}
                      onChange={(e) => setNewPolicyTitle(e.target.value)}
                      className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                    <select
                      value={newPolicyCategory}
                      onChange={(e) => setNewPolicyCategory(e.target.value as any)}
                      className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    >
                      <option value="Check-In/Out">Check-In/Out</option>
                      <option value="Quiet Hours">Quiet Hours</option>
                      <option value="Safety">Safety</option>
                      <option value="Non-Smoking">Non-Smoking</option>
                      <option value="Deposit">Deposit</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                  <textarea
                    rows={2}
                    placeholder="Policy content & explanation..."
                    value={newPolicyContent}
                    onChange={(e) => setNewPolicyContent(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newPolicyTitle.trim() || !newPolicyContent.trim()) return;
                      const newPol: EstatePolicyItem = {
                        id: `pol-${Date.now()}`,
                        title: newPolicyTitle.trim(),
                        category: newPolicyCategory,
                        content: newPolicyContent.trim(),
                        strictness: newPolicyStrictness
                      };
                      handleSavePolicies([...policies, newPol]);
                      setNewPolicyTitle('');
                      setNewPolicyContent('');
                      setPortalAdminNotice(`Added policy: "${newPol.title}"`);
                    }}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg font-bold text-xs flex items-center gap-1 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> Save Policy to Guest Portal
                  </button>
                </div>
              </div>
            )}

            {/* SUB-PANEL 3: BROADCAST BULLETIN */}
            {adminModalTab === 'broadcast' && (
              <div className="space-y-3 text-xs">
                <span className="font-bold text-slate-900 block">Configure Live Guest Notice Banner</span>
                <p className="text-slate-600">
                  This announcement is displayed prominently at the top of the Guest Portal for all authenticated resident guests.
                </p>
                <textarea
                  rows={3}
                  value={adminBroadcastInput}
                  onChange={(e) => setAdminBroadcastInput(e.target.value)}
                  placeholder="e.g. Sunset champagne cruise departs today at 17:30 from the private jetty. Complimentary oysters served."
                  className="w-full p-3 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setBroadcastNotice(adminBroadcastInput);
                      try {
                        localStorage.setItem('tok_portal_admin_broadcast_v1', adminBroadcastInput);
                      } catch (e) {}
                      setPortalAdminNotice('✓ Broadcast announcement updated live in Guest Portal.');
                      setIsAdminPanelOpen(false);
                    }}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs"
                  >
                    Broadcast to All Guests
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBroadcastNotice('');
                      try {
                        localStorage.removeItem('tok_portal_admin_broadcast_v1');
                      } catch (e) {}
                      setAdminBroadcastInput('');
                      setPortalAdminNotice('Broadcast notice cleared.');
                      setIsAdminPanelOpen(false);
                    }}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                  >
                    Clear Bulletin
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAdminPanelOpen(false)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
              >
                Close Admin Panel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SHARE / EMAIL STAY PASS TO GUEST MODAL */}
      {isEmailPassModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                  <Mail className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Email Stay Pass & Access PIN</h3>
                  <p className="text-[11px] text-slate-500">Dispatch guest credentials to email address</p>
                </div>
              </div>
              <button onClick={() => setIsEmailPassModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Recipient Guest Email:</label>
                <input
                  type="email"
                  value={emailToInput}
                  onChange={(e) => setEmailToInput(e.target.value)}
                  placeholder="guest@example.com"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-[11px] text-slate-600">
                <strong className="text-slate-800 block">Content Summary Included:</strong>
                <div>• Reservation Reference: {currentReservation.reservationNumber}</div>
                <div>• Suite Allocation: {currentReservation.roomAllocation} (Room {currentReservation.roomNumber})</div>
                <div>• Digital Door PIN: {roomPinCode}</div>
                <div>• High-Speed Wi-Fi SSID & Password</div>
                <div>• Directions & Estate Policies</div>
              </div>

              {emailPassSentSuccess && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-bold flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Stay dossier emailed successfully to {emailToInput}!
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEmailPassModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmailPassSentSuccess(true);
                    setTimeout(() => {
                      setEmailPassSentSuccess(false);
                      setIsEmailPassModalOpen(false);
                    }, 2000);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" /> Send Stay Dossier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SCAN / UPLOAD PASSPORT OR ID MODAL */}
      {isScanIdModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-purple-100 text-purple-700 rounded-xl">
                  <Scan className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Scan / Upload Guest Identity Document</h3>
                  <p className="text-[11px] text-slate-500">Attach Passport, South African ID, or Driver's License</p>
                </div>
              </div>
              <button onClick={() => setIsScanIdModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <input
                type="file"
                ref={idFileInputRef}
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const preview = URL.createObjectURL(file);
                    setUploadedIdDoc({
                      name: file.name,
                      url: preview,
                      docType: 'Passport / National ID'
                    });
                    setIdScanVerified(true);
                  }
                }}
              />

              <div 
                onClick={() => idFileInputRef.current?.click()}
                className="p-6 border-2 border-dashed border-slate-300 hover:border-purple-500 rounded-2xl text-center cursor-pointer bg-slate-50 hover:bg-purple-50/40 transition space-y-2"
              >
                <Upload className="w-8 h-8 text-purple-600 mx-auto" />
                <div>
                  <strong className="text-slate-800 block">Click to Upload or Scan Identity Card</strong>
                  <span className="text-[11px] text-slate-500">Supports JPG, PNG, WEBP, or scanned PDF</span>
                </div>
              </div>

              {uploadedIdDoc && (
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 truncate">
                    <img src={uploadedIdDoc.url} alt="ID Document" className="w-10 h-10 object-cover rounded-lg border border-purple-300 shrink-0" />
                    <div className="truncate">
                      <strong className="text-purple-900 block truncate">{uploadedIdDoc.name}</strong>
                      <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Encrypted & Verified for Stay
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setUploadedIdDoc(null)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    ✕
                  </button>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsScanIdModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsScanIdModalOpen(false);
                    setPortalAdminNotice('✓ Identity document attached to guest file.');
                  }}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-xs"
                >
                  Confirm & Attach
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WHATSAPP STAY PASS & ACCESS CREDENTIALS MODAL */}
      {isWhatsAppPassModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-[#25D366]/20 text-slate-950 rounded-xl">
                  <WhatsAppIcon className="w-5 h-5 text-emerald-600" />
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Send Stay Pass via WhatsApp</h3>
                  <p className="text-[11px] text-slate-500">Dispatch door PIN, Wi-Fi, and booking credentials</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setIsWhatsAppPassModalOpen(false);
                  setWhatsAppNotice(null);
                }} 
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Recipient Mobile Number (e.g. Guest or Travel Partner):
                </label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    value={whatsAppRecipientPhone}
                    onChange={(e) => setWhatsAppRecipientPhone(e.target.value)}
                    placeholder="e.g. +27 82 555 4321"
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-[#25D366] outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setWhatsAppRecipientPhone(currentReservation.contactNumber || '')}
                    className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-semibold"
                  >
                    My Mobile
                  </button>
                </div>
              </div>

              {/* Message Preview Box */}
              <div>
                <span className="font-bold text-slate-700 block mb-1">WhatsApp Message Preview:</span>
                <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 font-mono text-[11px] text-slate-800 whitespace-pre-line max-h-48 overflow-y-auto leading-relaxed">
                  {getStayPassWhatsAppText(currentReservation)}
                </div>
              </div>

              {whatsAppNotice && (
                <div className="p-2.5 bg-emerald-100 text-emerald-900 rounded-xl font-bold text-xs flex items-center gap-1.5 animate-fade-in">
                  <Check className="w-4 h-4 text-emerald-700" />
                  {whatsAppNotice}
                </div>
              )}

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(getStayPassWhatsAppText(currentReservation));
                    setWhatsAppNotice('WhatsApp message text copied to clipboard!');
                    setTimeout(() => setWhatsAppNotice(null), 3000);
                  }}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy Text
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsWhatsAppPassModalOpen(false);
                      setWhatsAppNotice(null);
                    }}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleOpenWhatsAppStayPass(whatsAppRecipientPhone);
                      setWhatsAppNotice('Opened WhatsApp with stay pass!');
                    }}
                    className="px-4 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
                  >
                    <WhatsAppIcon className="w-4 h-4 text-slate-950" />
                    Open in WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FLOATING WHATSAPP CONCIERGE BUTTON & INTERACTIVE LAUNCHER                 */}
      {/* ========================================================================= */}
      <div className="fixed bottom-6 right-6 z-40 no-print flex flex-col items-end">
        {/* Expanded Launcher Drawer */}
        {isWhatsAppFabOpen && (
          <div className="mb-3 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-fade-in text-slate-900">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-[#25D366] text-slate-950 flex items-center justify-center font-bold">
                    <WhatsAppIcon className="w-5 h-5" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full"></span>
                </div>
                <div>
                  <h4 className="font-serif-luxury font-bold text-sm leading-tight">Knysna Concierge WhatsApp</h4>
                  <p className="text-[10px] text-emerald-300">Eleanor Sterling • Typically replies in 5 min</p>
                </div>
              </div>
              <button
                onClick={() => setIsWhatsAppFabOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-full transition text-xs"
              >
                ✕
              </button>
            </div>

            {/* Quick Actions List */}
            <div className="p-3.5 space-y-2 text-xs bg-slate-50 max-h-80 overflow-y-auto">
              <p className="text-[11px] text-slate-500 px-1">
                Staying in <strong>Suite {currentReservation.roomNumber}</strong> ({currentReservation.customerName}). Select a topic to launch WhatsApp:
              </p>

              <button
                onClick={() => {
                  handleChatWithManagerWhatsApp('Hi Eleanor, I have a general inquiry regarding our stay at Tides of Knysna.');
                  setIsWhatsAppFabOpen(false);
                }}
                className="w-full text-left p-2.5 bg-white hover:bg-emerald-50 rounded-xl border border-slate-200 hover:border-emerald-300 transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">💬</span>
                  <div>
                    <strong className="block text-slate-800 group-hover:text-emerald-800">Direct Chat with Butler</strong>
                    <span className="text-[10px] text-slate-500">24/7 dedicated guest communication</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
              </button>

              <button
                onClick={() => {
                  handleChatWithManagerWhatsApp(`Hi Eleanor, I need assistance with our Suite ${currentReservation.roomNumber} door PIN or Wi-Fi credentials.`);
                  setIsWhatsAppFabOpen(false);
                }}
                className="w-full text-left p-2.5 bg-white hover:bg-emerald-50 rounded-xl border border-slate-200 hover:border-emerald-300 transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">🔑</span>
                  <div>
                    <strong className="block text-slate-800 group-hover:text-emerald-800">Keypad PIN & Wi-Fi Help</strong>
                    <span className="text-[10px] text-slate-500">Touchless BLE & door code support</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
              </button>

              <button
                onClick={() => {
                  handleChatWithManagerWhatsApp(`Hi Eleanor, please arrange suite amenities / fresh towels / champagne for Suite ${currentReservation.roomNumber}.`);
                  setIsWhatsAppFabOpen(false);
                }}
                className="w-full text-left p-2.5 bg-white hover:bg-emerald-50 rounded-xl border border-slate-200 hover:border-emerald-300 transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">🛎️</span>
                  <div>
                    <strong className="block text-slate-800 group-hover:text-emerald-800">Room Turndown & Amenities</strong>
                    <span className="text-[10px] text-slate-500">Housekeeping and beverage service</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
              </button>

              <button
                onClick={() => {
                  handleChatWithManagerWhatsApp(`Hi Eleanor, we would like to book an airport shuttle or dinner transfer for Suite ${currentReservation.roomNumber}.`);
                  setIsWhatsAppFabOpen(false);
                }}
                className="w-full text-left p-2.5 bg-white hover:bg-emerald-50 rounded-xl border border-slate-200 hover:border-emerald-300 transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">🚗</span>
                  <div>
                    <strong className="block text-slate-800 group-hover:text-emerald-800">Airport & Dinner Transfers</strong>
                    <span className="text-[10px] text-slate-500">Mercedes-Benz V-Class shuttle booking</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
              </button>

              <button
                onClick={() => {
                  handleChatWithManagerWhatsApp(`Hi Eleanor, could we please inquire about late check-out availability for Suite ${currentReservation.roomNumber}?`);
                  setIsWhatsAppFabOpen(false);
                }}
                className="w-full text-left p-2.5 bg-white hover:bg-emerald-50 rounded-xl border border-slate-200 hover:border-emerald-300 transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">⏰</span>
                  <div>
                    <strong className="block text-slate-800 group-hover:text-emerald-800">Late Check-Out Inquiry</strong>
                    <span className="text-[10px] text-slate-500">Extend your lagoon vista stay</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
              </button>
            </div>

            {/* Footer with stay pass button */}
            <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => {
                  handleOpenWhatsAppStayPass();
                  setIsWhatsAppFabOpen(false);
                }}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366]" />
                Share Complete Stay Pass
              </button>
              <span className="text-[10px] font-mono text-slate-400">
                {dutyManagerPhone}
              </span>
            </div>
          </div>
        )}

        {/* The Main Round WhatsApp Trigger */}
        <button
          id="guest-portal-whatsapp-fab"
          onClick={() => setIsWhatsAppFabOpen(!isWhatsAppFabOpen)}
          className="relative group p-4 bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 rounded-full shadow-2xl flex items-center gap-2.5 transition-transform duration-200 hover:scale-105 active:scale-95"
          title="Open WhatsApp Concierge Hub"
        >
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-600 border-2 border-white"></span>
          </span>
          <WhatsAppIcon className="w-6 h-6 text-slate-950" />
          <span className="hidden sm:inline font-bold text-xs pr-1">
            WhatsApp Concierge
          </span>
        </button>
      </div>
    </div>
  );
};
