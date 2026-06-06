// Feature: campaign-manager-dashboard, Property 10: Invalid approval status is rejected
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { setRowApproval, isValidApprovalStatus } from '@/lib/dashboardState';
import type { ApprovalStatus, CampaignRow } from '@/lib/types';

const VALID_STATUSES: readonly ApprovalStatus[] = ['Pending', 'Approved', 'Rejected'];

/** Builds a minimal CampaignRow with the given id and approval status. */
function makeRow(id: string, approve: ApprovalStatus): CampaignRow {
  return {
    id,
    idProduk: `P-${id}`,
    namaProduk: `Produk ${id}`,
    kategori: 'Umum',
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

/** Generates a collection of rows with unique ids and valid initial statuses. */
const rowsArbitrary = fc
  .uniqueArray(fc.string({ minLength: 1, maxLength: 8 }), {
    minLength: 1,
    maxLength: 6,
  })
  .chain((ids) =>
    fc.tuple(
      ...ids.map((id) =>
        fc.constantFrom(...VALID_STATUSES).map((status) => makeRow(id, status)),
      ),
    ),
  ) as fc.Arbitrary<CampaignRow[]>;

// A candidate value that covers both valid statuses and arbitrary invalid input
// (random strings and non-string values).
const candidateArbitrary = fc.oneof(
  fc.string(),
  fc.constantFrom<unknown>('Pending', 'Approved', 'Rejected'),
  fc.anything(),
);

describe('setRowApproval — Property 10: Invalid approval status is rejected', () => {
  // Validates: Requirements 6.6
  it('applies the value only when valid, otherwise retains the previous status, and never mutates input', () => {
    fc.assert(
      fc.property(
        rowsArbitrary,
        candidateArbitrary,
        (rows, candidate) => {
          // Pick a target row by index derived from the candidate-independent state.
          const targetIndex = rows.length > 0 ? rows.length - 1 : 0;
          const target = rows[targetIndex];
          const previousStatus = target.approve;

          // Deep snapshot of input to detect mutation afterwards.
          const snapshot = JSON.parse(JSON.stringify(rows));

          const result = setRowApproval(rows, target.id, candidate);
          const updatedTarget = result.find((r) => r.id === target.id)!;

          if (isValidApprovalStatus(candidate)) {
            // Valid candidate: target row's approve becomes the candidate.
            expect(updatedTarget.approve).toBe(candidate);
          } else {
            // Invalid candidate: previous status retained (rejected).
            expect(updatedTarget.approve).toBe(previousStatus);
          }

          // Input array and its rows are never mutated.
          expect(rows).toEqual(snapshot);
        },
      ),
      { numRuns: 300 },
    );
  });

  // Validates: Requirements 6.6
  it('every other row is unchanged regardless of candidate validity', () => {
    fc.assert(
      fc.property(rowsArbitrary, candidateArbitrary, (rows, candidate) => {
        const target = rows[rows.length - 1];
        const result = setRowApproval(rows, target.id, candidate);

        for (const original of rows) {
          if (original.id === target.id) continue;
          const after = result.find((r) => r.id === original.id)!;
          expect(after.approve).toBe(original.approve);
        }
      }),
      { numRuns: 100 },
    );
  });
});
