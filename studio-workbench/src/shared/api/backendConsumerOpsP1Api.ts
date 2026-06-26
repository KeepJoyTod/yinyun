import { apiRequest } from './request'
import type {
  ConsumerOpsP1ItemDto,
  ConsumerOpsP1OverviewDto,
  ConsumerOpsP1Risk,
  ConsumerOpsP1Status,
} from './backendTypesConsumerOpsP1'

const statuses: ConsumerOpsP1Status[] = ['SCAFFOLD', 'BUILDING', 'NOT_CONNECTED']
const risks: ConsumerOpsP1Risk[] = ['LOW', 'MEDIUM', 'HIGH']

const text = (value: unknown) => String(value ?? '').trim()
const textList = (value: unknown) => (Array.isArray(value) ? value.map(text).filter(Boolean) : [])

const normalizeStatus = (value: unknown): ConsumerOpsP1Status => {
  const normalized = text(value).toUpperCase() as ConsumerOpsP1Status
  return statuses.includes(normalized) ? normalized : 'SCAFFOLD'
}

const normalizeRisk = (value: unknown): ConsumerOpsP1Risk => {
  const normalized = text(value).toUpperCase() as ConsumerOpsP1Risk
  return risks.includes(normalized) ? normalized : 'MEDIUM'
}

const mapItem = (row: Record<string, any>): ConsumerOpsP1ItemDto => ({
  itemKey: text(row.itemKey),
  itemName: text(row.itemName || row.itemKey),
  status: normalizeStatus(row.status),
  risk: normalizeRisk(row.risk),
  sourceItems: textList(row.sourceItems),
  existingOwners: textList(row.existingOwners),
  missingCapabilities: textList(row.missingCapabilities),
  nextSteps: textList(row.nextSteps),
  evidenceRefs: textList(row.evidenceRefs),
})

const mapOverview = (row: Record<string, any>): ConsumerOpsP1OverviewDto => ({
  title: text(row.title || 'P1 消费者体验与商户运营闭环'),
  status: normalizeStatus(row.status),
  updatedAt: text(row.updatedAt),
  items: Array.isArray(row.items) ? row.items.map(mapItem) : [],
  dataLedgers: textList(row.dataLedgers),
  deliveryStandard: textList(row.deliveryStandard),
})

export const consumerOpsP1Api = {
  getConsumerOpsP1Overview: async () => mapOverview(await apiRequest<Record<string, any>>('/yy/merchant/consumer-ops-p1/overview')),
}
