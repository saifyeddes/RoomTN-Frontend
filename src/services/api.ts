// src/services/api.ts
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const API_URL = API_BASE_URL;
export const ASSETS_BASE = API_URL.replace(/\/?api\/?$/, '');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT aux requêtes
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Si non autorisé, déconnecter l'utilisateur
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      window.location.href = '/admin';
    }
    return Promise.reject(error);
  }
);

export const auth = {
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
};

export const adminStats = {
  get: async () => {
    const res = await api.get('/admin/stats');
    return res.data as { ordersCount: number; productsCount: number; totalRevenue: number };
  },
};

export const orders = {
  create: async (payload: {
    user_email: string;
    user_full_name: string;
    items: Array<{ product_id: string; name: string; size: string; color: string; quantity: number; price: number }>;
    shipping_address: string;
    phone: string;
  }) => {
    const res = await api.post('/orders', payload);
    return res.data;
  },
  list: async () => {
    const res = await api.get('/orders');
    return res.data;
  },
  approve: async (id: string) => {
    const res = await api.post(`/orders/${id}/approve`);
    return res.data;
  },
  reject: async (id: string) => {
    const res = await api.post(`/orders/${id}/reject`);
    return res.data;
  },
  pdfUrl: (id: string) => `${API_URL}/orders/${id}/pdf`,
  downloadPdf: async (id: string) => {
    const res = await api.get(`/orders/${id}/pdf`, { responseType: 'blob' });
    return res.data as Blob;
  },
  delete: async (id: string) => {
    const res = await api.delete(`/orders/${id}`);
    return res.data;
  },
};

export const products = {
  getAll: async (params?: Record<string, unknown>) => {
    const res = await api.get('/products', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await api.get(`/products/${id}`);
    return res.data;
  },
  getBest: async (limit?: number) => {
    const res = await api.get('/products/best', { params: { limit } });
    return res.data;
  },
  create: async (formData: FormData) => {
    const res = await api.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  update: async (id: string, formData: FormData) => {
    const res = await api.put(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  delete: async (id: string) => {
    const res = await api.delete(`/products/${id}`);
    return res.data;
  },
};

export const adminUsers = {
  list: async () => {
    const res = await api.get('/admin/users');
    return res.data;
  },
  create: async (payload: { full_name: string; email: string; password?: string; role?: 'admin' | 'super_admin' }) => {
    const res = await api.post('/admin/users', payload);
    return res.data;
  },
  update: async (id: string, payload: Partial<{ full_name: string; email: string; role: 'admin' | 'super_admin'; isApproved: boolean }>) => {
    const res = await api.put(`/admin/users/${id}`, payload);
    return res.data;
  },
  approve: async (id: string) => {
    const res = await api.post(`/admin/users/${id}/approve`);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await api.delete(`/admin/users/${id}`);
    return res.data;
  },
};

export default api;