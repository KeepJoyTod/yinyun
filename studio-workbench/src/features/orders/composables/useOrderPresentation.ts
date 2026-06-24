export function useOrderPresentation() {
  const columns = ['订单号', '客户', '门店', '服务产品', '来源 / 方式', '下单时间', '到店时间', '状态']
  const tableColumns = [...columns, '下一步']

  const statusStyles: Record<string, string> = {
    '已确认': 'bg-[var(--color-status-confirmed-bg)] text-[var(--color-status-confirmed)] border border-[var(--color-status-confirmed-border)]',
    '待确认': 'bg-[var(--color-status-pending-bg)] text-[var(--color-status-pending)] border border-[var(--color-status-pending-border)]',
    '拍摄中': 'bg-[var(--color-status-shooting-bg)] text-[var(--color-status-shooting)] border border-[var(--color-status-shooting-border)]',
    '选片中': 'bg-[var(--color-status-selecting-bg)] text-[var(--color-status-selecting)] border border-[var(--color-status-selecting-border)]',
    '已完成': 'bg-[var(--color-status-done-bg)] text-[var(--color-status-done)] border border-[var(--color-status-done-border)]',
    '已取消': 'bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger)] border border-[var(--color-status-danger-border)]',
    '已退单': 'bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger)] border border-[var(--color-status-danger-border)]',
    '待支付': 'bg-[var(--color-status-pending-bg)] text-[var(--color-status-pending)] border border-[var(--color-status-pending-border)]',
  }

  const photoDeliveryStageStyles: Record<string, string> = {
    NO_ALBUM: 'border-hairline bg-surface-1 text-ink-muted',
    WAITING_UPLOAD: 'border-[var(--color-status-pending-border)] bg-[var(--color-status-pending-bg)] text-[var(--color-status-pending)]',
    READY_NOTIFY: 'border-hairline bg-surface-1 text-ink',
    READY_CONFIRM: 'border-[var(--color-status-selecting-border)] bg-[var(--color-status-selecting-bg)] text-[var(--color-status-selecting)]',
    DELIVERED: 'border-[var(--color-status-done-border)] bg-[var(--color-status-done-bg)] text-[var(--color-status-done)]',
  }

  const orderTimelineToneStyles: Record<string, string> = {
    neutral: 'border-hairline text-ink-muted',
    pending: 'border-[var(--color-status-pending-border)] text-[var(--color-status-pending)]',
    warn: 'border-[var(--color-status-pending-border)] text-[var(--color-status-pending)]',
    danger: 'border-[var(--color-status-danger-border)] text-[var(--color-status-danger)]',
    done: 'border-[var(--color-status-done-border)] text-[var(--color-status-done)]',
  }

  const paymentToneMap: Record<string, 'success' | 'warn' | 'danger' | 'neutral'> = {
    '已支付': 'success',
    '部分支付': 'warn',
    '待支付': 'warn',
    '已退款': 'danger',
  }
  const paymentTone = (payment: string): 'success' | 'warn' | 'danger' | 'neutral' =>
    paymentToneMap[payment] ?? 'neutral'

  return {
    columns,
    tableColumns,
    statusStyles,
    photoDeliveryStageStyles,
    orderTimelineToneStyles,
    paymentTone,
  }
}
