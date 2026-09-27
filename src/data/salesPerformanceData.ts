import { StaffSalesPerformance, SalesDealRecord, MonthlySalesTargetPlan } from '../types';

export const INITIAL_MONTHLY_TARGETS: MonthlySalesTargetPlan[] = [
  { month: 'Apr 2026', targetZar: 170000, actualZar: 182500, priorYearZar: 155000 },
  { month: 'May 2026', targetZar: 185000, actualZar: 194200, priorYearZar: 168000 },
  { month: 'Jun 2026', targetZar: 200000, actualZar: 211800, priorYearZar: 179000 },
  { month: 'Jul 2026', targetZar: 225000, actualZar: 236400, priorYearZar: 202000 },
  { month: 'Aug 2026', targetZar: 250000, actualZar: 268900, priorYearZar: 224000 },
  { month: 'Sep 2026', targetZar: 275000, actualZar: 305000, priorYearZar: 248000 },
  { month: 'Oct 2026', targetZar: 300000, actualZar: 148000, priorYearZar: 270000 }, // In progress
  { month: 'Nov 2026', targetZar: 340000, actualZar: 0, priorYearZar: 310000 },
  { month: 'Dec 2026', targetZar: 420000, actualZar: 0, priorYearZar: 385000 },
];

export const INITIAL_WEEKLY_PROGRESS = [
  { week: 'Week 1 (1-7)', targetZar: 68750, actualZar: 78500, cumulativeTarget: 68750, cumulativeActual: 78500 },
  { week: 'Week 2 (8-14)', targetZar: 68750, actualZar: 76200, cumulativeTarget: 137500, cumulativeActual: 154700 },
  { week: 'Week 3 (15-21)', targetZar: 68750, actualZar: 81400, cumulativeTarget: 206250, cumulativeActual: 236100 },
  { week: 'Week 4 (22-28)', targetZar: 55000, actualZar: 52900, cumulativeTarget: 261250, cumulativeActual: 289000 },
  { week: 'Final Days (29-30)', targetZar: 13750, actualZar: 16000, cumulativeTarget: 275000, cumulativeActual: 305000 },
];

export const INITIAL_STAFF_PERFORMANCE: StaffSalesPerformance[] = [
  {
    staffId: 'emp-001',
    staffName: 'Eleanor Sterling',
    role: 'Hospitality Supervisor',
    avatarInitials: 'ES',
    monthlyTarget: 95000,
    actualSales: 112400,
    bookingsCount: 14,
    upsellCount: 9,
    conversionRate: 84,
    csatRating: 4.95,
    commissionRate: 0.05,
    commissionEarned: 5620,
    categoryBreakdown: {
      roomBookings: 84000,
      diningAndWine: 11200,
      excursionsAndTours: 9800,
      spaAndWellness: 7400,
    }
  },
  {
    staffId: 'emp-003',
    staffName: 'Francois Joubert',
    role: 'Culinary Host & Chef',
    avatarInitials: 'FJ',
    monthlyTarget: 60000,
    actualSales: 68500,
    bookingsCount: 8,
    upsellCount: 16,
    conversionRate: 88,
    csatRating: 4.90,
    commissionRate: 0.06,
    commissionEarned: 4110,
    categoryBreakdown: {
      roomBookings: 12000,
      diningAndWine: 48500,
      excursionsAndTours: 3500,
      spaAndWellness: 4500,
    }
  },
  {
    staffId: 'emp-005',
    staffName: 'Jabu Nkosi',
    role: 'VIP Transfers & Excursions',
    avatarInitials: 'JN',
    monthlyTarget: 50000,
    actualSales: 54800,
    bookingsCount: 11,
    upsellCount: 12,
    conversionRate: 79,
    csatRating: 4.88,
    commissionRate: 0.07,
    commissionEarned: 3836,
    categoryBreakdown: {
      roomBookings: 0,
      diningAndWine: 4200,
      excursionsAndTours: 47600,
      spaAndWellness: 3000,
    }
  },
  {
    staffId: 'emp-004',
    staffName: 'Kobus Van Der Merwe',
    role: 'Estate & Outdoor Recreation',
    avatarInitials: 'KM',
    monthlyTarget: 45000,
    actualSales: 41200,
    bookingsCount: 7,
    upsellCount: 8,
    conversionRate: 72,
    csatRating: 4.82,
    commissionRate: 0.05,
    commissionEarned: 2060,
    categoryBreakdown: {
      roomBookings: 6000,
      diningAndWine: 3200,
      excursionsAndTours: 29800,
      spaAndWellness: 2200,
    }
  },
  {
    staffId: 'emp-002',
    staffName: 'Miriam Zulu',
    role: 'Housekeeping & Amenities Lead',
    avatarInitials: 'MZ',
    monthlyTarget: 25000,
    actualSales: 28100,
    bookingsCount: 5,
    upsellCount: 14,
    conversionRate: 86,
    csatRating: 4.98,
    commissionRate: 0.06,
    commissionEarned: 1686,
    categoryBreakdown: {
      roomBookings: 0,
      diningAndWine: 4100,
      excursionsAndTours: 2500,
      spaAndWellness: 21500,
    }
  }
];

