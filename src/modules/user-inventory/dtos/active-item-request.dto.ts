import { ApiProperty } from "@nestjs/swagger"
import { IsArray, IsEnum, IsNotEmpty } from "class-validator"
import { ItemType } from "src/common"

export class ActiveItemRequestDto {
    @ApiProperty({
        example: [0]
    })
    @IsArray()
    oldActiveItemIds: number[]

    @ApiProperty({
        example: [1]
    })
    @IsArray()
    newActiveItemIds: number[]

    @IsNotEmpty()
    @IsEnum(ItemType)
    @ApiProperty()
    itemType: number
}
