import { ApiProperty } from "@nestjs/swagger"
import { IsNumber, IsString } from "class-validator"
import { CurrencyDto } from "./currency.dto"

export class CreateClaimSolarLogDto {
    @ApiProperty()
    @IsString()
    userId: string

    @ApiProperty()
    @IsNumber()
    level: number

    @ApiProperty({ type: [CurrencyDto] })
    accumulatedCommission: CurrencyDto[]
}
