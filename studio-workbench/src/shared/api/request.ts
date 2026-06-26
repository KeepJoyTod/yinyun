export type ApiResponse<T> = {
  code: number
  message?: string
  msg?: string
  data?: T
  rows?: T[]
  total?: number
}

export type PageResponse<T> = {
  items: T[]
  page: number
  pageSize: number
  total: number
}

export type CaptchaData = {
  captchaEnabled?: boolean
  uuid?: string
  img?: string
}

export type PasswordLoginInput = {
  username: string
  password: string
  code?: string
  uuid?: string
}

export type BlobResponse = {
  blob: Blob
  fileName: string
  contentType: string
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''
const TOKEN_KEY = 'yingyue_studio_workbench_access_token'
const STAFF_SESSION_KEY = 'yingyue_studio_workbench_staff_session'
const LEGACY_USERNAME_KEY = 'yingyue_studio_legacy_username'
const LEGACY_PASSWORD_KEY = 'yingyue_studio_legacy_password'
const DEFAULT_RUOYI_CLIENT_ID = 'e5cd7e4891bf95d1d19206ce24a7b32e'
const DEFAULT_TENANT_ID = '000000'

let loginPromise: Promise<string> | null = null

const buildUrl = (path: string, query?: Record<string, string | number | boolean | null | undefined>) => {
  const url = new URL(`${API_BASE}${path}`, window.location.origin)
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === null || value === undefined || value === '') continue
    url.searchParams.set(key, String(value))
  }
  return API_BASE ? url.toString() : `${url.pathname}${url.search}`
}

export const getCaptcha = async () => {
  const response = await fetch(buildUrl('/auth/code'), { method: 'GET' })
  if (!response.ok) {
    throw new Error(`Captcha failed: ${response.status}`)
  }
  const json = (await response.json()) as ApiResponse<CaptchaData>
  if (![0, 200].includes(json.code)) {
    throw new Error(json.message || json.msg || 'Captcha failed')
  }
  return json.data ?? { captchaEnabled: false }
}

