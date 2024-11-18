import { ApiResponseProperty } from "@nestjs/swagger"
import { Exclude, Expose, Transform } from "class-transformer"

@Exclude()
export class UserInventoryLogResponse {
    @Expose()
    @ApiResponseProperty()
    userId: string

    @Expose()
    @ApiResponseProperty()
    currencyId?: number

    @Expose()
    @ApiResponseProperty()
    amount?: number

    @Expose()
    @ApiResponseProperty()
    action: string

    @Expose()
    @ApiResponseProperty()
    @Transform(({ value }) => (value ? JSON.stringify(value) : ""))
    actionData?: string

    @Expose()
    @ApiResponseProperty()
    @Transform(({ value }) => (value ? value.toString() : ""))
    transactionDate?: string
}

@Exclude()
export class UserInventoryLogMessage extends UserInventoryLogResponse {
    @Expose()
    @Transform(({ value }) => value.toString())
    _id: string
}
