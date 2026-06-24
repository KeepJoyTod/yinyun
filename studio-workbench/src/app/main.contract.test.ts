import { describe, expect, it } from 'vitest'
import mainSource from '../main.ts?raw'

describe('studio app bootstrap contract', () => {
  it('does not preload workbench data before staff auth is checked', () => {
    expect(mainSource).not.toContain('appStore.bootstrap()')
  })

  it('waits for the initial route before mounting to avoid login shell flash', () => {
    expect(mainSource).toContain('router.isReady()')
    expect(mainSource).toContain('app.mount')
  })
})
