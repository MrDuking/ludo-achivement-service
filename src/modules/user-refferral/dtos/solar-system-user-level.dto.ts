import { ApiProperty, ApiResponseProperty } from "@nestjs/swagger"
import { Exclude, Expose, Transform } from "class-transformer"
import { IsNumber, Max, Min } from "class-validator"
import { CurrencyDto } from "./currency.dto"

export class ClaimSolarUserLevel {
    @ApiProperty()
    @IsNumber()
    @Min(1)
    @Max(5)
    level: number
}

@Exclude()
export class UserLevelResponseDto {
    @ApiResponseProperty()
    @Expose()
    userId: string

    @ApiResponseProperty()
    @Expose()
    level: number

    @ApiResponseProperty({ type: [CurrencyDto] })
    @Expose()
    accumulatedCommission: CurrencyDto[]

    @ApiResponseProperty()
    @Expose()
    totalInvitedFriendInLevel?: number

    @ApiResponseProperty()
    @Expose()
    isUnLoked: boolean

    @ApiResponseProperty()
    @Expose()
    @Transform(({ value }) => (value ? value.toISOString() : undefined))
    unLokedDate: string
}

export class GetCurrentUserLevelResponseDto {
    levels: UserLevelResponseDto[]
}
