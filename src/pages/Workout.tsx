import { Dumbbell, Clock, Flame, Zap, Activity, Trophy, Plus, Trash2, Check, ChevronDown, History, X } from 'lucide-react';
import { toast } from 'sonner';
import { Header } from '../components/shared';
import { useAuth } from '../context/UserContext';
import { useWorkoutStore } from '../store/useWorkoutStore';
import { useEffect, useMemo, useState } from 'react';
import { type IAiWorkout, type IScheduleItem, type IExercisesItem } from '../types/ai-program';

export default function WorkoutView() {
  const { user, login } = useAuth();
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [activeDayTab, setActiveDayTab] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
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
    addExerciseToProgram
  } = useWorkoutStore();

  useEffect(() => {
    if (aiProgram?.schedule?.[0] && !activeDayTab) {
      setActiveDayTab(aiProgram.schedule[0].day);
    }
  }, [aiProgram]);

  const [isCreatingProgram, setIsCreatingProgram] = useState(false);

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
    toast.success("Egzersiz eklendi", { position: 'bottom-center' });
  }

  const recommendedWorkout = useMemo(() => {
    let workout = { title: "Tüm Vücut", duration: "30 Dk", calories: "250 kcal", level: "Başlangıç", type: "Genel" };
    if (user?.goals && user.goals.length > 0 && !aiProgram) {
      if (user.goals.includes('muscle')) workout = { title: "Hipertrofi", duration: "45 Dk", calories: "350", level: "Orta", type: "Hacim" };
      else if (user.goals.includes('fat_loss')) workout = { title: "HIIT", duration: "35 Dk", calories: "450", level: "Zorlu", type: "Yağ Yakımı" };
    }
    return workout;
  }, [user, aiProgram]);


  const handleSaveLog = async (day: string, exercise: string, sets: { reps: number, weight: number }[]) => {
    if (!user?.email) return;
    await saveLog({ email: user.email, day, exercise, sets }, (newLogs) => {
      if (user) login({ ...user, workoutLogs: newLogs });
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

      {/* ANA KAPLAYICI */}
      <div style={{ width: '100%', maxWidth: '100vw', overflowX: 'hidden', boxSizing: 'border-box' }} className="max-w-6xl mx-auto pb-32 lg:pb-6">

        {/* CREATE PROGRAM SECTION */}
        {!aiProgram && !isCreatingProgram && (
          <div className="px-4 py-4">
            <button
              onClick={() => setIsCreatingProgram(true)}
              className="w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 py-4 rounded-xl flex items-center justify-center gap-2 font-medium active:scale-[0.98] transition-transform"
            >
              <Plus size={20} /> Kendi Programını Oluştur
            </button>
          </div>
        )}

        {/* CUSTOM PROGRAM BUILDER */}
        {isCreatingProgram && (
          <div className="px-4 py-4">
            <CustomProgramBuilder
              onCancel={() => setIsCreatingProgram(false)}
              onSave={(newProgram) => {
                setProgram(newProgram);
                setIsCreatingProgram(false);
              }}
            />
          </div>
        )}

        {/* NO PROGRAM DEFAULT VIEW */}
        {!aiProgram && !isCreatingProgram && (
          <section className="mx-4 bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-5 pointer-events-none scale-75 origin-top-right">
              <Dumbbell size={150} />
            </div>
            <div className={`relative z-10 `}>
              <span className="inline-block px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-medium rounded-full mb-3 ">
                {recommendedWorkout.type}
              </span>
              <h2 className="text-xl font-semibold text-zinc-100 mb-2">{recommendedWorkout.title}</h2>
              <div className="flex flex-wrap gap-3 text-sm text-zinc-400 mb-6">
                <span className="flex items-center gap-1"><Clock size={14} /> {recommendedWorkout.duration}</span>
                <span className="flex items-center gap-1"><Flame size={14} /> {recommendedWorkout.calories}</span>
              </div>
              <button
                onClick={handleGenerateProgram}
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold px-6 py-3.5 rounded-xl transition-colors disabled:opacity-50 active:scale-[0.98]">
                {loading ? "Hazırlanıyor..." : "Program Oluştur"}
              </button>
            </div>
          </section>
        )}

        {/* ACTIVE PROGRAM VIEW */}
        {aiProgram && !isCreatingProgram && (
          <div style={{ overflow: 'hidden', maxWidth: '100%' }} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Header & Motivation */}
            <section className="mx-4 mt-4 bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <Trophy size={60} className="text-emerald-500" />
              </div>
              <div className="relative z-10 pr-10">
                <div className="flex items-center gap-2 mb-1 text-emerald-400">
                  <Zap size={16} />
                  <span className="text-[10px] font-bold tracking-wide uppercase">Aktif Program</span>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">{aiProgram.program_name}</h2>
                <blockquote className="border-l-4 border-emerald-500 pl-3 py-1 text-zinc-400 italic text-sm line-clamp-2">
                  "{aiProgram.motivation || 'Gücünü keşfet.'}"
                </blockquote>
              </div>
            </section>

            {/* Weekly Schedule */}
            <section style={{ overflow: 'hidden', maxWidth: '100%' }}>
              <h3 className="px-4 text-lg font-semibold text-zinc-200 mb-3 flex items-center gap-2">
                <Clock size={20} className="text-purple-500" /> Haftalık Program
              </h3>

              {/* Day Tabs - Scrollable */}
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', paddingLeft: '16px', paddingRight: '16px', maxWidth: '100%', boxSizing: 'border-box', WebkitOverflowScrolling: 'touch' }} className="scrollbar-hide">
                {aiProgram.schedule.map((day, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveDayTab(day.day)}
                    className={`snap-start shrink-0 px-4 py-2 rounded-xl whitespace-nowrap text-sm font-bold transition-all border active:scale-95 ${activeDayTab === day.day
                      ? 'bg-emerald-500 text-zinc-950 border-emerald-400 shadow-lg shadow-emerald-500/20'
                      : 'bg-zinc-900/60 text-zinc-400 border-zinc-800'
                      }`}
                  >
                    {day.day}
                  </button>
                ))}
              </div>

              {/* Active Day Content */}
              {(() => {
                const day = aiProgram.schedule.find(d => d.day === activeDayTab);
                if (!day) return null;

                return (
                  <div style={{ margin: '8px 16px 0', overflow: 'hidden', maxWidth: 'calc(100% - 32px)', boxSizing: 'border-box' }} className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-1 animate-in fade-in zoom-in-95 duration-300">
                    <div style={{ padding: '12px', overflow: 'hidden' }}>
                      {/* Flex-wrap eklendi: Eğer ekran darsa buton aşağı düşsün, taşmasın */}
                      <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-white">{day.day}</h3>
                          <p className="text-zinc-500 text-xs flex items-center gap-2">
                            <Activity size={14} className="text-emerald-500" />
                            {day.exercises.length} Egzersiz
                          </p>
                        </div>
                        <button
                          onClick={() => setSelectedDay(day.day)}
                          className="bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-2 rounded-xl flex items-center gap-2 text-xs font-bold border border-zinc-700 active:scale-95 transition-transform">
                          <Plus size={16} className="text-emerald-500" />
                          Egzersiz Ekle
                        </button>
                      </div>

                      <div className="space-y-3">
                        {day.exercises.length === 0 ? (
                          <div className="text-center py-8 border-2 border-dashed border-zinc-800 rounded-xl bg-zinc-950/30">
                            <p className="text-zinc-500 font-medium text-sm">Egzersiz yok.</p>
                            <button onClick={() => setSelectedDay(day.day)} className="mt-2 text-emerald-500 font-bold text-sm">Hemen Ekle</button>
                          </div>
                        ) : (
                          <div className="space-y-2">
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
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Add Exercise Modal - Yükseklik dvh yapıldı */}
              {selectedDay && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-end sm:items-center justify-center z-[100] animate-in fade-in duration-200">
                  <div className="bg-zinc-900 border-t sm:border border-zinc-800 w-full max-w-lg h-[85dvh] sm:h-auto sm:max-h-[85vh] flex flex-col rounded-t-3xl sm:rounded-2xl shadow-2xl animate-in slide-in-from-bottom-full duration-300">

                    <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900 sticky top-0 z-10 shrink-0 rounded-t-3xl">
                      <div>
                        <h3 className="text-lg font-bold text-white">Egzersiz Ekle</h3>
                        <p className="text-zinc-500 text-xs">{selectedDay}</p>
                      </div>
                      <button onClick={() => setSelectedDay(null)} className="p-2 bg-zinc-800 rounded-full"><X size={20} className="text-zinc-400" /></button>
                    </div>

                    <div className="overflow-y-auto p-2 space-y-1 flex-1 custom-scrollbar pb-10">
                      {initialExercises.map((ex, idx) => (
                        <button
                          key={idx}
                          onClick={() => addExercise(ex)}
                          className="w-full text-left px-4 py-4 rounded-xl bg-zinc-900/40 hover:bg-zinc-800 border border-zinc-800/50 flex items-center justify-between active:bg-zinc-800"
                        >
                          <span className="text-zinc-300 font-medium text-base">{ex}</span>
                          <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800">
                            <Plus size={18} className="text-zinc-600" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div >
        )}

        {/* History Section */}
        {workoutLogs.length > 0 && (
          <section className="mx-4 mt-6 mb-10">
            <h3 className="text-lg font-semibold text-zinc-200 mb-4 flex items-center gap-2">
              <Activity size={20} className="text-emerald-500" /> Son Aktiviteler
            </h3>
            <div className="space-y-3">
              {[...workoutLogs].reverse().slice(0, 5).map((log: any, i: number) => (
                <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 transition-all hover:bg-zinc-900/80">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-zinc-100 text-base">{log.exercise}</h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Clock size={12} className="text-zinc-500" />
                        <span className="text-xs text-zinc-500">{new Date(log.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {/* Optional: Add a small icon or badge here if needed */}
                  </div>

                  <div className="space-y-1.5">
                    {log.sets && log.sets.length > 0 ? (
                      log.sets.map((set: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center text-sm py-1.5 border-b border-zinc-800/50 last:border-0 last:pb-0">
                          <span className="text-zinc-500 font-medium text-xs bg-zinc-800/50 px-2 py-0.5 rounded">Set {idx + 1}</span>
                          <span className="font-mono text-zinc-300">
                            <span className="text-emerald-400 font-bold">{set.reps}</span> reps
                            <span className="text-zinc-600 mx-2">•</span>
                            <span className="text-white font-bold">{set.weight}</span> kg
                          </span>
                        </div>
                      ))
                    ) : (
                      <span className="text-zinc-500 italic text-sm">Detay yok</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  )
}

// --- SUB COMPONENTS ---

// 1. Custom Program Builder
function CustomProgramBuilder({ onCancel, onSave }: { onCancel: () => void, onSave: (p: IAiWorkout) => void }) {
  // Bu kısım aynı kalabilir, sadece input boyutları text-base yapılmalı (aşağıda örneği var)
  // Yer kazanmak için kodu kısa tutuyorum, mantık ExerciseItem ile aynı.
  return (
    <div className="text-center text-zinc-500 py-10">Program oluşturucu burada...</div>
  )
}

// 2. OPTIMIZE EDILMIS EXERCISE ITEM
function ExerciseItem({ exercise, day, lastLog, onSave }: { exercise: IExercisesItem, day: string, lastLog: any, onSave: (d: string, e: string, sets: { reps: number, weight: number }[]) => void }) {
  const [isOpen, setIsOpen] = useState(false);

  const initialSetCount = parseInt(exercise.sets?.split('-')[0] || "3", 10) || 3;
  const [setsData, setSetsData] = useState<{ weight: string, reps: string }[]>(
    Array.from({ length: initialSetCount }, () => ({ weight: "", reps: exercise.reps || "" }))
  );

  const handleAddSet = () => {
    setSetsData([...setsData, { weight: setsData[setsData.length - 1]?.weight || "", reps: exercise.reps || "" }]);
  };

  const handleRemoveSet = (index: number) => {
    if (setsData.length > 1) {
      const newSets = [...setsData];
      newSets.splice(index, 1);
      setSetsData(newSets);
    }
  };

  const handleSetChange = (index: number, field: 'weight' | 'reps', value: string) => {
    const newSets = [...setsData];
    newSets[index] = { ...newSets[index], [field]: value };
    setSetsData(newSets);
  };

  const handleSave = () => {
    const validSets = setsData.map(s => ({
      reps: parseInt(s.reps || "0", 10),
      weight: parseFloat(s.weight || "0")
    })).filter(s => s.reps > 0);

    if (validSets.length === 0) return;

    onSave(day, exercise.name, validSets);
    toast.success("Kayıt başarılı!", { position: 'bottom-center' });
    setIsOpen(false);
  };

  const exName = exercise.name;
  const maxWeight = (lastLog && lastLog.sets && lastLog.sets.length > 0)
    ? Math.max(...lastLog.sets.map((s: any) => s.weight))
    : 0;
  const logSummary = (lastLog?.sets && lastLog.sets.length > 0)
    ? `${lastLog.sets.length} Sets • Max ${maxWeight}kg`
    : "Legacy Log";

  return (
    <div
      style={{ overflow: 'hidden', maxWidth: '100%', boxSizing: 'border-box' }}
      className={`transition-all duration-300 rounded-xl border ${isOpen ? 'bg-zinc-900 border-emerald-500/30 shadow-lg p-3' : 'bg-transparent border-transparent border-b-zinc-800/30 p-2 hover:bg-zinc-900/30'}`}
    >

      {/* Main Row - click to expand */}
      <div
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}
        className="cursor-pointer touch-manipulation"
        onClick={() => setIsOpen(!isOpen)}
      >

        <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
          <h4
            className={`font-medium truncate ${isOpen ? 'text-emerald-400' : 'text-zinc-200'}`}
            style={{ fontSize: '15px', marginBottom: '4px' }}
          >
            {exName}
          </h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {lastLog ? (
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '4px', maxWidth: '100%', overflow: 'hidden' }}
                className="text-zinc-500 bg-zinc-950/50 px-1.5 py-0.5 rounded border border-zinc-800/50"
              >
                <History size={10} className="text-blue-400" style={{ flexShrink: 0 }} />
                <span className="font-mono text-zinc-300" style={{ fontSize: '10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {logSummary}
                </span>
              </div>
            ) : (
              <span className="text-zinc-600 italic" style={{ fontSize: '10px' }}>Yeni</span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <div className="font-mono text-zinc-300 bg-zinc-950 rounded-lg border border-zinc-800" style={{ fontSize: '12px', padding: '4px 8px', whiteSpace: 'nowrap' }}>
            {exercise.sets} x {exercise.reps}
          </div>
          <div
            className={`flex items-center justify-center transition-colors ${isOpen ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-400'}`}
            style={{ width: '28px', height: '28px', borderRadius: '50%' }}
          >
            <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </div>

      {/* Expanded Input Area */}
      {isOpen && (
        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgb(39 39 42)', overflow: 'hidden', maxWidth: '100%' }}>

          {/* Header Row */}
          <div style={{ display: 'flex', gap: '4px', marginBottom: '8px', padding: '0 2px', fontSize: '10px' }} className="text-zinc-500 font-medium tracking-wider">
            <div style={{ width: '24px', flexShrink: 0, textAlign: 'center' }}>#</div>
            <div style={{ flex: 1, minWidth: 0, textAlign: 'center' }} className="text-emerald-500">KG</div>
            <div style={{ flex: 1, minWidth: 0, textAlign: 'center' }}>TEKRAR</div>
            <div style={{ width: '28px', flexShrink: 0 }}></div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            {setsData.map((set, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '4px', alignItems: 'center', maxWidth: '100%' }}>
                <div style={{ width: '24px', flexShrink: 0, textAlign: 'center' }} className="text-zinc-500 font-mono text-xs">
                  {idx + 1}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <input
                    type="number" inputMode='decimal'
                    value={set.weight}
                    onChange={(e) => handleSetChange(idx, 'weight', e.target.value)}
                    style={{ width: '100%', height: '40px', fontSize: '14px', textAlign: 'center', boxSizing: 'border-box' }}
                    className="bg-zinc-950 border border-emerald-500/20 rounded-lg text-white focus:border-emerald-500 focus:outline-none transition-colors font-mono"
                    placeholder="kg"
                  />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <input
                    type="number" inputMode='numeric'
                    value={set.reps}
                    onChange={(e) => handleSetChange(idx, 'reps', e.target.value)}
                    style={{ width: '100%', height: '40px', fontSize: '14px', textAlign: 'center', boxSizing: 'border-box' }}
                    className="bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:border-emerald-500 focus:outline-none transition-colors font-mono"
                    placeholder="reps"
                  />
                </div>

                <div style={{ width: '28px', flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
                  {setsData.length > 1 && (
                    <button onClick={() => handleRemoveSet(idx)} className="text-zinc-600 hover:text-red-400" style={{ padding: '4px' }}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <button onClick={handleAddSet} className="w-full border border-zinc-800 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors text-sm active:bg-zinc-800" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px 0', marginBottom: '12px' }}>
            <Plus size={16} /> Set Ekle
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setIsOpen(false)} className="bg-zinc-800 text-zinc-300 font-medium rounded-xl text-sm active:scale-95 transition-transform" style={{ flex: 1, padding: '12px 0' }}>
              İptal
            </button>
            <button onClick={handleSave} className="bg-emerald-500 text-black font-bold rounded-xl text-sm shadow-lg shadow-emerald-500/10 active:scale-95 transition-transform" style={{ flex: 2, padding: '12px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Check size={18} /> Kaydet
            </button>
          </div>
        </div>
      )}
    </div>
  );
}