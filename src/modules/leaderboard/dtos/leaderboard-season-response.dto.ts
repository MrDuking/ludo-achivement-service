import { ApiResponseProperty } from "@nestjs/swagger"
import { Exclude, Expose, Transform } from "class-transformer"
import { CurrencyDto } from "./currency.dto"

export class PoolRewardResponse {
    @ApiResponseProperty()
    @Expose()
    milestone: number

    @ApiResponseProperty()
    @Expose()
    reward: CurrencyDto

    @ApiResponseProperty()
    @Expose()
    isUnclocked: boolean

    @ApiResponseProperty()
    @Expose()
    @Transform(({ value }) => (value ? value.toISOString() : undefined))
    unClockedDate?: string
}

export class RewardDistributionResponse {
    @ApiResponseProperty()
    @Expose()
    rankFrom: number

    @ApiResponseProperty()
    @Expose()
    rankTo: number

    @ApiResponseProperty()
    @Expose()
    rewardPercentage: number
}

@Exclude()
export class LeaderboardSeasonResponse {
    @ApiResponseProperty()
    @Expose()
    season: number

    @ApiResponseProperty()
    @Expose()
    startTime: number

    @ApiResponseProperty()
    @Expose()
    endTime: number

    @ApiResponseProperty()
    @Expose()
    type: number

    @ApiResponseProperty()
    @Expose()
    rewardPeriod: number

    @ApiResponseProperty()
    @Expose()
    poolReward: PoolRewardResponse[]

    @ApiResponseProperty()
    @Expose()
    rewardDistribution?: RewardDistributionResponse[]

    @ApiResponseProperty()
    @Expose()
    status: number
}
