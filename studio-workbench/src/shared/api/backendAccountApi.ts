import { apiRequest } from './request'
import type {
  AccountBrandDto,
  AccountProfileDto,
  HelpCenterArticleDto,
} from './backendTypes'

const demoMode = () => import.meta.env.VITE_STUDIO_DEMO === 'true'

const fallbackProfile: AccountProfileDto = {
  accountId: 'demo-account',
  username: 'studio.owner',
  nickname: '工作台账号',
  phoneMasked: '',
  email: '',
  status: 'scaffold',
}

const fallbackBrands: AccountBrandDto[] = [
  {
    brandId: 'demo-brand',
    brandName: '默认品牌',
    defaultBrand: true,
    status: 'scaffold',
  },
]

const fallbackHelpArticles: HelpCenterArticleDto[] = [
  {
    articleId: 'account-demo-help',
    title: '账号中心待接入',
    keyword: '账号,品牌,帮助',
    status: 'scaffold',
  },
]

const text = (value: unknown) => String(value ?? '')

const normalizeStatus = (value: unknown): AccountProfileDto['status'] => {
  const normalized = text(value).trim().toLowerCase()
  return normalized === 'ready' || normalized === 'active' ? 'ready' : 'scaffold'
}

const mapProfile = (row: Record<string, any>): AccountProfileDto => ({
  accountId: text(row.accountId),
  username: text(row.username),
  nickname: text(row.nickname),
  phoneMasked: text(row.phoneMasked),
  email: text(row.email),
  status: normalizeStatus(row.status),
})

const mapBrand = (row: Record<string, any>): AccountBrandDto => ({
  brandId: text(row.brandId),
  brandName: text(row.brandName),
  defaultBrand: Boolean(row.defaultBrand),
  status: normalizeStatus(row.status),
})

const mapHelpArticle = (row: Record<string, any>): HelpCenterArticleDto => ({
  articleId: text(row.articleId),
  title: text(row.title),
  keyword: text(row.keyword),
  status: normalizeStatus(row.status),
})

const readOrFallback = async <T>(reader: () => Promise<T>, fallback: T) => {
  if (demoMode()) return fallback
  try {
    return await reader()
  } catch (error) {
    if (demoMode()) return fallback
    throw error
  }
}

export const accountApi = {
  async getAccountProfile(): Promise<AccountProfileDto> {
    return readOrFallback(
      async () => mapProfile(await apiRequest<Record<string, any>>('/yy/account-center/profile')),
      { ...fallbackProfile },
    )
  },
  async updateAccountProfile(
    payload: Partial<Pick<AccountProfileDto, 'nickname' | 'phoneMasked' | 'email'>>,
  ): Promise<AccountProfileDto> {
    return readOrFallback(
      async () => mapProfile(await apiRequest<Record<string, any>>('/yy/account-center/profile', {
        method: 'PUT',
        body: JSON.stringify(payload),
      })),
      { ...fallbackProfile, ...payload },
    )
  },
  async listAccountBrands(): Promise<AccountBrandDto[]> {
    return readOrFallback(
      async () => (await apiRequest<Record<string, any>[]>('/yy/account-center/brands')).map(mapBrand),
      fallbackBrands.map(item => ({ ...item })),
    )
  },
  async switchAccountBrand(brandId: string): Promise<AccountBrandDto[]> {
    return readOrFallback(
      async () => (await apiRequest<Record<string, any>[]>(
        `/yy/account-center/brands/${encodeURIComponent(brandId)}/switch`,
        { method: 'PUT' },
      )).map(mapBrand),
      fallbackBrands.map(item => ({ ...item, defaultBrand: item.brandId === brandId })),
    )
  },
  async listHelpCenterArticles(keyword = ''): Promise<HelpCenterArticleDto[]> {
    return readOrFallback(
      async () => (await apiRequest<Record<string, any>[]>(
        '/yy/account-center/help/articles',
        {},
        { keyword },
      )).map(mapHelpArticle),
      fallbackHelpArticles.map(item => ({ ...item })),
    )
  },
}
