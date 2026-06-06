// Feature: campaign-manager-dashboard, Property 3: Margin equals Harga Jual minus the sum of cost components, treating missing values as zero
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { computeMargin, type CostComponents } from '@/lib/calculations';

// The eleven cost component keys subtracted from Harga Jual to derive Margin.
const COST_KEYS = [
  'hpp',
  'adminFee',
  'shippingFee',
  'promoXtra',
  'feePerPesanan',
  'campaignFee',
  'promosiFee',
  'marketingFee',
  'adsSpending',
  'affiliateCommission',
  'operatingCost',
] as const satisfies readonly (keyof CostComponents)[];

// A single cost component: either a non-negative integer or null (empty field).
// Magnitudes are bounded so the sum of 11 components plus hargaJual stays well
// within Number.MAX_SAFE_INTEGER, keeping integer arithmetic exact.
const componentArb = fc.oneof(
  fc.constant(null),
  fc.integer({ min: 0, max: 1_000_000_000 }),
);

// hargaJual: an integer or null, same bounded magnitude.
const hargaJualArb = fc.oneof(
  fc.constant(null),
  fc.integer({ min: 0, max: 1_000_000_000 }),
);

// A record generator producing each of the 11 fields as number | null.
const costsArb: fc.Arbitrary<CostComponents> = fc.record({
  hpp: componentArb,
  adminFee: componentArb,
  shippingFee: componentArb,
  promoXtra: componentArb,
  feePerPesanan: componentArb,
  campaignFee: componentArb,
  promosiFee: componentArb,
  marketingFee: componentArb,
  adsSpending: componentArb,
  affiliateCommission: componentArb,
  operatingCost: componentArb,
});

describe('computeMargin - Property 3: Margin = Harga Jual minus the sum of cost components, missing values as zero', () => {
  // Validates: Requirements 5.4, 5.6
  it('equals (hargaJual ?? 0) minus the sum of the eleven components with null treated as 0', () => {
    fc.assert(
      fc.property(hargaJualArb, costsArb, (hargaJual, costs) => {
        const sum = COST_KEYS.reduce(
          (acc, key) => acc + (costs[key] ?? 0),
          0,
        );
        const expected = (hargaJual ?? 0) - sum;
        expect(computeMargin(hargaJual, costs)).toBe(expected);
      }),
      { numRuns: 200 },
    );
  });

  // Validates: Requirements 5.6
  it('treats replacing any single component with null the same as replacing it with 0', () => {
    fc.assert(
      fc.property(
        hargaJualArb,
        costsArb,
        fc.integer({ min: 0, max: COST_KEYS.length - 1 }),
        (hargaJual, costs, idx) => {
          const key = COST_KEYS[idx];
          const withNull: CostComponents = { ...costs, [key]: null };
          const withZero: CostComponents = { ...costs, [key]: 0 };
          expect(computeMargin(hargaJual, withNull)).toBe(
            computeMargin(hargaJual, withZero),
          );
        },
      ),
      { numRuns: 200 },
    );
  });
});
