import { describe, expect, it } from 'vitest'
import routerSource from '../../app/router/index.ts?raw'
import { getWorkbenchFeature } from '../../app/router/featureRegistry'
import viewSource from './DerivedResourceModuleView.vue?raw'

describe('derived resource module pages contract', () => {
  it('replaces resource placeholders with one real derived resource route', () => {
    expect(routerSource).toContain('DerivedResourceModuleView.vue')
    for (const key of ['resource-files', 'resource-samples']) {
      expect(getWorkbenchFeature(key)?.component).toBe('derived-resource-module')
      expect(getWorkbenchFeature(key)?.status).toBe('ready')
      expect(getWorkbenchFeature(key)?.permission).toBe('yy:photoAlbum:list')
    }
  })

  it('uses album photos as the only source and keeps publishing read-only', () => {
    expect(viewSource).toContain('buildDerivedResourceItems')
    expect(viewSource).toContain('appStore.albums')
    expect(viewSource).toContain('私有 OSS')
    expect(viewSource).toContain('yy_photo_album')
    expect(viewSource).not.toContain('createSample')
    expect(viewSource).not.toContain('publishSample')
    expect(viewSource).not.toContain('uploadAlbumPhotos')
  })

  it('shows both resource module labels', () => {
    expect(viewSource).toContain('文件资源')
    expect(viewSource).toContain('样片作品')
  })
})
