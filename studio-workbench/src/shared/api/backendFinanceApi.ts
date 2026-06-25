import { apiRequest } from './request'
import type {
  FinanceOverviewDto,
  FinanceTransactionDto,
  FinanceTransactionQuery,
} from './backendTypes'

const demoMode = () => import.meta.env.VITE_STUDIO_DEMO === 'true'

const fallbackOverview: FinanceOverviewDto = {
  accountId: 'yy-payment-record',
  availableBalanceCent: 0,
  prepaidBalanceCent: 0,
  debtBalanceCent: 0,
  status: 'scaffold',
}

const fallbackTransactions: FinanceTransactionDto[] = [
  {
    transactionId: 'finance-demo-empty',
    transactionType: 'SCAFFOLD',
    transactionItem: '费用中心待接入',
    amountCent: 0,
    balanceAfterCent: 0,
    occurredAt: '',
    status: 'scaffold',
  },
]

const text = (value: unknown) => String(value ?? '')

const normalizeStatus = (value: unknown): FinanceOverviewDto['status'] => {
  const normalized = text(value).trim().toLowerCase()
  return normalized === 'ready' || normalized === 'active' ? 'ready' : 'scaffold'
}

const mapOverview = (row: Record<string, any>): FinanceOverviewDto => ({
  accountId: text(row.accountId),
  availableBalanceCent: Number(row.availableBalanceCent ?? 0),
  prepaidBalanceCent: Number(row.prepaidBalanceCent ?? 0),
  debtBalanceCent: Number(row.debtBalanceCent ?? 0),
  status: normalizeStatus(row.status),
})

const mapTransaction = (row: Record<string, any>): FinanceTransactionDto => ({
  transactionId: text(row.transactionId),
  transactionType: text(row.transactionType),
  transactionItem: text(row.transactionItem),
  amountCent: Number(row.amountCent ?? 0),
  balanceAfterCent: Number(row.balanceAfterCent ?? 0),
  occurredAt: text(row.occurredAt),
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

export const financeApi = {
  async getFinanceOverview(): Promise<FinanceOverviewDto> {
    return readOrFallback(
      async () => mapOverview(await apiRequest<Record<string, any>>('/yy/finance-center/overview')),
      { ...fallbackOverview },
    )
  },
  async listFinanceTransactions(query: FinanceTransactionQuery = {}): Promise<FinanceTransactionDto[]> {
    return readOrFallback(
      async () => (await apiRequest<Record<string, any>[]>(
        '/yy/finance-center/transactions',
        {},
        query,
      )).map(mapTransaction),
      fallbackTransactions.map(item => ({ ...item })),
    )
  },
}
