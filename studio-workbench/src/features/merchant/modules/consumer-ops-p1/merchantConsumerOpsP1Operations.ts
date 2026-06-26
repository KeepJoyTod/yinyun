import type { ConsumerOpsP1ItemDto, ConsumerOpsP1OverviewDto } from '../../../../shared/api/backendTypesConsumerOpsP1'

export const consumerOpsP1StatusLabel = (status: ConsumerOpsP1ItemDto['status']) => {
  switch (status) {
    case 'BUILDING':
      return '建设中'
    case 'NOT_CONNECTED':
      return '未接线'
    default:
      return '脚手架'
  }
}

export const consumerOpsP1RiskLabel = (risk: ConsumerOpsP1ItemDto['risk']) => {
  switch (risk) {
    case 'HIGH':
      return '高风险'
    case 'LOW':
      return '低风险'
    default:
      return '中风险'
  }
}

export const consumerOpsP1StatusClass = (status: ConsumerOpsP1ItemDto['status']) => {
  switch (status) {
    case 'BUILDING':
      return 'border-[#B65F1E]/25 bg-[#F3E7A5] text-[#7A4A08]'
    case 'NOT_CONNECTED':
      return 'border-[#B03A3A]/25 bg-[#F4D7D7] text-[#B03A3A]'
    default:
      return 'border-[#7D9A62]/25 bg-[#DFEAD2] text-[#4C6A32]'
  }
}

export const consumerOpsP1RiskClass = (risk: ConsumerOpsP1ItemDto['risk']) => {
  switch (risk) {
    case 'HIGH':
      return 'border-[#B03A3A]/25 bg-[#F4D7D7] text-[#B03A3A]'
    case 'LOW':
      return 'border-[#7D9A62]/25 bg-[#DFEAD2] text-[#4C6A32]'
    default:
      return 'border-[#B65F1E]/25 bg-[#F3E7A5] text-[#7A4A08]'
  }
}

export const buildConsumerOpsP1Summary = (overview: ConsumerOpsP1OverviewDto | null) => {
  const items = overview?.items || []
  return {
    total: items.length,
    scaffoldCount: items.filter(item => item.status === 'SCAFFOLD').length,
    buildingCount: items.filter(item => item.status === 'BUILDING').length,
    notConnectedCount: items.filter(item => item.status === 'NOT_CONNECTED').length,
    highRiskCount: items.filter(item => item.risk === 'HIGH').length,
  }
}
