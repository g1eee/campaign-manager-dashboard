'use client';

import { useState, useEffect } from 'react';

interface TimelineEntry {
  periode: string;
  campaign: string;
}

function getCampaignColor(campaign: string): string {
  const upper = campaign.toUpperCase();
  if (upper.includes('TWINDATE')) return 'bg-blue-100 text-blue-800 border-blue-300';
  if (upper.includes('RABU XTRA')) return 'bg-green-100 text-green-800 border-green-300';
  if (upper.includes('PAYDAY') || upper.includes('PAY DAY')) return 'bg-orange-100 text-orange-800 border-orange-300';
  if (upper.includes('SFD') || upper.includes('FASHION')) return 'bg-purple-100 text-purple-800 border-purple-300';
  return 'bg-gray-100 text-gray-700 border-gray-300';
}

function getCampaignDot(campaign: string): string {
  const upper = campaign.toUpperCase();
  if (upper.includes('TWINDATE')) return 'bg-blue-500';
  if (upper.includes('RABU XTRA')) return 'bg-green-500';
  if (upper.includes('PAYDAY') || upper.includes('PAY DAY')) return 'bg-orange-500';
  if (upper.includes('SFD') || upper.includes('FASHION')) return 'bg-purple-500';
  return 'bg-gray-400';
}

export default function TimelinePage() {
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/timeline')
      .then((r) => r.json())
      .then((data) => {
        setTimeline(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">Memuat...</div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Timeline Promosi
      </h1>

      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

        <div className="space-y-4">
          {timeline.map((entry, idx) => (
            <div key={idx} className="relative pl-10">
              <div
                className={`absolute left-2.5 top-4 w-3 h-3 rounded-full ${getCampaignDot(entry.campaign)}`}
              />
              <div
                className={`p-4 rounded-lg border ${getCampaignColor(entry.campaign)}`}
              >
                <p className="font-semibold text-sm">{entry.campaign}</p>
                <p className="text-xs mt-1 opacity-80">{entry.periode}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
