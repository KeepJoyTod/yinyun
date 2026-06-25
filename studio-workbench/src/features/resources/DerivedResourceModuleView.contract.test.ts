import { describe, expect, it } from 'vitest'
import routerSource from '../../app/router/index.ts?raw'
import viewSource from './DerivedResourceModuleView.vue?raw'

describe('derived resource module pages contract', () => {
  it('keeps the old derived resource page only as a legacy compatibility route', () => {
    expect(routerSource).toContain('DerivedResourceModuleView.vue')
    expect(routerSource).toContain("path: '/tools/photo/sample'")
    expect(routerSource).toContain("redirect: '/tools/sample-works'")
    expect(routerSource).toContain("path: '/tools/photo/sample/legacy'")
    expect(routerSource).toContain("redirect: '/tools/sample-works'")
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
