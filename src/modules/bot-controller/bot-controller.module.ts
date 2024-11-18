import { Module } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { ClientProvider, ClientsModule, Transport } from "@nestjs/microservices"
import { join } from "path"
import { PAKAGES } from "src/common"
import { BotControllerService } from "./bot-controller.service"

@Module({
    imports: [
        ClientsModule.registerAsync([
            {
                name: "BOT_CONTROLLER_GRPC",
                useFactory: async (configService: ConfigService): Promise<ClientProvider> => ({
                    transport: Transport.GRPC,
                    options: {
                        package: [PAKAGES.BOT_CONTROLLER],
                        protoPath: [join(__dirname, `../../../protos/bot-controller.proto`)],
                        url: configService.get<string>("BOT_CONTROLLER_GRPC_URL") || ""
                    }
                }),
                inject: [ConfigService]
            }
        ])
    ],
    providers: [BotControllerService],
    exports: [BotControllerService]
})
export class BotControllerModule {}
