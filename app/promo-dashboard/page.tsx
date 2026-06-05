'use client';

import { useState } from 'react';

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

function createEmptyRows(tab: string, count: number): string[][] {
  const colCount = tabColumns[tab].length;
  return Array.from({ length: count }, () => Array(colCount).fill(''));
}

function initTableData(): Record<string, string[][]> {
  const data: Record<string, string[][]> = {};
  for (const tab of tabs) {
    data[tab] = createEmptyRows(tab, 3);
  }
  return data;
}

export default function PromoDashboardPage() {
  const [activeTab, setActiveTab] = useState<string>('Tab Promo');
  const [tableData, setTableData] = useState<Record<string, string[][]>>(initTableData);

  const handleCellChange = (rowIdx: number, colIdx: number, value: string) => {
    setTableData((prev) => {
      const newData = { ...prev };
      const rows = newData[activeTab].map((row) => [...row]);
      rows[rowIdx][colIdx] = value;
      newData[activeTab] = rows;
      return newData;
    });
  };

  const handleAddRow = () => {
    setTableData((prev) => {
      const newData = { ...prev };
      const colCount = tabColumns[activeTab].length;
      newData[activeTab] = [...newData[activeTab], Array(colCount).fill('')];
      return newData;
    });
  };

  const columns = tabColumns[activeTab];
  const rows = tableData[activeTab];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0f0f23]">
      {/* HEADER */}
      <header className="flex items-center justify-between px-6 bg-[#0d1b2a]" style={{ height: '60px' }}>
        <span className="text-white text-xl font-bold tracking-wide">KALOVA</span>
        <div className="flex items-center gap-3">
          <select className="bg-[#1e293b] border border-gray-600 text-white rounded px-3 py-1.5 text-sm outline-none">
            <option>KALOVA</option>
          </select>
          <select className="bg-[#1e293b] border border-gray-600 text-white rounded px-3 py-1.5 text-sm outline-none">
            <option>Januari</option>
            <option>Februari</option>
            <option>Maret</option>
            <option>April</option>
            <option>Mei</option>
            <option>Juni</option>
            <option>Juli</option>
            <option>Agustus</option>
            <option>September</option>
            <option>Oktober</option>
            <option>November</option>
            <option>Desember</option>
          </select>
          <select className="bg-[#1e293b] border border-gray-600 text-white rounded px-3 py-1.5 text-sm outline-none">
            <option>2024</option>
            <option>2025</option>
            <option>2026</option>
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
                      className="px-3 py-3 text-left text-gray-300 text-xs uppercase tracking-wider font-medium border-b border-gray-700 whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIdx) => (
                  <tr
                    key={rowIdx}
                    className={rowIdx % 2 === 0 ? 'bg-[#0f172a]' : 'bg-[#1e293b]/50'}
                  >
                    {row.map((cell, colIdx) => (
                      <td key={colIdx} className="px-3 py-2 border-b border-gray-700/50">
                        <input
                          type="text"
                          className="w-full bg-transparent text-white text-sm outline-none placeholder:text-gray-600"
                          placeholder="..."
                          value={cell}
                          onChange={(e) => handleCellChange(rowIdx, colIdx, e.target.value)}
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
