export type AccountProfileDto = {
  accountId: string
  username: string
  nickname?: string
  phoneMasked?: string
  email?: string
  status: 'scaffold' | 'ready'
}

export type AccountBrandDto = {
  brandId: string
  brandName: string
  defaultBrand: boolean
  status: 'scaffold' | 'ready'
}

export type HelpCenterArticleDto = {
  articleId: string
  title: string
  keyword?: string
  status: 'scaffold' | 'ready'
}