export const loginWithPassword = async (input: PasswordLoginInput) => {
  const username = input.username.trim()
  const password = input.password.trim()
  const clientId = import.meta.env.VITE_STUDIO_CLIENT_ID || import.meta.env.VITE_APP_CLIENT_ID || DEFAULT_RUOYI_CLIENT_ID
  const tenantId = import.meta.env.VITE_STUDIO_TENANT_ID || import.meta.env.VITE_APP_TENANT_ID || DEFAULT_TENANT_ID
  const body: Record<string, string> = {
    tenantId,
    username,
    password,
    clientId,
    grantType: 'password',
  }
  if (input.code?.trim()) body.code = input.code.trim()
  if (input.uuid) body.uuid = input.uuid
  const response = await fetch(buildUrl('/auth/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    throw new Error(`Login failed: ${response.status}`)
  }
  const json = (await response.json()) as ApiResponse<{ access_token?: string; accessToken?: string }>
  const token = json.data?.access_token || json.data?.accessToken
  if (![0, 200].includes(json.code) || !token) {
    throw new Error(json.message || json.msg || 'Login failed')
  }
  localStorage.setItem(TOKEN_KEY, token)
  return token
}

const loginWithLegacyStoredCredentials = async () => {
  const username = localStorage.getItem(LEGACY_USERNAME_KEY)?.trim() ?? ''
  const password = localStorage.getItem(LEGACY_PASSWORD_KEY)?.trim() ?? ''
  if (!username || !password) {
    throw new Error('Legacy auto login credentials missing')
  }
  return loginWithPassword({ username, password })
}

const ensureToken = async () => {
  const cached = getStoredApiToken()
  if (cached) return cached
  if (import.meta.env.VITE_STUDIO_LEGACY_AUTO_LOGIN !== 'true') return ''
  loginPromise ??= loginWithLegacyStoredCredentials().finally(() => {
    loginPromise = null
  })
  return loginPromise
}

export const clearApiToken = () => {
  localStorage.removeItem(TOKEN_KEY)
}

const clearWorkbenchAuth = () => {
  clearApiToken()
  localStorage.removeItem(STAFF_SESSION_KEY)
}

const redirectToLogin = () => {
  if (typeof window === 'undefined') return
  const { pathname, search, hash } = window.location
  if (pathname === '/login') return
  const redirect = `${pathname}${search}${hash}`
  window.location.assign(`/login?redirect=${encodeURIComponent(redirect)}`)
}

const handleUnauthorized = () => {
  clearWorkbenchAuth()
  redirectToLogin()
  throw new Error('认证已过期，请重新登录')
}

export const getStoredApiToken = () =>
  localStorage.getItem(TOKEN_KEY) ||
  localStorage.getItem('Admin-Token') ||
  ''

export const apiRequest = async <T>(
  path: string,
  init: RequestInit = {},
  query?: Record<string, string | number | boolean | null | undefined>,
): Promise<T> => {
  const headers = new Headers(init.headers)
  const isFormData = init.body instanceof FormData
  if (init.body && !isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const token = await ensureToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const clientId = import.meta.env.VITE_STUDIO_CLIENT_ID || import.meta.env.VITE_APP_CLIENT_ID || DEFAULT_RUOYI_CLIENT_ID
  if (clientId) headers.set('clientid', clientId)

  const response = await fetch(buildUrl(path, query), { ...init, headers })
  if (response.status === 401) handleUnauthorized()
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }

  const json = (await response.json()) as ApiResponse<T>
  if (![0, 200].includes(json.code)) {
    throw new Error(json.message || json.msg || 'Request failed')
  }
  return json.data as T
}

export const apiRequestRaw = async <T>(
  path: string,
  init: RequestInit = {},
  query?: Record<string, string | number | boolean | null | undefined>,
): Promise<T> => {
  const headers = new Headers(init.headers)
  const isFormData = init.body instanceof FormData
  if (init.body && !isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const token = await ensureToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const clientId = import.meta.env.VITE_STUDIO_CLIENT_ID || import.meta.env.VITE_APP_CLIENT_ID || DEFAULT_RUOYI_CLIENT_ID
  if (clientId) headers.set('clientid', clientId)

  const response = await fetch(buildUrl(path, query), { ...init, headers })
  if (response.status === 401) handleUnauthorized()
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }

  const json = (await response.json()) as ApiResponse<unknown>
  if (typeof json.code === 'number' && ![0, 200].includes(json.code)) {
    throw new Error(json.message || json.msg || 'Request failed')
  }
  return json as T
}

const readDownloadFileName = (contentDisposition: string | null) => {
  if (!contentDisposition) return ''
  const encoded = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1]
  if (encoded) return decodeURIComponent(encoded.replaceAll('"', ''))
  const plain = contentDisposition.match(/filename="?([^";]+)"?/i)?.[1]
  return plain ? decodeURIComponent(plain) : ''
}

export const apiRequestBlob = async (
  path: string,
  init: RequestInit = {},
  query?: Record<string, string | number | boolean | null | undefined>,
): Promise<BlobResponse> => {
  const headers = new Headers(init.headers)
  const isFormData = init.body instanceof FormData
  if (init.body && !isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const token = await ensureToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const clientId = import.meta.env.VITE_STUDIO_CLIENT_ID || import.meta.env.VITE_APP_CLIENT_ID || DEFAULT_RUOYI_CLIENT_ID
  if (clientId) headers.set('clientid', clientId)

  const response = await fetch(buildUrl(path, query), { ...init, headers })
  if (response.status === 401) handleUnauthorized()
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }

  const contentType = response.headers.get('Content-Type') ?? ''
  const blob = await response.blob()
  if (contentType.includes('application/json')) {
    const json = JSON.parse(await blob.text()) as ApiResponse<unknown>
    throw new Error(json.message || json.msg || 'Download failed')
  }

  return {
    blob,
    contentType,
    fileName: readDownloadFileName(response.headers.get('Content-Disposition')),
  }
}

export const getApiAssetUrl = (url: string | null | undefined) => {
  if (!url) return ''
  if (/^(https?:|data:|blob:)/.test(url)) return url
  return `${API_BASE}${url}`
}
