import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics — Scalify",
  description: "Internal analytics dashboard.",
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#fffaf5]">
      {/* Minimal internal header */}
      <header className="border-b border-[#e5e0da] bg-white px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#f05223] rounded flex items-center justify-center">
            <span className="text-white font-bold text-xs">S</span>
          </div>
          <span className="font-semibold text-sm text-[#0a0a0a]">Scalify</span>
          <span className="text-[#e5e0da] mx-1">/</span>
          <span className="text-sm text-[#6b7280]">Analytics</span>
        </div>
        <a
          href="/"
          className="text-xs text-[#6b7280] hover:text-[#0a0a0a] transition-colors"
        >
          ← Back to Deck
        </a>
      </header>
      {children}
    </div>
  );
}
