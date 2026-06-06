import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import SummarySection from '@/components/dashboard/SummarySection';
import { getSummaryMetrics } from '@/lib/mockData';
import { formatRupiah, formatPercent1 } from '@/lib/currency';
import type { SummaryMetric } from '@/lib/types';

// The 5 summary cards in their required left-to-right order (Req 9.2).
const EXPECTED_ORDER = [
  'Total Campaign',
  'Active Campaign',
  'Budget Terpakai',
  'Margin Rata-rata',
  'Menunggu Approve',
];

/** Resolves the card root element that contains the given metric label. */
function getCardRoot(label: string): HTMLElement {
  const root = screen.getByText(label).closest('div.rounded-lg');
  expect(root).not.toBeNull();
  return root as HTMLElement;
}

describe('SummarySection', () => {
  it('renders the "Status & Ringkasan" title (Req 9.1)', () => {
    render(<SummarySection metrics={getSummaryMetrics()} />);
    expect(screen.getByText('Status & Ringkasan')).toBeInTheDocument();
  });

  it('renders exactly 5 cards in the required order from mock data (Req 9.2, 9.4)', () => {
    render(<SummarySection metrics={getSummaryMetrics()} />);

    const cardRoots = EXPECTED_ORDER.map(getCardRoot);
    expect(cardRoots).toHaveLength(5);

    // Each label appears exactly once and in document order.
    for (let i = 1; i < cardRoots.length; i += 1) {
      const relation = cardRoots[i - 1].compareDocumentPosition(cardRoots[i]);
      expect(relation & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    }
  });

  it('formats the "Budget Terpakai" primary number as Rupiah (Req 9.5)', () => {
    render(<SummarySection metrics={getSummaryMetrics()} />);

    const card = within(getCardRoot('Budget Terpakai'));
    // 385,750,000 -> "Rp385.750.000"
    const expected = formatRupiah(385_750_000);
    expect(expected).toBe('Rp385.750.000');
    expect(card.getByText(expected)).toBeInTheDocument();
    expect(card.getByText(/Rp/)).toBeInTheDocument();
    expect(card.getByText(/385\.750\.000/)).toBeInTheDocument();
  });

  it('formats the "Margin Rata-rata" primary number as a 1-decimal percent (Req 9.6)', () => {
    render(<SummarySection metrics={getSummaryMetrics()} />);

    const card = within(getCardRoot('Margin Rata-rata'));
    // 28.7 -> "28,7%" (one decimal, comma separator, "%" suffix)
    const expected = formatPercent1(28.7);
    expect(expected).toBe('28,7%');
    expect(card.getByText(expected)).toBeInTheDocument();
  });

  it('renders a placeholder and omits the trend note when a metric value is null (Req 9.7)', () => {
    const metrics: SummaryMetric[] = [
      {
        id: 'with-value',
        label: 'Total Campaign',
        icon: 'layers',
        value: 128,
        format: 'number',
        trend: { change: 12, period: 'dari bulan lalu' },
      },
      {
        id: 'no-value',
        label: 'Budget Terpakai',
        icon: 'wallet',
        value: null,
        format: 'rupiah',
        // A trend is defined but MUST be omitted because the value is null.
        trend: { change: 15, period: 'periode rahasia' },
      },
    ];

    render(<SummarySection metrics={metrics} />);

    const nullCard = within(getCardRoot('Budget Terpakai'));
    // Placeholder "-" is shown for the missing primary number.
    expect(nullCard.getByText('-')).toBeInTheDocument();
    // The trend period text is NOT rendered for the null-value card.
    expect(nullCard.queryByText('periode rahasia')).not.toBeInTheDocument();

    // Sanity: a card with a value still renders its trend note.
    const valueCard = within(getCardRoot('Total Campaign'));
    expect(valueCard.getByText('dari bulan lalu')).toBeInTheDocument();
  });
});
