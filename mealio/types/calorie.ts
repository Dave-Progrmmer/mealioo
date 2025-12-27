export interface FoodEntry {
  _id?: string;
  user: string;
  date: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  foodName: string;
  barcode?: string | null;
  brand?: string | null;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  imageUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface DailyNutrition {
  entries: FoodEntry[];
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
  };
  date: string;
}

export interface ScannedProduct {
  barcode: string;
  foodName: string;
  brand: string | null;
  imageUrl: string | null;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
}
