import type { Album, BookingOrder, SelectionLink } from '../../shared/stores/appStore'

export type WorkExecutionStage = 'SHOOT' | 'UPLOAD' | 'SELECTION' | 'DELIVERY'

export type WorkExecutionItem = {
  id: string
  order: BookingOrder
  album?: Album
  selectionLink?: SelectionLink
  stage: WorkExecutionStage
  stageLabel: string
  statusLabel: string
  businessDate: string
  dueAt: string
  dueLabel: string
  owner: string
  progress: number
  overdue: boolean
  nextAction: string
  actionPath: string
}

type BuildInput = {
  orders: BookingOrder[]
  albums: Album[]
  selectionLinks: SelectionLink[]
  now?: Date
}

const stageLabels: Record<WorkExecutionStage, string> = {
  SHOOT: '拍摄',
  UPLOAD: '上传',
  SELECTION: '客户选片',
  DELIVERY: '精修交付',
}

const pad2 = (value: number) => String(value).padStart(2, '0')

const addDays = (dateKey: string, days: number) => {
  const date = new Date(`${dateKey}T00:00:00`)
  if (Number.isNaN(date.getTime())) return dateKey
  date.setDate(date.getDate() + days)
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

const expireDateKey = (expire: string | undefined, year: number) => {
  const [month, day] = String(expire ?? '').split('-').map(Number)
  if (!month || !day) return ''
  return `${year}-${pad2(month)}-${pad2(day)}`
}

const toDueTimestamp = (value: string) => {
  const timestamp = new Date(value).getTime()
  return Number.isNaN(timestamp) ? Number.POSITIVE_INFINITY : timestamp
}

const matchesAlbum = (album: Album, order: BookingOrder) =>
  album.orderBackendId === order.backendId || album.orderId === order.id

const matchesSelection = (link: SelectionLink, order: BookingOrder, album?: Album) =>
  link.orderBackendId === order.backendId
  || link.orderId === order.id
  || (album != null && (link.albumBackendId === album.backendId || link.albumId === album.id))

const resolveStage = (album?: Album, link?: SelectionLink): WorkExecutionStage => {
  if ((link?.selectedCount ?? 0) > 0 || (album?.selectedCount ?? 0) > 0) return 'DELIVERY'
  if (album && (album.totalCount === 0 || album.negatives.length === 0)) return 'UPLOAD'
  if (album) return 'SELECTION'
  return 'SHOOT'
}

const stageDetails = (
  stage: WorkExecutionStage,
  order: BookingOrder,
  album: Album | undefined,
  link: SelectionLink | undefined,
  now: Date,
) => {
  const year = now.getFullYear()
  if (stage === 'SHOOT') {
    const date = order.arrivalDate || order.orderDate
    const clock = order.arrivalClock || '18:00'
    return {
      businessDate: date,
      dueAt: `${date}T${clock}:00`,
      dueLabel: order.arrivalTime || `${date} ${clock}`,
      owner: album?.photographer || '摄影组',
      progress: order.status === '拍摄中' ? 35 : 20,
      statusLabel: order.status === '拍摄中' ? '拍摄进行中' : '待到店拍摄',
      nextAction: order.status === '拍摄中' ? '完成拍摄并上传底片。' : '确认到店时间并进入拍摄。',
      actionPath: `/order/appointment?q=${encodeURIComponent(order.id)}&quick=all`,
    }
  }
  if (stage === 'UPLOAD') {
    const date = album?.date || order.arrivalDate || order.orderDate
    return {
      businessDate: date,
      dueAt: `${date}T18:00:00`,
      dueLabel: `${date.slice(5)} 18:00 前`,
      owner: album?.photographer || '摄影组',
      progress: 45,
      statusLabel: '待上传底片',
      nextAction: '进入客片管理，上传本次拍摄底片。',
      actionPath: `/service/photos?album=${encodeURIComponent(album?.id || '')}`,
    }
  }
  if (stage === 'SELECTION') {
    const date = album?.date || order.arrivalDate || order.orderDate
    const expire = expireDateKey(link?.expire, year) || addDays(date, 3)
    return {
      businessDate: date,
      dueAt: `${expire}T23:59:59`,
      dueLabel: `${expire.slice(5)} 前完成`,
      owner: '前台 / 客服',
      progress: 65,
      statusLabel: link?.visits ? `客户已访问 ${link.visits} 次` : '待客户首次选片',
      nextAction: link ? '跟进客户完成选片，必要时重发入口。' : '生成选片链接并发送给客户。',
      actionPath: link
        ? `/service/selection?open=${encodeURIComponent(link.id)}`
        : `/service/photos?album=${encodeURIComponent(album?.id || '')}`,
    }
  }
  const date = album?.date || order.arrivalDate || order.orderDate
  const dueDate = addDays(date, 2)
  return {
    businessDate: date,
    dueAt: `${dueDate}T18:00:00`,
    dueLabel: `${dueDate.slice(5)} 18:00 前`,
    owner: '修图 / 交付组',
    progress: 85,
    statusLabel: `已选 ${link?.selectedCount ?? album?.selectedCount ?? 0} 张`,
    nextAction: '确认客户选择结果，安排精修并完成交付。',
    actionPath: `/service/photos?album=${encodeURIComponent(album?.id || '')}`,
  }
}

export const buildWorkExecutionItems = ({
  orders,
  albums,
  selectionLinks,
  now = new Date(),
}: BuildInput): WorkExecutionItem[] =>
  orders
    .map(order => {
      const album = albums.find(item => matchesAlbum(item, order))
      const selectionLink = selectionLinks.find(item => matchesSelection(item, order, album))
      const stage = resolveStage(album, selectionLink)
      const details = stageDetails(stage, order, album, selectionLink, now)
      return {
        id: `${order.id}:${stage}`,
        order,
        album,
        selectionLink,
        stage,
        stageLabel: stageLabels[stage],
        ...details,
        overdue: toDueTimestamp(details.dueAt) < now.getTime(),
      }
    })
    .sort((left, right) => {
      if (left.overdue !== right.overdue) return left.overdue ? -1 : 1
      return toDueTimestamp(left.dueAt) - toDueTimestamp(right.dueAt)
    })
