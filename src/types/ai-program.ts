export interface IAiWorkout {
    program_name: string;
    motivation: string;
    nutrition_targets: INutritionTargets;
    daily_commands: string[];
    schedule: IScheduleItem[];
}

export interface IScheduleItem {
    day: string;
    exercises: IExercisesItem[];
}

export interface IExercisesItem {
    name: string;
    sets: string;
    reps: string;
    weight?: string;
    target_sets?: string;
    target_reps?: string;
}

export interface INutritionTargets {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
}

export interface IAiNutrition {
    food_name: string;
    calories: number;
    protein: number;
    carbs: number;
    sugar: number;
    fat: number;
    health_tip: string;
    calories_per_100g: number;
    period: string;
}
export interface IMeal {
    filter(arg0: (meal: { date: string | number | Date; }) => boolean): unknown;
    _id: string;
    food_name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    date: string;
    period: string;
}