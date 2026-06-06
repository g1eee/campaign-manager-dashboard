'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';

const tabs = [
  'Tab Promo',
  'Banner',
  'Toko',
  'IG Story',
  'Host Live',
  'Ads CPAS',
  'Timeline',
];

const tabColumns: Record<string, string[]> = {
  'Tab Promo': [
    'ID Produk',
    'Nama Produk',
    'Kategori',
    'HPP',
    'Harga Jual',
    'Admin Fee',
    'Shipping Fee',
    'Promo Xtra',
    'Fee/Pesanan',
    'Campaign Fee',
    'Promosi Fee',
    'Marketing Fee',
    'Ads Spending',
    'Affiliate Commis',
    'Operating Cost',
    'Margin',
    'NPM',
    'Approve',
  ],
  Banner: ['Jenis', 'Format'],
  Toko: ['Kategori', 'Chat Broadcast'],
  'IG Story': ['File Flyer IGS', 'Link Produk', 'Jadwal Post'],
  'Host Live': ['File Banner', 'Etalase', 'Promo'],
  'Ads CPAS': ['File Flyer CPAS'],
  Timeline: ['Tanggal', 'Nama Promosi'],
};

interface TableRow {
  id: string;
  cells: string[];
}

let rowIdCounter = 0;
function generateRowId(): string {
  rowIdCounter += 1;
  return `row-${rowIdCounter}-${Date.now()}`;
}

function createEmptyRows(tab: string, count: number): TableRow[] {
  const colCount = tabColumns[tab].length;
  return Array.from({ length: count }, () => ({
    id: generateRowId(),
    cells: Array(colCount).fill(''),
  }));
}

function initTableData(): Record<string, TableRow[]> {
  const data: Record<string, TableRow[]> = {};
  for (const tab of tabs) {
    data[tab] = createEmptyRows(tab, 3);
  }
  return data;
}

const months = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

const years = ['2024', '2025', '2026'];

export default function PromoDashboardPage() {
  const [activeTab, setActiveTab] = useState<string>('Tab Promo');
  const [tableData, setTableData] = useState<Record<string, TableRow[]>>(initTableData);
  const [brand, setBrand] = useState<string>('KALOVA');
  const [month, setMonth] = useState<string>('Januari');
  const [year, setYear] = useState<string>('2024');

  const handleCellChange = useCallback((rowId: string, colIdx: number, value: string) => {
    setTableData((prev) => {
      const newData = { ...prev };
      newData[activeTab] = newData[activeTab].map((row) =>
        row.id === rowId ? { ...row, cells: row.cells.map((c, i) => (i === colIdx ? value : c)) } : row
      );
      return newData;
    });
  }, [activeTab]);

  const handleAddRow = () => {
    setTableData((prev) => {
      const newData = { ...prev };
      const colCount = tabColumns[activeTab].length;
      newData[activeTab] = [
        ...newData[activeTab],
        { id: generateRowId(), cells: Array(colCount).fill('') },
      ];
      return newData;
    });
  };

  const columns = tabColumns[activeTab];
  const rows = tableData[activeTab];

  return (
    <div className="flex flex-col h-full bg-[#0f0f23]">
      {/* HEADER */}
      <header className="flex items-center justify-between px-6 bg-[#0d1b2a]" style={{ height: '60px' }}>
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-gray-400 hover:text-white text-sm transition-colors"
            title="Back to Dashboard"
          >
            &larr; Dashboard
          </Link>
          <span className="text-white text-xl font-bold tracking-wide">KALOVA</span>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="bg-[#1e293b] border border-gray-600 text-white rounded px-3 py-1.5 text-sm outline-none"
          >
            <option>KALOVA</option>
          </select>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="bg-[#1e293b] border border-gray-600 text-white rounded px-3 py-1.5 text-sm outline-none"
          >
            {months.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="bg-[#1e293b] border border-gray-600 text-white rounded px-3 py-1.5 text-sm outline-none"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* BODY: SIDEBAR + MAIN */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT SIDEBAR */}
        <aside className="w-56 bg-[#16213e] flex flex-col py-4">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`mx-2 px-4 py-3 text-left cursor-pointer transition-colors ${
                activeTab === tab
                  ? 'bg-[#7c3aed] text-white font-semibold rounded-lg'
                  : 'text-gray-300 hover:bg-[#7c3aed]/20 rounded-lg'
              }`}
            >
              {tab}
            </button>
          ))}
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-6 overflow-auto">
          <h1 className="text-xl font-bold text-white mb-4">{activeTab}</h1>

          {/* TABLE */}
          <div className="overflow-x-auto rounded-lg border border-gray-700">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#1e293b]">
                  {columns.map((col) => (
                    <th
                      key={col}
                      className="px-3 py-3 text-left text-gray-300 text-xs uppercase tracking-wider font-medium border-b border-gray-700 whitespace-nowrap min-w-[120px]"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIdx) => (
                  <tr
                    key={row.id}
                    className={rowIdx % 2 === 0 ? 'bg-[#0f172a]' : 'bg-[#1e293b]/50'}
                  >
                    {row.cells.map((cell, colIdx) => (
                      <td key={colIdx} className="px-3 py-2 border-b border-gray-700/50 min-w-[120px]">
                        <input
                          type="text"
                          className="w-full bg-transparent text-white text-sm outline-none placeholder:text-gray-600"
                          placeholder="..."
                          value={cell}
                          onChange={(e) => handleCellChange(row.id, colIdx, e.target.value)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ADD ROW BUTTON */}
          <button
            onClick={handleAddRow}
            className="mt-4 px-4 py-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium rounded-lg transition-colors"
          >
            + Tambah Baris
          </button>
        </main>
      </div>
    </div>
  );
}
