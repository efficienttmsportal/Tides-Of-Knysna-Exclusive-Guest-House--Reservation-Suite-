export type UserRole = 'admin' | 'guest' | 'staff';

export interface UserAccount {
  id: string;
  fullName: string;
  username: string;
  email: string;
  role: UserRole;
  securityQuestion1: string;
  securityAnswer1: string;
  securityQuestion2: string;
  securityAnswer2: string;
}

export type PaymentMethod = 'Credit Card' | 'EFT / Bank Transfer' | 'Cash' | 'PayPal' | 'Swift Wire Transfer' | 'Apple Pay';

export type PaymentStatus = 'Paid' | 'Deposit Paid' | 'Pending' | 'Overdue' | 'Refunded';

export interface DocumentAttachment {
  id: string;
  name: string;
  type: 'passport' | 'id_card' | 'proof_of_payment' | 'breakage_receipt' | 'other';
  dataUrl?: string;
  uploadedAt: string;
  fileSize?: string;
}

export interface Reservation {
  id: string;
  reservationNumber: string;
  customerName: string;
  customerSurname: string;
  email: string;
  contactNumber: string;
  idOrPassportNumber: string;
  roomNumber: string;
  roomAllocation: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  ratePerNightPerPerson: number;
  totalNights: number;
  totalRoomCost: number;
  breakageDepositAmount: number;
  breakageDepositStatus: 'Held' | 'Inspected & Cleared' | 'Deduction Pending' | 'Refunded';
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  salesPerson: string;
  ratingService: number; // 1-5 stars
  specialRequests: string;
  specialTravelRequirements: string;
  nearbySightseeingInterests: string[];
  documents: DocumentAttachment[];
  notes: string;
  createdAt: string;
}

export interface CheckInRecord {
  id: string;
  reservationId: string;
  guestName: string;
  roomNumber: string;
  arrivalDateTime: string;
  allocatedKeys: string;
  welcomeDrinksServed: boolean;
  passportVerified: boolean;
  registrationFormSigned: boolean;
  breakageDepositCollected: boolean;
  wifiCredentialsProvided: boolean;
  luggageHandledBy: string;
  emergencyContactNoted: string;
  dutyManager: string;
  status: 'Checked-In' | 'In Progress' | 'Delayed';
}

export interface DepartureRecord {
  id: string;
  reservationId: string;
  guestName: string;
  roomNumber: string;
  departureDateTime: string;
  keysReturned: boolean;
  roomInspectionDone: boolean;
  roomCondition: 'Excellent' | 'Minor Wear' | 'Damages Noted';
  damagesDescription?: string;
  breakageDepositRefundAmount: number;
  breakageDepositRefunded: boolean;
  minibarSettled: boolean;
  invoiceEmailedToGuest: boolean;
  guestFeedbackRating: number;
  feedbackComments: string;
  shuttleOrTaxiArranged: boolean;
  inspectingStaff: string;
}

export interface InventoryItem {
  id: string;
  itemCode: string;
  itemDescription: string;
  category: 'Linen & Bedding' | 'Toiletries & Amenities' | 'Kitchen & Dining' | 'Bar & Refreshments' | 'Cleaning Supplies' | 'Maintenance & Hardware' | string;
  pricePerUnit: number;
  howManyUsed: number;
  whenToReorder: number; // Threshold
  howManyOnHand: number;
  unit: string;
  supplier: string;
  lastRestocked: string;
  dailyConsumptionRate?: number;
  leadTimeDays?: number;
  predictedOrderDate?: string;
}

export interface StockAuditLogEntry {
  id: string;
  timestamp: string; // ISO string or human formatted date
  itemId: string;
  itemCode: string;
  itemDescription: string;
  previousQty: number;
  newQty: number;
  deltaQty: number;
  adjustedBy: string; // e.g. "Eleanor Sterling (Head of Ops)", "Duty Officer", "Staff (QR Scanner)"
  actionType: 'Manual Adjustment' | 'Batch Restock' | 'Batch Price Update' | 'QR Scan Adjustment' | 'Auto Threshold Restock' | 'Physical Stock Count' | 'Purchase Order Received';
  notes?: string;
}

