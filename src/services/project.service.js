import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

class ProjectService {
  async getProjects() {
    const response = await axios.get(`${API_URL}/projects`);
    return response.data;
  }

  async getProject(id) {
    const response = await axios.get(`${API_URL}/projects/${id}`);
    return response.data;
  }

  async createProject(projectData) {
    const response = await axios.post(`${API_URL}/projects`, projectData);
    return response.data;
  }

  async updateProject(id, projectData) {
    const response = await axios.put(`${API_URL}/projects/${id}`, projectData);
    return response.data;
  }

  async deleteProject(id) {
    const response = await axios.delete(`${API_URL}/projects/${id}`);
    return response.data;
  }

  async getProjectStats() {
    const response = await axios.get(`${API_URL}/projects/stats`);
    return response.data;
  }
}

export default new ProjectService(); 