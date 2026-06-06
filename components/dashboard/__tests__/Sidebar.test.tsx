import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import Sidebar from '@/components/dashboard/Sidebar';
import type { NavItem } from '@/lib/types';

// The 9 nav items in their required top-to-bottom order (Req 2.2).
const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'tab-promo', label: 'Tab Promo' },
  { id: 'banner', label: 'Banner' },
  { id: 'toko', label: 'Toko' },
  { id: 'ig-story', label: 'IG Story' },
  { id: 'host-live', label: 'Host Live' },
  { id: 'ads-cpas', label: 'Ads CPAS' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'approval', label: 'Approval' },
];

function renderSidebar(overrides: Partial<React.ComponentProps<typeof Sidebar>> = {}) {
  const onSelect = vi.fn();
  const props = {
    title: 'Navigasi',
    items: navItems,
    activeId: 'dashboard',
    onSelect,
    ...overrides,
  };
  render(<Sidebar {...props} />);
  return { onSelect, props };
}

describe('Sidebar', () => {
  it('renders the "Navigasi" title (Req 2.1)', () => {
    renderSidebar();
    expect(screen.getByText('Navigasi')).toBeInTheDocument();
  });

  it('renders the 9 nav items in order (Req 2.2)', () => {
    renderSidebar();
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(9);

    const renderedLabels = buttons.map((btn) => btn.textContent?.trim());
    expect(renderedLabels).toEqual([
      'Dashboard',
      'Tab Promo',
      'Banner',
      'Toko',
      'IG Story',
      'Host Live',
      'Ads CPAS',
      'Timeline',
      'Approval',
    ]);
  });

  it('marks the default-active "Dashboard" item with the violet accent (Req 2.3, 2.6)', () => {
    renderSidebar({ activeId: 'dashboard' });

    const activeButton = screen.getByRole('button', { name: /Dashboard/ });
    expect(activeButton).toHaveAttribute('aria-current', 'page');
    expect(activeButton.className).toContain('bg-violet-600');
  });

  it('applies the violet accent only to the active item (Req 2.4, 2.6)', () => {
    renderSidebar({ activeId: 'banner' });

    const activeButton = screen.getByRole('button', { name: /Banner/ });
    expect(activeButton).toHaveAttribute('aria-current', 'page');
    expect(activeButton.className).toContain('bg-violet-600');

    // Exactly one item is active at a time (Req 2.4).
    const allButtons = screen.getAllByRole('button');
    const activeButtons = allButtons.filter(
      (btn) => btn.getAttribute('aria-current') === 'page',
    );
    expect(activeButtons).toHaveLength(1);

    // An inactive item does not get the violet accent.
    const inactiveButton = screen.getByRole('button', { name: /Dashboard/ });
    expect(inactiveButton).not.toHaveAttribute('aria-current', 'page');
    expect(inactiveButton.className).not.toContain('bg-violet-600');
  });

  it('fires onSelect with the item id when an item is clicked (Req 2.5)', () => {
    const { onSelect } = renderSidebar();

    fireEvent.click(screen.getByRole('button', { name: /IG Story/ }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith('ig-story');
  });

  it('fires onSelect with the active item id when the active item is clicked (Req 2.7)', () => {
    const { onSelect } = renderSidebar({ activeId: 'dashboard' });

    fireEvent.click(screen.getByRole('button', { name: /Dashboard/ }));
    expect(onSelect).toHaveBeenCalledWith('dashboard');
  });

  it('uses the provided title as the nav accessible label', () => {
    renderSidebar();
    const nav = screen.getByRole('navigation', { name: 'Navigasi' });
    expect(within(nav).getAllByRole('button')).toHaveLength(9);
  });
});
