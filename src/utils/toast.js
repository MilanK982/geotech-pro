import { useToast } from 'primevue/usetoast'

export const showToast = (toast, severity, summary, detail, life = 3000) => {
  toast.add({ severity, summary, detail, life });
};

export const showErrorToast = (toast, error, defaultMessage = 'Operation failed') => {
  showToast(
    toast,
    'error',
    'Error',
    error.response?.data?.error || error.message || defaultMessage
  );
};

export const showSuccessToast = (toast, message) => {
  showToast(toast, 'success', 'Success', message);
};

export const showWarningToast = (message) => {
  showToast(toast, 'warn', 'Warning', message)
}

export const showInfoToast = (message) => {
  showToast(toast, 'info', 'Info', message)
} 