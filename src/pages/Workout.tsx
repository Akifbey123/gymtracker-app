import { Dumbbell, Clock, Flame, Zap, Activity, Trophy, Plus, Trash2, Save, ChevronDown, ChevronUp, ArrowRight, History, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Header } from '../components/shared';
import { useAuth } from '../context/UserContext';
import { useWorkoutStore } from '../store/useWorkoutStore';
import { useEffect, useMemo, useState } from 'react';
import { type IAiWorkout, type IScheduleItem, type IExercisesItem } from '../types/ai-program';

export default function WorkoutView() {
  const { user, login } = useAuth();
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const initialExercises = [
    "Squat", "Deadlift", "Bench Press", "Overhead Press",
    "Pull Up", "Dumbbell Row", "Lat Pulldown", "Push Up",
    "Lunges", "Leg Press", "Leg Extension", "Leg Curl",
    "Face Pull", "Lateral Raise", "Bicep Curl", "Tricep Extension",
    "Plank", "Crunch", "Russian Twist"
  ];
  const {
    aiProgram,
    workoutLogs,
    loading,
    fetchProgram,
    generateProgram,
    setProgram,
    saveLog,
    setWorkoutLogs,
    saveProgramToBackend,
    addExerciseToProgram
  } = useWorkoutStore();

  const [isCreatingProgram, setIsCreatingProgram] = useState(false);

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
  const addExercise = async (exerciseName: string) => {
    if (!aiProgram || !selectedDay || !user?.email) return;

    await addExerciseToProgram({
      email: user.email,
      day: selectedDay,
      exercises: [{
        name: exerciseName,
        sets: "3",
        reps: "12",
        weight: "0"
      }]
    });

    setSelectedDay(null);
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
  }, [user, aiProgram]);


  const handleSaveLog = async (day: string, exercise: string, reps: string, sets: string, weight?: string) => {
    if (!user?.email) return;

    await saveLog({
      email: user.email,
      day,
      exercise,
      reps,
      sets,
      weight
    }, (newLogs) => {
      // Global context güncelle
      if (user) {
        login({ ...user, workoutLogs: newLogs });
      }
    });
  };

  const getLastLog = (exerciseName: string) => {
    if (!workoutLogs || workoutLogs.length === 0) return null;
    const logs = workoutLogs.filter(log => log.exercise.toLowerCase() === exerciseName.toLowerCase());
    if (logs.length === 0) return null;

    return logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  }


  return (
    <>
      <Header title="Antrenman Programı" subtitle="Sana Özel" />
      <div className="px-5 lg:px-8 py-6 space-y-6 max-w-6xl mx-auto">

        {/* CREATE PROGRAM SECTION toggler */}
        {!aiProgram && !isCreatingProgram && (
          <div className="flex gap-4">
            <button
              onClick={() => setIsCreatingProgram(true)}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 py-4 rounded-xl flex items-center justify-center gap-2 font-medium transition-colors"
            >
              <Plus size={20} /> Kendi Programını Oluştur
            </button>
          </div>
        )}

        {/* CUSTOM PROGRAM BUILDER */}
        {isCreatingProgram && (
          <CustomProgramBuilder
            onCancel={() => setIsCreatingProgram(false)}
            onSave={(newProgram) => {
              setProgram(newProgram);
              setIsCreatingProgram(false);

            }}
          />
        )}



        {/* NO PROGRAM DEFAULT VIEW (Hero Score Card) */}
        {!aiProgram && !isCreatingProgram && (
          <section className={`bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-6 relative overflow-hidden group`}>
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
        )}

        {/* ACTIVE PROGRAM VIEW */}
        {aiProgram && !isCreatingProgram && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Header & Motivation */}
            <section className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Trophy size={100} className="text-emerald-500" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2 text-emerald-400">
                  <Zap size={20} />
                  <span className="text-sm font-bold tracking-wide uppercase">Aktif Program</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">{aiProgram.program_name}</h2>
                <blockquote className="border-l-4 border-emerald-500 pl-4 py-1 text-zinc-400 italic text-lg">
                  "{aiProgram.motivation || 'Gücünü keşfet.'}"
                </blockquote>
              </div>
            </section>

            {/* Weekly Schedule & PROGRESSIVE OVERLOAD TRACKER */}
            <section>
              <h3 className="text-lg font-semibold text-zinc-200 mb-4 flex items-center gap-2">
                <Clock size={20} className="text-purple-500" /> Haftalık Antrenman Programı
              </h3>
              <div className="space-y-4">
                {aiProgram.schedule.map((day, idx) => (
                  <div key={idx} className="bg-zinc-900/60 border border-zinc-800/50 rounded-xl overflow-hidden">
                    <div className="bg-zinc-800/40 px-6 py-4 border-b border-zinc-800/50 flex justify-between items-center">
                      <h4 className="font-semibold text-white">{day.day}</h4>
                      <button
                        onClick={() => setSelectedDay(day.day)}
                        className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-3 py-1.5 rounded-lg flex items-center justify-center gap-1 text-xs font-bold transition-colors">
                        <Plus size={16} />
                        Egzersiz Ekle
                      </button>
                      {selectedDay === day.day && (
                        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
                          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-lg max-h-[80vh] flex flex-col rounded-2xl p-6 relative shadow-2xl animate-in zoom-in-95 duration-200">
                            <div className="flex justify-between items-center mb-4">
                              <h3 className="text-lg font-bold text-zinc-100">Egzersiz Seç</h3>
                              <button onClick={() => setSelectedDay(null)} className="text-zinc-500 hover:text-white"><X size={24} /></button>
                            </div>

                            <div className="overflow-y-auto pr-2 space-y-2 flex-1 custom-scrollbar">
                              {initialExercises.map((ex, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => addExercise(ex)}
                                  className="w-full text-left px-4 py-3 rounded-xl bg-zinc-950/50 hover:bg-zinc-800/80 border border-zinc-800/50 hover:border-emerald-500/50 group transition-all"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-zinc-300 group-hover:text-emerald-400 font-medium">{ex}</span>
                                    <Plus size={16} className="text-zinc-600 group-hover:text-emerald-500" />
                                  </div>
                                </button>
                              ))}
                            </div>

                            <div className="mt-4 pt-4 border-t border-zinc-800 text-center">
                              <button onClick={() => setSelectedDay(null)} className="text-zinc-400 text-sm hover:text-white">Vazgeç</button>
                            </div>
                          </div>
                        </div>
                      )}
                      <span className="text-xs text-zinc-500">{day.exercises.length} Egzersiz</span>
                    </div>

                    <div className="divide-y divide-zinc-800/50">
                      {day.exercises.map((ex, i) => {
                        const lastLog = getLastLog(ex.name);
                        return (
                          <ExerciseItem
                            key={i}
                            exercise={ex}
                            day={day.day}
                            lastLog={lastLog}
                            onSave={handleSaveLog}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div >
        )
        }

        {/* History Section (Keeping existing but refreshing list) */}
        {
          workoutLogs.length > 0 && (
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
                    <div className="text-right">
                      <div className="text-sm font-mono text-emerald-400">
                        {log.note}
                      </div>
                      {log.weight && <div className="text-xs text-zinc-400 font-mono">{log.weight}kg</div>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )
        }

      </div >
    </>
  )
}

// --- SUB COMPONENTS ---

// 1. Custom Program Builder
function CustomProgramBuilder({ onCancel, onSave }: { onCancel: () => void, onSave: (p: IAiWorkout) => void }) {
  const [name, setName] = useState("");
  const [days, setDays] = useState<IScheduleItem[]>([
    { day: "Pazartesi", exercises: [] },
    { day: "Çarşamba", exercises: [] },
    { day: "Cuma", exercises: [] }
  ]);

  const addDay = () => setDays([...days, { day: "Yeni Gün", exercises: [] }]);

  const updateDayName = (index: number, newName: string) => {
    const newDays = [...days];
    newDays[index].day = newName;
    setDays(newDays);
  }

  // Basit bir string input ile egzersiz ekleme (Geliştirilebilir)
  const addExercise = (dayIndex: number) => {
    const newDays = [...days];
    newDays[dayIndex].exercises.push({
      name: "Yeni Egzersiz",
      sets: "3",
      reps: "12",
      weight: "0",
      target_sets: "3",
      target_reps: "12"
    });
    setDays(newDays);
  };

  const updateExercise = (dayIndex: number, exIndex: number, field: keyof IExercisesItem, value: string) => {
    const newDays = [...days];
    // @ts-ignore
    newDays[dayIndex].exercises[exIndex][field] = value;
    setDays(newDays);
  };

  const removeExercise = (dayIndex: number, exIndex: number) => {
    const newDays = [...days];
    newDays[dayIndex].exercises.splice(exIndex, 1);
    setDays(newDays);
  }

  const removeDay = (dayIndex: number) => {
    const newDays = [...days];
    newDays.splice(dayIndex, 1);
    setDays(newDays);
  }

  const handleSave = () => {
    if (!name) { toast.error("Program ismi gerekli"); return; }
    const program: IAiWorkout = {
      program_name: name,
      motivation: "Kendi hedeflerin, kendi kuralların.",
      nutrition_targets: { calories: 2000, protein: 150, carbs: 200, fats: 60 }, // Varsayılanlar
      daily_commands: ["Bol su iç", "Isınmayı unutma"],
      schedule: days
    };
    onSave(program);
    toast.success("Program oluşturuldu!");
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 animate-in zoom-in-95 duration-300">
      <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4">
        <h2 className="text-xl font-bold text-white">Özel Program Oluştur</h2>
        <button onClick={onCancel} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400"><X size={20} /></button>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">Program İsmi</label>
          <input
            value={name} onChange={e => setName(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
            placeholder="Örn: 5x5 Güç Programı"
          />
        </div>

        <div className="space-y-4">
          {days.map((day, dIdx) => (
            <div key={dIdx} className="bg-zinc-950/50 border border-zinc-800 rounded-xl p-4">
              <div className="flex justify-between items-center mb-3">
                <input
                  value={day.day} onChange={e => updateDayName(dIdx, e.target.value)}
                  className="bg-transparent text-emerald-400 font-bold focus:outline-none border-b border-dashed border-zinc-700 focus:border-emerald-500"
                />
                <button onClick={() => removeDay(dIdx)} className="text-red-500/50 hover:text-red-500"><Trash2 size={16} /></button>
              </div>

              <div className="space-y-2 pl-2 border-l-2 border-zinc-800">
                {day.exercises.map((ex, exIdx) => (
                  <div key={exIdx} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-5">
                      <input
                        value={ex.name} onChange={e => updateExercise(dIdx, exIdx, 'name', e.target.value)}
                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded px-2 py-1 text-xs text-white"
                        placeholder="Hareket İsmi"
                      />
                    </div>
                    <div className="col-span-3 flex items-center gap-1">
                      <input
                        value={ex.sets} onChange={e => updateExercise(dIdx, exIdx, 'sets', e.target.value)}
                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded px-2 py-1 text-xs text-white text-center"
                        placeholder="Set"
                      />
                      <span className="text-zinc-600 text-[10px]">x</span>
                    </div>
                    <div className="col-span-3">
                      <input
                        value={ex.reps} onChange={e => updateExercise(dIdx, exIdx, 'reps', e.target.value)}
                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded px-2 py-1 text-xs text-white text-center"
                        placeholder="Tekrar"
                      />
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <button onClick={() => removeExercise(dIdx, exIdx)} className="text-zinc-600 hover:text-red-400"><X size={14} /></button>
                    </div>
                  </div>
                ))}
                <button onClick={() => addExercise(dIdx)} className="mt-2 text-xs text-blue-400 flex items-center gap-1 hover:underline">
                  <Plus size={12} /> Egzersiz Ekle
                </button>
              </div>
            </div>
          ))}
          <button onClick={addDay} className="w-full py-3 border border-dashed border-zinc-700 rounded-xl text-zinc-500 hover:text-zinc-300 hover:border-zinc-500 transition-colors flex items-center justify-center gap-2">
            <Plus size={16} /> Gün Ekle
          </button>
        </div>

        <div className="flex gap-4 pt-4 border-t border-zinc-800">
          <button onClick={onCancel} className="flex-1 py-3 text-zinc-400 font-medium hover:text-white transition-colors">Vazgeç</button>
          <button onClick={handleSave} className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 rounded-xl transition-colors shadow-lg shadow-emerald-500/20">Programı Kaydet</button>
        </div>
      </div>
    </div>
  )
}


// 2. Updated Exercise Item (Progressive Overload)
function ExerciseItem({ exercise, day, lastLog, onSave }: { exercise: IExercisesItem, day: string, lastLog: any, onSave: (d: string, e: string, r: string, s: string, w: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [userReps, setUserReps] = useState(exercise.reps || "");
  const [userSets, setUserSets] = useState(exercise.sets || "");
  const [userWeight, setUserWeight] = useState(exercise.weight || "");

  const handleSave = () => {
    if (!userReps || !userSets) {
      toast.error("Set ve tekrar zorunludur.");
      return;
    };

    onSave(day, exercise.name, userReps, userSets, userWeight);
    toast.success("Kayıt başarılı!", { position: 'bottom-right' });
    setIsOpen(false);
  };

  return (
    <div className={`group transition-all duration-300 ${isOpen ? 'bg-zinc-900/80 -mx-4 px-4 py-4 rounded-xl border border-emerald-500/20 shadow-lg relative z-10 my-2' : 'py-3 hover:bg-zinc-900/30 -mx-4 px-4'}`}>

      {/* Main Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer" onClick={() => !isOpen && setIsOpen(true)}>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={`text-base font-medium truncate ${isOpen ? 'text-emerald-400' : 'text-zinc-200'}`}>
              {exercise.name}
            </h4>
          </div>

          {/* PROGRESSIVE OVERLOAD INDICATOR */}
          <div className="flex items-center gap-3 text-xs">
            {lastLog ? (
              <div className="flex items-center gap-1.5 text-zinc-500 bg-zinc-950/50 px-2 py-1 rounded border border-zinc-800/50">
                <History size={12} className="text-blue-400" />
                <span>Son:</span>
                <span className="font-mono text-zinc-300">{lastLog.note}</span>
              </div>
            ) : (
              <div className="text-zinc-600 italic">İlk kez yapılıyor</div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          {/* Target Pill */}
          <div className="text-center">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-0.5">Hedef</div>
            <div className="font-mono text-sm text-zinc-300 bg-zinc-950 px-2 py-1 rounded border border-zinc-800">
              {exercise.sets}x{exercise.reps}
            </div>
          </div>

          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isOpen ? 'bg-emerald-500 text-black rotate-90' : 'bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700'}`}>
            <ChevronDown size={18} className='transition-transform' />
          </div>
        </div>
      </div>

      {/* Expanded Input Area */}
      {isOpen && (
        <div className="mt-4 pt-4 border-t border-zinc-800 animate-in slide-in-from-top-2">
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Set</label>
              <input type="number" value={userSets} onChange={e => setUserSets(e.target.value)} className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-emerald-500 focus:outline-none transition-colors" placeholder={exercise.sets} />
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Tekrar</label>
              <input type="number" value={userReps} onChange={e => setUserReps(e.target.value)} className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-emerald-500 focus:outline-none transition-colors" placeholder={exercise.reps} />
            </div>
            <div>
              <label className="text-xs text-emerald-500 font-medium mb-1 block">Ağırlık (kg)</label>
              <input type="number" value={userWeight} onChange={e => setUserWeight(e.target.value)} className="w-full bg-zinc-950 border border-emerald-500/30 rounded-lg px-3 py-2 text-white focus:border-emerald-500 focus:outline-none transition-colors" placeholder="kg?" autoFocus />
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setIsOpen(false)} className="flex-1 py-2.5 text-zinc-400 hover:text-white transition-colors text-sm">İptal</button>
            <button onClick={handleSave} className="flex-[2] bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors">
              <Check size={18} /> Kaydet ve Bitir
            </button>
          </div>
        </div>
      )}
    </div>
  );
}