'use client';

import { useState, useEffect } from 'react';
import { useRole } from '@/components/RoleContext';
import CreatableSelect from '@/components/CreatableSelect';

interface CampaignOption {
  value: string;
  label: string;
}

interface OptionsData {
  campaign: CampaignOption[];
  skemaPromo: string[];
  jenisPromo: string[];
  klasifikasi: string[];
}

export default function FormInputPage() {
  const { role } = useRole();
  const [options, setOptions] = useState<OptionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  const [campaign, setCampaign] = useState('');
  const [idProduk, setIdProduk] = useState('');
  const [namaProduk, setNamaProduk] = useState('');
  const [skemaPromo, setSkemaPromo] = useState('');
  const [jenisPromo, setJenisPromo] = useState('');
  const [klasifikasi, setKlasifikasi] = useState('');

  useEffect(() => {
    fetch('/api/options')
      .then((res) => res.json())
      .then((data) => {
        setOptions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleAddOption = async (category: string, value: string) => {
    await fetch('/api/options', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, value }),
    });
    const res = await fetch('/api/options');
    const data = await res.json();
    setOptions(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (role !== 'SPV') return;

    setSubmitting(true);
    const campaignLabel =
      options?.campaign.find((c) => c.value === campaign)?.label || campaign;

    await fetch('/api/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        campaign,
        campaignLabel,
        bulan: 'JUNI',
        idProduk,
        namaProduk,
        skemaPromo,
        promo: jenisPromo,
        klasifikasi,
      }),
    });

    setSuccess('Produk berhasil ditambahkan!');
    setCampaign('');
    setIdProduk('');
    setNamaProduk('');
    setSkemaPromo('');
    setJenisPromo('');
    setKlasifikasi('');
    setSubmitting(false);

    setTimeout(() => setSuccess(''), 3000);
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">Memuat...</div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Form Input Produk Campaign
      </h1>

      {role !== 'SPV' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6 text-yellow-800">
          Hanya SPV yang dapat menambah produk.
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6 text-green-800">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-2">
        <CreatableSelect
          label="Campaign"
          options={options?.campaign || []}
          value={campaign}
          onChange={setCampaign}
          onAddNew={(val) =>
            handleAddOption('campaign', val)
          }
        />

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ID Produk
          </label>
          <input
            type="text"
            value={idProduk}
            onChange={(e) => setIdProduk(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Masukkan ID Produk"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nama Produk
          </label>
          <input
            type="text"
            value={namaProduk}
            onChange={(e) => setNamaProduk(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Masukkan Nama Produk"
          />
        </div>

        <CreatableSelect
          label="Skema Promo"
          options={options?.skemaPromo || []}
          value={skemaPromo}
          onChange={setSkemaPromo}
          onAddNew={(val) => handleAddOption('skemaPromo', val)}
        />

        <CreatableSelect
          label="Jenis Promo"
          options={options?.jenisPromo || []}
          value={jenisPromo}
          onChange={setJenisPromo}
          onAddNew={(val) => handleAddOption('jenisPromo', val)}
        />

        <CreatableSelect
          label="Klasifikasi Produk"
          options={options?.klasifikasi || []}
          value={klasifikasi}
          onChange={setKlasifikasi}
          onAddNew={(val) => handleAddOption('klasifikasi', val)}
        />

        <button
          type="submit"
          disabled={role !== 'SPV' || submitting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? 'Menyimpan...' : 'Simpan Produk'}
        </button>
      </form>
    </div>
  );
}
