import { afterEach, describe, expect, it, vi } from 'vitest'
import { backendApi, type AlbumDto, type AlbumPhotoDto, type StoreDto } from '../api/backend'
import { appStore, type Album } from './appStore'

const makePhotoDto = (input: {
  id: string
  albumId?: string
  displayName: string
  selected?: boolean
  sortOrder?: number
}): AlbumPhotoDto => ({
  id: input.id,
  albumId: input.albumId ?? '7001',
  fileId: `file-${input.id}`,
  originalName: input.displayName,
  displayName: input.displayName,
  sortOrder: input.sortOrder ?? Number(input.id),
  selected: input.selected ?? false,
  url: null,
  uploadedAt: '2026-06-15T10:00:00',
})

const makeAlbumDto = (input: {
  photos: AlbumPhotoDto[]
  selectedCount: number
  totalCount: number
}): AlbumDto => ({
  id: '7001',
  albumNo: 'ALB-API-001',
  orderId: '9001',
  customerName: '陈女士',
  serviceName: '证件照精修套餐',
  shootDate: '2026-06-15',
  photographer: '阿杰',
  status: '选片中',
  selectedCount: input.selectedCount,
  totalCount: input.totalCount,
  photos: input.photos,
})

const makeStoreAlbum = (overrides: Partial<Album> = {}): Album => ({
  backendId: '7001',
  orderBackendId: '9001',
  id: 'ALB-API-001',
  orderId: 'YY202606150001',
  customer: '陈女士',
  service: '证件照精修套餐',
  date: '2026-06-15',
  photographer: '阿杰',
  status: '选片中',
  selectedCount: 1,
  totalCount: 2,
  negatives: [
    {
      backendId: '201',
      id: '201',
      name: 'chen-01.jpg',
      url: '',
      uploadedAt: '2026-06-15T10:00:00',
      selected: true,
    },
    {
      backendId: '202',
      id: '202',
      name: 'chen-02.jpg',
      url: '',
      uploadedAt: '2026-06-15T10:05:00',
      selected: false,
    },
  ],
  ...overrides,
})

