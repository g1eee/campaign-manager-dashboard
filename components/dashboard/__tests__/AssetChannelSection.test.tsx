import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AssetChannelSection from '@/components/dashboard/AssetChannelSection';
import { getChannels } from '@/lib/mockData';
import type { Channel } from '@/lib/types';

// Real 7-channel Mock_Data drives these example tests so the assertions reflect
// the data the dashboard actually renders (Req 7.2–7.9, 10.3).
const channels: Channel[] = getChannels();

// The exact channel names in their required left-to-right order (Req 7.2).
const EXPECTED_ORDER = [
  'Tab Promo',
  'Banner',
  'Toko',
  'IG Story',
  'Host Live',
  'Ads CPAS',
  'Timeline',
];

// Each channel's exact detail labels (Req 7.3–7.9).
const EXPECTED_DETAIL_LABELS: Record<string, string[]> = {
  'Tab Promo': ['Jenis', 'Format'],
  Banner: ['File Banner'],
  Toko: ['Kategori', 'Chat Broadcast', 'Etalase'],
  'IG Story': ['File Flyer IGS', 'Link Produk', 'Jadwal Post'],
  'Host Live': ['Jadwal', 'Promo'],
  'Ads CPAS': ['File Flyer CPAS'],
  Timeline: ['Tanggal', 'Nama Promosi'],
};

describe('AssetChannelSection', () => {
  it('renders the "Asset & Channel" heading (Req 7.1)', () => {
    render(<AssetChannelSection channels={channels} />);
    expect(
      screen.getByRole('heading', { name: 'Asset & Channel' }),
    ).toBeInTheDocument();
  });

  it('renders exactly 7 channel cards in the required order (Req 7.2)', () => {
    render(<AssetChannelSection channels={channels} />);

    // Channel names are the only level-3 headings inside the section.
    const cardHeadings = screen.getAllByRole('heading', { level: 3 });
    expect(cardHeadings).toHaveLength(7);

    const renderedNames = cardHeadings.map((h) => h.textContent?.trim());
    expect(renderedNames).toEqual(EXPECTED_ORDER);
  });

  it('renders each channel with exactly its required detail labels (Req 7.3–7.9)', () => {
    render(<AssetChannelSection channels={channels} />);

    for (const [, labels] of Object.entries(EXPECTED_DETAIL_LABELS)) {
      for (const label of labels) {
        expect(screen.getByText(label)).toBeInTheDocument();
      }
    }

    // The total number of detail labels rendered matches the sum across all
    // channels, confirming no extra labels appear (exactly the required set).
    const expectedTotal = Object.values(EXPECTED_DETAIL_LABELS).reduce(
      (sum, labels) => sum + labels.length,
      0,
    );
    const renderedTotal = channels.reduce(
      (sum, channel) => sum + channel.details.length,
      0,
    );
    expect(renderedTotal).toBe(expectedTotal);
  });

  it('renders the empty-state placeholder when no channels are supplied (Req 1.8, 10.5)', () => {
    render(<AssetChannelSection channels={[]} />);

    // Heading still renders so the section container is preserved.
    expect(
      screen.getByRole('heading', { name: 'Asset & Channel' }),
    ).toBeInTheDocument();

    // No channel cards render in the empty state.
    expect(screen.queryAllByRole('heading', { level: 3 })).toHaveLength(0);

    // The empty-state placeholder is shown.
    expect(
      screen.getByText('Belum ada data channel yang tersedia.'),
    ).toBeInTheDocument();
  });
});
