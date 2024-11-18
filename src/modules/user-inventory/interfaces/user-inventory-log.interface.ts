export interface GetListUserInventoryLogQuery {
    userId?: string
    transactionDateStart?: string
    transactionDateEnd?: string
    take?: number
    page?: number
    sortDirection?: string
    sort?: string
}
