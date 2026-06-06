'use client';

// Campaign Manager Dashboard — page composition (Task 13.1).
//
// This Client Component owns all top-level interactive state and composes the
// Sidebar + Header_Bar + the four content sections A->B->C->D inside a
// responsive layout wrapper (Req 1.1, 1.2, 1.3).
//
// State (session-scoped, cleared on reload — Req 4.8, 4.9, 6.4, 6.5):
//   - activeNavItem : currently active Sidebar item id (default "dashboard", Req 2.3)
//   - month         : selected Month_Filter value (default current month, Req 3.6)
//   - year          : selected Year_Filter value (default most recent year, Req 3.6)
//   - search        : Search_Field keyword (Req 3.7, 3.8)
//   - rows          : campaign rows shown in Section A (Req 4.8, 6.5)
//
// All displayed content is sourced from Mock_Data via `lib/mockData.ts`
// (Req 10.3). Pure state transitions go through `lib/dashboardState.ts`.

import { useState } from 'react';
import type { ApprovalStatus, CampaignRow, MonthOption } from '@/lib/types';
import {
  getNavItems,
  getChannels,
  getWorkflowSteps,
  getSummaryMetrics,
  getApprovalStatuses,
  getDistinctSortedYears,
  getMostRecentYear,
} from '@/lib/mockData';
import { selectNav, setRowApproval } from '@/lib/dashboardState';
import Sidebar from '@/components/dashboard/Sidebar';
import HeaderBar from '@/components/dashboard/HeaderBar';
import CampaignInfoSection from '@/components/dashboard/CampaignInfoSection';
import AssetChannelSection from '@/components/dashboard/AssetChannelSection';
import WorkflowSection from '@/components/dashboard/WorkflowSection';
import SummarySection from '@/components/dashboard/SummarySection';

// The twelve calendar months with Indonesian labels (Req 3.3). Defined locally
// since they are fixed and not part of the dynamic Mock_Data set.
const MONTHS: MonthOption[] = [
  { value: 1, label: 'Januari' },
  { value: 2, label: 'Februari' },
  { value: 3, label: 'Maret' },
  { value: 4, label: 'April' },
  { value: 5, label: 'Mei' },
  { value: 6, label: 'Juni' },
  { value: 7, label: 'Juli' },
  { value: 8, label: 'Agustus' },
  { value: 9, label: 'September' },
  { value: 10, label: 'Oktober' },
  { value: 11, label: 'November' },
  { value: 12, label: 'Desember' },
];

