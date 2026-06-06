// Shared domain types for the Campaign Manager Dashboard.
//
// These interfaces mirror the response shapes of the existing `app/api` routes
// (Req 10.4) so a backend route can later return the same structures without
// changing consuming components. Cost keys reuse the camelCase names already
// present in `data/products.json` (`hpp`, `hargaJual`, `adminFee`,
// `shippingFee`, ...) extended with the remaining campaign cost components.

// ---- Campaign cost row (Section A) ----

/** Approval status options sourced from Mock_Data (Req 6.1). */
export type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected';

/**
 * A single campaign cost row rendered in the Campaign_Info_Section.
 *
 * The 12 cost fields are stored as `number | null`, where `null` represents an
 * empty field and is treated as `0` in Margin/NPM calculations (Req 4.4, 5.6).
 * Margin and NPM are DERIVED on each render and are intentionally NOT stored on
 * this model (Req 5.1) to avoid stored-vs-displayed drift.
 */
export interface CampaignRow {
  id: string;
  idProduk: string;
  namaProduk: string;
  kategori: string;
  // 12 cost fields (Req 4.4); null = empty, treated as 0 in calc (Req 5.6)
  hpp: number | null;
  hargaJual: number | null;
  adminFee: number | null;
  shippingFee: number | null;
  promoXtra: number | null;
  feePerPesanan: number | null;
  campaignFee: number | null;
  promosiFee: number | null;
  marketingFee: number | null;
  adsSpending: number | null;
  affiliateCommission: number | null;
  operatingCost: number | null;
  // Margin & NPM are DERIVED, not stored (Req 5.1) — computed on render.
  approve: ApprovalStatus; // stored per-row (Req 6.4, 6.5)
}

// ---- Navigation (Sidebar) ----

export interface NavItem {
  id: string; // stable identifier, e.g. "dashboard"
  label: string; // display text, e.g. "Dashboard"
}

// ---- Channels (Section B) ----

export interface ChannelDetail {
  label: string;
  value: string | null; // null/empty -> "-" placeholder (Req 7.12)
}

export interface Channel {
  id: string;
  name: string; // "Tab Promo", "Banner", ...
  icon: string; // icon key/name (Req 7.10)
  details: ChannelDetail[]; // label/value pairs (Req 7.3–7.9, 7.11)
}

// ---- Workflow (Section C) ----

export interface WorkflowStepModel {
  order: number; // 1..7
  name: string; // "Brief Campaign", ...
  icon: string;
}

// ---- Summary (Section D) ----

export type SummaryFormat = 'number' | 'rupiah' | 'percent1';

export interface SummaryTrend {
  change: number; // signed change value
  period: string; // comparison period text
}

export interface SummaryMetric {
  id: string;
  label: string; // "Total Campaign", ...
  icon: string;
  value: number | null; // null -> placeholder, omit trend (Req 9.7)
  format: SummaryFormat; // controls formatting (Req 9.5, 9.6)
  trend?: SummaryTrend; // signed change + period (Req 9.3)
}

// ---- Filters ----

export interface MonthOption {
  value: number; // 1..12
  label: string; // "Januari", ...
}
