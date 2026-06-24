import type { NotificationLogInfo, NotificationTemplateInfo } from '../../../../shared/stores/appStoreTypes'

export type QuickNotificationFilter = 'all' | 'sms' | 'wechat' | 'failed'

export const buildNotificationQuickFilters = (
  templates: NotificationTemplateInfo[],
  logs: NotificationLogInfo[],
) => {
  const smsTemplates = templates.filter(item => item.channelType === 'SMS')
  const wechatTemplates = templates.filter(item => item.channelType === 'WECHAT')
  const failedLogs = logs.filter(item => item.sendStatus !== 'SUCCESS')
  return [
    { key: 'all' as const, label: 'All templates', count: templates.length },
    { key: 'sms' as const, label: 'SMS', count: smsTemplates.length },
    { key: 'wechat' as const, label: 'WeChat', count: wechatTemplates.length },
    { key: 'failed' as const, label: 'Failed logs', count: failedLogs.length },
  ]
}

export const buildNotificationCards = (templates: NotificationTemplateInfo[], logs: NotificationLogInfo[]) => {
  const smsTemplates = templates.filter(item => item.channelType === 'SMS')
  const failedLogs = logs.filter(item => item.sendStatus !== 'SUCCESS')
  return [
    { label: 'Enabled templates', value: String(templates.filter(item => item.enabled === '1').length), hint: 'Templates currently available for real delivery.', scope: 'READY' },
    { label: 'SMS templates', value: String(smsTemplates.length), hint: 'Templates used for SMS reminders and follow-up.', scope: 'SMS' },
    { label: 'Failed deliveries', value: String(failedLogs.length), hint: 'Recent delivery failures that still need attention.', scope: 'FAIL' },
    { label: 'Recent logs', value: String(logs.length), hint: 'Latest delivery log rows currently loaded into the workbench.', scope: 'LOG' },
  ]
}
