import { describe, expect, it } from 'vitest'
import campaignOrdersSource from './CampaignOrdersView.vue?raw'
import routerSource from '../../app/router/index.ts?raw'
import { getWorkbenchFeature } from '../../app/router/featureRegistry'

describe('campaign orders page contract', () => {
  it('replaces the campaign order placeholder with a real route', () => {
    expect(routerSource).toContain('CampaignOrdersView.vue')
    expect(getWorkbenchFeature('order-campaign')?.component).toBe('campaign-orders')
    expect(getWorkbenchFeature('order-campaign')?.status).toBe('ready')
    expect(getWorkbenchFeature('order-campaign')?.permission).toBe('yy:order:list')
  })

  it('derives campaign orders from the unified order ledger', () => {
    expect(campaignOrdersSource).toContain('appStore.orders.map')
    expect(campaignOrdersSource).toContain('统一订单表 yy_order')
    expect(campaignOrdersSource).toContain('不建立第二套订单账本')
  })

  it('groups existing order sources into activity channels', () => {
    expect(campaignOrdersSource).toContain('抖音来客团购 / 预约转化')
    expect(campaignOrdersSource).toContain('微信扫码预约转化')
    expect(campaignOrdersSource).toContain('门店线索手工跟进')
    expect(campaignOrdersSource).toContain('DOUYIN_LIFE')
    expect(campaignOrdersSource).toContain('WECHAT')
  })

  it('keeps staff workbench focused on follow-up instead of creating bookings', () => {
    expect(campaignOrdersSource).toContain('打开统一订单')
    expect(campaignOrdersSource).toContain('跟进订单')
    expect(campaignOrdersSource).not.toContain('新建预约')
    expect(campaignOrdersSource).not.toContain('createOrder')
  })

  it('scopes campaign order view to concrete stores and preserves storeId in order deep links', () => {
    expect(campaignOrdersSource).toContain('concreteStoreOptions')
    expect(campaignOrdersSource).toContain('normalizeStoreFilter')
    expect(campaignOrdersSource).toContain('ensureWorkbenchStores')
    expect(campaignOrdersSource).toContain('scopedCampaignOrders')
    expect(campaignOrdersSource).toContain('String(item.order.storeBackendId) === storeFilter.value')
    expect(campaignOrdersSource).toContain('storeId: storeFilter.value || undefined')
    expect(campaignOrdersSource).toContain('storeId: order.storeBackendId || storeFilter.value || undefined')
    expect(campaignOrdersSource).not.toContain("router.push('/order/appointment')")
    expect(campaignOrdersSource).not.toContain("storeFilter.value !== 'all'")
    expect(campaignOrdersSource).not.toContain('<option value="all">全部门店</option>')
  })

  it('uses the shared operational-date rule for Douyin Life campaign follow-up', () => {
    expect(campaignOrdersSource).toContain('getOrderOperationalDate')
    expect(campaignOrdersSource).toContain('isMissingArrivalSchedule')
    expect(campaignOrdersSource).toContain('getOrderOperationalDate(item.order) === todayKey')
    expect(campaignOrdersSource).toContain('未预约')
    expect(campaignOrdersSource).not.toContain('|| !item.order.arrivalDate')
  })

  it('uses the current arrived-serving-completed fulfillment chain in follow-up copy', () => {
    expect(campaignOrdersSource).toContain("if (order.status === '已确认') return '客户到店后在统一订单页标记到店。'")
    expect(campaignOrdersSource).toContain("if (order.status === '已到店') return '开始服务后推进到服务中。'")
    expect(campaignOrdersSource).toContain("if (order.status === '服务中') return '服务完成后在统一订单页完成服务。'")
    expect(campaignOrdersSource).not.toContain('客户到店后推进到拍摄中。')
    expect(campaignOrdersSource).not.toContain('拍摄完成后推进选片')
  })
})
