'use client';

// Approve_Field — a dropdown for selecting a campaign approval status.
//
// Behavior (Req 6.1, 6.3, 6.6):
//   - Renders the approval status options supplied via props (sourced from
//     Mock_Data).
//   - On change, only valid statuses (validated via `isValidApprovalStatus`)
//     are forwarded to `onChange`; any invalid value is rejected and the
//     previously selected status is retained.

import type { ApprovalStatus } from '@/lib/types';
import { isValidApprovalStatus } from '@/lib/dashboardState';

interface ApproveFieldProps {
  value: ApprovalStatus; // "Pending" | "Approved" | "Rejected"
  options: ApprovalStatus[]; // sourced from Mock_Data (Req 6.1)
  onChange: (next: ApprovalStatus) => void; // rejects invalid (Req 6.6)
}

export default function ApproveField({
  value,
  options,
  onChange,
}: ApproveFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value;

    // Reject any value that is not a valid approval status (Req 6.6); the
    // previously selected status is retained because no onChange is emitted.
    if (isValidApprovalStatus(next)) {
      onChange(next);
    }
  };

  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-slate-600">Approve</span>
      <select
        value={value}
        onChange={handleChange}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 shadow-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
      >
        {options.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
    </label>
  );
}
