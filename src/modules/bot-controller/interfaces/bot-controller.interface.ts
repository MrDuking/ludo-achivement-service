export interface NotifyQuery {
    userId: string
    message: string
    buttons: number
}

export interface NotifyResponse {
    result: number
    msg: string
    data: {
        id: string
    }
}