/** Builds a blank campaign row: empty strings, null costs, "Pending" approval. */
function createBlankRow(): CampaignRow {
  return {
    id:
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `row-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    idProduk: '',
    namaProduk: '',
    kategori: '',
    hpp: null,
    hargaJual: null,
    adminFee: null,
    shippingFee: null,
    promoXtra: null,
    feePerPesanan: null,
    campaignFee: null,
    promosiFee: null,
    marketingFee: null,
    adsSpending: null,
    affiliateCommission: null,
    operatingCost: null,
    approve: 'Pending',
  };
}

// Sample rows so Section A shows data on first load. Built from a constant so
// the page renders meaningful content without a backend.
const INITIAL_ROWS: CampaignRow[] = [
  {
    id: 'sample-1',
    idProduk: 'PRD-001',
    namaProduk: 'Serum Glow KALOVA',
    kategori: 'Skincare',
    hpp: 25000,
    hargaJual: 89000,
    adminFee: 5000,
    shippingFee: 8000,
    promoXtra: 3000,
    feePerPesanan: 1250,
    campaignFee: 4000,
    promosiFee: 3500,
    marketingFee: 6000,
    adsSpending: 7500,
    affiliateCommission: 4450,
    operatingCost: 2000,
    approve: 'Pending',
  },
  {
    id: 'sample-2',
    idProduk: 'PRD-002',
    namaProduk: 'Sunscreen Daily KALOVA',
    kategori: 'Skincare',
    hpp: 18000,
    hargaJual: 65000,
    adminFee: 4000,
    shippingFee: 8000,
    promoXtra: 2000,
    feePerPesanan: 1250,
    campaignFee: 3000,
    promosiFee: 2500,
    marketingFee: 5000,
    adsSpending: 6000,
    affiliateCommission: 3250,
    operatingCost: 1500,
    approve: 'Pending',
  },
];

export default function CampaignManagerPage() {
  // Mock_Data is static for this phase; loaded once per render (Req 10.3).
  const navItems = getNavItems();
  const channels = getChannels();
  const workflowSteps = getWorkflowSteps();
  const summaryMetrics = getSummaryMetrics();
  const approvalOptions = getApprovalStatuses();
  const years = getDistinctSortedYears();

  // ---- Top-level interactive state ----
  const [activeNavItem, setActiveNavItem] = useState<string>('dashboard'); // Req 2.3
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1); // Req 3.6
  const [year, setYear] = useState<number | null>(getMostRecentYear()); // Req 3.6
  const [search, setSearch] = useState<string>(''); // Req 3.7, 3.8
  const [rows, setRows] = useState<CampaignRow[]>(INITIAL_ROWS); // Req 4.8, 6.5

  // ---- Handlers ----
  // Single-active navigation invariant via the pure reducer (Req 2.5, 2.7).
  const handleSelectNav = (id: string) => {
    setActiveNavItem((current) => selectNav(current, id));
  };

  // Appends a fresh blank campaign row (Req 11 / Add_Campaign_Button).
  const handleAddCampaign = () => {
    setRows((current) => [...current, createBlankRow()]);
  };

  // Patches the matching row in place, leaving every other row untouched.
  const handleRowChange = (rowId: string, patch: Partial<CampaignRow>) => {
    setRows((current) =>
      current.map((row) => (row.id === rowId ? { ...row, ...patch } : row)),
    );
  };

  // Per-row approval update through the pure reducer (Req 6.5, 6.6).
  const handleApproveChange = (rowId: string, status: ApprovalStatus) => {
    setRows((current) => setRowApproval(current, rowId, status));
  };

  return (
    // Page wrapper: light theme + no horizontal page scrollbar (Req 1.4, 1.6, 1.7).
    <div className="min-h-screen overflow-x-hidden bg-slate-50">
      {/* Stacks below lg, side-by-side at lg and up (Req 1.5, 1.6, 1.7). */}
      <div className="mx-auto flex max-w-screen-2xl flex-col gap-4 p-4 lg:flex-row lg:gap-6 lg:p-6">
        {/* Sidebar — fixed-width column on desktop, full width when stacked (Req 1.1). */}
        <aside className="shrink-0 lg:w-60">
          <Sidebar
            title="Navigasi"
            items={navItems}
            activeId={activeNavItem}
            onSelect={handleSelectNav}
          />
        </aside>

        {/* Content area: Header_Bar on top, then sections A->B->C->D (Req 1.2, 1.3). */}
        <main className="flex min-w-0 flex-1 flex-col gap-4 lg:gap-6">
          <HeaderBar
            title="Campaign Manager"
            months={MONTHS}
            years={years}
            selectedMonth={month}
            selectedYear={year}
            search={search}
            addButtonLabel="+ Tambah Campaign"
            onMonthChange={setMonth}
            onYearChange={setYear}
            onSearchChange={setSearch}
            onAddCampaign={handleAddCampaign}
          />

          {/* Section A */}
          <CampaignInfoSection
            rows={rows}
            approvalOptions={approvalOptions}
            onRowChange={handleRowChange}
            onApproveChange={handleApproveChange}
          />

          {/* Section B */}
          <AssetChannelSection channels={channels} />

          {/* Section C */}
          <WorkflowSection steps={workflowSteps} />

          {/* Section D */}
          <SummarySection metrics={summaryMetrics} />
        </main>
      </div>
    </div>
  );
}
