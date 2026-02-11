import { Calendar as CalendarIcon, Component, Flame, Trash2 } from 'lucide-react';
import { type IMeal, type IAiWorkout } from '../types/ai-program';
import { useEffect, useRef } from 'react';
import { useAuth } from '../context/UserContext';
import { useNutritionStore } from '../store/useNutritionStore';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import Calendar from '../components/Calendar';
import { isSameDay, format } from 'date-fns';

// --- BİLEŞENLER (Değişiklik Yok) ---

// 1. MealCard
function MealCard({ meal, index, aiProgram }: { meal: IMeal; index: number, aiProgram: IAiWorkout | null }) {
  let formattedDate = "";
  try {
    formattedDate = new Date(meal.date).toLocaleDateString('tr-TR', {
      day: 'numeric', month: 'short'
    });
  } catch (e) {
    formattedDate = "Tarih Hatası";
  }

  const { deleteMeal } = useNutritionStore();
  const { user } = useAuth();

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (meal._id && user?.email) {
      if (window.confirm("Bu yemeği silmek istediğinize emin misiniz?")) {
        deleteMeal(meal._id, user.email);
      }
    }
  };

  return (
    <Draggable draggableId={meal._id || `meal-${index}`} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex flex-col gap-3 transition-colors hover:bg-zinc-800/50 mb-3 shadow-sm group"
          style={{ ...provided.draggableProps.style }}
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h4 className="font-bold text-zinc-200 text-base capitalize line-clamp-1">{meal.food_name}</h4>
              <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
                <CalendarIcon size={10} />
                {formattedDate}
              </div>
            </div>
            <button
              onClick={handleDelete}
              className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-rose-500 transition-all p-1"
              title="Yemeği Sil"
            >
              <Trash2 size={16} />
            </button>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-zinc-800/50">
            <div className="flex items-center gap-1 text-emerald-400 font-bold">
              <Flame size={14} fill="currentColor" className="opacity-50" />
              {meal.calories} <span className="text-[9px] uppercase text-zinc-600 tracking-wider">kcal</span>
            </div>

            <div className="flex gap-2 font-medium">
              <span className="text-blue-400">{meal.protein}p</span>
              <span className="text-yellow-400">{meal.carbs}c</span>
              <span className="text-purple-400">{meal.fat}f</span>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}

// 2. MealColumn
function MealColumn({ title, meals, periodId, aiProgram, }: { title: string; meals: IMeal[]; periodId: string, aiProgram: IAiWorkout | null }) {
  return (
    <div className="flex flex-col bg-zinc-950/50 rounded-2xl border border-zinc-900 min-h-[120px] lg:min-h-[200px] w-full">
      <div className="p-4 border-b border-zinc-900 flex justify-between items-center">
        <h3 className="font-bold text-zinc-300 text-sm">{title}</h3>
        <span className="bg-zinc-900 text-zinc-500 text-xs px-2 py-0.5 rounded-full font-mono">
          {meals.length}
        </span>
      </div>

      <Droppable droppableId={periodId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 p-2 transition-colors duration-200 rounded-b-2xl ${snapshot.isDraggingOver ? 'bg-zinc-900/30 ring-1 ring-inset ring-emerald-500/20' : ''
              }`}
          >
            {meals.map((meal, index) => (
              <MealCard key={meal._id || index} meal={meal} index={index} aiProgram={aiProgram} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}

const PERIODS = ['Kahvaltı', 'Öğle Yemeği', 'Akşam Yemeği', 'Ara Öğün'];

// --- ANA BİLEŞEN ---
export default function NutritionView() {
  const user = useAuth();

  // Store'dan sadece gerekli olanları çekiyoruz.
  // Artık 'setMeals'e ihtiyacımız yok, çünkü updateMealPeriod her şeyi hallediyor.
  const {
    meals,
    loading,
    selectedDate,
    aiProgram,
    setSelectedDate,
    fetchMeals,
    fetchProgram,
    updateMealPeriod
  } = useNutritionStore();

  const dropRef = useRef<HTMLDivElement>(null);

  // Günlük Kalori Hesabı
  const dailyCalories: Record<string, number> = {};
  meals.forEach(meal => {
    try {
      const dateKey = format(new Date(meal.date), 'yyyy-MM-dd');
      dailyCalories[dateKey] = (dailyCalories[dateKey] || 0) + (meal.calories || 0);
    } catch (e) {
      // Hata yut
    }
  });

  // İlk Yükleme
  useEffect(() => {
    if (user?.user?.email) {
      fetchMeals(user.user.email);
      fetchProgram(user.user.email);
    }
  }, [user?.user?.email]);

  // Tarih Seçince Scroll Efekti
  useEffect(() => {
    if (selectedDate && dropRef.current) {
      setTimeout(() => {
        dropRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }
  }, [selectedDate]);

  // Filtreleme
  const filteredMeals = meals.filter(meal =>
    selectedDate && isSameDay(new Date(meal.date), selectedDate)
  );

  const getMealsByPeriod = (period: string) => {
    return filteredMeals.filter((meal) => {
      const p1 = (meal.period || 'Kahvaltı').toLowerCase();
      const p2 = period.toLowerCase();
      return p1 === p2;
    });
  };

  // --- DRAG END MANTIĞI (SADELEŞTİRİLMİŞ) ---
  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    // 1. Geçersiz durumları ele
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;

    // 2. STORE ACTION ÇAĞIR
    // Tüm mantık (optimistic update, api isteği, hata yönetimi) artık store içinde.
    // Component sadece emri verir.
    if (user?.user?.email) {
      await updateMealPeriod(draggableId, destination.droppableId, user.user.email);
    }
  };

  if (loading) return <div className="text-zinc-500 text-sm text-center mt-10">Yükleniyor...</div>;

  return (
    <div style={{ width: '100%', maxWidth: '100vw', overflowX: 'hidden', boxSizing: 'border-box' }} className="max-w-7xl mx-auto mt-6 px-4 lg:px-8 pb-12 space-y-4 lg:space-y-6">
      {/* Üst Kısım: Takvim */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-zinc-100 text-center mb-6">Yemek Planı</h3>
        <Calendar
          selected={selectedDate}
          onSelect={setSelectedDate}
          daysWithMeals={Object.keys(dailyCalories).map(d => new Date(d))}
          dailyCalories={dailyCalories}
        />
      </div>

      {/* Başlık ve Toplam Kalori */}
      <div className="flex items-center justify-between mb-6 px-1">
        <h4 className="text-lg font-semibold text-zinc-200">
          {selectedDate?.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' })}
        </h4>
        <div className="text-zinc-500 text-xs flex gap-2 font-mono bg-zinc-900/50 px-3 py-1.5 rounded-lg border border-zinc-800">
          <span className="text-emerald-400 font-bold">
            {selectedDate && dailyCalories[format(selectedDate, 'yyyy-MM-dd')]
              ? dailyCalories[format(selectedDate, 'yyyy-MM-dd')]
              : 0} kcal
          </span>
          <span className="opacity-50">|</span>
          <span>Sürükle & Bırak</span>
        </div>
      </div>

      {/* Kolonlar */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div ref={dropRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 scroll-mt-24">
          {PERIODS.map((period) => (
            <MealColumn
              key={period}
              title={period}
              periodId={period}
              meals={getMealsByPeriod(period)}
              aiProgram={aiProgram || null}
            />
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}