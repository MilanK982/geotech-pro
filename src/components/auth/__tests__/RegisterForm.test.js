import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import { createRouter, createWebHistory } from 'vue-router'
import RegisterForm from '../RegisterForm.vue'
import { useAuthStore } from '../../../stores/auth.store'

// Mock translations
const messages = {
  en: {
    auth: {
      registerTitle: 'Register',
      hasAccount: 'Already have an account?'
    },
    common: {
      fullName: 'Full Name',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      register: 'Register'
    },
    validation: {
      fullNameRequired: 'Full name is required',
      emailRequired: 'Email is required',
      emailInvalid: 'Invalid email format',
      passwordRequired: 'Password is required',
      passwordMinLength: 'Password must be at least 6 characters',
      confirmPasswordRequired: 'Please confirm your password',
      passwordsDoNotMatch: 'Passwords do not match'
    }
  }
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: { template: '<div>Login Page</div>' }
    }
  ]
})

describe('RegisterForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderRegisterForm = () => {
    const pinia = createTestingPinia({
      createSpy: vi.fn
    })
    
    return {
      ...render(RegisterForm, {
        global: {
          plugins: [pinia, router],
          mocks: {
            $t: (key) => {
              return key.split('.').reduce((obj, i) => obj[i], messages.en)
            }
          }
        }
      }),
      authStore: useAuthStore()
    }
  }

  it('renders register form correctly', () => {
    renderRegisterForm()
    
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument()
    expect(screen.getByText(/already have an account/i)).toBeInTheDocument()
  })

  it('shows validation errors for empty fields', async () => {
    renderRegisterForm()
    
    const registerButton = screen.getByRole('button', { name: /register/i })
    await fireEvent.click(registerButton)
    
    expect(screen.getByText(/full name is required/i)).toBeInTheDocument()
    expect(screen.getByText(/email is required/i)).toBeInTheDocument()
    expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    expect(screen.getByText(/confirm.*password.*required/i)).toBeInTheDocument()
  })

  it('validates email format', async () => {
    renderRegisterForm()
    
    const emailInput = screen.getByLabelText(/email/i)
    const registerButton = screen.getByRole('button', { name: /register/i })
    
    await fireEvent.update(emailInput, 'invalid-email')
    await fireEvent.click(registerButton)
    
    expect(screen.getByText(/invalid email format/i)).toBeInTheDocument()
  })

  it('validates password length', async () => {
    renderRegisterForm()
    
    const passwordInput = screen.getByLabelText(/^password$/i)
    const registerButton = screen.getByRole('button', { name: /register/i })
    
    await fireEvent.update(passwordInput, '12345')
    await fireEvent.click(registerButton)
    
    expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument()
  })

  it('validates password match', async () => {
    renderRegisterForm()
    
    const passwordInput = screen.getByLabelText(/^password$/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    const registerButton = screen.getByRole('button', { name: /register/i })
    
    await fireEvent.update(passwordInput, 'password123')
    await fireEvent.update(confirmPasswordInput, 'password456')
    await fireEvent.click(registerButton)
    
    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
  })

  it('successfully registers with valid data', async () => {
    const { authStore } = renderRegisterForm()
    authStore.register.mockResolvedValueOnce()
    
    const fullNameInput = screen.getByLabelText(/full name/i)
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/^password$/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    const registerButton = screen.getByRole('button', { name: /register/i })
    
    await fireEvent.update(fullNameInput, 'Test User')
    await fireEvent.update(emailInput, 'test@example.com')
    await fireEvent.update(passwordInput, 'password123')
    await fireEvent.update(confirmPasswordInput, 'password123')
    await fireEvent.click(registerButton)
    
    expect(authStore.register).toHaveBeenCalledWith(
      'test@example.com',
      'password123',
      'Test User'
    )
    expect(router.currentRoute.value.path).toBe('/login')
  })

  it('handles registration error', async () => {
    const { authStore } = renderRegisterForm()
    const errorMessage = 'Email already exists'
    authStore.register.mockRejectedValueOnce(new Error(errorMessage))
    
    const fullNameInput = screen.getByLabelText(/full name/i)
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/^password$/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    const registerButton = screen.getByRole('button', { name: /register/i })
    
    await fireEvent.update(fullNameInput, 'Test User')
    await fireEvent.update(emailInput, 'test@example.com')
    await fireEvent.update(passwordInput, 'password123')
    await fireEvent.update(confirmPasswordInput, 'password123')
    await fireEvent.click(registerButton)
    
    expect(authStore.register).toHaveBeenCalled()
    // Note: Toast messages would be tested separately as they are provided by PrimeVue
  })
}) 