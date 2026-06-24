export type FinanceOverviewDto = {
  accountId: string
  availableBalanceCent: number
  prepaidBalanceCent: number
  debtBalanceCent: number
  status: 'scaffold' | 'ready'
}

export type FinanceTransactionDto = {
  transactionId: string
  transactionType: string
  transactionItem: string
  amountCent: number
  balanceAfterCent: number
  occurredAt?: string
  status: 'scaffold' | 'ready'
}

export type FinanceTransactionQuery = {
  accountId?: string
  transactionType?: string
  beginTime?: string
  endTime?: string
}
