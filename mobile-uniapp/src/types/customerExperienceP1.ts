export type CustomerExperienceP1Status = 'scaffold' | 'building' | 'not_connected'

export interface CustomerExperienceP1ServiceGroup {
  serviceGroupId: string
  name: string
  description: string
  capacityLabel: string
  status: CustomerExperienceP1Status
}

export interface CustomerExperienceP1ProfileField {
  key: string
  label: string
  required: boolean
  inputType: 'text' | 'select' | 'textarea'
  placeholder: string
  options: string[]
  status: CustomerExperienceP1Status
}

export interface CustomerExperienceP1EntitlementCandidate {
  candidateId: string
  title: string
  kind: 'coupon' | 'voucher' | 'card' | 'balance' | 'points' | 'growth'
  status: 'available' | 'used' | 'expired' | 'unavailable'
  amountLabel: string
  reason: string
  actionLabel: string
}

export interface CustomerExperienceP1AssetSummary {
  cardCount: number
  benefitCount: number
  couponCount: number
  points: number
  growthValue: number
  balanceLabel: string
  status: CustomerExperienceP1Status
  emptyReason: string
}

export interface CustomerExperienceP1BookingOptions {
  status: CustomerExperienceP1Status
  serviceGroups: CustomerExperienceP1ServiceGroup[]
  profileFields: CustomerExperienceP1ProfileField[]
  entitlementCandidates: CustomerExperienceP1EntitlementCandidate[]
  assetSummary: CustomerExperienceP1AssetSummary
  notices: string[]
}

export interface CustomerExperienceP1OrderVerification {
  orderId: string
  status: CustomerExperienceP1Status
  channel: string
  canDisplayCode: boolean
  codeLabel: string
  reason: string
  nextAction: string
}

export interface CustomerExperienceP1ReviewDraftPayload {
  orderId?: string
  rating: number
  tags: string[]
  remark: string
}

export interface CustomerExperienceP1ReviewDraftResult {
  status: CustomerExperienceP1Status
  message: string
  evidenceRefs: string[]
}
