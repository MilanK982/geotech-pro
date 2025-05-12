// src/services/auth.service.js
import api from './api'

class AuthService {
  async fetchCsrfToken() {
    await api.get('/csrf/')
  }

  async login(username, password) {
    await this.fetchCsrfToken()
    const response = await api.post('/login/', { username, password })
    if (response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data))
    }
    return response.data
  }

  async register(email, password, fullName) {
    await this.fetchCsrfToken()
    const response = await api.post('/register/', { email, password, fullName })
    if (response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data))
    }
    return response.data
  }

  logout() {
    localStorage.removeItem('user')
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'))
  }

  isAuthenticated() {
    const user = this.getCurrentUser()
    return !!user && !!user.token
  }
}

export default new AuthService()