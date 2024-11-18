import { ApiProperty } from "@nestjs/swagger"
import { IsEnum, IsNotEmpty, IsNumber } from "class-validator"
import { ItemType } from "src/common"

export class BuyItemDto {
    @IsNumber()
    @IsNotEmpty()
    @ApiProperty()
    itemId: number

    @IsNotEmpty()
    @IsEnum(ItemType)
    @ApiProperty()
    itemType: number
}
