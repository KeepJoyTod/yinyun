import { describe, expect, it } from 'vitest'
import {
  workbenchImages,
  productFallbackImages,
  getProductFallbackImage,
  getSamplePhotoImage,
  isWorkbenchFallbackImage,
} from './workbenchAssets'

describe('workbenchAssets', () => {
  it('exports all required image assets', () => {
    expect(workbenchImages.emptyFiles).toBeDefined()
    expect(workbenchImages.storeFront).toBeDefined()
    expect(workbenchImages.products.idcard).toBeDefined()
    expect(workbenchImages.products.portrait).toBeDefined()
    expect(workbenchImages.samples).toHaveLength(4)
  })

  it('getProductFallbackImage cycles through product images', () => {
    expect(getProductFallbackImage(0)).toBe(productFallbackImages[0])
    expect(getProductFallbackImage(1)).toBe(productFallbackImages[1])
    expect(getProductFallbackImage(2)).toBe(productFallbackImages[0])
  })

  it('getSamplePhotoImage cycles through sample images', () => {
    expect(getSamplePhotoImage(0)).toBe(workbenchImages.samples[0])
    expect(getSamplePhotoImage(3)).toBe(workbenchImages.samples[3])
    expect(getSamplePhotoImage(4)).toBe(workbenchImages.samples[0])
  })

  it('isWorkbenchFallbackImage identifies known fallback images', () => {
    expect(isWorkbenchFallbackImage(workbenchImages.emptyFiles)).toBe(true)
    expect(isWorkbenchFallbackImage(workbenchImages.storeFront)).toBe(true)
    expect(isWorkbenchFallbackImage(productFallbackImages[0])).toBe(true)
    expect(isWorkbenchFallbackImage(workbenchImages.samples[0])).toBe(true)
  })

  it('isWorkbenchFallbackImage rejects unknown images', () => {
    expect(isWorkbenchFallbackImage(null)).toBe(false)
    expect(isWorkbenchFallbackImage(undefined)).toBe(false)
    expect(isWorkbenchFallbackImage('https://example.com/photo.jpg')).toBe(false)
  })
})