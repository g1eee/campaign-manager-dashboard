'use client';

// Header_Bar component for the Campaign Manager Dashboard.
//
// Prop-driven (Req 10.1): renders the page title and, left-to-right, the
// Month_Filter, Year_Filter, Search_Field, and Add_Campaign_Button (Req 3.2).
// The Search_Field routes input through `clampSearch` so the keyword never
// exceeds 100 characters before reaching `onSearchChange` (Req 3.9, 3.10).
// When `years` is empty the Year_Filter renders no options but stays enabled
// for interaction without throwing (Req 3.5).

import React from 'react';
import { clampSearch } from '@/lib/currency';
import type { MonthOption } from '@/lib/types';

export interface HeaderBarProps {
  title: string; // "Campaign Manager" (Req 3.1)
  months: MonthOption[]; // 12 months (Req 3.3)
  years: number[]; // distinct, ascending, de-duplicated (Req 3.4, 3.5)
  selectedMonth: number;
  selectedYear: number | null;
  search: string;
  addButtonLabel: string; // "+ Tambah Campaign" (Req 3.11)
  onMonthChange: (m: number) => void;
  onYearChange: (y: number) => void;
  onSearchChange: (keyword: string) => void; // enforces <=100 chars (Req 3.9, 3.10)
  onAddCampaign: () => void;
}

/** Simple inline magnifying-glass glyph for the Search_Field (no npm deps). */
function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      className="h-4 w-4 text-slate-400"
    >
      <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="m17 17-3.2-3.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

const controlClasses =
  'rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 ' +
  'shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500';

export default function HeaderBar({
  title,
  months,
  years,
  selectedMonth,
  selectedYear,
  search,
  addButtonLabel,
  onMonthChange,
  onYearChange,
  onSearchChange,
  onAddCampaign,
}: HeaderBarProps) {
  const monthOptions = months ?? [];
  const yearOptions = years ?? [];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Clamp to at most 100 characters before notifying the parent (Req 3.10).
    onSearchChange(clampSearch(e.target.value));
  };

  return (
    <header className="flex w-full flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
      {/* Page title (Req 3.1) */}
      <h1 className="text-xl font-semibold text-slate-900">{title}</h1>

      {/* Controls left-to-right: Month, Year, Search, Add (Req 3.2) */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Month_Filter — 12 months (Req 3.3) */}
        <label className="sr-only" htmlFor="header-month-filter">
          Bulan
        </label>
        <select
          id="header-month-filter"
          aria-label="Bulan"
          className={controlClasses}
          value={selectedMonth}
          onChange={(e) => onMonthChange(Number(e.target.value))}
        >
          {monthOptions.map((month) => (
            <option key={month.value} value={month.value}>
              {month.label}
            </option>
          ))}
        </select>

        {/* Year_Filter — stays enabled even when empty (Req 3.5) */}
        <label className="sr-only" htmlFor="header-year-filter">
          Tahun
        </label>
        <select
          id="header-year-filter"
          aria-label="Tahun"
          className={controlClasses}
          value={selectedYear ?? ''}
          onChange={(e) => onYearChange(Number(e.target.value))}
        >
          {yearOptions.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        {/* Search_Field — clamps to 100 chars via clampSearch (Req 3.9, 3.10) */}
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
            <SearchIcon />
          </span>
          <label className="sr-only" htmlFor="header-search-field">
            Cari
          </label>
          <input
            id="header-search-field"
            type="text"
            aria-label="Cari"
            placeholder="Cari campaign..."
            className={`${controlClasses} pl-9`}
            value={search}
            onChange={handleSearchChange}
          />
        </div>

        {/* Add_Campaign_Button — violet primary (Req 3.11) */}
        <button
          type="button"
          onClick={onAddCampaign}
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
        >
          {addButtonLabel}
        </button>
      </div>
    </header>
  );
}
