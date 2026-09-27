// Performance summary data for Executive HR & Operations Widget

export interface MonthlySalesRecord {
  month: string;
  shortMonth: string;
  targetZar: number;
  actualZar: number;
  priorYearZar: number;
  growthPct: number;
  roomsZar: number;
  diningZar: number;
  toursZar: number;
  spaZar: number;
}

export interface GuestSatisfactionMetric {
  department: string;
  category: string;
  rating: number; // 0 to 5.0
  target: number; // usually 4.8
  benchmark: number;
  reviewsCount: number;
  positivePct: number;
}

export interface OperationalEfficiencyRecord {
  metric: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  status: 'superior' | 'optimal' | 'warning';
  trend: 'improving' | 'stable' | 'needs-attention';
  description: string;
}

export interface MonthlyEfficiencyTrend {
  month: string;
  efficiencyIndex: number; // percentage
  roomTurnaroundMins: number;
  slaResolutionPct: number;
  inspectionPassPct: number;
}

export const MONTHLY_SALES_SUMMARY: MonthlySalesRecord[] = [
  {
    month: 'Apr 2026',
    shortMonth: 'Apr',
    targetZar: 170000,
    actualZar: 182500,
    priorYearZar: 155000,
    growthPct: 17.7,
    roomsZar: 125000,
    diningZar: 28000,
    toursZar: 18500,
    spaZar: 11000
  },
  {
    month: 'May 2026',
    shortMonth: 'May',
    targetZar: 185000,
    actualZar: 194200,
    priorYearZar: 168000,
    growthPct: 15.6,
    roomsZar: 132000,
    diningZar: 31200,
    toursZar: 19800,
    spaZar: 11200
  },
  {
    month: 'Jun 2026',
    shortMonth: 'Jun',
    targetZar: 200000,
    actualZar: 211800,
    priorYearZar: 179000,
    growthPct: 18.3,
    roomsZar: 145000,
    diningZar: 34500,
    toursZar: 20800,
    spaZar: 11500
  },
  {
    month: 'Jul 2026',
    shortMonth: 'Jul',
    targetZar: 225000,
    actualZar: 236400,
    priorYearZar: 202000,
    growthPct: 17.0,
    roomsZar: 160000,
    diningZar: 39400,
    toursZar: 24200,
    spaZar: 12800
  },
  {
    month: 'Aug 2026',
    shortMonth: 'Aug',
    targetZar: 250000,
    actualZar: 268900,
    priorYearZar: 224000,
    growthPct: 20.0,
    roomsZar: 182000,
    diningZar: 44200,
    toursZar: 28100,
    spaZar: 14600
  },
  {
    month: 'Sep 2026',
    shortMonth: 'Sep',
    targetZar: 275000,
    actualZar: 305000,
    priorYearZar: 248000,
    growthPct: 23.0,
    roomsZar: 206000,
    diningZar: 51200,
    toursZar: 31800,
    spaZar: 16000
  },
  {
    month: 'Oct 2026',
    shortMonth: 'Oct (Pacing)',
    targetZar: 300000,
    actualZar: 148000,
    priorYearZar: 270000,
    growthPct: 11.1,
    roomsZar: 98000,
    diningZar: 26000,
    toursZar: 16000,
    spaZar: 8000
  }
];

export const GUEST_SATISFACTION_METRICS: GuestSatisfactionMetric[] = [
  {
    department: 'Check-In & Arrival',
    category: 'Front Desk',
    rating: 4.96,
    target: 4.80,
    benchmark: 4.70,
    reviewsCount: 142,
    positivePct: 99.2
  },
  {
    department: 'Suite Cleanliness',
    category: 'Housekeeping',
    rating: 4.98,
    target: 4.85,
    benchmark: 4.75,
    reviewsCount: 142,
    positivePct: 99.6
  },
  {
    department: 'Lagoon Dining',
    category: 'Food & Beverage',
    rating: 4.92,
    target: 4.80,
    benchmark: 4.65,
    reviewsCount: 138,
    positivePct: 98.4
  },
  {
    department: 'Concierge & Excursions',
    category: 'Guest Services',
    rating: 4.95,
    target: 4.80,
    benchmark: 4.70,
    reviewsCount: 126,
    positivePct: 98.8
  },
  {
    department: 'Spa & Lagoon Deck',
    category: 'Wellness',
    rating: 4.88,
    target: 4.75,
    benchmark: 4.60,
    reviewsCount: 114,
    positivePct: 97.6
  },
  {
    department: 'Departure & Checkout',
    category: 'Front Desk',
    rating: 4.94,
    target: 4.80,
    benchmark: 4.68,
    reviewsCount: 139,
    positivePct: 99.0
  }
];

