export const STAFF_SESSION_KEY = 'yingyue_studio_workbench_staff_session'

export type StaffLoginInput = {
  username: string
  password: string
}

export type StaffSession = {
  username: string
  role: string
  source: 'STUDIO_WORKBENCH'
  loginAt: string
}

export const isValidStaffLogin = (input: StaffLoginInput) =>
  input.username.trim().length >= 3 && input.password.trim().length >= 6

export const createStaffSession = (username: string, role = '门店账号'): StaffSession => ({
  username: username.trim(),
  role,
  source: 'STUDIO_WORKBENCH',
  loginAt: new Date().toISOString(),
})

export const getStaffSession = (): StaffSession | null => {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(STAFF_SESSION_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as StaffSession
    return parsed?.source === 'STUDIO_WORKBENCH' && parsed.username ? parsed : null
  } catch {
    return null
  }
}

export const saveStaffSession = (session: StaffSession) => {
  window.localStorage.setItem(STAFF_SESSION_KEY, JSON.stringify(session))
}

export const clearStaffSession = () => {
  window.localStorage.removeItem(STAFF_SESSION_KEY)
}
