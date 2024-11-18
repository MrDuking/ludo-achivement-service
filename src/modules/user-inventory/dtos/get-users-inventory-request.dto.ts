import { ApiProperty } from "@nestjs/swagger"
import { ArrayMaxSize, ArrayMinSize, IsArray } from "class-validator"
export class GetUsersInventoryRequestDto {
    @IsArray()
    @ArrayMinSize(2) // Minimum number of elements in the array
    @ArrayMaxSize(4) // Maximum number of elements in the array
    @ApiProperty({
        example: ["5692805714", "6631449425"]
    })
    userIds: string[]
}
