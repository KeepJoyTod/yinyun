import { apiRequest } from './request'
import type {
  MerchantReadinessItemDto,
  MerchantReadinessPriority,
  MerchantReadinessStatus,
} from './backendTypes'

const readinessStatuses: MerchantReadinessStatus[] = ['READY', 'PARTIAL', 'BUILDING', 'BLOCKED', 'NOT_STARTED']
const readinessPriorities: MerchantReadinessPriority[] = ['P0', 'P1', 'P2']

const text = (value: unknown) => String(value ?? '').trim()
const textList = (value: unknown) => (Array.isArray(value) ? value.map(text).filter(Boolean) : [])

const normalizeStatus = (value: unknown): MerchantReadinessStatus => {
  const normalized = text(value).toUpperCase() as MerchantReadinessStatus
  return readinessStatuses.includes(normalized) ? normalized : 'NOT_STARTED'
}

const normalizePriority = (value: unknown): MerchantReadinessPriority => {
  const normalized = text(value).toUpperCase() as MerchantReadinessPriority
  return readinessPriorities.includes(normalized) ? normalized : 'P2'
}

const mapReadinessItem = (row: Record<string, any>): MerchantReadinessItemDto => ({
  moduleKey: text(row.moduleKey),
  moduleName: text(row.moduleName || row.moduleKey),
  status: normalizeStatus(row.status),
  priority: normalizePriority(row.priority),
  sourceItems: textList(row.sourceItems),
  blockers: textList(row.blockers),
  nextActions: textList(row.nextActions),
  evidenceRefs: textList(row.evidenceRefs),
})

const listReadinessItems = async (path: string): Promise<MerchantReadinessItemDto[]> => {
  const rows = await apiRequest<Record<string, any>[]>(path)
  return Array.isArray(rows) ? rows.map(mapReadinessItem) : []
}

export const merchantReadinessApi = {
  getMerchantReadinessSummary: () => listReadinessItems('/yy/merchant/readiness/summary'),
  getMerchantScheduleReadiness: () => listReadinessItems('/yy/merchant/readiness/schedule'),
  getMerchantChannelReadiness: () => listReadinessItems('/yy/merchant/readiness/channels'),
  getMerchantGovernanceReadiness: () => listReadinessItems('/yy/merchant/readiness/governance'),
  getMerchantDependencyReadiness: () => listReadinessItems('/yy/merchant/readiness/dependencies'),
}
