import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../auth.store'
import authService from '../../services/auth.service'

// Mock the auth service
vi.mock('../../services/auth.service', () => ({
  default: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn()
  }
}))

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('State', () => {
    it('initializes with correct default state', () => {
      const store = useAuthStore()
      expect(store.user).toBe(undefined) // Since getCurrentUser is mocked and returns undefined
      expect(store.loading).toBe(false)
      expect(store.error).toBe(null)
    })
  })

  describe('Getters', () => {
    it('isAuthenticated returns true when user exists', () => {
      const store = useAuthStore()
      store.user = { id: 1, email: 'test@example.com' }
      expect(store.isAuthenticated).toBe(true)
    })

    it('isAuthenticated returns false when user is null', () => {
      const store = useAuthStore()
      store.user = null
      expect(store.isAuthenticated).toBe(false)
    })

    it('currentUser returns the user object', () => {
      const store = useAuthStore()
      const user = { id: 1, email: 'test@example.com' }
      store.user = user
      expect(store.currentUser).toStrictEqual(user)
    })
  })

  describe('Actions', () => {
    describe('login', () => {
      it('successfully logs in user', async () => {
        const store = useAuthStore()
        const user = { id: 1, email: 'test@example.com' }
        authService.login.mockResolvedValueOnce(user)

        await store.login('test@example.com', 'password123')

        expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password123')
        expect(store.user).toStrictEqual(user)
        expect(store.loading).toBe(false)
        expect(store.error).toBe(null)
      })

      it('handles login error', async () => {
        const store = useAuthStore()
        const error = new Error('Invalid credentials')
        error.response = { data: { message: 'Invalid credentials' } }
        authService.login.mockRejectedValueOnce(error)

        await expect(store.login('test@example.com', 'wrong-password'))
          .rejects.toThrow('Invalid credentials')

        expect(store.user).toBe(undefined)
        expect(store.loading).toBe(false)
        expect(store.error).toBe('Invalid credentials')
      })
    })

    describe('register', () => {
      it('successfully registers user', async () => {
        const store = useAuthStore()
        const response = { data: { message: 'Registration successful' } }
        authService.register.mockResolvedValueOnce(response)

        const result = await store.register('test@example.com', 'password123', 'Test User')

        expect(authService.register).toHaveBeenCalledWith(
          'test@example.com',
          'password123',
          'Test User'
        )
        expect(result).toStrictEqual(response.data)
        expect(store.loading).toBe(false)
        expect(store.error).toBe(null)
      })

      it('handles registration error', async () => {
        const store = useAuthStore()
        const error = new Error('Email already exists')
        error.response = { data: { message: 'Email already exists' } }
        authService.register.mockRejectedValueOnce(error)

        await expect(store.register('test@example.com', 'password123', 'Test User'))
          .rejects.toThrow('Email already exists')

        expect(store.loading).toBe(false)
        expect(store.error).toBe('Email already exists')
      })
    })

    describe('logout', () => {
      it('successfully logs out user', () => {
        const store = useAuthStore()
        store.user = { id: 1, email: 'test@example.com' }

        store.logout()

        expect(authService.logout).toHaveBeenCalled()
        expect(store.user).toBe(null)
      })
    })
  })
}) 