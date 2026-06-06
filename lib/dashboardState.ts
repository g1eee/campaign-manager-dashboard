// Pure state reducers/selectors for the Campaign Manager Dashboard.
//
// These functions are pure and total: they never mutate their inputs, always
// return new values (new arrays for collection updates), and produce a
// well-defined result for every input — including invalid ones. They contain
// no React and are tested independently (Properties 8, 9, 10).

import type { ApprovalStatus, CampaignRow } from '@/lib/types';

/** The three allowed approval statuses (Req 6.1, 6.6). */
const APPROVAL_STATUSES: readonly ApprovalStatus[] = ['Pending', 'Approved', 'Rejected'];

/**
 * Type guard for the three allowed approval statuses (Req 6.6).
 *
 * Returns `true` only when `value` is exactly one of "Pending", "Approved", or
 * "Rejected". Any other value (including non-strings) yields `false`.
 */
export function isValidApprovalStatus(value: unknown): value is ApprovalStatus {
  return (
    typeof value === 'string' &&
    (APPROVAL_STATUSES as readonly string[]).includes(value)
  );
}

/**
 * Selects the next active navigation item id (Req 2.4, 2.5, 2.7).
 *
 * Returns `nextId` as the new active id. Selecting the already-active item is a
 * no-op because the returned id is unchanged. Exactly one item is active at all
 * times because the active state is represented by a single id value.
 */
export function selectNav(activeId: string, nextId: string): string {
  return nextId === activeId ? activeId : nextId;
}

/**
 * Returns a new rows array with the target row's `approve` status updated to
 * `next` (Req 6.5, 6.6).
 *
 * - Only the row whose `id === rowId` is changed; all other rows are returned
 *   unchanged (per-row independence, Property 9).
 * - If `next` is not a valid approval status, the value is rejected and the
 *   target row's previous status is retained (Property 10).
 * - The input array and its row objects are never mutated; a new array (and a
 *   new object for the updated row) is returned.
 */
export function setRowApproval(
  rows: CampaignRow[],
  rowId: string,
  next: unknown,
): CampaignRow[] {
  if (!isValidApprovalStatus(next)) {
    // Invalid status: reject and retain previous values. Return a new array to
    // keep the function's return contract consistent without mutating input.
    return rows.slice();
  }

  return rows.map((row) =>
    row.id === rowId ? { ...row, approve: next } : row,
  );
}
