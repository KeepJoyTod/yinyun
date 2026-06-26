import { beforeEach, describe, expect, it, vi } from 'vitest'

const TOKEN_KEY = 'yingyue_studio_workbench_access_token'
const STAFF_SESSION_KEY = 'yingyue_studio_workbench_staff_session'

const storage = () => {
  const data = new Map<string, string>()
  return {
    getItem: vi.fn((key: string) => data.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      data.set(key, value)
    }),
    removeItem: vi.fn((key: string) => {
      data.delete(key)
    }),
    clear: vi.fn(() => data.clear()),
  }
}

describe('studio api request auth', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.unstubAllEnvs()
    vi.stubGlobal('localStorage', storage())
    vi.stubGlobal('window', {
      location: {
        origin: 'http://127.0.0.1:5190',
        pathname: '/',
        search: '',
        hash: '',
        assign: vi.fn(),
      },
      localStorage: globalThis.localStorage,
    })
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.evanshine.me')
    vi.stubEnv('VITE_STUDIO_LEGACY_AUTO_LOGIN', 'true')
    vi.stubEnv('VITE_STUDIO_CLIENT_ID', 'pc-client-id')
  })

  it('logs in through the RuoYi auth endpoint with browser-stored legacy credentials before API calls', async () => {
    localStorage.setItem('yingyue_studio_legacy_username', 'store-admin')
    localStorage.setItem('yingyue_studio_legacy_password', 'demo-password')
    const calls: Array<{ url: string; init?: RequestInit }> = []
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init?: RequestInit) => {
        calls.push({ url, init })
        if (url === 'https://api.evanshine.me/auth/login') {
          return new Response(
            JSON.stringify({
              code: 200,
              msg: '操作成功',
              data: { access_token: 'ruoyi-token' },
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          )
        }
        return new Response(JSON.stringify({ code: 200, rows: [], total: 0 }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }),
    )

    const { apiRequestRaw } = await import('./request')
    await apiRequestRaw('/yy/order/list')

    expect(calls[0].url).toBe('https://api.evanshine.me/auth/login')
    expect(JSON.parse(String(calls[0].init?.body))).toEqual({
      tenantId: '000000',
      username: 'store-admin',
      password: 'demo-password',
      clientId: 'pc-client-id',
      grantType: 'password',
    })
    expect(localStorage.getItem(TOKEN_KEY)).toBe('ruoyi-token')
    expect(new Headers(calls[1].init?.headers).get('Authorization')).toBe('Bearer ruoyi-token')
    expect(new Headers(calls[1].init?.headers).get('clientid')).toBe('pc-client-id')
  })

  it('does not read legacy auto-login credentials from build-time VITE env vars', async () => {
    vi.stubEnv('VITE_API_USERNAME', 'store-admin')
    vi.stubEnv('VITE_API_PASSWORD', 'must-not-be-used')
    vi.stubGlobal('fetch', vi.fn())

    const { apiRequestRaw } = await import('./request')

    await expect(apiRequestRaw('/yy/order/list')).rejects.toThrow('Legacy auto login credentials missing')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('can authenticate with staff-entered credentials instead of build-time demo credentials', async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = []
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init?: RequestInit) => {
        calls.push({ url, init })
        return new Response(
          JSON.stringify({
            code: 200,
            msg: '操作成功',
            data: { access_token: 'staff-token' },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        )
      }),
    )

    const { loginWithPassword } = await import('./request')
    await loginWithPassword({
      username: 'real-staff',
      password: 'real-password',
      code: 'a7k9',
      uuid: 'captcha-uuid',
    })

    expect(calls[0].url).toBe('https://api.evanshine.me/auth/login')
    expect(JSON.parse(String(calls[0].init?.body))).toEqual({
      tenantId: '000000',
      username: 'real-staff',
      password: 'real-password',
      code: 'a7k9',
      uuid: 'captcha-uuid',
      clientId: 'pc-client-id',
      grantType: 'password',
    })
    expect(localStorage.getItem(TOKEN_KEY)).toBe('staff-token')
  })

  it('loads captcha metadata from RuoYi when production captcha is enabled', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            code: 200,
            msg: '操作成功',
            data: { captchaEnabled: true, uuid: 'captcha-uuid', img: 'base64-img' },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      ),
    )

    const { getCaptcha } = await import('./request')
    await expect(getCaptcha()).resolves.toEqual({
      captchaEnabled: true,
      uuid: 'captcha-uuid',
      img: 'base64-img',
    })
  })

  it('exposes the stored API token for production route guards', async () => {
    localStorage.setItem(TOKEN_KEY, 'staff-token')

    const { getStoredApiToken } = await import('./request')

    expect(getStoredApiToken()).toBe('staff-token')
  })

  it('downloads backend blobs with auth headers without parsing JSON', async () => {
    localStorage.setItem(TOKEN_KEY, 'staff-token')
    const calls: Array<{ url: string; init?: RequestInit }> = []
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init?: RequestInit) => {
        calls.push({ url, init })
        return new Response('excel-bytes', {
          status: 200,
          headers: {
            'Content-Type': 'application/vnd.ms-excel',
            'Content-Disposition': 'attachment; filename=\"orders.xlsx\"',
          },
        })
      }),
    )

    const { apiRequestBlob } = await import('./request')
    const result = await apiRequestBlob('/yy/order/export', { method: 'POST', body: JSON.stringify({ status: 'CONFIRMED' }) })

    expect(calls).toHaveLength(1)
    expect(calls[0].url).toBe('https://api.evanshine.me/yy/order/export')
    expect(new Headers(calls[0].init?.headers).get('Authorization')).toBe('Bearer staff-token')
    expect(new Headers(calls[0].init?.headers).get('clientid')).toBe('pc-client-id')
    expect(result.contentType).toBe('application/vnd.ms-excel')
    expect(result.fileName).toBe('orders.xlsx')
    await expect(result.blob.text()).resolves.toBe('excel-bytes')
  })

  it('clears staff auth and redirects to login after a 401 without replaying an unauthenticated request', async () => {
    localStorage.setItem(TOKEN_KEY, 'expired-token')
    localStorage.setItem(STAFF_SESSION_KEY, '{"username":"store-admin"}')
    const calls: Array<{ url: string; init?: RequestInit }> = []
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init?: RequestInit) => {
        calls.push({ url, init })
        return new Response(JSON.stringify({ code: 401, msg: '认证失败' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        })
      }),
    )

    const { apiRequestRaw } = await import('./request')

    await expect(apiRequestRaw('/yy/order/list')).rejects.toThrow('认证已过期，请重新登录')
    expect(calls).toHaveLength(1)
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull()
    expect(localStorage.getItem(STAFF_SESSION_KEY)).toBeNull()
    expect(window.location.assign).toHaveBeenCalledWith('/login?redirect=%2F')
  })
})
