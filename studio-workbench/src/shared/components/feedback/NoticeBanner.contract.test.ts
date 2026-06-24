import { describe, expect, it } from 'vitest'
import noticeSource from './NoticeBanner.vue?raw'

describe('NoticeBanner contract', () => {
  it('renders success notice with green styling', () => {
    expect(noticeSource).toContain('v-if="notice"')
    expect(noticeSource).toContain('border-[#2D7A4D]/20')
    expect(noticeSource).toContain('bg-[#EBF4ED]')
    expect(noticeSource).toContain('text-[#2D7A4D]')
  })

  it('renders error notice with red styling', () => {
    expect(noticeSource).toContain('border-[#B8543B]/30')
    expect(noticeSource).toContain('bg-[#B8543B]/10')
    expect(noticeSource).toContain('text-[#8C3E2C]')
  })

  it('uses Transition for fade animation', () => {
    expect(noticeSource).toContain('Transition')
    expect(noticeSource).toContain('yy-notice-fade')
    expect(noticeSource).toContain('opacity 0.3s ease')
  })

  it('displays notice message and has status role', () => {
    expect(noticeSource).toContain('role="status"')
    expect(noticeSource).toContain('notice.message')
  })

  it('exports NoticePayload type for downstream consumers', () => {
    expect(noticeSource).toContain('NoticeTone')
    expect(noticeSource).toContain('NoticePayload')
    expect(noticeSource).toContain("'success' | 'error'")
  })
})