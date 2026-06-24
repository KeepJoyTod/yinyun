import { describe, expect, it } from 'vitest'
import { mapCollaborationPolicyRow } from './backendRowMappers'

describe('mapCollaborationPolicyRow', () => {
  it('accepts the default policy response without a backend id', () => {
    expect(mapCollaborationPolicyRow({
      id: null,
      policyCode: 'DEFAULT',
      reviewFlowEnabled: '1',
      productInfoMaskMode: 'MASK_PHOTO_ONLY',
      enabledStoreIds: '',
      fallbackAction: 'RETURN_TO_STORE',
      transferEnabled: '1',
      autoDispatchMode: 'STORE_ONLY',
      genderMakeupEnabled: '0',
      femaleMakeupRatio: '1.5',
      remark: '默认协作策略',
    })).toMatchObject({
      id: undefined,
      policyCode: 'DEFAULT',
      reviewFlowEnabled: '1',
      femaleMakeupRatio: 1.5,
    })
  })
})
