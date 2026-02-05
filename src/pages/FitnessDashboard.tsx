import { useNavigate, useLocation, Outlet } from "react-router-dom"

import {
  Home,
  Activity,
  Utensils,
  Dumbbell,
  Settings,
  Camera,
  Trophy
} from "lucide-react"
import { useUserStore } from "../store/useUserStore";

export default function FitnessDashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useUserStore();

  // Determine active tab based on path
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/' || path === '/home') return "home";
    if (path.includes('/workout')) return "workout";
    if (path.includes('/nutrition')) return "nutrition";
    if (path.includes('/goals')) return "goals";
    if (path.includes('/settings')) return "settings";
    return "";
  }

  const activeTab = getActiveTab();

  const handleNavigation = (path: string) => {
    navigate(path);
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      <div className="flex min-h-screen relative">

        {/* --- MASAÜSTÜ YAN MENÜ --- */}
        <aside className="hidden lg:flex w-20 flex-col items-center py-8 border-r border-zinc-800/50 bg-zinc-900/50 fixed left-0 top-0 bottom-0 z-40">
          <div className="w-11 h-11 bg-emerald-500 rounded-xl flex items-center justify-center mb-12">
            <Activity className="text-zinc-950" size={22} />
          </div>

          <nav className="flex-1 flex flex-col gap-2 w-full px-3">
            <NavIcon icon={<Home size={22} />} active={activeTab === "home"} onClick={() => handleNavigation("/home")} />
            <NavIcon icon={<Dumbbell size={22} />} active={activeTab === "workout"} onClick={() => handleNavigation("/workout")} />
            <NavIcon icon={<Utensils size={22} />} active={activeTab === "nutrition"} onClick={() => handleNavigation("/nutrition")} />
            <NavIcon icon={<Trophy size={22} />} active={activeTab === "goals"} onClick={() => handleNavigation("/goals")} />
            <NavIcon icon={<Settings size={22} />} active={activeTab === "settings"} onClick={() => handleNavigation("/settings")} />
          </nav>

          <div className="mt-auto">
            <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden ring-2 ring-zinc-700 hover:ring-emerald-500 transition-all cursor-pointer">
              <img
                src={user?.profilePhoto || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100"}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </aside>

        {/* --- ANA İÇERİK ALANI --- */}
        <main className="flex-1 lg:ml-20 pb-24 lg:pb-8">
          <Outlet />
        </main>
      </div>

      {/* --- MOBİL ALT MENÜ --- */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-zinc-900/95 backdrop-blur-md border-t border-zinc-800/50 px-6 py-3 z-50">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <MobileNavItem icon={<Home size={22} />} label="Ana Sayfa" active={activeTab === "home"} onClick={() => handleNavigation("/home")} />
          <MobileNavItem icon={<Dumbbell size={22} />} label="Antrenman" active={activeTab === "workout"} onClick={() => handleNavigation("/workout")} />

          <button className="relative -top-4 w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center text-zinc-950 shadow-lg shadow-emerald-500/25">
            <Camera size={24} />
          </button>

          <MobileNavItem icon={<Utensils size={22} />} label="Beslenme" active={activeTab === "nutrition"} onClick={() => handleNavigation("/nutrition")} />
          <MobileNavItem icon={<Settings size={22} />} label="Ayarlar" active={activeTab === "settings"} onClick={() => handleNavigation("/settings")} />
        </div>
      </nav>
    </div>
  )
}

// --- YARDIMCI BUTON BİLEŞENLERİ ---

function NavIcon({ icon, active, onClick }: { icon: React.ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-3 rounded-xl transition-all flex items-center justify-center ${active ? "bg-emerald-500 text-zinc-950" : "text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800"
        }`}
    >
      {icon}
    </button>
  )
}

function MobileNavItem({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1">
      <span className={active ? "text-emerald-400" : "text-zinc-500"}>{icon}</span>
      <span className={`text-[10px] ${active ? "text-emerald-400 font-medium" : "text-zinc-500"}`}>{label}</span>
    </button>
  )
}