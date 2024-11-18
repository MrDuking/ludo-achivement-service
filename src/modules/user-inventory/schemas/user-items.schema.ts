import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"

@Schema({
    timestamps: false,
    versionKey: false,
    _id: false
})
export class UserItem {
    @Prop({ type: Number, required: true })
    itemId: number

    @Prop({ type: Boolean, default: false })
    isActive: boolean
}

const COLLECTION_NAME = "user_items"

@Schema({ collection: COLLECTION_NAME, timestamps: true, versionKey: false })
export class UserItems {
    _id: any

    @Prop({ required: true, unique: true })
    userId: string

    @Prop({
        type: [UserItem],
        default: [
            {
                itemId: 0,
                isActive: true
            }
        ]
    })
    frames: UserItem[]

    @Prop({
        type: [UserItem],
        default: [
            {
                itemId: 0,
                isActive: true
            }
        ]
    })
    dices: UserItem[]

    @Prop({
        type: [UserItem],
        default: [
            {
                itemId: 1000,
                isActive: true
            }
        ]
    })
    emojis: UserItem[]
}

export const UserItemsSchema = SchemaFactory.createForClass(UserItems)