export interface ChecklistItem {
  id: string;
  task: string;
  completed: boolean;
  notes?: string;
  checkedBy?: string;
}

export interface AreaChecklist {
  area: 'bathrooms' | 'bedrooms' | 'kitchen_dining' | 'outdoor' | 'elevator';
  title: string;
  supervisor: string;
  date: string;
  items: ChecklistItem[];
}

export interface AccountingDocument {
  id: string;
  documentType: 'Quote' | 'Purchase Order' | 'Invoice' | 'Sales Invoice' | 'Statement' | 'Statement with Payment Stub' | 'Credit Note' | 'Estimate';
  documentNumber: string;
  date: string;
  dueDate: string;
  clientOrSupplierName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  companyLogoUrl?: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    total: number;
  }[];
  subtotal: number;
  taxAmount: number;
  discount: number;
  grandTotal: number;
  amountPaid: number;
  balanceDue: number;
  paymentStubDetails?: {
    accountNumber: string;
    bankName: string;
    branchCode: string;
    reference: string;
  };
  notes: string;
  terms: string;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled';
}

export interface EmployeeContact {
  id: string;
  name: string;
  surname: string;
  idNumber: string;
  spouseNameAndSurname: string;
  spouseIdNumber: string;
  contactNumbers: string;
  physicalAddress: string;
  postalAddress: string;
  nextOfKinName: string;
  nextOfKinRelationship: string;
  nextOfKinContact: string;
  maritalStatus: 'Single' | 'Married' | 'Widowed' | 'Divorced';
  employmentRole: 'Office Staff' | 'Sub-Contractor' | 'Hospitality Supervisor' | 'Housekeeping' | 'Estate Maintenance';
  clockCardNo: string;
  dateJoined: string;
  email: string;
  status?: 'Active' | 'Former' | 'Terminated' | 'Resigned';
  terminationDate?: string;
}

export interface EmployeePayslip {
  id: string;
  slipNumber: string;
  clockCardNo: string;
  nameAndSurname: string;
  staffCategory: 'Office Staff' | 'Sub-Contractor';
  payPeriod: string;
  hoursWorked: number;
  hourlyRate: number;
  basicSalary: number;
  overtimeHours: number;
  overtimeRate: number;
  startTime: string;
  finishTime: string;
  allowances: number;
  deductionsUif: number;
  deductionsTax: number;
  deductionsOther: number;
  netPay: number;
  dateGenerated: string;
  status: 'Approved' | 'Paid' | 'Draft';
}

export interface EmployeeLetterOfAppointment {
  id: string;
  date: string;
  employeeName: string;
  employeeIdNumber: string;
  positionTitle: string;
  department: string;
  commencementDate: string;
  remuneration: string;
  workingHours: string;
  reportingTo: string;
  probationPeriod: string;
  authorizedSignatory: string;
  signedByEmployee: boolean;
}

export interface EmployeeLeaveForm {
  id: string;
  nameAndSurname: string;
  staffCategory: 'Office Staff' | 'Sub-Contractor';
  clockcardNo: string;
  leaveType: 'Annual Leave' | 'Sick Leave' | 'Maternity / Paternity' | 'Family Responsibility' | 'Study Leave' | 'Unpaid Leave';
  dateFrom: string;
  dateEnd: string;
  totalDays: number;
  reason: string;
  employeeSignatureDate: string;
  managerApproval: 'Pending' | 'Approved' | 'Declined';
  managerSignatureDate?: string;
}

export interface AttractionItem {
  id: string;
  category: 'Sightseeing' | 'Car Hire' | 'Ocean Tours' | 'Festivals' | 'Markets' | 'Eateries' | 'Wine Tasting' | 'Air Travel' | 'Emergency Services';
  name: string;
  region: 'Knysna' | 'Plettenberg Bay' | 'Port Elizabeth / Gqeberha' | 'Garden Route';
  description: string;
  contactNumber: string;
  alternativeContact?: string;
  email?: string;
  website: string;
  address: string;
  distanceFromGuestHouse: string;
  highlights: string[];
  isEmergency?: boolean;
}

