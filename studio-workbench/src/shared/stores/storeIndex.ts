/**
 * storeIndex.ts — 统一域 store 入口
 *
 * 所有域 store 在此集中导出，外部消费者按需引用。
 * appStore 仍作为 facade 保留，维持对 62+ 导入方的向后兼容。
 */

// --- 核心身份与权限 ---
export { studioAccessStore, ensureStudioAccess } from './studioAccessStore'

// --- 门店列表（appStore.stores） ---
// 门店列表仍由 appStore 维护，不单独拆 store
// 门店选择逻辑（选中门店 scope）由前端 store-selection 机制管理

// --- 产品 ---
export { productStore } from './productStore'

// --- 订单 / 排期 / 库存 / 仪表盘 ---
export { ordersStore } from './ordersStore'

// --- 相册 / 选片 ---
export { albumsStore } from './albumsStore'

// --- 客户 ---
export { customersStore } from './customersStore'

// --- 渠道（抖音来客 / 美团 / 同步日志 / 商品映射） ---
export { channelStore } from './channelStore'

// --- 设置（员工 / 服务组 / 通知模板 / 通知日志） ---
export { settingsStore } from './settingsStore'

// --- 操作日志 ---
export { operationLogStore } from './operationLogStore'