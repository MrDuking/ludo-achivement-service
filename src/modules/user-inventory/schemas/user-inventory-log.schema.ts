import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { HydratedDocument } from "mongoose"
import { BaseSchema } from "src/common"

export type UserInventoryLogDocument = HydratedDocument<UserInventoryLog>

const COLLECTION_NAME = "user_inventory_logs"

@Schema({
    collection: COLLECTION_NAME,
    timestamps: false,
    versionKey: false
})
export class UserInventoryLog extends BaseSchema {
    @Prop({ type: String, required: true })
    userId: string // Reference to the user

    @Prop()
    currencyId: number // Currency ID (e.g., coins, diamonds, ludoton)

    @Prop()
    amount: number // Amount of currency involved in the transaction

    @Prop({ type: String, required: true })
    action: string // Description of the transaction (e.g., "Purchased dice", "Earned reward", etc.)

    @Prop({ type: Object })
    actionData: object

    @Prop({ type: Date })
    transactionDate: Date // Timestamp for when the transaction occurred
}

export const UserInventoryLogSchema = SchemaFactory.createForClass(UserInventoryLog)
UserInventoryLogSchema.index({ deletedAt: 1, userId: 1, action: 1 })
