import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export const useSoilStore = defineStore('soil', () => {
  const layers = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const getLayersByProject = computed(() => (projectId) => {
    return layers.value.filter(layer => layer.projectId === projectId)
  })

  const getLayerById = computed(() => (layerId) => {
    return layers.value.find(layer => layer.id === layerId)
  })

  // Actions
  const fetchLayersByProject = async (projectId) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get(`/projects/${projectId}/soil-layers/`)
      layers.value = response.data
      return response.data
    } catch (err) {
      error.value = err.message || 'Failed to fetch soil layers'
      throw err
    } finally {
      loading.value = false
    }
  }

  const createLayer = async (projectId, layerData) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.post(`/projects/${projectId}/soil-layers/`, layerData)
      layers.value.push(response.data)
      return response.data
    } catch (err) {
      error.value = err.message || 'Failed to create soil layer'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateLayer = async (projectId, layerId, layerData) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.put(`/projects/${projectId}/soil-layers/${layerId}/`, layerData)
      const index = layers.value.findIndex(layer => layer.id === layerId)
      if (index !== -1) {
        layers.value[index] = response.data
      }
      return response.data
    } catch (err) {
      error.value = err.message || 'Failed to update soil layer'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteLayer = async (projectId, layerId) => {
    loading.value = true
    error.value = null
    try {
      await api.delete(`/projects/${projectId}/soil-layers/${layerId}/`)
      layers.value = layers.value.filter(layer => layer.id !== layerId)
    } catch (err) {
      error.value = err.message || 'Failed to delete soil layer'
      throw err
    } finally {
      loading.value = false
    }
  }

  const calculateLayerThickness = (layer) => {
    if (layer.topDepth != null && layer.bottomDepth != null) {
      return Math.abs(layer.bottomDepth - layer.topDepth)
    }
    return null
  }

  const validateLayerDepths = (layer) => {
    if (layer.topDepth != null && layer.bottomDepth != null) {
      return layer.bottomDepth > layer.topDepth
    }
    return true
  }

  return {
    layers,
    loading,
    error,
    getLayersByProject,
    getLayerById,
    fetchLayersByProject,
    createLayer,
    updateLayer,
    deleteLayer,
    calculateLayerThickness,
    validateLayerDepths
  }
})