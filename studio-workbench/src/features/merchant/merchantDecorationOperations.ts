import type { MerchantDecorationConfig } from '../../shared/api/backend'

export type TopTabKey = 'theme' | 'flow' | 'profile' | 'watermark' | 'platform' | 'menu'
export type FlowTabKey = 'home' | 'appointment' | 'category' | 'product' | 'customer' | 'confirm'

export const topTabs: Array<{ key: TopTabKey; label: string; sel: string }> = [
  { key: 'theme', label: '主题', sel: '1' },
  { key: 'flow', label: '预约流程配置', sel: '2' },
  { key: 'profile', label: '个人中心', sel: '4' },
  { key: 'watermark', label: '水印设置', sel: 'dy' },
  { key: 'platform', label: '平台配置', sel: '7' },
  { key: 'menu', label: '菜单配置', sel: '8' },
]

export const flowTabs: Array<{ key: FlowTabKey; label: string }> = [
  { key: 'home', label: '首页' },
  { key: 'appointment', label: '预约' },
  { key: 'category', label: '分类' },
  { key: 'product', label: '产品' },
  { key: 'customer', label: '客户' },
  { key: 'confirm', label: '订单确认' },
]

export const normalizeStoreScope = (value: unknown) => {
  const raw = Array.isArray(value) ? value[0] : value
  if (raw === null || raw === undefined || raw === '') return '0'
  return String(raw)
}

export const buildWechatLink = (storeId: string) => {
  const params = new URLSearchParams({
    storeId: storeId || '0',
    channelType: 'WECHAT',
  })
  return `https://weixin.yuyue123.cn/wx/?${params.toString()}`
}

export const buildPreviewProductItems = (keywordsText: string) => {
  const keywords = keywordsText
    .split(/[，,]/)
    .map(item => item.trim())
    .filter(Boolean)
  return (keywords.length ? keywords : ['写真照', '生日照', '情侣照', '轻婚纱', '好友照', '全家福']).slice(0, 6)
}

export const buildEnabledCustomerFields = (customer: MerchantDecorationConfig['bookingFlow']['customer']) => {
  const fields = [
    customer.needEmail ? '邮箱' : '',
    customer.needBirthday ? '生日' : '',
    customer.needIdCard ? '身份证' : '',
    customer.needRemark ? '备注' : '',
  ].filter(Boolean)
  return fields.length ? fields : ['姓名', '手机号']
}

export const buildPublishStatusText = (loading: boolean, status: string, publishedAt: string) => {
  if (loading) return '加载中'
  if (status === 'PUBLISHED') return publishedAt ? `已发布 ${publishedAt}` : '已发布'
  return '草稿'
}

export const buildPlatformStatus = (platform: MerchantDecorationConfig['platform']) => ({
  authMode: platform.authMode || 'RESERVED',
  syncStatus: platform.syncStatus || '未同步',
  lastSyncAt: platform.lastSyncAt || '未执行',
  previewToken: platform.previewToken || '待生成',
})

export const cloneMerchantDecorationConfig = (config: MerchantDecorationConfig) =>
  JSON.parse(JSON.stringify(config)) as MerchantDecorationConfig

export const validateDecoration = (config: MerchantDecorationConfig) => {
  if (!config.theme.brandName.trim()) return '请先填写品牌名称'
  if (!config.bookingFlow.home.homepageTitle.trim()) return '请先填写首页标题'
  if (!/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(config.theme.themeColor.trim())) return '主题配色必须是十六进制颜色值'
  if (!config.theme.shareTitle.trim()) return '请先填写分享标题'
  return ''
}
