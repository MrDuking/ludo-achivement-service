import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator"

export class UpdateUserGameInfoDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    userId: string

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    @Min(0)
    totalMatchPlayed?: number

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    @Min(0)
    totaClassicModeWins?: number

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    @Min(0)
    totaRushModeWins?: number

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    @Min(0)
    totaBlitzModeWins?: number

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    @Min(0)
    totaTwoPlayerWins?: number

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    @Min(0)
    totaFourPlayerWins?: number

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    @Min(0)
    totalPawnCaptured?: number

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    @Min(0)
    totalCoinEarned?: number

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    @Min(0)
    totalCoinSpend?: number

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    @Min(0)
    totalDiamondEarned?: number

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    @Min(0)
    totalDiamondSpend?: number

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    @Min(0)
    totalLutonEarned?: number

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    @Min(0)
    totalLutonSpend?: number

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    @Min(0)
    totalQuestPointEarned?: number

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    @Min(0)
    totalAdsWatched?: number

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    @Min(0)
    totalReferralPointEarned?: number

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    @Min(0)
    totalPremiumReferralPointEarned?: number

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    @Min(0)
    totalFriendInvited?: number
}

export class UpdateUserTotalQuestPoint {
    @IsString()
    @IsNotEmpty()
    userId: string
}
