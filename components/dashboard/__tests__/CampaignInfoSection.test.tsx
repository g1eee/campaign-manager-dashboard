import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import type { CampaignRow, ApprovalStatus } from '@/lib/types';
import CampaignInfoSection from '@/components/dashboard/CampaignInfoSection';

// Example/render tests for Campaign_Info_Section (Section A).
// _Requirements: 4.1, 4.2, 4.3, 5.1, 5.8, 6.2_

const approvalOptions: ApprovalStatus[] = ['Pending', 'Approved', 'Rejected'];

function makeRow(overrides: Partial<CampaignRow> = {}): CampaignRow {
  return {
    id: 'row-1',
    idProduk: 'P-001',
    namaProduk: 'Produk Contoh',
    kategori: 'Fashion',
    hpp: 10_000,
    hargaJual: 50_000,
    adminFee: 1_000,
    shippingFee: 2_000,
    promoXtra: 500,
    feePerPesanan: 300,
    campaignFee: 700,
    promosiFee: 400,
    marketingFee: 600,
    adsSpending: 800,
    affiliateCommission: 900,
    operatingCost: 1_200,
    approve: 'Pending',
    ...overrides,
  };
}

// The complete field-label order as required by Req 4.2 / 4.3.
const EXPECTED_LABEL_ORDER = [
  // Row 1
  'ID Produk',
  'Nama Produk',
  'Kategori',
  'HPP',
  'Harga Jual',
  'Admin Fee',
  'Shipping Fee',
  'Promo Xtra',
  'Fee/Pesanan',
  'Campaign Fee',
  // Row 2
  'Promosi Fee',
  'Marketing Fee',
  'Ads Spending',
  'Affiliate Commission',
  'Operating Cost',
  'Margin',
  'NPM',
  'Approve',
];

describe('CampaignInfoSection', () => {
  it('renders the section title "Informasi Campaign"', () => {
    render(
      <CampaignInfoSection
        rows={[makeRow()]}
        approvalOptions={approvalOptions}
        onRowChange={vi.fn()}
        onApproveChange={vi.fn()}
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'Informasi Campaign' }),
    ).toBeInTheDocument();
  });

  it('renders all field labels in the exact required order', () => {
    const { container } = render(
      <CampaignInfoSection
        rows={[makeRow()]}
        approvalOptions={approvalOptions}
        onRowChange={vi.fn()}
        onApproveChange={vi.fn()}
      />,
    );

    // Every expected label is present.
    for (const label of EXPECTED_LABEL_ORDER) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }

    // The labels appear in document order (monotonically increasing index).
    const text = container.textContent ?? '';
    const indices = EXPECTED_LABEL_ORDER.map((label) => text.indexOf(label));

    for (const idx of indices) {
      expect(idx).toBeGreaterThanOrEqual(0);
    }
    for (let i = 1; i < indices.length; i++) {
      expect(indices[i]).toBeGreaterThan(indices[i - 1]);
    }
  });

  it('renders Margin and NPM as read-only <output> fields exposed via aria-label', () => {
    render(
      <CampaignInfoSection
        rows={[makeRow()]}
        approvalOptions={approvalOptions}
        onRowChange={vi.fn()}
        onApproveChange={vi.fn()}
      />,
    );

    const margin = screen.getByLabelText('Margin');
    const npm = screen.getByLabelText('NPM');

    // CalculatedField renders an <output> element (read-only, not an input).
    expect(margin.tagName).toBe('OUTPUT');
    expect(npm.tagName).toBe('OUTPUT');

    // Margin is displayed as a Rupiah-formatted string (Req 5.8).
    // 50000 - (10000+1000+2000+500+300+700+400+600+800+900+1200) = 31600
    expect(margin).toHaveTextContent('Rp31.600');
  });

  it('shows the default approval value "Pending" in the Approve select', () => {
    render(
      <CampaignInfoSection
        rows={[makeRow({ approve: 'Pending' })]}
        approvalOptions={approvalOptions}
        onRowChange={vi.fn()}
        onApproveChange={vi.fn()}
      />,
    );

    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('Pending');
  });

  it('calls onRowChange when a cost input (HPP) changes', () => {
    const onRowChange = vi.fn();

    render(
      <CampaignInfoSection
        rows={[makeRow()]}
        approvalOptions={approvalOptions}
        onRowChange={onRowChange}
        onApproveChange={vi.fn()}
      />,
    );

    // Locate the HPP Cost_Field input via its label text.
    const hppLabel = screen.getByText('HPP').closest('label');
    expect(hppLabel).not.toBeNull();
    const hppInput = within(hppLabel as HTMLElement).getByRole('textbox');

    fireEvent.change(hppInput, { target: { value: '25000' } });

    expect(onRowChange).toHaveBeenCalledWith('row-1', { hpp: 25000 });
  });

  it('renders the empty-state placeholder when no rows are supplied', () => {
    render(
      <CampaignInfoSection
        rows={[]}
        approvalOptions={approvalOptions}
        onRowChange={vi.fn()}
        onApproveChange={vi.fn()}
      />,
    );

    // Title still renders; placeholder shown; no field rows present.
    expect(
      screen.getByRole('heading', { name: 'Informasi Campaign' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Belum ada data campaign.')).toBeInTheDocument();
    expect(screen.queryByText('ID Produk')).not.toBeInTheDocument();
  });
});
