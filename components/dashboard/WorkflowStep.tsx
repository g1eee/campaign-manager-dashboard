import type { WorkflowStepModel } from '@/lib/types';

interface WorkflowStepProps {
  /** The workflow step to render (order, name, icon) (Req 8.5) */
  step: WorkflowStepModel;
  /**
   * When true, render an inbound directional connector to the LEFT of this
   * step, pointing left-to-right into the step (Req 8.4). True for steps 2..N.
   */
  showConnector: boolean;
}

/**
 * Minimal inline glyph map keyed by the `icon` value present in the workflow
 * Mock_Data (`clipboard`, `package`, `calendar-clock`, `send`, `wallet`,
 * `calculator`, `check-circle`). Kept local to this file to avoid introducing a
 * shared Icon component (Req 10.1, 10.2). Unknown keys fall back to a dot.
 */
const ICON_GLYPHS: Record<string, string> = {
  clipboard: '📋',
  package: '📦',
  'calendar-clock': '🗓️',
  send: '📤',
  wallet: '👛',
  calculator: '🧮',
  'check-circle': '✅',
};

/**
 * WorkflowStep — prop-driven step card for the Workflow_Section (Req 8.4, 8.5).
 *
 * Renders an inbound directional connector (an arrow pointing into the step)
 * when `showConnector` is true, followed by the step card: a violet numbered
 * badge (`step.order`), the step icon, and the step name. Presentational only.
 */
export default function WorkflowStep({ step, showConnector }: WorkflowStepProps) {
  const glyph = ICON_GLYPHS[step.icon] ?? '•';

  return (
    <div className="flex shrink-0 items-center gap-3">
      {showConnector && (
        <span
          aria-hidden="true"
          className="flex items-center text-xl font-semibold text-violet-400"
        >
          →
        </span>
      )}

      <div className="flex min-w-[8.5rem] flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-center shadow-sm">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-violet-600 text-sm font-semibold text-white">
          {step.order}
        </span>
        <span aria-hidden="true" className="text-2xl leading-none">
          {glyph}
        </span>
        <span className="whitespace-nowrap text-sm font-medium text-slate-700">
          {step.name}
        </span>
      </div>
    </div>
  );
}
