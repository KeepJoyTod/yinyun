import { describe, expect, it } from 'vitest'
import notificationsSource from './NotificationsView.vue?raw'
import moduleViewSource from '../merchant/modules/operations/MerchantOperationsView.vue?raw'
import boardSource from '../merchant/modules/operations/components/MerchantOpsSummaryBoard.vue?raw'
import stateSource from '../merchant/modules/operations/composables/useMerchantOperationsState.ts?raw'
import operationsSource from '../merchant/modules/operations/merchantOperationsOperations.ts?raw'

const notificationsContractSource = `${notificationsSource}\n${moduleViewSource}\n${boardSource}\n${stateSource}\n${operationsSource}`

describe('notifications page contract', () => {
  it('shows a notification operations board before templates and logs', () => {
    expect(notificationsSource).toContain('Notification Center')
    expect(notificationsContractSource).toContain('buildNotificationQuickFilters')
    expect(notificationsSource).toContain('通知模板')
    expect(notificationsSource).toContain('最近发送日志')
  })

  it('offers quick filters and a create-template action', () => {
    expect(notificationsContractSource).toContain('quickNotificationFilters')
    expect(notificationsContractSource).toContain('useMerchantOperationsState')
    expect(notificationsSource).toContain('新增模板')
    expect(notificationsContractSource).toContain('All templates')
  })

  it('uses notification template and log apis with loading and empty states', () => {
    expect(notificationsContractSource).toContain('appStore.loadNotificationTemplates')
    expect(notificationsContractSource).toContain('appStore.loadNotificationLogs')
    expect(notificationsContractSource).toContain('appStore.saveNotificationTemplate')
    expect(notificationsSource).toContain('当前筛选下没有模板')
  })
})
