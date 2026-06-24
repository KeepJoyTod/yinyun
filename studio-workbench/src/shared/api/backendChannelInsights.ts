import type { ChannelAcceptanceCaseDto, ChannelSyncHealthDto } from './backendTypes'

export const mapChannelAcceptanceCaseRow = (row: Record<string, any>): ChannelAcceptanceCaseDto => ({
  caseKey: String(row.caseKey ?? ''),
  label: String(row.label ?? ''),
  apiName: String(row.apiName ?? ''),
  publicUrl: String(row.publicUrl ?? ''),
  endpoint: String(row.endpoint ?? ''),
  logidSource: String(row.logidSource ?? ''),
  status: String(row.status ?? ''),
  statusText: String(row.statusText ?? ''),
  requestId: String(row.requestId ?? ''),
  success: String(row.success ?? ''),
  errorMessage: String(row.errorMessage ?? ''),
  createTime: String(row.createTime ?? ''),
  hint: String(row.hint ?? ''),
})

export const mapChannelSyncHealthRow = (row: Record<string, any>): ChannelSyncHealthDto => ({
  channelType: String(row.channelType ?? ''),
  healthStatus: String(row.healthStatus ?? ''),
  message: String(row.message ?? ''),
  failedEventCount: Number(row.failedEventCount ?? 0),
  retryableEventCount: Number(row.retryableEventCount ?? 0),
  deadEventCount: Number(row.deadEventCount ?? 0),
  latestLogId: String(row.latestLogId ?? ''),
  latestWebhookTime: String(row.latestWebhookTime ?? ''),
  latestAutoSyncTime: String(row.latestAutoSyncTime ?? ''),
})
