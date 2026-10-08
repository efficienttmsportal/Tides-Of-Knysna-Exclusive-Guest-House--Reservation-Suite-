import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { DashboardView } from './components/DashboardView';
import { ReservationsModule } from './components/ReservationsModule';
import { CheckInModule } from './components/CheckInModule';
import { DepartureModule } from './components/DepartureModule';
import { AccountingModule } from './components/AccountingModule';
import { MarketingModule } from './components/MarketingModule';
import { EmployeesModule } from './components/EmployeesModule';
import { SuppliersModule } from './components/SuppliersModule';
import { AttractionsModule } from './components/AttractionsModule';
import { DocumentActionBar } from './components/DocumentActionBar';
import { GuestPortal } from './components/GuestPortal';
import { CompanyInfoModule, CompanyInfoData } from './components/CompanyInfoModule';
import { GuestAddressBook } from './components/GuestAddressBook';
import { MeetingMinutesModule } from './components/MeetingMinutesModule';
import { InventoryNotificationSystem } from './components/InventoryNotificationSystem';
import { InventoryQrModal } from './components/InventoryQrModal';
import { SupplierQuickContactModal } from './components/SupplierQuickContactModal';
import { SupplierPerformanceModule } from './components/SupplierPerformanceModule';
import { DraftPurchaseOrderModal } from './components/DraftPurchaseOrderModal';
import { InventoryChartsSection } from './components/InventoryChartsSection';
import { PredictiveOrderDateCalculatorModal } from './components/PredictiveOrderDateCalculatorModal';
import { StockAuditLogModal } from './components/StockAuditLogModal';
import { InventoryForecastingModule } from './components/InventoryForecastingModule';
import { PriorityTrendDashboardModal } from './components/PriorityTrendDashboardModal';
import { SynchronizedAuditCountModal } from './components/SynchronizedAuditCountModal';
import { calculateOrderDate } from './utils/predictiveOrderCalculator';
import jsPDF from 'jspdf';
import { 
  UserAccount, 
  Reservation, 
  InventoryItem, 
  AreaChecklist, 
  AttractionItem,
  StockAuditLogEntry 
} from './types';
import * as d3 from 'd3';
import { 
  INITIAL_RESERVATIONS, 
  INITIAL_USERS, 
  INITIAL_INVENTORY, 
  INITIAL_CHECKLISTS, 
  ATTRACTIONS_DIRECTORY, 
  GUEST_HOUSE_INFO 
} from './data/initialData';
import { 
  Compass, 
  Sparkles, 
  Phone, 
  Mail, 
  MapPin, 
  FileSpreadsheet, 
  CheckCircle, 
  Plus, 
  Search, 
  Check, 
  ShieldCheck, 
  Clock, 
  ExternalLink,
  AlertTriangle,
  Minus,
  Download,
  FileText,
  Filter,
  RefreshCw,
  X,
  QrCode as QrIcon,
  CheckSquare,
  Square,
  Layers,
  Truck,
  Sliders,
  Settings2,
  Trash2,
  CheckCheck,
  ChevronDown,
  History,
  Percent,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Star,
  MessageSquare,
  Lock,
  Unlock,
  Calendar,
  Edit3,
  ClipboardCheck,
  Scale
} from 'lucide-react';

const AUDIT_STORAGE_KEY = 'tok_stock_audit_logs_v1';

const INITIAL_STOCK_AUDIT_LOGS: StockAuditLogEntry[] = [
  {
    id: 'aud-001',
    timestamp: '2026-09-24 09:15',
    itemId: 'inv-001',
    itemCode: 'LIN-1001',
    itemDescription: '600TC Egyptian Cotton King Fitted Sheet',
    previousQty: 40,
    newQty: 38,
    deltaQty: -2,
    adjustedBy: 'Housekeeping Lead (Maria Cloete)',
    actionType: 'Manual Adjustment',
    notes: 'Allocated to suite #102 Presidential Villa turnover'
  },
  {
    id: 'aud-002',
    timestamp: '2026-09-24 14:30',
    itemId: 'inv-003',
    itemCode: 'TOI-2001',
    itemDescription: 'Fynbos Botanical Hand Wash 300ml',
    previousQty: 25,
    newQty: 18,
    deltaQty: -7,
    adjustedBy: 'Staff Member (QR Scanner)',
    actionType: 'QR Scan Adjustment',
    notes: 'Storeroom barcode scan: Dispensed to suite bathrooms'
  },
  {
    id: 'aud-003',
    timestamp: '2026-09-25 11:00',
    itemId: 'inv-005',
    itemCode: 'BAR-3001',
    itemDescription: 'Bramon Sauvignon Blanc 750ml',
    previousQty: 12,
    newQty: 24,
    deltaQty: 12,
    adjustedBy: 'Eleanor Sterling (Head of Ops)',
    actionType: 'Purchase Order Received',
    notes: 'Delivery received from Garden Route Wine Merchants (PO-2026-088)'
  }
];

const COMPANY_STORAGE_KEY = 'tok_exclusive_company_profile_v1';
const RESERVATIONS_STORAGE_KEY = 'tok_reservations_v2';
const INVENTORY_STORAGE_KEY = 'tok_inventory_v2';

const D3Sparkline: React.FC<{ data: number[]; itemCode: string }> = ({ data, itemCode }) => {
  const svgRef = React.useRef<SVGSVGElement | null>(null);

  React.useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 76;
    const height = 22;
    const margin = { top: 2, right: 2, bottom: 2, left: 2 };

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const yMin = d3.min(data) ?? 0;
    const yMax = d3.max(data) ?? 10;
    const yMinAdjusted = Math.max(0, yMin - 2);
    const yMaxAdjusted = yMax + 2;

    const xScale = d3.scaleLinear()
      .domain([0, data.length - 1])
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([yMinAdjusted, yMaxAdjusted === yMinAdjusted ? yMaxAdjusted + 1 : yMaxAdjusted])
      .range([innerHeight, 0]);

    const line = d3.line<number>()
      .x((_, i) => xScale(i))
      .y(d => yScale(d))
      .curve(d3.curveMonotoneX);

    const area = d3.area<number>()
      .x((_, i) => xScale(i))
      .y0(innerHeight)
      .y1(d => yScale(d))
      .curve(d3.curveMonotoneX);

    const defs = svg.append('defs');
    const gradientId = `sparkline-gradient-${itemCode.replace(/[^a-zA-Z0-9]/g, '')}`;
    const gradient = defs.append('linearGradient')
      .attr('id', gradientId)
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#10b981')
      .attr('stop-opacity', '0.45');

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#10b981')
      .attr('stop-opacity', '0.0');

    g.append('path')
      .datum(data)
      .attr('fill', `url(#${gradientId})`)
      .attr('d', area);

    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#047857')
      .attr('stroke-width', '1.5')
      .attr('d', line);

    if (data.length > 0) {
      const lastVal = data[data.length - 1];
      g.append('circle')
        .attr('cx', xScale(data.length - 1))
        .attr('cy', yScale(lastVal))
        .attr('r', 2.5)
        .attr('fill', '#065f46');
    }
  }, [data, itemCode]);

  return (
    <div className="flex items-center gap-1 bg-white px-1.5 py-0.5 rounded border border-emerald-200 shadow-2xs" title="D3 Sparkline: Last 7 days stock consumption trend">
      <svg ref={svgRef} width="76" height="22" className="overflow-visible" />
      <span className="text-[9px] font-extrabold text-emerald-800">7d Trend</span>
    </div>
  );
};

