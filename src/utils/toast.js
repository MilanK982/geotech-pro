import { useToast } from 'primevue/usetoast'

export const showToast = (severity, summary, detail, life = 3000) => {
  const toast = useToast()
  toast.add({ severity, summary, detail, life })
}

export const showErrorToast = (error, defaultMessage = 'Operation failed') => {
  showToast(
    'error',
    'Error',
    error.response?.data?.error || error.message || defaultMessage
  )
}

export const showSuccessToast = (message) => {
  showToast('success', 'Success', message)
}

export const showWarningToast = (message) => {
  showToast('warn', 'Warning', message)
}

export const showInfoToast = (message) => {
  showToast('info', 'Info', message)
} 