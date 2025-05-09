// src/services/auth.service.js
import axios from 'axios';

const API_URL = '/geotech'; // Matches Django /geotech/login/

// Configure axios defaults
axios.defaults.withCredentials = true;

class AuthService {
  async fetchCsrfToken() {
    console.log('GET URL:', `${API_URL}/csrf/`); // Debug
    try {
      const getResponse = await axios.get(`${API_URL}/csrf/`, {
        withCredentials: true
      });
      console.log('GET Response:', getResponse.data); // Debug
    } catch (error) {
      console.error('GET Error:', error.response?.status, error.message); // Debug
    }
  }

  async login(username, password) {
    await this.fetchCsrfToken();
    console.log('POST URL:', `${API_URL}/login/`); // Debug
    console.log('CSRF Token:', getCsrfToken()); // Debug
    try {
      const response = await axios.post(`${API_URL}/login/`, {
        username,
        password,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCsrfToken(),
        },
        withCredentials: true
      });
      console.log('POST Response:', response.data); // Debug
      if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      console.error('POST Error:', error.response?.status, error.response?.data, error.message); // Debug
      throw error;
    }
  }

  async register(email, password, fullName) {
    await this.fetchCsrfToken();
    console.log('POST URL:', `${API_URL}/register/`); // Debug
    console.log('CSRF Token:', getCsrfToken()); // Debug
    try {
      const response = await axios.post(`${API_URL}/register/`, {
        email,
        password,
        fullName,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCsrfToken(),
        },
        withCredentials: true
      });
      console.log('POST Response:', response.data); // Debug
      if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      console.error('POST Error:', error.response?.status, error.response?.data, error.message); // Debug
      throw error;
    }
  }

  logout() {
    localStorage.removeItem('user');
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'));
  }

  isAuthenticated() {
    const user = this.getCurrentUser();
    return !!user && !!user.token;
  }
}

function getCsrfToken() {
  const name = 'csrftoken';
  const cookieValue = document.cookie
    .split('; ')
    .find((row) => row.startsWith(name))
    ?.split('=')[1];
  return cookieValue || '';
}

export default new AuthService();