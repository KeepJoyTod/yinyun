import {
  canAccessWorkbenchFeature,
  getEffectiveFeatureStatus,
  getWorkbenchFeature,
} from './featureRegistry'

export const resolveWorkbenchProtectedRoute = (
  featureKey: string,
  featureStatuses: Record<string, 'ready' | 'building' | 'hidden'>,
  menuPermissions: string[],
) => {
  if (!featureKey) return true
  const feature = getWorkbenchFeature(featureKey)
  const status = getEffectiveFeatureStatus(feature, featureStatuses)
  if (
    status === 'hidden'
    || !canAccessWorkbenchFeature(feature, menuPermissions)
  ) {
    return { path: '/403' as const }
  }
  return true
}
