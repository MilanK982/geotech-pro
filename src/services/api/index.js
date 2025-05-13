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

export default api 