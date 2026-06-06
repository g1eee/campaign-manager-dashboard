'use client';

// Calculated_Field — a read-only display of a derived Margin/NPM value.
//
// Behavior (Req 5.1):
//   - Renders a pre-formatted display string (computed by the parent via
//     `lib/calculations.ts` / `lib/currency.ts`).
//   - Always read-only; the value is never editable here.

interface CalculatedFieldProps {
  label: string; // "Margin" | "NPM"
  displayValue: string; // pre-formatted via currency/calculation utils
  readOnly: true; // Req 5.1 — always read-only
}

export default function CalculatedField({
  label,
  displayValue,
}: CalculatedFieldProps) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-slate-600">{label}</span>
      <output
        aria-label={label}
        className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-semibold text-violet-700"
      >
        {displayValue}
      </output>
    </label>
  );
}
