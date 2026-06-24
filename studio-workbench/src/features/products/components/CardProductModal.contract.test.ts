import { describe, expect, it } from 'vitest'
import cardModalViewSource from './CardProductModal.vue?raw'
import cardModalOperationsSource from './cardProductModalOperations?raw'
import cardModalUiSource from './cardProductModalUi?raw'

const cardModalSource = [cardModalViewSource, cardModalOperationsSource, cardModalUiSource].join('\n')

describe('CardProductModal contract', () => {
  it('renders add and edit modes with card type context', () => {
    expect(cardModalSource).toContain('Card Product')
    expect(cardModalSource).toContain('卡项基础')
    expect(cardModalSource).toContain('售价')
    expect(cardModalSource).toContain('充值金额')
    expect(cardModalSource).toContain('权益范围')
    expect(cardModalSource).toContain('有效期')
    expect(cardModalSource).toContain('生效方式')
  })

  it('supports both TIMES and STORED card modes', () => {
    expect(cardModalSource).toContain('cardMode')
    expect(cardModalSource).toContain("'TIMES'")
    expect(cardModalSource).toContain("'STORED'")
    expect(cardModalSource).toContain('cardSalePrice')
    expect(cardModalSource).toContain('cardRechargeAmount')
    expect(cardModalSource).toContain('cardGiftAmount')
  })

  it('includes validity mode configuration (FOREVER, AFTER_ACTIVATION, FIXED_DATE)', () => {
    expect(cardModalSource).toContain('cardValidityMode')
    expect(cardModalSource).toContain('FOREVER')
    expect(cardModalSource).toContain('AFTER_ACTIVATION')
    expect(cardModalSource).toContain('FIXED_DATE')
    expect(cardModalSource).toContain('cardValidityDays')
    expect(cardModalSource).toContain('cardValidityDate')
  })

  it('emits close and submit events to parent', () => {
    expect(cardModalSource).toContain("@click=\"$emit('close')\"")
    expect(cardModalSource).toContain('submit')
  })

  it('keeps the submit footer visible while the long card form scrolls', () => {
    expect(cardModalSource).toContain('max-h-[calc(100vh-32px)]')
    expect(cardModalSource).toContain('min-h-0 flex-1 overflow-y-auto')
    expect(cardModalSource).toContain('shrink-0 border-t')
    expect(cardModalSource).toContain('创建卡项')
  })
})
