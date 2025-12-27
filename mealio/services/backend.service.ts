import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { MealPlan } from '../types/mealPlan';
import { FoodEntry } from '../types/calorie';

// Pointing to local backend for testing search feature
const API_URL ='https://mealioo.vercel.app/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('token');
  if (token) {
    config.headers['x-auth-token'] = token;
  }
  return config;
});

export const backendService = {
  // Auth
  login: (data: any) => api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  updateProfile: (data: any) => api.put('/users/profile', data),

  // Posts
  getPosts: () => api.get('/posts'),
  createPost: (data: any) => api.post('/posts', data),
  toggleFavorite: (id: string) => api.post(`/posts/favorite/${id}`),

  // Meal Plans
  createMealPlan: (data: Partial<MealPlan>) => api.post('/mealplans', data),
  getUserMealPlans: (userId: string, startDate?: string, endDate?: string) => {
    let url = `/mealplans/user/${userId}`;
    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }
    return api.get(url);
  },
  getMealPlanByDate: (userId: string, date: string) => 
    api.get(`/mealplans/user/${userId}/date/${date}`),
  getMealPlanById: (id: string) => api.get(`/mealplans/${id}`),
  updateMealPlan: (id: string, data: Partial<MealPlan>) => 
    api.put(`/mealplans/${id}`, data),
  deleteMealPlan: (id: string) => api.delete(`/mealplans/${id}`),
  completeMealPlan: (id: string) => api.patch(`/mealplans/${id}/complete`),

  // Calorie Tracking
  addFoodEntry: (data: Partial<FoodEntry>) => api.post('/calories', data),
  getFoodEntriesByDate: (userId: string, date: string) => 
    api.get(`/calories/user/${userId}/date/${date}`),
  getFoodEntriesSummary: (userId: string, startDate: string, endDate: string) =>
    api.get(`/calories/user/${userId}/summary?startDate=${startDate}&endDate=${endDate}`),
  searchByBarcode: (barcode: string) => api.get(`/calories/barcode/${barcode}`),
  searchFood: (query: string) => api.get(`/calories/search?query=${query}`),
  updateFoodEntry: (id: string, data: Partial<FoodEntry>) => 
    api.put(`/calories/${id}`, data),
  deleteFoodEntry: (id: string) => api.delete(`/calories/${id}`),

  // Community Foods
  createCommunityFood: (data: any) => api.post('/community-foods', data),
  getCommunityFoods: () => api.get('/community-foods'),
  searchCommunityFoods: (query: string) => api.get(`/community-foods/search?query=${query}`),
  rateCommunityFood: (id: string, rating: number) => api.post(`/community-foods/${id}/rate`, { rating }),
  commentCommunityFood: (id: string, text: string) => api.post(`/community-foods/${id}/comment`, { text }),
};
