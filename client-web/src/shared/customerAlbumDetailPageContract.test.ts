import { describe, expect, it } from 'vitest'
import detailSource from '../views/CustomerAlbumDetailView.vue?raw'

describe('customer album detail page contracts', () => {
  it('shows delivery guidance before the photo grid', () => {
    expect(detailSource).toContain('album-delivery-guide')
    expect(detailSource).toContain('交付说明')
    expect(detailSource).toContain('预览照片')
    expect(detailSource).toContain('下载原图')
    expect(detailSource).toContain('联系门店')
  })

  it('keeps the photo directory status visible and refreshable', () => {
    expect(detailSource).toContain('album-gallery-toolbar')
    expect(detailSource).toContain('照片目录')
    expect(detailSource).toContain('previewStatusSummary')
    expect(detailSource).toContain('refreshPreviews')
  })

  it('supports previous and next navigation in the preview modal', () => {
    expect(detailSource).toContain('preview-modal__nav')
    expect(detailSource).toContain('previewPositionLabel')
    expect(detailSource).toContain('canPreviewPrevious')
    expect(detailSource).toContain('canPreviewNext')
    expect(detailSource).toContain('movePreview')
  })

  it('gives customers recovery actions when photos have not been uploaded', () => {
    expect(detailSource).toContain('album-detail-empty-actions')
    expect(detailSource).toContain('刷新照片目录')
    expect(detailSource).toContain('返回相册列表')
    expect(detailSource).toContain('拨打门店电话')
  })
})
