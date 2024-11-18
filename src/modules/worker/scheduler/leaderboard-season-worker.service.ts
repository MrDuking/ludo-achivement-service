// src/leaderboard/leaderboard.scheduler.ts
import { Inject, Injectable } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"
import { WINSTON_MODULE_PROVIDER } from "nest-winston"
import { LeaderboardReferralService } from "src/modules/leaderboard/leaderboard-referral.service"
import { Logger } from "winston"

@Injectable()
export class LeaderboardScheduler {
    constructor(
        private readonly referralLeaderboardService: LeaderboardReferralService,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
    ) {}

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleCron() {
        try {
            this.logger.info(`👷‍♂️~ handleCron ~ checkAndCreateNewReferralSeason start: ${new Date().toISOString()}👷‍♂️`)
            await this.referralLeaderboardService.checkAndCreateNewReferralSeason()
        } catch (error) {
            this.logger.error("👷‍♂️~ Error in handleCron: ", error)
        }
    }
}
