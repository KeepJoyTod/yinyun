import { describe, expect, it } from 'vitest'
import routerSource from './index.ts?raw'
import routeGuardSource from './routeGuard.ts?raw'

describe('studio router auth contract', () => {
  it('requires a real API token in production API mode', () => {
    expect(routerSource).toContain('VITE_STUDIO_DEMO')
    expect(routerSource).toContain('getStoredApiToken')
    expect(routerSource).toContain('needsApiToken && !hasApiToken')
    expect(routerSource).toContain("path: '/login'")
  })

  it('loads server authorization before allowing a protected route', () => {
    expect(routerSource).toContain('ensureStudioAccess')
    expect(routerSource).toContain('resolveWorkbenchProtectedRoute')
    expect(routeGuardSource).toContain('canAccessWorkbenchFeature')
    expect(routerSource).toContain("path: '/403'")
    expect(routeGuardSource).toContain("path: '/403'")
  })
})
