import type { SummaryMetric } from '@/lib/types';
import { formatRupiah, formatPercent1 } from '@/lib/currency';

interface SummaryCardProps {
  metric: SummaryMetric;
}

// Inline glyph map keyed by `metric.icon` (Req 9.3). Rendering the icon inside
// this file (rather than a shared Icon component) keeps SummaryCard
// self-contained and avoids conflicts with components built in parallel tasks.
// Unknown/empty keys fall back to a generic glyph.
const SUMMARY_ICON_PATHS: Record<string, string> = {
  layers: 'M12 3l9 5-9 5-9-5 9-5zm0 9l9 5-9 5-9-5m18-5l-9 5',
  activity: 'M3 12h4l3 8 4-16 3 8h4',
  wallet:
    'M3 7h15a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7zm0 0V5a2 2 0 012-2h11M17 13h.01',
  'trending-up': 'M3 17l6-6 4 4 7-7M21 8v5h-5',
  clock: 'M12 2a10 10 0 100 20 10 10 0 000-20zm0 4v6l4 2',
};

const FALLBACK_ICON_PATH = 'M12 2a10 10 0 100 20 10 10 0 000-20z';

/** Placeholder shown for the primary number when `value` is null (Req 9.7). */
const VALUE_PLACEHOLDER = '-';

/**
 * Formats the primary number according to the metric's `format` field:
 *   - 'rupiah'   -> formatRupiah   (Req 9.5)
 *   - 'percent1' -> formatPercent1 (Req 9.6)
 *   - 'number'   -> locale-grouped plain number
 */
function formatValue(metric: SummaryMetric): string {
  if (metric.value === null) {
    return VALUE_PLACEHOLDER;
  }

  switch (metric.format) {
    case 'rupiah':
      return formatRupiah(metric.value);
    case 'percent1':
      return formatPercent1(metric.value);
    case 'number':
    default:
      return metric.value.toLocaleString('id-ID');
  }
}

/**
 * Presentational card for a single summary metric (Section D). Renders an icon,
 * label, and primary number (Req 9.3) formatted per `metric.format` (Req 9.5,
 * 9.6). A small trend note with a signed change value and comparison period is
 * shown below. When `metric.value` is null, a placeholder is shown for the
 * number and the trend note is omitted (Req 9.7).
 *
 * Receives all displayed content through props (Req 10.1, 10.2). No interactivity
 * is required, so this stays a server component (no 'use client').
 */
export default function SummaryCard({ metric }: SummaryCardProps) {
  const iconPath = SUMMARY_ICON_PATHS[metric.icon] ?? FALLBACK_ICON_PATH;
  const hasValue = metric.value !== null;
  const showTrend = hasValue && metric.trend !== undefined;

  return (
    <div className="flex flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 flex-none items-center justify-center rounded-md bg-violet-50 text-violet-600">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path d={iconPath} />
          </svg>
        </span>
        <span className="text-sm font-medium text-slate-500">{metric.label}</span>
      </div>

      <p className="mt-3 text-2xl font-semibold text-slate-800">
        {formatValue(metric)}
      </p>

      {showTrend && metric.trend && (
        <p className="mt-1 text-xs">
          <span
            className={
              metric.trend.change >= 0 ? 'text-emerald-600' : 'text-slate-500'
            }
          >
            {metric.trend.change >= 0 ? '+' : ''}
            {metric.trend.change}
          </span>{' '}
          <span className="text-slate-400">{metric.trend.period}</span>
        </p>
      )}
    </div>
  );
}
