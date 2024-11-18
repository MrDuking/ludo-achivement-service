import { Metadata } from "@grpc/grpc-js"
import { Inject, Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { ClientGrpc } from "@nestjs/microservices"
import { lastValueFrom } from "rxjs"
import { BotControllerSerivceGrpc, NotifyQuery, NotifyResponse } from "./interfaces"

@Injectable()
export class BotControllerService {
    private botControllerGrpcService: BotControllerSerivceGrpc

    constructor(
        @Inject("BOT_CONTROLLER_GRPC") private readonly client: ClientGrpc,
        private readonly configService: ConfigService
    ) {}

    onModuleInit() {
        this.botControllerGrpcService = this.client.getService<BotControllerSerivceGrpc>("BotControllerService")
    }

    async postNotificationToTelegramBot(query: NotifyQuery): Promise<NotifyResponse> {
        try {
            const metadata = new Metadata()
            metadata.set("x-api-key", this.configService.get<string>("BOT_CONTROLLER_SERVICE_API_KEY") || "")
            metadata.set("x-app-id", this.configService.get<string>("AUTH_APP_ID") || "")

            return await lastValueFrom(this.botControllerGrpcService.postNotificationToTelegramBot(query, metadata))
        } catch (error) {
            throw error
        }
    }
}
