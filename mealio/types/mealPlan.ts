import { Meal } from './meal';

export interface MealSlot {
  post?: {
    _id?: string;
    title?: string;
    content?: string;
    image?: string;
    ingredients?: string[];
    instructions?: string[];
    category?: string;
  };
  mealId?: string; // Reference to TheMealDB meal id
  mealData?: Meal; // Full meal data from TheMealDB
  notes?: string;
}

export interface MealPlanMeals {
  breakfast: MealSlot;
  lunch: MealSlot;
  dinner: MealSlot;
  snacks: MealSlot[];
}

export interface MealPlan {
  _id?: string;
  user: string;
  date: string;
  meals: MealPlanMeals;
  completed: boolean;
  totalCalories: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface DayPlan {
  date: Date;
  dateString: string;
  dayName: string;
  dayNumber: number;
  isToday: boolean;
  mealPlan?: MealPlan;
}
