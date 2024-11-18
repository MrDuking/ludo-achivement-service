import { Module } from "@nestjs/common"
import { ScheduleModule } from "@nestjs/schedule"
import { LeaderboardModule } from "../leaderboard/leaderboard.module"
import { LeaderboardScheduler } from "./scheduler"

@Module({
    imports: [ScheduleModule.forRoot(), LeaderboardModule],
    providers: [LeaderboardScheduler]
})
export class WorkerModule {}