export const GUEST_SATISFACTION_TREND = [
  { month: 'Apr', csat: 4.86, nps: 82, reviews: 98 },
  { month: 'May', csat: 4.89, nps: 84, reviews: 104 },
  { month: 'Jun', csat: 4.91, nps: 85, reviews: 116 },
  { month: 'Jul', csat: 4.93, nps: 86, reviews: 128 },
  { month: 'Aug', csat: 4.94, nps: 87, reviews: 135 },
  { month: 'Sep', csat: 4.95, nps: 88, reviews: 142 }
];

export const OPERATIONAL_EFFICIENCY_METRICS: OperationalEfficiencyRecord[] = [
  {
    metric: 'Room Turnaround Speed',
    currentValue: 36,
    targetValue: 45,
    unit: 'mins',
    status: 'superior',
    trend: 'improving',
    description: 'Average full sanitize and turnover duration per luxury suite'
  },
  {
    metric: '5-Area Cleanliness Audit Pass',
    currentValue: 98.6,
    targetValue: 95.0,
    unit: '%',
    status: 'superior',
    trend: 'improving',
    description: 'First-time checklist compliance pass rate by supervisor'
  },
  {
    metric: 'Guest Request SLA Resolution',
    currentValue: 6.8,
    targetValue: 10.0,
    unit: 'mins',
    status: 'superior',
    trend: 'improving',
    description: 'Average time to fulfill concierge or room service amenity requests'
  },
  {
    metric: 'Preventive Facility Maintenance',
    currentValue: 98.2,
    targetValue: 95.0,
    unit: '%',
    status: 'optimal',
    trend: 'stable',
    description: 'HVAC, deck, pool filtration and generator audit completion'
  },
  {
    metric: 'Staff Shift Punctuality',
    currentValue: 99.4,
    targetValue: 98.0,
    unit: '%',
    status: 'superior',
    trend: 'stable',
    description: 'Clockcard on-time biometric verification across all staff'
  },
  {
    metric: 'Laundry & Linen Cycle Efficiency',
    currentValue: 96.1,
    targetValue: 92.0,
    unit: '%',
    status: 'optimal',
    trend: 'improving',
    description: 'Turnaround of 600TC Egyptian cotton percale within 12h SLA'
  }
];

export const MONTHLY_EFFICIENCY_TREND: MonthlyEfficiencyTrend[] = [
  { month: 'Apr', efficiencyIndex: 94.2, roomTurnaroundMins: 42, slaResolutionPct: 94.8, inspectionPassPct: 96.2 },
  { month: 'May', efficiencyIndex: 95.1, roomTurnaroundMins: 40, slaResolutionPct: 95.5, inspectionPassPct: 96.8 },
  { month: 'Jun', efficiencyIndex: 95.8, roomTurnaroundMins: 39, slaResolutionPct: 96.2, inspectionPassPct: 97.4 },
  { month: 'Jul', efficiencyIndex: 96.5, roomTurnaroundMins: 38, slaResolutionPct: 97.0, inspectionPassPct: 98.0 },
  { month: 'Aug', efficiencyIndex: 97.0, roomTurnaroundMins: 37, slaResolutionPct: 97.8, inspectionPassPct: 98.2 },
  { month: 'Sep', efficiencyIndex: 97.8, roomTurnaroundMins: 36, slaResolutionPct: 98.5, inspectionPassPct: 98.6 }
];
