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
    generateProgram: (user: any) => Promise<void>; // Using 'any' for user to avoid circular deps for now
    saveLog: (data: { email: string, day: string, exercise: string, reps: string, sets: string }, callback?: (logs: any[]) => void) => Promise<void>;
}

export const useWorkoutStore = create<WorkoutState>((set) => ({
    aiProgram: null,
    workoutLogs: [],
    loading: false,

    setAiProgram: (program) => set({ aiProgram: program }),
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
                    note: `${logData.sets} set, ${logData.reps} tekrar`
                }),
            });

            if (response.ok) {
                const data = await response.json();
                set({ workoutLogs: data.logs });
                if (callback) callback(data.logs);
                set({ workoutLogs: data.logs });
                if (callback) callback(data.logs);
                toast.success("Kaydedildi!");
            }
        } catch (error) {
            console.error("Kayıt hatası", error);
        }
    }
}));
