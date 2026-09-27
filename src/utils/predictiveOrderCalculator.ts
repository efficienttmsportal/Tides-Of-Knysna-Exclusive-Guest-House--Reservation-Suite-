import { InventoryItem } from '../types';

export interface PredictiveOrderAnalysis {
  item: InventoryItem;
  dailyBurnRate: number; // units consumed per day
  leadTimeDays: number; // supplier delivery lead time in days
  safetyBufferUnits: number; // reorder threshold
  currentStock: number;
  daysUntilReorderThreshold: number; // days until stock drops to safety buffer
  daysUntilZeroStock: number; // days until completely depleted
  suggestedOrderDate: string; // ISO format 'YYYY-MM-DD'
  suggestedOrderDateFormatted: string; // e.g. '26 Sep 2026'
  stockoutDate: string; // ISO format 'YYYY-MM-DD'
  daysUntilOrder: number; // days from base date
  urgency: 'overdue' | 'immediate' | 'urgent' | 'upcoming' | 'healthy';
  urgencyLabel: string;
  recommendedOrderQty: number; // units recommended to order
  deficitUnits: number; // how many units below reorder point (0 if adequate)
  dailyDepletionPoints: {
    day: number;
    date: string;
    stockOnHand: number;
    safetyThreshold: number;
    isOrderDay?: boolean;
    isArrivalDay?: boolean;
    isStockout?: boolean;
  }[];
}

// Supplier lead time heuristic lookup
export const getSupplierLeadTime = (supplierName: string): number => {
  const s = supplierName.toLowerCase();
  if (s.includes('wine') || s.includes('cellar')) return 1; // 1-day local delivery
  if (s.includes('botanical') || s.includes('toiletries') || s.includes('clean')) return 2; // 2-day delivery
  if (s.includes('linen') || s.includes('textile') || s.includes('mill')) return 3; // 3-day delivery
  if (s.includes('timber') || s.includes('maritime') || s.includes('hardware')) return 4; // 4-day delivery
  return 3; // default 3 days
};

// Calculate default daily burn rate based on historical usage and seasonal occupancy
export const getDailyBurnRate = (item: InventoryItem, occupancyRate: number = 85): number => {
  if (item.dailyConsumptionRate && item.dailyConsumptionRate > 0) {
    return Number((item.dailyConsumptionRate * (occupancyRate / 85)).toFixed(2));
  }
  
  // Heuristic based on howManyUsed (assuming a 30-day operational rolling cycle)
  const baseRate = item.howManyUsed > 0 ? item.howManyUsed / 30 : Math.max(0.3, item.whenToReorder * 0.05);
  // Scale with current occupancy
  const scaledRate = baseRate * (occupancyRate / 85);
  return Math.max(0.1, Number(scaledRate.toFixed(2)));
};

