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
import { InventoryChartsSection } from './components/InventoryChartsSection';
import { PredictiveOrderDateCalculatorModal } from './components/PredictiveOrderDateCalculatorModal';
import { StockAuditLogModal } from './components/StockAuditLogModal';
import { calculateOrderDate } from './utils/predictiveOrderCalculator';
import { 
  UserAccount, 
  Reservation, 
  InventoryItem, 
  AreaChecklist, 
  AttractionItem,
  StockAuditLogEntry 
} from './types';
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
  TrendingDown
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
      if (saved) return JSON.parse(saved);
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
  const [inventorySearchQuery, setInventorySearchQuery] = useState('');
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState('All');
  const [inventoryStockStatusFilter, setInventoryStockStatusFilter] = useState<'All' | 'LowStock' | 'Adequate'>('All');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Predictive Order Date Calculator Modal state
  const [isPredictiveCalculatorOpen, setIsPredictiveCalculatorOpen] = useState(false);
  const [predictiveCalculatorItem, setPredictiveCalculatorItem] = useState<InventoryItem | null>(null);

  // Stock Audit Log State
  const [isAuditLogOpen, setIsAuditLogOpen] = useState(false);
  const [auditLogFilterItemId, setAuditLogFilterItemId] = useState<string | null>(null);
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

    return matchesQuery && matchesCategory && matchesStatus;
  });

  // Export to CSV helper
  const handleExportInventoryCsv = () => {
    const headers = ['Item Code', 'Description', 'Category', 'Unit Price (ZAR)', 'On Hand', 'Unit', 'Reorder Level', 'Stock Status', 'Predicted Order Date', 'Supplier', 'Last Restocked'];
    const rows = filteredInventory.map(item => {
      const isLow = item.howManyOnHand <= item.whenToReorder;
      const orderAnalysis = calculateOrderDate(item);
      return [
        `"${item.itemCode}"`,
        `"${item.itemDescription.replace(/"/g, '""')}"`,
        `"${item.category.replace(/"/g, '""')}"`,
        item.pricePerUnit,
        item.howManyOnHand,
        `"${item.unit}"`,
        item.whenToReorder,
        `"${isLow ? 'REORDER NEEDED' : 'ADEQUATE'}"`,
        `"${orderAnalysis.suggestedOrderDateFormatted} (${orderAnalysis.urgencyLabel})"`,
        `"${item.supplier.replace(/"/g, '""')}"`,
        `"${item.lastRestocked || ''}"`
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

  // Bulk Selection & Batch Actions State
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [qrModalItems, setQrModalItems] = useState<InventoryItem[] | null>(null);
  const [quickContactSupplier, setQuickContactSupplier] = useState<{ name: string; item?: InventoryItem } | null>(null);
  const [batchNotice, setBatchNotice] = useState<string | null>(null);
  const [activeBatchModal, setActiveBatchModal] = useState<'category' | 'supplier' | 'reorder' | 'price' | null>(null);
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

  const handleOpenBatchQrModal = () => {
    const selected = inventory.filter(i => selectedItemIds.includes(i.id));
    if (selected.length === 0) return;
    setQrModalItems(selected);
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
          />
        )}

        {activeTab === 'checkin' && (
          <CheckInModule
            reservations={reservations}
          />
        )}

        {activeTab === 'departure' && (
          <DepartureModule
            reservations={reservations}
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
                    onClick={() => setQrModalItems(filteredInventory)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
                    title="Open QR Asset Scanner & Tag Generator"
                  >
                    <QrIcon className="w-3.5 h-3.5 text-emerald-400" />
                    QR Scanner
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
                        lastRestocked: new Date().toISOString().split('T')[0]
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
                  {(inventorySearchQuery || inventoryCategoryFilter !== 'All' || inventoryStockStatusFilter !== 'All') && (
                    <button
                      onClick={() => {
                        setInventorySearchQuery('');
                        setInventoryCategoryFilter('All');
                        setInventoryStockStatusFilter('All');
                      }}
                      className="ml-auto text-slate-500 hover:text-slate-800 font-bold flex items-center gap-1 px-2 py-0.5 rounded hover:bg-slate-200 transition shrink-0"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Reset Filters
                    </button>
                  )}
                </div>
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
                      <th className="px-3 py-2.5">Price / Unit</th>
                      <th className="px-3 py-2.5">On Hand</th>
                      <th className="px-3 py-2.5">Reorder Level</th>
                      <th className="px-3 py-2.5">Adjust Stock</th>
                      <th className="px-3 py-2.5 text-center">Audit</th>
                      <th className="px-3 py-2.5 text-center">QR Tag</th>
                      <th className="px-3 py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredInventory.length === 0 ? (
                      <tr>
                        <td colSpan={12} className="px-4 py-8 text-center text-slate-400 text-xs">
                          <Search className="w-6 h-6 mx-auto text-slate-300 mb-2" />
                          <p className="font-semibold text-slate-600">No inventory items matched your search criteria.</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">Try searching for a different item description, code, or reset the filters.</p>
                          <button
                            onClick={() => {
                              setInventorySearchQuery('');
                              setInventoryCategoryFilter('All');
                              setInventoryStockStatusFilter('All');
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

                        return (
                          <tr 
                            key={item.id} 
                            className={`transition ${
                              isSelected ? 'bg-emerald-50/80' : 'hover:bg-slate-50'
                            }`}
                          >
                            <td className="px-3 py-2 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleSelectItem(item.id)}
                                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                              />
                            </td>
                            <td className="px-3 py-2 font-mono font-bold text-slate-700">{item.itemCode}</td>
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
                            <td className="px-3 py-2 font-bold text-slate-800">R {item.pricePerUnit}</td>
                            <td className="px-3 py-2 font-bold text-slate-900">{item.howManyOnHand} {item.unit}</td>
                            <td className="px-3 py-2 text-slate-500">{item.whenToReorder} {item.unit}</td>
                            <td className="px-3 py-2">
                              <div className="flex items-center gap-1">
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
                                className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-100/70 rounded-lg transition"
                                title="Generate scannable QR asset tag"
                              >
                                <QrIcon className="w-4 h-4 text-emerald-700" />
                              </button>
                            </td>
                            <td className="px-3 py-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                isLow ? 'bg-rose-100 text-rose-800 animate-pulse' : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {isLow ? 'Reorder Needed' : 'Adequate'}
                              </span>
                            </td>
                          </tr>
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
