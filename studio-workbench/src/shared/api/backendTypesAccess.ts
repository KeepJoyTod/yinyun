export type FeatureScopeLicenseState = 'active' | 'missing' | 'expired' | 'unknown' | 'not_applicable'
export type FeatureScopePluginState = 'enabled' | 'disabled' | 'unknown' | 'not_applicable'
export type FeatureScopeApprovalState = 'required' | 'not_required' | 'unknown' | 'not_applicable'

export type FeatureScopeLicenseSummaryDto = {
  licenseKey: string
  planName: string
  expireTime: string
  boundStoreIds: string
}

export type FeatureScopePluginSummaryDto = {
  channelType: string
  pluginName: string
  authStatus: string
  openTip: string
}

export type FeatureScopeDto = {
  featureKey: string
  licenseState: FeatureScopeLicenseState
  pluginState: FeatureScopePluginState
  approvalState: FeatureScopeApprovalState
  gateCopy: string
  licenseSummary: FeatureScopeLicenseSummaryDto | null
  pluginSummary: FeatureScopePluginSummaryDto | null
}
