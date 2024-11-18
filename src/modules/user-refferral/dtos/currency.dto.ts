import { ApiProperty, ApiResponseProperty } from "@nestjs/swagger"
import { Transform } from "class-transformer"
import { IsEnum, IsNumber, Min } from "class-validator"
import { Currency } from "src/common"

export class CurrencyDto {
    @ApiResponseProperty()
    type: number

    @ApiResponseProperty()
    amount: number
}

export class CurrencyRequestDto {
    @ApiProperty()
    @IsEnum(Currency)
    type: number

    @ApiProperty()
    @Transform(({ value }) => Number(value))
    @IsNumber()
    @Min(0)
    amount: number
}
