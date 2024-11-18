import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { Transform, Type } from "class-transformer"
import { IsBoolean, IsDate, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator"
import { PageOptionsDto } from "src/common"

export class CreateUserReferralRequestDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    readonly userId: string

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty()
    readonly server: number

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    readonly refBy: string

    @ApiProperty({ default: new Date() })
    @Transform(({ value }) => new Date(value))
    @IsDate()
    refTime: Date
}

export class UpdateUserRefByDto {
    @IsString()
    @IsNotEmpty()
    userId: string

    @IsBoolean()
    isTelegramPremiumUser: boolean

    @IsOptional()
    server: number = 1

    @IsString()
    @IsNotEmpty()
    refBy: string

    @IsString()
    @IsNotEmpty()
    name: string

    @IsString()
    @IsNotEmpty()
    avatar: string
}

export class GetReferralsRequestDto extends PageOptionsDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    server: number

    @ApiPropertyOptional({ default: new Date() })
    @IsOptional()
    @Transform(({ value }) => new Date(value))
    @IsDate()
    startDate?: Date

    @ApiPropertyOptional({ default: new Date() })
    @IsOptional()
    @Transform(({ value }) => new Date(value))
    @IsDate()
    endDate?: Date
}

export class GetUserIDsRequestDto extends PageOptionsDto {
    @ApiProperty()
    @IsString()
    server: number
}

export class GetRefByRequestDto {
    @ApiProperty()
    @IsString()
    userId: string

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    server: number
}

export class GetRefByMessage {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    userId: string

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    server: number
}

export class GetTopRefQuery {
    @ApiProperty()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit: number
}
