import { describe, expect, it } from 'vitest'
import constructionSource from './ConstructionView.vue?raw'

describe('construction page contract', () => {
  it('shows module ownership, expected APIs and data boundary for building features', () => {
    expect(constructionSource).toContain('所属模块')
    expect(constructionSource).toContain('预计接入接口')
    expect(constructionSource).toContain('数据边界')
    expect(constructionSource).toContain('featureInfoMap')
  })

  it('uses a safe default boundary instead of blank construction details', () => {
    expect(constructionSource).toContain('待按模块接入真实业务接口')
    expect(constructionSource).toContain('不使用伪造业务数据')
  })
})
