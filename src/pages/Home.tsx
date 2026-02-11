import { Play, Footprints, Flame, Moon, Heart, Camera, Droplets, Plus, TrendingUp, Wheat, Candy, Beef, Info, Scale, Activity, Users, SearchX } from 'lucide-react';
import { Header, StatCard, MacroBar } from '../components/shared';
import { useUserStore } from '../store/useUserStore';
import { useState, useEffect, useRef } from 'react';
import CameraCapture from './CameraCapture';
import { type IAiNutrition } from '../types/ai-program';
import { Navigate, useNavigate } from 'react-router-dom';
import { min } from 'date-fns';
import { Upload } from 'lucide-react';
import { useNutritionStore } from '../store/useNutritionStore';
import { isSameDay, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { apiClient } from '../services/apiClient';

// removed unused import



export default function HomeView() {
  const { user: currentUser, syncFitnessData } = useUserStore();
  const { meals, aiProgram, fetchMeals, fetchProgram } = useNutritionStore();
  const [water, setWater] = useState(0);
  const [showCamera, setShowCamera] = useState(false);
  const [nutritionData, setNutritionData] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const navigate = useNavigate();
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzeLoading, setIsAnalyzeLoading] = useState(false);
  const [message, setMessage] = useState("");


  const handleClose = () => {
    setNutritionData(null);
    setSelectedFile(null);
    if (hiddenInputRef.current) {
      hiddenInputRef.current.value = '';
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const formData = new FormData();
      formData.append('image', file);
      sendImageToAI(formData);
    }
  };

  const sendImageToAI = async (formData: FormData) => {
    setIsAnalyzeLoading(true);
    try {
      const data = await apiClient.post<{ result: any }>('/analyze-image', formData);
      let parsedData;
      try {
        parsedData = JSON.parse(data.result);
        if (parsedData
        ) {
          setShowBanner(true); // Banner'ı aç
          setMessage("AI Analizi Başarılı ✅");
          setTimeout(() => {
            setShowBanner(false); // 3 saniye sonra kapat
          }, 3000);
        }
      } catch (e) {
        parsedData = data.result;
        setShowBanner(true); // Banner'ı aç
        setMessage("AI Analizi Başarılı ✅");
        setTimeout(() => {
          setShowBanner(false); // 3 saniye sonra kapat
        }, 3000);
      }
      setNutritionData(parsedData);
      setSelectedFile(null); // Clear selected file after success
    } catch (error) {
      console.error("AI Error:", error);
      setShowBanner(true); // Banner'ı aç
      setMessage("AI Analiz Hatası ❌");
      setTimeout(() => {
        setShowBanner(false); // 3 saniye sonra kapat
      }, 3000);


    } finally {
      setIsAnalyzeLoading(false);
    }
  };


  const saveMealToLog = async () => {
    if (!currentUser?.email || !nutritionData) return;

    try {
      await apiClient.post('/save-meal', {
        email: currentUser.email,
        mealData: nutritionData
      });

      setShowBanner(true); // Banner'ı aç
      setMessage("Yemek günlüğüne eklendi ✅");
      setTimeout(() => {
        setShowBanner(false); // 3 saniye sonra kapat
      }, 3000);
      setNutritionData(null); // Başarılı olunca kartı kapat (isteğe bağlı)

    } catch (error) {
      console.error("Kaydetme hatası:", error);
      setShowBanner(true); // Banner'ı aç
      setMessage("Yemek günlüğüne eklenemedi ❌");
      setTimeout(() => {
        setShowBanner(false); // 3 saniye sonra kapat
      }, 3000);
    }
  };

  const NutritionResultCard = ({ data, onSave }: { data: IAiNutrition, onSave: () => void }) => {
    if (data.calories_per_100g > 0) {
      return (
        <div className="w-full max-w-md mx-auto bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-700">

          {/* ÜST KISIM */}
          <div className="relative bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 p-6 border-b border-zinc-800">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-white capitalize tracking-wide">
                  {data.food_name}
                </h2>
                <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium">
                  <Scale size={14} />
                  <span>100g'da {data.calories_per_100g} kcal</span>
                </div>
              </div>

              <div className="flex flex-col items-end">
                <div className="text-4xl font-black text-emerald-400 flex items-center gap-1">
                  {data.calories}
                  <span className="text-sm font-bold text-zinc-500 mt-3">kcal</span>
                </div>
                <div className="text-xs text-zinc-500 font-medium bg-zinc-950 px-2 py-1 rounded-md border border-zinc-800 mt-1">
                  Porsiyon
                </div>
              </div>
            </div>
          </div>

          {/* MAKRO BESİNLER */}
          <div className="p-6 grid grid-cols-2 gap-4">
            <MacroItem icon={<Beef size={20} />} label="Protein" value={data.protein} unit="g" color="text-blue-400" bgColor="bg-blue-400/10" borderColor="border-blue-400/20" />
            <MacroItem icon={<Wheat size={20} />} label="Karb." value={data.carbs} unit="g" color="text-yellow-400" bgColor="bg-yellow-400/10" borderColor="border-yellow-400/20" />
            <MacroItem icon={<Droplets size={20} />} label="Yağ" value={data.fat} unit="g" color="text-purple-400" bgColor="bg-purple-400/10" borderColor="border-purple-400/20" />
            <MacroItem icon={<Candy size={20} />} label="Şeker" value={data.sugar} unit="g" color="text-pink-400" bgColor="bg-pink-400/10" borderColor="border-pink-400/20" />
          </div>

          {/* AI NOTU */}
          <div className="px-6 pb-6">
            <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-2xl p-4 flex gap-4 items-start mb-4">
              <div className="bg-emerald-500/10 p-2 rounded-full shrink-0">
                <Info size={20} className="text-emerald-400" />
              </div>
              <div>
                <h4 className="text-emerald-400 font-bold text-sm mb-1 uppercase tracking-wider">AI Beslenme Notu</h4>
                <p className="text-zinc-300 text-sm leading-relaxed">"{data.health_tip}"</p>
              </div>
            </div>
            <button
              onClick={onSave}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              Yemeği Günlüğe Ekle
            </button>
            <button
              onClick={() => handleClose()
              }
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              Kapat
            </button>
          </div>
        </div>
      )
    }
    else return (
      <div className="w-full flex justify-center items-center py-12 px-4">
        <div className="w-full max-w-md bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-3xl p-8 shadow-2xl animate-in slide-in-from-bottom-4 duration-700 text-center">
          <div className="mx-auto w-16 h-16 bg-zinc-800/50 rounded-full flex items-center justify-center mb-4 ring-1 ring-zinc-700/50">
            <SearchX className="text-zinc-400 w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2 tracking-tight">
            Yemek Bulunamadı
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Lütfen yemek gösteriniz<br />
          </p>
        </div>
      </div>);
  };

  // Yardımcı Bileşen (Bunu da dosyanın en altına koyabilirsin)
  const MacroItem = ({ icon, label, value, unit, color, bgColor, borderColor }: any) => {
    return (
      <div className={`flex flex-col items-center justify-center p-4 rounded-2xl border ${borderColor} ${bgColor} transition-transform hover:scale-105 duration-300`}>
        <div className={`mb-2 ${color}`}>{icon}</div>
        <div className="text-2xl font-bold text-white">
          {value}<span className="text-sm text-zinc-400 font-medium">{unit}</span>
        </div>
        <div className={`text-xs font-bold uppercase tracking-wider ${color} opacity-80`}>{label}</div>
      </div>
    )
  };

  const saveWaterToDB = async (newAmount: number) => {
    if (!currentUser?.email) return;

    try {
      await apiClient.post('/update-water', {
        email: currentUser.email,
        waterAmount: newAmount
      });
      // Not: Hata yönetimi ekleyebilirsin ama temel işlev bu
    } catch (error) {
      console.error("Su kaydedilemedi", error);
    }
  };

  // --- 2. FONKSİYON: DB'DEN ÇEKME (Sayfa Açılınca) ---
  useEffect(() => {
    syncFitnessData();

    const fetchWaterFromDB = async () => {
      if (!currentUser?.email) return;

      try {
        const data = await apiClient.get<any>(`/get-water/${currentUser.email}`);

        // Veritabanından gelen değeri state'e işle
        setWater(data.water);
      } catch (error) {
        console.error("Su verisi çekilemedi", error);
      }
    };
    fetchWaterFromDB();


  }, [currentUser?.email]);

  // Yeni günlük makro hesaplaması
  const today = new Date();
  const todaysMeals = meals.filter(meal => isSameDay(new Date(meal.date), today));

  const dailyMacros = todaysMeals.reduce((acc, meal) => ({
    protein: acc.protein + (meal.protein || 0),
    carbs: acc.carbs + (meal.carbs || 0),
    fat: acc.fat + (meal.fat || 0),
    calories: acc.calories + (meal.calories || 0)
  }), { protein: 0, carbs: 0, fat: 0, calories: 0 });

  useEffect(() => {
    if (currentUser?.email) {
      fetchMeals(currentUser.email, false);
      fetchProgram(currentUser.email);
    }
  }, [currentUser?.email]);

  // Haftalık kalori hesaplaması
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const thisWeekMeals = meals.filter(meal => {
    try {
      const mealDate = new Date(meal.date);
      return isWithinInterval(mealDate, { start: weekStart, end: weekEnd });
    } catch { return false; }
  });
  const weeklyCaloriesConsumed = thisWeekMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
  const dailyCalorieTarget = aiProgram?.nutrition_targets?.calories || 2500;
  const weeklyCalorieTarget = dailyCalorieTarget * 7;
  const calorieDiff = weeklyCaloriesConsumed - weeklyCalorieTarget;
  const weeklyPercentage = weeklyCalorieTarget > 0 ? Math.min((weeklyCaloriesConsumed / weeklyCalorieTarget) * 100, 100) : 0;
  const ringStrokeDashoffset = 264 - (264 * weeklyPercentage / 100);
  const dailyProteinTarget = aiProgram?.nutrition_targets?.protein || 100;
  const dailyCarbTarget = aiProgram?.nutrition_targets?.carbs || 100;
  const dailyFatTarget = aiProgram?.nutrition_targets?.fats || 100;
  const weeklyProteinTarget = dailyProteinTarget * 7;
  const weeklyCarbTarget = dailyCarbTarget * 7;
  const weeklyFatTarget = dailyFatTarget * 7;
  const weeklyProteinConsumed = thisWeekMeals.reduce((sum, meal) => sum + (meal.protein || 0), 0);
  const weeklyCarbConsumed = thisWeekMeals.reduce((sum, meal) => sum + (meal.carbs || 0), 0);
  const weeklyFatConsumed = thisWeekMeals.reduce((sum, meal) => sum + (meal.fat || 0), 0);
  const weeklyProteinDiff = weeklyProteinConsumed - weeklyProteinTarget;
  const weeklyCarbDiff = weeklyCarbConsumed - weeklyCarbTarget;
  const weeklyFatDiff = weeklyFatConsumed - weeklyFatTarget;
  const weeklyProteinPercentage = weeklyProteinTarget > 0 ? Math.min((weeklyProteinConsumed / weeklyProteinTarget) * 100, 100) : 0;
  const weeklyCarbPercentage = weeklyCarbTarget > 0 ? Math.min((weeklyCarbConsumed / weeklyCarbTarget) * 100, 100) : 0;
  const weeklyFatPercentage = weeklyFatTarget > 0 ? Math.min((weeklyFatConsumed / weeklyFatTarget) * 100, 100) : 0;
  const weeklyProteinRingStrokeDashoffset = 264 - (264 * weeklyProteinPercentage / 100);
  const weeklyCarbRingStrokeDashoffset = 264 - (264 * weeklyCarbPercentage / 100);
  const weeklyFatRingStrokeDashoffset = 264 - (264 * weeklyFatPercentage / 100);

  const handleAddWater = () => {
    const newValue = water + 0.250;

    setWater(newValue);

    saveWaterToDB(newValue);
  };
  return (
    <>
      <Header title={`${currentUser?.fullName}`} subtitle="Günaydın," showProfileOnMobile={true} />
      <div style={{ maxWidth: '100vw', overflowX: 'hidden', boxSizing: 'border-box' }} className="px-4 lg:px-8 py-4 lg:py-6 space-y-4 lg:space-y-6 max-w-6xl mx-auto">
        {/* Haftalık Kalori Özeti */}
        <section className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-12">
            {/* Progress Ring */}
            <div className="relative w-32 h-32 lg:w-44 lg:h-44 mx-auto lg:mx-0 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#27272a" strokeWidth="6" />
                <circle cx="50" cy="50" r="42" fill="none" stroke={calorieDiff > 0 ? '#ef4444' : '#10b981'} strokeWidth="6" strokeLinecap="round" strokeDasharray="264" strokeDashoffset={ringStrokeDashoffset} className="transition-all duration-700" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl lg:text-4xl font-bold text-zinc-100">{Math.round(weeklyPercentage)}%</span>
                <span className="text-[10px] lg:text-xs text-zinc-500 uppercase tracking-wider">Weekly Calories</span>
              </div>
            </div>
            {/* protein */}
            <div className="relative w-32 h-32 lg:w-44 lg:h-44 mx-auto lg:mx-0 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#27272a" strokeWidth="6" />
                <circle cx="50" cy="50" r="42" fill="none" stroke={weeklyProteinDiff > 0 ? '#ef4444' : '#10b981'} strokeWidth="6" strokeLinecap="round" strokeDasharray="264" strokeDashoffset={weeklyProteinRingStrokeDashoffset} className="transition-all duration-700" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl lg:text-4xl font-bold text-zinc-100">{Math.round(weeklyProteinPercentage)}%</span>
                <span className="text-[10px] lg:text-xs text-zinc-500 uppercase tracking-wider">Weekly Protein</span>
              </div>
            </div>
            {/* carbs */}
            <div className="relative w-32 h-32 lg:w-44 lg:h-44 mx-auto lg:mx-0 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#27272a" strokeWidth="6" />
                <circle cx="50" cy="50" r="42" fill="none" stroke={weeklyCarbDiff > 0 ? '#ef4444' : '#10b981'} strokeWidth="6" strokeLinecap="round" strokeDasharray="264" strokeDashoffset={weeklyCarbRingStrokeDashoffset} className="transition-all duration-700" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl lg:text-4xl font-bold text-zinc-100">{Math.round(weeklyCarbPercentage)}%</span>
                <span className="text-[10px] lg:text-xs text-zinc-500 uppercase tracking-wider">Weekly Carbs</span>
              </div>
            </div>
            {/*yağ*/}
            <div className="relative w-32 h-32 lg:w-44 lg:h-44 mx-auto lg:mx-0 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#27272a" strokeWidth="6" />
                <circle cx="50" cy="50" r="42" fill="none" stroke={weeklyFatDiff > 0 ? '#ef4444' : '#10b981'} strokeWidth="6" strokeLinecap="round" strokeDasharray="264" strokeDashoffset={weeklyFatRingStrokeDashoffset} className="transition-all duration-700" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl lg:text-4xl font-bold text-zinc-100">{Math.round(weeklyFatPercentage)}%</span>
                <span className="text-[10px] lg:text-xs text-zinc-500 uppercase tracking-wider">Weekly Fat</span>
              </div>
            </div>


            {/* Info */}
            <div className="flex-1 text-center lg:text-left">
              <span className="inline-block px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-medium rounded-full mb-3">
                Haftalık Kalori Özeti
              </span>

              <div className="flex items-baseline gap-2 justify-center lg:justify-start mb-1">
                <span className="text-2xl lg:text-3xl font-bold text-zinc-100">{weeklyCaloriesConsumed.toLocaleString()}</span>
                <span className="text-sm text-zinc-500">/ {weeklyCalorieTarget.toLocaleString()} kcal</span>
              </div>

              <p className={`text-sm font-semibold mb-4 ${calorieDiff > 0 ? 'text-red-400' : calorieDiff === 0 ? 'text-emerald-400' : 'text-sky-400'}`}>
                {calorieDiff > 0
                  ? `⚠️ ${calorieDiff.toLocaleString()} kcal fazla aldın`
                  : calorieDiff === 0
                    ? '✅ Hedefe tam ulaştın!'
                    : `🎯 ${Math.abs(calorieDiff).toLocaleString()} kcal daha alabilirsin`
                }
              </p>

              <button
                onClick={() => navigate('/Workout')}
                className="inline-flex items-center gap-2 bg-zinc-100 text-zinc-950 px-5 py-2.5 rounded-full text-sm font-medium hover:bg-white transition-colors">
                <Play size={16} fill="currentColor" />
                Antrenmanı Başlat
              </button>
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-zinc-500">Günün Verileri</h3>

          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4">

            <StatCard
              icon={<Footprints size={18} />}
              label="Adım"
              value={currentUser?.daily_stats?.steps ? currentUser.daily_stats.steps.toLocaleString() : "0"}
              subtitle="/ 10,000"
              colorClass="bg-emerald-500/10 text-emerald-400"
            />
            <StatCard

              icon={<Flame size={18} />}
              label="Kalori"
              value={currentUser?.daily_stats?.calories ? currentUser.daily_stats.calories.toString() : "0"}
              subtitle="kcal"
              colorClass="bg-orange-500/10 text-orange-400 "
            />
            <div className="col-span-2 bg-sky-500/5 border border-sky-500/20 rounded-2xl p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Droplets size={16} className="text-sky-400" />
                    <h3 className="font-medium text-zinc-100">Su Takibi</h3>

                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-semibold text-zinc-100">{water} L</span>
                    <span className="text-sm text-zinc-500">/ 2.5L</span>
                  </div>
                  <div className="w-32 h-1.5 bg-zinc-800 rounded-full mt-3 overflow-hidden">
                    <div className="h-full bg-sky-400 rounded-full" style={{ width: `${water * 100 / 2.5}%` }} />
                  </div>
                </div>
                <button onClick={handleAddWater} disabled={water >= 2.5} className="w-11 h-11 bg-sky-500 rounded-full flex items-center justify-center text-zinc-950 hover:bg-sky-400 transition-colors">
                  <Plus size={20} />
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-4 lg:gap-6">
          <div id="cameraSection"
            className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-4 lg:p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center shrink-0">
                <Camera className="text-amber-400 " size={26} />
              </div>
              <div className="flex-1">
                <h3 className="font-medium mb-1 text-zinc-100">Yemeğini Tara</h3>
                <p className="text-sm text-zinc-500 mb-4">AI ile kalori ve makro hesapla</p>
                <button
                  onClick={() => setShowCamera(!showCamera)}
                  className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-sm font-medium transition-colors text-zinc-300 mb-disable hidden md:block">
                  {showCamera ? "Kamerayı Kapat" : "Kamerayı Aç"}
                </button>
                <button
                  id='addPhotoButton'
                  onClick={() => hiddenInputRef.current?.click()}
                  disabled={isAnalyzeLoading}
                  className="mt-3 w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-sm font-medium transition-colors text-zinc-300 disabled:opacity-50">
                  {isAnalyzeLoading ? "Analiz Ediliyor..." : "Fotoğraf Yükle"}
                </button>
                <input
                  type="file"
                  ref={hiddenInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                {showCamera && (
                  <CameraCapture onAnalyzeSuccess={(data) => {
                    console.log(data);
                    setNutritionData(data);
                    setShowCamera(false);
                  }} />
                )}
                {nutritionData && (
                  <NutritionResultCard
                    data={nutritionData}
                    onSave={saveMealToLog}
                  />
                )}

              </div>
            </div>
          </div>


        </div>

        {/* Macro Status */}
        <section className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-4 lg:p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-medium text-zinc-100">Makro Durumu</h3>
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
              <TrendingUp size={12} />
              Dengeli
            </span>
          </div>
          <div className="space-y-4">
            <MacroBar label="Protein" current={dailyMacros.protein} total={aiProgram?.nutrition_targets?.protein || 140} colorClass={`${dailyMacros.protein >= (aiProgram?.nutrition_targets?.protein || 140) ? 'bg-red-500' : 'bg-sky-500'}`} />
            <MacroBar label="Karbonhidrat" current={dailyMacros.carbs} total={aiProgram?.nutrition_targets?.carbs || 200} colorClass={`${dailyMacros.carbs >= (aiProgram?.nutrition_targets?.carbs || 200) ? 'bg-red-500' : 'bg-sky-500'}`} />
            <MacroBar label="Yağ" current={dailyMacros.fat} total={aiProgram?.nutrition_targets?.fats || 70} colorClass={`${dailyMacros.fat >= (aiProgram?.nutrition_targets?.fats || 70) ? 'bg-red-500' : 'bg-sky-500'}`} />
          </div>
        </section>
      </div>
      {/* --- BANNER (Sadece showBanner true ise görünür) --- */}
      {showBanner && (
        <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 z-50 animate-bounce-in">
          <div className="flex items-center gap-3 bg-zinc-900 border border-emerald-500/50 text-emerald-400 px-6 py-3 rounded-full shadow-2xl">
            {/* İkon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>

            <span className="font-medium text-sm">
              {message}
            </span>
          </div>
        </div>
      )}
    </>
  )
}