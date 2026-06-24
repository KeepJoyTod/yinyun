export const CLIENT_PHOTO_TOKEN_STORAGE_KEY = 'yy_photo_client_token'
export const CLIENT_ORDER_TOKEN_STORAGE_KEY = 'yy_order_client_token'

export type PhotoPlatform = 'H5' | 'WECHAT_MINI_APP' | 'DOUYIN_MINI_APP' | 'DOUYIN_LIFE' | 'MANUAL'

export type ClientPhotoToken = {
  clientToken: string
  expiresIn: number
  expiresAt: string
  phoneMasked: string
  platform: PhotoPlatform
}

export type ClientPhotoAlbum = {
  albumId: string
  title: string
  assetCount?: number
  coverAssetId?: string
  customerName?: string
  channelType?: PhotoPlatform | string
  status?: string
  expireTime?: string
}

export type ClientPhotoAsset = {
  assetId: string
  fileName: string
  sort?: number
  selected?: boolean | string
}

export type ClientPhotoAlbumDetail = {
  albumId: string
  title: string
  expireTime?: string
  selectionStatus?: string
  selectedCount?: number
  lastSelectionSubmitTime?: string
  assets: ClientPhotoAsset[]
}

export type ClientPhotoSignedUrl = {
  assetId: string
  url: string
  expiresIn: number
  expiresAt: string
  fileName?: string
  contentType?: string
}

export type ClientOrderLink = {
  orderId?: string
  orderNo?: string
  channelType?: string
  status?: string
  payStatus?: string
  externalStatus?: string
  customerName?: string | null
  phoneMasked?: string
  amount?: string
  title?: string
  productTitle?: string
  createdTime?: string
  appointmentTime?: string
  pickupAvailable?: boolean
  pickupUrl?: string
  orderDetailUrl?: string
}

export type ClientOrderToken = {
  clientOrderToken: string
  expiresIn: number
  expiresAt: string
  phoneMasked: string
  orders: ClientOrderLink[]
}

type RuoYiResponse<T> = {
  code?: number
  msg?: string
  data?: T
}

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

type ClientPhotoApiOptions = {
  apiBaseUrl?: string
  storage?: StorageLike
  fetcher?: typeof fetch
}

function createMemoryStorage(): StorageLike {
  const values = new Map<string, string>()
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  }
}

function getDefaultStorage(): StorageLike {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage
  }
  return createMemoryStorage()
}

export function normalizePickupCredentials(phone: string, code: string) {
  return {
    phone: phone.trim(),
    code: code.trim().toUpperCase(),
  }
}

function normalizeBaseUrl(apiBaseUrl: string) {
  return apiBaseUrl.replace(/\/$/, '')
}

function joinUrl(apiBaseUrl: string, path: string) {
  const base = normalizeBaseUrl(apiBaseUrl)
  return `${base}${path}`
}

function readToken(storage: StorageLike): ClientPhotoToken | null {
  const raw = storage.getItem(CLIENT_PHOTO_TOKEN_STORAGE_KEY)
  if (!raw) {
    return null
  }
  try {
    const token = JSON.parse(raw) as ClientPhotoToken
    if (!token.clientToken) {
      return null
    }
    const expiresAt = new Date(token.expiresAt).getTime()
    if (Number.isFinite(expiresAt) && expiresAt <= Date.now()) {
      storage.removeItem(CLIENT_PHOTO_TOKEN_STORAGE_KEY)
      return null
    }
    return token
  } catch {
    storage.removeItem(CLIENT_PHOTO_TOKEN_STORAGE_KEY)
    return null
  }
}

function readOrderToken(storage: StorageLike): ClientOrderToken | null {
  const raw = storage.getItem(CLIENT_ORDER_TOKEN_STORAGE_KEY)
  if (!raw) {
    return null
  }
  try {
    const token = JSON.parse(raw) as ClientOrderToken
    if (!token.clientOrderToken) {
      return null
    }
    const expiresAt = new Date(token.expiresAt).getTime()
    if (Number.isFinite(expiresAt) && expiresAt <= Date.now()) {
      storage.removeItem(CLIENT_ORDER_TOKEN_STORAGE_KEY)
      return null
    }
    return token
  } catch {
    storage.removeItem(CLIENT_ORDER_TOKEN_STORAGE_KEY)
    return null
  }
}

