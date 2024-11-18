import { ApiResponseProperty } from "@nestjs/swagger"

export class QuestPointDto {
    @ApiResponseProperty()
    totalQuestPointEarned: number

    @ApiResponseProperty()
    userId: string
}

export class UpdateReferralPointResponse {
    @ApiResponseProperty()
    userId: string

    @ApiResponseProperty()
    totalFriendInvited: number

    @ApiResponseProperty()
    totalLutonEarnedByInvite: number
}
