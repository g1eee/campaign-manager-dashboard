// Pure Margin/NPM calculation utilities for the Campaign Manager Dashboard.
//
// These functions are pure and total: they never throw and never let `NaN`
// or non-finite values propagate to the UI. Any `null`, `NaN`, or non-finite
// input is normalized to `0` via the internal `toNumber` helper.
//
// Contracts (see design.md "Reusable Logic Utilities" and Correctness
// Properties P3 / P4):
//   - computeMargin: Margin = hargaJual - sum(11 cost components),
//     treating missing/non-numeric values as 0 (Req 5.4, 5.6).
//   - computeNpm:    NPM = (margin / hargaJual) * 100 rounded to 2 dp;
//     returns 0 when hargaJual <= 0, null, or non-numeric (Req 5.5, 5.7).
//   - formatNpm:     NPM display string with a "%" suffix; "0%" when
//     hargaJual is 0/empty/non-numeric (Req 5.7).

/**
 * The eleven cost components that are subtracted from Harga Jual to derive
 * Margin. Each value may be `null` (empty field) and is treated as `0` in the
 * calculation.
 */
export interface CostComponents {
  hpp: number | null;
  adminFee: number | null;
  shippingFee: number | null;
  promoXtra: number | null;
  feePerPesanan: number | null;
  campaignFee: number | null;
  promosiFee: number | null;
  marketingFee: number | null;
  adsSpending: number | null;
  affiliateCommission: number | null;
  operatingCost: number | null;
}

/**
 * Normalizes a possibly-missing numeric value to a finite number.
 * Maps `null`, `undefined`, `NaN`, and non-finite values (Infinity/-Infinity)
 * to `0`. Guarantees no `NaN`/non-finite value escapes into a calculation.
 */
function toNumber(v: number | null | undefined): number {
  if (v === null || v === undefined) {
    return 0;
  }
  if (typeof v !== 'number' || !Number.isFinite(v)) {
    return 0;
  }
  return v;
}

/**
 * Computes Margin = Harga Jual minus the sum of the eleven cost components.
 * Missing/non-numeric values (null, NaN, non-finite) are treated as 0.
 */
export function computeMargin(
  hargaJual: number | null,
  costs: CostComponents,
): number {
  const totalCost =
    toNumber(costs.hpp) +
    toNumber(costs.adminFee) +
    toNumber(costs.shippingFee) +
    toNumber(costs.promoXtra) +
    toNumber(costs.feePerPesanan) +
    toNumber(costs.campaignFee) +
    toNumber(costs.promosiFee) +
    toNumber(costs.marketingFee) +
    toNumber(costs.adsSpending) +
    toNumber(costs.affiliateCommission) +
    toNumber(costs.operatingCost);

  return toNumber(hargaJual) - totalCost;
}

/**
 * Computes NPM = (margin / hargaJual) * 100, rounded to two decimal places.
 * Returns 0 when hargaJual is <= 0, null, or non-numeric (zero-guard, no
 * division by zero and no NaN propagation).
 */
export function computeNpm(margin: number, hargaJual: number | null): number {
  const hj = toNumber(hargaJual);
  if (hj <= 0) {
    return 0;
  }

  const npm = (toNumber(margin) / hj) * 100;
  // Round to two decimal places.
  return Math.round(npm * 100) / 100;
}

/**
 * Formats NPM as a display string with a "%" suffix. Returns exactly "0%" when
 * hargaJual is 0, empty/null, or non-numeric.
 */
export function formatNpm(margin: number, hargaJual: number | null): string {
  return `${computeNpm(margin, hargaJual)}%`;
}
