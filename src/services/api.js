// src/services/api.js
import axios from 'axios';

// Kreiraj Axios instancu sa osnovnim URL-om
const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Funkcija za dohvatanje CSRF tokena iz cookies-a
function getCsrfToken() {
  const name = 'csrftoken';
  const cookieValue = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))
    ?.split('=')[1];
  return cookieValue || '';
}

// Interceptor za dodavanje CSRF tokena u POST zahteve
api.interceptors.request.use((config) => {
  if (!config.url.endsWith('/login/')) {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Token ${token}`;
    }
  }
  return config;
});

export async function login(username, password) {
  const response = await api.post('/geotech/login/', { username, password });
  return response.data;
}

export async function fetchLayers(modelId) {
  const response = await api.get(`/geotech/get_layers/${modelId}/`);
  return response.data;
}

export async function saveLayers(modelId, data) {
  const response = await api.post(`/geotech/model_detail/${modelId}/`, data);
  return response.data;
}

export async function saveCpt(modelId, data) {
  const response = await api.post(`/geotech/model_detail/${modelId}/`, data);
  return response.data;
}