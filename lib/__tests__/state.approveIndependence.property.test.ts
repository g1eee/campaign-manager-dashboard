// Feature: campaign-manager-dashboard, Property 9: Per-row approval status independence
//
// Validates: Requirements 6.5
//
// Property 9: For any collection of campaign rows (unique ids) and any single
// target row id, after `setRowApproval(rows, targetId, validStatus)`:
//   - every row other than the target retains its original `approve` value,
//   - the target row's `approve` equals the new valid status, and
//   - the input array (and its row objects) are never mutated.

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { setRowApproval } from '@/lib/dashboardState';
import type { ApprovalStatus, CampaignRow } from '@/lib/types';

const APPROVAL_STATUSES: ApprovalStatus[] = ['Pending', 'Approved', 'Rejected'];

/** Builds a minimal valid CampaignRow with the given id and approval status. */
function makeRow(id: string, approve: ApprovalStatus): CampaignRow {
  return {
    id,
    idProduk: '',
    namaProduk: '',
    kategori: '',
    hpp: null,
    hargaJual: null,
    adminFee: null,
    shippingFee: null,
    promoXtra: null,
    feePerPesanan: null,
    campaignFee: null,
    promosiFee: null,
    marketingFee: null,
    adsSpending: null,
    affiliateCommission: null,
    operatingCost: null,
    approve,
  };
}

// Generator: a non-empty collection of rows with UNIQUE string ids, each with
// an approve drawn from the three valid statuses.
const rowsArb = fc
  .uniqueArray(fc.string(), { minLength: 1, maxLength: 12 })
  .chain((ids) =>
    fc.tuple(
      ...ids.map((id) =>
        fc
          .constantFrom<ApprovalStatus>(...APPROVAL_STATUSES)
          .map((status) => makeRow(id, status)),
      ),
    ),
  );

describe('Property 9: Per-row approval status independence', () => {
  it('updates only the target row; all other rows retain their approve value; inputs are not mutated', () => {
    fc.assert(
      fc.property(
        rowsArb,
        fc.nat(),
        fc.constantFrom<ApprovalStatus>(...APPROVAL_STATUSES),
        (rows, targetSeed, nextStatus) => {
          const targetIndex = targetSeed % rows.length;
          const targetId = rows[targetIndex].id;

          // Snapshot original approve values keyed by id and a deep copy of the
          // input to detect mutation.
          const originalApprove = new Map(rows.map((r) => [r.id, r.approve]));
          const originalSnapshot = rows.map((r) => ({ ...r }));

          const result = setRowApproval(rows, targetId, nextStatus);

          // Same number of rows, same ids in the same order.
          expect(result.length).toBe(rows.length);
          expect(result.map((r) => r.id)).toEqual(rows.map((r) => r.id));

          for (const row of result) {
            if (row.id === targetId) {
              // Target row's approve equals the new valid status.
              expect(row.approve).toBe(nextStatus);
            } else {
              // Every other row retains its original approve value.
              expect(row.approve).toBe(originalApprove.get(row.id));
            }
          }

          // Input array is not mutated (content unchanged by reference).
          expect(rows).toEqual(originalSnapshot);
        },
      ),
      { numRuns: 200 },
    );
  });
});
