// src/services/project.service.js
import api from './api'

const getAuthHeaders = () => {
  const authStore = useAuthStore();
  return authStore.token ? { Authorization: `Token ${authStore.token}` } : {};
};

export const getProjects = async () => {
  console.log('Fetching projects from:', api.defaults.baseURL + '/projects/');
  const response = await api.get('/projects/')
  return response.data
}

export const getProject = async (id) => {
  const response = await api.get(`/projects/${id}/`)
  return response.data
}

export const getProjectStatistics = async (projectId) => {
  try {
    const response = await api.get(`/projects/${projectId}/stats/`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error('GET Project Stats Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Failed to fetch project stats');
  }
};

export const createProject = async (data) => {
  const response = await api.post('/projects/', data)
  return response.data
}

export const updateProject = async (id, data) => {
  const response = await api.put(`/projects/${id}/`, data)
  return response.data
}

export const deleteProject = async (id) => {
  await api.delete(`/projects/${id}/`)
}

export const getProjectStats = async (projectId = null) => {
  const url = projectId ? `/projects/${projectId}/stats/` : '/stats/'
  const response = await api.get(url)
  return response.data
}

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