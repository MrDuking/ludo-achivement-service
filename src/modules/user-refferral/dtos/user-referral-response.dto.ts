import { ApiResponseProperty } from "@nestjs/swagger"
import { Exclude, Expose, Transform } from "class-transformer"
import { CurrencyDto } from "./currency.dto"

@Exclude()
export class UserReferralDto {
    @ApiResponseProperty()
    @Expose()
    userId: string

    @ApiResponseProperty()
    @Expose()
    refBy: string

    @ApiResponseProperty()
    @Expose()
    name?: string

    @ApiResponseProperty()
    @Expose()
    avatar?: string

    @ApiResponseProperty()
    @Expose()
    @Transform(({ value }) => (value ? value.toISOString() : undefined))
    refTime?: string

    @ApiResponseProperty()
    @Expose()
    server: number

    @ApiResponseProperty()
    @Expose()
    solarLevel: number

    @ApiResponseProperty()
    @Expose()
    solarBalance: CurrencyDto[]

    @ApiResponseProperty()
    @Expose()
    totalLutonEarnedByInvite: number

    @ApiResponseProperty()
    @Expose()
    totalPremiumFriendInvited: number

    @ApiResponseProperty()
    @Expose()
    totalFriendInvited: number
}

export class GetReferralsResponseDto {
    @ApiResponseProperty({ type: [UserReferralDto] })
    referrals: UserReferralDto[]

    @ApiResponseProperty()
    totalLutonEarnedByInvite: number

    @ApiResponseProperty()
    totalPremiumFriendInvited: number

    @ApiResponseProperty()
    totalFriendInvited: number

    @ApiResponseProperty()
    total: number

    @ApiResponseProperty()
    page: number

    @ApiResponseProperty()
    pages: number
}

export class GetRefByResponseDto {
    @ApiResponseProperty()
    refCode: string | null

    // @ApiResponseProperty()
    // clubRefCode: string | null
}
