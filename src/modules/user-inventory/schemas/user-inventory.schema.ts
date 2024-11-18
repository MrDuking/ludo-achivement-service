import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"

const COLLECTION_NAME = "user_inventory"
@Schema({
    collection: COLLECTION_NAME,
    timestamps: true,
    versionKey: false
})
export class UserInventory {
    @Prop({ type: String, required: true })
    userId: string

    @Prop({ type: Number, required: true })
    currencyId: number

    @Prop({ type: Number, default: 0 })
    amount: number
}

export const UserInventorySchema = SchemaFactory.createForClass(UserInventory)
