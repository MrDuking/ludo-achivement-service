import { ApiProperty, ApiResponseProperty } from "@nestjs/swagger"
import { Exclude, Expose, Type } from "class-transformer"
import { IsNotEmpty, IsString, ValidateNested } from "class-validator"
import { CurrencyDto, CurrencyRequestDto } from "./currency.dto"

export class RecordSolarSystemCommissionDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    userId: string

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    paymentId: string

    @ApiProperty()
    @ValidateNested({ each: true })
    @Type(() => CurrencyRequestDto)
    currency: CurrencyRequestDto
}

@Exclude()
export class CommissionDistributionReponseDto {
    @ApiResponseProperty()
    @Expose()
    referrerId: string

    @ApiResponseProperty()
    @Expose()
    commisssionLevel: number

    @ApiResponseProperty()
    @Expose()
    commissionAmount: CurrencyDto
}

@Exclude()
export class SolarSystemCommissionLogDto {
    @ApiResponseProperty()
    @Expose()
    userId: string

    @ApiResponseProperty()
    @Expose()
    commissionDistribution: CommissionDistributionReponseDto[]

    @ApiResponseProperty()
    @Expose()
    paymentId: string
}
