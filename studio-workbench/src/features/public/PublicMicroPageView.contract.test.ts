import { describe, expect, it } from 'vitest'
import publicSource from './PublicMicroPageView.vue?raw'
import rendererSource from './components/MicroPageRenderer.vue?raw'
import rendererOperationsSource from './components/microPageRendererOperations.ts?raw'

const rendererContractSource = [
  rendererSource,
  rendererOperationsSource,
].join('\n')

describe('public micro page contract', () => {
  it('loads the published page through the public backend facade', () => {
    expect(publicSource).toContain('backendApi.getPublicMicroPage')
    expect(publicSource).toContain('MicroPageRenderer')
    expect(publicSource).toContain(':store-id=')
  })

  it('does not expose schema debug labels in the customer-facing page', () => {
    expect(publicSource).not.toContain('Micro Page')
    expect(publicSource).not.toContain('{{ component.type }}')
    expect(publicSource).not.toContain('公开页按安全 fallback 渲染该组件')
    expect(publicSource).not.toContain('previewDescription')
    expect(publicSource).not.toContain('previewTitle')
  })

  it('renders backend-supported micro page components as customer content', () => {
    for (const type of ['title', 'image', 'textnav', 'masonry', 'store', 'spacer', 'divider']) {
      expect(rendererSource).toContain(`component.type === '${type}'`)
    }
    expect(rendererContractSource).toContain('workbenchImages.storeFront')
    expect(rendererContractSource).toContain('getSamplePhotoImage')
    expect(rendererContractSource).toContain('立即预约')
    expect(rendererContractSource).toContain('联系门店')
  })

  it('supports real customer actions without leaking editor behavior', () => {
    expect(rendererSource).toContain('handleNav')
    expect(rendererSource).toContain("link.startsWith('#')")
    expect(rendererSource).toContain('scrollIntoView')
    expect(rendererSource).toContain('/^(https?:|tel:|mailto:)/i')
    expect(rendererSource).toContain("nextLink.startsWith('/')")
    expect(rendererContractSource).toContain('appendQueryParam')
    expect(rendererContractSource).toContain('isMicroFormPath')
    expect(rendererSource).toContain('props.storeId')
    expect(rendererSource).toContain('props.preview')
    expect(rendererContractSource).toContain('imageHeight')
    expect(rendererSource).not.toContain('{{ component.type }}')
  })
})
