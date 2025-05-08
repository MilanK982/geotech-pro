import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useToast } from 'primevue/usetoast'

export const useCptStore = defineStore('cpt', () => {
  const tests = ref([])
  const loading = ref(false)
  const error = ref(null)
  const toast = useToast()

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
      // TODO: Replace with actual API call
      const response = await fetch(`/api/projects/${projectId}/cpt-tests`)
      const data = await response.json()
      tests.value = data
    } catch (err) {
      error.value = err.message
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to fetch CPT tests',
        life: 3000
      })
    } finally {
      loading.value = false
    }
  }

  const createTest = async (projectId, testData) => {
    loading.value = true
    error.value = null
    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/projects/${projectId}/cpt-tests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testData)
      })
      const newTest = await response.json()
      tests.value.push(newTest)
      return newTest
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateTest = async (projectId, testId, testData) => {
    loading.value = true
    error.value = null
    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/projects/${projectId}/cpt-tests/${testId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testData)
      })
      const updatedTest = await response.json()
      const index = tests.value.findIndex(test => test.id === testId)
      if (index !== -1) {
        tests.value[index] = updatedTest
      }
      return updatedTest
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteTest = async (projectId, testId) => {
    loading.value = true
    error.value = null
    try {
      // TODO: Replace with actual API call
      await fetch(`/api/projects/${projectId}/cpt-tests/${testId}`, {
        method: 'DELETE'
      })
      tests.value = tests.value.filter(test => test.id !== testId)
    } catch (err) {
      error.value = err.message
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

      // TODO: Replace with actual API call
      const response = await fetch(`/api/projects/${projectId}/cpt-tests/${testId}/import`, {
        method: 'POST',
        body: formData
      })
      const updatedTest = await response.json()
      const index = tests.value.findIndex(test => test.id === testId)
      if (index !== -1) {
        tests.value[index] = updatedTest
      }
      return updatedTest
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const exportData = async (projectId, testId) => {
    loading.value = true
    error.value = null
    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/projects/${projectId}/cpt-tests/${testId}/export`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `cpt-test-${testId}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      error.value = err.message
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