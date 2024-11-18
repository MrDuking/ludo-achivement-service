import { Currency } from "src/common"

export const initSolarCommission = () => {
    return [
        {
            type: Currency.TON,
            amount: 0
        }
    ]
}

export const initSolarBalance = () => {
    return [
        {
            type: Currency.TON,
            amount: 0
        }
    ]
}

export const getCurrencyType = (type: number) => {
    const currency: Record<number, string> = {
        [0]: "COIN",
        [1]: "DIAMOND",
        [2]: "LUTON",
        [3]: "TON",
        [4]: "STAR",
        [5]: "USD"
    }
    return currency[type]
}
