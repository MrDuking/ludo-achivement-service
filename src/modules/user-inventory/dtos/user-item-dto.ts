import { IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator"
import { ItemType } from "src/common"

export class UserItemDto {
    @IsString()
    @IsNotEmpty()
    userId: string

    @IsEnum(ItemType)
    @IsNotEmpty()
    itemType: ItemType

    @IsNumber()
    @IsNotEmpty()
    itemId: number
}
