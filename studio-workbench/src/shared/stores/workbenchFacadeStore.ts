import type { BackendId } from '../api/backendId'
import { albumsStore } from './albumsStore'
import type { BookingOrder, ProductConfig } from './appStoreTypes'
import { channelStore } from './channelStore'
import { customersStore } from './customersStore'
import { operationLogStore } from './operationLogStore'
import { productStore } from './productStore'
import { settingsStore } from './settingsStore'

type WorkbenchFacadeContext = {
  demoMode: boolean
  stores: any[]
  orders: BookingOrder[]
  products: ProductConfig[]
  customers: any[]
  operationLogs: any[]
  channelSyncLogs: any[]
  channelProductMappings: any[]
  douyinAcceptanceCases: any[]
  douyinSyncHealth: any
  syncProductsFromOwner: () => ProductConfig[]
  syncSettingsFromOwner: () => void
  syncCustomersFromOwner: () => any[]
  syncOperationLogsFromOwner: () => any[]
  syncChannelFromOwner: () => void
  syncAlbumsFromOwner: () => void
  syncAlbumsToOwner: () => void
}

export const loadServiceGroupsFacade = async (ctx: WorkbenchFacadeContext) => {
  if (ctx.demoMode) return (ctx as any).serviceGroups
  await settingsStore.refreshServiceGroups(ctx.stores)
  ctx.syncSettingsFromOwner()
  return (ctx as any).serviceGroups
}

export const saveServiceGroupFacade = async (ctx: WorkbenchFacadeContext, input: any) => {
  const next = ctx.demoMode
    ? settingsStore.saveServiceGroupDemo(input, ctx.stores)
    : await settingsStore.saveServiceGroup(input, ctx.stores)
  ctx.syncSettingsFromOwner()
  return next
}

export const deleteServiceGroupFacade = async (ctx: WorkbenchFacadeContext, id: BackendId) => {
  if (ctx.demoMode) settingsStore.deleteServiceGroupDemo(id)
  else await settingsStore.deleteServiceGroup(id)
  ctx.syncSettingsFromOwner()
}

export const loadEmployeesFacade = async (ctx: WorkbenchFacadeContext) => {
  if (ctx.demoMode) return (ctx as any).employees
  await settingsStore.refreshEmployees(ctx.stores)
  ctx.syncSettingsFromOwner()
  return (ctx as any).employees
}

export const saveEmployeeFacade = async (ctx: WorkbenchFacadeContext, input: any) => {
  const next = ctx.demoMode
    ? settingsStore.saveEmployeeDemo(input, ctx.stores)
    : await settingsStore.saveEmployee(input, ctx.stores)
  ctx.syncSettingsFromOwner()
  return next
}

export const loadCustomersFacade = async (ctx: WorkbenchFacadeContext, keyword = '') => {
  if (ctx.demoMode) {
    const normalized = keyword.trim().toLowerCase()
    if (!normalized) return ctx.customers
    return ctx.customers.filter(customer =>
      `${customer.name} ${customer.mobile} ${customer.tags.join(' ')} ${customer.remark}`.toLowerCase().includes(normalized),
    )
  }
  await customersStore.refresh(keyword)
  return ctx.syncCustomersFromOwner()
}

export const saveCustomerFacade = async (ctx: WorkbenchFacadeContext, input: any) => {
  const next = ctx.demoMode
    ? customersStore.saveCustomerDemo(input)
    : await customersStore.saveCustomer(input)
  ctx.syncCustomersFromOwner()
  return next
}

export const loadCustomerRecentOrdersFacade = async (
  ctx: WorkbenchFacadeContext,
  customerBackendId: BackendId,
  limit = 5,
) => {
  const customer = ctx.customers.find(item => item.backendId === customerBackendId)
  if (!customer) throw new Error('未找到客户')
  const orders = ctx.demoMode
    ? customersStore.loadDemoRecentOrders(customer, limit, ctx.orders)
    : await customersStore.refreshRecentOrders(customerBackendId, limit, ctx.stores)
  ctx.syncCustomersFromOwner()
  return orders
}

export const loadNotificationTemplatesFacade = async (ctx: WorkbenchFacadeContext) => {
  if (ctx.demoMode) return (ctx as any).notificationTemplates
  await settingsStore.refreshNotificationTemplates()
  ctx.syncSettingsFromOwner()
  return (ctx as any).notificationTemplates
}

export const saveNotificationTemplateFacade = async (ctx: WorkbenchFacadeContext, input: any) => {
  const next = ctx.demoMode
    ? settingsStore.saveNotificationTemplateDemo(input)
    : await settingsStore.saveNotificationTemplate(input)
  ctx.syncSettingsFromOwner()
  return next
}

export const loadNotificationLogsFacade = async (ctx: WorkbenchFacadeContext) => {
  if (ctx.demoMode) return (ctx as any).notificationLogs
  await settingsStore.refreshNotificationLogs(ctx.stores)
  ctx.syncSettingsFromOwner()
  return (ctx as any).notificationLogs
}

export const loadOperationLogsFacade = async (ctx: WorkbenchFacadeContext) => {
  if (ctx.demoMode) return ctx.operationLogs
  await operationLogStore.refresh()
  return ctx.syncOperationLogsFromOwner()
}

export const loadChannelSyncLogsFacade = async (ctx: WorkbenchFacadeContext) => {
  if (ctx.demoMode) return ctx.channelSyncLogs
  await channelStore.refreshChannelSyncLogs(ctx.stores)
  ctx.syncChannelFromOwner()
  return ctx.channelSyncLogs
}

export const loadChannelProductMappingsFacade = async (ctx: WorkbenchFacadeContext, channelType = 'DOUYIN_LIFE') => {
  if (ctx.demoMode) {
    return ctx.channelProductMappings.filter(item => channelType === 'all' || item.channelType === channelType)
  }
  await channelStore.refreshChannelProductMappings(channelType, ctx.stores, ctx.products)
  ctx.syncChannelFromOwner()
  return ctx.channelProductMappings
}

export const loadDouyinAcceptanceCasesFacade = async (ctx: WorkbenchFacadeContext) => {
  if (ctx.demoMode) return ctx.douyinAcceptanceCases
  await channelStore.refreshDouyinAcceptanceCases()
  ctx.syncChannelFromOwner()
  return ctx.douyinAcceptanceCases
}

export const loadDouyinSyncHealthFacade = async (ctx: WorkbenchFacadeContext) => {
  if (ctx.demoMode) return ctx.douyinSyncHealth
  await channelStore.refreshDouyinSyncHealth()
  ctx.syncChannelFromOwner()
  return ctx.douyinSyncHealth
}

export const updateProductFacade = async (ctx: WorkbenchFacadeContext, data: ProductConfig) => {
  const product = ctx.demoMode
    ? productStore.updateProductDemo(data)
    : await productStore.updateProduct(data)
  ctx.syncProductsFromOwner()
  return product
}

export const toggleProductActiveFacade = async (ctx: WorkbenchFacadeContext, product: ProductConfig) => {
  const next = ctx.demoMode
    ? productStore.toggleProductActiveDemo(product)
    : await productStore.toggleProductActive(product)
  ctx.syncProductsFromOwner()
  return next
}

export const loadSelectionStatsFacade = async (ctx: WorkbenchFacadeContext) => {
  ctx.syncAlbumsToOwner()
  if (!ctx.demoMode) await albumsStore.refreshSelectionStats()
  ctx.syncAlbumsFromOwner()
  return (ctx as any).selectionStats
}
