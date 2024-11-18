import { ApiResponseProperty } from "@nestjs/swagger"
import { Exclude, Expose } from "class-transformer"
import { DiceResponse, EmojiResponse, FrameResponse } from "./item-response.dto"
import { UserItemsReponse } from "./user-item-response.dto"

@Exclude()
export class UserInventoryResponse {
    @ApiResponseProperty()
    @Expose()
    userId: string

    @ApiResponseProperty()
    @Expose()
    currencyId: number

    @ApiResponseProperty()
    @Expose()
    amount: number
}

export class InventoryReponse {
    @ApiResponseProperty()
    userInventory: UserInventoryResponse[]

    @ApiResponseProperty()
    userItems: UserItemsReponse

    @ApiResponseProperty()
    dices: DiceResponse[]

    @ApiResponseProperty()
    emojis: EmojiResponse[]

    @ApiResponseProperty()
    frames: FrameResponse[]
}
