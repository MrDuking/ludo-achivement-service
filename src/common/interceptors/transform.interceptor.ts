import { CallHandler, ExecutionContext, HttpStatus, Injectable, NestInterceptor } from "@nestjs/common"
import { Observable, map } from "rxjs"
import { ResponseType } from "../dtos"

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ResponseType<T>> {
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<ResponseType<T>> | Promise<Observable<ResponseType<T>>> {
        const response = context.switchToHttp().getResponse()
        const contextType = context.getType()

        if (response.statusCode === HttpStatus.FOUND || contextType === "rpc") {
            // is redirect route
            return next.handle()
        }

        const url = context.switchToHttp().getRequest().url

        if ((url && url.match(/metadata\/catgm-voucher/)) || url.match(/metadata\/collection\/catgm-voucher/)) {
            return next.handle()
        }

        return next.handle().pipe(
            map((data) => {
                return {
                    statusCode: response.statusCode,
                    code: data?.code,
                    data: data?.data,
                    message: data?.message
                    // metadata: data?.metadata
                }
            })
        )
    }
}
