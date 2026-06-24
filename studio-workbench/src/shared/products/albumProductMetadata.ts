const albumCountPatterns = [
  /(\d+)\s*张/u,
  /(\d+)\s*P\b/ui,
]

const trimAlbumSpec = (value: string) =>
  value
    .replace(/[|｜·•]\s*$/u, '')
    .replace(/\s+/gu, ' ')
    .trim()

export type AlbumProductMetadata = {
  albumSpec: string
  includedCount: number
}

export const parseAlbumProductMetadata = (value: string | null | undefined): AlbumProductMetadata => {
  const text = String(value ?? '').trim()
  if (!text) {
    return {
      albumSpec: '',
      includedCount: 0,
    }
  }

  for (const pattern of albumCountPatterns) {
    const match = text.match(pattern)
    if (!match) continue
    const includedCount = Number(match[1] ?? 0) || 0
    const albumSpec = trimAlbumSpec(text.replace(match[0], ''))
    return {
      albumSpec,
      includedCount,
    }
  }

  return {
    albumSpec: trimAlbumSpec(text),
    includedCount: 0,
  }
}

export const buildAlbumProductMetadataLabel = (albumSpec: string, includedCount: number) => {
  const normalizedSpec = trimAlbumSpec(albumSpec) || '入册产品'
  const normalizedCount = Math.max(0, Number(includedCount) || 0)
  if (!normalizedCount) return normalizedSpec
  return `${normalizedSpec}｜${normalizedCount}张`
}