export const INITIAL_SALES_DEALS: SalesDealRecord[] = [
  {
    id: 'deal-001',
    staffId: 'emp-001',
    staffName: 'Eleanor Sterling',
    guestName: 'Julian Vanderbilt (UK)',
    date: '2026-09-18',
    serviceCategory: 'Room Booking',
    amountZar: 26000,
    commissionZar: 1300,
    referenceNumber: 'TOK-2026-0891',
    status: 'Confirmed'
  },
  {
    id: 'deal-002',
    staffId: 'emp-003',
    staffName: 'Francois Joubert',
    guestName: 'Julian Vanderbilt (UK)',
    date: '2026-09-19',
    serviceCategory: 'Dining & Wine Experience',
    amountZar: 3850,
    commissionZar: 231,
    referenceNumber: 'DIN-0919-01',
    status: 'Completed'
  },
  {
    id: 'deal-003',
    staffId: 'emp-005',
    staffName: 'Jabu Nkosi',
    guestName: 'Julian Vanderbilt (UK)',
    date: '2026-09-20',
    serviceCategory: 'Excursions & Catamaran',
    amountZar: 2200,
    commissionZar: 154,
    referenceNumber: 'TRF-0920-01',
    status: 'Confirmed'
  },
  {
    id: 'deal-004',
    staffId: 'emp-001',
    staffName: 'Eleanor Sterling',
    guestName: 'Dr. Anelisa Dlamini',
    date: '2026-09-19',
    serviceCategory: 'Room Booking',
    amountZar: 8550,
    commissionZar: 427.5,
    referenceNumber: 'TOK-2026-0892',
    status: 'Confirmed'
  },
  {
    id: 'deal-005',
    staffId: 'emp-004',
    staffName: 'Kobus Van Der Merwe',
    guestName: 'Dr. Anelisa Dlamini',
    date: '2026-09-21',
    serviceCategory: 'Excursions & Catamaran',
    amountZar: 1800,
    commissionZar: 90,
    referenceNumber: 'EXC-0921-02',
    status: 'Confirmed'
  },
  {
    id: 'deal-006',
    staffId: 'emp-001',
    staffName: 'Eleanor Sterling',
    guestName: 'Jean-Pierre Laurent (FR)',
    date: '2026-09-21',
    serviceCategory: 'Room Booking',
    amountZar: 27600,
    commissionZar: 1380,
    referenceNumber: 'TOK-2026-0893',
    status: 'Confirmed'
  },
  {
    id: 'deal-007',
    staffId: 'emp-003',
    staffName: 'Francois Joubert',
    guestName: 'Jean-Pierre Laurent (FR)',
    date: '2026-09-22',
    serviceCategory: 'Dining & Wine Experience',
    amountZar: 7500,
    commissionZar: 450,
    referenceNumber: 'DIN-0922-03',
    status: 'Confirmed'
  },
  {
    id: 'deal-008',
    staffId: 'emp-005',
    staffName: 'Jabu Nkosi',
    guestName: 'Jean-Pierre Laurent (FR)',
    date: '2026-09-22',
    serviceCategory: 'Excursions & Catamaran',
    amountZar: 14500,
    commissionZar: 1015,
    referenceNumber: 'HEL-0922-01',
    status: 'Confirmed'
  },
  {
    id: 'deal-009',
    staffId: 'emp-002',
    staffName: 'Miriam Zulu',
    guestName: 'Jean-Pierre Laurent (FR)',
    date: '2026-09-22',
    serviceCategory: 'Spa & Wellness Package',
    amountZar: 2400,
    commissionZar: 144,
    referenceNumber: 'SPA-0922-01',
    status: 'Confirmed'
  },
  {
    id: 'deal-010',
    staffId: 'emp-005',
    staffName: 'Jabu Nkosi',
    guestName: 'Lady Genevieve Somerset',
    date: '2026-09-21',
    serviceCategory: 'Excursions & Catamaran',
    amountZar: 6800,
    commissionZar: 476,
    referenceNumber: 'CAT-0921-04',
    status: 'Completed'
  },
  {
    id: 'deal-011',
    staffId: 'emp-004',
    staffName: 'Kobus Van Der Merwe',
    guestName: 'Marcus De Villiers',
    date: '2026-09-20',
    serviceCategory: 'Excursions & Catamaran',
    amountZar: 3200,
    commissionZar: 160,
    referenceNumber: 'KAY-0920-03',
    status: 'Completed'
  },
  {
    id: 'deal-012',
    staffId: 'emp-002',
    staffName: 'Miriam Zulu',
    guestName: 'Sophia Lindqvist',
    date: '2026-09-21',
    serviceCategory: 'Spa & Wellness Package',
    amountZar: 3900,
    commissionZar: 234,
    referenceNumber: 'SPA-0921-02',
    status: 'Completed'
  }
];
