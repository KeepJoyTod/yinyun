import { mapFeatureScopeRow } from './backendRowMappers'
import { apiRequest } from './request'
import type { FeatureScopeDto } from './backendTypes'

const normalizeFeatureKeys = (featureKeys: string[]) =>
  Array.from(new Set(featureKeys.map(item => String(item ?? '').trim()).filter(Boolean)))

export const featureScopeApi = {
  async listFeatureScopes(featureKeys: string[]) {
    const normalized = normalizeFeatureKeys(featureKeys)
    if (!normalized.length) return [] as FeatureScopeDto[]

    const rows = await apiRequest<Record<string, any>[]>(
      '/yy/featureScope/list',
      {},
      { featureKeys: normalized.join(',') },
    )
    return rows.map(mapFeatureScopeRow)
  },
}
