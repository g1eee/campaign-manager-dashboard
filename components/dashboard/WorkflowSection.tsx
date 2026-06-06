import type { WorkflowStepModel } from '@/lib/types';
import WorkflowStep from './WorkflowStep';

interface WorkflowSectionProps {
  /** Ordered workflow steps (1..N). Empty/missing -> unavailable message (Req 8.7). */
  steps: WorkflowStepModel[];
}

/**
 * Workflow_Section — Section C of the Campaign Manager Dashboard.
 *
 * Renders the "Workflow Campaign" title (Req 8.1) and arranges the steps in a
 * single horizontal row ordered 1→N (Req 8.2, 8.3) inside an `overflow-x-auto`
 * track so the row scrolls horizontally when it exceeds the available width
 * without truncating step names (Req 8.6). Each step after the first renders an
 * inbound directional connector, yielding exactly `N - 1` connectors (Req 8.4).
 *
 * When the step set is empty, an "unavailable" message is shown instead of an
 * empty or partial row (Req 8.7). Presentational only; no client state.
 */
export default function WorkflowSection({ steps }: WorkflowSectionProps) {
  const safeSteps = steps ?? [];
  const isEmpty = safeSteps.length === 0;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-slate-800">Workflow Campaign</h2>

      {isEmpty ? (
        <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
          Workflow steps are unavailable.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <div className="flex w-max items-center gap-3 pb-2">
            {safeSteps.map((step, index) => (
              <WorkflowStep
                key={step.order ?? index}
                step={step}
                showConnector={index > 0}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