export function createClientPhotoApi(options: ClientPhotoApiOptions = {}) {
  const apiBaseUrl = options.apiBaseUrl ?? import.meta.env.VITE_API_BASE_URL ?? ''
  const storage = options.storage ?? getDefaultStorage()
  const fetcher = options.fetcher ?? fetch

  async function request<T>(path: string, init: RequestInit = {}, withToken = true): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(init.headers as Record<string, string> | undefined),
    }
    if (withToken) {
      const token = readToken(storage)
      if (token?.clientToken) {
        headers['X-Client-Token'] = token.clientToken
      }
    }
    const response = await fetcher(joinUrl(apiBaseUrl, path), {
      ...init,
      headers,
    })
    const contentType = response.headers.get('Content-Type') || ''
    if (!contentType.includes('application/json')) {
      throw new Error('接口返回非 JSON，请检查 API 域名或代理配置')
    }
    const body = (await response.json()) as RuoYiResponse<T>
    const code = body.code ?? response.status
    if (!response.ok || code !== 200) {
      throw new Error(body.msg || `请求失败：${code}`)
    }
    return body.data as T
  }

  return {
    async verifyPickupCode(phone: string, code: string) {
      const credentials = normalizePickupCredentials(phone, code)
      const token = await request<ClientPhotoToken>(
        '/client/photo/auth/verify',
        {
          method: 'POST',
          body: JSON.stringify({
            ...credentials,
            platform: 'H5',
          }),
        },
        false,
      )
      storage.setItem(CLIENT_PHOTO_TOKEN_STORAGE_KEY, JSON.stringify(token))
      return token
    },
    listAlbums() {
      return request<ClientPhotoAlbum[]>('/client/photo/albums')
    },
    getAlbum(albumId: string) {
      return request<ClientPhotoAlbumDetail>(`/client/photo/albums/${encodeURIComponent(albumId)}`)
    },
    getPreviewUrl(assetId: string) {
      return request<ClientPhotoSignedUrl>(`/client/photo/assets/${encodeURIComponent(assetId)}/preview-url`)
    },
    getDownloadUrl(assetId: string) {
      return request<ClientPhotoSignedUrl>(`/client/photo/assets/${encodeURIComponent(assetId)}/download-url`)
    },
    listOrdersByPhone(storeId: string, phone: string, phoneLast4 = '') {
      const params = new URLSearchParams()
      if (storeId.trim()) {
        params.set('storeId', storeId.trim())
      }
      params.set('phone', phone.replace(/\D/g, ''))
      if (phoneLast4.trim()) {
        params.set('phoneLast4', phoneLast4.replace(/\D/g, ''))
      }
      return request<ClientOrderLink[]>(`/client/orders/by-phone?${params.toString()}`, {}, false)
    },
    async verifyOrderAccess(storeId: string, phone: string, phoneLast4 = '') {
      const token = await request<ClientOrderToken>(
        '/client/orders/auth/verify',
        {
          method: 'POST',
          body: JSON.stringify({
            storeId: storeId.trim(),
            phone: phone.replace(/\D/g, ''),
            phoneLast4: phoneLast4.replace(/\D/g, ''),
          }),
        },
        false,
      )
      storage.setItem(CLIENT_ORDER_TOKEN_STORAGE_KEY, JSON.stringify(token))
      return token
    },
    listOrdersByOrderToken() {
      const token = readOrderToken(storage)
      if (!token?.clientOrderToken) {
        throw new Error('订单访问已失效，请重新验证手机号')
      }
      return request<ClientOrderLink[]>(
        '/client/orders',
        {
          headers: {
            'X-Client-Order-Token': token.clientOrderToken,
          },
        },
        false,
      )
    },
    getOrderDetail(orderNo: string) {
      const token = readOrderToken(storage)
      if (!token?.clientOrderToken) {
        throw new Error('订单访问已失效，请重新验证手机号')
      }
      return request<ClientOrderLink>(
        `/client/orders/${encodeURIComponent(orderNo)}`,
        {
          headers: {
            'X-Client-Order-Token': token.clientOrderToken,
          },
        },
        false,
      )
    },
    getStoredToken() {
      return readToken(storage)
    },
    getStoredOrderToken() {
      return readOrderToken(storage)
    },
  }
}

export const clientPhotoApi = createClientPhotoApi()
