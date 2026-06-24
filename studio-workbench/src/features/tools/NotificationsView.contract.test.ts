import { describe, expect, it } from 'vitest'
import notificationsSource from './NotificationsView.vue?raw'

describe('notifications page contract', () => {
  it('shows a notification operations board before templates and logs', () => {
    expect(notificationsSource).toContain('notification-ops-board')
    expect(notificationsSource).toContain('通知模板')
    expect(notificationsSource).toContain('启用模板')
    expect(notificationsSource).toContain('失败发送')
    expect(notificationsSource).toContain('最近发送日志')
  })

  it('offers quick filters and a create-template action', () => {
    expect(notificationsSource).toContain('quickNotificationFilters')
    expect(notificationsSource).toContain('新增模板')
    expect(notificationsSource).toContain('全部模板')
    expect(notificationsSource).toContain('短信')
    expect(notificationsSource).toContain('失败日志')
  })

  it('uses notification template and log apis with loading and empty states', () => {
    expect(notificationsSource).toContain('appStore.loadNotificationTemplates')
    expect(notificationsSource).toContain('appStore.loadNotificationLogs')
    expect(notificationsSource).toContain('appStore.saveNotificationTemplate')
    expect(notificationsSource).toContain('模板加载失败')
    expect(notificationsSource).toContain('当前筛选下没有模板')
  })
})
