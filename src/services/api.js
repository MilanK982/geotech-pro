// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

function getCsrfToken() {
  const name = 'csrftoken';
  const cookieValue = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))
    ?.split('=')[1];
  return cookieValue || '';
}

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
  try {
    const response = await api.get(`/geotech/get_layers/${modelId}/`);
    console.log('Fetched data:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching layers:', error);
    throw error;
  }
}

export async function saveLayers(modelId, data) {
  try {
    const response = await api.post(`/geotech/save_layers/${modelId}/`, data);
    console.log('Saved layers:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error saving layers:', error);
    throw error;
  }
}

export async function saveCpt(modelId, data) {
  try {
    const response = await api.post(`/geotech/save_cpt/${modelId}/`, data);
    console.log('Saved CPT:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error saving CPT:', error);
    throw error;
  }
}