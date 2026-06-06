// Integration tests for the Campaign Manager Dashboard page (Task 13.3).
//
// These assert end-to-end behavior through the rendered page
// (app/campaign-manager/page.tsx, a 'use client' component):
//   - default Month_Filter / Year_Filter selection
//   - search keyword clamping to 100 chars
//   - single-active navigation switching
//   - per-row approval independence
//
// Validates: Requirements 2.3, 3.6, 3.9, 3.10, 6.5
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CampaignManagerPage from '@/app/campaign-manager/page';
import { getMostRecentYear } from '@/lib/mockData';

describe('CampaignManagerPage (integration)', () => {
  // Validates: Requirement 3.6 (default month + year selection)
  it('defaults the Month_Filter to the current calendar month and the Year_Filter to the most recent year', () => {
    render(<CampaignManagerPage />);

    const monthFilter = screen.getByLabelText('Bulan') as HTMLSelectElement;
    const expectedMonth = new Date().getMonth() + 1;
    expect(monthFilter.value).toBe(String(expectedMonth));

    const yearFilter = screen.getByLabelText('Tahun') as HTMLSelectElement;
    const expectedYear = getMostRecentYear();
    expect(expectedYear).not.toBeNull();
    expect(yearFilter.value).toBe(String(expectedYear));
  });

  // Validates: Requirements 3.9, 3.10 (search clamping end-to-end)
  it('clamps the search keyword to 100 characters', () => {
    render(<CampaignManagerPage />);

    const searchField = screen.getByLabelText('Cari') as HTMLInputElement;
    const longValue = 'a'.repeat(150);
    fireEvent.change(searchField, { target: { value: longValue } });

    expect(searchField.value).toHaveLength(100);
    expect(searchField.value).toBe('a'.repeat(100));
  });

  // Validates: Requirements 2.3, 2.5, 2.7 (nav active switching, single active)
  it('switches the active nav item on click and keeps exactly one active', () => {
    const { container } = render(<CampaignManagerPage />);

    // Default active item is "Dashboard" (Req 2.3).
    const dashboardButton = screen.getByRole('button', { name: 'Dashboard' });
    expect(dashboardButton).toHaveAttribute('aria-current', 'page');

    // Click a different nav item.
    const tabPromoButton = screen.getByRole('button', { name: 'Tab Promo' });
    fireEvent.click(tabPromoButton);

    // Active moves to the clicked item; the old one is no longer active.
    expect(tabPromoButton).toHaveAttribute('aria-current', 'page');
    expect(dashboardButton).not.toHaveAttribute('aria-current', 'page');

    // Exactly one nav button is active at a time.
    const activeButtons = Array.from(
      container.querySelectorAll('button[aria-current="page"]'),
    );
    expect(activeButtons).toHaveLength(1);
    expect(activeButtons[0]).toBe(tabPromoButton);
  });

  // Validates: Requirement 6.5 (per-row approval independence)
  it('changing one row approval does not change another row approval', () => {
    render(<CampaignManagerPage />);

    // The page seeds exactly two sample rows, each with an Approve select.
    const approveSelects = screen.getAllByRole('combobox', {
      name: 'Approve',
    }) as HTMLSelectElement[];
    expect(approveSelects).toHaveLength(2);

    // Both rows start at "Pending".
    expect(approveSelects[0].value).toBe('Pending');
    expect(approveSelects[1].value).toBe('Pending');

    // Change only the first row's approval to "Approved".
    fireEvent.change(approveSelects[0], { target: { value: 'Approved' } });

    // First row updated; second row unchanged.
    const refreshed = screen.getAllByRole('combobox', {
      name: 'Approve',
    }) as HTMLSelectElement[];
    expect(refreshed[0].value).toBe('Approved');
    expect(refreshed[1].value).toBe('Pending');
  });
});
