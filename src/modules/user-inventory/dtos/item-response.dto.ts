import { ApiResponseProperty } from "@nestjs/swagger"
import { Exclude, Expose } from "class-transformer"

@Exclude()
export class ItemResponse {
    @ApiResponseProperty()
    @Expose()
    id: number

    @ApiResponseProperty()
    @Expose()
    name: string

    @ApiResponseProperty()
    @Expose()
    imageURL: string

    @ApiResponseProperty()
    @Expose()
    currencyType: number

    @ApiResponseProperty()
    @Expose()
    cost: number

    @ApiResponseProperty()
    @Expose()
    itemType: number
}

export class FrameResponse extends ItemResponse {}

export class EmojiResponse extends ItemResponse {}

export class DiceResponse extends ItemResponse {}

export class ListItemResponse {
    @ApiResponseProperty()
    emojis: EmojiResponse[]

    @ApiResponseProperty()
    dices: DiceResponse[]

    @ApiResponseProperty()
    frames: FrameResponse[]
}
