import { describe, expect, it } from 'vitest'
import viewSource from './MemberAssetsView.vue?raw'
import previewSource from './components/MemberConsumerAssetPreview.vue?raw'
import composableSource from './useMemberConsumerAssetPreview.ts?raw'

const consumerPreviewContractSource = `${viewSource}\n${previewSource}\n${composableSource}`

describe('member consumer asset preview contract', () => {
  it('mounts the consumer readonly preview inside the member assets owner page', () => {
    expect(viewSource).toContain('MemberConsumerAssetPreview')
    expect(previewSource).toContain('消费者会员资产预览')
    expect(previewSource).toContain('会员资料')
    expect(previewSource).toContain('会员卡 / 权益')
    expect(previewSource).toContain('优惠券 / 兑换券')
    expect(previewSource).toContain('积分 / 成长值')
    expect(previewSource).toContain('余额 / 交易明细')
  })

  it('reuses the existing member store and customer recent order loader', () => {
    expect(composableSource).toContain('appStore.loadCustomerRecentOrders')
    expect(composableSource).toContain('memberStore.refreshPointsLedger')
    expect(composableSource).toContain('memberStore.refreshGrowthLedger')
    expect(composableSource).toContain('memberStore.refreshBalanceLedger')
    expect(consumerPreviewContractSource).not.toContain('createConsumerMemberApi')
  })

  it('documents the readonly boundary for future real consumer APIs', () => {
    expect(previewSource).toContain('只读脚手架')
    expect(previewSource).toContain('memberStore.coupons')
    expect(consumerPreviewContractSource).toContain('不在工作台创建第二套消费者账本')
  })
})
