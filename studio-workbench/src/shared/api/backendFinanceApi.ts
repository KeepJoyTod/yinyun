import type {
  FinanceOverviewDto,
  FinanceTransactionDto,
  FinanceTransactionQuery,
} from './backendTypes'

const financeOverview: FinanceOverviewDto = {
  accountId: 'finance-scaffold-account',
  availableBalanceCent: 0,
  prepaidBalanceCent: 0,
  debtBalanceCent: 0,
  status: 'scaffold',
}

const financeTransactions: FinanceTransactionDto[] = [
  {
    transactionId: 'finance-scaffold-opening',
    transactionType: 'SCAFFOLD',
    transactionItem: '费用中心脚手架初始化',
    amountCent: 0,
    balanceAfterCent: 0,
    occurredAt: '2026-06-24 00:00:00',
    status: 'scaffold',
  },
]

export const financeApi = {
  async getFinanceOverview(): Promise<FinanceOverviewDto> {
    return { ...financeOverview }
  },
  async listFinanceTransactions(query: FinanceTransactionQuery = {}): Promise<FinanceTransactionDto[]> {
    const keyword = query.transactionType?.trim().toLowerCase() ?? ''
    return financeTransactions
      .filter(item => !keyword || item.transactionType.toLowerCase() === keyword)
      .map(item => ({ ...item }))
  },
}
