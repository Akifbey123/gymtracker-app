import React from 'react';
import { Bell } from 'lucide-react';
import { useUserStore } from '../store/useUserStore';

// --- Header Bileşeni ---
export function Header({ title, subtitle, showProfileOnMobile = false }: { title: string, subtitle: string, showProfileOnMobile?: boolean }) {
  const { user } = useUserStore();
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-5 py-4 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/50 lg:px-8 lg:py-5">
      <div>
        <p className="text-zinc-500 text-sm mb-0.5">{subtitle}</p>
        <h1 className="text-xl font-semibold tracking-tight lg:text-2xl text-zinc-100">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <button className="p-2.5 bg-zinc-800/80 rounded-full hover:bg-zinc-700 transition-colors relative">
          <Bell size={18} className="text-zinc-400" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full" />
        </button>
        {showProfileOnMobile && (
          <div className="w-9 h-9 rounded-full bg-zinc-800 overflow-hidden lg:hidden">
            <img
              src={user?.profilePhoto || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100"}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
    </header>
  )
}

// --- Makro Barı ---
export function MacroBar({ label, current, total, colorClass }: { label: string; current: number; total: number; colorClass: string }) {
  const percentage = (current / total) * 100
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 text-sm text-zinc-500">{label}</span>
      <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div className={`h-full ${colorClass} rounded-full transition-all`} style={{ width: `${percentage}%` }} />
      </div>
      <span className="w-16 text-sm text-right tabular-nums text-zinc-400">
        {current}<span className="text-zinc-600">/{total}g</span>
      </span>
    </div>
  )
}

// --- İstatistik Kartı ---
export function StatCard({ icon, label, value, subtitle, colorClass }: { icon: React.ReactNode; label: string; value: string; subtitle: string; colorClass: string }) {
  return (
    <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-xl p-4 hover:bg-zinc-900 transition-colors">
      <div className={`w-9 h-9 ${colorClass} rounded-lg flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-xs text-zinc-500 mb-0.5">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-semibold text-zinc-100">{value}</span>
        <span className="text-xs text-zinc-500">{subtitle}</span>
      </div>
    </div>
  )
}