// Main predictive calculation function
export const calculateOrderDate = (
  item: InventoryItem,
  options?: {
    occupancyRate?: number;
    customBurnRate?: number;
    customLeadTimeDays?: number;
    baseDate?: Date;
  }
): PredictiveOrderAnalysis => {
  const baseDate = options?.baseDate || new Date('2026-09-26T00:00:00');
  const occupancy = options?.occupancyRate !== undefined ? options.occupancyRate : 85;
  const burnRate = options?.customBurnRate !== undefined
    ? Math.max(0.1, options.customBurnRate)
    : getDailyBurnRate(item, occupancy);
  const leadTime = options?.customLeadTimeDays !== undefined
    ? Math.max(1, options.customLeadTimeDays)
    : (item.leadTimeDays || getSupplierLeadTime(item.supplier));

  const currentStock = item.howManyOnHand;
  const safetyBuffer = item.whenToReorder;
  const isBelowThreshold = currentStock <= safetyBuffer;
  const deficitUnits = isBelowThreshold ? safetyBuffer - currentStock : 0;

  // Days until reaching safety threshold
  const daysUntilSafety = burnRate > 0 ? (currentStock - safetyBuffer) / burnRate : 999;
  
  // Days until zero stock
  const daysUntilZero = burnRate > 0 ? Math.floor(currentStock / burnRate) : 999;

  // Calculate days until recommended order date
  // Order must arrive BEFORE or AT the safety buffer:
  // Order date = Safety Buffer date - Lead time
  let daysUntilOrder = 0;
  if (isBelowThreshold) {
    daysUntilOrder = 0; // Immediate!
  } else {
    daysUntilOrder = Math.max(0, Math.floor(daysUntilSafety - leadTime));
  }

  // Determine urgency level
  let urgency: 'overdue' | 'immediate' | 'urgent' | 'upcoming' | 'healthy' = 'healthy';
  let urgencyLabel = 'Adequate Runway';

  if (currentStock <= Math.floor(safetyBuffer / 2)) {
    urgency = 'overdue';
    urgencyLabel = 'Critical Stockout Risk';
  } else if (isBelowThreshold || daysUntilOrder === 0) {
    urgency = 'immediate';
    urgencyLabel = 'Reorder Now';
  } else if (daysUntilOrder <= 5) {
    urgency = 'urgent';
    urgencyLabel = 'Order Within 5 Days';
  } else if (daysUntilOrder <= 14) {
    urgency = 'upcoming';
    urgencyLabel = 'Order Soon (1-2 Weeks)';
  } else {
    urgency = 'healthy';
    urgencyLabel = 'Safe Buffer (> 2 Weeks)';
  }

  // Format dates
  const suggestedOrderDateObj = new Date(baseDate.getTime() + daysUntilOrder * 86400000);
  const stockoutDateObj = new Date(baseDate.getTime() + daysUntilZero * 86400000);

  const suggestedOrderDate = suggestedOrderDateObj.toISOString().split('T')[0];
  const stockoutDate = stockoutDateObj.toISOString().split('T')[0];

  const suggestedOrderDateFormatted = suggestedOrderDateObj.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  // Recommended order batch quantity: Restock to 45-day operational buffer above safety point
  const targetBufferDays = 45;
  const idealHolding = Math.ceil(burnRate * targetBufferDays) + safetyBuffer;
  const recommendedOrderQty = Math.max(5, idealHolding - currentStock);

  // Generate 30-day depletion timeline for visual chart
  const dailyDepletionPoints = [];
  const totalDaysToProject = Math.min(45, Math.max(25, daysUntilZero + 5));

  for (let d = 0; d <= totalDaysToProject; d++) {
    const pointDateObj = new Date(baseDate.getTime() + d * 86400000);
    const dayStock = Math.max(0, Number((currentStock - d * burnRate).toFixed(1)));
    
    dailyDepletionPoints.push({
      day: d,
      date: pointDateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      stockOnHand: dayStock,
      safetyThreshold: safetyBuffer,
      isOrderDay: d === daysUntilOrder,
      isArrivalDay: d === daysUntilOrder + leadTime,
      isStockout: dayStock === 0
    });
  }

  return {
    item,
    dailyBurnRate: burnRate,
    leadTimeDays: leadTime,
    safetyBufferUnits: safetyBuffer,
    currentStock,
    daysUntilReorderThreshold: Number(daysUntilSafety.toFixed(1)),
    daysUntilZeroStock: daysUntilZero,
    suggestedOrderDate,
    suggestedOrderDateFormatted,
    stockoutDate,
    daysUntilOrder,
    urgency,
    urgencyLabel,
    recommendedOrderQty,
    deficitUnits,
    dailyDepletionPoints
  };
};

// Batch compute order dates for entire catalog
export const calculateCatalogOrderDates = (
  items: InventoryItem[],
  occupancyRate: number = 85
): PredictiveOrderAnalysis[] => {
  return items.map(item => calculateOrderDate(item, { occupancyRate })).sort((a, b) => a.daysUntilOrder - b.daysUntilOrder);
};
