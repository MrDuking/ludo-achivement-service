import { ApiResponseProperty } from "@nestjs/swagger"
import { Exclude, Expose, Transform } from "class-transformer"
import { LeaderboardSeasonResponse } from "./leaderboard-season-response.dto"

@Exclude()
export class ReferralCountResponseDto {
    @ApiResponseProperty()
    @Expose()
    seasonId: number

    @ApiResponseProperty()
    @Expose()
    userId: string

    @ApiResponseProperty()
    @Expose()
    invitedCount: number

    @ApiResponseProperty()
    @Expose()
    month?: number

    @ApiResponseProperty()
    @Expose()
    week?: number

    @ApiResponseProperty()
    @Expose()
    day?: number

    @ApiResponseProperty()
    @Expose()
    rewardClaimed: boolean

    @ApiResponseProperty()
    @Expose()
    @Transform(({ value }) => (value ? value.toISOString() : undefined))
    claimDate?: string
}
export class UserRankingPagingResponseDto {
    @ApiResponseProperty({ type: [ReferralCountResponseDto] })
    users: ReferralCountResponseDto[]

    @ApiResponseProperty()
    total: number

    @ApiResponseProperty()
    page: number

    @ApiResponseProperty()
    pages: number
}
export class ReferralCountLeaderBoardResponseDto {
    @ApiResponseProperty({ type: UserRankingPagingResponseDto })
    userRanking: UserRankingPagingResponseDto

    @ApiResponseProperty({ type: ReferralCountResponseDto })
    player: ReferralCountResponseDto

    @ApiResponseProperty({ type: LeaderboardSeasonResponse })
    season: LeaderboardSeasonResponse
}
