// Typed Mock_Data loaders for the Campaign Manager Dashboard.
//
// This module is the single access point for the dashboard's static dummy data
// (Req 10.3). Each getter returns a typed view over a `/data/*.json` file whose
// shape mirrors the existing `app/api` response structures (Req 10.4), so the
// loaders can later be swapped to `fetch('/api/<name>')` without changing the
// consuming components.
//
// Following the existing `/data/*.json` convention, the JSON files are imported
// directly (`resolveJsonModule` is enabled in tsconfig) and cast to the shared
// domain types from `@/lib/types`.

import type {
  ApprovalStatus,
  Channel,
  NavItem,
  SummaryMetric,
  WorkflowStepModel,
} from '@/lib/types';

import navItemsData from '@/data/nav-items.json';
import channelsData from '@/data/channels.json';
import workflowData from '@/data/workflow-dashboard.json';
import summaryData from '@/data/summary.json';
import approvalStatusData from '@/data/approval-status.json';
import campaignYearsData from '@/data/campaign-years.json';

/** Sidebar navigation items, in fixed top-to-bottom order (Req 2.2). */
export function getNavItems(): NavItem[] {
  return navItemsData as NavItem[];
}

/** Asset & Channel cards, in fixed left-to-right order (Req 7.2). */
export function getChannels(): Channel[] {
  return channelsData as Channel[];
}

/** Workflow steps, ordered 1 -> 7 (Req 8.2, 8.3). */
export function getWorkflowSteps(): WorkflowStepModel[] {
  return workflowData as WorkflowStepModel[];
}

/** Summary metric cards, in fixed left-to-right order (Req 9.2). */
export function getSummaryMetrics(): SummaryMetric[] {
  return summaryData as SummaryMetric[];
}

/** Allowed approval statuses for the Approve_Field dropdown (Req 6.1). */
export function getApprovalStatuses(): ApprovalStatus[] {
  return approvalStatusData as ApprovalStatus[];
}

/**
 * Raw campaign years exactly as stored in Mock_Data. The values may be
 * unordered and may contain duplicates; use `getDistinctSortedYears` for the
 * Year_Filter option list.
 */
export function getCampaignYears(): number[] {
  return campaignYearsData as number[];
}

/**
 * Pure transform: returns the distinct values of `years` sorted in strictly
 * ascending numeric order, with no duplicate values (Req 3.4). Returns an empty
 * array when given an empty input (Req 3.5).
 *
 * Kept as a standalone pure helper (operating on an input array rather than the
 * JSON import) so the derivation logic can be property-tested over arbitrary
 * inputs independently of the static Mock_Data file.
 */
export function distinctSortedYears(years: number[]): number[] {
  const distinct = Array.from(new Set(years));
  return distinct.sort((a, b) => a - b);
}

/**
 * Pure transform: returns the most recent (maximum) year in `years`, used as the
 * default Year_Filter selection (Req 3.6). Returns `null` when the input is
 * empty so the caller can render an empty, still-enabled Year_Filter without
 * error (Req 3.5).
 */
export function getMostRecentYearFrom(years: number[]): number | null {
  const sorted = distinctSortedYears(years);
  return sorted.length === 0 ? null : sorted[sorted.length - 1];
}

/**
 * Distinct campaign years sorted in strictly ascending numeric order, with no
 * duplicate values (Req 3.4). Returns an empty array when no years exist
 * (Req 3.5).
 */
export function getDistinctSortedYears(): number[] {
  return distinctSortedYears(getCampaignYears());
}

/**
 * The most recent (maximum) campaign year, used as the default Year_Filter
 * selection (Req 3.6). Returns `null` when no years are available so the caller
 * can render an empty, still-enabled Year_Filter without error (Req 3.5).
 */
export function getMostRecentYear(): number | null {
  return getMostRecentYearFrom(getCampaignYears());
}
