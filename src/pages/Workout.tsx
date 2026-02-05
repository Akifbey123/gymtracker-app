import { Dumbbell, Clock, Flame, Zap, Activity, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { Header } from '../components/shared';
import { useAuth } from '../context/UserContext';
import { useWorkoutStore } from '../store/useWorkoutStore';
import { useEffect, useMemo, useState } from 'react';
import { Check, X, NotebookPen } from "lucide-react";
export default function WorkoutView() {
  const { user, login } = useAuth();
  const {
    aiProgram,
    workoutLogs,
    loading,
    fetchProgram,
    generateProgram,
    saveLog,
    setWorkoutLogs
  } = useWorkoutStore();

  // Logları tutan state - store'da workoutLogs var, onu kullanacağız.
  // Ancak UserContext'ten gelen loglar da olabilir. 
  // Store'u initialize etmek gerekebilir.

  // Kullanıcı değişirse logları güncelle
  useEffect(() => {
    if (user?.workoutLogs) {
      setWorkoutLogs(user.workoutLogs);
    }
  }, [user, setWorkoutLogs]);

  useEffect(() => {
    if (user?.email) {
      fetchProgram(user.email);
    }
  }, [user?.email, fetchProgram]);

  const handleGenerateProgram = async () => {
    if (!user) return;
    await generateProgram({
      height: user.height || 175,
      weight: user.weight || 75,
      goals: user.goals || ["Genel"],
      activityLevel: user.activityLevel || 3,
      email: user.email
    })
  }



  const recommendedWorkout = useMemo(() => {
    // Varsayılan antrenman
    let workout = {
      title: "Tüm Vücut Başlangıç",
      duration: "30 Dakika",
      calories: "250 kcal",
      level: "Başlangıç",
      type: "Genel Kondisyon"
    };

    if (user?.goals && user.goals.length > 0 && !aiProgram) {
      if (user.goals.includes('muscle')) {
        workout = {
          title: "Üst Vücut Hipertrofi",
          duration: "45-60 Dakika",
          calories: "350 kcal",
          level: "Orta Seviye",
          type: "Güç & Hacim"
        };
      } else if (user.goals.includes('fat_loss')) {
        workout = {
          title: "Yüksek Yoğunluklu HIIT",
          duration: "35 Dakika",
          calories: "450 kcal",
          level: "Zorlu",
          type: "Yağ Yakımı"
        };
      } else if (user.goals.includes('gain_weight')) {
        workout = {
          title: "Compound Güç Antrenmanı",
          duration: "60 Dakika",
          calories: "400 kcal",
          level: "Orta-İleri",
          type: "Kuvvet"
        };
      }
    }

    // Aktivite seviyesine göre zorluk ayarlaması (basit mantık)
    if (user?.activityLevel && user.activityLevel > 4) {
      workout.level = "İleri Seviye";
      workout.duration = "60+ Dakika";
    }

    return workout;
  }, [user]);



  const handleSaveLog = async (day: string, exercise: string, reps: string, sets: string) => {
    if (!user?.email) return;

    await saveLog({
      email: user.email,
      day,
      exercise,
      reps,
      sets
    }, (newLogs) => {
      // Global context güncelle
      if (user) {
        login({ ...user, workoutLogs: newLogs });
      }
    });
  };


  return (
    <>
      <Header title="Antrenman Programı" subtitle="Sana Özel" />
      <div className="px-5 lg:px-8 py-6 space-y-6 max-w-6xl mx-auto">
        {/* Today's Focus */}
        <section className={`bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-6 relative overflow-hidden group ${aiProgram ? 'hidden' : ''}`}>
          <div className="absolute right-0 top-0 opacity-5 pointer-events-none">
            <Dumbbell size={150} />
          </div>
          <div className={`relative z-10 `}>
            <span className="inline-block px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-medium rounded-full mb-3 ">
              Bugün: {recommendedWorkout.type}
            </span>
            <h2 className="text-2xl font-semibold text-zinc-100 mb-2">{recommendedWorkout.title}</h2>
            <div className="flex gap-4 text-sm text-zinc-400 mb-6">
              <span className="flex items-center gap-1"><Clock size={14} /> {recommendedWorkout.duration}</span>
              <span className="flex items-center gap-1"><Flame size={14} /> {recommendedWorkout.calories}</span>
              <span className="flex items-center gap-1"><Zap size={14} /> {recommendedWorkout.level}</span>
            </div>
            <button
              onClick={handleGenerateProgram}
              disabled={loading}
              className="w-full lg:w-auto bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-medium px-6 py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? "Program Hazırlanıyor..." : "Yapay Zeka ile Program Oluştur"}
            </button>
          </div>
        </section>

        {/* AI Program Response Section */}
        {aiProgram && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Header & Motivation */}
            <section className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Trophy size={100} className="text-emerald-500" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2 text-emerald-400">
                  <Zap size={20} />
                  <span className="text-sm font-bold tracking-wide uppercase">Yapay Zeka Destekli Program</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">{aiProgram.program_name}</h2>
                <blockquote className="border-l-4 border-emerald-500 pl-4 py-1 text-zinc-400 italic text-lg">
                  "{aiProgram.motivation}"
                </blockquote>
              </div>
            </section>

            {/* Nutrition Targets */}

            <section>
              <h3 className="text-lg font-semibold text-zinc-200 mb-4 flex items-center gap-2">
                <Flame size={20} className="text-orange-500" /> Beslenme Hedefleri
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <NutritionCard label="Kalori" value={aiProgram?.nutrition_targets?.calories} unit="kcal" color="bg-orange-500/10 text-orange-400" />
                <NutritionCard label="Protein" value={aiProgram?.nutrition_targets?.protein} unit="g" color="bg-blue-500/10 text-blue-400" />
                <NutritionCard label="Karbonhidrat" value={aiProgram?.nutrition_targets?.carbs} unit="g" color="bg-amber-500/10 text-amber-400" />
                <NutritionCard label="Yağ" value={aiProgram?.nutrition_targets?.fats} unit="g" color="bg-rose-500/10 text-rose-400" />
              </div>
            </section>

            {/* Daily Commands */}
            <section className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-zinc-200 mb-4 flex items-center gap-2">
                <Activity size={20} className="text-emerald-500" /> Günlük Görevler
              </h3>
              <ul className="space-y-3">
                {aiProgram.daily_commands.map((cmd, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-zinc-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                    <span>{cmd}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Weekly Schedule */}
            <section>
              <h3 className="text-lg font-semibold text-zinc-200 mb-4 flex items-center gap-2">
                <Clock size={20} className="text-purple-500" /> Haftalık Antrenman Programı
              </h3>
              <div className="space-y-4">
                {aiProgram.schedule.map((day, idx) => (
                  <div key={idx} className="bg-zinc-900/60 border border-zinc-800/50 rounded-xl overflow-hidden">
                    <div className="bg-zinc-800/40 px-6 py-4 border-b border-zinc-800/50">
                      <h4 className="font-semibold text-white">{day.day}</h4>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="p-4 space-y-3">
                        {day.exercises.map((ex, i) => (
                          // BURADA YENİ BİLEŞENİ ÇAĞIRIYORUZ
                          <ExerciseItem
                            key={i}
                            exercise={ex}
                            day={day.day}
                            onSave={handleSaveLog}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* History Section */}
        {workoutLogs.length > 0 && (
          <section className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-zinc-200 mb-4 flex items-center gap-2">
              <Activity size={20} className="text-emerald-500" /> Son Aktiviteler
            </h3>
            <div className="space-y-2">
              {[...workoutLogs].reverse().slice(0, 5).map((log: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/30 border border-zinc-800/50">
                  <div>
                    <div className="text-sm font-medium text-white">{log.exercise}</div>
                    <div className="text-xs text-zinc-500">{new Date(log.date).toLocaleDateString()} - {log.day}</div>
                  </div>
                  <div className="text-sm font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                    {log.note}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Workout Categories */}
        <section>
          <h3 className="text-sm font-medium text-zinc-500 mb-4">Kategoriler</h3>
          <div className="grid grid-cols-2 gap-3 lg:gap-4">
            <CategoryCard icon={<Zap size={20} />} title="HIIT & Kardiyo" count="12 Antrenman" color="text-amber-400" bg="bg-amber-500/10" />
            <CategoryCard icon={<Dumbbell size={20} />} title="Güç & Hacim" count="24 Antrenman" color="text-emerald-400" bg="bg-emerald-500/10" />
            <CategoryCard icon={<Activity size={20} />} title="Yoga & Esneklik" count="8 Antrenman" color="text-indigo-400" bg="bg-indigo-500/10" />
            <CategoryCard icon={<Trophy size={20} />} title="Zorlu Parkur" count="5 Antrenman" color="text-rose-400" bg="bg-rose-500/10" />
          </div>
        </section>

        {/* Schedule */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-zinc-500">Haftalık Plan</h3>
            <button className="text-xs text-emerald-400">Düzenle</button>
          </div>
          <div className="space-y-3">
            <ScheduleItem day="Pazartesi" title="Göğüs & Arka Kol" status="done" />
            <ScheduleItem day="Salı" title="HIIT Kardiyo" status="done" />
            <ScheduleItem day="Çarşamba" title="Sırt & Ön Kol" status="missed" />
            <ScheduleItem day="Perşembe" title="Bacak & Kalça" status="upcoming" />
            <ScheduleItem day="Cuma" title="Omuz & Core" status="upcoming" />
          </div>
        </section>
      </div >
    </>
  )
}

// Local Components for Workout Page
function CategoryCard({ icon, title, count, color, bg }: any) {
  return (
    <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-xl p-4 flex items-center gap-3 hover:bg-zinc-800/60 transition-colors cursor-pointer">
      <div className={`w-10 h-10 ${bg} ${color} rounded-lg flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div>
        <h4 className="text-sm font-medium text-zinc-100">{title}</h4>
        <p className="text-xs text-zinc-500">{count}</p>
      </div>
    </div>
  )
}

function ScheduleItem({ day, title, status }: { day: string, title: string, status: 'done' | 'missed' | 'upcoming' }) {
  const getStatusColor = () => {
    if (status === 'done') return 'bg-emerald-500';
    if (status === 'missed') return 'bg-zinc-700';
    return 'bg-zinc-800 border-2 border-zinc-700';
  }

  return (
    <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-900/50 transition-colors">
      <div className={`w-3 h-3 rounded-full ${getStatusColor()} shrink-0`}></div>
      <div className="w-20 text-sm text-zinc-500">{day}</div>
      <div className={`text-sm font-medium ${status === 'missed' ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>{title}</div>
    </div>
  )
}

function NutritionCard({ label, value, unit, color }: { label: string, value: number, unit: string, color: string }) {
  return (
    <div className={`p-4 rounded-xl border border-zinc-800/50 ${color} bg-opacity-10 backdrop-blur-sm flex flex-col items-center justify-center text-center`}>
      <span className="text-2xl font-bold mb-1">{value}<span className="text-base font-normal opacity-70 ml-1">{unit}</span></span>
      <span className="text-xs font-medium uppercase tracking-wider opacity-80">{label}</span>
    </div>
  )
}

// Tek bir egzersiz satırını yöneten bileşen
function ExerciseItem({ exercise, day, onSave }: { exercise: any, day: string, onSave: (d: string, e: string, r: string, s: string) => void }) {
  const [isOpen, setIsOpen] = useState(false); // Input açık mı?
  const [userReps, setUserReps] = useState(""); // Kullanıcının yazdığı değer
  const [userSets, setUserSets] = useState(""); // Kullanıcının yazdığı değer

  const handleSave = () => {
    if (!userReps || !userSets) {
      toast.error("Lütfen set ve tekrar sayısını giriniz.");
      return;
    };

    // Parent fonksiyona gönder
    onSave(day, exercise.name, userReps, userSets);

    // İşlem bitince kapat ve temizle
    setIsOpen(false);
    setUserReps("");
    setUserSets("");
  };

  return (
    <div className="bg-zinc-950/30 rounded-lg overflow-hidden transition-all duration-300 hover:bg-zinc-950/50 border border-transparent hover:border-zinc-800">

      {/* ÜST KISIM: İSİM VE BUTON */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3">

        {/* Egzersiz İsmi */}
        <span className="font-medium text-zinc-200 flex-1">{exercise.name}</span>

        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
          {/* Hedef Set/Tekrar Bilgisi */}
          <div className="flex gap-2 text-xs font-mono shrink-0">
            <span className="bg-zinc-900 px-2 py-1.5 rounded text-zinc-400 border border-zinc-800">
              {exercise.sets} Set
            </span>
            <span className="bg-zinc-900 px-2 py-1.5 rounded text-zinc-400 border border-zinc-800">
              {exercise.reps} Tekrar
            </span>
          </div>

          {/* VERİ GİR BUTONU */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`p-2 rounded-lg transition-all ${isOpen
              ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
              : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
              }`}
            title="Tekrar Sayısı Gir"
          >
            {isOpen ? <X size={18} /> : <NotebookPen size={18} />}
          </button>
        </div>
      </div>

      {/* ALT KISIM: AÇILIR INPUT ALANI */}
      {isOpen && (
        <div className="p-3 bg-zinc-900/50 border-t border-zinc-800/50 animate-in slide-in-from-top-2">
          <div className="flex gap-2">
            <input
              type="number"
              value={userSets}
              onChange={(e) => setUserSets(e.target.value)}
              placeholder="Set"
              className="w-20 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-zinc-600"
            />
            <input
              type="number"
              value={userReps}
              onChange={(e) => setUserReps(e.target.value)}
              placeholder="Tekrar"
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-zinc-600"
              autoFocus
            />
            <button
              onClick={handleSave}
              className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-4 rounded-lg font-medium transition-colors flex items-center"
            >
              <Check size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}