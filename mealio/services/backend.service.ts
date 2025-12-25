import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'http://localhost:5001/api';

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

  // Posts
  getPosts: () => api.get('/posts'),
  createPost: (data: any) => api.post('/posts', data),
  toggleFavorite: (id: string) => api.post(`/posts/favorite/${id}`),
};
