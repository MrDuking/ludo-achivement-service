import { ApiProperty } from "@nestjs/swagger"
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator"
import { GameNumberPlayer, GameType, InGameCurrency } from "../../../common/enums"

export class IncrementUserGameInfoDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    userId: string

    @ApiProperty({ enum: InGameCurrency })
    @IsEnum(InGameCurrency)
    @IsOptional()
    currency?: InGameCurrency

    @ApiProperty()
    @IsNumber()
    @Min(0)
    @IsOptional()
    earnAmount?: number

    @ApiProperty()
    @IsNumber()
    @Min(0)
    @IsOptional()
    spendAmount?: number

    @ApiProperty({ enum: GameType })
    @IsEnum(GameType)
    @IsOptional()
    gameType?: GameType

    @ApiProperty({ enum: GameNumberPlayer })
    @IsEnum(GameNumberPlayer)
    @IsOptional()
    gameNumberPlayer?: GameNumberPlayer

    @ApiProperty()
    @IsNumber()
    @Min(0)
    @IsOptional()
    matchWon?: number

    @ApiProperty()
    @IsNumber()
    @Min(0)
    @IsOptional()
    pawnsCaptured?: number

    @ApiProperty()
    @IsNumber()
    @Min(0)
    @IsOptional()
    questPointEarned?: number

    @ApiProperty()
    @IsNumber()
    @Min(0)
    @IsOptional()
    friendInvited?: number

    @ApiProperty()
    @IsNumber()
    @Min(0)
    @IsOptional()
    premiumReferralPointEarned?: number

    @ApiProperty()
    @IsNumber()
    @Min(0)
    @IsOptional()
    referralPointEarned?: number

    @ApiProperty()
    @IsNumber()
    @Min(0)
    @IsOptional()
    adsWatched?: number
}
