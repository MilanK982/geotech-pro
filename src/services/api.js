import axios from 'axios';

// Kreiraj Axios instancu sa osnovnim URL-om
const api = axios.create({
  baseURL: 'http://localhost:8000', // Prilagodi port ako Django koristi drugi (npr. 8000 je default)
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
  if (['post', 'put', 'delete'].includes(config.method)) {
    config.headers['X-CSRFToken'] = getCsrfToken();
  }
  return config;
});

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