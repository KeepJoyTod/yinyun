import type {
  CollaborationStageCode,
  ProductCollaborationConfigDto,
  ProductCollaborationConfigPayload,
} from '../../shared/api/backend'
import type { ProductConfig } from '../../shared/stores/appStore'
import { collaborationStageOptions, stringifyJson } from '../collaboration/collaborationSettings'

export type AlbumReadinessTone = 'ready' | 'pending'

export type AlbumReadinessItem = {
  key: 'spec' | 'selection' | 'fulfillment'
  label: string
  tone: AlbumReadinessTone
  detail: string
}

export type AlbumProductReadiness = {
  score: number
  summary: string
  workflowLabels: string[]
  items: AlbumReadinessItem[]
}

const stageLabelMap = new Map(collaborationStageOptions.map(item => [item.code, item.label]))

const hasStage = (config: ProductCollaborationConfigDto | null | undefined, stage: CollaborationStageCode) =>
  Boolean(config?.stageCodes?.includes(stage))

export const buildAlbumProductConfigDraft = (
  product: ProductConfig,
  config?: ProductCollaborationConfigDto | null,
): ProductCollaborationConfigPayload => ({
  id: config?.id,
  productId: product.backendId || product.id,
  workflowJson: config?.workflowJson || stringifyJson({ stageCodes: ['RECEPTION', 'PHOTOGRAPHY', 'RETOUCH', 'SELECTION_REVIEW', 'PICKUP'] }),
  needMakeup: config?.needMakeup ?? false,
  needPhotography: config?.needPhotography ?? true,
  needRetouch: config?.needRetouch ?? true,
  needReview: config?.needReview ?? false,
  needSelectionReview: config?.needSelectionReview ?? true,
  needPickup: config?.needPickup ?? true,
  makeupCount: config?.makeupCount ?? 0,
  deliverWithinHours: config?.deliverWithinHours ?? 72,
  status: config?.status ?? 'ACTIVE',
  remark: config?.remark ?? '',
})

export const buildAlbumProductReadiness = (
  product: ProductConfig,
  config?: ProductCollaborationConfigDto | null,
): AlbumProductReadiness => {
  const resolvedConfig = config ?? null
  const specReady = Boolean(product.spec.trim() && product.spec.trim().toUpperCase() !== 'ALBUM' && product.includedCount > 0)
  const selectionReady = Number(product.unitPrice || 0) > 0
    && (resolvedConfig?.needSelectionReview || resolvedConfig?.needRetouch || hasStage(resolvedConfig, 'SELECTION_REVIEW') || hasStage(resolvedConfig, 'RETOUCH'))
  const fulfillmentReady = resolvedConfig != null
    && resolvedConfig.needPickup
    && resolvedConfig.deliverWithinHours > 0
    && hasStage(resolvedConfig, 'PICKUP')
    && hasStage(resolvedConfig, 'PHOTOGRAPHY')

  const items: AlbumReadinessItem[] = [
    {
      key: 'spec',
      label: '规格 / 入册张数',
      tone: specReady ? 'ready' : 'pending',
      detail: specReady ? `${product.spec} · ${product.includedCount}张` : '补齐相册规格和入册张数后，订单才能按真实入册规则履约。',
    },
    {
      key: 'selection',
      label: '选片 / 加修联动',
      tone: selectionReady ? 'ready' : 'pending',
      detail: selectionReady ? `加购单价 ¥${product.unitPrice || 0} 已接入选片或修图流程。` : '需补齐加片单价，并打开选片审核或修图节点。',
    },
    {
      key: 'fulfillment',
      label: '订单履约',
      tone: fulfillmentReady ? 'ready' : 'pending',
      detail: fulfillmentReady ? `已配置交付链路，目标 ${config?.deliverWithinHours || 0} 小时内出片。` : '需配置摄影/取件节点和出片时限，避免订单只停留在商品层。',
    },
  ]

  const score = items.filter(item => item.tone === 'ready').length
  const workflowLabels = (resolvedConfig?.stageCodes ?? [])
    .map(code => stageLabelMap.get(code) || code)
    .filter(Boolean)

  return {
    score,
    summary: score === items.length ? '入册商品闭环已就绪' : `还差 ${items.length - score} 项闭环配置`,
    workflowLabels,
    items,
  }
}
