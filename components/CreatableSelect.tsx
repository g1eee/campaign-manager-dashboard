'use client';

import React, { useState } from 'react';

interface Option {
  value: string;
  label: string;
}

interface CreatableSelectProps {
  label: string;
  options: string[] | Option[];
  value: string;
  onChange: (value: string) => void;
  onAddNew: (newValue: string) => void;
}

export default function CreatableSelect({
  label,
  options,
  value,
  onChange,
  onAddNew,
}: CreatableSelectProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newValue, setNewValue] = useState('');

  const normalizedOptions: Option[] = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    if (selected === '__add_new__') {
      setIsAdding(true);
    } else {
      onChange(selected);
    }
  };

  const handleConfirmAdd = () => {
    const trimmed = newValue.trim();
    if (trimmed) {
      onAddNew(trimmed);
      onChange(trimmed);
    }
    setNewValue('');
    setIsAdding(false);
  };

  const handleCancelAdd = () => {
    setNewValue('');
    setIsAdding(false);
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {!isAdding ? (
        <select
          value={value}
          onChange={handleSelectChange}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">-- Pilih --</option>
          {normalizedOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
          <option value="__add_new__">+ Tambah Baru</option>
        </select>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder="Ketik nilai baru..."
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            autoFocus
          />
          <button
            type="button"
            onClick={handleConfirmAdd}
            className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
          >
            OK
          </button>
          <button
            type="button"
            onClick={handleCancelAdd}
            className="px-3 py-2 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400"
          >
            Batal
          </button>
        </div>
      )}
    </div>
  );
}
