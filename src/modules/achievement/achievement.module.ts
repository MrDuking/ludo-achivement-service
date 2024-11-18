import { Module } from "@nestjs/common"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { ClientProvider, ClientsModule, Transport } from "@nestjs/microservices"
import { join } from "path"
import { PAKAGES } from "src/common"
import { AchievementService } from "./achievement.service"

@Module({
    imports: [
        ConfigModule.forRoot(), // Ensure ConfigModule is imported
        ClientsModule.registerAsync([
            {
                name: "ACHIEVEMENT_SERVICE",
                useFactory: async (configService: ConfigService): Promise<ClientProvider> => ({
                    transport: Transport.GRPC,
                    options: {
                        package: PAKAGES.ACHIEVEMENT,
                        protoPath: join(__dirname, "../../../protos/achievement.proto"),
                        url: configService.get<string>("QUEST_GRPC_URL") || ""
                    }
                }),
                inject: [ConfigService] // Inject ConfigService into the factory
            }
        ])
    ],
    providers: [AchievementService],
    exports: [AchievementService]
})
export class AchievementModule {}
