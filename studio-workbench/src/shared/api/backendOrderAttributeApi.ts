import { apiRequest, apiRequestRaw } from './request'
import { type BackendId } from './backendId'
import { pageQuery } from './backendQueryMappers'
import { mapOrderAttributeTemplateRow } from './backendRowMappers'
import { extractRuoyiRows, mapYyOrder, type RuoyiTableResponse, type YyOrderVo } from './yingyueAdapter'
import type {
  OrderAttributeTemplatePayload,
  OrderUpdatePayload,
  ProductDto,
} from './backendTypes'

type RuoyiResponse<T> = {
  code?: number
  msg?: string
  data?: T
}

type OrderAttributeApiDeps = {
  getProducts: () => ProductDto[]
}

const listRows = async <T>(path: string, query?: Record<string, string | number | boolean | null | undefined>) => {
  const response = await apiRequestRaw<RuoyiTableResponse<T>>(path, {}, { ...pageQuery, ...query })
  return extractRuoyiRows(response)
}

const toTemplatePayload = (payload: OrderAttributeTemplatePayload) => ({
  id: payload.id,
  storeId: payload.storeId,
  fieldCode: payload.fieldCode,
  fieldLabel: payload.fieldLabel,
  fieldType: payload.fieldType,
  required: payload.required ? '1' : '0',
  optionsJson: JSON.stringify(payload.options || []),
  sort: payload.sort,
  status: payload.status,
  remark: payload.remark || '',
})

export const createOrderAttributeApi = (deps: OrderAttributeApiDeps) => ({
  async listOrderAttributeTemplates(storeId?: BackendId) {
    const rows = await listRows<Record<string, any>>('/yy/orderAttributeTemplate/list', { storeId })
    return rows.map(mapOrderAttributeTemplateRow)
  },
  async createOrderAttributeTemplate(payload: OrderAttributeTemplatePayload) {
    const body = toTemplatePayload(payload)
    await apiRequestRaw<RuoyiResponse<void>>('/yy/orderAttributeTemplate', { method: 'POST', body: JSON.stringify(body) })
    const rows = await listRows<Record<string, any>>('/yy/orderAttributeTemplate/list', { storeId: payload.storeId })
    const created = rows
      .map(mapOrderAttributeTemplateRow)
      .find(item => item.storeId === payload.storeId && item.fieldCode === payload.fieldCode)
    if (!created) throw new Error('服务端未返回新建订单属性模板，请刷新后确认')
    return created
  },
  async updateOrderAttributeTemplate(payload: OrderAttributeTemplatePayload) {
    const body = toTemplatePayload(payload)
    await apiRequestRaw<RuoyiResponse<void>>('/yy/orderAttributeTemplate', { method: 'PUT', body: JSON.stringify(body) })
    return mapOrderAttributeTemplateRow(body as Record<string, any>)
  },
  async deleteOrderAttributeTemplate(id: BackendId) {
    await apiRequestRaw<RuoyiResponse<void>>(`/yy/orderAttributeTemplate/${id}`, { method: 'DELETE' })
  },
  async updateOrder(order: OrderUpdatePayload) {
    const body = {
      id: order.id,
      storeId: order.storeId,
      orderNo: order.orderNo,
      orderAttributes: order.orderAttributes,
      remark: order.remark,
    }
    await apiRequestRaw<RuoyiResponse<void>>('/yy/order', { method: 'PUT', body: JSON.stringify(body) })
    const row = await apiRequest<YyOrderVo>(`/yy/order/${order.id}`)
    return mapYyOrder(row, deps.getProducts())
  },
})
