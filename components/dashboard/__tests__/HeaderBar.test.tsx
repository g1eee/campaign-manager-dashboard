// Example/render tests for the Header_Bar component.
//
// Validates: Requirements 3.1, 3.2, 3.3, 3.5, 3.11
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import HeaderBar from '@/components/dashboard/HeaderBar';
import type { MonthOption } from '@/lib/types';

const MONTHS: MonthOption[] = [
  { value: 1, label: 'Januari' },
  { value: 2, label: 'Februari' },
  { value: 3, label: 'Maret' },
  { value: 4, label: 'April' },
  { value: 5, label: 'Mei' },
  { value: 6, label: 'Juni' },
  { value: 7, label: 'Juli' },
  { value: 8, label: 'Agustus' },
  { value: 9, label: 'September' },
  { value: 10, label: 'Oktober' },
  { value: 11, label: 'November' },
  { value: 12, label: 'Desember' },
];

const YEARS = [2023, 2024, 2025];

interface RenderOverrides {
  years?: number[];
  onSearchChange?: (keyword: string) => void;
  onMonthChange?: (m: number) => void;
  onYearChange?: (y: number) => void;
  onAddCampaign?: () => void;
}

function renderHeaderBar(overrides: RenderOverrides = {}) {
  const props = {
    title: 'Campaign Manager',
    months: MONTHS,
    years: overrides.years ?? YEARS,
    selectedMonth: 1,
    selectedYear: overrides.years && overrides.years.length === 0 ? null : 2025,
    search: '',
    addButtonLabel: '+ Tambah Campaign',
    onMonthChange: overrides.onMonthChange ?? vi.fn(),
    onYearChange: overrides.onYearChange ?? vi.fn(),
    onSearchChange: overrides.onSearchChange ?? vi.fn(),
    onAddCampaign: overrides.onAddCampaign ?? vi.fn(),
  };
  const utils = render(<HeaderBar {...props} />);
  return { ...utils, props };
}

describe('HeaderBar', () => {
  // Validates: Requirement 3.1
  it('renders the title "Campaign Manager"', () => {
    renderHeaderBar();
    expect(
      screen.getByRole('heading', { name: 'Campaign Manager' })
    ).toBeInTheDocument();
  });

  // Validates: Requirement 3.2
  it('renders the controls left-to-right: Month, Year, Search, Add', () => {
    const { container } = renderHeaderBar();

    const monthFilter = screen.getByLabelText('Bulan');
    const yearFilter = screen.getByLabelText('Tahun');
    const searchField = screen.getByLabelText('Cari');
    const addButton = screen.getByRole('button', { name: '+ Tambah Campaign' });

    // Collect every interactive control and assert document (left-to-right) order.
    const controls = Array.from(
      container.querySelectorAll('select, input, button')
    );
    const order = [monthFilter, yearFilter, searchField, addButton].map((el) =>
      controls.indexOf(el)
    );

    order.forEach((idx) => expect(idx).toBeGreaterThanOrEqual(0));
    expect(order).toEqual([...order].sort((a, b) => a - b));
    // Explicit pairwise ordering for clarity.
    expect(order[0]).toBeLessThan(order[1]);
    expect(order[1]).toBeLessThan(order[2]);
    expect(order[2]).toBeLessThan(order[3]);
  });

  // Validates: Requirement 3.3
  it('renders exactly 12 month options', () => {
    renderHeaderBar();
    const monthFilter = screen.getByLabelText('Bulan');
    const options = within(monthFilter).getAllByRole('option');
    expect(options).toHaveLength(12);
    expect(options.map((o) => o.textContent)).toEqual([
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember',
    ]);
  });

  // Validates: Requirement 3.11
  it('renders the add button with label "+ Tambah Campaign"', () => {
    renderHeaderBar();
    expect(
      screen.getByRole('button', { name: '+ Tambah Campaign' })
    ).toBeInTheDocument();
  });

  // Validates: Requirements 3.9, 3.10 (search clamping wiring)
  it('routes search input through clampSearch (>100 chars clamped to 100)', () => {
    const onSearchChange = vi.fn();
    renderHeaderBar({ onSearchChange });

    const searchField = screen.getByLabelText('Cari');
    const longValue = 'a'.repeat(150);
    fireEvent.change(searchField, { target: { value: longValue } });

    expect(onSearchChange).toHaveBeenCalledTimes(1);
    const received = onSearchChange.mock.calls[0][0] as string;
    expect(received).toHaveLength(100);
    expect(received).toBe('a'.repeat(100));
  });

  // Validates: Requirement 3.5 (empty years renders no options, stays enabled)
  it('renders no year options without error when years is empty', () => {
    renderHeaderBar({ years: [] });
    const yearFilter = screen.getByLabelText('Tahun') as HTMLSelectElement;
    expect(within(yearFilter).queryAllByRole('option')).toHaveLength(0);
    expect(yearFilter.disabled).toBe(false);
  });
});
