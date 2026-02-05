import React, { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/UserContext'; // Kullanıcının emailini almak için
import { Ruler, Weight, Activity, Percent, Target, ArrowRight, Check } from 'lucide-react';

export default function UserInfoForm() {
    const { user, login } = useAuth(); // Context'ten user verisini alıyoruz
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);


    // Form State
    const [formData, setFormData] = useState({
        height: '',
        weight: '',
        bodyFat: '',
        activityLevel: 3, // Varsayılan orta seviye
        goals: [] as string[]
    });

    // Hedef Seçenekleri
    const goalOptions = [
        { id: 'muscle', label: 'Kas Yapmak', desc: 'Güç ve hacim kazanımı' },
        { id: 'fat_loss', label: 'Yağ Yakmak', desc: 'Daha fit bir görünüm' },
        { id: 'gain_weight', label: 'Kilo Almak', desc: 'Sağlıklı kilo artışı' },
        { id: 'health', label: 'Sağlıklı Yaşam', desc: 'Genel zindelik ve kondisyon' },
    ];

    // Hedef Seçme/Çıkarma Mantığı
    const toggleGoal = (id: string) => {
        setFormData(prev => {
            const exists = prev.goals.includes(id);
            return {
                ...prev,
                goals: exists
                    ? prev.goals.filter(g => g !== id) // Varsa çıkar
                    : [...prev.goals, id] // Yoksa ekle
            };
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Eğer kullanıcı bilgisi yoksa (login olmamışsa) hata ver
        if (!user?.email) {
            toast.error("Oturum bulunamadı. Lütfen tekrar giriş yapın.");
            navigate('/login');
            return;
        }

        try {
            // Backend'e verileri gönder
            const response = await fetch('http://localhost:5001/save-user-info', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: user.email, // Hangi kullanıcı olduğunu belirtmek için email şart
                    height: Number(formData.height),
                    weight: Number(formData.weight),
                    bodyFat: Number(formData.bodyFat),
                    activityLevel: Number(formData.activityLevel),
                    goals: formData.goals
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Context'teki kullanıcı bilgisini güncelle (yeni boy/kilo bilgileriyle)
                login(data.user);

                // İşlem tamam, Dashboard'a yönlendir
                navigate('/');
                toast.success("Bilgileriniz kaydedildi!");
            } else {
                toast.error("Hata: " + data.message);
            }

        } catch (error) {
            console.error(error);
            toast.error("Sunucuya bağlanılamadı.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 font-sans relative overflow-hidden">

            {/* Arka Plan Efekti */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-2xl bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/50 p-8 rounded-3xl shadow-2xl relative z-10 animate-in fade-in zoom-in duration-500">

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Profilini Tamamla</h1>
                    <p className="text-zinc-400">Sana özel program oluşturabilmemiz için vücut analizine ihtiyacımız var.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">

                    {/* 1. SATIR: BOY - KİLO - YAĞ */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Boy */}
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-zinc-400 ml-1">Boy (cm)</label>
                            <div className="relative group">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"><Ruler size={18} /></div>
                                <input
                                    name="height" type="number" placeholder="180" required
                                    value={formData.height} onChange={handleChange}
                                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl py-3 pl-10 text-zinc-100 focus:border-emerald-500/50 outline-none transition-all"
                                />
                            </div>
                        </div>
                        {/* Kilo */}
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-zinc-400 ml-1">Kilo (kg)</label>
                            <div className="relative group">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"><Weight size={18} /></div>
                                <input
                                    name="weight" type="number" placeholder="75" required
                                    value={formData.weight} onChange={handleChange}
                                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl py-3 pl-10 text-zinc-100 focus:border-emerald-500/50 outline-none transition-all"
                                />
                            </div>
                        </div>
                        {/* Yağ Oranı */}
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-zinc-400 ml-1">Yağ Oranı % (Opsiyonel)</label>
                            <div className="relative group">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"><Percent size={18} /></div>
                                <input
                                    name="bodyFat" type="number" placeholder="15"
                                    value={formData.bodyFat} onChange={handleChange}
                                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl py-3 pl-10 text-zinc-100 focus:border-emerald-500/50 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 2. SATIR: SPOR SIKLIĞI (SLIDER) */}
                    <div className="space-y-4 bg-zinc-950/30 p-4 rounded-2xl border border-zinc-800/50">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                                <Activity size={18} className="text-emerald-400" /> Haftalık Spor Sıklığı
                            </label>
                            <span className="text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-lg text-sm">
                                {formData.activityLevel} Gün
                            </span>
                        </div>
                        <input
                            type="range" min="0" max="7" step="1"
                            name="activityLevel"
                            value={formData.activityLevel}
                            onChange={(e) => setFormData({ ...formData, activityLevel: parseInt(e.target.value) })}
                            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                        <div className="flex justify-between text-xs text-zinc-500">
                            <span>Hiç Yok</span>
                            <span>Her Gün</span>
                        </div>
                    </div>

                    {/* 3. SATIR: HEDEFLER (KARTLAR) */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                            <Target size={18} className="text-emerald-400" /> Hedeflerin Neler?
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {goalOptions.map((goal) => {
                                const isSelected = formData.goals.includes(goal.id);
                                return (
                                    <button
                                        key={goal.id} type="button" onClick={() => toggleGoal(goal.id)}
                                        className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 relative
                       ${isSelected
                                                ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                                                : 'bg-zinc-950/30 border-zinc-800 hover:bg-zinc-900'
                                            }
                     `}
                                    >
                                        <div className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-600'}`}>
                                            {isSelected && <Check size={12} className="text-zinc-950 stroke-[3]" />}
                                        </div>
                                        <div>
                                            <span className={`block font-medium ${isSelected ? 'text-emerald-400' : 'text-zinc-300'}`}>{goal.label}</span>
                                            <span className="text-xs text-zinc-500">{goal.desc}</span>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* KAYDET BUTONU */}
                    <button
                        type="submit" disabled={loading}
                        className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 mt-4 shadow-lg shadow-emerald-500/20"
                    >
                        {loading ? 'Kaydediliyor...' : <>Kaydet ve Başla <ArrowRight size={20} /></>}
                    </button>

                </form>
            </div>
        </div>
    );
}