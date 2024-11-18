import { HttpModule } from "@nestjs/axios"
import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { MongooseModule } from "@nestjs/mongoose"
import { EncryptModule } from "../encrypt/encrypt.module"
import { RedisModule } from "../redis/redis.module"
import { LeaderboardQuestService } from "./leaderboard-quest.service"
import { LeaderboardReferralService } from "./leaderboard-referral.service"
import { LeaderboardController } from "./leaderboard.controller"
import { LeaderboardService } from "./leaderboard.service"
import { LeaderboardSeasonRepository, ReferralCountRepository } from "./repositories"
import { LeaderboardSeason, LeaderboardSeasonSchema, ReferralCount, ReferralCountSchema } from "./schemas"

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: LeaderboardSeason.name, schema: LeaderboardSeasonSchema },
            { name: ReferralCount.name, schema: ReferralCountSchema }
        ]),
        ConfigModule,
        EncryptModule,
        RedisModule,
        HttpModule
    ],
    controllers: [LeaderboardController],
    providers: [LeaderboardService, LeaderboardReferralService, LeaderboardQuestService, LeaderboardSeasonRepository, ReferralCountRepository],
    exports: [LeaderboardService, LeaderboardReferralService, LeaderboardQuestService]
})
export class LeaderboardModule {}
