import { describe, expect, it } from 'vitest'
import type { ProductCollaborationConfigDto } from '../../shared/api/backend'
import type { ProductConfig } from '../../shared/stores/appStore'
import { buildAlbumProductConfigDraft, buildAlbumProductReadiness } from './albumProductReadiness'

const product = (input: Partial<ProductConfig> = {}): ProductConfig => ({
  id: 'YY_PRODUCT_1',
  backendId: '1',
  storeBackendId: '10',
  bizCategory: 'ALBUM',
  name: '轻奢入册',
  nickname: '轻奢入册',
  image: '/demo.jpg',
  spec: '轻奢相册',
  price: '699',
  unitPrice: '39',
  includedCount: 12,
  active: true,
  desc: '含选片加购与相册排版',
  storeNames: ['滨州万达店'],
  ...input,
})

const config = (input: Partial<ProductCollaborationConfigDto> = {}): ProductCollaborationConfigDto => ({
  id: 'cfg-1',
  productId: '1',
  storeId: '10',
  workflowJson: JSON.stringify({ stageCodes: ['RECEPTION', 'PHOTOGRAPHY', 'RETOUCH', 'SELECTION_REVIEW', 'PICKUP'] }),
  stageCodes: ['RECEPTION', 'PHOTOGRAPHY', 'RETOUCH', 'SELECTION_REVIEW', 'PICKUP'],
  needMakeup: false,
  needPhotography: true,
  needRetouch: true,
  needReview: false,
  needSelectionReview: true,
  needPickup: true,
  makeupCount: 0,
  deliverWithinHours: 72,
  status: 'ACTIVE',
  remark: '',
  createTime: '',
  updateTime: '',
  ...input,
})

describe('album product readiness', () => {
  it('marks an album product ready when spec, selection and fulfillment are all configured', () => {
    const readiness = buildAlbumProductReadiness(product(), config())
    expect(readiness.score).toBe(3)
    expect(readiness.summary).toContain('闭环已就绪')
  })

  it('flags missing album completeness items', () => {
    const readiness = buildAlbumProductReadiness(product({ spec: 'ALBUM', includedCount: 0, unitPrice: '0' }), null)
    expect(readiness.score).toBe(0)
    expect(readiness.items.map(item => item.tone)).toEqual(['pending', 'pending', 'pending'])
  })

  it('builds a default album fulfillment draft', () => {
    const draft = buildAlbumProductConfigDraft(product(), null)
    expect(draft.needPhotography).toBe(true)
    expect(draft.needSelectionReview).toBe(true)
    expect(draft.deliverWithinHours).toBe(72)
  })
})
