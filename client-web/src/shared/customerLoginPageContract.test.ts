import { describe, expect, it } from 'vitest'
import customerLoginSource from '../views/CustomerLoginView.vue?raw'

describe('customer login page contracts', () => {
  it('explains what customers need before entering a private album', () => {
    expect(customerLoginSource).toContain('pickup-login-layout')
    expect(customerLoginSource).toContain('取片前确认')
    expect(customerLoginSource).toContain('预留手机号')
    expect(customerLoginSource).toContain('门店发送的取片码')
    expect(customerLoginSource).toContain('相册有效期内')
  })

  it('keeps privacy and recovery actions visible on the login page', () => {
    expect(customerLoginSource).toContain('pickup-login-assurance')
    expect(customerLoginSource).toContain('私密相册')
    expect(customerLoginSource).toContain('短期授权')
    expect(customerLoginSource).toContain('去小程序预约')
    expect(customerLoginSource).toContain('联系门店')
    expect(customerLoginSource).toContain('返回首页')
  })
})