export interface MarketingTemplate {
  id: string;
  title: string;
  platform: 'Instagram' | 'Facebook' | 'WhatsApp' | 'Special Promotion' | 'Letterhead' | 'Business Card' | 'Compliment Card' | 'Company Profile';
  category: string;
  headline: string;
  subheadline: string;
  bodyText: string;
  hashtags: string[];
  callToAction: string;
  validityDates: string;
  discountPercentage?: number;
  contactEmail: string;
  contactPhone: string;
  websiteUrl: string;
  backgroundImageStyle: string;
}

export interface SupplierContact {
  id: string;
  companyName: string;
  category: 'Linens & Laundry' | 'Amenities & Spa' | 'Food & Beverage' | 'Wine & Spirits' | 'Plumbing & Electrical' | 'Security & CCTV' | 'Pool & Gardens' | 'Transport & Shuttles' | 'Maintenance & Hardware' | string;
  contactPerson: string;
  telephone: string;
  email: string;
  accountNumber: string;
  terms: string;
  rating: number;
  address?: string;
  notes?: string;
  website?: string;
  leadTimeDays?: number;
}

export interface AddressBookContact {
  id: string;
  name: string;
  organization: string;
  category: 'VIP Guest' | 'Corporate Client' | 'Tour Operator' | 'Travel Agency' | 'Concierge Partner' | 'Local Artisan';
  phone: string;
  email: string;
  notes: string;
}

export interface MeetingItem {
  id: string;
  title: string;
  meetingDate: string;
  startTime: string;
  endTime: string;
  location: string;
  organizer: string;
  attendees: string;
  agenda: string;
  status: 'Scheduled' | 'Completed' | 'Postponed';
}

export interface MarketingSpecial {
  id: string;
  promoCode: string;
  discountPercent: number;
  title: string;
  validUntil: string;
  description: string;
  imageUrl?: string;
  season?: 'Spring' | 'Summer' | 'Autumn' | 'Winter' | 'All Seasons';
  hashtags?: string[];
  inclusions?: string[];
  targetAudience?: string;
}

export interface CompanyInfoData {
  name: string;
  tagline: string;
  subTagline: string;
  salesPerson: string;
  contactNumbers: string;
  telephone: string;
  mobile: string;
  email: string;
  adminEmail: string;
  webAddress: string;
  address: string;
  postalCode?: string;
  gpsCoordinates?: string;
  vatNumber?: string;
  checkInTime?: string;
  checkOutTime?: string;
  cancellationPolicy?: string;
  logoUrl?: string;
  brandingImageUrl?: string;
  letterheadHeaderUrl?: string;
  emailSignatureBannerUrl?: string;
  specialsImageUrl?: string;
  specialsBannerUrl?: string;
  guestHouseSpecialsImages?: string[];
  bankDetails: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    branchCode: string;
    swiftCode: string;
  };
  rooms: {
    number: string;
    name: string;
    type: string;
    capacity: number;
    defaultRate: number;
  }[];
}

export interface SocialTemplate {
  id: string;
  title: string;
  platform: string;
  caption: string;
  hashtags: string[];
}

export interface StaffSalesPerformance {
  staffId: string;
  staffName: string;
  role: string;
  avatarInitials: string;
  monthlyTarget: number;
  actualSales: number;
  bookingsCount: number;
  upsellCount: number;
  conversionRate: number;
  csatRating: number;
  commissionRate: number;
  commissionEarned: number;
  categoryBreakdown: {
    roomBookings: number;
    diningAndWine: number;
    excursionsAndTours: number;
    spaAndWellness: number;
  };
}

export interface SalesDealRecord {
  id: string;
  staffId: string;
  staffName: string;
  guestName: string;
  date: string;
  serviceCategory: 'Room Booking' | 'Dining & Wine Experience' | 'Excursions & Catamaran' | 'Spa & Wellness Package';
  amountZar: number;
  commissionZar: number;
  referenceNumber: string;
  status: 'Confirmed' | 'Completed' | 'Pending';
}

export interface MonthlySalesTargetPlan {
  month: string;
  targetZar: number;
  actualZar: number;
  priorYearZar: number;
}
