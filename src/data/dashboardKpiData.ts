// Operational KPI Data for DashboardView Recharts Summary Widgets

export interface MonthlyKpiRecord {
  month: string;
  shortMonth: string;
  salesZar: number;
  salesTargetZar: number;
  priorYearZar: number;
  growthYoY: number; // percentage
  occupancyPct: number; // percentage
  occupancyTargetPct: number; // 85% luxury benchmark
  adrZar: number; // Average Daily Rate in ZAR
  revParZar: number; // Revenue Per Available Room in ZAR
  occupiedNights: number;
  availableNights: number;
  roomSales: number;
  experienceSales: number;
}

export interface WeeklyKpiRecord {
  week: string;
  shortWeek: string;
  salesZar: number;
  occupancyPct: number;
  adrZar: number;
  revParZar: number;
  checkIns: number;
}

export const MONTHLY_KPI_DATA: MonthlyKpiRecord[] = [
  {
    month: 'April 2026',
    shortMonth: 'Apr',
    salesZar: 182500,
    salesTargetZar: 170000,
    priorYearZar: 155000,
    growthYoY: 17.7,
    occupancyPct: 73.5,
    occupancyTargetPct: 85.0,
    adrZar: 4120,
    revParZar: 3028,
    occupiedNights: 132,
    availableNights: 180,
    roomSales: 135000,
    experienceSales: 47500
  },
  {
    month: 'May 2026',
    shortMonth: 'May',
    salesZar: 194200,
    salesTargetZar: 185000,
    priorYearZar: 168000,
    growthYoY: 15.6,
    occupancyPct: 76.2,
    occupancyTargetPct: 85.0,
    adrZar: 4250,
    revParZar: 3238,
    occupiedNights: 142,
    availableNights: 186,
    roomSales: 142000,
    experienceSales: 52200
  },
  {
    month: 'June 2026',
    shortMonth: 'Jun',
    salesZar: 211800,
    salesTargetZar: 200000,
    priorYearZar: 179000,
    growthYoY: 18.3,
    occupancyPct: 81.0,
    occupancyTargetPct: 85.0,
    adrZar: 4460,
    revParZar: 3612,
    occupiedNights: 146,
    availableNights: 180,
    roomSales: 154000,
    experienceSales: 57800
  },
  {
    month: 'July 2026',
    shortMonth: 'Jul',
    salesZar: 236400,
    salesTargetZar: 225000,
    priorYearZar: 202000,
    growthYoY: 17.0,
    occupancyPct: 86.5,
    occupancyTargetPct: 85.0,
    adrZar: 4720,
    revParZar: 4082,
    occupiedNights: 161,
    availableNights: 186,
    roomSales: 172000,
    experienceSales: 64400
  },
  {
    month: 'August 2026',
    shortMonth: 'Aug',
    salesZar: 268900,
    salesTargetZar: 250000,
    priorYearZar: 224000,
    growthYoY: 20.0,
    occupancyPct: 88.9,
    occupancyTargetPct: 85.0,
    adrZar: 4940,
    revParZar: 4391,
    occupiedNights: 165,
    availableNights: 186,
    roomSales: 195000,
    experienceSales: 73900
  },
  {
    month: 'September 2026',
    shortMonth: 'Sep (Current)',
    salesZar: 305000,
    salesTargetZar: 275000,
    priorYearZar: 248000,
    growthYoY: 23.0,
    occupancyPct: 91.7,
    occupancyTargetPct: 85.0,
    adrZar: 5120,
    revParZar: 4695,
    occupiedNights: 165,
    availableNights: 180,
    roomSales: 222000,
    experienceSales: 83000
  },
  {
    month: 'October 2026',
    shortMonth: 'Oct (Pacing)',
    salesZar: 328000,
    salesTargetZar: 300000,
    priorYearZar: 270000,
    growthYoY: 21.5,
    occupancyPct: 93.5,
    occupancyTargetPct: 85.0,
    adrZar: 5300,
    revParZar: 4955,
    occupiedNights: 174,
    availableNights: 186,
    roomSales: 240000,
    experienceSales: 88000
  }
];

export const CURRENT_MONTH_WEEKLY_DATA: WeeklyKpiRecord[] = [
  {
    week: 'Week 1 (Sep 1 - 7)',
    shortWeek: 'W1',
    salesZar: 71200,
    occupancyPct: 88.1,
    adrZar: 4980,
    revParZar: 4387,
    checkIns: 18
  },
  {
    week: 'Week 2 (Sep 8 - 14)',
    shortWeek: 'W2',
    salesZar: 76500,
    occupancyPct: 90.5,
    adrZar: 5050,
    revParZar: 4570,
    checkIns: 22
  },
  {
    week: 'Week 3 (Sep 15 - 21)',
    shortWeek: 'W3',
    salesZar: 82300,
    occupancyPct: 92.9,
    adrZar: 5190,
    revParZar: 4821,
    checkIns: 25
  },
  {
    week: 'Week 4 (Sep 22 - 30)',
    shortWeek: 'W4 (Live)',
    salesZar: 75000,
    occupancyPct: 95.2,
    adrZar: 5260,
    revParZar: 5007,
    checkIns: 21
  }
];

export const SUITE_PERFORMANCE_BREAKDOWN = [
  { suite: '101 - Heads Panorama', adr: 5850, occupancy: 96.7, revenueZar: 62500 },
  { suite: '102 - Featherbed Lagoon', adr: 5400, occupancy: 93.3, revenueZar: 55400 },
  { suite: '103 - Outeniqua Forest', adr: 4950, occupancy: 90.0, revenueZar: 48900 },
  { suite: '104 - Knysna Quays Exec', adr: 4800, occupancy: 90.0, revenueZar: 47200 },
  { suite: '105 - Brenton Sunset', adr: 4600, occupancy: 86.7, revenueZar: 43800 },
  { suite: '106 - Belvidere Serenity', adr: 4400, occupancy: 83.3, revenueZar: 41200 }
];
