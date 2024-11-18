import { Controller, Get, HttpException, HttpStatus, Query, UseGuards } from "@nestjs/common"
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger"
import { ApiOkResponseCustom, AuthGuard, CurrentUser, MESSAGE_CODES, ResponseType } from "src/common"
import { LeaderboardSeasonResponse, ReferralCountLeaderBoardResponseDto, SeasonQuery } from "./dtos"
import { LeaderboardReferralService } from "./leaderboard-referral.service"
import { LeaderboardService } from "./leaderboard.service"

@Controller("leader-board")
@ApiTags("Leader Board")
export class LeaderboardController {
    constructor(
        private readonly leaderboardService: LeaderboardService,
        private readonly leaderboardReferralService: LeaderboardReferralService
    ) {}

    @Get("referral/latest-season")
    @UseGuards(AuthGuard)
    @ApiBearerAuth("access-token")
    @ApiOkResponseCustom(ResponseType, LeaderboardSeasonResponse)
    async getOpenSeasonReferral() {
        try {
            const res = await this.leaderboardReferralService.getLatestSeason()

            return {
                statusCode: HttpStatus.OK,
                code: MESSAGE_CODES.SUCCESS,
                data: res
            }
        } catch (error) {
            throw new HttpException(error?.message || "server internal error", error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR, {
                cause: {
                    code: error?.code || MESSAGE_CODES.INTERNAL_SERVER_ERROR,
                    message: error
                }
            })
        }
    }

    @Get("referral/previous")
    @UseGuards(AuthGuard)
    @ApiBearerAuth("access-token")
    @ApiOkResponseCustom(ResponseType, ReferralCountLeaderBoardResponseDto)
    async getPreviousReferralSeason(@CurrentUser("id") userId: string, @Query() query: SeasonQuery) {
        try {
            const res = await this.leaderboardReferralService.getListUserRefPreviousSeasonRank(userId, query.season, query.page, query.limit)

            return {
                statusCode: HttpStatus.OK,
                code: MESSAGE_CODES.SUCCESS,
                data: res
            }
        } catch (error) {
            throw new HttpException(error?.message || "server internal error", error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR, {
                cause: {
                    code: error?.code || MESSAGE_CODES.INTERNAL_SERVER_ERROR,
                    message: error
                }
            })
        }
    }
}
