import type { ResourceTagDto } from '../../shared/api/backend'

export const buildTagDeleteMessage = (tag: Pick<ResourceTagDto, 'tagName' | 'resourceCount'>) =>
  `删除标签“${tag.tagName}”后，会清空 ${tag.resourceCount} 条资源的标签关系，但不会删除资源主记录。`

export const buildTagEmptyState = (hasKeyword: boolean) =>
  hasKeyword
    ? {
      title: '没有匹配的资源标签',
      hint: '可以更换关键词，或先新建一个资源标签。',
    }
    : {
      title: '当前还没有资源标签',
      hint: '标签字典读取 yy_photo_tag，并统计 yy_photo_asset_tag 的真实关联数量。',
    }

export const sortTagsByUsage = (rows: ResourceTagDto[]) =>
  [...rows].sort((left, right) => {
    if (right.resourceCount !== left.resourceCount) return right.resourceCount - left.resourceCount
    return left.tagName.localeCompare(right.tagName, 'zh-CN')
  })
