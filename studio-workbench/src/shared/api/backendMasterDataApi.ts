import { apiRequestRaw } from './request'
import { type BackendId } from './backendId'
import { pageQuery } from './backendQueryMappers'
import {
  mapCustomerRow,
  mapEmployeeRow,
  mapNotificationLogRow,
  mapNotificationTemplateRow,
  mapServiceGroupRow,
} from './backendRowMappers'
import { extractRuoyiRows, mapYyOrder, type RuoyiTableResponse, type YyOrderVo } from './yingyueAdapter'
import type {
  CustomerDto,
  CustomerPayload,
  EmployeeDto,
  EmployeePayload,
  NotificationLogDto,
  NotificationTemplateDto,
  NotificationTemplatePayload,
  OrderDto,
  ProductDto,
  ServiceGroupDto,
  ServiceGroupPayload,
} from './backendTypes'

type RuoyiResponse<T> = {
  code?: number
  msg?: string
  data?: T
}

type MasterDataApiDeps = {
  ensureProductsLoaded: () => Promise<void>
  getCachedProducts: () => ProductDto[]
  getServiceGroups: () => ServiceGroupDto[]
  setServiceGroups: (items: ServiceGroupDto[]) => void
  getEmployees: () => EmployeeDto[]
  setEmployees: (items: EmployeeDto[]) => void
  getCustomers: () => CustomerDto[]
  setCustomers: (items: CustomerDto[]) => void
  getNotificationTemplates: () => NotificationTemplateDto[]
  setNotificationTemplates: (items: NotificationTemplateDto[]) => void
  getNotificationLogs: () => NotificationLogDto[]
  setNotificationLogs: (items: NotificationLogDto[]) => void
}

const sameId = (left: string | number | undefined | null, right: string | number | undefined | null) =>
  String(left ?? '') === String(right ?? '')

const listRows = async <T>(path: string, query?: Record<string, string | number | boolean | null | undefined>) => {
  const response = await apiRequestRaw<RuoyiTableResponse<T>>(path, {}, { ...pageQuery, ...query })
  return extractRuoyiRows(response)
}

const findCreatedRecord = async <T>(
  path: string,
  query: Record<string, string | number | boolean | null | undefined>,
  predicate: (row: T) => boolean,
  label: string,
) => {
  const rows = await listRows<T>(path, query)
  const created = rows.find(predicate)
  if (!created) throw new Error(`服务端未返回新建${label}，请刷新后确认`)
  return created
}

const getData = async <T>(path: string) => {
  const response = await apiRequestRaw<RuoyiResponse<T>>(path)
  if (!response.data) throw new Error(`Empty response data: ${path}`)
  return response.data
}

const serviceGroupToPayload = (payload: ServiceGroupPayload) => ({
  id: payload.id,
  storeId: payload.storeId,
  groupCode: payload.groupCode,
  groupName: payload.groupName,
  capacity: payload.capacity,
  durationMinutes: payload.durationMinutes,
  status: payload.status,
  sort: payload.sort,
  remark: payload.remark,
})

const employeeToPayload = (payload: EmployeePayload) => ({
  id: payload.id,
  storeId: payload.storeId,
  userId: payload.userId ?? null,
  employeeNo: payload.employeeNo,
  employeeName: payload.employeeName,
  mobile: payload.mobile || '',
  roleType: payload.roleType || '',
  skillTags: payload.skillTags || '',
  status: payload.status || 'ACTIVE',
  sort: payload.sort ?? 0,
  remark: payload.remark || '',
})

const customerToPayload = (payload: CustomerPayload) => ({
  id: payload.id,
  customerName: payload.customerName,
  mobile: payload.mobile,
  gender: payload.gender || '',
  birthday: payload.birthday || '',
  source: payload.source || '',
  memberLevel: payload.memberLevel || '',
  tags: payload.tags || '',
  remark: payload.remark || '',
})

const notificationTemplateToPayload = (payload: NotificationTemplatePayload) => ({
  id: payload.id,
  templateCode: payload.templateCode,
  scene: payload.scene,
  channelType: payload.channelType,
  title: payload.title || '',
  content: payload.content,
  providerTemplateId: payload.providerTemplateId || '',
  enabled: payload.enabled || '1',
  remark: payload.remark || '',
})

