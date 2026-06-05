'use client';

import { useState, useEffect } from 'react';

interface Entry {
  id: string;
  campaign: string;
  campaignLabel: string | number;
  bulan: string;
  idProduk: string;
  namaProduk: string;
  skemaPromo: string;
  promo: string;
  klasifikasi: string;
  checklist: Record<string, boolean>;
}

interface ChecklistData {
  [campaignId: string]: { [stepIndex: string]: boolean };
}

const CAMPAIGN_TABS = [
  { value: 'all', label: 'SEMUA' },
  { value: 'twindate', label: 'TWINDATE' },
  { value: 'rabu-xtra', label: 'RABU XTRA' },
  { value: 'payday', label: 'PAY DAY' },
  { value: 'sfd', label: 'SFD' },
];

export default function CampaignBoardPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [checklists, setChecklists] = useState<ChecklistData>({});
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/entries').then((r) => r.json()),
      fetch('/api/checklists').then((r) => r.json()),
    ])
      .then(([entriesData, checklistsData]) => {
        setEntries(entriesData);
        setChecklists(checklistsData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered =
    filter === 'all'
      ? entries
      : entries.filter((e) => e.campaign === filter);

  const getProgress = (campaignId: string): string => {
    const cl = checklists[campaignId];
    if (!cl) return '0%';
    const total = 15;
    const done = Object.values(cl).filter(Boolean).length;
    return `${Math.round((done / total) * 100)}%`;
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">Memuat...</div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Papan Campaign</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        {CAMPAIGN_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === tab.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="px-4 py-3 text-left">Bulan</th>
              <th className="px-4 py-3 text-left">Campaign</th>
              <th className="px-4 py-3 text-left">ID Produk</th>
              <th className="px-4 py-3 text-left">Nama Produk</th>
              <th className="px-4 py-3 text-left">Skema Promo</th>
              <th className="px-4 py-3 text-left">Jenis Promo</th>
              <th className="px-4 py-3 text-left">Klasifikasi</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((entry, idx) => (
              <tr
                key={entry.id}
                className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
              >
                <td className="px-4 py-2">{entry.bulan}</td>
                <td className="px-4 py-2 font-medium">
                  {String(entry.campaignLabel)}
                </td>
                <td className="px-4 py-2">{entry.idProduk}</td>
                <td className="px-4 py-2">{entry.namaProduk}</td>
                <td className="px-4 py-2 whitespace-pre-line">
                  {entry.skemaPromo}
                </td>
                <td className="px-4 py-2">{entry.promo}</td>
                <td className="px-4 py-2">{entry.klasifikasi}</td>
                <td className="px-4 py-2">
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {getProgress(entry.campaign)}
                  </span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                  Tidak ada data.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-sm text-gray-500">
        Menampilkan {filtered.length} produk
      </p>
    </div>
  );
}
