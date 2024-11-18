import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { Reflector } from "@nestjs/core"
import { MESSAGE_CODES } from "../constants"
import { IS_PUBLIC_KEY } from "../decorators"

@Injectable()
export class ApplicationGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly configService: ConfigService
    ) {}

    canActivate(context: ExecutionContext): boolean {
        // return true
        const ctxType = context.getType()
        if (ctxType === "http") {
            return this.handleHttpGuard(context)
        } else if (ctxType === "rpc") {
            return true
            // return await this.handleRpcGuard(context)
        }
        return false

        // throw new UnauthorizedException("invalid request context type")
    }

    // private async handleRpcGuard(context: ExecutionContext) {
    //     const { apiKey, appId } = this.extractCredentialFromMetadata(context.getArgByIndex(1))

    //     const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()])
    //     if (isPublic) {
    //         return true
    //     }

    //     // TODO: (@hhman24) get service apiKey by appId
    //     const app = await this.appsService.getAppById(appId)

    //     if (!app || app.apiKey !== apiKey) {
    //         throw new HandlerError("unauthorized", status.UNAUTHENTICATED, MESSAGE_CODES.UNAUTHORIZED, "grpc")
    //     }

    //     return true
    // }

    private handleHttpGuard(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest()

        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()])
        if (isPublic) {
            return true
        }

        const appInfo = this.extractCredentialFromHeader(request)

        if (appInfo.apiKey === this.configService.get<string>("GAME_SERVER_API_KEY")) {
            return true
        }

        throw new HttpException("unauthorized", HttpStatus.UNAUTHORIZED, {
            cause: {
                code: MESSAGE_CODES.UNAUTHORIZED
            }
        })
    }

    private extractCredentialFromMetadata(metadata: any): { apiKey: string; appId: string } {
        const apiKey = metadata.get("x-api-key")[0] || ""
        const appId = metadata.get("x-app-id")[0] || ""

        return {
            apiKey,
            appId
        }
    }

    private extractCredentialFromHeader(request: any): { apiKey: string; appId: string } {
        const apiKey = request.headers["x-api-key"] || ""
        const appId = request.headers["x-app-id"] || ""
        return {
            apiKey,
            appId
        }
    }
}