describe('appStore album photo mutations', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
    appStore.resetRuntime()
  })

  it('recalculates selected count from remaining photos after deleting a selected demo photo', async () => {
    appStore.demoMode = true
    appStore.albums = [
      makeStoreAlbum({
        selectedCount: 2,
        totalCount: 3,
        negatives: [
          {
            backendId: '201',
            id: '201',
            name: 'selected-1.jpg',
            url: '',
            uploadedAt: '2026-06-15T10:00:00',
            selected: true,
          },
          {
            backendId: '202',
            id: '202',
            name: 'selected-2.jpg',
            url: '',
            uploadedAt: '2026-06-15T10:05:00',
            selected: true,
          },
          {
            backendId: '203',
            id: '203',
            name: 'pending.jpg',
            url: '',
            uploadedAt: '2026-06-15T10:10:00',
            selected: false,
          },
        ],
      }),
    ]

    await appStore.deleteAlbumPhoto('ALB-API-001', '201')

    expect(appStore.albums[0].negatives.map(photo => photo.id)).toEqual(['202', '203'])
    expect(appStore.albums[0].totalCount).toBe(2)
    expect(appStore.albums[0].selectedCount).toBe(1)
  })

  it('reloads the authoritative album after renaming a photo in api mode', async () => {
    appStore.albums = [makeStoreAlbum()]
    const renamePhoto = makePhotoDto({ id: '201', displayName: 'local-request.jpg', selected: true })
    const authoritativePhoto = makePhotoDto({ id: '201', displayName: 'server-final.jpg', selected: true })
    const renameSpy = vi.spyOn(backendApi, 'renameAlbumPhoto').mockResolvedValue(renamePhoto)
    const getAlbumSpy = vi.spyOn(backendApi, 'getAlbum').mockResolvedValue(
      makeAlbumDto({
        photos: [authoritativePhoto, makePhotoDto({ id: '202', displayName: 'chen-02.jpg' })],
        selectedCount: 1,
        totalCount: 2,
      }),
    )

    await appStore.renameAlbumPhoto('ALB-API-001', '201', 'local-request.jpg')

    expect(renameSpy).toHaveBeenCalledWith('201', 'local-request.jpg')
    expect(getAlbumSpy).toHaveBeenCalledWith('7001')
    expect(appStore.albums[0].negatives[0].name).toBe('server-final.jpg')
  })

  it('reloads album totals and selected count after deleting a photo in api mode', async () => {
    appStore.albums = [makeStoreAlbum()]
    const deleteSpy = vi.spyOn(backendApi, 'deleteAlbumPhoto').mockResolvedValue(undefined)
    const getAlbumSpy = vi.spyOn(backendApi, 'getAlbum').mockResolvedValue(
      makeAlbumDto({
        photos: [makePhotoDto({ id: '202', displayName: 'chen-02.jpg' })],
        selectedCount: 0,
        totalCount: 1,
      }),
    )

    await appStore.deleteAlbumPhoto('ALB-API-001', '201')

    expect(deleteSpy).toHaveBeenCalledWith('201')
    expect(getAlbumSpy).toHaveBeenCalledWith('7001')
    expect(appStore.albums[0].negatives.map(photo => photo.id)).toEqual(['202'])
    expect(appStore.albums[0].totalCount).toBe(1)
    expect(appStore.albums[0].selectedCount).toBe(0)
  })

  it('rejects api mode when the real store list contains fewer stores than configured', async () => {
    vi.stubEnv('VITE_STUDIO_EXPECTED_STORE_COUNT', '4')
    const stores: StoreDto[] = [
      {
        id: '101',
        storeCode: 'YY-SZ-001',
        name: '影约云深圳旗舰店',
        status: '营业中',
        managerName: '阿杰',
        address: '深圳南山',
        phone: '0755-8888',
        openTime: '09:30',
        closeTime: '21:00',
        monthlyOrders: 0,
        pendingOrders: 0,
      },
      {
        id: '102',
        storeCode: 'YY-GZ-001',
        name: '影约云广州店',
        status: '营业中',
        managerName: '',
        address: '广州天河',
        phone: '020-8888',
        openTime: '10:00',
        closeTime: '20:00',
        monthlyOrders: 0,
        pendingOrders: 0,
      },
      {
        id: '103',
        storeCode: 'YY-HK-001',
        name: '影约云香港店',
        status: '营业中',
        managerName: '',
        address: '香港九龙',
        phone: '+852 6000 2026',
        openTime: '10:00',
        closeTime: '20:00',
        monthlyOrders: 0,
        pendingOrders: 0,
      },
    ]
    vi.spyOn(backendApi, 'listStores').mockResolvedValue(stores)
    vi.spyOn(backendApi, 'listProducts').mockResolvedValue([])
    vi.spyOn(backendApi, 'listProductSpecOptions').mockResolvedValue([])
    vi.spyOn(backendApi, 'listTodayOrders').mockResolvedValue({ items: [], page: 1, pageSize: 100, total: 0 })
    vi.spyOn(backendApi, 'listAllOrders').mockResolvedValue({ items: [], page: 1, pageSize: 5000, total: 0 })
    vi.spyOn(backendApi, 'listAlbums').mockResolvedValue([])
    vi.spyOn(backendApi, 'listSelectionLinks').mockResolvedValue([])
    vi.spyOn(backendApi, 'selectionStats').mockResolvedValue({
      activeCount: 0,
      newLast7DaysCount: 0,
      completedCount: 0,
      completedThisMonthCount: 0,
      averageSelectionMinutes: 0,
      extraConversionRate: 0,
      averageExtraCount: 0,
      monthExtraRevenueCents: 0,
    })

    await expect(appStore.refreshCoreData()).rejects.toThrow(
      '真实门店数据不足：至少需要 4 个可用门店，接口返回 3 个，请检查 /yy/store/list、账号权限或租户门店数据',
    )
    expect(backendApi.listTodayOrders).not.toHaveBeenCalled()
  })

  it('accepts all stores returned by the backend when the list is larger than the minimum expectation', async () => {
    vi.stubEnv('VITE_STUDIO_MIN_STORE_COUNT', '4')
    const stores: StoreDto[] = Array.from({ length: 5 }, (_, index) => ({
      id: String(200 + index),
      storeCode: `YY-STORE-${index + 1}`,
      name: `影约云门店 ${index + 1}`,
      status: '营业中',
      managerName: '',
      address: '深圳南山',
      phone: '0755-8888',
      openTime: '09:30',
      closeTime: '21:00',
      monthlyOrders: 0,
      pendingOrders: 0,
    }))
    vi.spyOn(backendApi, 'listStores').mockResolvedValue(stores)
    vi.spyOn(backendApi, 'listProducts').mockResolvedValue([])
    vi.spyOn(backendApi, 'listProductSpecOptions').mockResolvedValue([])
    vi.spyOn(backendApi, 'listTodayOrders').mockResolvedValue({ items: [], page: 1, pageSize: 100, total: 0 })
    vi.spyOn(backendApi, 'listAllOrders').mockResolvedValue({ items: [], page: 1, pageSize: 5000, total: 0 })
    vi.spyOn(backendApi, 'listAlbums').mockResolvedValue([])
    vi.spyOn(backendApi, 'listSelectionLinks').mockResolvedValue([])
    vi.spyOn(backendApi, 'selectionStats').mockResolvedValue({
      activeCount: 0,
      newLast7DaysCount: 0,
      completedCount: 0,
      completedThisMonthCount: 0,
      averageSelectionMinutes: 0,
      extraConversionRate: 0,
      averageExtraCount: 0,
      monthExtraRevenueCents: 0,
    })

    await appStore.refreshCoreData()

    expect(appStore.stores).toHaveLength(5)
    expect(appStore.stores.map(store => store.id)).toEqual(['YY-STORE-1', 'YY-STORE-2', 'YY-STORE-3', 'YY-STORE-4', 'YY-STORE-5'])
  })

  it('hides technical default stores from staff-facing store filters', async () => {
    vi.stubEnv('VITE_STUDIO_MIN_STORE_COUNT', '4')
    const stores: StoreDto[] = [
      ...Array.from({ length: 4 }, (_, index) => ({
        id: String(300 + index),
        storeCode: `YY-BIZ-${index + 1}`,
        name: `一悦真实门店 ${index + 1}`,
        status: '营业中',
        managerName: '',
        address: '山东',
        phone: '0543-8888',
        openTime: '09:30',
        closeTime: '21:00',
        monthlyOrders: 0,
        pendingOrders: 0,
      })),
      {
        id: '399',
        storeCode: 'DOUYIN_LIFE_DEFAULT',
        name: '抖音来客默认门店',
        status: '停用',
        managerName: '',
        address: '',
        phone: '',
        openTime: '00:00',
        closeTime: '00:00',
        monthlyOrders: 0,
        pendingOrders: 0,
      },
    ]
    vi.spyOn(backendApi, 'listStores').mockResolvedValue(stores)
    vi.spyOn(backendApi, 'listProducts').mockResolvedValue([])
    vi.spyOn(backendApi, 'listProductSpecOptions').mockResolvedValue([])
    vi.spyOn(backendApi, 'listTodayOrders').mockResolvedValue({ items: [], page: 1, pageSize: 100, total: 0 })
    vi.spyOn(backendApi, 'listAllOrders').mockResolvedValue({ items: [], page: 1, pageSize: 5000, total: 0 })
    vi.spyOn(backendApi, 'listAlbums').mockResolvedValue([])
    vi.spyOn(backendApi, 'listSelectionLinks').mockResolvedValue([])
    vi.spyOn(backendApi, 'selectionStats').mockResolvedValue({
      activeCount: 0,
      newLast7DaysCount: 0,
      completedCount: 0,
      completedThisMonthCount: 0,
      averageSelectionMinutes: 0,
      extraConversionRate: 0,
      averageExtraCount: 0,
      monthExtraRevenueCents: 0,
    })

    await appStore.refreshCoreData()

    expect(appStore.stores).toHaveLength(4)
    expect(appStore.stores.map(store => store.name)).not.toContain('抖音来客默认门店')
  })
})
