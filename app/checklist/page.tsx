'use client';

import { useState, useEffect } from 'react';
import { useRole } from '@/components/RoleContext';

interface WorkflowStep {
  step: number;
  role: string;
  inputType: string;
  text: string;
}

interface ChecklistData {
  [campaignId: string]: { [stepIndex: string]: boolean };
}

const CAMPAIGNS = [
  { value: 'twindate', label: 'TWINDATE' },
  { value: 'rabu-xtra', label: 'RABU XTRA' },
  { value: 'payday', label: 'PAY DAY' },
  { value: 'sfd', label: 'SFD' },
];

export default function ChecklistPage() {
  const { role } = useRole();
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [checklists, setChecklists] = useState<ChecklistData>({});
  const [selectedCampaign, setSelectedCampaign] = useState('twindate');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/workflow-steps').then((r) => r.json()),
      fetch('/api/checklists').then((r) => r.json()),
    ])
      .then(([stepsData, checklistsData]) => {
        setSteps(stepsData);
        setChecklists(checklistsData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const campaignChecklist = checklists[selectedCampaign] || {};
  const completedCount = Object.values(campaignChecklist).filter(Boolean).length;
  const totalSteps = steps.length || 15;
  const progressPercent = Math.round((completedCount / totalSteps) * 100);

  const handleToggle = async (stepIndex: number, checked: boolean) => {
    const updated = {
      ...checklists,
      [selectedCampaign]: {
        ...campaignChecklist,
        [stepIndex]: checked,
      },
    };
    setChecklists(updated);

    await fetch('/api/checklists', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        campaign: selectedCampaign,
        stepIndex,
        checked,
      }),
    });
  };

  const roleMatch = (stepRole: string) => {
    return stepRole.toLowerCase() === role.toLowerCase();
  };

  const groupedSteps = steps.reduce<Record<string, { step: WorkflowStep; index: number }[]>>(
    (acc, step, index) => {
      const r = step.role.toUpperCase();
      if (!acc[r]) acc[r] = [];
      acc[r].push({ step, index });
      return acc;
    },
    {}
  );

  const roleOrder = ['SPV', 'ADMIN', 'DESAINER'];

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">Memuat...</div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Checklist Workflow
      </h1>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Pilih Campaign
        </label>
        <select
          value={selectedCampaign}
          onChange={(e) => setSelectedCampaign(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {CAMPAIGNS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Progress</span>
          <span>
            {completedCount}/{totalSteps} ({progressPercent}%)
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {roleOrder.map((groupRole) => {
        const items = groupedSteps[groupRole];
        if (!items) return null;
        return (
          <div key={groupRole} className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-1">
              {groupRole}
            </h2>
            <div className="space-y-2">
              {items.map(({ step, index }) => {
                const isChecked = !!campaignChecklist[index];
                const canEdit = roleMatch(step.role);
                return (
                  <label
                    key={index}
                    className={`flex items-start gap-3 p-3 rounded-md border ${
                      canEdit
                        ? 'border-gray-200 hover:bg-gray-50 cursor-pointer'
                        : 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      disabled={!canEdit}
                      onChange={(e) => handleToggle(index, e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <span className="text-xs text-gray-400 mr-2">
                        #{step.step}
                      </span>
                      <span className={`text-sm ${isChecked ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                        {step.text}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
