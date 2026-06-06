// Pure Rupiah/percentage formatting and input-parsing utilities for the
// Campaign Manager Dashboard.
//
// These functions are pure and total: they never throw, even on edge inputs
// (empty strings, zero, negatives, the ±999,999,999,999 range bounds, NaN, or
// non-finite values). Display formatters always return a well-defined string.
//
// Contracts (see design.md "Reusable Logic Utilities" and Correctness
// Properties P1, P2, P5, P6):
//   - formatRupiah:     "Rp" marker, "." thousands separator, no decimals,
//                       leading minus sign for negatives (Req 4.5, 5.8, 5.9, 9.5).
//   - parseRupiahInput: keeps only digit characters in order; returns `null`
//                       when there are no digits, including "" (Req 4.6, 4.7).
//   - formatPercent1:   one decimal place, comma decimal separator, "%" suffix
//                       (Req 9.6).
//   - clampSearch:      clamps to at most 100 characters (Req 3.9, 3.10).

/** Maximum length of a search keyword (Req 3.10). */
const MAX_SEARCH_LENGTH = 100;

/**
 * Inserts a period as a thousands separator between every group of three
 * digits, counting from the right. Operates on a pure digit string.
 */
function groupThousands(digits: string): string {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Formats an integer Rupiah amount: "Rp" marker, "." thousands separator, no
 * decimal portion. Negative values are rendered with a leading minus sign
 * before the "Rp" marker while retaining Rupiah formatting (Req 5.9).
 *
 * Total: non-finite inputs (NaN, ±Infinity) are treated as 0, and any
 * fractional part is rounded to the nearest integer so the output never
 * contains a decimal portion.
 */
export function formatRupiah(amount: number): string {
  // Normalize non-finite values to 0 so we never emit "RpNaN" / "RpInfinity".
  const safe =
    typeof amount === 'number' && Number.isFinite(amount) ? amount : 0;

  // No decimal places: round to the nearest integer.
  const rounded = Math.round(safe);
  const negative = rounded < 0;
  const digits = Math.abs(rounded).toString();
  const grouped = groupThousands(digits);

  return `${negative ? '-' : ''}Rp${grouped}`;
}

/**
 * Parses raw input into a digits-only numeric value, keeping only the digit
 * characters (0-9) in the order they appear. Returns `null` when the input
 * contains no digit characters (including the empty string).
 */
export function parseRupiahInput(raw: string): number | null {
  if (typeof raw !== 'string') {
    return null;
  }

  // Keep ASCII digits only, preserving order; strip everything else.
  const digits = raw.replace(/[^0-9]/g, '');
  if (digits.length === 0) {
    return null;
  }

  return Number(digits);
}

/**
 * Formats a number as a percentage with exactly one decimal place, using a
 * comma as the decimal separator and a "%" suffix (e.g. `12.34` -> `"12,3%"`).
 *
 * Total: non-finite inputs (NaN, ±Infinity) are treated as 0, yielding "0,0%".
 */
export function formatPercent1(value: number): string {
  const safe =
    typeof value === 'number' && Number.isFinite(value) ? value : 0;

  // toFixed(1) rounds to one decimal place; swap the "." for a "," separator.
  const oneDecimal = safe.toFixed(1).replace('.', ',');
  return `${oneDecimal}%`;
}

/**
 * Clamps a search keyword to at most 100 characters by keeping the first 100
 * characters. Returns the input unchanged when it is already within the limit.
 */
export function clampSearch(raw: string): string {
  if (typeof raw !== 'string') {
    return '';
  }

  return raw.length > MAX_SEARCH_LENGTH ? raw.slice(0, MAX_SEARCH_LENGTH) : raw;
}
