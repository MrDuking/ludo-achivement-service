// src/leaderboard/dto/create-season.dto.ts
import { ApiPropertyOptional } from "@nestjs/swagger"
import { Transform, Type } from "class-transformer"
import { IsArray, IsBoolean, IsEnum, IsInt, IsNumber, IsOptional, IsString, Max, Min, ValidateNested } from "class-validator"
import { LeaderboardPeriod, LeaderboardSeasonStatus, LeaderboardType } from "src/common"
import { CurrencyRequestDto } from "./currency.dto"

export class CreatePoolRewardDto {
    @IsNumber()
    milestone: number

    @ValidateNested({ each: true })
    @Type(() => CurrencyRequestDto)
    reward: CurrencyRequestDto

    @IsBoolean()
    isUnclocked: boolean

    @IsOptional()
    unClockedDate?: Date
}

export class CreateRewardDistributionDto {
    @IsNumber()
    rankFrom: number

    @IsNumber()
    rankTo: number

    @IsString()
    rewardPercentage: number
}

export class CreateSeasonDto {
    @IsNumber()
    season: number

    @IsNumber()
    startTime: number

    @IsNumber()
    endTime: number

    @IsEnum(LeaderboardType)
    type: LeaderboardType

    @IsEnum(LeaderboardPeriod)
    @IsOptional()
    rewardPeriod?: LeaderboardPeriod

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreatePoolRewardDto)
    poolReward: CreatePoolRewardDto[]

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateRewardDistributionDto)
    rewardDistribution?: CreateRewardDistributionDto[]

    @IsEnum(LeaderboardSeasonStatus)
    status: number
}

export class SeasonQuery {
    @ApiPropertyOptional({ minimum: 1, default: 1 })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    readonly page: number = 1

    @ApiPropertyOptional({ minimum: 1, maximum: 400, default: 10 })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(400)
    readonly limit: number = 10

    @Transform(({ value }) => Number(value))
    @IsNumber()
    season: number
}
