import type {
  AccountBrandDto,
  AccountProfileDto,
  HelpCenterArticleDto,
} from './backendTypes'

const accountProfile: AccountProfileDto = {
  accountId: 'scaffold-account',
  username: 'studio.owner',
  nickname: '工作台账号',
  phoneMasked: '155****3328',
  email: 'studio@example.com',
  status: 'scaffold',
}

const accountBrands: AccountBrandDto[] = [
  {
    brandId: 'brand-default',
    brandName: '影约云默认品牌',
    defaultBrand: true,
    status: 'scaffold',
  },
]

const helpCenterArticles: HelpCenterArticleDto[] = [
  {
    articleId: 'account-quick-start',
    title: '账号中心闭环开工说明',
    keyword: '账号,安全,登录',
    status: 'scaffold',
  },
  {
    articleId: 'brand-switch-scope',
    title: '品牌切换与门店数据范围',
    keyword: '品牌,门店,范围',
    status: 'scaffold',
  },
]

export const accountApi = {
  async getAccountProfile(): Promise<AccountProfileDto> {
    return { ...accountProfile }
  },
  async updateAccountProfile(
    payload: Partial<Pick<AccountProfileDto, 'nickname' | 'phoneMasked' | 'email'>>,
  ): Promise<AccountProfileDto> {
    return {
      ...accountProfile,
      ...payload,
    }
  },
  async listAccountBrands(): Promise<AccountBrandDto[]> {
    return accountBrands.map(item => ({ ...item }))
  },
  async switchAccountBrand(brandId: string): Promise<AccountBrandDto[]> {
    return accountBrands.map(item => ({
      ...item,
      defaultBrand: item.brandId === brandId,
    }))
  },
  async listHelpCenterArticles(keyword = ''): Promise<HelpCenterArticleDto[]> {
    const normalized = keyword.trim().toLowerCase()
    if (!normalized) return helpCenterArticles.map(item => ({ ...item }))
    return helpCenterArticles
      .filter(item => `${item.title} ${item.keyword ?? ''}`.toLowerCase().includes(normalized))
      .map(item => ({ ...item }))
  },
}
