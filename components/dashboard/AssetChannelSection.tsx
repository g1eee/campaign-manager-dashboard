import type { Channel } from '@/lib/types';
import ChannelCard from './ChannelCard';

interface AssetChannelSectionProps {
  /** Channel collection sourced from Mock_Data (Req 10.1, 10.2). */
  channels: Channel[];
}

/**
 * Section B — Asset_Channel_Section.
 *
 * Renders the heading "Asset & Channel" (Req 7.1) inside a card-based container,
 * then maps the supplied channel collection to one ChannelCard each, preserving
 * the fixed left-to-right order (Req 7.2–7.9). All content is passed in via props
 * (Req 10.1, 10.2); none is defined internally.
 *
 * When the collection is empty or missing, the section still renders its card
 * container with an empty-state placeholder instead of an empty grid, and never
 * throws (Req 1.8, 10.5).
 *
 * Purely presentational — no local state or interactivity — so it stays a server
 * component (no 'use client').
 */
export default function AssetChannelSection({
  channels,
}: AssetChannelSectionProps) {
  const items = channels ?? [];
  const isEmpty = items.length === 0;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-slate-800">Asset &amp; Channel</h2>

      {isEmpty ? (
        <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
          Belum ada data channel yang tersedia.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((channel) => (
            <ChannelCard key={channel.id} channel={channel} />
          ))}
        </div>
      )}
    </section>
  );
}
