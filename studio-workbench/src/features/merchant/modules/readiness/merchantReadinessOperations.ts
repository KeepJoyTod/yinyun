import type { MerchantReadinessItemDto, MerchantReadinessPriority, MerchantReadinessStatus } from '../../../../shared/api/backendTypes'

export type MerchantReadinessSectionKey = 'summary' | 'schedule' | 'channels' | 'governance' | 'dependencies'

export type MerchantReadinessSummary = {
  total: number
  readyCount: number
  partialCount: number
  buildingCount: number
  blockedCount: number
  notStartedCount: number
  p0Count: number
  p1Count: number
  p2Count: number
}

export const merchantReadinessSections: Array<{
  key: MerchantReadinessSectionKey
  label: string
  hint: string
}> = [
  { key: 'summary', label: '总览', hint: '合并四个 readiness owner' },
  { key: 'schedule', label: '排期治理', hint: '关档、并发、库存冲突' },
  { key: 'channels', label: '渠道承接', hint: '抖音、美团、活动、表单' },
  { key: 'governance', label: '商家治理', hint: '权限、审计、高风险审批' },
  { key: 'dependencies', label: '直接依赖', hint: '订单、商品、服务、会员、营销、报表' },
]

const readinessStatusLabels: Record<MerchantReadinessStatus, string> = {
  READY: '已完成',
  PARTIAL: '部分闭环',
  BUILDING: '建设中',
  BLOCKED: '阻塞',
  NOT_STARTED: '未启动',
}

const readinessStatusClasses: Record<MerchantReadinessStatus, string> = {
  READY: 'border-[#2D7A4D]/25 bg-[#2D7A4D]/10 text-[#2D7A4D]',
  PARTIAL: 'border-[#B65F1E]/25 bg-[#B65F1E]/10 text-[#B65F1E]',
  BUILDING: 'border-[#6D5A10]/25 bg-[#F3E7A5] text-[#6D5A10]',
  BLOCKED: 'border-[#B03A3A]/25 bg-[#F4D7D7] text-[#B03A3A]',
  NOT_STARTED: 'border-[#8A847B]/25 bg-[#EAE6DF] text-[#655E54]',
}

const readinessPriorityClasses: Record<MerchantReadinessPriority, string> = {
  P0: 'border-[#B03A3A]/25 bg-[#F4D7D7] text-[#B03A3A]',
  P1: 'border-[#B65F1E]/25 bg-[#F3E7A5] text-[#7A4A08]',
  P2: 'border-[#8A847B]/25 bg-[#EAE6DF] text-[#655E54]',
}

export const readinessStatusLabel = (status: MerchantReadinessStatus) => readinessStatusLabels[status]

export const readinessStatusClass = (status: MerchantReadinessStatus) => readinessStatusClasses[status]

export const readinessPriorityClass = (priority: MerchantReadinessPriority) => readinessPriorityClasses[priority]

export const buildReadinessSummary = (items: MerchantReadinessItemDto[]): MerchantReadinessSummary => {
  const summary: MerchantReadinessSummary = {
    total: items.length,
    readyCount: 0,
    partialCount: 0,
    buildingCount: 0,
    blockedCount: 0,
    notStartedCount: 0,
    p0Count: 0,
    p1Count: 0,
    p2Count: 0,
  }

  for (const item of items) {
    switch (item.status) {
      case 'READY':
        summary.readyCount += 1
        break
      case 'PARTIAL':
        summary.partialCount += 1
        break
      case 'BUILDING':
        summary.buildingCount += 1
        break
      case 'BLOCKED':
        summary.blockedCount += 1
        break
      default:
        summary.notStartedCount += 1
        break
    }

    switch (item.priority) {
      case 'P0':
        summary.p0Count += 1
        break
      case 'P1':
        summary.p1Count += 1
        break
      default:
        summary.p2Count += 1
        break
    }
  }

  return summary
}

export const getMerchantReadinessSection = (sectionKey: MerchantReadinessSectionKey) =>
  merchantReadinessSections.find(section => section.key === sectionKey) ?? merchantReadinessSections[0]
