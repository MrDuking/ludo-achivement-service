export interface GetRefBy {
    userId: string
    server: number
}

export interface UpdateUserRefByMessage {
    userId: string
    name: string
    avatar: string
    refBy: string
    isTelegramPremiumUser: boolean
    server: number
}
