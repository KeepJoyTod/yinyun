import { computed, type ComputedRef } from 'vue'
import { appStore, type Album, type BookingOrder, type SelectionLink } from '../../shared/stores/appStore'

export type DashboardOperationCard = {
  label: string
  value: string
  desc: string
  hint: string
  scope: string
  icon: string
}

type UseDashboardOperationCardsOptions = {
  selectedDateValue: ComputedRef<string>
  selectedDateOrders: ComputedRef<BookingOrder[]>
  matchesSelectedStore: (storeBackendId?: string) => boolean
  resolveOrderForAlbum: (album: Album) => BookingOrder | undefined
  resolveOrderForSelectionLink: (link: SelectionLink) => BookingOrder | undefined
}

export const useDashboardOperationCards = ({
  selectedDateValue,
  selectedDateOrders,
  matchesSelectedStore,
  resolveOrderForAlbum,
  resolveOrderForSelectionLink,
}: UseDashboardOperationCardsOptions) => {
  const todayOperationCards = computed<DashboardOperationCard[]>(() => {
    const todayShootCount = selectedDateOrders.value.filter(
      order => ['待确认', '已确认', '拍摄中'].includes(order.status),
    ).length
    const selectedDateAlbums = appStore.albums.filter(album => {
      const order = resolveOrderForAlbum(album)
      return album.date === selectedDateValue.value && matchesSelectedStore(order?.storeBackendId)
    })
    const selectedDateSelectionLinks = appStore.selectionLinks.filter(link => {
      const album = appStore.albums.find(item => item.backendId === link.albumBackendId || item.id === link.albumId)
      const order = resolveOrderForSelectionLink(link)
      return (album?.date || order?.arrivalDate) === selectedDateValue.value && matchesSelectedStore(order?.storeBackendId)
    })
    const pendingUploadCount = selectedDateAlbums.filter(
      album => album.totalCount === 0 || album.negatives.length === 0,
    ).length
    const pendingSelectionCount = selectedDateAlbums.filter(
      album => album.status === '待客户选片' || (album.totalCount > 0 && album.selectedCount === 0),
    ).length
    const pendingDeliveryCount = selectedDateSelectionLinks.filter(
      link => link.status === '进行中' && link.selectedCount > 0,
    ).length

    return [
      {
        label: '今日待拍',
        value: String(todayShootCount),
        desc: '今日到店且还未进入选片的订单',
        hint: '先确认排期',
        scope: '订单',
        icon: 'camera',
      },
      {
        label: '待上传',
        value: String(pendingUploadCount),
        desc: '相册还没有底片，需要门店补传',
        hint: '补齐素材',
        scope: '相册',
        icon: 'upload',
      },
      {
        label: '待选片',
        value: String(pendingSelectionCount),
        desc: '客户还未完成首次选择的相册',
        hint: '提醒客户',
        scope: '选片',
        icon: 'select',
      },
      {
        label: '待交付',
        value: String(pendingDeliveryCount),
        desc: '客户已选片，需要进入修图交付',
        hint: '安排精修',
        scope: '交付',
        icon: 'deliver',
      },
    ]
  })

  return { todayOperationCards }
}