export const createMasterDataApi = (deps: MasterDataApiDeps) => ({
  async listServiceGroups() {
    const rows = await listRows<Record<string, any>>('/yy/serviceGroup/list')
    const serviceGroups = rows.map(mapServiceGroupRow)
    deps.setServiceGroups(serviceGroups)
    return serviceGroups
  },
  async createServiceGroup(payload: ServiceGroupPayload) {
    const body = serviceGroupToPayload(payload)
    await apiRequestRaw<RuoyiResponse<void>>('/yy/serviceGroup', { method: 'POST', body: JSON.stringify(body) })
    const row = await findCreatedRecord<Record<string, any>>(
      '/yy/serviceGroup/list',
      { storeId: body.storeId, groupCode: body.groupCode },
      item => sameId(item.storeId, body.storeId) && String(item.groupCode ?? '') === body.groupCode,
      '服务组',
    )
    const created = mapServiceGroupRow(row)
    deps.setServiceGroups([created, ...deps.getServiceGroups()])
    return created
  },
  async updateServiceGroup(payload: ServiceGroupPayload) {
    const body = serviceGroupToPayload(payload)
    await apiRequestRaw<RuoyiResponse<void>>('/yy/serviceGroup', { method: 'PUT', body: JSON.stringify(body) })
    const updated = mapServiceGroupRow(body)
    deps.setServiceGroups(deps.getServiceGroups().map(item => (item.id === updated.id ? updated : item)))
    return updated
  },
  async deleteServiceGroup(id: BackendId) {
    await apiRequestRaw<RuoyiResponse<void>>(`/yy/serviceGroup/${id}`, { method: 'DELETE' })
    deps.setServiceGroups(deps.getServiceGroups().filter(item => !sameId(item.id, id)))
  },
  async listEmployees() {
    const rows = await listRows<Record<string, any>>('/yy/employee/list')
    const employees = rows.map(mapEmployeeRow)
    deps.setEmployees(employees)
    return employees
  },
  async createEmployee(payload: EmployeePayload) {
    const body = employeeToPayload(payload)
    await apiRequestRaw<RuoyiResponse<void>>('/yy/employee', { method: 'POST', body: JSON.stringify(body) })
    const row = await findCreatedRecord<Record<string, any>>(
      '/yy/employee/list',
      { storeId: body.storeId, employeeNo: body.employeeNo },
      item => sameId(item.storeId, body.storeId) && String(item.employeeNo ?? '') === body.employeeNo,
      '员工',
    )
    const created = mapEmployeeRow(row)
    deps.setEmployees([created, ...deps.getEmployees()])
    return created
  },
  async updateEmployee(payload: EmployeePayload) {
    const body = employeeToPayload(payload)
    await apiRequestRaw<RuoyiResponse<void>>('/yy/employee', { method: 'PUT', body: JSON.stringify(body) })
    const updated = mapEmployeeRow(body)
    deps.setEmployees(deps.getEmployees().map(item => (item.id === updated.id ? updated : item)))
    return updated
  },
  async listCustomers(query?: { keyword?: string }) {
    const rows = await listRows<Record<string, any>>('/yy/customer/list', query)
    const customers = rows.map(mapCustomerRow)
    deps.setCustomers(customers)
    return customers
  },
  async createCustomer(payload: CustomerPayload) {
    const body = customerToPayload(payload)
    await apiRequestRaw<RuoyiResponse<void>>('/yy/customer', { method: 'POST', body: JSON.stringify(body) })
    const row = await findCreatedRecord<Record<string, any>>(
      '/yy/customer/list',
      { keyword: body.mobile },
      item => String(item.mobile ?? '') === body.mobile,
      '客户',
    )
    const created = mapCustomerRow(row)
    deps.setCustomers([created, ...deps.getCustomers()])
    return created
  },
  async updateCustomer(payload: CustomerPayload) {
    const body = customerToPayload(payload)
    await apiRequestRaw<RuoyiResponse<void>>('/yy/customer', { method: 'PUT', body: JSON.stringify(body) })
    const current = deps.getCustomers().find(item => item.id === payload.id)
    const updated = mapCustomerRow({
      ...current,
      ...body,
      totalSpend: current?.totalSpendAmount ?? 0,
      totalOrderCount: current?.totalOrderCount ?? 0,
      lastOrderTime: current?.lastOrderTime ?? '',
    })
    deps.setCustomers(deps.getCustomers().map(item => (item.id === updated.id ? updated : item)))
    return updated
  },
  async listCustomerRecentOrders(customerId: BackendId, limit = 5): Promise<OrderDto[]> {
    await deps.ensureProductsLoaded()
    const rows = await getData<YyOrderVo[]>(`/yy/customer/${customerId}/orders?limit=${limit}`)
    return rows.map(row => mapYyOrder(row, deps.getCachedProducts()))
  },
  async listNotificationTemplates() {
    const rows = await listRows<Record<string, any>>('/yy/notificationTemplate/list')
    const templates = rows.map(mapNotificationTemplateRow)
    deps.setNotificationTemplates(templates)
    return templates
  },
  async createNotificationTemplate(payload: NotificationTemplatePayload) {
    const body = notificationTemplateToPayload(payload)
    await apiRequestRaw<RuoyiResponse<void>>('/yy/notificationTemplate', { method: 'POST', body: JSON.stringify(body) })
    const row = await findCreatedRecord<Record<string, any>>(
      '/yy/notificationTemplate/list',
      { templateCode: body.templateCode },
      item => String(item.templateCode ?? '') === body.templateCode,
      '通知模板',
    )
    const created = mapNotificationTemplateRow(row)
    deps.setNotificationTemplates([created, ...deps.getNotificationTemplates()])
    return created
  },
  async updateNotificationTemplate(payload: NotificationTemplatePayload) {
    const body = notificationTemplateToPayload(payload)
    await apiRequestRaw<RuoyiResponse<void>>('/yy/notificationTemplate', { method: 'PUT', body: JSON.stringify(body) })
    const updated = mapNotificationTemplateRow(body)
    deps.setNotificationTemplates(deps.getNotificationTemplates().map(item => (item.id === updated.id ? updated : item)))
    return updated
  },
  async listNotificationLogs() {
    const rows = await listRows<Record<string, any>>('/yy/notificationLog/list')
    const logs = rows.map(mapNotificationLogRow)
    deps.setNotificationLogs(logs)
    return logs
  },
})
