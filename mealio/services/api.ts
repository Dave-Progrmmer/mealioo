import { CategoryResponse, Meal, MealResponse } from '../types/meal';

const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

export const api = {
  fetchMealsByName: async (name: string): Promise<Meal[] | null> => {
    const response = await fetch(`${BASE_URL}/search.php?s=${name}`);
    const data: MealResponse = await response.json();
    return data.meals;
  },

  fetchMealsByFirstLetter: async (letter: string): Promise<Meal[] | null> => {
    const response = await fetch(`${BASE_URL}/search.php?f=${letter}`);
    const data: MealResponse = await response.json();
    return data.meals;
  },

  fetchMealById: async (id: string): Promise<Meal | null> => {
    const response = await fetch(`${BASE_URL}/lookup.php?i=${id}`);
    const data: MealResponse = await response.json();
    return data.meals ? data.meals[0] : null;
  },

  fetchRandomMeal: async (): Promise<Meal | null> => {
    const response = await fetch(`${BASE_URL}/random.php`);
    const data: MealResponse = await response.json();
    return data.meals ? data.meals[0] : null;
  },

  fetchCategories: async (): Promise<CategoryResponse> => {
    const response = await fetch(`${BASE_URL}/categories.php`);
    const data: CategoryResponse = await response.json();
    return data;
  },

  fetchMealsByCategory: async (category: string): Promise<Meal[] | null> => {
    const response = await fetch(`${BASE_URL}/filter.php?c=${category}`);
    const data: MealResponse = await response.json();
    return data.meals;
  },

  fetchMealsByIngredient: async (ingredient: string): Promise<Meal[] | null> => {
    const response = await fetch(`${BASE_URL}/filter.php?i=${ingredient}`);
    const data: MealResponse = await response.json();
    return data.meals;
  },

  fetchMealsByArea: async (area: string): Promise<Meal[] | null> => {
    const response = await fetch(`${BASE_URL}/filter.php?a=${area}`);
    const data: MealResponse = await response.json();
    return data.meals;
  },
};
