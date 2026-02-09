import { create } from 'zustand';
import { toast } from 'sonner';
import { type IAiWorkout } from '../types/ai-program';

interface WorkoutState {
    aiProgram: IAiWorkout | null;
    workoutLogs: any[]; // Using any[] for now as per original code, should improve type later
    loading: boolean;

    setAiProgram: (program: IAiWorkout | null) => void;
    setWorkoutLogs: (logs: any[]) => void;
    setLoading: (loading: boolean) => void;

    fetchProgram: (email: string) => Promise<void>;
    setProgram: (program: IAiWorkout) => void;
    generateProgram: (user: any) => Promise<void>;
    saveLog: (data: { email: string, day: string, exercise: string, reps: string, sets: string, weight?: string }, callback?: (logs: any[]) => void) => Promise<void>;
    saveProgramToBackend: (email: string, program: IAiWorkout) => Promise<void>;
    addExerciseToProgram: (data: { email: string, day: string, exercises: any[] }) => Promise<void>;
}

export const useWorkoutStore = create<WorkoutState>((set) => ({
    aiProgram: null,
    workoutLogs: [],
    loading: false,

    setAiProgram: (program) => set({ aiProgram: program }),
    setProgram: (program) => set({ aiProgram: program }),
    setWorkoutLogs: (logs) => set({ workoutLogs: logs }),
    setLoading: (loading) => set({ loading }),

    fetchProgram: async (email) => {
        try {
            const response = await fetch(`http://localhost:5001/get-program/${email}`)
            const data = await response.json()
            if (!response.ok || data.message) {
                set({ aiProgram: null })
                return
            }
            set({ aiProgram: data })
        } catch (error) {
            console.error("Program alınamadı:", error);
        }
    },

    generateProgram: async (user) => {
        set({ loading: true });
        try {
            const response = await fetch('http://localhost:5001/generate-program', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    height: user.height || 175,
                    weight: user.weight || 75,
                    goals: user.goals || ["Genel"],
                    activityLevel: user.activityLevel || 3,
                    email: user.email
                }),
            });

            if (!response.ok) {
                throw new Error('Program oluşturulamadı');
            }

            const data = await response.json();
            set({ aiProgram: data.result });

        } catch (error) {
            console.error("AI Hatası:", error);
            toast.error("Program oluşturulurken bir hata oluştu.");
        } finally {
            set({ loading: false });
        }
    },

    saveLog: async (logData, callback) => {
        try {
            const response = await fetch('http://localhost:5001/save-log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: logData.email,
                    day: logData.day,
                    exercise: logData.exercise,
                    weight: logData.weight,
                    reps: logData.reps,
                    sets: logData.sets,
                    note: `${logData.sets} set, ${logData.reps} tekrar${logData.weight ? `, ${logData.weight}kg` : ''}`
                }),
            });

            if (response.ok) {
                const data = await response.json();
                set({ workoutLogs: data.logs });
                if (callback) callback(data.logs);
                toast.success("Kaydedildi!");
            }
        } catch (error) {
            console.error("Kayıt hatası", error);
        }
    },

    saveProgramToBackend: async (email: string, program: IAiWorkout) => {
        try {
            const response = await fetch('http://localhost:5001/save-program', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    program
                })
            });

            if (!response.ok) {
                throw new Error("Program kaydedilemedi");
            }

            // Başarılı olursa store'u güncelle (zaten güncel olabilir ama emin olalım)
            set({ aiProgram: program });
            toast.success("Program başarıyla kaydedildi!");

        } catch (error) {
            console.error("Program kayıt hatası:", error);
            toast.error("Program kaydedilirken bir hata oluştu.");
        }
    },

    addExerciseToProgram: async ({ email, day, exercises }) => {
        try {
            const response = await fetch('http://localhost:5001/program/add-exercise', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, day, exercises })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Egzersiz eklenemedi");
            }

            const data = await response.json();
            if (data.program) {
                set({ aiProgram: data.program });
                toast.success("Egzersiz başarıyla eklendi!");
            }
        } catch (error: any) {
            console.error("Add exercise error:", error);
            toast.error(error.message || "Egzersiz eklenirken bir hata oluştu.");
        }
    }
}));
