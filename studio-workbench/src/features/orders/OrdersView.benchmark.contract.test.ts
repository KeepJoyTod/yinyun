import { describe, expect, it } from 'vitest'
import {
  domainModulesSource,
  orderAlbumActionButtonSource,
  orderAlbumActionGroupSource,
  orderAlbumInfoGridSource,
  orderAlbumSectionSource,
  orderCancelPanelSource,
  orderChannelSyncPanelSource,
  orderDetailActionSectionsSource,
  orderDetailAuxiliarySectionsSource,
  orderDetailDrawerSource,
  orderDetailDrawerWorkspaceSource,
  orderDetailFoldoutSource,
  orderPhotoAccessListSource,
  orderPhotoDeliveryStageCardSource,
  orderReschedulePanelSource,
  orderSourceContextPanelSource,
  ordersSource,
  ordersViewConsoleShellSource,
  ordersViewOverlaysSource,
  ordersViewSource,
  orderWorkspaceSource,
  realClickSmokeSource,
  useOrderAlbumActionsSource,
  useOrderDetailActionsSource,
  useOrderStaffBookingSource,
} from './OrdersView.contractSources'

describe('orders page benchmark contract', () => {
  it('adds order-status tabs above the table aligned with the reference', () => {
    expect(ordersSource).toContain('statusTab')
    expect(ordersSource).toContain('statusTabItems')
    expect(ordersSource).toContain('buildOrderStatusGroupCounts')
    expect(ordersSource).toContain('matchesOrderStatusGroup')
    expect(domainModulesSource).toContain('全部有效订单')
    expect(domainModulesSource).toContain('待服务')
    expect(domainModulesSource).toContain('服务中')
    expect(domainModulesSource).toContain('已完成')
    expect(domainModulesSource).toContain('已取消')
    expect(domainModulesSource).toContain('已退单')
    expect(ordersSource).toContain('matchesStatusTab')
    expect(ordersSource).toContain('route.query.statusTab')
  })

  it('uses JianYue-style order query labels and action entries', () => {
    ;[
      '选择门店',
      '关键字',
      '下单来源',
      '下单方式',
      '下单时间',
      '到店时间',
      '高级查询',
      '全部有效订单',
      '待服务',
      '服务中',
      '已完成',
      '待支付',
      '已取消',
      '已退单',
      '导出',
      '预约看板',
      '新增预约',
    ].forEach(label => {
      expect(ordersSource).toContain(label)
    })
  })

  it('scopes order store filters to concrete stores instead of an all-store option', () => {
    expect(ordersSource).toContain('const advancedStoreOptions = computed')
    expect(ordersSource).toContain('const defaultOrderStoreName = computed')
    expect(ordersSource).toContain('ensureConcreteStoreScope')
    expect(ordersSource).toContain('storeNameForOrderScope')
    expect(ordersSource).not.toContain('>全部门店<')
    expect(ordersSource).not.toContain("['全部门店', ...storeOptions.value]")
    expect(ordersSource).toContain('v-for="opt in advancedStoreOptions"')
  })

  it('lets the order table scroll horizontally with the mouse wheel', () => {
    expect(ordersSource).toContain('useHorizontalWheel')
    expect(ordersSource).toContain('ordersTableScrollRef')
    expect(ordersSource).toContain('ref="ordersTableScrollRef"')
  })

  it('lets staff sync Douyin Life orders and refresh shared workbench data', () => {
    expect(ordersSource).toContain('syncDouyinLifeOrders')
    expect(ordersSource).toContain('syncingDouyinOrders')
    expect(ordersSource).toContain('appStore.syncDouyinLifeOrdersAndRefresh')
    expect(ordersSource).toContain("refreshAllOrders: readQueryString(route.query.quick) === 'douyin30'")
    expect(ordersSource).toContain('同步订单')
    expect(ordersSource).toContain('同步中...')
    expect(ordersSource).toContain('抖音来客近24小时补偿同步')
    expect(ordersSource).toContain('同步近24小时抖音来客订单')
    expect(ordersSource).toContain('lastDouyinLifeOrderSync')
    expect(ordersSource).toContain('created')
    expect(ordersSource).toContain('updated')
    expect(ordersSource).toContain('lastLogId')
  })

  it('lets staff create a manual appointment from the order console', () => {
    expect(ordersSource).toContain('StaffBookingModal')
    expect(ordersSource).toContain('staffBookingOpen')
    expect(ordersSource).toContain('openStaffBookingModal')
    expect(ordersSource).toContain('handleStaffBookingCreated')
    expect(ordersSource).toContain('新增预约')
    expect(ordersViewOverlaysSource).toContain("@created=\"emit('staff-booking-created', $event)\"")
    expect(ordersViewSource).toContain('@staff-booking-created="handleStaffBookingCreated"')
  })

  it('prefills staff booking from a slot-scoped order deep link', () => {
    expect(ordersSource).toContain('buildStaffBookingInitialFromOrderScope')
    expect(useOrderStaffBookingSource).toContain('initial.date = activeStartDate.value || todayKey')
    expect(ordersSource).toContain('initial.startTime = slotRange.value.start')
    expect(ordersSource).toContain('initial.endTime = slotRange.value.end || undefined')
    expect(ordersSource).toContain('staffBookingInitial.value = buildStaffBookingInitialFromOrderScope()')
  })

  it('extends the detail drawer with product, album, and channel-sync sections', () => {
    expect(ordersSource).toContain("import OrderDetailAuxiliarySections from './OrderDetailAuxiliarySections.vue'")
    expect(ordersSource).toContain('<OrderDetailAuxiliarySections')
    expect(orderDetailAuxiliarySectionsSource).toContain('商品信息')
    expect(ordersSource).toContain('selectedOrderProduct')
    expect(ordersSource).toContain("import OrderAlbumSection from './OrderAlbumSection.vue'")
    expect(ordersSource).toContain('<OrderAlbumSection')
    expect(ordersSource).toContain('selectedOrderAlbum')
    expect(orderAlbumInfoGridSource).toContain('相册号')
    expect(orderAlbumInfoGridSource).toContain('摄影师')
    expect(orderAlbumInfoGridSource).toContain('selectedCount')
    expect(orderAlbumInfoGridSource).toContain('totalCount')
    expect(ordersSource).toContain('goToAlbum')
    expect(ordersSource).toContain("await router.push({ path: '/service/photos', query: { album: albumId } })")
    expect(ordersSource).toContain("await router.push('/service/photos')")
    expect(orderPhotoDeliveryStageCardSource).toContain('不伪造成已送达')
    expect(orderDetailAuxiliarySectionsSource).toContain('渠道同步')
    expect(ordersSource).toContain('selectedOrderSyncLogs')
  })

  it('shows photo delivery stage and real album actions in the order drawer', () => {
    expect(orderPhotoDeliveryStageCardSource).toContain('客片交付状态')
    expect(orderPhotoDeliveryStageCardSource).toContain('stage.label')
    expect(orderPhotoDeliveryStageCardSource).toContain('stage.hint')
    expect(orderPhotoDeliveryStageCardSource).toContain('showFallbackHint')
    expect(ordersSource).toContain('selectedOrderPhotoStage')
    expect(domainModulesSource).toContain('buildOrderPhotoDeliveryStage')
    expect(orderAlbumActionGroupSource).toContain("import OrderAlbumActionButton from './OrderAlbumActionButton.vue'")
    expect(orderAlbumActionGroupSource).toContain('defineEmits')
    expect(orderAlbumActionButtonSource).toContain('defineEmits')
    expect(orderAlbumActionButtonSource).toContain('loadingLabel')
    expect(orderAlbumActionButtonSource).toContain("tone === 'primary'")
    expect(ordersSource).toContain('handleOrderAlbumNotify')
    expect(ordersSource).toContain('handleOrderAlbumConfirm')
    expect(ordersSource).toContain('handleOrderAlbumDeliver')
    expect(ordersSource).toContain('appStore.notifyAlbum')
    expect(ordersSource).toContain('appStore.confirmAlbumSelection')
    expect(ordersSource).toContain('appStore.deliverAlbum')
    expect(orderAlbumActionGroupSource).toContain('通知客户')
    expect(orderAlbumActionGroupSource).toContain('客片确认')
    expect(orderAlbumActionGroupSource).toContain('资料发送')
    expect(ordersSource).toContain('@open-photo-management="goToPhotoManagement"')
  })

  it('uses customer-facing Chinese section badges instead of internal English tags', () => {
    expect(ordersSource).toContain('预约订单')
    expect(ordersSource).toContain('按天处理')
    expect(ordersSource).toContain('订单流转')
    expect(ordersSource).toContain('高级查询')
    expect(ordersSource).toContain('订单详情')
    expect(orderReschedulePanelSource).toContain('>改期<')
    expect(orderCancelPanelSource).toContain('>取消<')
    expect(orderDetailAuxiliarySectionsSource).toContain('badge="商品"')
    expect(orderDetailAuxiliarySectionsSource).toContain("'同步'")
    expect(orderDetailAuxiliarySectionsSource).toContain('badge="日志"')
    expect(orderDetailFoldoutSource).toContain('{{ badge }}')
    for (const scope of ["scope: '日期'", "scope: '门店'", "scope: '渠道'", "scope: '异常'"]) {
      expect(ordersSource).toContain(scope)
    }
    for (const scope of ["scope: '今日'", "scope: '确认'", "scope: '履约'", "scope: '客片'"]) {
      expect(domainModulesSource).toContain(scope)
    }
    for (const token of ['Booking Orders', 'Day Control', 'Order Flow', 'Advanced Filter', 'Order Detail', '>SLOT<', '>CANCEL<', '>PRODUCT<', '>SYNC<', '>TIMELINE<']) {
      expect(ordersSource).not.toContain(token)
    }
    for (const token of ["scope: 'DAY'", "scope: 'STORE'", "scope: 'CHANNEL'", "scope: 'ALERT'", "scope: 'TODAY'", "scope: 'CONFIRM'", "scope: 'SHOOT'", "scope: 'PICK'"]) {
      expect(`${ordersSource}\n${domainModulesSource}`  ).not.toContain(token)
    }
  })

  it('reuses album action availability in the order drawer before calling album APIs', () => {
    expect(ordersSource).toContain("from '../../albums/photoMgmtOperations'")
    expect(ordersSource).toContain('buildAlbumActionAvailability')
    expect(ordersSource).toContain('selectedOrderAlbumActionAvailability')
    expect(ordersSource).toContain('canNotifySelectedOrderAlbum')
    expect(ordersSource).toContain('canConfirmSelectedOrderAlbum')
    expect(ordersSource).toContain('canDeliverSelectedOrderAlbum')
    expect(ordersSource).toContain(':availability="selectedOrderAlbumActionAvailability"')
    expect(ordersSource).toContain(':can-notify="canNotifySelectedOrderAlbum"')
    expect(ordersSource).toContain(':can-confirm="canConfirmSelectedOrderAlbum"')
    expect(ordersSource).toContain(':can-deliver="canDeliverSelectedOrderAlbum"')
    expect(orderAlbumSectionSource).toContain("availability.notify.reason || '通知客户'")
    expect(orderAlbumSectionSource).toContain("availability.confirm.reason || '客片确认'")
    expect(orderAlbumSectionSource).toContain("availability.deliver.reason || '资料发送'")
    expect(orderAlbumSectionSource).toContain(':notify-disabled="!canNotify || Boolean(actionLoading)"')
    expect(orderAlbumSectionSource).toContain(':confirm-disabled="!canConfirm || Boolean(actionLoading)"')
    expect(orderAlbumSectionSource).toContain(':deliver-disabled="!canDeliver || Boolean(actionLoading)"')
    expect(orderAlbumActionGroupSource).toContain('loading-label="通知中..."')
    expect(orderAlbumActionGroupSource).toContain('loading-label="确认中..."')
    expect(orderAlbumActionGroupSource).toContain('loading-label="发送中..."')
  })

  it('shows disabled photo action reasons without relying on hover titles', () => {
    expect(orderAlbumActionGroupSource).toContain('visibleReasons')
    expect(orderAlbumActionGroupSource).toContain('defaultActionLabels')
    expect(orderAlbumActionGroupSource).toContain('v-for="reason in visibleReasons"')
    expect(orderAlbumActionGroupSource).toContain('{{ reason }}')
    expect(orderAlbumActionGroupSource).toContain('props.notifyDisabled && props.notifyTitleText')
    expect(orderAlbumActionGroupSource).toContain('props.confirmDisabled && props.confirmTitleText')
    expect(orderAlbumActionGroupSource).toContain('props.deliverDisabled && props.deliverTitleText')
    expect(orderAlbumActionGroupSource).toContain('!defaultActionLabels.has(reason)')
  })

  it('keeps the real-click smoke checking visible photo disabled reasons after delivery', () => {
    expect(realClickSmokeSource).toContain('assertPhotoActionDisabledReasons')
    expect(realClickSmokeSource).toContain('photo-disabled-reasons-after-delivery')
    expect(realClickSmokeSource).toContain('defaultPhotoActionLabels')
    expect(realClickSmokeSource).toContain('forbiddenLabels')
    expect(realClickSmokeSource).toContain('已交付')
    expect(realClickSmokeSource).toContain('通知客户')
    expect(realClickSmokeSource).toContain('客片确认')
    expect(realClickSmokeSource).toContain('资料发送')
  })

  it('refreshes album evidence after order drawer photo actions', () => {
    const albumActionBlock = ordersSource.slice(
      ordersSource.indexOf('const refreshSelectedOrderAlbumEvidence = async (albumId: string) => {'),
      ordersSource.indexOf('const handleOrderAlbumNotify = async () => {'),
    )
    expect(albumActionBlock).toContain('appStore.loadAlbumDetails(albumId)')
    expect(albumActionBlock).toContain('loadSelectedOrderPhotoAccessLogs(albumId)')
    expect(albumActionBlock).toContain('loadOrderOperationLogs()')
    expect(albumActionBlock).toContain('await refreshSelectedOrderAlbumEvidence(album.id)')
  })

  it('keeps order and album context in drawer photo actions for operation-log evidence matching', () => {
    expect(useOrderDetailActionsSource).toContain('const albumBackendId = getSelectedOrderAlbumBackendId()')
    expect(useOrderDetailActionsSource).toContain('orderId: options.selectedOrder.value?.backendId')
    expect(useOrderDetailActionsSource).toContain('albumId: albumBackendId')
    expect(useOrderAlbumActionsSource).toContain('orderId: selectedOrder.value?.backendId')
    expect(useOrderAlbumActionsSource).toContain('albumId: albumBackendId')
  })

  it('shows recent photo access logs in the order drawer', () => {
    expect(ordersSource).toContain(':photo-access-logs="selectedOrderPhotoAccessLogs"')
    expect(ordersSource).toContain('selectedOrderPhotoAccessLogs')
    expect(ordersSource).toContain('orderPhotoAccessLoading')
    expect(ordersSource).toContain('orderPhotoAccessError')
    expect(ordersSource).toContain('appStore.loadPhotoAccessLogs')
    expect(ordersSource).toContain('photoAccessLogsByAlbum')
    expect(orderPhotoAccessListSource).toContain('最近访问')
    expect(orderPhotoAccessListSource).toContain('yy_photo_access_log')
    expect(orderPhotoAccessListSource).toContain('last 5')
    expect(orderPhotoAccessListSource).toContain('访问日志加载失败')
    expect(orderPhotoAccessListSource).toContain('暂无客户访问记录')
    expect(orderPhotoAccessListSource).toContain("row.success === '失败'")
  })

  it('lets staff jump from order drawer photo access logs to the album workspace', () => {
    expect(orderPhotoAccessListSource).toContain('查看更多')
    expect(orderPhotoAccessListSource).toContain("emit('viewMore')")
    expect(orderPhotoAccessListSource).toContain('查看完整访问记录和客片明细')
    expect(orderAlbumSectionSource).toContain('@view-more=')
    expect(orderAlbumSectionSource).toContain("emit('viewMorePhotoAccess', album.id)")
    expect(orderAlbumSectionSource).toContain('viewMorePhotoAccess: [albumId: string]')
    expect(orderDetailDrawerWorkspaceSource).toContain('@view-more-photo-access="$emit(\'openAlbum\', $event)"')
    expect(orderDetailDrawerSource).toContain('@view-more-photo-access="emit(\'openAlbum\', $event)"')
    expect(ordersSource).toContain('@open-album="goToAlbum"')
    expect(ordersSource).toContain("await router.push({ path: '/service/photos', query: { album: albumId } })")
  })

  it('shows channel sync troubleshooting details and copy text in the order drawer', () => {
    expect(ordersSource).toContain('getOrderChannelSyncLogs')
    expect(ordersSource).toContain('buildOrderChannelDiagnosticText')
    expect(ordersSource).toContain('copyOrderChannelDiagnostic')
    expect(orderDetailAuxiliarySectionsSource).toContain("import OrderChannelSyncPanel from './OrderChannelSyncPanel.vue'")
    expect(ordersSource).toContain('@copy-channel-diagnostic="copyOrderChannelDiagnostic"')
    expect(orderChannelSyncPanelSource).toContain("copied ? '已复制排障' : '复制排障'")
    expect(orderChannelSyncPanelSource).toContain('requestId/logid')
    expect(orderChannelSyncPanelSource).toContain('失败原因')
    expect(orderChannelSyncPanelSource).toContain('可重试')
    expect(domainModulesSource).toContain('错误信息')
    expect(orderChannelSyncPanelSource).toContain('备注')
    expect(ordersSource).toContain("copiedField === 'channelDiagnostic'")
  })

  it('shows a safe source context section in the order drawer', () => {
    expect(ordersSource).toContain('selectedOrderSourceContext')
    expect(ordersSource).toContain('buildOrderSourceContext')
    expect(orderDetailActionSectionsSource).toContain("import OrderSourceContextPanel from './OrderSourceContextPanel.vue'")
    expect(orderDetailActionSectionsSource).toContain('<OrderSourceContextPanel')
    expect(ordersSource).toContain(':source-context="selectedOrderSourceContext"')
    expect(ordersSource).toContain(':tone-styles="orderTimelineToneStyles"')
    expect(orderDetailActionSectionsSource).toContain(':context="sourceContext"')
    expect(orderDetailActionSectionsSource).toContain(':tone-styles="toneStyles"')
    expect(orderSourceContextPanelSource).toContain('来源上下文')
    expect(orderSourceContextPanelSource).toContain('context.description')
    expect(orderSourceContextPanelSource).toContain('v-for="detail in context.details"')
    expect(domainModulesSource).toContain('微表单转预约')
    expect(domainModulesSource).toContain('员工手工预约')
    expect(domainModulesSource).toContain('抖音来客同步订单')
  })

  it('uses a compact operational header and stronger table surface', () => {
    expect(ordersViewSource).toContain("import OrdersViewConsoleShell from './OrdersViewConsoleShell.vue'")
    expect(ordersViewSource).toContain('<OrdersViewConsoleShell')
    expect(ordersViewConsoleShellSource).toContain("import OrderConsoleHeader from './OrderConsoleHeader.vue'")
    expect(ordersViewConsoleShellSource).toContain('<OrderConsoleHeader')
    expect(ordersSource).toContain('订单处理台')
    expect(ordersSource).toContain('orders-hero yy-glass-panel yy-console-hero rounded-2xl px-5 py-4')
    expect(ordersSource).toContain('orderScopeLabel')
    expect(ordersSource).toContain('近30天来客')
    expect(ordersSource).not.toContain('今日作战队列')
    expect(ordersSource).toContain('orderPipelineCards')
    expect(ordersSource).toContain('orders-ops-board border-b border-amber-topbar-border/60 bg-amber-content-bg px-5 py-4')
    expect(ordersSource).toContain('tabular-nums')
  })

  it('makes the appointment page a true day-based processing console', () => {
    expect(orderWorkspaceSource).toContain("import OrderDayBoard from './OrderDayBoard.vue'")
    expect(orderWorkspaceSource).toContain('<OrderDayBoard')
    expect(orderWorkspaceSource).toContain("import OrderOpsBoard from './OrderOpsBoard.vue'")
    expect(orderWorkspaceSource).toContain('<OrderOpsBoard')
    expect(ordersSource).toContain('dayCommandCards')
    expect(ordersSource).toContain('按天处理')
    expect(ordersSource).toContain('orders-day-board rounded-md border border-amber-topbar-border bg-amber-content-bg px-5 py-4')
    expect(ordersSource).toContain('门店筛选')
    expect(ordersSource).toContain('渠道筛选')
    expect(ordersSource).toContain('冲突提示')
    expect(ordersSource).toContain('inventoryConflictOrders')
    expect(ordersSource).toContain('missingInfoOrders')
    expect(ordersSource).toContain('处理动作')
  })

  it('scopes inventory conflict alerts to the actual overlapping slot', () => {
    expect(ordersSource).toContain('getOrderInventoryConflictSlot')
    expect(ordersSource).toContain('getOrderInventoryConflictSlot(order, appStore.bookingInventory)')
    expect(domainModulesSource).toContain('arrivalMinutes >= start && arrivalMinutes < end')
  })
})
