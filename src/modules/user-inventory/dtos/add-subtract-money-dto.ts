import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsNumber, IsString, Min } from "class-validator"

export class AddSubtractMoneyDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    userId: string

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty()
    currencyId: number

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty()
    @Min(0)
    amount: number
}
