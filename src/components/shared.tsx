import React from 'react';
import { Bell } from 'lucide-react';
import { useUserStore } from '../store/useUserStore';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// --- Header Bileşeni ---
export function Header({ title, subtitle, showProfileOnMobile = false }: { title: string, subtitle: string, showProfileOnMobile?: boolean }) {
  const { user, logout } = useUserStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8 py-4 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/50">
      <div>
        <p className="text-zinc-500 text-sm mb-0.5">{subtitle}</p>
        <h1 className="text-xl font-semibold tracking-tight lg:text-2xl text-zinc-100 uppercase">{title}</h1>
      </div>

      <div className="flex items-center gap-3">

        {showProfileOnMobile && (
          <div className="w-9 h-9 rounded-full bg-zinc-800 overflow-hidden lg:hidden"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}

          >
            <img
              src={user?.profilePhoto || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100"}
              alt="Profile"
              className="w-full h-full object-cover"
            />
            {isDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-zinc-800 rounded-lg shadow-lg py-2">
                <button
                  onClick={() => handleLogout()

                  }
                  className="block w-full text-left px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-700"
                >
                  Çıkış Yap
                </button>
              </div>
            )}
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
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', maxWidth: '100%', overflow: 'hidden' }}>
      <span style={{ width: '80px', flexShrink: 0, fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} className="text-zinc-500">{label}</span>
      <div style={{ flex: 1, minWidth: 0, height: '8px', borderRadius: '9999px', overflow: 'hidden' }} className="bg-zinc-800">
        <div className={`h-full ${colorClass} rounded-full transition-all`} style={{ width: `${Math.min(percentage, 100)}%` }} />
      </div>
      <span style={{ width: '55px', flexShrink: 0, fontSize: '12px', textAlign: 'right', whiteSpace: 'nowrap' }} className="tabular-nums text-zinc-400">
        {current}<span className="text-zinc-600">/{total}g</span>
      </span>
    </div>
  )
}

// --- İstatistik Kartı ---
export function StatCard({ icon, label, value, subtitle, colorClass }: { icon: React.ReactNode; label: string; value: string; subtitle: string; colorClass: string }) {
  return (
    <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-xl p-3 lg:p-4 hover:bg-zinc-900 transition-colors">
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