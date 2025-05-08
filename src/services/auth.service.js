import axios from 'axios';

const API_URL = 'http://localhost:8000/geotech';

class AuthService {
  async login(username, password) {
    const response = await axios.post(`${API_URL}/login`, {
      username,
      password
    });
    if (response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  }

  logout() {
    localStorage.removeItem('user');
  }

  register(email, password, fullName) {
    return axios.post(`${API_URL}/register`, {
      email,
      password,
      fullName
    });
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'));
  }

  isAuthenticated() {
    const user = this.getCurrentUser();
    return !!user && !!user.token;
  }
}

export default new AuthService(); 