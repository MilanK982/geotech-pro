import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/geotech',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

function getCsrfToken() {
  const name = 'csrftoken'
  return document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))
    ?.split('=')[1] || ''
}

api.interceptors.request.use((config) => {
  if (config.method !== 'get' && !config.url.endsWith('/csrf/')) {
    config.headers['X-CSRFToken'] = getCsrfToken()
  }
  const user = JSON.parse(localStorage.getItem('user'))
  if (user?.token && !config.url.endsWith('/login/') && !config.url.endsWith('/register/')) {
    config.headers['Authorization'] = `Token ${user.token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Layer and CPT specific functions
export const fetchLayers = async (modelId) => {
  try {
    const response = await api.get(`/get_layers/${modelId}/`)
    return response.data
  } catch (error) {
    console.error('Error fetching layers:', error)
    throw error
  }
}

export const saveLayers = async (modelId, data) => {
  try {
    const response = await api.post(`/save_layers/${modelId}/`, data)
    return response.data
  } catch (error) {
    console.error('Error saving layers:', error)
    throw error
  }
}

export const saveCpt = async (modelId, data) => {
  try {
    const response = await api.post(`/save_cpt/${modelId}/`, data)
    return response.data
  } catch (error) {
    console.error('Error saving CPT:', error)
    throw error
  }
}

export default api 