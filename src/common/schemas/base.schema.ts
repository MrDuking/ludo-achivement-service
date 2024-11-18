import { Prop } from "@nestjs/mongoose"

export abstract class BaseSchema {
    _id?: string

    @Prop()
    deletedAt?: Date

    @Prop()
    createdAt?: Date

    @Prop()
    updatedAt?: Date
}
