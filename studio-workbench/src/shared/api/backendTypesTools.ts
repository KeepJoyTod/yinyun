export type ToolScaffoldStatus = 'scaffold' | 'ready' | 'retired'

export type ToolSampleWorkDto = {
  sampleId: string
  title: string
  albumId?: string
  publishStatus: 'DRAFT' | 'REVIEWING' | 'PUBLISHED'
  status: ToolScaffoldStatus
}

export type ToolPrecisionDeliverySummaryDto = {
  audienceCount: number
  activeTaskCount: number
  deliveredCount: number
  status: ToolScaffoldStatus
}

export type ToolPrecisionDeliveryTaskDto = {
  taskId: string
  taskName: string
  channelType: string
  targetLabel: string
  deliveryStatus: 'DRAFT' | 'SCHEDULED' | 'SENT'
  status: ToolScaffoldStatus
}
