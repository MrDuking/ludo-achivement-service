import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { ApiResponseProperty } from "@nestjs/swagger"
import { BaseSchema } from "../../../common/schemas/base.schema"

const COLLECTION_NAME = "users"
@Schema({
    collection: COLLECTION_NAME,
    timestamps: true,
    versionKey: false
})
export class User extends BaseSchema {
    @ApiResponseProperty()
    @Prop({ type: String, unique: true, required: true })
    id: string

    @ApiResponseProperty()
    @Prop({ type: Boolean, default: false })
    isTelegramPremiumUser: boolean

    @ApiResponseProperty()
    @Prop({ type: String, default: "" })
    email: string

    @ApiResponseProperty()
    @Prop({ type: String, required: true })
    name: string

    @ApiResponseProperty()
    @Prop({ type: String, default: "" })
    walletAddress?: string

    @ApiResponseProperty()
    @Prop({ default: new Date() })
    lastLoginDate: string

    @ApiResponseProperty()
    @Prop({ type: String, default: "" })
    refCode: string

    @ApiResponseProperty()
    @Prop({ type: String })
    refCodeUpdateTime: string

    @ApiResponseProperty()
    @Prop({ type: String })
    sessionId?: string

    @ApiResponseProperty()
    @Prop({ type: String })
    countryCode: string

    @ApiResponseProperty()
    @Prop({ type: String })
    lastLoginIP: string

    @ApiResponseProperty()
    @Prop({ type: Number, default: 0 })
    playTime: number

    @ApiResponseProperty()
    @Prop({ type: String })
    avatar: string

    @ApiResponseProperty()
    @Prop({ type: String })
    avatarUpdateTime?: string

    @ApiResponseProperty()
    @Prop({ type: Boolean, default: false })
    isRegisteredPayment?: boolean
}
export const UserSchema = SchemaFactory.createForClass(User)
