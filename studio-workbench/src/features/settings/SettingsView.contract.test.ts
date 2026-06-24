import { describe, expect, it } from 'vitest'
import settingsSource from './SettingsView.vue?raw'

describe('settings page contract', () => {
  it('shows a settings operations board for staff runtime status', () => {
    expect(settingsSource).toContain('settings-ops-board')
    expect(settingsSource).toContain('工作台安全与运行状态')
    expect(settingsSource).toContain('员工会话')
    expect(settingsSource).toContain('接口模式')
    expect(settingsSource).toContain('客户取片')
    expect(settingsSource).toContain('可运营数据')
  })

  it('documents staff/client entry boundaries', () => {
    expect(settingsSource).toContain('入口边界')
    expect(settingsSource).toContain('门店工作台 PC')
    expect(settingsSource).toContain('客户电脑网页')
    expect(settingsSource).toContain('微信/抖音小程序')
    expect(settingsSource).toContain('不混用 token')
  })

  it('derives status from existing staff session and app store state', () => {
    expect(settingsSource).toContain('getStaffSession')
    expect(settingsSource).toContain('STAFF_SESSION_KEY')
    expect(settingsSource).toContain('appStore.demoMode')
    expect(settingsSource).toContain('appStore.apiError')
    expect(settingsSource).toContain('appStore.selectionLinks')
  })

  it('uses the premium workbench visual system for high-frequency settings', () => {
    expect(settingsSource).toContain('工作台运行中枢')
    expect(settingsSource).toContain('yy-glass-panel yy-console-hero settings-hero')
    expect(settingsSource).toContain('运行体检')
    expect(settingsSource).toContain('安全等级')
    expect(settingsSource).toContain('渐变')
    expect(settingsSource).toContain('rounded-[24px]')
    expect(settingsSource).toContain('backdrop-blur')
    expect(settingsSource).toContain('yy-console-card')
  })

  it('can copy a runtime handoff package for staff support', () => {
    expect(settingsSource).toContain('复制运行交接包')
    expect(settingsSource).toContain('runtimeHandoffText')
    expect(settingsSource).toContain('copyRuntimeHandoff')
    expect(settingsSource).toContain('门店工作台只处理员工业务')
  })

  it('does not describe the default schedule as an all-store staff view', () => {
    expect(settingsSource).not.toContain('默认日程：按今日和全部门店打开')
    expect(settingsSource).toContain('默认日程：按今日和当前门店打开')
  })
})
