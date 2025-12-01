import axios from 'axios';

// 1. Pastikan URL mengarah ke Port 4000
// Kalau backend temanmu pakai /api/v1, gunakan itu.
const API = axios.create({
  baseURL: 'http://localhost:4000/api/v1', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Pasang Interceptor (Tukang Tempel Token Otomatis)
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    // STANDAR JWT: Harus pakai kata 'Bearer ' (dengan spasi)
    config.headers.Authorization = `Bearer ${token}`; 
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;