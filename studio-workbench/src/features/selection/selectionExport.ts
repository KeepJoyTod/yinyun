import type { Album, SelectionLink } from '../../shared/stores/appStore'

const csvCell = (value: string | number | undefined) => {
  const normalized = String(value ?? '')
  return /[",\r\n]/.test(normalized) ? `"${normalized.replace(/"/g, '""')}"` : normalized
}

export const buildSelectionResultCsv = (link: SelectionLink, album: Album) => {
  const selectedPhotos = album.negatives.filter(photo => photo.selected)
  const rows: Array<Array<string | number | undefined>> = [
    ['客户', link.customer],
    ['手机号', link.phone],
    ['订单号', link.orderId || album.orderId],
    ['相册号', link.albumId || album.id],
    ['服务产品', link.product || album.service],
    ['已选张数', link.selectedCount],
    ['加选张数', link.extraCount],
    ['访问次数', link.visits],
    ['链接状态', link.status],
    [],
    ['序号', '照片ID', '文件名', '上传时间'],
    ...selectedPhotos.map((photo, index) => [
      index + 1,
      photo.id,
      photo.name,
      photo.uploadedAt,
    ]),
  ]

  return `\uFEFF${rows.map(row => row.map(csvCell).join(',')).join('\r\n')}`
}

export const downloadSelectionResultCsv = (link: SelectionLink, album: Album) => {
  const blob = new Blob([buildSelectionResultCsv(link, album)], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `选片结果-${link.customer || '客户'}-${link.albumId || album.id}.csv`
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}
