import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Bell, Smartphone, Shield, LogOut, ChevronRight, Camera, Save, X } from 'lucide-react';
import { Header } from '../components/shared';
import { useUserStore } from '../store/useUserStore';
import { useNavigate } from 'react-router-dom';

export default function SettingsView() {
  const { user, logout, updateProfile } = useUserStore();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhoto, setEditPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const startEditing = () => {
    setEditName(user?.fullName || "");
    setPreviewUrl(user?.profilePhoto || null);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditName("");
    setEditPhoto(null);
    setPreviewUrl(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditPhoto(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSave = async () => {
    if (!user?.email) return;

    setIsSaving(true);
    const formData = new FormData();
    formData.append('email', user.email);
    formData.append('fullName', editName);
    if (editPhoto) {
      formData.append('profilePhoto', editPhoto);
    }

    const success = await updateProfile(formData);
    if (success) {
      setIsEditing(false);
      toast.success("Profil başarıyla güncellendi.");
    } else {
      toast.error("Profil güncellenemedi.");
    }
    setIsSaving(false);
  };

  return (
    <>
      <Header title="Ayarlar" subtitle="Hesap" />
      <div className="px-4 lg:px-8 py-4 lg:py-6 space-y-4 lg:space-y-6 max-w-2xl mx-auto lg:mx-0">

        {/* Profile Section */}
        <section className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-6 flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-zinc-800 overflow-hidden ring-2 ring-zinc-700/50">
              <img
                src={previewUrl || user?.profilePhoto || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100"}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            {isEditing && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 p-1.5 bg-emerald-500 rounded-full text-zinc-900 shadow-lg hover:scale-105 transition-transform"
              >
                <Camera size={14} />
              </button>
            )}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="bg-zinc-800 text-zinc-100 px-3 py-1.5 rounded-lg border border-zinc-700 outline-none focus:border-emerald-500/50 w-full max-w-[200px]"
                placeholder="İsim Soyisim"
              />
            ) : (
              <h3 className="text-lg font-medium text-zinc-100">{user?.fullName || "Kullanıcı"}</h3>
            )}
            <p className="text-sm text-zinc-500">{user?.email || "Email yok"}</p>
          </div>

          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={cancelEditing}
                  disabled={isSaving}
                  className="p-2 text-zinc-400 hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                >
                  {isSaving ? <span className="animate-spin">⌛</span> : <Save size={20} />}
                </button>
              </>
            ) : (
              <button
                onClick={startEditing}
                className="text-sm text-emerald-400 font-medium px-3 py-1.5 hover:bg-emerald-500/10 rounded-lg transition-colors"
              >
                Düzenle
              </button>
            )}
          </div>
        </section>

        {/* Settings List */}
        <section className="space-y-3">
          <h3 className="text-sm font-medium text-zinc-500 mb-2">Genel</h3>


          <h3 className="text-sm font-medium text-zinc-500 mt-6 mb-2">Gizlilik & Güvenlik</h3>
          <SettingsItem icon={<Shield size={18} />} title="Gizlilik Ayarları" />
          <SettingsItem icon={<LogOut size={18} />} title="Çıkış Yap" color="text-rose-500" onClick={handleLogout} />
        </section>

      </div>
    </>
  )
}

function SettingsItem({ icon, title, sub, color, onClick }: any) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 p-3 bg-zinc-900/30 rounded-xl hover:bg-zinc-800 transition-colors text-left">
      <div className={`text-zinc-400 ${color}`}>{icon}</div>
      <div className="flex-1">
        <p className={`text-sm font-medium ${color ? color : 'text-zinc-200'}`}>{title}</p>
      </div>
      {sub && <span className="text-xs text-zinc-500">{sub}</span>}
      <ChevronRight size={16} className="text-zinc-600" />
    </button>
  )
}