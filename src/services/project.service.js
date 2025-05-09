// src/services/project.service.js
import axios from 'axios';
import { useAuthStore } from '@/stores/auth.store';

const API_URL = 'http://localhost:8000/geotech/';

const getCsrfToken = () => {
  const name = 'csrftoken';
  const cookieValue = document.cookie
    .split('; ')
    .find((row) => row.startsWith(name))
    ?.split('=')[1];
  return cookieValue || '';
};

const getAuthHeaders = () => {
  const authStore = useAuthStore();
  return authStore.token ? { Authorization: `Token ${authStore.token}` } : {};
};

export const getProjects = async () => {
  try {
    const response = await axios.get(`${API_URL}projects/`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error('GET Projects Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Failed to fetch projects');
  }
};

export const getProject = async (id) => {
  try {
    const response = await axios.get(`${API_URL}projects/${id}/`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error('GET Project Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Failed to fetch project');
  }
};

export const getProjectStatistics = async (projectId) => {
  try {
    const response = await axios.get(`${API_URL}projects/${projectId}/stats/`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error('GET Project Stats Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Failed to fetch project stats');
  }
};

export const createProject = async (projectData) => {
  try {
    await axios.get(`${API_URL}csrf/`, { withCredentials: true });
    const response = await axios.post(`${API_URL}projects/`, projectData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
        'X-CSRFToken': getCsrfToken(),
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('POST Project Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Failed to create project');
  }
};

export const updateProject = async (id, projectData) => {
  try {
    await axios.get(`${API_URL}csrf/`, { withCredentials: true });
    const response = await axios.put(`${API_URL}projects/${id}/`, projectData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
        'X-CSRFToken': getCsrfToken(),
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('PUT Project Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Failed to update project');
  }
};

export const deleteProject = async (id) => {
  try {
    await axios.get(`${API_URL}csrf/`, { withCredentials: true });
    await axios.delete(`${API_URL}projects/${id}/`, {
      headers: {
        ...getAuthHeaders(),
        'X-CSRFToken': getCsrfToken(),
      },
      withCredentials: true,
    });
  } catch (error) {
    console.error('DELETE Project Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Failed to delete project');
  }
};

export const getProjectStats = async (projectId = null) => {
  try {
    const url = projectId ? `${API_URL}projects/${projectId}/stats/` : `${API_URL}stats/`;
    const response = await axios.get(url, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error('GET Stats Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Failed to fetch stats');
  }
};