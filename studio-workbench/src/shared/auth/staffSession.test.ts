import { describe, expect, it } from 'vitest'
import { createStaffSession, isValidStaffLogin, STAFF_SESSION_KEY } from './staffSession'

describe('staffSession', () => {
  it('keeps staff login separate from customer pickup login and API tokens', () => {
    expect(STAFF_SESSION_KEY).toBe('yingyue_studio_workbench_staff_session')
    expect(isValidStaffLogin({ username: 'store-admin', password: 'demo123456' })).toBe(true)
    expect(isValidStaffLogin({ username: '13800003333', password: '' })).toBe(false)

    expect(createStaffSession('store-admin', '门店管理员')).toMatchObject({
      username: 'store-admin',
      role: '门店管理员',
      source: 'STUDIO_WORKBENCH',
    })
  })
})
