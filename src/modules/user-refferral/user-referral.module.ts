import { Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import { AchievementModule } from "../achievement/achievement.module"
import { BotControllerModule } from "../bot-controller/bot-controller.module"
import { LeaderboardModule } from "../leaderboard/leaderboard.module"
import { RedisModule } from "../redis/redis.module"
import { UserGameInfoModule } from "../user-game-info/user-game-info.module"
import { UserInventoryModule } from "../user-inventory/user-inventory.module"
import { UserModule } from "../user/user.module"
import { UserRefferalRepository } from "./repositories"
import { SolarSystemRepository } from "./repositories/solar-system.repository"
import {
    SolarSystemClaimLog,
    SolarSystemClaimLogSchema,
    SolarSystemCommissionLog,
    SolarSystemCommissionLogSchema,
    SolarSystemConfig,
    SolarSystemConfigSchema,
    SolarSystemUserLevel,
    SolarSystemUserLevelSchema,
    SolarSystemWithdrawLog,
    SolarSystemWithdrawLogSchema,
    UserReferral,
    UserReferralDateLog,
    UserReferralDateLogSchema,
    UserReferralSchema
} from "./schemas"
import { SolarSystemService } from "./solar-system.service"
import { UserReferralController } from "./user-referral.controller"
import { UserReferralService } from "./user-referral.service"

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: UserReferral.name, schema: UserReferralSchema },
            { name: UserReferralDateLog.name, schema: UserReferralDateLogSchema },
            { name: SolarSystemUserLevel.name, schema: SolarSystemUserLevelSchema },
            { name: SolarSystemCommissionLog.name, schema: SolarSystemCommissionLogSchema },
            { name: SolarSystemConfig.name, schema: SolarSystemConfigSchema },
            { name: SolarSystemWithdrawLog.name, schema: SolarSystemWithdrawLogSchema },
            { name: SolarSystemClaimLog.name, schema: SolarSystemClaimLogSchema }
        ]),
        LeaderboardModule,
        UserGameInfoModule,
        UserInventoryModule,
        AchievementModule,
        UserModule,
        BotControllerModule,
        RedisModule
    ],
    providers: [UserReferralService, SolarSystemService, UserRefferalRepository, SolarSystemRepository],
    controllers: [UserReferralController],
    exports: [UserReferralService]
})
export class UserReferralModule {}
