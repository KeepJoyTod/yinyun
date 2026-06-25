import { apiRequest } from './request'
import type {
  ToolPrecisionDeliverySummaryDto,
  ToolPrecisionDeliveryTaskDto,
  ToolSampleWorkDto,
} from './backendTypes'

const demoMode = () => import.meta.env.VITE_STUDIO_DEMO === 'true'

const fallbackSampleWorks: ToolSampleWorkDto[] = [
  {
    sampleId: 'sample-demo-empty',
    title: '样片作品待接入',
    albumId: '',
    publishStatus: 'DRAFT',
    status: 'scaffold',
  },
]

const fallbackPrecisionSummary: ToolPrecisionDeliverySummaryDto = {
  audienceCount: 0,
  activeTaskCount: 0,
  deliveredCount: 0,
  status: 'scaffold',
}

const fallbackPrecisionTasks: ToolPrecisionDeliveryTaskDto[] = [
  {
    taskId: 'delivery-demo-empty',
    taskName: '精准投放待接入',
    channelType: 'UNKNOWN',
    targetLabel: '暂无后端投放日志',
    deliveryStatus: 'DRAFT',
    status: 'scaffold',
  },
]

const text = (value: unknown) => String(value ?? '')

const normalizeStatus = (value: unknown): ToolSampleWorkDto['status'] => {
  const normalized = text(value).trim().toLowerCase()
  if (normalized === 'ready' || normalized === 'active' || normalized === 'published') return 'ready'
  if (normalized === 'retired' || normalized === 'disabled') return 'retired'
  return 'scaffold'
}

const normalizePublishStatus = (value: unknown): ToolSampleWorkDto['publishStatus'] => {
  const normalized = text(value).trim().toUpperCase()
  if (normalized === 'PUBLISHED' || normalized === 'REVIEWING' || normalized === 'DRAFT') return normalized
  return 'DRAFT'
}

const normalizeDeliveryStatus = (value: unknown): ToolPrecisionDeliveryTaskDto['deliveryStatus'] => {
  const normalized = text(value).trim().toUpperCase()
  if (normalized === 'SENT' || normalized === 'SCHEDULED' || normalized === 'DRAFT') return normalized
  return 'DRAFT'
}

const mapSampleWork = (row: Record<string, any>): ToolSampleWorkDto => ({
  sampleId: text(row.sampleId),
  title: text(row.title),
  albumId: text(row.albumId),
  publishStatus: normalizePublishStatus(row.publishStatus),
  status: normalizeStatus(row.status),
})

const mapPrecisionSummary = (row: Record<string, any>): ToolPrecisionDeliverySummaryDto => ({
  audienceCount: Number(row.audienceCount ?? 0),
  activeTaskCount: Number(row.activeTaskCount ?? 0),
  deliveredCount: Number(row.deliveredCount ?? 0),
  status: normalizeStatus(row.status),
})

const mapPrecisionTask = (row: Record<string, any>): ToolPrecisionDeliveryTaskDto => ({
  taskId: text(row.taskId),
  taskName: text(row.taskName),
  channelType: text(row.channelType),
  targetLabel: text(row.targetLabel),
  deliveryStatus: normalizeDeliveryStatus(row.deliveryStatus),
  status: normalizeStatus(row.status),
})

const readOrFallback = async <T>(reader: () => Promise<T>, fallback: T) => {
  if (demoMode()) return fallback
  try {
    return await reader()
  } catch (error) {
    if (demoMode()) return fallback
    throw error
  }
}

export const toolsApi = {
  async listToolSampleWorks(): Promise<ToolSampleWorkDto[]> {
    return readOrFallback(
      async () => (await apiRequest<Record<string, any>[]>('/yy/tool-center/sample-works')).map(mapSampleWork),
      fallbackSampleWorks.map(item => ({ ...item })),
    )
  },
  async publishToolSampleWork(sampleId: string): Promise<ToolSampleWorkDto[]> {
    return readOrFallback(
      async () => (await apiRequest<Record<string, any>[]>(
        `/yy/tool-center/sample-works/${encodeURIComponent(sampleId)}/publish`,
        { method: 'POST' },
      )).map(mapSampleWork),
      fallbackSampleWorks.map(item => ({
        ...item,
        publishStatus: item.sampleId === sampleId ? 'REVIEWING' : item.publishStatus,
      })),
    )
  },
  async getPrecisionDeliverySummary(): Promise<ToolPrecisionDeliverySummaryDto> {
    return readOrFallback(
      async () => mapPrecisionSummary(await apiRequest<Record<string, any>>('/yy/tool-center/precision-delivery/summary')),
      { ...fallbackPrecisionSummary },
    )
  },
  async listPrecisionDeliveryTasks(): Promise<ToolPrecisionDeliveryTaskDto[]> {
    return readOrFallback(
      async () => (await apiRequest<Record<string, any>[]>('/yy/tool-center/precision-delivery/tasks')).map(mapPrecisionTask),
      fallbackPrecisionTasks.map(item => ({ ...item })),
    )
  },
}
