export const daysIntoYear = (date: Date) => {
    return (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(date.getFullYear(), 0, 0)) / 24 / 60 / 60 / 1000
}

export const getWeekNumber = (date: Date) => {
    const target = new Date(date.valueOf())
    const dayNr = (date.getUTCDay() + 6) % 7
    target.setUTCDate(target.getUTCDate() - dayNr + 3)
    const firstThursday = target.valueOf()
    target.setUTCMonth(0, 1)
    if (target.getUTCDay() !== 4) {
        target.setUTCMonth(0, 1 + ((4 - target.getUTCDay() + 7) % 7))
    }
    return 1 + Math.ceil((firstThursday - target.valueOf()) / (7 * 24 * 3600 * 1000))
}
