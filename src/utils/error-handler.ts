import { HttpStatus } from "@nestjs/common"
import { MESSAGE_CODES } from "src/common/constants"

class HandlerError extends Error {
    statusCode: number
    code: string
    method: string

    constructor(message: string, statusCode?: number, code?: string, method: string = "http") {
        super(message)

        this.name = "Handle-Error-Custom"

        this.statusCode = statusCode ? statusCode : HttpStatus.INTERNAL_SERVER_ERROR

        this.code = code ? code : MESSAGE_CODES.INTERNAL_SERVER_ERROR

        this.method = method

        Error.captureStackTrace(this, this.constructor)
    }
}

export default HandlerError
