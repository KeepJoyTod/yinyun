export type ConsumerOpsP1Status = 'SCAFFOLD' | 'BUILDING' | 'NOT_CONNECTED'
export type ConsumerOpsP1Risk = 'LOW' | 'MEDIUM' | 'HIGH'

export interface ConsumerOpsP1ItemDto {
  itemKey: string
  itemName: string
  status: ConsumerOpsP1Status
  risk: ConsumerOpsP1Risk
  sourceItems: string[]
  existingOwners: string[]
  missingCapabilities: string[]
  nextSteps: string[]
  evidenceRefs: string[]
}

export interface ConsumerOpsP1OverviewDto {
  title: string
  status: ConsumerOpsP1Status
  updatedAt: string
  items: ConsumerOpsP1ItemDto[]
  dataLedgers: string[]
  deliveryStandard: string[]
}
