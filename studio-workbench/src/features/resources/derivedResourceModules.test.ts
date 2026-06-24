import { describe, expect, it } from 'vitest'
import type { Album } from '../../shared/stores/appStore'
import { buildDerivedResourceItems, getDerivedResourceModule } from './derivedResourceModules'

const album = (input: Partial<Album> = {}): Album => ({
  backendId: '1001',
  orderBackendId: '9001',
  id: 'ALB-001',
  orderId: 'YY202606100001',
  customer: '陈女士',
  service: '证件照精修套餐',
  date: '2026-06-14',
  photographer: '摄影师 A',
  status: '选片中',
  selectedCount: 1,
  totalCount: 2,
  negatives: [
    {
      backendId: '501',
      id: '501',
      name: 'retouch-001.jpg',
      url: 'https://api.evanshine.me/resource/oss/501',
      uploadedAt: '2026-06-14T10:00:00',
      selected: true,
    },
    {
      backendId: '502',
      id: '502',
      name: 'retouch-002.jpg',
      url: '',
      uploadedAt: '2026-06-14T10:10:00',
      selected: false,
    },
  ],
  ...input,
})

describe('derived resource modules', () => {
  it('flattens album negatives into file resource records with ownership', () => {
    const module = getDerivedResourceModule('resource-files')
    const items = buildDerivedResourceItems(module, [album()])

    expect(items).toHaveLength(2)
    expect(items[0].title).toBe('retouch-001.jpg')
    expect(items[0].album.id).toBe('ALB-001')
    expect(items[0].stage).toBe('可访问')
    expect(items[1].stage).toBe('待排查')
    expect(items[0].boundary).toContain('私有 OSS')
  })

  it('derives sample candidates only from selected existing photos', () => {
    const module = getDerivedResourceModule('resource-samples')
    const items = buildDerivedResourceItems(module, [
      album(),
      album({
        backendId: '1002',
        id: 'ALB-002',
        customer: '林先生',
        service: '个人形象照套餐',
        selectedCount: 0,
        negatives: [
          {
            backendId: '601',
            id: '601',
            name: 'portrait-001.jpg',
            url: 'https://api.evanshine.me/resource/oss/601',
            uploadedAt: '2026-06-14T11:00:00',
            selected: false,
          },
        ],
      }),
    ])

    expect(items).toHaveLength(1)
    expect(items[0].title).toContain('证件照精修套餐')
    expect(items[0].stage).toBe('候选样片')
    expect(items[0].nextAction).toContain('客户授权')
    expect(items[0].boundary).toContain('yy_photo_album')
  })
})
