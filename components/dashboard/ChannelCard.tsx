import type { Channel } from '@/lib/types';

interface ChannelCardProps {
  channel: Channel;
}

// Inline glyph map keyed by `channel.icon` (Req 7.10). Rendering the icon inside
// this file (rather than a shared Icon component) keeps ChannelCard
// self-contained and avoids conflicts with components built in parallel tasks.
// Unknown/empty keys fall back to a generic glyph.
const CHANNEL_ICON_PATHS: Record<string, string> = {
  'tab-promo':
    'M4 4h16v4H4V4zm0 6h10v10H4V10zm12 0h4v10h-4V10z',
  banner:
    'M3 5h18v9l-3-2-3 2-3-2-3 2-3-2V5z',
  toko:
    'M4 9l1-5h14l1 5M5 9h14v11H5V9zm5 11v-6h4v6',
  'ig-story':
    'M12 7a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6zM4 4h16v16H4V4zm13 2.5a1 1 0 100 2 1 1 0 000-2z',
  'host-live':
    'M12 2a4 4 0 014 4v4a4 4 0 01-8 0V6a4 4 0 014-4zM6 10a6 6 0 0012 0M12 18v3',
  'ads-cpas':
    'M3 11l16-7-3 16-5-5-3 3v-5l-5-2z',
  timeline:
    'M7 4h10v2H7V4zm0 4h10v2H7V8zm0 4h7v2H7v-2zM4 4v16',
};

const FALLBACK_ICON_PATH = 'M12 2a10 10 0 100 20 10 10 0 000-20z';

/**
 * Returns the displayable value for a channel detail, substituting "-" when the
 * value is null or an empty/whitespace-only string (Req 7.12).
 */
function displayValue(value: string | null): string {
  if (value === null) {
    return '-';
  }
  return value.trim() === '' ? '-' : value;
}

/**
 * Presentational card for a single channel (Section B). Renders an icon and the
 * channel name at the top (Req 7.10), followed by each detail as a label/value
 * row (Req 7.11), with "-" shown for empty/unavailable values (Req 7.12).
 *
 * Receives all displayed content through props (Req 10.1, 10.2). No interactivity
 * is required, so this stays a server component (no 'use client').
 */
export default function ChannelCard({ channel }: ChannelCardProps) {
  const iconPath = CHANNEL_ICON_PATHS[channel.icon] ?? FALLBACK_ICON_PATH;

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
        <h3 className="text-sm font-semibold text-slate-800">{channel.name}</h3>
      </div>

      <dl className="mt-3 flex flex-col gap-2">
        {channel.details.map((detail, index) => (
          <div
            key={`${detail.label}-${index}`}
            className="flex items-start justify-between gap-3 text-xs"
          >
            <dt className="text-slate-500">{detail.label}</dt>
            <dd className="text-right font-medium text-slate-700">
              {displayValue(detail.value)}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
