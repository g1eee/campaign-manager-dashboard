'use client';

import type { NavItem } from '@/lib/types';

interface SidebarProps {
  /** Sidebar heading, e.g. "Navigasi" (Req 2.1) */
  title: string;
  /** Ordered nav items, exactly 9 in the dashboard (Req 2.2) */
  items: NavItem[];
  /** Currently active nav item id (Req 2.4) */
  activeId: string;
  /** Invoked with the selected item's id (Req 2.5, 2.7) */
  onSelect: (id: string) => void;
}

/**
 * Sidebar — prop-driven vertical navigation (Req 2, 10.1, 10.2).
 *
 * Renders the title and maps `items` to buttons. The button whose
 * `id === activeId` receives a violet accent. Clicking an item calls
 * `onSelect(id)`; selecting the active item is a visual no-op because
 * `activeId` does not change.
 */
export default function Sidebar({ title, items, activeId, onSelect }: SidebarProps) {
  return (
    <nav
      aria-label={title}
      className="flex flex-col gap-1 rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
    >
      <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </p>

      {(items ?? []).map((item) => {
        const isActive = item.id === activeId;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            aria-current={isActive ? 'page' : undefined}
            className={[
              'flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors',
              isActive
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-violet-50 hover:text-violet-700',
            ].join(' ')}
          >
            <span
              aria-hidden="true"
              className={[
                'inline-flex h-2 w-2 shrink-0 rounded-full',
                isActive ? 'bg-white' : 'bg-slate-300',
              ].join(' ')}
            />
            <span className="truncate">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
