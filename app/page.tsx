export default function DashboardPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-4">
        Selamat Datang di KALOVA Dashboard
      </h1>
      <p className="text-slate-600 mb-6">
        Kelola workflow strategi promosi campaign Anda dari sini.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500">Total Produk</h3>
          <p className="text-2xl font-bold text-indigo-700 mt-1">-</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500">Campaign Aktif</h3>
          <p className="text-2xl font-bold text-indigo-700 mt-1">-</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500">Tugas Pending</h3>
          <p className="text-2xl font-bold text-indigo-700 mt-1">-</p>
        </div>
      </div>
    </div>
  );
}