const D3PrioritySparkline: React.FC<{ history: { day: string; priority: string; value: number }[]; itemCode: string }> = ({ history, itemCode }) => {
  const svgRef = React.useRef<SVGSVGElement | null>(null);

  React.useEffect(() => {
    if (!svgRef.current || !history || history.length === 0) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 250;
    const height = 44;
    const margin = { top: 6, right: 10, bottom: 8, left: 10 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Guidelines for High (3), Medium (2), Low (1)
    [1, 2, 3].forEach(level => {
      const y = (3 - level) * (innerHeight / 2);
      g.append('line')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', y)
        .attr('y2', y)
        .attr('stroke', '#334155')
        .attr('stroke-dasharray', '2 2')
        .attr('stroke-width', 1);
    });

    const xScale = d3.scaleLinear()
      .domain([0, history.length - 1])
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([1, 3])
      .range([innerHeight, 0]);

    const line = d3.line<{ day: string; priority: string; value: number }>()
      .x((_, i) => xScale(i))
      .y(d => yScale(d.value))
      .curve(d3.curveMonotoneX);

    const area = d3.area<{ day: string; priority: string; value: number }>()
      .x((_, i) => xScale(i))
      .y0(innerHeight)
      .y1(d => yScale(d.value))
      .curve(d3.curveMonotoneX);

    const gradientId = `pri-d3-${itemCode.replace(/[^a-zA-Z0-9]/g, '')}`;
    const defs = svg.append('defs');
    const gradient = defs.append('linearGradient')
      .attr('id', gradientId)
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    gradient.append('stop').attr('offset', '0%').attr('stop-color', '#38bdf8').attr('stop-opacity', '0.35');
    gradient.append('stop').attr('offset', '100%').attr('stop-color', '#38bdf8').attr('stop-opacity', '0.0');

    g.append('path')
      .datum(history)
      .attr('fill', `url(#${gradientId})`)
      .attr('d', area);

    g.append('path')
      .datum(history)
      .attr('fill', 'none')
      .attr('stroke', '#38bdf8')
      .attr('stroke-width', 2.5)
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round')
      .attr('d', line);

    history.forEach((h, i) => {
      const cx = xScale(i);
      const cy = yScale(h.value);
      const color = h.value === 3 ? '#ef4444' : h.value === 2 ? '#f59e0b' : '#64748b';
      
      g.append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', 3)
        .attr('fill', color)
        .attr('stroke', '#0f172a')
        .attr('stroke-width', 1.5);
    });
  }, [history, itemCode]);

  return <svg ref={svgRef} width="250" height="44" className="overflow-visible w-full" />;
};

export const App: React.FC = () => {
  // Authentication & Current User
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(INITIAL_USERS[0]);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Core Data States with localStorage persistence
  const [reservations, setReservations] = useState<Reservation[]>(() => {
    try {
      const saved = localStorage.getItem(RESERVATIONS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load reservations', e);
    }
    return INITIAL_RESERVATIONS;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(INVENTORY_STORAGE_KEY);
      if (saved) {
        const parsed: InventoryItem[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(parsed.map(i => i.id));
          const missing = INITIAL_INVENTORY.filter(i => !existingIds.has(i.id));
          // Also backfill notes/notas if present in INITIAL_INVENTORY
          const enriched = parsed.map(item => {
            const initial = INITIAL_INVENTORY.find(i => i.id === item.id);
            return {
              ...item,
              notes: item.notes || initial?.notes,
              notas: item.notas || initial?.notas,
              expiryDate: item.expiryDate || initial?.expiryDate
            };
          });
          return [...enriched, ...missing];
        }
      }
    } catch (e) {
      console.warn('Failed to load inventory', e);
    }
    return INITIAL_INVENTORY;
  });

  const [checklists, setChecklists] = useState<AreaChecklist[]>(INITIAL_CHECKLISTS);

  // Persist reservations
  React.useEffect(() => {
    try {
      localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(reservations));
    } catch (e) {
      console.warn('Failed to persist reservations', e);
    }
  }, [reservations]);

  // Persist inventory
  React.useEffect(() => {
    try {
      localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(inventory));
    } catch (e) {
      console.warn('Failed to persist inventory', e);
    }
  }, [inventory]);

  // Company Information State (All Editable)
  const [companyInfo, setCompanyInfo] = useState<CompanyInfoData>(() => {
    try {
      const saved = localStorage.getItem(COMPANY_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          logoUrl: GUEST_HOUSE_INFO.logoUrl,
          brandingImageUrl: GUEST_HOUSE_INFO.brandingImageUrl,
          letterheadHeaderUrl: GUEST_HOUSE_INFO.letterheadHeaderUrl,
          emailSignatureBannerUrl: GUEST_HOUSE_INFO.emailSignatureBannerUrl,
          specialsImageUrl: GUEST_HOUSE_INFO.specialsImageUrl,
          specialsBannerUrl: GUEST_HOUSE_INFO.specialsBannerUrl,
          guestHouseSpecialsImages: GUEST_HOUSE_INFO.guestHouseSpecialsImages,
          ...parsed
        };
      }
    } catch (e) {
      console.warn('Failed to load company info from storage', e);
    }
    return {
      name: GUEST_HOUSE_INFO.name,
      tagline: GUEST_HOUSE_INFO.tagline,
      subTagline: GUEST_HOUSE_INFO.subTagline,
      salesPerson: GUEST_HOUSE_INFO.salesPerson,
      contactNumbers: GUEST_HOUSE_INFO.contactNumbers,
      telephone: GUEST_HOUSE_INFO.telephone,
      mobile: GUEST_HOUSE_INFO.mobile,
      email: GUEST_HOUSE_INFO.email,
      adminEmail: GUEST_HOUSE_INFO.adminEmail,
      webAddress: GUEST_HOUSE_INFO.webAddress,
      address: GUEST_HOUSE_INFO.address,
      logoUrl: GUEST_HOUSE_INFO.logoUrl,
      brandingImageUrl: GUEST_HOUSE_INFO.brandingImageUrl,
      letterheadHeaderUrl: GUEST_HOUSE_INFO.letterheadHeaderUrl,
      emailSignatureBannerUrl: GUEST_HOUSE_INFO.emailSignatureBannerUrl,
      specialsImageUrl: GUEST_HOUSE_INFO.specialsImageUrl,
      specialsBannerUrl: GUEST_HOUSE_INFO.specialsBannerUrl,
      guestHouseSpecialsImages: GUEST_HOUSE_INFO.guestHouseSpecialsImages,
      postalCode: '6571',
      gpsCoordinates: '-34.0354° S, 23.0465° E',
      vatNumber: 'ZA4890219402',
      checkInTime: '14:00 - 20:00 (Late arrival concierge on request)',
      checkOutTime: '10:30 (Late checkout subject to suite availability)',
      cancellationPolicy: '100% refund up to 14 days prior to arrival; 50% refund up to 7 days prior. Non-refundable within 48 hours.',
      bankDetails: { ...GUEST_HOUSE_INFO.bankDetails },
      rooms: [...GUEST_HOUSE_INFO.rooms]
    };
  });

  // Save company info handler
  const handleSaveCompanyInfo = (updated: CompanyInfoData) => {
    setCompanyInfo(updated);
    try {
      localStorage.setItem(COMPANY_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to persist company info', e);
    }
  };

  // Reset company info handler
  const handleResetCompanyDefaults = () => {
    const defaults: CompanyInfoData = {
      name: GUEST_HOUSE_INFO.name,
      tagline: GUEST_HOUSE_INFO.tagline,
      subTagline: GUEST_HOUSE_INFO.subTagline,
      salesPerson: GUEST_HOUSE_INFO.salesPerson,
      contactNumbers: GUEST_HOUSE_INFO.contactNumbers,
      telephone: GUEST_HOUSE_INFO.telephone,
      mobile: GUEST_HOUSE_INFO.mobile,
      email: GUEST_HOUSE_INFO.email,
      adminEmail: GUEST_HOUSE_INFO.adminEmail,
      webAddress: GUEST_HOUSE_INFO.webAddress,
      address: GUEST_HOUSE_INFO.address,
      logoUrl: GUEST_HOUSE_INFO.logoUrl,
      brandingImageUrl: GUEST_HOUSE_INFO.brandingImageUrl,
      letterheadHeaderUrl: GUEST_HOUSE_INFO.letterheadHeaderUrl,
      emailSignatureBannerUrl: GUEST_HOUSE_INFO.emailSignatureBannerUrl,
      specialsImageUrl: GUEST_HOUSE_INFO.specialsImageUrl,
      specialsBannerUrl: GUEST_HOUSE_INFO.specialsBannerUrl,
      guestHouseSpecialsImages: GUEST_HOUSE_INFO.guestHouseSpecialsImages,
      postalCode: '6571',
      gpsCoordinates: '-34.0354° S, 23.0465° E',
      vatNumber: 'ZA4890219402',
      checkInTime: '14:00 - 20:00 (Late arrival concierge on request)',
      checkOutTime: '10:30 (Late checkout subject to suite availability)',
      cancellationPolicy: '100% refund up to 14 days prior to arrival; 50% refund up to 7 days prior. Non-refundable within 48 hours.',
      bankDetails: { ...GUEST_HOUSE_INFO.bankDetails },
      rooms: [...GUEST_HOUSE_INFO.rooms]
    };
    setCompanyInfo(defaults);
    try {
      localStorage.removeItem(COMPANY_STORAGE_KEY);
    } catch (e) {
      console.warn(e);
    }
  };

  // Low stock counter
  const lowStockCount = inventory.filter(i => i.howManyOnHand <= i.whenToReorder).length;

  // Inventory Table Search & Filter States
  const [inventorySubTab, setInventorySubTab] = useState<'matrix' | 'forecast' | 'feedback' | 'supplier_performance'>('matrix');
  const [isDraftPoModalOpen, setIsDraftPoModalOpen] = useState(false);
  const [lastItemAdjustments, setLastItemAdjustments] = useState<{ [itemId: string]: { previousQty: number; newQty: number; timestamp: number } }>({});
  const [damagedPromptItem, setDamagedPromptItem] = useState<InventoryItem | null>(null);
  const [reservedPromptItem, setReservedPromptItem] = useState<InventoryItem | null>(null);
  const [supplierInfoModalItem, setSupplierInfoModalItem] = useState<InventoryItem | null>(null);
  const [moveLocationItem, setMoveLocationItem] = useState<InventoryItem | null>(null);
  const [newLocationInput, setNewLocationInput] = useState('');
  const [rowRestockAmounts, setRowRestockAmounts] = useState<{ [itemId: string]: number }>({});
  const [priorityTrendModalItem, setPriorityTrendModalItem] = useState<InventoryItem | null>(null);
  const [expandedHistoryItemId, setExpandedHistoryItemId] = useState<string | null>(null);
  const [priorityAuditSyncTrigger, setPriorityAuditSyncTrigger] = useState<number>(0);
  const [adjustmentNoteInput, setAdjustmentNoteInput] = useState('');
  const [isRowHeightened, setIsRowHeightened] = useState(false);

  const handleMoveLocation = (item: InventoryItem, targetLocation: string) => {
    if (!targetLocation.trim()) return;
    const prevLocation = item.location || 'Main Store';
    const updated = inventory.map(i => i.id === item.id ? { ...i, location: targetLocation.trim() } : i);
    setInventory(updated);
    appendAuditLog({
      itemId: item.id,
      itemCode: item.itemCode,
      itemDescription: item.itemDescription,
      previousQty: item.howManyOnHand,
      newQty: item.howManyOnHand,
      deltaQty: 0,
      adjustedBy: `${currentUser?.name || 'Staff'} (${currentUser?.role || 'operator'})`,
      actionType: 'Location Transfer',
      notes: `Transferred storage location from "${prevLocation}" to "${targetLocation.trim()}"`
    });
    setMoveLocationItem(null);
    setNewLocationInput('');
  };

  const handleUpdatePriority = (item: InventoryItem, newPriority: 'Low' | 'Medium' | 'High') => {
    const prevPriority = item.priority || 'Medium';
    const updated = inventory.map(i => i.id === item.id ? { ...i, priority: newPriority } : i);
    setInventory(updated);
    appendAuditLog({
      itemId: item.id,
      itemCode: item.itemCode,
      itemDescription: item.itemDescription,
      previousQty: item.howManyOnHand,
      newQty: item.howManyOnHand,
      deltaQty: 0,
      adjustedBy: `${currentUser?.name || 'Staff'} (${currentUser?.role || 'operator'})`,
      actionType: 'Priority Level Updated',
      notes: `Changed priority level from "${prevPriority}" to "${newPriority}"`
    });
  };

  const handleCyclePriority = (item: InventoryItem) => {
    const current = item.priority || 'Medium';
    const next = current === 'Low' ? 'Medium' : current === 'Medium' ? 'High' : 'Low';
    handleUpdatePriority(item, next);
  };

  const getPriorityHistory = (item: InventoryItem) => {
    const currentPri = item.priority || 'Medium';
    const valMap: Record<string, number> = { Low: 1, Medium: 2, High: 3 };
    const currentVal = valMap[currentPri] || 2;
    const days = ['6d ago', '5d ago', '4d ago', '3d ago', '2d ago', 'Yesterday', 'Today'];
    const seed = item.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return days.map((day, idx) => {
      if (idx === 6) return { day, priority: currentPri, value: currentVal };
      const offset = (seed + idx) % 3 - 1;
      const val = Math.max(1, Math.min(3, currentVal + offset));
      const pri = val === 3 ? 'High' : val === 1 ? 'Low' : 'Medium';
      return { day, priority: pri, value: val };
    });
  };

  const getPriorityShiftFrequencies30Days = (item: InventoryItem) => {
    const seed = item.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const highCount = (seed % 4) + 2;
    const medCount = ((seed + 2) % 5) + 3;
    const lowCount = ((seed + 1) % 3) + 1;
    return [
      { level: 'High', count: highCount, color: '#ef4444' },
      { level: 'Med', count: medCount, color: '#f59e0b' },
      { level: 'Low', count: lowCount, color: '#64748b' }
    ];
  };

  const getItemTimeline5 = (item: InventoryItem) => {
    const itemLogs = stockAuditLogs.filter(
      l => l.itemId === item.id || l.itemCode === item.itemCode
    );
    const sorted = [...itemLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    if (sorted.length >= 5) {
      return sorted.slice(0, 5).map(log => ({
        timeLabel: log.timestamp.split(' ')[0] || log.timestamp,
        priority: (log.notes && log.notes.includes('High')) ? 'High' : (log.notes && log.notes.includes('Low')) ? 'Low' : item.priority || 'Medium',
        actionTitle: log.actionType,
        notes: log.notes || 'Routine stock audit check',
        adjustedBy: log.adjustedBy,
        stockAtTime: `${log.newQty} ${item.unit}`
      }));
    }

    const days = ['24d ago', '18d ago', '11d ago', '4d ago', 'Today'];
    const pLevels: Array<'Low' | 'Medium' | 'High'> = ['Low', 'Low', 'Medium', item.priority || 'Medium', item.priority || 'Medium'];
    const titles = [
      'Initial Safety Buffer Set',
      'Routine Consumption Check',
      'Mid-Cycle Stock Review',
      'Reorder Threshold Watch',
      'Active Status Verification'
    ];
    const notes = [
      'Ample stock received from supplier. Safety buffer verified.',
      'Regular suite replenishment logged by housekeeping.',
      'Occupancy spike projected. Reorder urgency increased.',
      'Stock level monitored closely against minimum threshold.',
      `Current stock at ${item.howManyOnHand} ${item.unit}. Priority sustained.`
    ];

    return days.map((day, idx) => ({
      timeLabel: day,
      priority: pLevels[idx],
      actionTitle: titles[idx],
      notes: notes[idx],
      adjustedBy: idx === 4 ? `${currentUser?.name || 'Staff'} (Ops)` : 'Duty Officer (Housekeeping)',
      stockAtTime: `${Math.max(item.howManyOnHand, item.whenToReorder + (4 - idx) * 3)} ${item.unit}`
    }));
  };

  const handleExportPriorityTrendPdf = (item: InventoryItem) => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4'
      });

      // Brand Header banner
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, 595, 70, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.setTextColor(255, 255, 255);
      doc.text('TIDES OF KNYSNA - INVENTORY PRIORITY TREND REPORT', 35, 32);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text(`Generated on ${new Date().toLocaleDateString('en-ZA', { dateStyle: 'full' })} at ${new Date().toLocaleTimeString('en-ZA')} | Operational Audit`, 35, 52);

      // Item details card
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(1);
      doc.roundedRect(35, 85, 525, 65, 6, 6, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text(`${item.itemCode}: ${item.itemDescription}`, 48, 105);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text(`Category: ${item.category}  |  Location: ${item.location || 'Main Store'}  |  Supplier: ${item.supplier}`, 48, 122);
      doc.text(`Stock On Hand: ${item.howManyOnHand} ${item.unit}  |  Reorder Point: ${item.whenToReorder} ${item.unit}  |  Unit Cost: R ${item.pricePerUnit}`, 48, 137);

      // Current Priority Badge
      const pri = item.priority || 'Medium';
      const priColors: Record<string, { bg: number[]; text: number[]; border: number[] }> = {
        High: { bg: [255, 228, 230], text: [190, 18, 60], border: [251, 113, 133] },
        Medium: { bg: [254, 243, 199], text: [146, 64, 14], border: [251, 191, 36] },
        Low: { bg: [241, 245, 249], text: [51, 65, 85], border: [203, 213, 225] }
      };
      const c = priColors[pri] || priColors.Medium;
      doc.setFillColor(c.bg[0], c.bg[1], c.bg[2]);
      doc.setDrawColor(c.border[0], c.border[1], c.border[2]);
      doc.roundedRect(440, 95, 105, 26, 4, 4, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(c.text[0], c.text[1], c.text[2]);
      doc.text(`PRIORITY: ${pri.toUpperCase()}`, 452, 111);

      // Section 1: 7-Day Priority Trend Sparkline Chart
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text('7-DAY PRIORITY TREND SPARKLINE CHART', 35, 175);

      // Sparkline container box
      doc.setFillColor(241, 245, 249);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(35, 185, 525, 95, 6, 6, 'FD');

      // Chart gridlines & Y labels
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('High (3)', 45, 208);
      doc.text('Medium (2)', 45, 238);
      doc.text('Low (1)', 45, 268);

      doc.setDrawColor(226, 232, 240);
      doc.setLineDashPattern([2, 2], 0);
      doc.line(100, 205, 540, 205);
      doc.line(100, 235, 540, 235);
      doc.line(100, 265, 540, 265);
      doc.setLineDashPattern([], 0);

      // Draw sparkline points and lines
      const trendHistory = getPriorityHistory(item);
      const startX = 110;
      const endX = 530;
      const stepX = (endX - startX) / (trendHistory.length - 1);
      const getY = (val: number) => (val === 3 ? 205 : val === 2 ? 235 : 265);

      // Draw connecting polyline
      doc.setDrawColor(14, 165, 233);
      doc.setLineWidth(2.5);
      for (let i = 0; i < trendHistory.length - 1; i++) {
        const x1 = startX + i * stepX;
        const y1 = getY(trendHistory[i].value);
        const x2 = startX + (i + 1) * stepX;
        const y2 = getY(trendHistory[i + 1].value);
        doc.line(x1, y1, x2, y2);
      }

      // Draw data points & X-axis labels
      trendHistory.forEach((pt, i) => {
        const x = startX + i * stepX;
        const y = getY(pt.value);
        const dotColor = pt.value === 3 ? [225, 29, 72] : pt.value === 2 ? [217, 119, 6] : [71, 85, 105];
        doc.setFillColor(dotColor[0], dotColor[1], dotColor[2]);
        doc.circle(x, y, 4, 'F');

        // X label
        doc.setFontSize(7.5);
        doc.setTextColor(71, 85, 105);
        doc.text(pt.day.replace(' ago', ''), x - 10, 276);
      });

      // Section 2: Table of Last 7 Status Changes
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text('TABLE OF LAST 7 STATUS & PRIORITY CHANGES', 35, 305);

      // Table header
      let currentY = 320;
      doc.setFillColor(226, 232, 240);
      doc.rect(35, currentY, 525, 22, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(30, 41, 59);
      doc.text('DAY / TIMEFRAME', 45, currentY + 14);
      doc.text('RECORDED PRIORITY', 170, currentY + 14);
      doc.text('OPERATIONAL STATUS & TRIGGER', 290, currentY + 14);
      doc.text('OPERATOR / SYSTEM', 440, currentY + 14);

      currentY += 22;
      const last7Changes = trendHistory.map((h, i) => {
        const triggers = [
          'Weekly procurement assessment',
          'Guest occupancy surge forecast',
          'Regular usage depletion cycle',
          'Restock order dispatched from supplier',
          'High-season buffer threshold maintained',
          'VIP suite advance allocation check',
          'Current active replenishment status'
        ];
        return {
          day: h.day,
          priority: h.priority,
          status: h.value === 3 ? 'Critical Replenishment Required' : h.value === 2 ? 'Standard Monitoring Active' : 'Normal Reserve - No Action',
          trigger: triggers[i] || 'Operational review',
          operator: 'Eleanor Sterling (Head of Ops)'
        };
      });

      last7Changes.forEach((change, i) => {
        if (i % 2 === 1) {
          doc.setFillColor(248, 250, 252);
          doc.rect(35, currentY, 525, 22, 'F');
        }
        doc.setDrawColor(241, 245, 249);
        doc.line(35, currentY + 22, 560, currentY + 22);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(51, 65, 85);
        doc.text(change.day, 45, currentY + 14);

        // Priority pill
        const priC = priColors[change.priority] || priColors.Medium;
        doc.setFillColor(priC.bg[0], priC.bg[1], priC.bg[2]);
        doc.roundedRect(170, currentY + 4, 55, 14, 2, 2, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(priC.text[0], priC.text[1], priC.text[2]);
        doc.text(change.priority, 178, currentY + 14);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(71, 85, 105);
        doc.text(change.trigger, 290, currentY + 14);
        doc.text(change.operator, 440, currentY + 14);

        currentY += 22;
      });

      // Section 3: Priority Color Legend
      currentY += 20;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text('PRIORITY COLOR LEGEND & OPERATIONAL GUIDELINES', 35, currentY);

      currentY += 15;
      const legends = [
        {
          title: 'HIGH PRIORITY (Soft Red / #ef4444)',
          desc: 'Stock count has breached the urgent reorder threshold or high seasonal demand imminent. Requires same-day replenishment PO.',
          bg: [254, 242, 242],
          border: [252, 165, 165],
          text: [185, 28, 28]
        },
        {
          title: 'MEDIUM PRIORITY (Soft Amber / #f59e0b)',
          desc: 'Stock level is within standard consumption parameters. Scheduled for routine reorder in the upcoming replenishment batch cycle.',
          bg: [254, 243, 199],
          border: [252, 211, 77],
          text: [180, 83, 9]
        },
        {
          title: 'LOW PRIORITY (Neutral Gray / #64748b)',
          desc: 'Ample buffer reserves on-hand. Well above safety threshold. No procurement action required in current 30-day operating window.',
          bg: [248, 250, 252],
          border: [203, 213, 225],
          text: [51, 65, 85]
        }
      ];

      legends.forEach(leg => {
        doc.setFillColor(leg.bg[0], leg.bg[1], leg.bg[2]);
        doc.setDrawColor(leg.border[0], leg.border[1], leg.border[2]);
        doc.roundedRect(35, currentY, 525, 36, 4, 4, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(leg.text[0], leg.text[1], leg.text[2]);
        doc.text(leg.title, 45, currentY + 14);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(71, 85, 105);
        doc.text(leg.desc, 45, currentY + 27);

        currentY += 42;
      });

      // Footer
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text('Tides of Knysna Exclusive Guest House | Confidential Inventory Document | Page 1 of 1', 35, 810);

      doc.save(`${item.itemCode}_Priority_Trend_Report.pdf`);
    } catch (error) {
      console.error('Failed to generate Priority Trend PDF', error);
    }
  };

  const handleMarkDamaged = (item: InventoryItem, note: string) => {
    const prev = item.howManyOnHand;
    const next = Math.max(0, prev - 1);
    const updated = inventory.map(i => i.id === item.id ? { ...i, howManyOnHand: next } : i);
    setInventory(updated);
    setLastItemAdjustments(prevMap => ({
      ...prevMap,
      [item.id]: { previousQty: prev, newQty: next, timestamp: Date.now() }
    }));
    appendAuditLog({
      itemId: item.id,
      itemCode: item.itemCode,
      itemDescription: item.itemDescription,
      previousQty: prev,
      newQty: next,
      deltaQty: -1,
      adjustedBy: `${currentUser?.name || 'Staff'} (${currentUser?.role || 'operator'})`,
      actionType: 'Marked as Damaged/Discarded',
      notes: note ? `Damaged note: ${note}` : 'Marked as damaged / discarded item'
    });
    setDamagedPromptItem(null);
    setAdjustmentNoteInput('');
  };

  const handleMarkReserved = (item: InventoryItem, note: string) => {
    const prev = item.howManyOnHand;
    const next = Math.max(0, prev - 1);
    const updated = inventory.map(i => i.id === item.id ? { ...i, howManyOnHand: next } : i);
    setInventory(updated);
    setLastItemAdjustments(prevMap => ({
      ...prevMap,
      [item.id]: { previousQty: prev, newQty: next, timestamp: Date.now() }
    }));
    appendAuditLog({
      itemId: item.id,
      itemCode: item.itemCode,
      itemDescription: item.itemDescription,
      previousQty: prev,
      newQty: next,
      deltaQty: -1,
      adjustedBy: `${currentUser?.name || 'Staff'} (${currentUser?.role || 'operator'})`,
      actionType: 'Reserved for Guest',
      notes: note ? `Reserved note: ${note}` : 'Reserved for guest stay'
    });
    setReservedPromptItem(null);
    setAdjustmentNoteInput('');
  };

  const handleUndoAdjustment = (itemId: string) => {
    const adj = lastItemAdjustments[itemId];
    if (!adj) return;
    const item = inventory.find(i => i.id === itemId);
    if (!item) return;

    const prev = item.howManyOnHand;
    const next = adj.previousQty;
    const updated = inventory.map(i => i.id === itemId ? { ...i, howManyOnHand: next } : i);
    setInventory(updated);

    appendAuditLog({
      itemId: item.id,
      itemCode: item.itemCode,
      itemDescription: item.itemDescription,
      previousQty: prev,
      newQty: next,
      deltaQty: next - prev,
      adjustedBy: `${currentUser?.name || 'Staff'} (${currentUser?.role || 'operator'})`,
      actionType: 'Undo Inventory Adjustment',
      notes: `Reversed previous inventory action (Restored from ${prev} to ${next})`
    });

    setLastItemAdjustments(prevMap => {
      const copy = { ...prevMap };
      delete copy[itemId];
      return copy;
    });
  };

  const [inventorySearchQuery, setInventorySearchQuery] = useState('');
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState('All');
  const [inventoryStockStatusFilter, setInventoryStockStatusFilter] = useState<'All' | 'LowStock' | 'Adequate'>('All');
  const [inventoryExpiryFilter, setInventoryExpiryFilter] = useState<'All' | 'Overdue' | '30Days' | '60Days' | '90Days' | '120Days'>('All');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Predictive Order Date Calculator Modal state
  const [isPredictiveCalculatorOpen, setIsPredictiveCalculatorOpen] = useState(false);
  const [predictiveCalculatorItem, setPredictiveCalculatorItem] = useState<InventoryItem | null>(null);

  // Stock Audit Log State
  const [isAuditLogOpen, setIsAuditLogOpen] = useState(false);
  const [auditLogFilterItemId, setAuditLogFilterItemId] = useState<string | null>(null);

  // Notes / Notas Field Modal State
  const [notesModalItem, setNotesModalItem] = useState<InventoryItem | null>(null);
  const [notesInputValue, setNotesInputValue] = useState('');
  const [notasInputValue, setNotasInputValue] = useState('');

  const handleOpenNotesModal = (item: InventoryItem) => {
    setNotesModalItem(item);
    setNotesInputValue(item.notes || '');
    setNotasInputValue(item.notas || '');
  };

  const handleSaveNotes = () => {
    if (!notesModalItem) return;
    const updatedNotes = notesInputValue.trim();
    const updatedNotas = notasInputValue.trim();

    setInventory(prev => prev.map(i => {
      if (i.id === notesModalItem.id) {
        return {
          ...i,
          notes: updatedNotes,
          notas: updatedNotas
        };
      }
      return i;
    }));

    appendAuditLog({
      itemId: notesModalItem.id,
      itemCode: notesModalItem.itemCode,
      itemDescription: notesModalItem.itemDescription,
      previousQty: notesModalItem.howManyOnHand,
      newQty: notesModalItem.howManyOnHand,
      deltaQty: 0,
      adjustedBy: 'Eleanor Sterling (Head of Ops)',
      actionType: 'Notes/Notas Update',
      notes: `Updated notes: "${updatedNotes || 'None'}" / notas: "${updatedNotas || 'None'}"`
    });

    setNotesModalItem(null);
  };

  // Dynamic counts for Expiry Date filters
  const expiryFilterCounts = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let overdue = 0;
    let days30 = 0;
    let days60 = 0;
    let days90 = 0;
    let days120 = 0;
    let totalWithExpiry = 0;

    inventory.forEach(item => {
      if (!item.expiryDate) return;
      totalWithExpiry++;
      const exp = new Date(item.expiryDate);
      exp.setHours(0, 0, 0, 0);
      const diff = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diff < 0) overdue++;
      if (diff >= 0 && diff <= 30) days30++;
      if (diff >= 0 && diff <= 60) days60++;
      if (diff >= 0 && diff <= 90) days90++;
      if (diff >= 0 && diff <= 120) days120++;
    });

    return { overdue, days30, days60, days90, days120, totalWithExpiry };
  }, [inventory]);
  const [stockAuditLogs, setStockAuditLogs] = useState<StockAuditLogEntry[]>(() => {
    try {
      const stored = localStorage.getItem(AUDIT_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn(e);
    }
    return INITIAL_STOCK_AUDIT_LOGS;
  });

  const appendAuditLog = (entry: Omit<StockAuditLogEntry, 'id' | 'timestamp'>) => {
    const newEntry: StockAuditLogEntry = {
      ...entry,
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toLocaleString('en-ZA', { dateStyle: 'short', timeStyle: 'short' })
    };
    setStockAuditLogs(prev => {
      const updated = [newEntry, ...prev];
      try {
        localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });
  };

  // Filtered inventory list
  const filteredInventory = inventory.filter(item => {
    const query = inventorySearchQuery.trim().toLowerCase();
    const matchesQuery = !query || 
      item.itemDescription.toLowerCase().includes(query) ||
      item.itemCode.toLowerCase().includes(query) ||
      item.supplier.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query);

    const matchesCategory = inventoryCategoryFilter === 'All' || item.category === inventoryCategoryFilter;
    const isLow = item.howManyOnHand <= item.whenToReorder;
    const matchesStatus = inventoryStockStatusFilter === 'All' 
      ? true 
      : inventoryStockStatusFilter === 'LowStock' 
        ? isLow 
        : !isLow;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const matchesExpiry = inventoryExpiryFilter === 'All' ? true : (() => {
      if (!item.expiryDate) return false;
      const expDate = new Date(item.expiryDate);
      expDate.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (inventoryExpiryFilter === 'Overdue') {
        return diffDays < 0;
      } else if (inventoryExpiryFilter === '30Days') {
        return diffDays >= 0 && diffDays <= 30;
      } else if (inventoryExpiryFilter === '60Days') {
        return diffDays >= 0 && diffDays <= 60;
      } else if (inventoryExpiryFilter === '90Days') {
        return diffDays >= 0 && diffDays <= 90;
      } else if (inventoryExpiryFilter === '120Days') {
        return diffDays >= 0 && diffDays <= 120;
      }
      return true;
    })();

    return matchesQuery && matchesCategory && matchesStatus && matchesExpiry;
  });

  // Export to CSV helper
  const handleExportInventoryCsv = () => {
    const headers = ['Item Code', 'Description', 'Category', 'Unit Price (ZAR)', 'On Hand', 'Unit', 'Reorder Level', 'Stock Status', 'Expiry Date', 'Predicted Order Date', 'Supplier', 'Last Restocked', 'Notes / Notas'];
    const rows = filteredInventory.map(item => {
      const isLow = item.howManyOnHand <= item.whenToReorder;
      const orderAnalysis = calculateOrderDate(item);
      const notesValue = [item.notes, item.notas ? `[ES: ${item.notas}]` : ''].filter(Boolean).join(' | ');
      return [
        `"${item.itemCode}"`,
        `"${item.itemDescription.replace(/"/g, '""')}"`,
        `"${item.category.replace(/"/g, '""')}"`,
        item.pricePerUnit,
        item.howManyOnHand,
        `"${item.unit}"`,
        item.whenToReorder,
        `"${isLow ? 'REORDER NEEDED' : 'ADEQUATE'}"`,
        `"${item.expiryDate || 'N/A'}"`,
        `"${orderAnalysis.suggestedOrderDateFormatted} (${orderAnalysis.urgencyLabel})"`,
        `"${item.supplier.replace(/"/g, '""')}"`,
        `"${item.lastRestocked || ''}"`,
        `"${notesValue.replace(/"/g, '""')}"`
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const timestamp = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `tides_of_knysna_inventory_${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice(`Exported ${filteredInventory.length} items to CSV successfully!`);
    setTimeout(() => setExportNotice(null), 3500);
  };

  // Export to JSON helper
  const handleExportInventoryJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredInventory, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    const timestamp = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `tides_of_knysna_inventory_${timestamp}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice(`Exported ${filteredInventory.length} items to JSON successfully!`);
    setTimeout(() => setExportNotice(null), 3500);
  };

  // Stock item count adjustment helper with automatic audit logging
  const handleAdjustStock = (id: string, delta: number, actionType: any = 'Manual Adjustment', notes?: string) => {
    const targetItem = inventory.find(i => i.id === id);
    if (targetItem && targetItem.isLocked) {
      alert(`⚠️ Item ${targetItem.itemCode} is locked for scheduled audit/count freeze. Unlock the item before making stock adjustments.`);
      return;
    }

    let oldItem: InventoryItem | undefined;
    let newItem: InventoryItem | undefined;

    const updated = inventory.map(item => {
      if (item.id === id) {
        oldItem = item;
        const newQty = Math.max(0, item.howManyOnHand + delta);
        newItem = {
          ...item,
          howManyOnHand: newQty,
          lastRestocked: delta > 0 ? new Date().toISOString().split('T')[0] : item.lastRestocked
        };
        return newItem;
      }
      return item;
    });

    setInventory(updated);

    if (oldItem && newItem) {
      appendAuditLog({
        itemId: oldItem.id,
        itemCode: oldItem.itemCode,
        itemDescription: oldItem.itemDescription,
        previousQty: oldItem.howManyOnHand,
        newQty: newItem.howManyOnHand,
        deltaQty: delta,
        adjustedBy: currentUser ? `${currentUser.fullName} (${currentUser.role})` : 'Duty Operations Officer',
        actionType: actionType || 'Manual Adjustment',
        notes: notes || (delta > 0 ? `Stock replenishment (+${delta})` : `Stock unit consumed (${delta})`)
      });
    }
  };

  const handleToggleItemLock = (item: InventoryItem) => {
    const nextLocked = !item.isLocked;
    setInventory(prev => prev.map(i => i.id === item.id ? { ...i, isLocked: nextLocked } : i));
    appendAuditLog({
      itemId: item.id,
      itemCode: item.itemCode,
      itemDescription: item.itemDescription,
      previousQty: item.howManyOnHand,
      newQty: item.howManyOnHand,
      deltaQty: 0,
      adjustedBy: currentUser ? `${currentUser.fullName} (${currentUser.role})` : 'Duty Operations Officer',
      actionType: nextLocked ? 'Item Locked for Audit' : 'Item Unlocked',
      notes: nextLocked ? 'Item locked for scheduled audit / inventory count freeze' : 'Item unlocked for regular operations'
    });
  };

  // Bulk Selection & Batch Actions State
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [qrModalItems, setQrModalItems] = useState<InventoryItem[] | null>(null);
  const [qrModalInitialMode, setQrModalInitialMode] = useState<'single' | 'sheet' | 'scanner'>('single');
  const [isSynchronizedAuditModalOpen, setIsSynchronizedAuditModalOpen] = useState(false);
  const [quickContactSupplier, setQuickContactSupplier] = useState<{ name: string; item?: InventoryItem } | null>(null);
  const [batchNotice, setBatchNotice] = useState<string | null>(null);
  const [activeBatchModal, setActiveBatchModal] = useState<'category' | 'supplier' | 'reorder' | 'price' | 'location' | null>(null);
  const [batchLocationInput, setBatchLocationInput] = useState<string>('Main Storeroom Alpha');
  const [batchCategoryInput, setBatchCategoryInput] = useState<string>('Bedding & Linen');
  const [batchSupplierInput, setBatchSupplierInput] = useState<string>('Garden Route Hospitality Supplies');
  const [batchCustomSupplierInput, setBatchCustomSupplierInput] = useState<string>('');
  const [batchReorderInput, setBatchReorderInput] = useState<number>(15);

  // Batch Price Update Tool State
  const [batchPricePercent, setBatchPricePercent] = useState<number>(10);
  const [batchPriceDirection, setBatchPriceDirection] = useState<'increase' | 'decrease'>('increase');
  const [batchPriceRounding, setBatchPriceRounding] = useState<'none' | 'integer' | 'cents99'>('integer');

  const handleApplyBatchPriceUpdate = () => {
    if (selectedItemIds.length === 0) return;
    const count = selectedItemIds.length;
    const factor = batchPriceDirection === 'increase'
      ? (1 + (batchPricePercent / 100))
      : Math.max(0.01, 1 - (batchPricePercent / 100));

    const updated = inventory.map(item => {
      if (selectedItemIds.includes(item.id)) {
        let newPrice = item.pricePerUnit * factor;
        if (batchPriceRounding === 'integer') {
          newPrice = Math.max(1, Math.round(newPrice));
        } else if (batchPriceRounding === 'cents99') {
          newPrice = Math.max(0.99, Math.floor(newPrice) + 0.99);
        } else {
          newPrice = Math.max(0.01, Math.round(newPrice * 100) / 100);
        }

        appendAuditLog({
          itemId: item.id,
          itemCode: item.itemCode,
          itemDescription: item.itemDescription,
          previousQty: item.howManyOnHand,
          newQty: item.howManyOnHand,
          deltaQty: 0,
          adjustedBy: currentUser ? `${currentUser.fullName} (${currentUser.role})` : 'Head of Operations',
          actionType: 'Batch Price Update',
          notes: `Batch price ${batchPriceDirection === 'increase' ? '+' : '-'}${batchPricePercent}% update: R ${item.pricePerUnit} -> R ${newPrice}`
        });

        return { ...item, pricePerUnit: newPrice };
      }
      return item;
    });

    setInventory(updated);
    setActiveBatchModal(null);
    setBatchNotice(`Applied ${batchPriceDirection === 'increase' ? '+' : '-'}${batchPricePercent}% price update across ${count} items.`);
    setTimeout(() => setBatchNotice(null), 4000);
  };

  const standardCategories = [
    'Bedding & Linen',
    'Toiletries & Amenities',
    'Bar & Refreshments',
    'Kitchen & Dining',
    'Cleaning Supplies',
    'Maintenance & Hardware'
  ];

  const standardSuppliers = [
    'Garden Route Hospitality Supplies',
    'Knysna Linen Mills',
    'Cape Botanical Essentials',
    'Garden Route Wine Merchants',
    'Wild Oats Artisan Co-op',
    'Green Clean Garden Route',
    'Knysna Maritime Timber Supplies'
  ];

  // Selection toggle handlers
  const handleToggleSelectItem = (id: string) => {
    setSelectedItemIds(prev => 
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  const handleSelectAllVisible = () => {
    const visibleIds = filteredInventory.map(i => i.id);
    const allVisibleSelected = visibleIds.length > 0 && visibleIds.every(id => selectedItemIds.includes(id));
    if (allVisibleSelected) {
      setSelectedItemIds(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      setSelectedItemIds(prev => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleDeselectAll = () => {
    setSelectedItemIds([]);
  };

  // Batch action implementations
  const handleApplyBatchCategory = (newCat: string) => {
    if (selectedItemIds.length === 0) return;
    const count = selectedItemIds.length;
    setInventory(prev => prev.map(item => {
      if (selectedItemIds.includes(item.id)) {
        return { ...item, category: newCat };
      }
      return item;
    }));
    setActiveBatchModal(null);
    setBatchNotice(`Batch updated category to "${newCat}" across ${count} items.`);
    setTimeout(() => setBatchNotice(null), 4000);
  };

  const handleApplyBatchSupplier = (newSup: string) => {
    if (selectedItemIds.length === 0) return;
    const trimmed = newSup.trim();
    if (!trimmed) return;
    const count = selectedItemIds.length;
    setInventory(prev => prev.map(item => {
      if (selectedItemIds.includes(item.id)) {
        return { ...item, supplier: trimmed };
      }
      return item;
    }));
    setActiveBatchModal(null);
    setBatchCustomSupplierInput('');
    setBatchNotice(`Batch updated supplier to "${trimmed}" across ${count} items.`);
    setTimeout(() => setBatchNotice(null), 4000);
  };

  const handleApplyBatchReorderLevel = (newThreshold: number) => {
    if (selectedItemIds.length === 0) return;
    const count = selectedItemIds.length;
    setInventory(prev => prev.map(item => {
      if (selectedItemIds.includes(item.id)) {
        return { ...item, whenToReorder: Math.max(1, newThreshold) };
      }
      return item;
    }));
    setActiveBatchModal(null);
    setBatchNotice(`Batch updated reorder threshold to ${newThreshold} units across ${count} items.`);
    setTimeout(() => setBatchNotice(null), 4000);
  };

  const handleApplyBatchLocation = (newLoc: string) => {
    if (selectedItemIds.length === 0) return;
    const trimmed = newLoc.trim();
    if (!trimmed) return;
    const count = selectedItemIds.length;
    setInventory(prev => prev.map(item => {
      if (selectedItemIds.includes(item.id)) {
        const prevLocation = item.location || 'Main Store';
        appendAuditLog({
          itemId: item.id,
          itemCode: item.itemCode,
          itemDescription: item.itemDescription,
          previousQty: item.howManyOnHand,
          newQty: item.howManyOnHand,
          deltaQty: 0,
          adjustedBy: currentUser ? `${currentUser.fullName} (${currentUser.role})` : 'Head of Operations',
          actionType: 'Bulk Location Transfer',
          notes: `Bulk transferred storage location from "${prevLocation}" to "${trimmed}"`
        });
        return { ...item, location: trimmed };
      }
      return item;
    }));
    setActiveBatchModal(null);
    setBatchLocationInput('');
    setBatchNotice(`Bulk transferred storage location to "${trimmed}" across ${count} items.`);
    setTimeout(() => setBatchNotice(null), 4000);
  };

  const handleBatchQuickRestock = (qty: number) => {
    if (selectedItemIds.length === 0) return;
    const count = selectedItemIds.length;
    setInventory(prev => prev.map(item => {
      if (selectedItemIds.includes(item.id)) {
        return {
          ...item,
          howManyOnHand: item.howManyOnHand + qty,
          lastRestocked: new Date().toISOString().split('T')[0]
        };
      }
      return item;
    }));
    setBatchNotice(`Replenished +${qty} units across ${count} selected items.`);
    setTimeout(() => setBatchNotice(null), 4000);
  };

  const handleBatchDelete = () => {
    if (selectedItemIds.length === 0) return;
    if (!confirm(`Are you sure you want to remove ${selectedItemIds.length} selected items from inventory?`)) return;
    const count = selectedItemIds.length;
    setInventory(prev => prev.filter(item => !selectedItemIds.includes(item.id)));
    setSelectedItemIds([]);
    setBatchNotice(`Removed ${count} items from inventory.`);
    setTimeout(() => setBatchNotice(null), 4000);
  };

  const handleExportBatchAuditReportCsv = () => {
    if (selectedItemIds.length === 0) return;
    const selectedItems = inventory.filter(i => selectedItemIds.includes(i.id));

    const headers = ['Item Code', 'Description', 'Category', 'Location', 'Lock Status', 'On Hand', 'Unit', 'Price (ZAR)', 'Last Adjustment Timestamp', 'Action Type', 'Adjusted By', 'Audit Notes'];
    const rows: string[] = [];

    selectedItems.forEach(item => {
      const itemLogs = stockAuditLogs
        .filter(log => log.itemId === item.id)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      if (itemLogs.length > 0) {
        itemLogs.forEach(log => {
          rows.push([
            `"${item.itemCode}"`,
            `"${item.itemDescription.replace(/"/g, '""')}"`,
            `"${item.category.replace(/"/g, '""')}"`,
            `"${item.location || 'Main Store'}"`,
            `"${item.isLocked ? 'Locked' : 'Active'}"`,
            item.howManyOnHand,
            `"${item.unit}"`,
            item.pricePerUnit,
            `"${log.timestamp}"`,
            `"${log.actionType}"`,
            `"${log.adjustedBy.replace(/"/g, '""')}"`,
            `"${(log.notes || '').replace(/"/g, '""')}"`
          ].join(','));
        });
      } else {
        rows.push([
          `"${item.itemCode}"`,
          `"${item.itemDescription.replace(/"/g, '""')}"`,
          `"${item.category.replace(/"/g, '""')}"`,
          `"${item.location || 'Main Store'}"`,
          `"${item.isLocked ? 'Locked' : 'Active'}"`,
          item.howManyOnHand,
          `"${item.unit}"`,
          item.pricePerUnit,
          `"N/A"`,
          `"Initial Stock Record"`,
          `"System"`,
          `"No historical adjustments recorded"`
        ].join(','));
      }
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const timestamp = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `batch_audit_report_${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setBatchNotice(`Generated and downloaded Batch Audit Report for ${selectedItems.length} items.`);
    setTimeout(() => setBatchNotice(null), 4000);
  };

  const handleBatchStatusToggle = () => {
    if (selectedItemIds.length === 0) return;
    const count = selectedItemIds.length;
    const selectedItems = inventory.filter(i => selectedItemIds.includes(i.id));
    const allLocked = selectedItems.every(i => i.isLocked);
    const nextLocked = !allLocked;

    setInventory(prev => prev.map(item => {
      if (selectedItemIds.includes(item.id)) {
        appendAuditLog({
          itemId: item.id,
          itemCode: item.itemCode,
          itemDescription: item.itemDescription,
          previousQty: item.howManyOnHand,
          newQty: item.howManyOnHand,
          deltaQty: 0,
          adjustedBy: currentUser ? `${currentUser.fullName} (${currentUser.role})` : 'Head of Operations',
          actionType: nextLocked ? 'Batch Item Locked for Audit' : 'Batch Item Unlocked',
          notes: nextLocked ? 'Batch locked for scheduled audit count freeze' : 'Batch unlocked for regular operations'
        });
        return { ...item, isLocked: nextLocked };
      }
      return item;
    }));

    setBatchNotice(`Batch status toggled: ${nextLocked ? 'Locked' : 'Unlocked'} ${count} selected items.`);
    setTimeout(() => setBatchNotice(null), 4000);
  };

  const handleOpenBatchQrModal = () => {
    const selected = inventory.filter(i => selectedItemIds.includes(i.id));
    if (selected.length === 0) return;
    setQrModalItems(selected);
    setQrModalInitialMode('sheet');
  };

  const handleOpenBatchQrScanner = () => {
    const selected = inventory.filter(i => selectedItemIds.includes(i.id));
    setQrModalItems(selected.length > 0 ? selected : filteredInventory);
    setQrModalInitialMode('scanner');
  };

  const handleApplySynchronizedAuditCounts = (
    auditResults: { itemId: string; physicalCount: number; difference: number; unitPrice: number; notes: string }[],
    auditReason: string,
    auditorName: string
  ) => {
    let netDifference = 0;
    let totalValueImpact = 0;
    const nowIso = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const updated = inventory.map(item => {
      const auditRecord = auditResults.find(r => r.itemId === item.id);
      if (auditRecord) {
        netDifference += auditRecord.difference;
        totalValueImpact += auditRecord.difference * auditRecord.unitPrice;
        return {
          ...item,
          howManyOnHand: auditRecord.physicalCount,
          lastRestocked: auditRecord.difference > 0 ? new Date().toISOString().split('T')[0] : item.lastRestocked
        };
      }
      return item;
    });

    setInventory(updated);

    // Record formal audit entries in stockAuditLogs
    auditResults.forEach(res => {
      const origItem = inventory.find(i => i.id === res.itemId);
      if (origItem) {
        appendAuditLog({
          itemId: origItem.id,
          itemCode: origItem.itemCode,
          itemDescription: origItem.itemDescription,
          previousQty: origItem.howManyOnHand,
          newQty: res.physicalCount,
          deltaQty: res.difference,
          adjustedBy: auditorName || (currentUser ? `${currentUser.fullName} (${currentUser.role})` : 'Lead Auditor'),
          actionType: 'Synchronized Audit Count',
          notes: `[${auditReason}] Difference: ${res.difference > 0 ? `+${res.difference}` : res.difference} units (Impact: R ${(res.difference * res.unitPrice).toFixed(2)}). Notes: ${res.notes || 'Reconciled during synchronized audit count'}`
        });
      }
    });

    setBatchNotice(
      `Synchronized Audit Count successfully committed for ${auditResults.length} items. Net Variance: ${netDifference > 0 ? `+${netDifference}` : netDifference} units (Financial Impact: ${totalValueImpact < 0 ? '-' : '+'}R ${Math.abs(totalValueImpact).toLocaleString(undefined, { minimumFractionDigits: 2 })}).`
    );
    setTimeout(() => setBatchNotice(null), 6000);
    setSelectedItemIds([]);
    setIsSynchronizedAuditModalOpen(false);
  };

  // Quick guest login
  const handleQuickGuestLogin = () => {
    const guestUser = INITIAL_USERS.find(u => u.role === 'guest') || {
      id: 'usr-guest',
      fullName: 'Valued Guest (Trial)',
      username: 'guest',
      email: 'guest@tidesofknysna.co.za',
      role: 'guest' as const,
      securityQuestion1: 'Preferred Holiday Spot',
      securityAnswer1: 'Knysna Heads',
      securityQuestion2: 'First Pet Name',
      securityAnswer2: 'Simba'
    };
    setCurrentUser(guestUser);
    setActiveTab('guestportal');
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 font-sans selection:bg-emerald-500 selection:text-white">
      {/* Global Header */}
      <Header
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onQuickGuestLogin={handleQuickGuestLogin}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        companyInfo={companyInfo}
        lowStockCount={lowStockCount}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between pb-4 no-print text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className="hover:text-emerald-700 font-medium"
            >
              Lagoon Terminal
            </button>
            <span>/</span>
            <span className="font-bold text-slate-900 capitalize">
              {activeTab === 'guestportal' ? 'Guest Self-Service Portal' :
               activeTab === 'company' ? 'Company Profile (All Editable)' :
               activeTab === 'employees' ? 'Employees & HR Management' :
               activeTab === 'reservations' ? 'Reservations & Booking Engine' :
               activeTab === 'checkin' ? 'Guest Arrival & Check-In' :
               activeTab === 'departure' ? 'Departure & Room Inspection' :
               activeTab === 'accounting' ? 'Accounting & Financial Records' :
               activeTab === 'marketing' ? 'Marketing & Brand Studio' :
               activeTab === 'suppliers' ? 'Approved Supplier & Vendor Contacts' :
               activeTab === 'inventory' ? 'Inventory & Stock Control Engine' :
               activeTab === 'checklists' ? '5-Area Cleanliness Checklists' :
               activeTab === 'attractions' ? 'Sightseeing & Guest Concierge' :
               activeTab}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {lowStockCount > 0 && (
              <button
                onClick={() => setActiveTab('inventory')}
                className="inline-flex items-center gap-1.5 text-rose-700 font-bold bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200 animate-pulse hover:bg-rose-100 transition"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                {lowStockCount} Low Stock Reorder Triggers
              </button>
            )}
            <span className="inline-flex items-center gap-1.5 text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Knysna Exclusive System Active
            </span>
          </div>
        </div>

        {/* Tab Routing */}
        {activeTab === 'dashboard' && (
          <DashboardView
            reservations={reservations}
            onSelectTab={setActiveTab}
            currentUser={currentUser}
            onOpenAuth={() => setIsAuthOpen(true)}
            companyInfo={companyInfo}
            inventory={inventory}
            onOpenSupplierModal={(sup) => setQuickContactSupplier({ name: sup })}
          />
        )}

        {/* GUEST PORTAL TAB */}
        {activeTab === 'guestportal' && (
          <GuestPortal
            reservations={reservations}
            onUpdateReservations={setReservations}
            companyInfo={companyInfo}
            initialBookingRef={currentUser?.role === 'guest' ? 'TOK-2026-0891' : ''}
            initialSurname={currentUser?.role === 'guest' ? 'Vanderbilt' : ''}
          />
        )}

        {/* COMPANY INFORMATION ALL EDITABLE TAB */}
        {activeTab === 'company' && (
          <CompanyInfoModule
            companyInfo={companyInfo}
            onSaveCompanyInfo={handleSaveCompanyInfo}
            onResetDefaults={handleResetCompanyDefaults}
          />
        )}

        {activeTab === 'employees' && (
          <EmployeesModule reservations={reservations} />
        )}

        {activeTab === 'suppliers' && (
          <SuppliersModule />
        )}

        {activeTab === 'reservations' && (
          <ReservationsModule
            reservations={reservations}
            onUpdateReservations={setReservations}
            companyInfo={companyInfo}
          />
        )}

        {activeTab === 'checkin' && (
          <CheckInModule
            reservations={reservations}
            companyInfo={companyInfo}
          />
        )}

        {activeTab === 'departure' && (
          <DepartureModule
            reservations={reservations}
            companyInfo={companyInfo}
          />
        )}

        {activeTab === 'accounting' && (
          <AccountingModule reservations={reservations} />
        )}

        {activeTab === 'marketing' && (
          <MarketingModule 
            companyInfo={companyInfo}
            onUpdateCompanyInfo={handleSaveCompanyInfo}
          />
        )}

        {/* INVENTORY TAB */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <DocumentActionBar
              documentTitle="Master Inventory & Amenities Stock Sheet"
              documentNumber="INV-STOCK-2026"
              onSave={() => alert('Stock levels verified and updated.')}
            />

            {/* Inventory Sub-Tab Navigation Bar */}
            <div className="flex items-center gap-2 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
              <button
                onClick={() => setInventorySubTab('matrix')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                  inventorySubTab === 'matrix' ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
                Stock Control Matrix
              </button>
              <button
                onClick={() => setInventorySubTab('forecast')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                  inventorySubTab === 'forecast' ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Inventory Forecasting
              </button>
              <button
                onClick={() => setInventorySubTab('feedback')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                  inventorySubTab === 'feedback' ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                Digital Guest Feedback & Audit
              </button>
              <button
                onClick={() => setInventorySubTab('supplier_performance')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                  inventorySubTab === 'supplier_performance' ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Truck className="w-4 h-4 text-amber-400" />
                Supplier Performance & Analytics
              </button>

              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={() => setIsDraftPoModalOpen(true)}
                  className="px-3.5 py-2 bg-gradient-to-r from-teal-600 to-emerald-700 hover:from-teal-500 hover:to-emerald-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition whitespace-nowrap"
                  title="Generate Draft Purchase Order for low stock items"
                >
                  <Mail className="w-3.5 h-3.5 text-teal-200" />
                  Generate Draft PO ({lowStockCount})
                </button>
              </div>
            </div>

            {inventorySubTab === 'forecast' && (
              <InventoryForecastingModule
                inventory={inventory}
                reservations={reservations}
                initialTab="forecast"
              />
            )}

            {inventorySubTab === 'feedback' && (
              <InventoryForecastingModule
                inventory={inventory}
                reservations={reservations}
                initialTab="feedback_correlator"
              />
            )}

            {inventorySubTab === 'supplier_performance' && (
              <SupplierPerformanceModule
                inventory={inventory}
                onOpenSupplierModal={(sup) => setQuickContactSupplier({ name: sup })}
                onGenerateDraftPo={() => setIsDraftPoModalOpen(true)}
              />
            )}

            {inventorySubTab === 'matrix' && (
              <>
                {/* Notification System for Reorder Alerts & Revenue Forecasting */}
                <InventoryNotificationSystem
                  inventory={inventory}
                  onUpdateInventory={setInventory}
                  reservations={reservations}
                  companyInfo={companyInfo}
                  onOpenAccounting={() => setActiveTab('accounting')}
                />

                {/* Comprehensive Visual Inventory Analytics & Health Charts */}
                <InventoryChartsSection
                  inventory={inventory}
                  onSelectCategoryFilter={(cat) => setInventoryCategoryFilter(cat)}
                  onOpenSupplierModal={(sup) => setQuickContactSupplier({ name: sup })}
                  onOpenPredictiveCalculator={(item) => {
                    setPredictiveCalculatorItem(item || null);
                    setIsPredictiveCalculatorOpen(true);
                  }}
                />

                {/* Stock Control Matrix with Interactive Adjustments */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif-luxury font-bold text-slate-900 text-base">
                      Inventory & Stock Control Matrix
                    </h3>
                    <p className="text-xs text-slate-500">600TC Egyptian Linens, Fynbos Amenities, Bar Stocks & Supplies</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Audit Trail & Tools */}
                  <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                      onClick={() => {
                        setAuditLogFilterItemId(null);
                        setIsAuditLogOpen(true);
                      }}
                      title="View historical changes to inventory (who adjusted stock, by how much, and when)"
                      className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-lg text-xs flex items-center gap-1 border border-slate-200 shadow-xs transition"
                    >
                      <History className="w-3.5 h-3.5 text-indigo-600" />
                      Stock Audit Log ({stockAuditLogs.length})
                    </button>
                    <button
                      onClick={handleExportInventoryCsv}
                      title="Export current filtered view to CSV file"
                      className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-lg text-xs flex items-center gap-1 border border-slate-200 shadow-xs transition"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-600" />
                      Export CSV
                    </button>
                    <button
                      onClick={handleExportInventoryJson}
                      title="Export current filtered view to JSON file"
                      className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-lg text-xs flex items-center gap-1 border border-slate-200 shadow-xs transition"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      Export JSON
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setPredictiveCalculatorItem(null);
                      setIsPredictiveCalculatorOpen(true);
                    }}
                    className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
                    title="Open Predictive Order Date Calculator"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                    Predictive Order Date Calculator
                  </button>

                  <button
                    onClick={() => {
                      setAuditLogFilterItemId(null);
                      setIsAuditLogOpen(true);
                    }}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
                    title="Open Stock Audit Log to review historical adjustments and changes"
                  >
                    <History className="w-3.5 h-3.5 text-indigo-600" />
                    Stock Audit Log ({stockAuditLogs.length})
                  </button>

                  <button
                    onClick={() => {
                      setQrModalItems(filteredInventory);
                      setQrModalInitialMode('scanner');
                    }}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
                    title="Open QR Asset Scanner & Tag Generator"
                  >
                    <QrIcon className="w-3.5 h-3.5 text-emerald-400" />
                    QR Asset Scanner
                  </button>

                  <button
                    onClick={() => {
                      const newItem: InventoryItem = {
                        id: `inv-${Date.now()}`,
                        itemCode: `STK-${Math.floor(100 + Math.random() * 900)}`,
                        itemDescription: 'New Inventory Item',
                        category: 'Toiletries & Amenities',
                        pricePerUnit: 120,
                        howManyUsed: 0,
                        whenToReorder: 10,
                        howManyOnHand: 8, // Triggers alert for demonstration
                        unit: 'units',
                        supplier: 'Garden Route Hospitality Supplies',
                        lastRestocked: new Date().toISOString().split('T')[0],
                        location: 'Main Storeroom Alpha',
                        priority: 'Medium',
                        expiryDate: '2026-11-20',
                        notes: 'Newly added stock item. Inspect upon arrival.',
                        notas: 'Artículo recién añadido. Inspeccionar al llegar.'
                      };
                      setInventory([newItem, ...inventory]);
                    }}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Stock Item
                  </button>
                </div>
              </div>

              {/* Export Success Notification Banner */}
              {exportNotice && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-2.5 rounded-xl flex items-center justify-between text-xs font-medium animate-fade-in">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{exportNotice}</span>
                  </div>
                  <button onClick={() => setExportNotice(null)} className="text-emerald-700 hover:text-emerald-900">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* SEARCH & FILTER CONTROLS BAR */}
              <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  {/* Search Bar Input */}
                  <div className="relative flex-1 w-full">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search inventory by description, item code (e.g. TOI-2001), or supplier..."
                      value={inventorySearchQuery}
                      onChange={(e) => setInventorySearchQuery(e.target.value)}
                      className="w-full text-xs pl-9 pr-8 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none placeholder:text-slate-400"
                    />
                    {inventorySearchQuery && (
                      <button
                        onClick={() => setInventorySearchQuery('')}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                        title="Clear search"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Stock Status Filter Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0 w-full sm:w-auto overflow-x-auto">
                    <button
                      onClick={() => setInventoryStockStatusFilter('All')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                        inventoryStockStatusFilter === 'All'
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      All ({inventory.length})
                    </button>
                    <button
                      onClick={() => setInventoryStockStatusFilter('LowStock')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center gap-1 ${
                        inventoryStockStatusFilter === 'LowStock'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
                      }`}
                    >
                      <AlertTriangle className="w-3 h-3 text-rose-500" />
                      Reorder Alert ({lowStockCount})
                    </button>
                    <button
                      onClick={() => setInventoryStockStatusFilter('Adequate')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center gap-1 ${
                        inventoryStockStatusFilter === 'Adequate'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                      }`}
                    >
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      Adequate ({inventory.length - lowStockCount})
                    </button>
                  </div>
                </div>

                {/* Categories Row */}
                <div className="flex items-center gap-1.5 overflow-x-auto pt-1 text-[11px]">
                  <span className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
                    <Filter className="w-3 h-3" /> Category:
                  </span>
                  {['All', 'Bedding & Linen', 'Toiletries & Amenities', 'Bar & Cellar', 'Cleaning Supplies'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setInventoryCategoryFilter(cat)}
                      className={`px-2.5 py-1 rounded-md font-semibold transition shrink-0 ${
                        inventoryCategoryFilter === cat
                          ? 'bg-emerald-600 text-white font-bold'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                  <button
                    onClick={() => setIsRowHeightened(!isRowHeightened)}
                    className={`ml-2 px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 transition shrink-0 ${
                      isRowHeightened ? 'bg-indigo-600 text-white font-bold' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                    title="Toggle row heightening for enhanced reading and action comfort"
                  >
                    <span>↕️ {isRowHeightened ? 'Compact Rows' : 'Heighten Rows'}</span>
                  </button>
                  {(inventorySearchQuery || inventoryCategoryFilter !== 'All' || inventoryStockStatusFilter !== 'All' || inventoryExpiryFilter !== 'All') && (
                    <button
                      onClick={() => {
                        setInventorySearchQuery('');
                        setInventoryCategoryFilter('All');
                        setInventoryStockStatusFilter('All');
                        setInventoryExpiryFilter('All');
                      }}
                      className="ml-auto text-slate-500 hover:text-slate-800 font-bold flex items-center gap-1 px-2 py-0.5 rounded hover:bg-slate-200 transition shrink-0"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Reset Filters
                    </button>
                  )}
                </div>

                {/* Expiry Date Filter Row */}
                <div className="flex items-center gap-1.5 overflow-x-auto pt-2 text-[11px] border-t border-slate-200/60 mt-2">
                  <span className="text-amber-800 font-bold uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
                    📅 Expiry Filter:
                  </span>
                  {[
                    { label: 'All Expiries', value: 'All', count: inventory.length },
                    { label: '⚠️ Overdue', value: 'Overdue', count: expiryFilterCounts.overdue, isOverdue: true },
                    { label: 'Next 30 Days', value: '30Days', count: expiryFilterCounts.days30, isWarn: true },
                    { label: 'Next 60 Days', value: '60Days', count: expiryFilterCounts.days60 },
                    { label: 'Next 90 Days', value: '90Days', count: expiryFilterCounts.days90 },
                    { label: 'Next 120 Days', value: '120Days', count: expiryFilterCounts.days120 }
                  ].map(exp => (
                    <button
                      key={exp.value}
                      onClick={() => setInventoryExpiryFilter(exp.value as any)}
                      className={`px-2.5 py-1 rounded-md font-semibold transition shrink-0 flex items-center gap-1.5 ${
                        inventoryExpiryFilter === exp.value
                          ? exp.value === 'Overdue'
                            ? 'bg-rose-600 text-white font-bold shadow-xs ring-2 ring-rose-400'
                            : 'bg-amber-600 text-white font-bold shadow-xs ring-2 ring-amber-400'
                          : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                      }`}
                      title={`Filter inventory by ${exp.label} (${exp.count} items match)`}
                    >
                      <span>{exp.label}</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                        inventoryExpiryFilter === exp.value
                          ? 'bg-white/20 text-white'
                          : exp.isOverdue && exp.count > 0
                          ? 'bg-rose-100 text-rose-700 animate-pulse font-extrabold'
                          : exp.isWarn && exp.count > 0
                          ? 'bg-amber-100 text-amber-800 font-bold'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {exp.count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Active Expiry Pulse Spotlight Notification */}
                {inventoryExpiryFilter !== 'All' && (
                  <div className={`mt-2.5 px-3.5 py-2 rounded-xl text-xs flex items-center justify-between border shadow-xs animate-fade-in ${
                    inventoryExpiryFilter === 'Overdue'
                      ? 'bg-rose-50 border-rose-200 text-rose-900'
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <span className="relative flex h-3 w-3 shrink-0">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                          inventoryExpiryFilter === 'Overdue' ? 'bg-rose-500' : 'bg-amber-500'
                        }`}></span>
                        <span className={`relative inline-flex rounded-full h-3 w-3 ${
                          inventoryExpiryFilter === 'Overdue' ? 'bg-rose-600' : 'bg-amber-600'
                        }`}></span>
                      </span>
                      <div>
                        <span className="font-bold">
                          {inventoryExpiryFilter === 'Overdue' ? '🚨 Overdue Items Spotlight:' : '⏳ Expiry Date Spotlight:'}
                        </span>{' '}
                        <span>
                          Pulsing visual effect active for <strong>{filteredInventory.length}</strong> item{filteredInventory.length === 1 ? '' : 's'} matching <strong>"{inventoryExpiryFilter}"</strong> criteria.
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setInventoryExpiryFilter('All')}
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg border transition shrink-0 ml-2 ${
                        inventoryExpiryFilter === 'Overdue'
                          ? 'bg-white text-rose-700 border-rose-300 hover:bg-rose-100'
                          : 'bg-white text-amber-800 border-amber-300 hover:bg-amber-100'
                      }`}
                    >
                      Clear Expiry Filter
                    </button>
                  </div>
                )}
              </div>

              {/* Batch Action Success Notice */}
              {batchNotice && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-2.5 rounded-xl flex items-center justify-between text-xs font-medium animate-fade-in">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{batchNotice}</span>
                  </div>
                  <button onClick={() => setBatchNotice(null)} className="text-emerald-700 hover:text-emerald-900">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* BATCH ACTION TOOLBAR (Shown when items are selected) */}
              {selectedItemIds.length > 0 && (
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-3.5 sm:p-4 rounded-2xl shadow-xl border border-slate-700 flex flex-wrap items-center justify-between gap-3 animate-fade-in sticky top-2 z-20">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500 text-slate-950 flex items-center gap-1.5 shadow-sm">
                      <CheckCheck className="w-3.5 h-3.5" />
                      {selectedItemIds.length} Selected
                    </span>
                    <button
                      onClick={handleDeselectAll}
                      className="text-xs text-slate-300 hover:text-white underline underline-offset-2 ml-1"
                    >
                      Deselect All
                    </button>
                    {selectedItemIds.length < filteredInventory.length && (
                      <button
                        onClick={handleSelectAllVisible}
                        className="text-xs text-emerald-300 hover:text-emerald-200 underline underline-offset-2 ml-2"
                      >
                        Select All ({filteredInventory.length})
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {/* Synchronized Bulk Audit Count */}
                    <button
                      onClick={() => setIsSynchronizedAuditModalOpen(true)}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 hover:from-indigo-600 hover:to-indigo-700 text-white font-extrabold rounded-xl flex items-center gap-1.5 shadow-md transition border border-indigo-400/40"
                      title="Perform Synchronized Audit Count: Record Physical vs System stock difference for all selected items at once"
                    >
                      <ClipboardCheck className="w-3.5 h-3.5 text-indigo-200" />
                      Synchronized Audit Count ({selectedItemIds.length})
                    </button>

                    {/* QR Asset Scanner */}
                    <button
                      onClick={handleOpenBatchQrScanner}
                      className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-md transition border border-emerald-500/40"
                      title="Launch QR Asset Scanner for rapid barcode scanning & verification"
                    >
                      <QrIcon className="w-3.5 h-3.5 text-emerald-200" />
                      QR Asset Scanner
                    </button>

                    {/* Batch Audit Report CSV */}
                    <button
                      onClick={handleExportBatchAuditReportCsv}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition"
                      title="Generate and download CSV audit report detailing adjustment history for selected items"
                    >
                      <History className="w-3.5 h-3.5 text-indigo-200" />
                      Batch Audit Report
                    </button>

                    {/* Batch Lock / Unlock */}
                    <button
                      onClick={handleBatchStatusToggle}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition"
                      title="Batch Lock/Unlock: Freeze or unfreeze stock count adjustments on selected items"
                    >
                      {selectedItemIds.length > 0 && inventory.filter(i => selectedItemIds.includes(i.id)).every(i => i.isLocked) ? (
                        <>
                          <Unlock className="w-3.5 h-3.5 text-amber-200" />
                          Batch Unlock ({selectedItemIds.length})
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5 text-amber-200" />
                          Batch Lock/Unlock
                        </>
                      )}
                    </button>

                    {/* Bulk Transfer Location */}
                    <button
                      onClick={() => setActiveBatchModal('location')}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold flex items-center gap-1.5 border border-slate-700 transition"
                      title="Bulk transfer storage location across selected items"
                    >
                      <MapPin className="w-3.5 h-3.5 text-purple-400" />
                      Bulk Transfer Location
                    </button>

                    {/* Batch Update Category */}
                    <button
                      onClick={() => setActiveBatchModal('category')}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold flex items-center gap-1.5 border border-slate-700 transition"
                      title="Batch update category on selected items"
                    >
                      <Layers className="w-3.5 h-3.5 text-indigo-400" />
                      Category
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    </button>

                    {/* Batch Update Supplier */}
                    <button
                      onClick={() => setActiveBatchModal('supplier')}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold flex items-center gap-1.5 border border-slate-700 transition"
                      title="Batch update supplier on selected items"
                    >
                      <Truck className="w-3.5 h-3.5 text-sky-400" />
                      Supplier
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    </button>

                    {/* Batch Update Reorder Level */}
                    <button
                      onClick={() => setActiveBatchModal('reorder')}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold flex items-center gap-1.5 border border-slate-700 transition"
                      title="Batch update reorder threshold on selected items"
                    >
                      <Sliders className="w-3.5 h-3.5 text-amber-400" />
                      Reorder Level
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    </button>

                    {/* Batch Price Update Tool */}
                    <button
                      onClick={() => setActiveBatchModal('price')}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold flex items-center gap-1.5 border border-slate-700 transition"
                      title="Batch percentage price increase or decrease across selected items"
                    >
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      Batch Price Update
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    </button>

                    {/* Quick Restock Batch */}
                    <button
                      onClick={() => handleBatchQuickRestock(10)}
                      className="px-3 py-1.5 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 rounded-xl font-bold flex items-center gap-1.5 border border-emerald-700/60 transition"
                      title="Replenish +10 units to all selected items"
                    >
                      <Plus className="w-3.5 h-3.5 text-emerald-400" />
                      +10 to All
                    </button>

                    {/* Batch QR Generator */}
                    <button
                      onClick={handleOpenBatchQrModal}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md transition"
                      title="Generate Scannable QR Asset Tags for selected items"
                    >
                      <QrIcon className="w-3.5 h-3.5 text-emerald-200" />
                      Generate QR Codes ({selectedItemIds.length})
                    </button>

                    {/* Batch Delete */}
                    <button
                      onClick={handleBatchDelete}
                      className="p-1.5 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 rounded-xl border border-rose-800/60 transition"
                      title="Delete selected items"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Filter result status count */}
              <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                <span>
                  Showing <strong className="text-slate-900">{filteredInventory.length}</strong> of <strong className="text-slate-900">{inventory.length}</strong> items
                  {inventorySearchQuery && <span> matching "<strong>{inventorySearchQuery}</strong>"</span>}
                  {selectedItemIds.length > 0 && <span className="ml-2 font-bold text-emerald-700">({selectedItemIds.length} items checked)</span>}
                </span>
                <span className="text-[11px] text-slate-400">
                  Select checkboxes for simultaneous batch updates or click QR to view asset tag.
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2.5 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={filteredInventory.length > 0 && filteredInventory.every(i => selectedItemIds.includes(i.id))}
                          onChange={handleSelectAllVisible}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          title="Select / Deselect all visible items"
                        />
                      </th>
                      <th className="px-3 py-2.5">Item Code</th>
                      <th className="px-3 py-2.5">Description</th>
                      <th className="px-3 py-2.5">Category</th>
                      <th className="px-3 py-2.5">Supplier</th>
                      <th className="px-3 py-2.5">Location</th>
                      <th className="px-3 py-2.5">Price / Unit</th>
                      <th className="px-3 py-2.5">On Hand</th>
                      <th className="px-3 py-2.5">Reorder Level</th>
                      <th className="px-3 py-2.5 min-w-[210px]">Notes / Notas</th>
                      <th className="px-3 py-2.5">Adjust Stock</th>
                      <th className="px-3 py-2.5 text-center">Audit</th>
                      <th className="px-3 py-2.5 text-center">QR Tag</th>
                      <th className="px-3 py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredInventory.length === 0 ? (
                      <tr>
                        <td colSpan={14} className="px-4 py-8 text-center text-slate-400 text-xs">
                          <Search className="w-6 h-6 mx-auto text-slate-300 mb-2" />
                          <p className="font-semibold text-slate-600">No inventory items matched your search criteria.</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">Try searching for a different item description, code, or reset the filters.</p>
                          <button
                            onClick={() => {
                              setInventorySearchQuery('');
                              setInventoryCategoryFilter('All');
                              setInventoryStockStatusFilter('All');
                              setInventoryExpiryFilter('All');
                            }}
                            className="mt-2.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs inline-flex items-center gap-1 transition"
                          >
                            <RefreshCw className="w-3 h-3" />
                            Clear Search & Filters
                          </button>
                        </td>
                      </tr>
                    ) : (
                      filteredInventory.map(item => {
                        const isLow = item.howManyOnHand <= item.whenToReorder;
                        const isSelected = selectedItemIds.includes(item.id);
                        const priority = item.priority || 'Medium';

                        // Evaluate item expiry against active filter
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        let itemDiffDays: number | null = null;
                        let isItemOverdue = false;
                        let matchesActiveExpiryFilter = false;

                        if (item.expiryDate) {
                          const expDate = new Date(item.expiryDate);
                          expDate.setHours(0, 0, 0, 0);
                          itemDiffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                          isItemOverdue = itemDiffDays < 0;

                          if (inventoryExpiryFilter !== 'All') {
                            if (inventoryExpiryFilter === 'Overdue' && isItemOverdue) matchesActiveExpiryFilter = true;
                            else if (inventoryExpiryFilter === '30Days' && itemDiffDays >= 0 && itemDiffDays <= 30) matchesActiveExpiryFilter = true;
                            else if (inventoryExpiryFilter === '60Days' && itemDiffDays >= 0 && itemDiffDays <= 60) matchesActiveExpiryFilter = true;
                            else if (inventoryExpiryFilter === '90Days' && itemDiffDays >= 0 && itemDiffDays <= 90) matchesActiveExpiryFilter = true;
                            else if (inventoryExpiryFilter === '120Days' && itemDiffDays >= 0 && itemDiffDays <= 120) matchesActiveExpiryFilter = true;
                          }
                        }

                        const pulsingClass = matchesActiveExpiryFilter
                          ? (isItemOverdue
                              ? 'expiry-pulse-row-overdue border-l-4 border-l-rose-600 ring-2 ring-inset ring-rose-400/80 shadow-md'
                              : 'expiry-pulse-row-matching border-l-4 border-l-amber-500 ring-2 ring-inset ring-amber-400/80 shadow-md')
                          : '';

                        const priorityBgClass = isSelected ? 'bg-emerald-50/85' :
                                               matchesActiveExpiryFilter ? (isItemOverdue ? 'bg-rose-50/70 hover:bg-rose-50' : 'bg-amber-50/60 hover:bg-amber-50') :
                                               item.isLocked ? 'bg-amber-100/90 hover:bg-amber-100 border-l-4 border-l-amber-600 shadow-2xs' :
                                               priority === 'High' ? 'bg-rose-50/40 hover:bg-rose-50/70 border-l-4 border-l-rose-500' :
                                               priority === 'Medium' ? 'bg-amber-50/30 hover:bg-amber-50/50 border-l-4 border-l-amber-400' :
                                               'hover:bg-slate-50 border-l-4 border-l-slate-300';

                        return (
                          <React.Fragment key={item.id}>
                            <tr 
                              className={`transition-all duration-300 ${pulsingClass || priorityBgClass} ${isRowHeightened ? 'h-16' : ''}`}
                            >
                            <td className="px-3 py-2 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleSelectItem(item.id)}
                                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                              />
                            </td>
                            <td className="px-3 py-2 font-mono font-bold text-slate-700">
                              <div className="flex items-center gap-1.5">
                                {matchesActiveExpiryFilter && (
                                  <span className="relative flex h-2.5 w-2.5 shrink-0" title={`Matches "${inventoryExpiryFilter}" expiry criteria (${itemDiffDays !== null ? (itemDiffDays < 0 ? `${Math.abs(itemDiffDays)}d overdue` : `${itemDiffDays}d remaining`) : ''})`}>
                                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                                      isItemOverdue ? 'bg-rose-500' : 'bg-amber-500'
                                    }`}></span>
                                    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                                      isItemOverdue ? 'bg-rose-600' : 'bg-amber-600'
                                    }`}></span>
                                  </span>
                                )}
                                <span>{item.itemCode}</span>
                              </div>
                            </td>
                            <td className="px-3 py-2 font-semibold text-slate-900">{item.itemDescription}</td>
                            <td className="px-3 py-2">
                              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 whitespace-nowrap">
                                {item.category}
                              </span>
                            </td>
                            <td className="px-3 py-2 max-w-[170px]">
                              <button
                                type="button"
                                onClick={() => setQuickContactSupplier({ name: item.supplier, item })}
                                className="text-left font-medium text-emerald-800 hover:text-emerald-950 hover:underline flex items-center gap-1.5 group max-w-full truncate transition"
                                title={`Click to open Quick Contact & pre-filled email for ${item.supplier}`}
                              >
                                <Truck className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 shrink-0" />
                                <span className="truncate">{item.supplier}</span>
                                <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 text-emerald-600 shrink-0 transition" />
                              </button>
                            </td>
                            <td className="px-3 py-2">
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-800 border border-purple-200 flex items-center gap-1 w-max">
                                <MapPin className="w-2.5 h-2.5 text-purple-600" />
                                {item.location || 'Main Store'}
                              </span>
                            </td>
                            <td className="px-3 py-2 font-bold text-slate-800">R {item.pricePerUnit}</td>
                            <td className="px-3 py-2 font-bold text-slate-900">{item.howManyOnHand} {item.unit}</td>
                            <td className="px-3 py-2 text-slate-500">{item.whenToReorder} {item.unit}</td>

                            {/* Notes / Notas Field Cell */}
                            <td className="px-3 py-2">
                              <div className="flex flex-col gap-1 max-w-[240px]">
                                {item.notes ? (
                                  <div 
                                    onClick={() => handleOpenNotesModal(item)}
                                    className="cursor-pointer group flex items-start gap-1.5 text-[11px] text-slate-700 bg-amber-50/80 hover:bg-amber-100/90 border border-amber-200/90 px-2.5 py-1.5 rounded-lg transition shadow-2xs"
                                    title="Click to view/edit English notes"
                                  >
                                    <FileText className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                                    <span className="line-clamp-2 font-medium leading-tight">{item.notes}</span>
                                  </div>
                                ) : null}
                                {item.notas ? (
                                  <div 
                                    onClick={() => handleOpenNotesModal(item)}
                                    className="cursor-pointer group flex items-start gap-1.5 text-[10.5px] text-slate-600 bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-200 px-2.5 py-1 rounded-lg transition"
                                    title="Click to view/edit Spanish notas"
                                  >
                                    <span className="px-1 py-0.2 rounded text-[8.5px] font-bold bg-indigo-100 text-indigo-700 shrink-0 mt-0.5">ES</span>
                                    <span className="line-clamp-1 italic text-slate-500 font-serif leading-tight">{item.notas}</span>
                                  </div>
                                ) : null}
                                {!item.notes && !item.notas ? (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenNotesModal(item)}
                                    className="px-2 py-1 rounded-lg border border-dashed border-slate-300 text-slate-400 hover:text-slate-700 hover:border-slate-400 hover:bg-slate-50 text-[10px] font-medium flex items-center gap-1 transition w-max"
                                    title="Add notes/notas for this item"
                                  >
                                    <Plus className="w-3 h-3 text-slate-400" />
                                    <span>Add Note / Nota</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenNotesModal(item)}
                                    className="text-[10px] font-bold text-amber-700 hover:text-amber-900 hover:underline flex items-center gap-1 self-start mt-0.5 transition"
                                  >
                                    <Edit3 className="w-2.5 h-2.5" />
                                    <span>Edit Notes / Notas</span>
                                  </button>
                                )}
                              </div>
                            </td>

                            <td className="px-3 py-2">
                              <div className="inventory-table-row-actions flex items-center gap-1.5 flex-wrap">
                                 <label className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 px-2 py-1 rounded border border-emerald-200 cursor-pointer text-[10px] font-bold transition mr-1" title="Select item for concurrent batch operations">
                                   <input
                                     type="checkbox"
                                     checked={isSelected}
                                     onChange={() => handleToggleSelectItem(item.id)}
                                     className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                   />
                                   <span>Apply to Batch</span>
                                 </label>
                                 <button
                                   type="button"
                                   onClick={() => setQrModalItems([item])}
                                   className={`p-1 h-6 w-6 rounded flex items-center justify-center transition border shrink-0 ${
                                     isLow
                                       ? 'bg-rose-100 hover:bg-rose-200 text-rose-700 border-rose-300 animate-badge-breathe shadow-2xs'
                                       : 'bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-700 border-slate-200'
                                   }`}
                                   title={isLow ? `⚠️ Urgent Reorder: View/Scan QR Asset Tag for ${item.itemCode}` : "Quick scan / View QR Code"}
                                 >
                                   <QrIcon className="w-3.5 h-3.5" />
                                 </button>
                                 <button
                                   type="button"
                                   onClick={() => handleToggleItemLock(item)}
                                   className={`px-1.5 h-6 rounded font-bold text-[10px] flex items-center gap-1 transition border shrink-0 ${
                                     item.isLocked
                                       ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300'
                                       : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                                   }`}
                                   title={item.isLocked ? 'Item locked for audit freeze. Click to unlock.' : 'Lock item for audit freeze'}
                                 >
                                   {item.isLocked ? <Lock className="w-3 h-3 text-amber-700 shrink-0" /> : <Unlock className="w-3 h-3 text-slate-500 shrink-0" />}
                                   <span>{item.isLocked ? 'Locked' : 'Lock'}</span>
                                 </button>
                                 <button
                                   type="button"
                                   onClick={() => handleOpenNotesModal(item)}
                                   className={`px-2 h-6 rounded font-bold text-[10px] flex items-center gap-1 transition border shrink-0 ${
                                     item.notes || item.notas
                                       ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
                                       : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                                   }`}
                                   title="View & Edit Notes / Notas for this stock item"
                                 >
                                   <FileText className="w-3 h-3 text-amber-600 shrink-0" />
                                   <span>Notes</span>
                                   {(item.notes || item.notas) && <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>}
                                 </button>
                                <button
                                  onClick={() => handleAdjustStock(item.id, -1)}
                                  className="w-6 h-6 rounded bg-slate-100 hover:bg-rose-100 hover:text-rose-700 text-slate-600 font-bold flex items-center justify-center transition"
                                  title="Consume 1 unit (simulates depletion)"
                                >
                                  -
                                </button>
                                <button
                                  onClick={() => handleAdjustStock(item.id, 1)}
                                  className="w-6 h-6 rounded bg-slate-100 hover:bg-emerald-100 hover:text-emerald-700 text-slate-600 font-bold flex items-center justify-center transition"
                                  title="Add 1 unit"
                                >
                                  +
                                </button>
                                <button
                                  onClick={() => handleAdjustStock(item.id, 10)}
                                  className="px-1.5 h-6 text-[10px] rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center transition"
                                  title="Replenish +10"
                                >
                                  +10
                                </button>
                                <div className="relative group/priority flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
                                  <span className="text-[10px] font-bold text-slate-500 uppercase">Priority:</span>
                                  <select
                                    value={item.priority || 'Medium'}
                                    onChange={(e) => handleUpdatePriority(item, e.target.value as 'Low' | 'Medium' | 'High')}
                                    className={`text-[11px] font-bold px-2 py-1 rounded border outline-none cursor-pointer ${
                                      (item.priority || 'Medium') === 'High' ? 'bg-rose-100 text-rose-900 border-rose-300' :
                                      (item.priority || 'Medium') === 'Medium' ? 'bg-amber-100 text-amber-900 border-amber-300' :
                                      'bg-slate-100 text-slate-800 border-slate-300'
                                    }`}
                                    title="Set item replenishment priority level"
                                  >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                  </select>

                                  {/* Dynamic Hover Tooltip & Context Menu */}
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-80 p-3.5 bg-slate-900 text-white rounded-2xl shadow-2xl opacity-0 invisible group-hover/priority:opacity-100 group-hover/priority:visible transition-all duration-200 z-50 pointer-events-auto text-xs border border-slate-700/80">
                                    <div className="font-bold text-amber-400 mb-1.5 flex items-center justify-between border-b border-slate-800 pb-1.5">
                                      <div className="flex items-center gap-1.5">
                                        <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                                        <span>Priority Trend & Status Audit</span>
                                      </div>
                                      <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 font-mono">{item.itemCode}</span>
                                    </div>

                                    {/* Quick Context Menu Bar with 'Sync Priority Audit' & 'Export Priority Trend' */}
                                    <div className="flex items-center gap-1.5 mb-2.5">
                                      <button
                                        type="button"
                                        onClick={() => setPriorityAuditSyncTrigger(prev => prev + 1)}
                                        className="flex-1 py-1 px-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-[10px] rounded-lg border border-slate-700 flex items-center justify-center gap-1 transition"
                                        title="Pulls full history of priority shifts from main StockAuditLog into this status popover"
                                      >
                                        <RefreshCw className="w-3 h-3 text-amber-400" />
                                        <span>Sync Priority Audit</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleExportPriorityTrendPdf(item)}
                                        className="flex-1 py-1 px-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-[10px] rounded-lg flex items-center justify-center gap-1 transition shadow-2xs"
                                        title="Generate PDF report with 7-day sparkline and last 7 status changes"
                                      >
                                        <Download className="w-3 h-3 text-white" />
                                        <span>Export Trend PDF</span>
                                      </button>
                                    </div>

                                    {/* Mini D3 30-Day Shift Frequency Bar Chart */}
                                    <div className="bg-slate-950 p-2 rounded-xl mb-2.5 border border-slate-800">
                                      <div className="flex justify-between items-center text-[10px] text-slate-300 font-bold mb-1.5">
                                        <span>30-Day Priority Shift Frequency:</span>
                                        <span className="text-[9px] text-slate-400">Past Month</span>
                                      </div>
                                      <div className="flex items-end justify-around h-12 gap-2 pt-1 pb-1 px-2 bg-slate-900/60 rounded-lg">
                                        {getPriorityShiftFrequencies30Days(item).map((bar, i) => (
                                          <div key={i} className="flex flex-col items-center flex-1">
                                            <span className="text-[9px] font-bold text-slate-200 mb-0.5">{bar.count}x</span>
                                            <div
                                              className="w-full rounded-t transition-all duration-300"
                                              style={{
                                                height: `${Math.max(8, (bar.count / 6) * 32)}px`,
                                                backgroundColor: bar.color
                                              }}
                                            />
                                            <span className="text-[9px] text-slate-400 mt-1 font-semibold">{bar.level}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>

                                    {/* 7-Day Sparkline Trend */}
                                    <div className="bg-slate-950 p-2 rounded-xl mb-2 border border-slate-800">
                                      <div className="flex justify-between text-[10px] text-slate-300 font-bold mb-1">
                                        <span>7-Day Priority Trend Sparkline (D3):</span>
                                        <span className="text-[9px] text-amber-400 font-mono">Current: {item.priority || 'Medium'}</span>
                                      </div>
                                      <D3PrioritySparkline history={getPriorityHistory(item)} itemCode={item.itemCode} />
                                      <div className="flex justify-between text-[8.5px] text-slate-500 mt-1 px-1 font-mono">
                                        <span>6d ago</span>
                                        <span>3d ago</span>
                                        <span>Today</span>
                                      </div>
                                    </div>

                                    {/* Status Timeline in Popover */}
                                    <div className="space-y-1">
                                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                                        <span>Status Change Timeline</span>
                                        <span className="text-[9px] text-emerald-400 font-normal">Synced with Audit</span>
                                      </div>
                                      {getItemTimeline5(item).slice(0, 3).map((h, idx) => (
                                        <div key={idx} className="flex items-center justify-between text-[10px] bg-slate-800/80 px-2 py-1 rounded">
                                          <span className="text-slate-300 font-medium truncate max-w-[150px]">{h.actionTitle}</span>
                                          <span className={`px-1.5 py-0.2 rounded font-bold text-[9px] ${
                                            h.priority === 'High' ? 'bg-rose-900/60 text-rose-300' :
                                            h.priority === 'Medium' ? 'bg-amber-900/60 text-amber-300' :
                                            'bg-slate-700 text-slate-300'
                                          }`}>
                                            {h.priority}
                                          </span>
                                        </div>
                                      ))}
                                    </div>

                                    <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                                      <button
                                        type="button"
                                        onClick={() => setPriorityTrendModalItem(item)}
                                        className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
                                      >
                                        <span>Open 30-Day D3 Dashboard &rarr;</span>
                                      </button>
                                    </div>

                                    {/* Tooltip arrow */}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-solid border-t-slate-900 border-t-8 border-x-transparent border-x-8 border-b-0 pointer-events-none"></div>
                                  </div>
                                </div>

                                {/* Status History Icon Button (toggles timeline directly below row) */}
                                <button
                                  type="button"
                                  onClick={() => setExpandedHistoryItemId(expandedHistoryItemId === item.id ? null : item.id)}
                                  className={`px-2 h-6 rounded font-bold text-[10px] flex items-center gap-1 transition border shrink-0 ${
                                    expandedHistoryItemId === item.id
                                      ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                                      : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border-indigo-200'
                                  }`}
                                  title="View lightweight chronological timeline of last 5 status & priority changes directly below this row"
                                >
                                  <History className="w-3 h-3 text-indigo-600 shrink-0" />
                                  <span>Status History</span>
                                </button>

                                {/* Export Priority Trend Button */}
                                <button
                                  type="button"
                                  onClick={() => handleExportPriorityTrendPdf(item)}
                                  className="px-2 h-6 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center gap-1 transition border border-emerald-200 shrink-0"
                                  title="Export Priority Trend PDF report with 7-day sparkline and color legend using jsPDF"
                                >
                                  <Download className="w-3 h-3 text-emerald-600 shrink-0" />
                                  <span>Export Trend</span>
                                </button>

                                {/* Priority Trend Dashboard Button */}
                                <button
                                  type="button"
                                  onClick={() => setPriorityTrendModalItem(item)}
                                  className="px-2 h-6 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-[10px] flex items-center gap-1 transition border border-amber-200 shrink-0"
                                  title="Open Priority Trend Dashboard modal with 30-day stock depletion vs priority D3 chart"
                                >
                                  <TrendingUp className="w-3 h-3 text-amber-600 shrink-0" />
                                  <span>Trend Chart</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setMoveLocationItem(item);
                                    setNewLocationInput(item.location || 'Main Storeroom Alpha');
                                  }}
                                  className="px-2 h-6 rounded bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-[10px] flex items-center gap-1 transition border border-purple-200"
                                  title="Reassign item storage location"
                                >
                                  <MapPin className="w-3 h-3 text-purple-600 shrink-0" />
                                  Move Location
                                </button>
                                <button
                                  onClick={() => setDamagedPromptItem(item)}
                                  className="px-2 h-6 rounded bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-[10px] flex items-center gap-1 transition border border-rose-200"
                                  title="Mark as Damaged / Discarded"
                                >
                                  ⚠️ Damaged
                                </button>
                                <button
                                  onClick={() => setReservedPromptItem(item)}
                                  className="px-2 h-6 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold text-[10px] flex items-center gap-1 transition border border-indigo-200"
                                  title="Reserved for Guest"
                                >
                                  🛌 Reserved
                                </button>
                                <button
                                  onClick={() => setSupplierInfoModalItem(item)}
                                  className="px-2 h-6 rounded bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold text-[10px] flex items-center gap-1 transition border border-sky-200"
                                  title="View Supplier Info, Lead Time, and Reliability Rating"
                                >
                                  <Truck className="w-3 h-3 text-sky-600 shrink-0" />
                                  Supplier Info
                                </button>
                                {lastItemAdjustments[item.id] && (
                                  <button
                                    onClick={() => handleUndoAdjustment(item.id)}
                                    className="px-2 h-6 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-[10px] flex items-center gap-1 transition animate-bounce border border-amber-300"
                                    title="Undo last inventory adjustment"
                                  >
                                    ↩️ Undo
                                  </button>
                                )}
                                {item.expiryDate && itemDiffDays !== null && (() => {
                                  const isExpiringSoon = itemDiffDays <= 30;
                                  return (
                                    <span 
                                      className={`px-2.5 h-6 rounded text-[10px] font-bold flex items-center gap-1 border transition-all ${
                                        matchesActiveExpiryFilter
                                          ? isItemOverdue
                                            ? 'bg-rose-100 text-rose-900 border-rose-400 ring-2 ring-rose-400 animate-pulse font-extrabold shadow-sm'
                                            : 'bg-amber-100 text-amber-900 border-amber-400 ring-2 ring-amber-400 animate-pulse font-extrabold shadow-sm'
                                          : isItemOverdue
                                          ? 'bg-rose-100 text-rose-900 border-rose-300 animate-pulse font-bold'
                                          : isExpiringSoon
                                          ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                                          : 'bg-slate-100 text-slate-700 border-slate-200'
                                      }`}
                                      title={`Expiry Date: ${item.expiryDate} (${itemDiffDays < 0 ? `${Math.abs(itemDiffDays)} days overdue` : `${itemDiffDays} days remaining`})`}
                                    >
                                      {isItemOverdue ? (
                                        <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0 animate-bounce" />
                                      ) : isExpiringSoon ? (
                                        <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                                      ) : (
                                        <Calendar className="w-3 h-3 text-slate-500 shrink-0" />
                                      )}
                                      <span>
                                        {isItemOverdue ? `⚠️ Exp: ${item.expiryDate} (${Math.abs(itemDiffDays)}d overdue)` : `📅 Exp: ${item.expiryDate} (${itemDiffDays}d)`}
                                      </span>
                                    </span>
                                  );
                                })()}
                              </div>
                            </td>
                            <td className="px-3 py-2 text-center">
                              <button
                                onClick={() => {
                                  setAuditLogFilterItemId(item.id);
                                  setIsAuditLogOpen(true);
                                }}
                                className="p-1.5 text-slate-400 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition"
                                title={`View historical audit trail for ${item.itemCode}`}
                              >
                                <History className="w-4 h-4 text-indigo-600" />
                              </button>
                            </td>
                            <td className="px-3 py-2 text-center">
                              <button
                                onClick={() => setQrModalItems([item])}
                                className={`p-1.5 rounded-lg transition relative group ${
                                  isLow
                                    ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-300 ring-2 ring-rose-400/60 animate-badge-breathe shadow-xs'
                                    : 'text-slate-500 hover:text-emerald-700 hover:bg-emerald-100/70 border border-transparent'
                                }`}
                                title={isLow ? `⚠️ URGENT REORDER: Scan / print QR Asset Tag for instant supplier replenishment of ${item.itemCode}` : "Generate scannable QR asset tag"}
                              >
                                <QrIcon className={`w-4 h-4 ${isLow ? 'text-rose-600' : 'text-emerald-700'}`} />
                                {isLow && (
                                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
                                  </span>
                                )}
                              </button>
                            </td>
                            <td className="px-3 py-2">
                              <div className="relative group/statuspill inline-block">
                                {isLow ? (
                                  <button
                                    type="button"
                                    onClick={() => setPriorityTrendModalItem(item)}
                                    className="animate-badge-breathe px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300 flex items-center gap-1 shadow-xs cursor-pointer transition"
                                    title="Click to view 30-day Priority & Stock Correlation Dashboard or hover to view 7-day trend"
                                  >
                                    <AlertTriangle className="w-3 h-3 text-rose-600 animate-pulse shrink-0" />
                                    <span>Reorder Needed</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setPriorityTrendModalItem(item)}
                                    className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300 flex items-center gap-1 cursor-pointer transition"
                                    title="Click to view 30-day Priority & Stock Correlation Dashboard or hover to view 7-day trend"
                                  >
                                    <CheckCircle className="w-3 h-3 text-emerald-600 shrink-0" />
                                    <span>Adequate</span>
                                  </button>
                                )}

                                {/* Dynamic Hover Tooltip & Popover */}
                                <div className="absolute bottom-full right-0 mb-2 w-80 p-3.5 bg-slate-900 text-white rounded-2xl shadow-2xl opacity-0 invisible group-hover/statuspill:opacity-100 group-hover/statuspill:visible transition-all duration-200 z-50 pointer-events-auto text-xs border border-slate-700/80">
                                  <div className="font-bold text-amber-400 mb-1.5 flex items-center justify-between border-b border-slate-800 pb-1.5">
                                    <div className="flex items-center gap-1.5">
                                      <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                                      <span>Priority & Status Trend</span>
                                    </div>
                                    <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 font-mono">{item.itemCode}</span>
                                  </div>

                                  {/* Quick Context Menu Bar with 'Sync Priority Audit' & 'Export Priority Trend' */}
                                  <div className="flex items-center gap-1.5 mb-2.5">
                                    <button
                                      type="button"
                                      onClick={() => setPriorityAuditSyncTrigger(prev => prev + 1)}
                                      className="flex-1 py-1 px-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-[10px] rounded-lg border border-slate-700 flex items-center justify-center gap-1 transition"
                                      title="Pulls full history of priority shifts from main StockAuditLog into this status popover"
                                    >
                                      <RefreshCw className="w-3 h-3 text-amber-400" />
                                      <span>Sync Priority Audit</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleExportPriorityTrendPdf(item)}
                                      className="flex-1 py-1 px-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-[10px] rounded-lg flex items-center justify-center gap-1 transition shadow-2xs"
                                      title="Generate PDF report with 7-day sparkline and last 7 status changes"
                                    >
                                      <Download className="w-3 h-3 text-white" />
                                      <span>Export Trend PDF</span>
                                    </button>
                                  </div>

                                  {/* 7-Day Priority Trend Sparkline rendered with D3 */}
                                  <div className="bg-slate-950 p-2.5 rounded-xl mb-2.5 border border-slate-800">
                                    <div className="flex justify-between items-center text-[10px] text-slate-300 font-bold mb-1">
                                      <span>7-Day Priority Trend (D3):</span>
                                      <span className="text-[9px] text-amber-400 font-mono">Current: {item.priority || 'Medium'}</span>
                                    </div>
                                    <D3PrioritySparkline history={getPriorityHistory(item)} itemCode={item.itemCode} />
                                    <div className="flex justify-between text-[8.5px] text-slate-500 mt-1 px-1 font-mono">
                                      <span>6d ago</span>
                                      <span>3d ago</span>
                                      <span>Today</span>
                                    </div>
                                  </div>

                                  {/* Status Change History / Timeline */}
                                  <div className="space-y-1 mb-2">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                                      <span>Status Change History</span>
                                      <span className="text-[9px] text-emerald-400 font-normal">Synced with Audit</span>
                                    </div>
                                    {getItemTimeline5(item).slice(0, 3).map((h, idx) => (
                                      <div key={idx} className="flex items-center justify-between text-[10px] bg-slate-800/80 px-2 py-1 rounded">
                                        <div className="flex items-center gap-1.5 truncate max-w-[170px]">
                                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0"></span>
                                          <span className="text-slate-300 font-medium truncate">{h.actionTitle}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-[9px] text-slate-400">{h.timeLabel}</span>
                                          <span className={`px-1.5 py-0.2 rounded font-bold text-[9px] ${
                                            h.priority === 'High' ? 'bg-rose-900/60 text-rose-300' :
                                            h.priority === 'Medium' ? 'bg-amber-900/60 text-amber-300' :
                                            'bg-slate-700 text-slate-300'
                                          }`}>
                                            {h.priority}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  {/* Open Dashboard Modal Link */}
                                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
                                    <button
                                      type="button"
                                      onClick={() => setPriorityTrendModalItem(item)}
                                      className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
                                    >
                                      <span>Open 30-Day D3 Dashboard &rarr;</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setExpandedHistoryItemId(expandedHistoryItemId === item.id ? null : item.id)}
                                      className="text-indigo-400 hover:text-indigo-300 font-medium"
                                    >
                                      {expandedHistoryItemId === item.id ? 'Hide Row History' : 'Show Row History'}
                                    </button>
                                  </div>

                                  {/* Tooltip arrow */}
                                  <div className="absolute top-full right-6 -mt-1 border-solid border-t-slate-900 border-t-8 border-x-transparent border-x-8 border-b-0 pointer-events-none"></div>
                                </div>
                              </div>
                            </td>
                          </tr>
                          {expandedHistoryItemId === item.id && (
                            <tr key={`${item.id}-history-timeline`} className="bg-slate-900 text-slate-100 transition-all animate-in fade-in duration-200">
                              <td colSpan={14} className="p-4 border-y-2 border-indigo-500/40 bg-slate-950/95 shadow-inner">
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                                    <div className="flex items-center gap-2.5">
                                      <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                                        <History className="w-4 h-4" />
                                      </div>
                                      <div>
                                        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                          <span>Priority History Timeline</span>
                                          <span className="font-mono text-[10px] bg-slate-800 px-2 py-0.5 rounded text-amber-400 border border-slate-700">
                                            {item.itemCode}
                                          </span>
                                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                            (item.priority || 'Medium') === 'High' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                                            (item.priority || 'Medium') === 'Medium' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                                            'bg-slate-700 text-slate-300'
                                          }`}>
                                            {item.priority || 'Medium'} Priority
                                          </span>
                                        </h4>
                                        <p className="text-[11px] text-slate-400">
                                          Lightweight chronological timeline of the last five priority and status changes directly below this inventory row
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => handleExportPriorityTrendPdf(item)}
                                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded-lg flex items-center gap-1.5 transition shadow-xs"
                                        title="Generate printable PDF report with jsPDF including 7-day sparkline and color legend"
                                      >
                                        <Download className="w-3.5 h-3.5" />
                                        <span>Export Trend PDF</span>
                                      </button>
                                      <button
                                        onClick={() => setPriorityTrendModalItem(item)}
                                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold rounded-lg flex items-center gap-1.5 transition shadow-xs"
                                        title="Open full 30-day D3 multi-line correlation dashboard"
                                      >
                                        <TrendingUp className="w-3.5 h-3.5" />
                                        <span>Priority Dashboard</span>
                                      </button>
                                      <button
                                        onClick={() => setExpandedHistoryItemId(null)}
                                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
                                        title="Close timeline"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* 5 Chronological Timeline items */}
                                  <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5 pt-1">
                                    {getItemTimeline5(item).map((entry, idx) => (
                                      <div key={idx} className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition">
                                        <div>
                                          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5">
                                            <span className="font-mono text-slate-300 font-semibold">{entry.timeLabel}</span>
                                            <span className={`px-1.5 py-0.2 rounded font-bold text-[9px] ${
                                              entry.priority === 'High' ? 'bg-rose-900/70 text-rose-300 border border-rose-500/40' :
                                              entry.priority === 'Medium' ? 'bg-amber-900/70 text-amber-300 border border-amber-500/40' :
                                              'bg-slate-800 text-slate-300 border border-slate-700'
                                            }`}>
                                              {entry.priority}
                                            </span>
                                          </div>
                                          <div className="text-xs font-bold text-slate-200 mb-1 line-clamp-1">
                                            {entry.actionTitle}
                                          </div>
                                          <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                                            {entry.notes}
                                          </p>
                                        </div>
                                        <div className="mt-2.5 pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                                          <span className="truncate max-w-[90px]">{entry.adjustedBy}</span>
                                          <span className="font-semibold text-sky-400">{entry.stockAtTime}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* BATCH MODAL: UPDATE CATEGORY */}
            {activeBatchModal === 'category' && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in no-print">
                <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Layers className="w-5 h-5 text-indigo-600" />
                      <h4 className="font-serif-luxury font-bold text-slate-900 text-base">
                        Batch Update Category
                      </h4>
                    </div>
                    <button onClick={() => setActiveBatchModal(null)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-500">
                    Applying new category across <strong className="text-slate-900">{selectedItemIds.length}</strong> selected items simultaneously.
                  </p>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Select Departmental Category
                    </label>
                    <div className="grid grid-cols-1 gap-1.5">
                      {standardCategories.map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setBatchCategoryInput(cat)}
                          className={`text-left px-3 py-2 rounded-xl text-xs font-semibold transition border flex items-center justify-between ${
                            batchCategoryInput === cat
                              ? 'bg-indigo-50 border-indigo-400 text-indigo-900 shadow-xs'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span>{cat}</span>
                          {batchCategoryInput === cat && <Check className="w-4 h-4 text-indigo-600" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      onClick={() => setActiveBatchModal(null)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleApplyBatchCategory(batchCategoryInput)}
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition shadow-md"
                    >
                      Apply Category to {selectedItemIds.length} Items
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* BATCH MODAL: UPDATE SUPPLIER */}
            {activeBatchModal === 'supplier' && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in no-print">
                <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Truck className="w-5 h-5 text-sky-600" />
                      <h4 className="font-serif-luxury font-bold text-slate-900 text-base">
                        Batch Update Supplier
                      </h4>
                    </div>
                    <button onClick={() => setActiveBatchModal(null)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-500">
                    Set approved vendor/supplier across <strong className="text-slate-900">{selectedItemIds.length}</strong> selected items simultaneously.
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Choose Existing Approved Supplier
                      </label>
                      <select
                        value={batchSupplierInput}
                        onChange={(e) => {
                          setBatchSupplierInput(e.target.value);
                          setBatchCustomSupplierInput('');
                        }}
                        className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                      >
                        {standardSuppliers.map(sup => (
                          <option key={sup} value={sup}>{sup}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Or Enter Custom Supplier Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Garden Route Artisan Distillers"
                        value={batchCustomSupplierInput}
                        onChange={(e) => setBatchCustomSupplierInput(e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      onClick={() => setActiveBatchModal(null)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleApplyBatchSupplier(batchCustomSupplierInput.trim() || batchSupplierInput)}
                      className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs transition shadow-md"
                    >
                      Apply Supplier to {selectedItemIds.length} Items
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* BATCH MODAL: UPDATE REORDER LEVEL */}
            {activeBatchModal === 'reorder' && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in no-print">
                <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Sliders className="w-5 h-5 text-amber-600" />
                      <h4 className="font-serif-luxury font-bold text-slate-900 text-base">
                        Batch Update Reorder Level
                      </h4>
                    </div>
                    <button onClick={() => setActiveBatchModal(null)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-500">
                    Modify minimum inventory safety buffer for <strong className="text-slate-900">{selectedItemIds.length}</strong> selected items simultaneously.
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Quick Preset Thresholds
                      </label>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {[5, 10, 15, 20, 25, 50].map(val => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setBatchReorderInput(val)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                              batchReorderInput === val
                                ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {val} units
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Specific Numerical Threshold
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={500}
                        value={batchReorderInput}
                        onChange={(e) => setBatchReorderInput(Number(e.target.value))}
                        className="w-full text-sm font-bold px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      onClick={() => setActiveBatchModal(null)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleApplyBatchReorderLevel(batchReorderInput)}
                      className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-md"
                    >
                      Apply Level ({batchReorderInput}) to {selectedItemIds.length} Items
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* BATCH MODAL: BULK TRANSFER LOCATION */}
            {activeBatchModal === 'location' && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in no-print">
                <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <h4 className="font-serif-luxury font-bold text-slate-900 text-base">
                        Bulk Transfer Location
                      </h4>
                    </div>
                    <button onClick={() => setActiveBatchModal(null)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-500">
                    Update storage location for <strong className="text-slate-900">{selectedItemIds.length}</strong> selected inventory items at once.
                  </p>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Select Preset Location or Type New Name
                      </label>
                      <div className="grid grid-cols-2 gap-1.5 mb-2.5">
                        {['Main Storeroom Alpha', 'Suite 101 Pantry', 'Suite 102 Penthouse', 'Main Bar Cellar', 'Breakfast Kitchen', 'Housekeeping Locker'].map(loc => (
                          <button
                            key={loc}
                            type="button"
                            onClick={() => setBatchLocationInput(loc)}
                            className={`px-3 py-2 rounded-xl text-xs font-semibold text-left transition border ${
                              batchLocationInput === loc ? 'bg-purple-50 border-purple-400 text-purple-900 shadow-xs' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {loc}
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. Executive Wing Storeroom B"
                        value={batchLocationInput}
                        onChange={(e) => setBatchLocationInput(e.target.value)}
                        className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none font-semibold"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                    <button
                      onClick={() => setActiveBatchModal(null)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleApplyBatchLocation(batchLocationInput)}
                      className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition shadow-md flex items-center gap-1.5"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      Confirm Bulk Transfer ({selectedItemIds.length} Items)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* BATCH MODAL: UPDATE PRICE (PERCENTAGE-BASED) */}
            {activeBatchModal === 'price' && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in no-print">
                <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <DollarSign className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-serif-luxury font-bold text-slate-900 text-base">
                          Batch Price Update Tool
                        </h4>
                        <p className="text-xs text-slate-500">Apply percentage price increase or decrease across selected stock items</p>
                      </div>
                    </div>
                    <button onClick={() => setActiveBatchModal(null)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-600">
                    Adjusting unit prices across <strong className="text-slate-900 font-bold">{selectedItemIds.length}</strong> selected items simultaneously. All updates are logged in the Stock Audit Log.
                  </p>

                  {/* Direction Selector */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Price Adjustment Direction:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setBatchPriceDirection('increase')}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border ${
                          batchPriceDirection === 'increase'
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <TrendingUp className="w-4 h-4" />
                        Price Increase (+)
                      </button>
                      <button
                        type="button"
                        onClick={() => setBatchPriceDirection('decrease')}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border ${
                          batchPriceDirection === 'decrease'
                            ? 'bg-rose-600 text-white border-rose-700 shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <TrendingDown className="w-4 h-4" />
                        Price Discount (-)
                      </button>
                    </div>
                  </div>

                  {/* Percentage Presets & Slider */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        Percentage Adjustment:
                      </label>
                      <span className={`text-xs font-extrabold font-mono px-2 py-0.5 rounded ${
                        batchPriceDirection === 'increase' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {batchPriceDirection === 'increase' ? '+' : '-'}{batchPricePercent}%
                      </span>
                    </div>

                    {/* Quick percentage buttons */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {[5, 10, 12.5, 15, 20, 25].map(pct => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setBatchPricePercent(pct)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                            batchPricePercent === pct
                              ? 'bg-slate-900 text-white border-slate-950 shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>

                    {/* Range and input */}
                    <div className="flex items-center gap-3 pt-1">
                      <input
                        type="range"
                        min={1}
                        max={100}
                        step={1}
                        value={batchPricePercent}
                        onChange={(e) => setBatchPricePercent(Number(e.target.value))}
                        className="flex-1 accent-emerald-600 cursor-pointer"
                      />
                      <div className="flex items-center gap-1 shrink-0 w-24">
                        <input
                          type="number"
                          min={0.1}
                          max={200}
                          step={0.5}
                          value={batchPricePercent}
                          onChange={(e) => setBatchPricePercent(Math.max(0.1, Number(e.target.value)))}
                          className="w-full text-xs font-bold px-2.5 py-1.5 rounded-lg border border-slate-300 text-right focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                        <span className="text-xs font-bold text-slate-500">%</span>
                      </div>
                    </div>
                  </div>

                  {/* Rounding Strategy */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Price Rounding Rule:
                    </label>
                    <div className="grid grid-cols-3 gap-1.5 text-xs">
                      <button
                        type="button"
                        onClick={() => setBatchPriceRounding('integer')}
                        className={`py-1.5 px-2 rounded-lg font-semibold border text-center transition ${
                          batchPriceRounding === 'integer'
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        Round to Rand (R 125)
                      </button>
                      <button
                        type="button"
                        onClick={() => setBatchPriceRounding('cents99')}
                        className={`py-1.5 px-2 rounded-lg font-semibold border text-center transition ${
                          batchPriceRounding === 'cents99'
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        Ending .99 (R 124.99)
                      </button>
                      <button
                        type="button"
                        onClick={() => setBatchPriceRounding('none')}
                        className={`py-1.5 px-2 rounded-lg font-semibold border text-center transition ${
                          batchPriceRounding === 'none'
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        Exact Cents (2 dec)
                      </button>
                    </div>
                  </div>

                  {/* Preview Section */}
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Price Calculation Preview (Sample of Selected Items):
                    </span>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                      {inventory
                        .filter(i => selectedItemIds.includes(i.id))
                        .slice(0, 3)
                        .map(item => {
                          const factor = batchPriceDirection === 'increase'
                            ? (1 + (batchPricePercent / 100))
                            : Math.max(0.01, 1 - (batchPricePercent / 100));
                          let calc = item.pricePerUnit * factor;
                          if (batchPriceRounding === 'integer') calc = Math.max(1, Math.round(calc));
                          else if (batchPriceRounding === 'cents99') calc = Math.max(0.99, Math.floor(calc) + 0.99);
                          else calc = Math.max(0.01, Math.round(calc * 100) / 100);

                          return (
                            <div key={item.id} className="flex items-center justify-between text-[11px] bg-white p-2 rounded-lg border border-slate-200">
                              <div className="truncate mr-2">
                                <span className="font-mono font-bold text-slate-700 mr-1.5">{item.itemCode}</span>
                                <span className="text-slate-600 truncate">{item.itemDescription}</span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0 font-mono">
                                <span className="text-slate-400 line-through">R {item.pricePerUnit}</span>
                                <span className="font-bold text-emerald-700">→ R {calc}</span>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                    {selectedItemIds.length > 3 && (
                      <span className="text-[10px] text-slate-400 italic block text-right">
                        + {selectedItemIds.length - 3} more items will be updated
                      </span>
                    )}
                  </div>

                  {/* Modal Actions */}
                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                    <button
                      onClick={() => setActiveBatchModal(null)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleApplyBatchPriceUpdate}
                      className={`px-5 py-2 text-white font-bold rounded-xl text-xs transition shadow-md flex items-center gap-1.5 ${
                        batchPriceDirection === 'increase' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
                      }`}
                    >
                      <DollarSign className="w-4 h-4" />
                      Apply {batchPriceDirection === 'increase' ? '+' : '-'}{batchPricePercent}% Price Update ({selectedItemIds.length} Items)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* INVENTORY QR GENERATOR & ASSET SCANNER MODAL */}
            {qrModalItems && qrModalItems.length > 0 && (
              <InventoryQrModal
                items={qrModalItems}
                allItems={inventory}
                initialViewMode={qrModalInitialMode}
                onClose={() => setQrModalItems(null)}
                onAdjustStock={handleAdjustStock}
                onOpenAuditLog={(itemId) => {
                  setAuditLogFilterItemId(itemId || null);
                  setIsAuditLogOpen(true);
                }}
                onOpenSupplierEmail={(supplierName, item) => {
                  setQuickContactSupplier({ name: supplierName, item });
                }}
              />
            )}

            {/* SYNCHRONIZED BULK AUDIT COUNT MODAL */}
            {isSynchronizedAuditModalOpen && (
              <SynchronizedAuditCountModal
                isOpen={isSynchronizedAuditModalOpen}
                selectedItems={inventory.filter(i => selectedItemIds.includes(i.id))}
                onClose={() => setIsSynchronizedAuditModalOpen(false)}
                onApplyAuditCounts={handleApplySynchronizedAuditCounts}
                onOpenQrScanner={(item) => {
                  setQrModalItems(item ? [item] : inventory.filter(i => selectedItemIds.includes(i.id)));
                  setQrModalInitialMode('scanner');
                }}
                currentUser={currentUser}
              />
            )}

            {/* STOCK AUDIT LOG MODAL */}
            <StockAuditLogModal
              isOpen={isAuditLogOpen}
              onClose={() => {
                setIsAuditLogOpen(false);
                setAuditLogFilterItemId(null);
              }}
              logs={stockAuditLogs}
              inventory={inventory}
              filterItemId={auditLogFilterItemId}
              onAddManualLog={appendAuditLog}
              onClearLogs={() => {
                setStockAuditLogs([]);
                try {
                  localStorage.removeItem(AUDIT_STORAGE_KEY);
                } catch (e) {
                  console.warn(e);
                }
              }}
            />

            {/* SUPPLIER QUICK CONTACT MODAL */}
            {quickContactSupplier && (
              <SupplierQuickContactModal
                supplierName={quickContactSupplier.name}
                selectedItem={quickContactSupplier.item}
                allInventory={inventory}
                companyInfo={companyInfo}
                onClose={() => setQuickContactSupplier(null)}
                onQuickRestockItem={(itemId, qty) => handleAdjustStock(itemId, qty)}
              />
            )}
              </>
            )}

            {/* DAMAGED / DISCARDED PROMPT MODAL */}
            {damagedPromptItem && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in no-print">
                <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">⚠️</div>
                      <h4 className="font-serif-luxury font-bold text-slate-900 text-base">Mark Item as Damaged / Discarded</h4>
                    </div>
                    <button onClick={() => setDamagedPromptItem(null)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-600">
                    Adjusting stock down by 1 unit for <strong className="text-slate-900">{damagedPromptItem.itemCode} - {damagedPromptItem.itemDescription}</strong>. This will be recorded in the Stock Audit Log.
                  </p>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Optional Note / Reason
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Broken in suite #204, stained, or expired"
                      value={adjustmentNoteInput}
                      onChange={(e) => setAdjustmentNoteInput(e.target.value)}
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500 outline-none"
                    />
                  </div>
                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      onClick={() => setDamagedPromptItem(null)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleMarkDamaged(damagedPromptItem, adjustmentNoteInput)}
                      className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition shadow-md"
                    >
                      Confirm Damaged (-1 Unit)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* RESERVED FOR GUEST PROMPT MODAL */}
            {reservedPromptItem && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in no-print">
                <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">🛌</div>
                      <h4 className="font-serif-luxury font-bold text-slate-900 text-base">Reserve Stock for Guest Stay</h4>
                    </div>
                    <button onClick={() => setReservedPromptItem(null)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-600">
                    Allocating 1 unit for <strong className="text-slate-900">{reservedPromptItem.itemCode} - {reservedPromptItem.itemDescription}</strong> to guest suite turnover.
                  </p>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Optional Guest / Suite Note
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. VIP guest suite #101 requested extra linen / toiletries"
                      value={adjustmentNoteInput}
                      onChange={(e) => setAdjustmentNoteInput(e.target.value)}
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      onClick={() => setReservedPromptItem(null)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleMarkReserved(reservedPromptItem, adjustmentNoteInput)}
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition shadow-md"
                    >
                      Confirm Reserved (-1 Unit)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* DRAFT PURCHASE ORDER MODAL */}
            <DraftPurchaseOrderModal
              isOpen={isDraftPoModalOpen}
              onClose={() => setIsDraftPoModalOpen(false)}
              inventory={inventory}
              companyInfo={companyInfo}
              onConfirmOrderSent={(orderedIds) => {
                orderedIds.forEach(id => {
                  const itm = inventory.find(i => i.id === id);
                  if (itm) {
                    appendAuditLog({
                      itemId: itm.id,
                      itemCode: itm.itemCode,
                      itemDescription: itm.itemDescription,
                      previousQty: itm.howManyOnHand,
                      newQty: itm.howManyOnHand,
                      deltaQty: 0,
                      adjustedBy: `${currentUser?.name || 'Staff'} (${currentUser?.role || 'operator'})`,
                      actionType: 'Draft Purchase Order Generated',
                      notes: `Compiled into supplier email draft PO for ${itm.supplier}`
                    });
                  }
                });
              }}
            />

            {/* SUPPLIER INFO MINI-CARD MODAL */}
            {supplierInfoModalItem && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in no-print">
                <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold">
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-serif-luxury font-bold text-slate-900 text-base">
                          {supplierInfoModalItem.supplier}
                        </h4>
                        <p className="text-xs text-slate-500">Approved Vendor Performance & Contact Profile</p>
                      </div>
                    </div>
                    <button onClick={() => setSupplierInfoModalItem(null)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-semibold">Associated Stock Item:</span>
                        <span className="font-mono font-bold text-slate-800">{supplierInfoModalItem.itemCode}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-semibold">Description:</span>
                        <span className="font-bold text-slate-900 truncate max-w-[200px]">{supplierInfoModalItem.itemDescription}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-semibold">Last Contact / Restock Date:</span>
                        <span className="font-bold text-indigo-700 font-mono">{supplierInfoModalItem.lastRestocked}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                        <span className="text-[10px] text-emerald-800 font-bold uppercase block">Lead Time</span>
                        <span className="text-sm font-bold text-emerald-950 font-mono">2.2 Days</span>
                      </div>
                      <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                        <span className="text-[10px] text-emerald-800 font-bold uppercase block">Fulfillment</span>
                        <span className="text-sm font-bold text-emerald-950 font-mono">98.2%</span>
                      </div>
                      <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                        <span className="text-[10px] text-emerald-800 font-bold uppercase block">Rating</span>
                        <span className="text-sm font-bold text-emerald-950 font-mono">4.9 ★</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        const sup = supplierInfoModalItem.supplier;
                        const itm = supplierInfoModalItem;
                        setSupplierInfoModalItem(null);
                        setQuickContactSupplier({ name: sup, item: itm });
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      Open Quick Contact / PO
                    </button>
                    <button
                      onClick={() => setSupplierInfoModalItem(null)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* MOVE TO LOCATION MODAL */}
            {moveLocationItem && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in no-print">
                <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-serif-luxury font-bold text-slate-900 text-base">
                          Reassign Storage Location
                        </h4>
                        <p className="text-xs text-slate-500">{moveLocationItem.itemCode} - {moveLocationItem.itemDescription}</p>
                      </div>
                    </div>
                    <button onClick={() => setMoveLocationItem(null)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Current Location:
                      </label>
                      <div className="p-2.5 bg-slate-100 text-slate-800 font-semibold rounded-xl border border-slate-200">
                        {moveLocationItem.location || 'Main Storeroom Alpha'}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Select Preset or Type New Location
                      </label>
                      <div className="grid grid-cols-2 gap-1.5 mb-2">
                        {['Main Storeroom Alpha', 'Suite 101 Pantry', 'Suite 102 Penthouse', 'Main Bar Cellar', 'Breakfast Kitchen', 'Housekeeping Locker'].map(loc => (
                          <button
                            key={loc}
                            type="button"
                            onClick={() => setNewLocationInput(loc)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold text-left transition border ${
                              newLocationInput === loc ? 'bg-purple-50 border-purple-400 text-purple-900 shadow-xs' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {loc}
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. Suite 103 Executive Suite Pantry"
                        value={newLocationInput}
                        onChange={(e) => setNewLocationInput(e.target.value)}
                        className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none font-semibold"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                    <button
                      onClick={() => setMoveLocationItem(null)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleMoveLocation(moveLocationItem, newLocationInput)}
                      className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition shadow-md"
                    >
                      Confirm Transfer
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* NOTES / NOTAS FIELD MODAL */}
            {notesModalItem && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in no-print">
                <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-serif-luxury font-bold text-slate-900 text-base">
                          Item Notes & Notas Management
                        </h4>
                        <p className="text-xs text-slate-500">
                          {notesModalItem.itemCode} &bull; {notesModalItem.itemDescription}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setNotesModalItem(null)} 
                      className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Item Metadata Quick Pill */}
                  <div className="flex flex-wrap gap-2 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="font-semibold text-slate-700">Category: <strong className="text-slate-900">{notesModalItem.category}</strong></span>
                    <span className="text-slate-300">&bull;</span>
                    <span className="font-semibold text-slate-700">Supplier: <strong className="text-slate-900">{notesModalItem.supplier}</strong></span>
                    <span className="text-slate-300">&bull;</span>
                    <span className="font-semibold text-slate-700">Location: <strong className="text-slate-900">{notesModalItem.location || 'Main Store'}</strong></span>
                    {notesModalItem.expiryDate && (
                      <>
                        <span className="text-slate-300">&bull;</span>
                        <span className="font-semibold text-amber-700">Expiry: <strong className="text-amber-900">{notesModalItem.expiryDate}</strong></span>
                      </>
                    )}
                  </div>

                  {/* Form fields for English Notes and Spanish Notas */}
                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                          🇬🇧 Operational Notes (English)
                        </label>
                        <span className="text-[10px] text-slate-400">{notesInputValue.length} chars</span>
                      </div>
                      <textarea
                        rows={3}
                        value={notesInputValue}
                        onChange={(e) => setNotesInputValue(e.target.value)}
                        placeholder="Enter storage instructions, usage guidelines, suite rotation notes..."
                        className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none leading-relaxed text-slate-800"
                      />
                      
                      {/* Preset snippets for quick entry */}
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        <span className="text-[10px] text-slate-400 font-semibold mr-1 flex items-center">Presets:</span>
                        {[
                          'VIP suite priority rotation',
                          'Store in climate-controlled bay',
                          'Check expiry weekly',
                          'High seasonal turnover',
                          'Awaiting supplier batch'
                        ].map(preset => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => {
                              const separator = notesInputValue.trim() ? '. ' : '';
                              setNotesInputValue(prev => `${prev.trim()}${separator}${preset}.`);
                            }}
                            className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-amber-100 hover:text-amber-900 text-slate-600 text-[10px] font-medium transition border border-slate-200"
                          >
                            + {preset}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                          🇪🇸 Notas Operativas (Español)
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            if (notesInputValue && !notasInputValue) {
                              setNotasInputValue(notesInputValue);
                            }
                          }}
                          className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1"
                          title="Copy English notes into Spanish field"
                        >
                          <span>Copy from Notes</span>
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        value={notasInputValue}
                        onChange={(e) => setNotasInputValue(e.target.value)}
                        placeholder="ej. Instrucciones de almacenamiento, rotación prioritaria, observaciones..."
                        className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none leading-relaxed text-slate-800 italic font-serif"
                      />
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 text-[11px] text-slate-500 flex items-center gap-2">
                    <History className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span>Saving will automatically record an immutable audit entry in the <strong>Stock Audit Trail</strong>.</span>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                    <button
                      onClick={() => setNotesModalItem(null)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveNotes}
                      className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs transition shadow-md flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Save Notes & Notas
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CHECKLISTS TAB */}
        {activeTab === 'checklists' && (
          <div className="space-y-6">
            <DocumentActionBar
              documentTitle="5-Area Hospitality Inspection Checklist"
              documentNumber="CHK-5AREA-2026"
              onSave={() => alert('Inspection checklist signed and filed.')}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {checklists.map(area => (
                <div key={area.area} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      {area.title}
                    </h3>
                    <span className="text-[10px] text-slate-400 font-semibold">{area.supervisor}</span>
                  </div>

                  <div className="space-y-2">
                    {area.items.map(item => (
                      <label key={item.id} className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked={item.completed}
                          className="w-4 h-4 text-emerald-600 rounded mt-0.5"
                        />
                        <span className="text-slate-700 leading-snug">{item.task}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ATTRACTIONS & CONCIERGE DIRECTORY */}
        {activeTab === 'attractions' && (
          <AttractionsModule initialAttractions={ATTRACTIONS_DIRECTORY} />
        )}

        {/* GUEST ADDRESS BOOK */}
        {activeTab === 'addressbook' && (
          <GuestAddressBook 
            reservations={reservations} 
            companyInfo={companyInfo} 
            currentUser={currentUser} 
          />
        )}

        {/* MEETING MINUTES MODULE */}
        {activeTab === 'minutes' && (
          <MeetingMinutesModule companyInfo={companyInfo} />
        )}
      </main>

      {/* Global Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setIsAuthOpen(false);
        }}
      />

      {/* Global Footer */}
      <Footer 
        onSelectTab={setActiveTab} 
        companyInfo={companyInfo}
        onUpdateCompanyInfo={handleSaveCompanyInfo}
      />
    </div>
  );
};
export default App;
