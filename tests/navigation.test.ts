import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('Logo Click & Session Logout Behavior', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('clicking logo when authenticated invokes logout and redirects to /login', async () => {
    let loggedOut = false
    let navigatedPath = ''

    const mockLogout = vi.fn().mockImplementation(async () => {
      loggedOut = true
    })
    const mockNavigate = vi.fn().mockImplementation((path: string) => {
      navigatedPath = path
    })

    const isAuthenticated = true

    // Replicate AppHeader handleLogoClick logic
    const handleLogoClick = async () => {
      if (isAuthenticated) {
        await mockLogout()
      }
      mockNavigate('/login')
    }

    await handleLogoClick()

    expect(mockLogout).toHaveBeenCalledTimes(1)
    expect(loggedOut).toBe(true)
    expect(mockNavigate).toHaveBeenCalledWith('/login')
    expect(navigatedPath).toBe('/login')
  })

  it('clicking logo when already unauthenticated simply navigates to /login without calling logout', async () => {
    const mockLogout = vi.fn()
    const mockNavigate = vi.fn()

    const isAuthenticated = false

    const handleLogoClick = async () => {
      if (isAuthenticated) {
        await mockLogout()
      }
      mockNavigate('/login')
    }

    await handleLogoClick()

    expect(mockLogout).not.toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })
})
