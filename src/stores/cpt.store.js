import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'
import { showErrorToast, showSuccessToast } from '@/utils/toast'

export const useCptStore = defineStore('cpt', () => {
  const tests = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const getTestsByProject = computed(() => (projectId) => {
    return tests.value.filter(test => test.projectId === projectId)
  })

  const getTestById = computed(() => (testId) => {
    return tests.value.find(test => test.id === testId)
  })

  // Actions
  const fetchTests = async (projectId) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get(`/projects/${projectId}/cpt-tests/`)
      tests.value = response.data
      return response.data
    } catch (err) {
      error.value = err.message
      showErrorToast(err, 'Failed to fetch CPT tests')
      throw err
    } finally {
      loading.value = false
    }
  }

  const createTest = async (projectId, testData) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.post(`/projects/${projectId}/cpt-tests/`, testData)
      tests.value.push(response.data)
      showSuccessToast('CPT test created successfully')
      return response.data
    } catch (err) {
      error.value = err.message
      showErrorToast(err, 'Failed to create CPT test')
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateTest = async (projectId, testId, testData) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.put(`/projects/${projectId}/cpt-tests/${testId}/`, testData)
      const index = tests.value.findIndex(test => test.id === testId)
      if (index !== -1) {
        tests.value[index] = response.data
      }
      showSuccessToast('CPT test updated successfully')
      return response.data
    } catch (err) {
      error.value = err.message
      showErrorToast(err, 'Failed to update CPT test')
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteTest = async (projectId, testId) => {
    loading.value = true
    error.value = null
    try {
      await api.delete(`/projects/${projectId}/cpt-tests/${testId}/`)
      tests.value = tests.value.filter(test => test.id !== testId)
      showSuccessToast('CPT test deleted successfully')
    } catch (err) {
      error.value = err.message
      showErrorToast(err, 'Failed to delete CPT test')
      throw err
    } finally {
      loading.value = false
    }
  }

  const importData = async (projectId, testId, file) => {
    loading.value = true
    error.value = null
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await api.post(`/projects/${projectId}/cpt-tests/${testId}/import/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      const index = tests.value.findIndex(test => test.id === testId)
      if (index !== -1) {
        tests.value[index] = response.data
      }
      showSuccessToast('CPT data imported successfully')
      return response.data
    } catch (err) {
      error.value = err.message
      showErrorToast(err, 'Failed to import CPT data')
      throw err
    } finally {
      loading.value = false
    }
  }

  const exportData = async (projectId, testId) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get(`/projects/${projectId}/cpt-tests/${testId}/export/`, {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(response.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `cpt-test-${testId}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      showSuccessToast('CPT data exported successfully')
    } catch (err) {
      error.value = err.message
      showErrorToast(err, 'Failed to export CPT data')
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    tests,
    loading,
    error,
    getTestsByProject,
    getTestById,
    fetchTests,
    createTest,
    updateTest,
    deleteTest,
    importData,
    exportData
  }
}) 