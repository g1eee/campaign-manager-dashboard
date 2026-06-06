'use client';

// Cost_Field — a numeric Rupiah input for the Campaign_Info_Section.
//
// Behavior (Req 4.5, 4.6, 4.7):
//   - Keeps a raw numeric value (number | null) owned by the parent via props.
//   - Displays the value formatted as Indonesian Rupiah via `formatRupiah`.
//   - Routes keystrokes through `parseRupiahInput` to strip non-digit chars.
//   - Shows an empty value (no "Rp" prefix) when the field is cleared/null.
//   - Clamps the parsed value to `max` (default 999,999,999,999).

import { formatRupiah, parseRupiahInput } from '@/lib/currency';

interface CostFieldProps {
  label: string;
  value: number | null; // raw numeric value in state
  onChange: (value: number | null) => void;
  max?: number; // default 999_999_999_999 (Req 4.5)
}

const DEFAULT_MAX = 999_999_999_999;

export default function CostField({
  label,
  value,
  onChange,
  max = DEFAULT_MAX,
}: CostFieldProps) {
  // Empty/null shows no "Rp" prefix; otherwise show the formatted Rupiah string.
  const displayValue = value === null ? '' : formatRupiah(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseRupiahInput(e.target.value);

    if (parsed === null) {
      // Field cleared / no digits entered.
      onChange(null);
      return;
    }

    // Clamp to the maximum allowed Rupiah value (Req 4.5).
    onChange(parsed > max ? max : parsed);
  };

  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-slate-600">{label}</span>
      <input
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        placeholder="Rp0"
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 shadow-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
      />
    </label>
  );
}
