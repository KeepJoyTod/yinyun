import { describe, expect, it } from 'vitest'
import viteConfigSource from '../../vite.config.ts?raw'

describe('studio workbench build chunk contract', () => {
  it('keeps only framework dependencies in manual vendor chunks', () => {
    expect(viteConfigSource).toContain('rolldownOptions')
    expect(viteConfigSource).toContain('manualChunks')
    expect(viteConfigSource).not.toContain("return 'echarts-vendor'")
    expect(viteConfigSource).not.toContain('vue-echarts')
    expect(viteConfigSource).not.toContain('zrender')
    expect(viteConfigSource).toContain("return 'framework-vendor'")
    expect(viteConfigSource).not.toContain('maxSize: 300_000')
  })

  it('puts built assets under a release-scoped directory to avoid stale route chunks', () => {
    expect(viteConfigSource).toContain('VITE_STUDIO_RELEASE_ID')
    expect(viteConfigSource).toContain('assetsDir')
    expect(viteConfigSource).toContain("`assets/${releaseId}`")
  })
})
