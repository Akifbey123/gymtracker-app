import { create } from 'zustand';
import { toast } from 'sonner';
import { apiClient } from '../services/apiClient';

// Define the shape of the User object (same as in UserContext)
export interface User {
    email: string;
    fullName: string;
    profilePhoto?: string;
    height?: number;
    weight?: number;
    bodyFat?: number;
    activityLevel?: number;
    goals?: string[];
    period?: string;
    filled?: boolean;
    workoutLogs?: {
        date: Date;
        day: string;
        exercise: string;
        note: string;
    }[];
    daily_stats?: {
        date: string;
        steps: number;
        calories: number;
        last_sync: Date;
    };
    program?: {
        protein: number;
        carbs: number;
        fats: number;
    }
}

interface UserState {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (userData: User) => void;
    logout: () => void;
    syncWithLocalStorage: () => void;

    syncFitnessData: () => Promise<void>;
    updateProfile: (formData: FormData) => Promise<boolean>;
}

export const useUserStore = create<UserState>((set, get) => ({
    user: null,
    isLoading: true,
    isAuthenticated: false,

    login: (userData) => {
        localStorage.setItem('currentUser', JSON.stringify(userData));
        set({ user: userData, isAuthenticated: true });
    },

    logout: () => {
        localStorage.removeItem('currentUser');
        set({ user: null, isAuthenticated: false });
    },

    syncWithLocalStorage: () => {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            set({ user, isAuthenticated: true, isLoading: false });
        } else {
            set({ user: null, isAuthenticated: false, isLoading: false });
        }
    },

    checkAuth: () => {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            set({ user: JSON.parse(storedUser), isAuthenticated: true, isLoading: false });
        } else {
            set({ isLoading: false, isAuthenticated: false });
        }
    },

    syncFitnessData: async () => {
        const currentUser = get().user;
        if (!currentUser?.email) return;

        try {
            const data = await apiClient.post<{ status: string, data: any }>('/sync-fitness-data', { email: currentUser.email });

            if (data.status === 'success') {
                const updatedUser = { ...currentUser, daily_stats: data.data };
                localStorage.setItem('currentUser', JSON.stringify(updatedUser)); // Update local storage
                set({ user: updatedUser });
            }
        } catch (error) {
            console.error("Sync error:", error);
            toast.error("Senkronizasyon başarısız ❌");
        }
    },

    updateProfile: async (formData: FormData) => {
        try {
            const data = await apiClient.post<{ user: User }>('/update-profile', formData);

            if (data.user) {
                const currentUser = get().user;
                const updatedUser = { ...currentUser, ...data.user };
                localStorage.setItem('currentUser', JSON.stringify(updatedUser)); // Update local storage
                set({ user: updatedUser });
                return true;
            }
            return false;
        } catch (error) {
            console.error("Profile update error:", error);
            return false;
        }
    }
}));
