import React, { useState } from 'react';
import { toast } from 'sonner';
import { Activity, Mail, Lock, Eye, EyeOff, ArrowRight, User, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiClient } from '../services/apiClient';

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Şifre kontrolü
    if (formData.password !== formData.confirmPassword) {
      toast.error('Şifreler aynı değil');
      return;
    }

    try {
      // Backend'e istek atıyoruz (Port 5000)
      const data = await apiClient.post<{ message: string, user: any }>('/register', {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password
      });

      toast.success("Kayıt Başarılı! Giriş sayfasına yönlendiriliyorsunuz...");
      console.log(data);
      // Burada yönlendirme yapabilirsin: navigate('/login')

    } catch (error: any) {
      console.error("Bağlantı hatası:", error);
      toast.error("Hata: " + (error.message || "Sunucuya bağlanılamadı."));
    }
  }


  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center relative overflow-hidden font-sans selection:bg-emerald-500/30 selection:text-emerald-400 py-10">

      {/* --- ARKA PLAN EFEKTLERİ --- */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* --- REGISTER KARTI --- */}
      <div className="w-full max-w-md bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/50 p-8 rounded-3xl shadow-2xl relative z-10 animate-in fade-in zoom-in duration-500">

        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-4">
            <Activity className="text-zinc-950" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Hesap Oluştur</h1>
          <p className="text-zinc-400 text-sm mt-2 text-center">
            Bütüncül sağlık yolculuğuna bugün başla.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Ad Soyad */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300 ml-1">Ad Soyad</label>
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-emerald-400 transition-colors">
                <User size={18} />
              </div>
              <input
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Adın Soyadın"
                className="w-full bg-zinc-950/50 border border-zinc-800 text-zinc-100 text-sm rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-zinc-600"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300 ml-1">Email Adresi</label>
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-emerald-400 transition-colors">
                <Mail size={18} />
              </div>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="ornek@email.com"
                className="w-full bg-zinc-950/50 border border-zinc-800 text-zinc-100 text-sm rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-zinc-600"
              />
            </div>
          </div>

          {/* Şifre */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300 ml-1">Şifre</label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-emerald-400 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-zinc-950/50 border border-zinc-800 text-zinc-100 text-sm rounded-xl py-3 pl-10 pr-10 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-zinc-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300 ml-1">Şifre Tekrar</label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-emerald-400 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-zinc-950/50 border border-zinc-800 text-zinc-100 text-sm rounded-xl py-3 pl-10 pr-10 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-zinc-600"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-start gap-3 mt-2">
            <div className="relative flex items-center">
              <input
                name="termsAccepted"
                type="checkbox"
                checked={formData.termsAccepted}
                onChange={handleChange}
                className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-zinc-700 bg-zinc-900/50 checked:border-emerald-500 checked:bg-emerald-500 transition-all"
              />
              <Check size={14} className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-zinc-950 opacity-0 peer-checked:opacity-100" />
            </div>
            <label className="text-xs text-zinc-400 mt-0.5">
              <a href="#" className="text-emerald-400 hover:underline">Kullanım Koşulları</a>'nı ve <a href="#" className="text-emerald-400 hover:underline">Gizlilik Politikası</a>'nı kabul ediyorum.
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-3.5 rounded-xl transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 mt-6 shadow-lg shadow-emerald-500/25"
          >
            Kayıt Ol <ArrowRight size={18} />
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-800"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-zinc-900 px-2 text-zinc-500 font-medium">veya şununla devam et</span>
          </div>
        </div>

        {/* Social Login */}
        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center gap-2 bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-300 py-2.5 rounded-xl transition-all text-sm font-medium">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
            Google
          </button>
          <button className="flex items-center justify-center gap-2 bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-300 py-2.5 rounded-xl transition-all text-sm font-medium">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.15-.04-.21.09-1.99 1.59-3.65 3.195-4.43.3-.145.69-.19.92-.19.05 0 .1.01.125.01.13 0 .22.1.265.2zM21.75 19.34c-.21 1.05-1.59 3.65-2.67 4.54-1.07.87-1.63.92-2.73.92-1.22 0-1.61-.43-3.12-.43-1.52 0-1.91.43-3.07.43-1.12 0-1.67-.18-2.75-.92-1.91-1.32-3.32-4.14-3.32-7.85 0-3.59 2.05-5.96 5.09-5.96 1.05 0 2.08.57 2.68.57.6 0 1.93-.66 3.17-.66 1.42 0 2.66.72 3.4 1.77-3.04 1.73-2.54 5.91.43 7.08-.18.52-.37 1.02-.63 1.51z" /></svg>
            Apple
          </button>
        </div>

        {/* Login Link */}
        <p className="text-center text-sm text-zinc-500 mt-8">
          Zaten hesabın var mı?{' '}
          <Link to="/login" className="text-emerald-400 font-medium hover:text-emerald-300 transition-colors">
            Giriş Yap
          </Link>
        </p>
      </div>

    </div>
  );
}