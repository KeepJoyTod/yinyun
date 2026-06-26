import { describe, expect, it } from 'vitest'
import routerSource from '../../../app/router/index.ts?raw'
import featureRegistrySource from '../../../app/router/featureRegistry.ts?raw'
import backendSource from '../../../shared/api/backend.ts?raw'
import backendTypesSource from '../../../shared/api/backendTypes.ts?raw'
import cardBatchTypesSource from '../../../shared/api/backendTypesCardBatchOrder.ts?raw'
import apiSource from '../../../shared/api/backendCardBatchOrderApi.ts?raw'
import viewSource from './OrderCardBatchView.vue?raw'
import composableSource from './useOrderCardBatch.ts?raw'
import scaffoldSource from './orderCardBatchScaffold.ts?raw'

const orderCardBatchContractSource = [
  routerSource,
  featureRegistrySource,
  backendSource,
  backendTypesSource,
  cardBatchTypesSource,
  apiSource,
  viewSource,
  composableSource,
  scaffoldSource,
].join('\n')

describe('order card batch scaffold contract', () => {
  it('registers a dedicated order owner route instead of hiding batch actions in derived pages', () => {
    expect(routerSource).toContain('OrderCardBatchView.vue')
    expect(featureRegistrySource).toContain("'order-card-batch'")
    expect(featureRegistrySource).toContain("'/order/card-batch'")
    expect(featureRegistrySource).toContain("'yy:order:add'")
  })

  it('keeps batch card request contracts on a dedicated api slice', () => {
    expect(backendTypesSource).toContain("export type * from './backendTypesCardBatchOrder'")
    expect(orderCardBatchContractSource).toContain('export type CardBatchOrderDto = {')
    expect(orderCardBatchContractSource).toContain('export type CardBatchOrderCreatePayload = {')
    expect(orderCardBatchContractSource).toContain('export type CardBatchOrderListQuery = {')
    expect(backendSource).toContain('cardBatchOrderApi')
    expect(backendSource).toContain('...cardBatchOrderApi')
    expect(apiSource).toContain("'/yy/card-batch-orders'")
  })

  it('keeps one owner page with explicit approval boundary and summary scaffold helpers', () => {
    expect(composableSource).toContain('createCardBatchOrder')
    expect(composableSource).toContain('listCardBatchOrders')
    expect(scaffoldSource).toContain('buildOrderCardBatchSummaryCards')
    expect(scaffoldSource).toContain('toOrderCardBatchPayload')
    expect(viewSource).toContain('批量新建卡项订单脚手架')
    expect(viewSource).toContain('提交审批申请')
    expect(viewSource).toContain('yy_risk_approval')
  })
})
