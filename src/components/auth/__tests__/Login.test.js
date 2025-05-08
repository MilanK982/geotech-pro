import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import { createRouter, createWebHistory } from 'vue-router'
import Login from '../Login.vue'
import { useAuthStore } from '../../../stores/auth.store'

// Mock translations
const messages = {
  en: {
    auth: {
      loginTitle: 'Login',
      noAccount: 'Don\'t have an account?'
    },
    common: {
      email: 'Email',
      password: 'Password',
      login: 'Login'
    },
    validation: {
      emailRequired: 'Email is required',
      passwordRequired: 'Password is required'
    }
  }
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/geotechnical/:id',
      name: 'Geotechnical',
      component: { template: '<div>Geotechnical Page</div>' }
    }
  ]
})

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  const renderLogin = () => {
    const pinia = createTestingPinia({
      createSpy: vi.fn
    })
    
    return {
      ...render(Login, {
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

  it('renders login form correctly', () => {
    renderLogin()
    
    expect(screen.getByLabelText(/korisničko ime/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/lozinka/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /prijavi se/i })).toBeInTheDocument()
  })

  it('shows validation errors for empty fields', async () => {
    renderLogin()
    
    const loginButton = screen.getByRole('button', { name: /prijavi se/i })
    await fireEvent.click(loginButton)
    
    expect(screen.getByText(/neispravni podaci za prijavu/i)).toBeInTheDocument()
  })

  it('successfully logs in with valid credentials', async () => {
    const { authStore } = renderLogin()
    authStore.login.mockResolvedValueOnce({ token: 'mock-token', user_id: '123' })
    
    const usernameInput = screen.getByLabelText(/korisničko ime/i)
    const passwordInput = screen.getByLabelText(/lozinka/i)
    const loginButton = screen.getByRole('button', { name: /prijavi se/i })
    
    await fireEvent.update(usernameInput, 'test@example.com')
    await fireEvent.update(passwordInput, 'password123')
    await fireEvent.click(loginButton)
    
    expect(authStore.login).toHaveBeenCalledWith('test@example.com', 'password123')
    expect(localStorage.getItem('token')).toBe('mock-token')
    expect(localStorage.getItem('user_id')).toBe('123')
    expect(router.currentRoute.value.path).toBe('/geotechnical/1')
  })

  it('shows error message for invalid credentials', async () => {
    const { authStore } = renderLogin()
    authStore.login.mockRejectedValueOnce(new Error('Invalid credentials'))
    
    const usernameInput = screen.getByLabelText(/korisničko ime/i)
    const passwordInput = screen.getByLabelText(/lozinka/i)
    const loginButton = screen.getByRole('button', { name: /prijavi se/i })
    
    await fireEvent.update(usernameInput, 'test@example.com')
    await fireEvent.update(passwordInput, 'wrong-password')
    await fireEvent.click(loginButton)
    
    expect(screen.getByText(/neispravni podaci za prijavu/i)).toBeInTheDocument()
  })

  it('clears error message when retrying login', async () => {
    const { authStore } = renderLogin()
    authStore.login.mockRejectedValueOnce(new Error('Invalid credentials'))
    
    const usernameInput = screen.getByLabelText(/korisničko ime/i)
    const passwordInput = screen.getByLabelText(/lozinka/i)
    const loginButton = screen.getByRole('button', { name: /prijavi se/i })
    
    // First attempt - invalid credentials
    await fireEvent.update(usernameInput, 'test@example.com')
    await fireEvent.update(passwordInput, 'wrong-password')
    await fireEvent.click(loginButton)
    
    expect(screen.getByText(/neispravni podaci za prijavu/i)).toBeInTheDocument()
    
    // Second attempt - valid credentials
    authStore.login.mockResolvedValueOnce({ token: 'mock-token', user_id: '123' })
    await fireEvent.update(passwordInput, 'password123')
    await fireEvent.click(loginButton)
    
    expect(screen.queryByText(/neispravni podaci za prijavu/i)).not.toBeInTheDocument()
  })
}) 