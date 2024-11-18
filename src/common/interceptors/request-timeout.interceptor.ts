import { CallHandler, ExecutionContext, HttpException, HttpStatus, Injectable, NestInterceptor } from "@nestjs/common"
import { ConfigService as NestConfigService } from "@nestjs/config"
import { Observable, TimeoutError, catchError, throwError, timeout } from "rxjs"
import { MESSAGE_CODES } from "../constants"

@Injectable()
export class RequestTimeoutInterceptor implements NestInterceptor {
    constructor(private readonly nestConfigService: NestConfigService) {}
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            timeout(+(this.nestConfigService.get<number>("API_TIMEOUT") ?? 20000)),
            catchError((err) => {
                if (err instanceof TimeoutError) {
                    throw new HttpException(`request timeout`, HttpStatus.REQUEST_TIMEOUT, {
                        cause: {
                            code: MESSAGE_CODES.REQUEST_TIMEOUT,
                            message: "timeout"
                        }
                    })
                }
                return throwError(() => err)
            })
        )
    }
}
