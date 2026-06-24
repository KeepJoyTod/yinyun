import { describe, expect, it } from 'vitest'
import orderDetailSource from '../views/CustomerOrderDetailView.vue?raw'
import apiSource from './clientPhotoApi.ts?raw'
import routerSource from '../router/index.ts?raw'

describe('customer order detail page contracts', () => {
  it('keeps order detail under customer web routes and requires phone verification', () => {
    expect(routerSource).toContain('CustomerOrderDetailView.vue')
    expect(orderDetailSource).toContain('订单详情')
    expect(orderDetailSource).toContain('请输入下单时预留的手机号')
    expect(orderDetailSource).toContain('不支持只用尾号查询')
    expect(orderDetailSource).toContain('verifyOrderAccess')
    expect(orderDetailSource).toContain('getOrderDetail')
  })

  it('uses tokenized client order API and shows pickup recovery actions', () => {
    expect(apiSource).toContain('/client/orders/auth/verify')
    expect(apiSource).toContain('X-Client-Order-Token')
    expect(orderDetailSource).not.toContain('clientPhotoApi.listOrdersByPhone')
    expect(orderDetailSource).not.toContain('route.query.storeId')
    expect(orderDetailSource).not.toContain('|| orders[0]')
    expect(orderDetailSource).toContain('打开取片入口')
    expect(orderDetailSource).toContain('输入取片码')
    expect(orderDetailSource).toContain('联系门店')
  })
})
