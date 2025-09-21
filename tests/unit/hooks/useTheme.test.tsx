import { ThemeProvider, useTheme } from '@/components/providers/ThemeProvider'
import { act, renderHook } from '@testing-library/react'
import { ReactNode } from 'react'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: query === '(prefers-color-scheme: dark)',
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

const wrapper = ({ children }: { children: ReactNode }) => <ThemeProvider>{children}</ThemeProvider>

describe('useTheme Hook', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear()
    localStorageMock.setItem.mockClear()
    // Reset DOM classes
    document.documentElement.className = ''
  })

  it('should initialize with system theme by default', () => {
    localStorageMock.getItem.mockReturnValue(null)

    const { result } = renderHook(() => useTheme(), { wrapper })

    expect(result.current.theme).toBe('system')
  })

  it('should initialize with stored theme from localStorage', () => {
    localStorageMock.getItem.mockReturnValue('dark')

    const { result } = renderHook(() => useTheme(), { wrapper })

    expect(result.current.theme).toBe('dark')
  })

  it('should set theme and save to localStorage', () => {
    localStorageMock.getItem.mockReturnValue('light')

    const { result } = renderHook(() => useTheme(), { wrapper })

    act(() => {
      result.current.setTheme('dark')
    })

    expect(result.current.theme).toBe('dark')
    expect(localStorageMock.setItem).toHaveBeenCalledWith('ultimate-tools-theme', 'dark')
  })

  it('should handle localStorage errors gracefully', () => {
    localStorageMock.getItem.mockReturnValue('light')
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('localStorage error')
    })

    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

    const { result } = renderHook(() => useTheme(), { wrapper })

    act(() => {
      result.current.setTheme('dark')
    })

    expect(result.current.theme).toBe('dark')
    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to save theme to localStorage:',
      expect.any(Error)
    )

    consoleSpy.mockRestore()
  })

  it('should throw error when used outside ThemeProvider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

    expect(() => {
      renderHook(() => useTheme())
    }).toThrow('useTheme must be used within a ThemeProvider')

    consoleSpy.mockRestore()
  })

  it('should apply theme class to document element', () => {
    localStorageMock.getItem.mockReturnValue('dark')

    renderHook(() => useTheme(), { wrapper })

    // Wait for useEffect to run
    act(() => {
      // Force a re-render to trigger useEffect
    })

    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('should handle system theme correctly', () => {
    localStorageMock.getItem.mockReturnValue('system')

    // Mock prefers-color-scheme: dark
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    })

    renderHook(() => useTheme(), { wrapper })

    act(() => {
      // Force a re-render to trigger useEffect
    })

    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })
})
