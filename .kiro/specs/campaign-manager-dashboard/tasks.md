# Implementation Plan: Campaign Manager Dashboard

## Overview

This plan builds the Campaign Manager Dashboard incrementally for the existing Next.js 14 (App Router) + TypeScript + Tailwind project. Work starts by installing the missing test tooling, then establishes shared types and mock data, then the pure logic utilities (with their property-based tests), then the small state reducers, then every reusable component and section (with example/render tests), and finally composes them into `app/campaign-manager/page.tsx`, applies responsive/theme polish, and verifies the type-check.

All code is TypeScript. Property-based tests use **fast-check**, run a **minimum of 100 iterations** each, and are tagged with a comment in the format:
`// Feature: campaign-manager-dashboard, Property {number}: {property_text}`

## Tasks

- [x] 1. Set up test tooling
  - [x] 1.1 Add and configure Vitest + fast-check + Testing Library
    - Add dev dependencies: `vitest`, `fast-check`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`
    - Create `vitest.config.ts` with `jsdom` environment, `@/` path alias (mirroring `tsconfig.json`), and globals enabled
    - Create `test/setup.ts` importing `@testing-library/jest-dom` and register it in the Vitest config `setupFiles`
    - Add `"test": "vitest --run"` script to `package.json` (single-run, non-watch)
    - _Requirements: 10.6_

- [x] 2. Establish shared types and mock data
  - [x] 2.1 Define TypeScript domain types
    - Create `lib/types.ts` with `ApprovalStatus`, `CampaignRow` (12 cost fields as `number | null`, no stored Margin/NPM), `NavItem`, `ChannelDetail`, `Channel`, `WorkflowStepModel`, `SummaryFormat`, `SummaryTrend`, `SummaryMetric`, `MonthOption`
    - Reuse the camelCase cost key names already present in `data/products.json` so the types stay shape-compatible with `app/api` responses
    - _Requirements: 10.4, 4.4, 6.4, 5.1_

  - [x] 2.2 Create mock data files and typed loader
    - Add `data/nav-items.json` (9 items in order), `data/channels.json` (7 channels with detail label/value pairs), `data/workflow-dashboard.json` (7 steps ordered 1–7), `data/summary.json` (5 metrics with `format` + optional `trend`), `data/approval-status.json` (Pending/Approved/Rejected), `data/campaign-years.json` (raw years, may include duplicates)
    - Create `lib/mockData.ts` exposing typed getters: `getNavItems`, `getChannels`, `getWorkflowSteps`, `getSummaryMetrics`, `getApprovalStatuses`, `getCampaignYears`, and `getDistinctSortedYears` (distinct + strictly ascending)
    - _Requirements: 10.3, 10.4, 2.2, 7.2, 8.2, 9.2, 9.4, 6.1, 3.4_

  - [x]* 2.3 Write property test for distinct/sorted year options
    - **Property 7: Year options are distinct, ascending, and default to the most recent**
    - File: `lib/__tests__/mockData.years.property.test.ts`; use fast-check integer-array generators including duplicates and empty arrays
    - **Validates: Requirements 3.4, 3.5, 3.6**

- [x] 3. Implement currency formatting/parsing utilities
  - [x] 3.1 Implement `lib/currency.ts`
    - `formatRupiah(amount)`: "Rp" marker, period thousands separator, no decimals, leading minus for negatives
    - `parseRupiahInput(raw)`: keep only digit characters in order, return `null` when no digits
    - `formatPercent1(value)`: one decimal place, comma decimal separator, "%" suffix
    - `clampSearch(raw)`: clamp to at most 100 characters
    - _Requirements: 4.5, 4.6, 4.7, 5.8, 5.9, 9.5, 9.6, 3.9, 3.10_

  - [x]* 3.2 Write property test for Rupiah formatting round-trip and grouping
    - **Property 1: Rupiah formatting round-trip and grouping**
    - File: `lib/__tests__/currency.formatRupiah.property.test.ts`; integer generators including negatives and the ±999,999,999,999 bounds
    - **Validates: Requirements 4.5, 5.8, 5.9, 9.5**

  - [x]* 3.3 Write property test for Rupiah input parsing
    - **Property 2: Rupiah input parsing keeps only digits**
    - File: `lib/__tests__/currency.parseRupiahInput.property.test.ts`; arbitrary string generators including unicode and empty strings
    - **Validates: Requirements 4.6, 4.7**

  - [x]* 3.4 Write property test for percentage formatting shape
    - **Property 5: Percentage formatting shape**
    - File: `lib/__tests__/currency.formatPercent1.property.test.ts`; finite non-negative float generators
    - **Validates: Requirements 9.6**

  - [x]* 3.5 Write property test for search keyword clamping
    - **Property 6: Search keyword clamping**
    - File: `lib/__tests__/currency.clampSearch.property.test.ts`; string generators including lengths greater than 100
    - **Validates: Requirements 3.9, 3.10**

- [x] 4. Implement margin/NPM calculation utilities
  - [x] 4.1 Implement `lib/calculations.ts`
    - `CostComponents` interface; internal `toNumber(v)` mapping `null`/`NaN`/non-finite to `0`
    - `computeMargin(hargaJual, costs)`: `(hargaJual ?? 0)` minus the sum of the 11 cost components
    - `computeNpm(margin, hargaJual)`: `(margin / hargaJual) * 100` rounded to 2 dp; `0` when `hargaJual <= 0`/null
    - `formatNpm(margin, hargaJual)`: NPM string with "%" suffix; `"0%"` when `hargaJual` is 0/empty/non-numeric
    - _Requirements: 5.4, 5.5, 5.6, 5.7_

  - [x]* 4.2 Write property test for Margin computation
    - **Property 3: Margin equals Harga Jual minus the sum of cost components, treating missing values as zero**
    - File: `lib/__tests__/calculations.computeMargin.property.test.ts`; record generators of `number | null` for the 11 components
    - **Validates: Requirements 5.4, 5.6**

  - [x]* 4.3 Write property test for NPM formula with zero-guard
    - **Property 4: NPM formula with zero-guard**
    - File: `lib/__tests__/calculations.npm.property.test.ts`; number generators including `0`/`null` for `hargaJual`
    - **Validates: Requirements 5.5, 5.7**

- [x] 5. Implement pure state reducers/selectors
  - [x] 5.1 Implement `lib/dashboardState.ts`
    - `selectNav(activeId, nextId)`: returns the next active nav id (selecting the active id is a no-op)
    - `setRowApproval(rows, rowId, next)`: returns a new rows array updating only the target row's `approve`, rejecting any value not in `{Pending, Approved, Rejected}` (previous value retained)
    - `isValidApprovalStatus(value)`: type guard for the three allowed statuses
    - _Requirements: 2.4, 2.5, 2.7, 6.5, 6.6_

  - [x]* 5.2 Write property test for single-active navigation invariant
    - **Property 8: Exactly one navigation item is active**
    - File: `lib/__tests__/state.nav.property.test.ts`; generators producing sequences of nav selections
    - **Validates: Requirements 2.4, 2.5, 2.7**

  - [x]* 5.3 Write property test for per-row approval independence
    - **Property 9: Per-row approval status independence**
    - File: `lib/__tests__/state.approveIndependence.property.test.ts`; row-collection + target-index generators
    - **Validates: Requirements 6.5**

  - [x]* 5.4 Write property test for invalid approval rejection
    - **Property 10: Invalid approval status is rejected**
    - File: `lib/__tests__/state.approveInvalid.property.test.ts`; arbitrary string generators
    - **Validates: Requirements 6.6**

- [x] 6. Implement Sidebar component
  - [x] 6.1 Create `components/dashboard/Sidebar.tsx`
    - Prop-driven (`title`, `items`, `activeId`, `onSelect`); render title, map items to buttons, apply violet accent to the active item
    - _Requirements: 2.1, 2.2, 2.6, 10.1, 10.2_

  - [x]* 6.2 Write example tests for Sidebar
    - File: `components/dashboard/__tests__/Sidebar.test.tsx`; assert "Navigasi" title, 9 items in order, default-active "Dashboard", violet accent on active item, `onSelect` fires on click
    - _Requirements: 2.1, 2.2, 2.3, 2.6_

- [x] 7. Implement Header_Bar component
  - [x] 7.1 Create `components/dashboard/HeaderBar.tsx`
    - Render title "Campaign Manager" and controls left-to-right: Month_Filter (12 months), Year_Filter, Search_Field, Add_Campaign_Button ("+ Tambah Campaign")
    - Search input routes through `clampSearch` before `onSearchChange`; Year_Filter stays enabled when `years` is empty
    - _Requirements: 3.1, 3.2, 3.3, 3.5, 3.7, 3.8, 3.10, 3.11, 10.1_

  - [x]* 7.2 Write example tests for Header_Bar
    - File: `components/dashboard/__tests__/HeaderBar.test.tsx`; assert title, control order, 12 month options, add-button label, search clamping wiring, empty-years renders no options without error
    - _Requirements: 3.1, 3.2, 3.3, 3.5, 3.11_

- [x] 8. Implement Campaign_Info_Section and fields
  - [x] 8.1 Create field components
    - `components/dashboard/CostField.tsx` (raw numeric state, formatted Rupiah display via `formatRupiah`, keystrokes through `parseRupiahInput`, empty shows no "Rp", clamp to max 999,999,999,999)
    - `components/dashboard/CalculatedField.tsx` (read-only, pre-formatted display value)
    - `components/dashboard/ApproveField.tsx` (dropdown of statuses from props, `onChange` rejects invalid via `isValidApprovalStatus`)
    - _Requirements: 4.5, 4.6, 4.7, 5.1, 6.1, 6.3, 6.6_

  - [x] 8.2 Create `components/dashboard/CampaignInfoSection.tsx`
    - Render "Informasi Campaign" title and the two field rows in the exact order specified; delegate cost inputs to `CostField`, Margin/NPM to `CalculatedField` (derived per render via `lib/calculations.ts`), Approve to `ApproveField`
    - Render an empty-state placeholder when no rows are supplied
    - _Requirements: 4.1, 4.2, 4.3, 4.8, 4.9, 5.1, 5.2, 5.3, 5.8, 5.9, 1.8_

  - [x]* 8.3 Write example tests for Campaign_Info_Section
    - File: `components/dashboard/__tests__/CampaignInfoSection.test.tsx`; assert title, first/second-row field order, Margin/NPM read-only, Rupiah-formatted Margin display, default approval "Pending", recompute on cost change
    - _Requirements: 4.1, 4.2, 4.3, 5.1, 5.8, 6.2_

- [x] 9. Implement Asset_Channel_Section
  - [x] 9.1 Create `components/dashboard/ChannelCard.tsx`
    - Render icon + channel name and every detail label/value pair; substitute "-" when a value is empty/null/unavailable
    - _Requirements: 7.10, 7.11, 7.12, 10.1, 10.2_

  - [x] 9.2 Create `components/dashboard/AssetChannelSection.tsx`
    - Render heading "Asset & Channel"; map mock channels to exactly 7 `ChannelCard`s in fixed order; empty-state placeholder when collection is empty
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 1.8, 10.5_

  - [x]* 9.3 Write property test for channel detail rendering completeness
    - **Property 12: Channel card renders every detail with placeholder substitution**
    - File: `components/dashboard/__tests__/ChannelCard.details.property.test.tsx`; fast-check-generated detail lists including null/empty values, rendered via Testing Library
    - **Validates: Requirements 7.11, 7.12**

  - [x]* 9.4 Write example tests for Asset_Channel_Section
    - File: `components/dashboard/__tests__/AssetChannelSection.test.tsx`; assert heading, 7 cards in order, and each channel's exact detail labels
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 7.10_

- [x] 10. Implement Workflow_Section
  - [x] 10.1 Create `components/dashboard/WorkflowStep.tsx`
    - Render step icon + name; render inbound directional connector when `showConnector` is true
    - _Requirements: 8.4, 8.5, 10.1, 10.2_

  - [x] 10.2 Create `components/dashboard/WorkflowSection.tsx`
    - Render "Workflow Campaign" title; arrange steps 1→7 in a single horizontal `overflow-x-auto` row; render `N - 1` connectors; show "unavailable" message when the step set is empty
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.6, 8.7_

  - [x]* 10.3 Write property test for workflow connector count
    - **Property 11: Workflow connector count**
    - File: `components/dashboard/__tests__/WorkflowSection.connectors.property.test.tsx`; step-list length generators including 0, 1, 7, and large lists
    - **Validates: Requirements 8.4**

  - [x]* 10.4 Write example tests for Workflow_Section
    - File: `components/dashboard/__tests__/WorkflowSection.test.tsx`; assert title, 7 named steps in order, horizontal scroll container presence, and empty-set unavailable message
    - _Requirements: 8.1, 8.2, 8.3, 8.6, 8.7_

- [x] 11. Implement Summary_Section
  - [x] 11.1 Create `components/dashboard/SummaryCard.tsx`
    - Render icon, label, primary number, and trend note; format per `format` (`rupiah` via `formatRupiah`, `percent1` via `formatPercent1`, else number); when `value` is null render a placeholder and omit the trend note
    - _Requirements: 9.3, 9.5, 9.6, 9.7, 10.1, 10.2_

  - [x] 11.2 Create `components/dashboard/SummarySection.tsx`
    - Render "Status & Ringkasan" title; render exactly 5 cards in fixed order from mock data; empty-state placeholder when collection is empty
    - _Requirements: 9.1, 9.2, 9.4, 1.8, 10.5_

  - [x]* 11.3 Write example tests for Summary_Section
    - File: `components/dashboard/__tests__/SummarySection.test.tsx`; assert title, 5 cards in order, "Budget Terpakai" Rupiah format, "Margin Rata-rata" percent format, null-value placeholder omits trend
    - _Requirements: 9.1, 9.2, 9.5, 9.6, 9.7_

- [x] 12. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 13. Compose the dashboard page
  - [x] 13.1 Create `app/campaign-manager/page.tsx`
    - `'use client'` page owning state: `activeNavItem`, `month` (default current month), `year` (default most recent), `search`, `rows`
    - Load mock data via `lib/mockData.ts`; wire `selectNav` and `setRowApproval`; implement `onAddCampaign` adding a blank `CampaignRow`
    - Compose Sidebar + HeaderBar + sections A→B→C→D inside the responsive layout wrapper
    - _Requirements: 1.1, 1.2, 1.3, 2.3, 2.5, 2.7, 3.6, 3.7, 3.8, 4.8, 4.9, 6.4, 6.5, 10.3_

  - [x]* 13.2 Write property test for empty-state rendering across sections
    - **Property 13: Sections render with an empty-state placeholder and never crash on empty data**
    - File: `components/dashboard/__tests__/sections.emptyState.property.test.tsx`; empty/missing collection generators for all four section components; assert containers render, placeholders shown, A→B→C→D order preserved, and Summary_Card omits trend on missing value
    - **Validates: Requirements 1.8, 7.12, 8.7, 9.7, 10.5**

  - [x]* 13.3 Write integration tests for the page
    - File: `app/__tests__/campaignManagerPage.test.tsx`; assert default month/year selection, search clamping end-to-end, nav active switching (single active), and per-row approval independence through the rendered page
    - _Requirements: 2.3, 3.6, 3.9, 3.10, 6.5_

- [x] 14. Responsive, theme polish, and type-check
  - [x] 14.1 Apply responsive layout and light-theme polish
    - Desktop (`lg:`) side-by-side sidebar/content; tablet (`md:`) and mobile single column; `overflow-x-hidden` on the page wrapper; rounded white cards, `bg-slate-50` body, violet/indigo accents
    - _Requirements: 1.4, 1.5, 1.6, 1.7_

  - [x] 14.2 Verify type-check passes
    - Run `npx tsc --noEmit` (or `next build`) and resolve any type errors so the feature compiles cleanly
    - _Requirements: 10.6_

- [x] 15. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional test tasks and can be skipped for a faster MVP.
- Each task references specific requirements for traceability; property test tasks also reference the design's correctness property they validate.
- Margin and NPM are always derived during render and never stored in state.
- Property-based tests use fast-check, run at least 100 iterations, and carry the `// Feature: campaign-manager-dashboard, Property {number}: ...` tag.
- Checkpoints (tasks 12 and 15) provide incremental validation points.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1", "3.1", "4.1"] },
    { "id": 2, "tasks": ["2.2", "5.1", "3.2", "3.3", "3.4", "3.5", "4.2", "4.3"] },
    { "id": 3, "tasks": ["2.3", "5.2", "5.3", "5.4", "6.1", "7.1", "8.1", "9.1", "10.1", "11.1"] },
    { "id": 4, "tasks": ["8.2", "9.2", "10.2", "11.2", "6.2", "7.2", "9.3"] },
    { "id": 5, "tasks": ["8.3", "9.4", "10.3", "10.4", "11.3"] },
    { "id": 6, "tasks": ["13.1"] },
    { "id": 7, "tasks": ["14.1"] },
    { "id": 8, "tasks": ["13.2", "13.3", "14.2"] }
  ]
}
```
