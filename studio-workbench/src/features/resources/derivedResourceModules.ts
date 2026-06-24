import type { Album, AlbumNegative } from '../../shared/stores/appStore'

export type DerivedResourceFeatureKey = 'resource-files' | 'resource-samples'
export type DerivedResourceStage = '可访问' | '待排查' | '候选样片' | '待授权'

export type DerivedResourceModule = {
  key: DerivedResourceFeatureKey
  title: string
  eyebrow: string
  description: string
  emptyTitle: string
  emptyHint: string
  source: 'files' | 'samples'
}

export type DerivedResourceItem = {
  id: string
  title: string
  subtitle: string
  module: DerivedResourceModule
  album: Album
  photo: AlbumNegative
  stage: DerivedResourceStage
  ownerLabel: string
  fileLabel: string
  nextAction: string
  actionLabel: string
  actionPath: string
  boundary: string
}

const moduleConfigs: DerivedResourceModule[] = [
  {
    key: 'resource-files',
    title: '文件资源',
    eyebrow: 'File Resources',
    description: '统一查看相册底片、文件归属、私有 OSS 访问状态和业务用途。这里不直接暴露永久 OSS 地址。',
    emptyTitle: '当前没有文件资源',
    emptyHint: '门店上传客户底片后，会按相册、客户和订单归属显示在这里。',
    source: 'files',
  },
  {
    key: 'resource-samples',
    title: '样片作品',
    eyebrow: 'Sample Works',
    description: '从客户已选照片和可交付相册中派生样片候选，后续正式发布前仍需客户授权和后台审核。',
    emptyTitle: '当前没有样片候选',
    emptyHint: '客户已选照片会成为样片候选；正式公开展示前需要补客户授权和展示分类。',
    source: 'samples',
  },
]

export const derivedResourceModules = moduleConfigs

export const getDerivedResourceModule = (key: string | undefined): DerivedResourceModule =>
  moduleConfigs.find(module => module.key === key) ?? moduleConfigs[0]

const photoStage = (photo: AlbumNegative): DerivedResourceStage =>
  photo.url ? '可访问' : '待排查'

const sampleStage = (photo: AlbumNegative): DerivedResourceStage =>
  photo.url ? '候选样片' : '待排查'

const flattenPhotos = (albums: Album[]) =>
  albums.flatMap(album => album.negatives.map(photo => ({ album, photo })))

export const buildDerivedResourceItems = (
  module: DerivedResourceModule,
  albums: Album[],
): DerivedResourceItem[] => {
  const pairs = flattenPhotos(albums)
    .filter(({ photo }) => module.source === 'files' || photo.selected)

  return pairs.map(({ album, photo }) => {
    const isSamples = module.source === 'samples'
    const stage = isSamples ? sampleStage(photo) : photoStage(photo)
    return {
      id: `${module.key}:${album.id}:${photo.id}`,
      title: isSamples ? `${album.service} · ${photo.name}` : photo.name,
      subtitle: `${album.customer} · ${album.service} · ${album.orderId}`,
      module,
      album,
      photo,
      stage,
      ownerLabel: `${album.customer} / ${album.photographer || '未指定摄影师'}`,
      fileLabel: photo.url ? `OSS 对象 ${photo.id}` : '缺文件访问地址',
      nextAction: isSamples
        ? '确认客户授权、展示分类和封面裁切后，再进入作品发布流程。'
        : photo.url
          ? '用于客片管理、在线选片和交付排障；客户侧仍走短期签名或代理访问。'
          : '检查 yy_photo_asset.object_key、OSS 文件和缩略图生成状态。',
      actionLabel: isSamples ? '打开客片相册' : '打开客片管理',
      actionPath: `/service/photos?album=${encodeURIComponent(album.id)}`,
      boundary: isSamples
        ? '样片作品当前只从 yy_photo_album 和 yy_photo_asset 派生候选，不写公开作品账本；正式发布需客户授权。'
        : '文件资源当前只读取相册底片和私有 OSS 归属，不暴露永久 OSS 地址，不绕过客户取片权限。',
    }
  })
}
