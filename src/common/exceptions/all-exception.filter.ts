import { status } from "@grpc/grpc-js"
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Inject } from "@nestjs/common"
import { HttpAdapterHost } from "@nestjs/core"
import { RpcException } from "@nestjs/microservices"
import { WINSTON_MODULE_PROVIDER } from "nest-winston"
import { Logger } from "winston"
import { MESSAGE_CODES } from "../constants"
import { IErrorRpc } from "../interfaces"

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    constructor(
        private readonly httpAdapterHost: HttpAdapterHost,
        @Inject(WINSTON_MODULE_PROVIDER)
        private readonly logger: Logger
    ) {}

    catch(exception: any, host: ArgumentsHost): void {
        const ctxType = host.getType()
        if (ctxType === "http") {
            this.handleHttpException(exception, host)
        } else if (ctxType === "rpc") {
            // NOTE: (@hhman24) it will be handle in interceptor, so in the future we don't need catch here.
            this.handleRpcException(exception)
        } else {
            this.handleUnknownException(exception)
        }
    }

    private handleHttpException(exception: any, host: ArgumentsHost) {
        const { httpAdapter } = this.httpAdapterHost
        const ctx = host.switchToHttp()

        const isHttpException = exception instanceof HttpException
        const httpStatus = isHttpException ? exception.getStatus() : 500
        const cause = exception.cause

        const responseBody = {
            statusCode: httpStatus,
            code: cause?.code || MESSAGE_CODES.INTERNAL_SERVER_ERROR,
            timestamp: new Date().toISOString(),
            path: httpAdapter.getRequestUrl(ctx.getRequest())
        }

        this.logger.error(
            `HTTP Exception: ${JSON.stringify({
                ...responseBody,
                message: isHttpException ? exception.getResponse() : exception.message,
                response: cause?.message?.stack,
                stack: exception.stack
            })}`,
            { ...cause?.tag }
        )

        httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus)
    }

    private handleRpcException(exception: any) {
        const isRpcException = exception instanceof RpcException
        const err: IErrorRpc | string = isRpcException ? exception.getError() : exception.message

        let code: number = status.INTERNAL
        let message: string = MESSAGE_CODES.INTERNAL_SERVER_ERROR
        let statusCode: number = status.INTERNAL

        if (typeof err === "string") {
            message = err
        } else if (typeof err === "object" && err !== null) {
            if (typeof err.code === "string") {
            }
            code = typeof err.code === "string" ? status.INTERNAL : err?.code || status.INTERNAL
            message = err?.message || MESSAGE_CODES.INTERNAL_SERVER_ERROR
            statusCode = err?.statusCode || status.INTERNAL
        }

        const responseBody = {
            statusCode: statusCode,
            code: code,
            data: null,
            message: message
        }

        this.logger.error(
            `RPC Exception: ${JSON.stringify({
                ...responseBody,
                stack: exception?.stack
            })}`
        )

        throw new RpcException(responseBody)
    }

    private handleUnknownException(exception: any) {
        this.logger.error(`Unknown Exception: ${exception.message}`, {
            stack: exception.stack
        })
    }
}
