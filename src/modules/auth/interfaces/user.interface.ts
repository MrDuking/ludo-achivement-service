export interface User {
    id: string
    isTelegramPremiumUser: boolean
    email: string
    name: string
    walletAddress: string
    lastLoginDate: string
    refCode: string
    refCodeUpdateTime: string
    sessionId: string
    countryCode: string
    lastLoginIP: string
    avatar: string
    avatarUpdateTime?: string
    playTime: number
    isRegisteredPayment?: boolean
}
