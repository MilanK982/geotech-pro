import { vi } from 'vitest'

export const mockLogin = vi.fn()

export const setupMockApi = () => {
  mockLogin.mockImplementation(async (username, password) => {
    if (username === 'test@example.com' && password === 'password123') {
      return {
        token: 'mock-token',
        user_id: '123'
      }
    }
    throw new Error('Invalid credentials')
  })
} 