import { customerRequest } from './request'
import type {
  CustomerExperienceP1AssetSummary,
  CustomerExperienceP1BookingOptions,
  CustomerExperienceP1OrderVerification,
  CustomerExperienceP1ReviewDraftPayload,
  CustomerExperienceP1ReviewDraftResult,
} from '@/types/customerExperienceP1'

const root = '/api/customer/experience-p1'

const fallbackAssetSummary = (): CustomerExperienceP1AssetSummary => ({
  cardCount: 0,
  benefitCount: 0,
  couponCount: 0,
  points: 0,
  growthValue: 0,
  balanceLabel: '¥0.00',
  status: 'scaffold',
  emptyReason: '会员资产读侧已在工作台落地，消费者端核销和支付联动待后续接入。',
})

const fallbackBookingOptions = (): CustomerExperienceP1BookingOptions => ({
  status: 'scaffold',
  serviceGroups: [
    {
      serviceGroupId: '',
      name: '服务组选择待接入',
      description: '后台服务组和员工录单已落地，消费者端下单传递 serviceGroupId 待闭环。',
      capacityLabel: '按排期库存最终校验',
      status: 'scaffold',
    },
  ],
  profileFields: [
    {
      key: 'gender',
      label: '性别',
      required: false,
      inputType: 'select',
      placeholder: '后续接预约配置',
      options: ['男', '女', '不便透露'],
      status: 'scaffold',
    },
    {
      key: 'customRemark',
      label: '自定义资料',
      required: false,
      inputType: 'textarea',
      placeholder: '预约配置字段接入后展示',
      options: [],
      status: 'scaffold',
    },
  ],
  entitlementCandidates: [
    {
      candidateId: 'coupon-p1-placeholder',
      title: '优惠券/兑换券选择待接入',
      kind: 'coupon',
      status: 'unavailable',
      amountLabel: '待试算',
      reason: '商户券账本已落地，消费者下单选择与不可用原因待接入。',
      actionLabel: '查看卡券权益',
    },
    {
      candidateId: 'card-p1-placeholder',
      title: '会员卡/次卡权益待核销',
      kind: 'card',
      status: 'unavailable',
      amountLabel: '待核销',
      reason: '会员资产读侧已落地，下单按产品、门店、次数核销待实现。',
      actionLabel: '查看会员资产',
    },
  ],
  assetSummary: fallbackAssetSummary(),
  notices: [
    '本页只接 P1 脚手架，不执行真实权益核销。',
    '支付、退款和权益返还仍归 P0 交易安全闭环。',
  ],
})

const fallbackVerification = (orderId: string): CustomerExperienceP1OrderVerification => ({
  orderId,
  status: 'scaffold',
  channel: 'LOCAL',
  canDisplayCode: false,
  codeLabel: '核销码待接入',
  reason: '后台核销和渠道排障已存在，消费者端展示规则待后续接真实订单状态。',
  nextAction: '到店前请以门店确认信息为准。',
})

function fallbackAllowed(error: unknown) {
  const enabled = String(import.meta.env.PROD) !== 'true'
    && String(import.meta.env.VITE_CUSTOMER_API_FALLBACK || 'true').toLowerCase() !== 'false'
  if (!enabled) {
    throw error
  }
}

export function getCustomerExperienceP1BookingOptions(params: { productId?: string; storeId?: string } = {}) {
  const query = [
    params.productId ? `productId=${encodeURIComponent(params.productId)}` : '',
    params.storeId ? `storeId=${encodeURIComponent(params.storeId)}` : '',
  ].filter(Boolean).join('&')
  return customerRequest<CustomerExperienceP1BookingOptions>({
    url: `${root}/booking-options${query ? `?${query}` : ''}`,
    silent: true,
  }).catch((error) => {
    fallbackAllowed(error)
    return fallbackBookingOptions()
  })
}

export function getCustomerExperienceP1AssetSummary() {
  return customerRequest<CustomerExperienceP1AssetSummary>({
    url: `${root}/asset-summary`,
    silent: true,
  }).catch((error) => {
    fallbackAllowed(error)
    return fallbackAssetSummary()
  })
}

export function getCustomerExperienceP1OrderVerification(orderId: string) {
  return customerRequest<CustomerExperienceP1OrderVerification>({
    url: `${root}/order-verification/${encodeURIComponent(orderId)}`,
    silent: true,
  }).catch((error) => {
    fallbackAllowed(error)
    return fallbackVerification(orderId)
  })
}

export function createCustomerExperienceP1ReviewDraft(payload: CustomerExperienceP1ReviewDraftPayload) {
  return customerRequest<CustomerExperienceP1ReviewDraftResult>({
    url: `${root}/review-drafts`,
    method: 'POST',
    data: payload as unknown as Record<string, unknown>,
  }).catch((error) => {
    fallbackAllowed(error)
    const fallback: CustomerExperienceP1ReviewDraftResult = {
      status: 'scaffold',
      message: '评价提交脚手架已接入，评价表与渠道评价 API 待后续接线。',
      evidenceRefs: ['docs/product-function-inventory(产品功能清单).md:63'],
    }
    return fallback
  })
}
