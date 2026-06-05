'use client';

import Link from 'next/link';
import { useRole } from '@/components/RoleContext';

const navLinks = [
  { href: '/', label: 'Dashboard' },
  { href: '/form-input', label: 'Form Input' },
  { href: '/campaign-board', label: 'Papan Campaign' },
  { href: '/checklist', label: 'Daftar Tugas' },
  { href: '/timeline', label: 'Lini Masa' },
];

export default function Navbar() {
  const { role, setRole, roles } = useRole();

  return (
    <nav className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-8">
        <div className="flex flex-col">
          <span className="text-xl font-bold text-indigo-700 tracking-wide">KALOVA</span>
          <span className="text-[10px] text-slate-500 -mt-1">Campaign Promo</span>
        </div>
        <div className="flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <label htmlFor="role-switcher" className="text-xs text-slate-500">
          Role:
        </label>
        <select
          id="role-switcher"
          value={role}
          onChange={(e) => setRole(e.target.value as typeof role)}
          className="border border-slate-300 rounded-md px-3 py-1.5 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {roles.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>
    </nav>
  );
}
