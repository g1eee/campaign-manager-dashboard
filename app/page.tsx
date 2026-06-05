'use client';

import { useState, useEffect } from 'react';

interface Entry {
  id: string;
  campaign: string;
}

interface ChecklistData {
  [campaignId: string]: { [stepIndex: string]: boolean };
}

interface TimelineEntry {
  periode: string;
  campaign: string;
}

export default function DashboardPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [checklists, setChecklists] = useState<ChecklistData>({});
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/entries').then((r) => r.json()),
      fetch('/api/checklists').then((r) => r.json()),
      fetch('/api/timeline').then((r) => r.json()),
    ])
      .then(([entriesData, checklistsData, timelineData]) => {
        setEntries(entriesData);
        setChecklists(checklistsData);
        setTimeline(timelineData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const totalProduk = entries.length;
  const totalCampaign = 4;

  const getChecklistProgress = (): number => {
    const campaigns = Object.keys(checklists);
    if (campaigns.length === 0) return 0;
    let totalChecked = 0;
    let totalPossible = 0;
    campaigns.forEach((c) => {
      const steps = checklists[c];
      totalChecked += Object.values(steps).filter(Boolean).length;
      totalPossible += 15;
    });
    if (totalPossible === 0) return 0;
    return Math.round((totalChecked / totalPossible) * 100);
  };

  const getNextCampaign = (): string => {
    if (timeline.length === 0) return '-';
    const nonDaily = timeline.find(
      (t) => !t.campaign.toUpperCase().includes('DAILY')
    );
    return nonDaily ? nonDaily.campaign : timeline[0].campaign;
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">Memuat...</div>
    );
  }

  const cards = [
    {
      title: 'Total Produk',
      value: totalProduk,
      color: 'border-blue-500 bg-blue-50',
      textColor: 'text-blue-700',
    },
    {
      title: 'Total Campaign',
      value: totalCampaign,
      color: 'border-green-500 bg-green-50',
      textColor: 'text-green-700',
    },
    {
      title: 'Progress Checklist',
      value: `${getChecklistProgress()}%`,
      color: 'border-orange-500 bg-orange-50',
      textColor: 'text-orange-700',
    },
    {
      title: 'Campaign Berikutnya',
      value: getNextCampaign(),
      color: 'border-purple-500 bg-purple-50',
      textColor: 'text-purple-700',
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Dashboard KALOVA
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className={`rounded-lg border-l-4 p-5 ${card.color}`}
          >
            <p className="text-sm text-gray-600 mb-1">{card.title}</p>
            <p className={`text-2xl font-bold ${card.textColor}`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
