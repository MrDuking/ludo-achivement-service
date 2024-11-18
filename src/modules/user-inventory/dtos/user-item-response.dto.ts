import { ApiResponseProperty } from "@nestjs/swagger"
import { Exclude, Expose } from "class-transformer"

export class UserItemResponse {
    @ApiResponseProperty()
    @Expose()
    itemId: number

    @ApiResponseProperty()
    @Expose()
    isActive: boolean
}

@Exclude()
export class UserItemsReponse {
    @ApiResponseProperty()
    @Expose()
    userId: string

    @ApiResponseProperty()
    @Expose()
    frames: UserItemResponse[]

    @ApiResponseProperty()
    @Expose()
    dices: UserItemResponse[]

    @ApiResponseProperty()
    @Expose()
    emojis: UserItemResponse[]
}
