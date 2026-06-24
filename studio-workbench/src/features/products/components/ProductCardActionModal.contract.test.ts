import { describe, expect, it } from 'vitest'
import actionModalSource from './ProductCardActionModal.vue?raw'

describe('ProductCardActionModal contract', () => {
  it('renders the action modal with product context and action cards', () => {
    expect(actionModalSource).toContain('Product Actions')
    expect(actionModalSource).toContain('互斥规则')
    expect(actionModalSource).toContain('关联商品')
    expect(actionModalSource).toContain('上架配置')
    expect(actionModalSource).toContain('下单限制')
  })

  it('supports publish, shelf, mutual-exclusion and limit actions', () => {
    expect(actionModalSource).toContain('actionCards')
    expect(actionModalSource).toContain('currentAction')
    expect(actionModalSource).toContain('published')
    expect(actionModalSource).toContain('mutuallyExclusiveRule')
    expect(actionModalSource).toContain('linkedProductIds')
    expect(actionModalSource).toContain('shelfConfig')
    expect(actionModalSource).toContain('orderLimitRule')
  })

  it('emits close, edit-product and submit events', () => {
    expect(actionModalSource).toContain("@click=\"$emit('close')\"")
    expect(actionModalSource).toContain('edit-product')
    expect(actionModalSource).toContain('submit')
  })

  it('shows product preview in the header area', () => {
    expect(actionModalSource).toContain('product.nickname || product.name')
    expect(actionModalSource).toContain('action.short')
    expect(actionModalSource).toContain('action.hint')
  })
})