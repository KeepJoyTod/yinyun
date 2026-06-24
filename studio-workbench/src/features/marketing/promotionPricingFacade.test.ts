import { describe, expect, it } from 'vitest'
import { buildFallbackPromotionTrial } from './marketingScaffoldData'

describe('promotion pricing facade fallback', () => {
  it('prefers redeem voucher over campaign and coupon candidates', () => {
    const result = buildFallbackPromotionTrial({
      productName: '兑换券套餐',
      orderSource: '抖音活动',
      originalAmountCent: 19900,
    })

    expect(result.status).toBe('eligible')
    expect(result.appliedRuleCode).toBe('REDEEM_VOUCHER')
    expect(result.finalAmountCent).toBe(0)
  })

  it('falls back to blocked state when no candidates apply', () => {
    const result = buildFallbackPromotionTrial({
      productName: '普通服务',
      orderSource: '门店',
      originalAmountCent: 5000,
    })

    expect(result.status).toBe('blocked')
    expect(result.discountAmountCent).toBe(0)
    expect(result.blockedReasons.length).toBeGreaterThan(0)
  })
})
