import { Metadata } from "@grpc/grpc-js"
import { Inject, Injectable, OnModuleInit } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { ClientGrpc, RpcException } from "@nestjs/microservices"
import { lastValueFrom } from "rxjs"

interface AchievementServiceGrpc {
    RecordAchievementsByType(data: { userId: string; value: number; type: number }, metadata: Metadata): any
}
@Injectable()
export class AchievementService implements OnModuleInit {
    private achievementGrpcService: AchievementServiceGrpc

    constructor(
        @Inject("ACHIEVEMENT_SERVICE") private readonly client: ClientGrpc,
        private readonly configService: ConfigService
    ) {}

    onModuleInit() {
        this.achievementGrpcService = this.client.getService<AchievementServiceGrpc>("AchievementService")
    }

    private getMetadata(): Metadata {
        const metadata = new Metadata()
        metadata.set("x-api-key", this.configService.get<string>("QUEST_SERVICE_API_KEY") || "")
        metadata.set("x-app-id", this.configService.get<string>("AUTH_APP_ID") || "")
        return metadata
    }

    async recordAchievement(userId: string, type: number, value: number) {
        try {
            return await lastValueFrom(this.achievementGrpcService.RecordAchievementsByType({ userId, type, value }, this.getMetadata()))
        } catch (error) {
            throw new RpcException(`Failed to get achievement by id: ${error.message}`)
        }
    }
}
