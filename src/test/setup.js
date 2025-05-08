import '@testing-library/jest-dom'
import { config } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createPinia } from 'pinia'
import { vi } from 'vitest'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import Toast from 'primevue/toast'

// Mock PrimeVue components
vi.mock('primevue/inputtext', () => ({
  default: {
    name: 'InputText',
    props: ['modelValue', 'id'],
    template: '<input :id="id" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />'
  }
}))

vi.mock('primevue/password', () => ({
  default: {
    name: 'Password',
    props: ['modelValue', 'id'],
    template: '<input :id="id" type="password" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />'
  }
}))

vi.mock('primevue/button', () => ({
  default: {
    name: 'Button',
    props: ['label'],
    template: '<button type="button">{{ label }}</button>'
  }
}))

// Mock translations
const messages = {
  en: {
    // ... existing translations ...
  },
  sr: {
    // ... existing translations ...
  }
}

// Setup i18n
const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages
})

// Setup Pinia
const pinia = createPinia()

// Mock PrimeVue Toast
const mockToast = {
  add: vi.fn(),
  remove: vi.fn(),
  removeGroup: vi.fn(),
  removeAllGroups: vi.fn()
}

// Mock useToast
vi.mock('primevue/usetoast', () => ({
  useToast: () => mockToast
}))

// Global components
config.global.components = {
  ...config.global.components,
  Toast
}

// Global plugins
config.global.plugins = [
  i18n,
  pinia,
  PrimeVue,
  ToastService
]

// Global mocks
config.global.mocks = {
  $t: (key) => key,
  $primevue: {
    config: {
      ripple: true,
      inputStyle: 'filled'
    }
  }
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks()
}) 