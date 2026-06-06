export default function PromoDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-[#0f0f23]">
      {children}
    </div>
  );
}
