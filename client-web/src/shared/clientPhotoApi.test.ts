import { describe, expect, it } from 'vitest'
import {
  CLIENT_PHOTO_TOKEN_STORAGE_KEY,
  CLIENT_ORDER_TOKEN_STORAGE_KEY,
  createClientPhotoApi,
  normalizePickupCredentials,
} from './clientPhotoApi'

class MemoryStorage {
  private values = new Map<string, string>()

  getItem(key: string) {
    return this.values.get(key) ?? null
  }

  setItem(key: string, value: string) {
    this.values.set(key, value)
  }

  removeItem(key: string) {
    this.values.delete(key)
  }
}

describe('client photo api', () => {
  it('normalizes customer pickup credentials before submitting', () => {
    expect(normalizePickupCredentials(' 13800003333 ', ' pick-202606-001 ')).toEqual({
      phone: '13800003333',
      code: 'PICK-202606-001',
    })
  })

  it('posts pickup verification and stores the returned client token', async () => {
    const storage = new MemoryStorage()
    const calls: Array<{ url: string; init: RequestInit }> = []
    const token = {
      clientToken: 'client-token-001',
      expiresIn: 7200,
      expiresAt: '2099-06-10T14:00:00+08:00',
      phoneMasked: '138****3333',
      platform: 'H5' as const,
    }
    const api = createClientPhotoApi({
      apiBaseUrl: 'https://api.evanshine.me/',
      storage,
      fetcher: async (url, init) => {
        calls.push({ url: String(url), init: init ?? {} })
        return new Response(JSON.stringify({ code: 200, data: token }), {
          headers: { 'Content-Type': 'application/json' },
        })
      },
    })

    await expect(api.verifyPickupCode('13800003333', 'PICK-202606-001')).resolves.toEqual(token)

    expect(calls).toHaveLength(1)
    expect(calls[0].url).toBe('https://api.evanshine.me/client/photo/auth/verify')
    expect(calls[0].init.method).toBe('POST')
    expect(JSON.parse(String(calls[0].init.body))).toEqual({
      phone: '13800003333',
      code: 'PICK-202606-001',
      platform: 'H5',
    })
    expect(storage.getItem(CLIENT_PHOTO_TOKEN_STORAGE_KEY)).toBe(JSON.stringify(token))
  })

  it('uses the stored client token when listing albums', async () => {
    const storage = new MemoryStorage()
    storage.setItem(
      CLIENT_PHOTO_TOKEN_STORAGE_KEY,
      JSON.stringify({
        clientToken: 'client-token-002',
        expiresIn: 7200,
        expiresAt: '2099-06-10T14:00:00+08:00',
        phoneMasked: '138****3333',
        platform: 'H5',
      }),
    )
    const calls: Array<{ url: string; init: RequestInit }> = []
    const api = createClientPhotoApi({
      storage,
      fetcher: async (url, init) => {
        calls.push({ url: String(url), init: init ?? {} })
        return new Response(JSON.stringify({ code: 200, data: [] }), {
          headers: { 'Content-Type': 'application/json' },
        })
      },
    })

    await expect(api.listAlbums()).resolves.toEqual([])

    expect(calls).toHaveLength(1)
    expect(calls[0].url).toBe('/client/photo/albums')
    expect(calls[0].init.headers).toMatchObject({
      'X-Client-Token': 'client-token-002',
    })
  })

  it('loads album detail and signed preview urls with the stored client token', async () => {
    const storage = new MemoryStorage()
    storage.setItem(
      CLIENT_PHOTO_TOKEN_STORAGE_KEY,
      JSON.stringify({
        clientToken: 'client-token-003',
        expiresIn: 7200,
        expiresAt: '2099-06-10T14:00:00+08:00',
        phoneMasked: '138****3333',
        platform: 'H5',
      }),
    )
    const calls: Array<{ url: string; init: RequestInit }> = []
    const api = createClientPhotoApi({
      storage,
      fetcher: async (url, init) => {
        calls.push({ url: String(url), init: init ?? {} })
        const path = String(url)
        if (path.endsWith('/client/photo/albums/990202606080001')) {
          return new Response(JSON.stringify({
            code: 200,
            data: {
              albumId: '990202606080001',
              title: '测试相册',
              assets: [{ assetId: '1781018145736000012', fileName: 'demo.jpg' }],
            },
          }), {
            headers: { 'Content-Type': 'application/json' },
          })
        }
        const signedUrl = path.includes('/download-url')
          ? 'https://signed.example.com/demo-download.jpg'
          : 'https://signed.example.com/demo.jpg'
        return new Response(JSON.stringify({
          code: 200,
          data: {
            assetId: '1781018145736000012',
            url: signedUrl,
            expiresIn: 600,
            expiresAt: '2026-06-10T12:10:00+08:00',
            fileName: 'demo.jpg',
            contentType: 'image/jpeg',
          },
        }), {
          headers: { 'Content-Type': 'application/json' },
        })
      },
    })

    await expect(api.getAlbum('990202606080001')).resolves.toMatchObject({
      albumId: '990202606080001',
      assets: [{ assetId: '1781018145736000012' }],
    })
    await expect(api.getPreviewUrl('1781018145736000012')).resolves.toMatchObject({
      url: 'https://signed.example.com/demo.jpg',
      fileName: 'demo.jpg',
    })
    await expect(api.getDownloadUrl('1781018145736000012')).resolves.toMatchObject({
      url: 'https://signed.example.com/demo-download.jpg',
      fileName: 'demo.jpg',
    })

    expect(calls.map((call) => call.url)).toEqual([
      '/client/photo/albums/990202606080001',
      '/client/photo/assets/1781018145736000012/preview-url',
      '/client/photo/assets/1781018145736000012/download-url',
    ])
    expect(calls[0].init.headers).toMatchObject({
      'X-Client-Token': 'client-token-003',
    })
    expect(calls[1].init.headers).toMatchObject({
      'X-Client-Token': 'client-token-003',
    })
    expect(calls[2].init.headers).toMatchObject({
      'X-Client-Token': 'client-token-003',
    })
  })

  it('queries public order links by full phone without client token', async () => {
    const calls: Array<{ url: string; init: RequestInit }> = []
    const api = createClientPhotoApi({
      apiBaseUrl: 'https://api.evanshine.me',
      fetcher: async (url, init) => {
        calls.push({ url: String(url), init: init ?? {} })
        return new Response(JSON.stringify({
          code: 200,
          data: [{
            orderId: '2063173289800183809',
            orderNo: 'DYL-1095291724056029149',
            phoneMasked: '138****0000',
            pickupUrl: 'https://photo.evanshine.me/customer/albums/990202606080001',
            orderDetailUrl: 'https://photo.evanshine.me/customer/orders/DYL-1095291724056029149?storeId=7407304729216157722',
          }],
        }), {
          headers: { 'Content-Type': 'application/json' },
        })
      },
    })

    await expect(api.listOrdersByPhone('7407304729216157722', '138 0000 0000', '0000')).resolves.toMatchObject([
      {
        orderId: '2063173289800183809',
        orderNo: 'DYL-1095291724056029149',
        phoneMasked: '138****0000',
      },
    ])

    expect(calls).toHaveLength(1)
    expect(calls[0].url).toBe('https://api.evanshine.me/client/orders/by-phone?storeId=7407304729216157722&phone=13800000000&phoneLast4=0000')
    expect(calls[0].init.headers).not.toMatchObject({
      'X-Client-Token': expect.any(String),
    })
  })

  it('verifies customer order access, stores order token, and sends it in order detail requests', async () => {
    const storage = new MemoryStorage()
    const calls: Array<{ url: string; init: RequestInit }> = []
    const token = {
      clientOrderToken: 'order-token-001',
      expiresIn: 7200,
      expiresAt: '2099-06-10T14:00:00+08:00',
      phoneMasked: '138****0000',
      orders: [{
        orderId: '2063173289800183809',
        orderNo: 'DYL-1095291724056029149',
        orderDetailUrl: 'https://photo.evanshine.me/customer/orders/DYL-1095291724056029149',
      }],
    }
    const api = createClientPhotoApi({
      apiBaseUrl: 'https://api.evanshine.me',
      storage,
      fetcher: async (url, init) => {
        calls.push({ url: String(url), init: init ?? {} })
        if (String(url).endsWith('/client/orders/auth/verify')) {
          return new Response(JSON.stringify({ code: 200, data: token }), {
            headers: { 'Content-Type': 'application/json' },
          })
        }
        return new Response(JSON.stringify({ code: 200, data: token.orders[0] }), {
          headers: { 'Content-Type': 'application/json' },
        })
      },
    })

    await expect(api.verifyOrderAccess('7407304729216157722', '138 0000 0000', '0000')).resolves.toEqual(token)
    await expect(api.getOrderDetail('DYL-1095291724056029149')).resolves.toMatchObject({
      orderNo: 'DYL-1095291724056029149',
    })

    expect(calls.map((call) => call.url)).toEqual([
      'https://api.evanshine.me/client/orders/auth/verify',
      'https://api.evanshine.me/client/orders/DYL-1095291724056029149',
    ])
    expect(JSON.parse(String(calls[0].init.body))).toEqual({
      storeId: '7407304729216157722',
      phone: '13800000000',
      phoneLast4: '0000',
    })
    expect(storage.getItem(CLIENT_ORDER_TOKEN_STORAGE_KEY)).toBe(JSON.stringify(token))
    expect(calls[1].init.headers).toMatchObject({
      'X-Client-Order-Token': 'order-token-001',
    })
    expect(calls[1].url).not.toContain('storeId=')
    expect(calls[1].url).not.toContain('phone=')
  })
})
