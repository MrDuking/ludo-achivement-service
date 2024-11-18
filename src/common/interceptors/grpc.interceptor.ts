import { Metadata, status } from "@grpc/grpc-js"
import { CallHandler, ExecutionContext, Inject, NestInterceptor } from "@nestjs/common"
import { WINSTON_MODULE_PROVIDER } from "nest-winston"
import { Observable, of } from "rxjs"
import { catchError, map } from "rxjs/operators"
import { Logger } from "winston"
import { MESSAGE_CODES } from "../constants"

export class GrpcInterceptor implements NestInterceptor {
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const now = Date.now()
        const contextType = context.getType()

        if (contextType === "rpc") {
            const rpcContext = context.switchToRpc()
            const metadata = rpcContext.getContext() as Metadata
            const handler = context.getHandler().name
            const className = context.getClass().name
            const serviceName = rpcContext.getContext().serviceName
            const userAgent = (metadata.get("user-agent")[0] as string) || "Unknown"
            const clientIp = (metadata.get("x-forwarded-for")[0] as string) || "Unknown"

            this.logger.info(
                `Incoming gRPC Call - [Service: ${serviceName}] [Class: ${className}] [Handler: ${handler}] - [Request: ${JSON.stringify(rpcContext.getData())}] - [UserAgent: ${userAgent}, IP: ${clientIp}]`
            )

            return next.handle().pipe(
                map((response) => {
                    // Format successful responses
                    const duration = Date.now() - now
                    this.logger.info(
                        `Outgoing gRPC Error Response - [Service: ${serviceName}] [Class: ${className}] [Handler: ${handler}] - [Duration: ${duration}ms] - [UserAgent: ${userAgent}, IP: ${clientIp}] - [Response: ${JSON.stringify(response)}]`
                    )

                    return {
                        statusCode: response?.statusCode || status.OK,
                        code: response?.code || MESSAGE_CODES.SUCCESS,
                        data: response?.data || null,
                        message: response?.message || "request successful"
                    }
                }),
                catchError((error) => {
                    // Format error responses without throwing
                    const duration = Date.now() - now

                    // Format the error response
                    const formattedError = {
                        statusCode: error.error?.statusCode || status.INTERNAL,
                        code: error.error?.code || MESSAGE_CODES.INTERNAL_SERVER_ERROR,
                        data: null,
                        message: `an error occurred [${handler}] - timestamp: ${new Date().toISOString()}`
                    }

                    this.logger.error(
                        `GRPC Error - [Service: ${serviceName}] [Class: ${className}] [Handler: ${handler}]  - [StatusCode: ${error.error ? error.error.statusCode || status.INTERNAL : status.INTERNAL}] - [Error: ${error.message}] - [Stack: ${error.stack}] -  [Timestamp: ${new Date().toISOString()}]`
                    )

                    // Log outgoing gRPC error response as info
                    this.logger.info(
                        `Outgoing gRPC Error Response - [Service: ${serviceName}] [Class: ${className}] [Handler: ${handler}] - [Duration: ${duration}ms] - [UserAgent: ${userAgent}, IP: ${clientIp}] - [Response: ${JSON.stringify(formattedError)}]`
                    )

                    return of(formattedError)
                })
            )
        } else {
            // Handle other contexts if needed (e.g., HTTP)
            return next.handle()
        }
    }
}
