import { describe, expect, it } from 'vitest'
import staffLoginSource from './StaffLoginView.vue?raw'

describe('staff login page contract', () => {
  it('keeps staff workbench login separate from customer pickup', () => {
    expect(staffLoginSource).toContain('staff-login-page')
    expect(staffLoginSource).toContain('员工工作台')
    expect(staffLoginSource).toContain('客户入口走客户官网或小程序')
    expect(staffLoginSource).toContain('不使用此登录态')
  })

  it('shows the staff daily work scope before login', () => {
    expect(staffLoginSource).toContain('staff-login-scope')
    expect(staffLoginSource).toContain('今日要处理')
    expect(staffLoginSource).toContain('订单确认')
    expect(staffLoginSource).toContain('拍摄日程')
    expect(staffLoginSource).toContain('客片交付')
    expect(staffLoginSource).toContain('在线选片')
  })

  it('explains security and post-login destination', () => {
    expect(staffLoginSource).toContain('staff-login-security')
    expect(staffLoginSource).toContain('登录后进入主控台')
    expect(staffLoginSource).toContain('API 模式使用真实后台账号')
    expect(staffLoginSource).toContain('API 模式已连接真实后台')
    expect(staffLoginSource).toContain('当前使用门店账号和密码登录')
    expect(staffLoginSource).toContain('按后台配置显示')
    expect(staffLoginSource).not.toContain('使用门店账号、密码和验证码登录')
    expect(staffLoginSource).toContain('门店管理员')
  })

  it('does not prefill the demo password in API mode', () => {
    expect(staffLoginSource).toContain("password: ''")
    expect(staffLoginSource).toContain("isDemoRuntime() ? '请输入本地预览密码' : '请输入真实后台密码'")
    expect(staffLoginSource).toContain("username: ''")
  })

  it('uses backend authentication and lets the route guard load authorization', () => {
    expect(staffLoginSource).toContain('loginWithPassword')
    expect(staffLoginSource).not.toContain('appStore.bootstrap')
    expect(staffLoginSource).toContain("VITE_STUDIO_DEMO !== 'false'")
  })

  it('supports RuoYi captcha in API mode', () => {
    expect(staffLoginSource).toContain('getCaptcha')
    expect(staffLoginSource).toContain('captchaEnabled')
    expect(staffLoginSource).toContain('验证码')
    expect(staffLoginSource).toContain('refreshCaptcha')
    expect(staffLoginSource).toContain("VITE_STUDIO_LOGIN_CAPTCHA !== 'true'")
  })

  it('uses a split login layout with a left context rail and a right login side panel', () => {
    expect(staffLoginSource).toContain('md:grid-cols-[minmax(0,1fr)_430px]')
    expect(staffLoginSource).toContain('items-start')
    expect(staffLoginSource).toContain('md:sticky md:top-0')
    expect(staffLoginSource).toContain('门店工作台登录')
    expect(staffLoginSource).toContain('Store Staff Only')
    expect(staffLoginSource).toContain('今日要处理')
  })
})
