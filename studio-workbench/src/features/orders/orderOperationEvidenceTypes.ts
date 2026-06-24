export type OrderOperationEvidenceCard = {
  key: string
  action: string
  operator: string
  operatorContext: string
  happenedAt: string
  primaryDetail: string
  secondaryDetail: string
  statusLabel: '成功' | '失败'
  tone: 'done' | 'danger'
}

export type OrderDetailTimelineItem = {
  key: string
  label: string
  value: string
  hint?: string
  statusLabel?: '成功' | '失败'
  tone: 'neutral' | 'pending' | 'warn' | 'danger' | 'done'
}

export type OrderSourceContext = {
  title: string
  badge: string
  tone: 'neutral' | 'pending' | 'warn' | 'danger' | 'done'
  description: string
  details: string[]
}
