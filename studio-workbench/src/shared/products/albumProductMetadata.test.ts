import { describe, expect, it } from 'vitest'
import { buildAlbumProductMetadataLabel, parseAlbumProductMetadata } from './albumProductMetadata'

describe('album product metadata', () => {
  it('builds a readable album metadata label', () => {
    expect(buildAlbumProductMetadataLabel('轻奢相册', 12)).toBe('轻奢相册｜12张')
  })

  it('parses album spec and included count from the metadata label', () => {
    expect(parseAlbumProductMetadata('轻奢相册｜12张')).toEqual({
      albumSpec: '轻奢相册',
      includedCount: 12,
    })
  })

  it('keeps compatibility with legacy free text labels', () => {
    expect(parseAlbumProductMetadata('精修入册10张')).toEqual({
      albumSpec: '精修入册',
      includedCount: 10,
    })
  })
})
