type WorkOrderExportItem = {
  workOrderNo: string
  order: {
    id: string
    customer: string
    phone: string
    store: string
    service: string
  }
  stageLabel: string
  status: string
  priorityLabel: string
  assignee: string
  blockReason: string
  execution: {
    dueLabel: string
    overdue: boolean
    nextAction: string
  }
}

const headers = [
  '工单号',
  '订单号',
  '客户',
  '手机号',
  '门店',
  '服务',
  '环节',
  '工单状态',
  '优先级',
  '负责人',
  '要求时间',
  '是否超时',
  '阻塞原因',
  '下一步',
]

const escapeCsvCell = (value: string | number | undefined | null) => {
  const text = String(value ?? '')
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`
  return text
}

export const buildWorkOrderCsv = (workOrders: WorkOrderExportItem[]) => {
  const rows = workOrders.map(item => [
    item.workOrderNo,
    item.order.id,
    item.order.customer,
    item.order.phone,
    item.order.store,
    item.order.service,
    item.stageLabel,
    item.status,
    item.priorityLabel,
    item.assignee,
    item.execution.dueLabel,
    item.execution.overdue ? '是' : '否',
    item.blockReason,
    item.execution.nextAction,
  ])

  return `\ufeff${[headers, ...rows].map(row => row.map(escapeCsvCell).join(',')).join('\n')}`
}

export const downloadWorkOrderCsv = (workOrders: WorkOrderExportItem[], fileName: string) => {
  const csv = buildWorkOrderCsv(workOrders)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  URL.revokeObjectURL(url)
}
