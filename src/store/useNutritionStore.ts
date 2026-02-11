import { create } from 'zustand';
import { toast } from 'sonner';
import { apiClient } from '../services/apiClient';
import { type IMeal, type IAiWorkout } from '../types/ai-program';

interface NutritionState {
    meals: IMeal[];
    loading: boolean;
    selectedDate: Date | undefined;
    aiProgram: IAiWorkout | null;

    // Actions
    setMeals: (meals: IMeal[]) => void;
    setLoading: (loading: boolean) => void;
    setSelectedDate: (date: Date | undefined) => void;
    setAiProgram: (program: IAiWorkout | null) => void;

    // fetchMeals artık isteğe bağlı ikinci parametre alıyor
    fetchMeals: (email: string, forceLoading?: boolean) => Promise<void>;
    fetchProgram: (email: string) => Promise<void>;

    // updateMealPeriod artık store içindeki state'i de güncelliyor
    updateMealPeriod: (mealId: string, newPeriod: string, email: string) => Promise<boolean>;
    deleteMeal: (mealId: string, email: string) => Promise<boolean>;
}

export const useNutritionStore = create<NutritionState>((set, get) => ({
    meals: [],
    loading: true,
    selectedDate: new Date(),
    aiProgram: null,

    setMeals: (meals) => set({ meals }),
    setLoading: (loading) => set({ loading }),
    setSelectedDate: (date) => set({ selectedDate: date }),
    setAiProgram: (program) => set({ aiProgram: program }),

    // DEĞİŞİKLİK 1: forceLoading parametresi eklendi (Varsayılan: true)
    fetchMeals: async (email, forceLoading = true) => {
        if (!email) return;
        try {
            // Eğer forceLoading false ise (arka plan güncellemesi), loading true yapılmaz.
            if (forceLoading) {
                set({ loading: true });
            }

            const data = await apiClient.get<any>(`/get-meals/${email}`);
            if (data.meals) {
                set({ meals: data.meals });
            }
        } catch (error) {
            console.error("Yemek geçmişi alınamadı", error);
        } finally {
            // Sadece yükleme başlatıldıysa durdurulur
            if (forceLoading) {
                set({ loading: false });
            }
        }
    },

    fetchProgram: async (email) => {
        if (!email) return;
        try {
            const data = await apiClient.get<any>(`/get-program/${email}`);
            if (data.message) {
                set({ aiProgram: null });
                return;
            }
            set({ aiProgram: data });
        } catch (error) {
            console.error("Program alınamadı:", error);
            set({ aiProgram: null });
        }
    },

    // DEĞİŞİKLİK 2: Optimistic Update (İyimser Güncelleme) buraya taşındı
    updateMealPeriod: async (mealId, newPeriod, email) => {
        // 1. Eski veriyi yedekle (Hata olursa geri dönmek için)
        const previousMeals = get().meals;

        // 2. Arayüzü ANINDA güncelle (Backend cevabını beklemeden)
        const updatedMeals = previousMeals.map(meal =>
            meal._id === mealId ? { ...meal, period: newPeriod } : meal
        );
        set({ meals: updatedMeals });

        try {
            // 3. Backend'e isteği at
            await apiClient.put('/update-meal-period', {
                mealId: mealId,
                period: newPeriod,
                email: email
            });

            return true;
        } catch (error) {
            console.error("Drag update error:", error);

            // 4. Hata olursa eski haline geri döndür (Rollback)
            set({ meals: previousMeals });
            toast.error("Değişiklik kaydedilemedi, geri alınıyor.");

            return false;
        }
    },

    deleteMeal: async (mealId, email) => {
        // 1. Eski veriyi yedekle
        const previousMeals = get().meals;

        // 2. Optimistic Update: Listeden çıkar
        const updatedMeals = previousMeals.filter(meal => meal._id !== mealId);
        set({ meals: updatedMeals });

        try {
            // 3. Backend İsteği
            await apiClient.delete('/delete-meal', { email, mealId });
            return true;

        } catch (error) {
            console.error("Delete meal error:", error);
            // 4. Rollback
            set({ meals: previousMeals });
            toast.error("Yemek silinemedi.");
            return false;
        }
    }
}));