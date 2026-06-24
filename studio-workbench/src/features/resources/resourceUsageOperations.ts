import type { ResourceUsageSummaryDto } from '../../shared/api/backend'

export const formatBytesToGb = (bytes?: number | null) => `${(Number(bytes ?? 0) / 1024 ** 3).toFixed(2)} GB`

export const computeUsagePercent = (usedBytes: number, totalQuotaBytes: number) => {
  if (totalQuotaBytes <= 0) return 0
  return Math.min(100, Math.max(0, Number(((usedBytes / totalQuotaBytes) * 100).toFixed(2))))
}

export const buildUsageSizeBackfillHint = (summary: ResourceUsageSummaryDto) =>
  summary.missingSizeCount > 0
    ? `仍有 ${summary.missingSizeCount} 条资源未回填 file_size_bytes，用量统计不是满量口径。`
    : ''

export const buildUsageEmptyState = (summary: ResourceUsageSummaryDto | null) => {
  if (!summary) {
    return {
      title: '资源用量暂不可用',
      hint: '请先检查后端资源统计接口和默认额度配置是否可读取。',
    }
  }
  if (summary.usedBytes <= 0 && summary.typeBreakdown.length === 0) {
    return {
      title: '当前没有可统计的资源大小',
      hint: '资源用量按 yy_photo_asset.file_size_bytes 聚合，没有回填大小时会展示真实空态。',
    }
  }
  return {
    title: '',
    hint: '',
  }
}
