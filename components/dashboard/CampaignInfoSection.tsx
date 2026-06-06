'use client';

// Campaign_Info_Section — Section A ("Informasi Campaign").
//
// Renders the section title and, for each campaign row, a two-row field grid
// in the exact order required by Req 4.2 / 4.3:
//
//   Row 1: ID Produk, Nama Produk, Kategori, HPP, Harga Jual, Admin Fee,
//          Shipping Fee, Promo Xtra, Fee/Pesanan, Campaign Fee
//   Row 2: Promosi Fee, Marketing Fee, Ads Spending, Affiliate Commission,
//          Operating Cost, Margin, NPM, Approve
//
// Field delegation:
//   - ID Produk / Nama Produk / Kategori -> plain text inputs (Req 4.2)
//   - Cost fields -> `CostField` (Req 4.4–4.7)
//   - Margin / NPM -> `CalculatedField` (read-only, Req 5.1)
//   - Approve -> `ApproveField` (Req 6)
//
// Margin and NPM are DERIVED on each render from the row's cost values via
// `lib/calculations.ts`; they are never stored in state (Req 5.1, 5.2, 5.3),
// removing any possibility of stored-vs-displayed drift.
//
// When no rows are supplied, the section still renders its card container with
// an empty-state placeholder (Req 1.8).

import type { ApprovalStatus, CampaignRow } from '@/lib/types';
import { computeMargin, formatNpm } from '@/lib/calculations';
import { formatRupiah } from '@/lib/currency';
import CostField from '@/components/dashboard/CostField';
import CalculatedField from '@/components/dashboard/CalculatedField';
import ApproveField from '@/components/dashboard/ApproveField';

interface CampaignInfoSectionProps {
  /** Campaign rows to render; an empty/missing array shows the empty state. */
  rows: CampaignRow[];
  /** Approval status options sourced from Mock_Data (Req 6.1). */
  approvalOptions: ApprovalStatus[];
  /** Patches one or more fields of a single row, keyed by row id. */
  onRowChange: (rowId: string, patch: Partial<CampaignRow>) => void;
  /** Updates the approval status of a single row, keyed by row id. */
  onApproveChange: (rowId: string, status: ApprovalStatus) => void;
}

// The seven Cost_Fields that appear in row 1 (after the three text fields).
const ROW1_COST_FIELDS: { key: keyof CampaignRow; label: string }[] = [
  { key: 'hpp', label: 'HPP' },
  { key: 'hargaJual', label: 'Harga Jual' },
  { key: 'adminFee', label: 'Admin Fee' },
  { key: 'shippingFee', label: 'Shipping Fee' },
  { key: 'promoXtra', label: 'Promo Xtra' },
  { key: 'feePerPesanan', label: 'Fee/Pesanan' },
  { key: 'campaignFee', label: 'Campaign Fee' },
];

// The five Cost_Fields that appear at the start of row 2.
const ROW2_COST_FIELDS: { key: keyof CampaignRow; label: string }[] = [
  { key: 'promosiFee', label: 'Promosi Fee' },
  { key: 'marketingFee', label: 'Marketing Fee' },
  { key: 'adsSpending', label: 'Ads Spending' },
  { key: 'affiliateCommission', label: 'Affiliate Commission' },
  { key: 'operatingCost', label: 'Operating Cost' },
];

const GRID_CLASS =
  'grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5';

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-slate-600">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 shadow-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
      />
    </label>
  );
}

function CampaignRowFields({
  row,
  approvalOptions,
  onRowChange,
  onApproveChange,
}: {
  row: CampaignRow;
  approvalOptions: ApprovalStatus[];
  onRowChange: (rowId: string, patch: Partial<CampaignRow>) => void;
  onApproveChange: (rowId: string, status: ApprovalStatus) => void;
}) {
  // Derive Margin/NPM on every render — never stored (Req 5.1, 5.2, 5.3).
  // The eleven Margin cost components (HPP is a component; Harga Jual is the
  // revenue and is NOT subtracted).
  const margin = computeMargin(row.hargaJual, {
    hpp: row.hpp,
    adminFee: row.adminFee,
    shippingFee: row.shippingFee,
    promoXtra: row.promoXtra,
    feePerPesanan: row.feePerPesanan,
    campaignFee: row.campaignFee,
    promosiFee: row.promosiFee,
    marketingFee: row.marketingFee,
    adsSpending: row.adsSpending,
    affiliateCommission: row.affiliateCommission,
    operatingCost: row.operatingCost,
  });
  const marginDisplay = formatRupiah(margin); // Req 5.8, 5.9
  const npmDisplay = formatNpm(margin, row.hargaJual); // Req 5.5, 5.7

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
      {/* Row 1: three text fields + seven Cost_Fields (Req 4.2) */}
      <div className={GRID_CLASS}>
        <TextField
          label="ID Produk"
          value={row.idProduk}
          onChange={(value) => onRowChange(row.id, { idProduk: value })}
        />
        <TextField
          label="Nama Produk"
          value={row.namaProduk}
          onChange={(value) => onRowChange(row.id, { namaProduk: value })}
        />
        <TextField
          label="Kategori"
          value={row.kategori}
          onChange={(value) => onRowChange(row.id, { kategori: value })}
        />
        {ROW1_COST_FIELDS.map(({ key, label }) => (
          <CostField
            key={key}
            label={label}
            value={row[key] as number | null}
            onChange={(value) => onRowChange(row.id, { [key]: value })}
          />
        ))}
      </div>

      {/* Row 2: five Cost_Fields + Margin + NPM + Approve (Req 4.3) */}
      <div className={`${GRID_CLASS} mt-3`}>
        {ROW2_COST_FIELDS.map(({ key, label }) => (
          <CostField
            key={key}
            label={label}
            value={row[key] as number | null}
            onChange={(value) => onRowChange(row.id, { [key]: value })}
          />
        ))}
        <CalculatedField label="Margin" displayValue={marginDisplay} readOnly />
        <CalculatedField label="NPM" displayValue={npmDisplay} readOnly />
        <ApproveField
          value={row.approve}
          options={approvalOptions}
          onChange={(status) => onApproveChange(row.id, status)}
        />
      </div>
    </div>
  );
}

export default function CampaignInfoSection({
  rows,
  approvalOptions,
  onRowChange,
  onApproveChange,
}: CampaignInfoSectionProps) {
  const safeRows = rows ?? [];

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-slate-800">
        Informasi Campaign
      </h2>

      {safeRows.length === 0 ? (
        // Empty-state placeholder (Req 1.8) — container still renders.
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
          Belum ada data campaign.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {safeRows.map((row) => (
            <CampaignRowFields
              key={row.id}
              row={row}
              approvalOptions={approvalOptions}
              onRowChange={onRowChange}
              onApproveChange={onApproveChange}
            />
          ))}
        </div>
      )}
    </section>
  );
}
