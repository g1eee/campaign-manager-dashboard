import type { SummaryMetric } from '@/lib/types';
import SummaryCard from './SummaryCard';

interface SummarySectionProps {
  /** Summary metric collection sourced from Mock_Data (Req 10.1, 10.2). */
  metrics: SummaryMetric[];
}

/**
 * Section D — Summary_Section.
 *
 * Renders the title "Status & Ringkasan" (Req 9.1) inside a card-based container,
 * then maps the supplied metric collection to one SummaryCard each, preserving
 * the fixed left-to-right order in which the metrics are provided (typically the
 * 5 metrics: Total Campaign, Active Campaign, Budget Terpakai, Margin Rata-rata,
 * Menunggu Approve — Req 9.2, 9.4). All content is passed in via props
 * (Req 10.1, 10.2); none is defined internally.
 *
 * When the collection is empty or missing, the section still renders its card
 * container with an empty-state placeholder instead of an empty grid, and never
 * throws (Req 1.8, 10.5).
 *
 * Purely presentational — no local state or interactivity — so it stays a server
 * component (no 'use client').
 */
export default function SummarySection({ metrics }: SummarySectionProps) {
  const items = metrics ?? [];
  const isEmpty = items.length === 0;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-slate-800">Status &amp; Ringkasan</h2>

      {isEmpty ? (
        <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
          Belum ada data ringkasan yang tersedia.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {items.map((metric) => (
            <SummaryCard key={metric.id} metric={metric} />
          ))}
        </div>
      )}
    </section>
  );
}
