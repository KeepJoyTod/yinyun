import { describe, expect, it } from 'vitest'
import channelSource from './ChannelMappingModal.vue?raw'

describe('ChannelMappingModal contract', () => {
  it('renders the channel mapping form with required fields', () => {
    expect(channelSource).toContain('渠道映射')
    expect(channelSource).toContain('门店')
    expect(channelSource).toContain('本地产品')
    expect(channelSource).toContain('渠道')
    expect(channelSource).not.toContain('Channel Mapping')
  })

  it('validates required fields before submission', () => {
    expect(channelSource).toContain('fieldErrors')
    expect(channelSource).toContain('storeBackendId')
    expect(channelSource).toContain('productBackendId')
    expect(channelSource).toContain('请选择门店')
  })

  it('supports both add and edit modes', () => {
    expect(channelSource).toContain("mode === 'add'")
    expect(channelSource).toContain("'创建映射'")
    expect(channelSource).toContain("'保存映射'")
  })

  it('emits close event and handles submit error display', () => {
    expect(channelSource).toContain("@click=\"$emit('close')\"")
    expect(channelSource).toContain('submitError')
  })
})
