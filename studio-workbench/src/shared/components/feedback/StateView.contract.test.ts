import { describe, expect, it } from 'vitest'
import stateViewSource from './StateView.vue?raw'
import skeletonSource from './SkeletonRows.vue?raw'
import noticeSource from './NoticeBanner.vue?raw'

describe('shared feedback components contract', () => {
  it('StateView renders loading / error / empty / content states with retry', () => {
    expect(stateViewSource).toContain('role="status"')
    expect(stateViewSource).toContain('role="alert"')
    expect(stateViewSource).toContain('loading')
    expect(stateViewSource).toContain('error')
    expect(stateViewSource).toContain('empty')
    expect(stateViewSource).toContain('emptyImage')
    expect(stateViewSource).toContain('workbenchImages.emptyFiles')
    expect(stateViewSource).toContain('onRetry')
    expect(stateViewSource).toContain('重试')
    expect(stateViewSource).toContain('animate-pulse')
    expect(stateViewSource).toContain('#B8543B')
  })

  it('SkeletonRows renders a configurable number of pulse rows', () => {
    expect(skeletonSource).toContain('animate-pulse')
    expect(skeletonSource).toContain('count')
    expect(skeletonSource).toContain('rowHeight')
  })

  it('NoticeBanner renders success/error tones with fade transition', () => {
    expect(noticeSource).toContain('notice')
    expect(noticeSource).toContain('error')
    expect(noticeSource).toContain('success')
    expect(noticeSource).toContain('#8C3E2C')
    expect(noticeSource).toContain('#2D7A4D')
    expect(noticeSource).toContain('Transition')
  })
})
