import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { initSolarBalance } from "@utils"
import { HydratedDocument } from "mongoose"
import { BaseSchema, CurrencySchema } from "src/common"

export type UserReferralDocument = HydratedDocument<UserReferral>

const COLLECTION_NAME = "user_referrals"
@Schema({
    collection: COLLECTION_NAME,
    timestamps: true,
    versionKey: false
})
export class UserReferral extends BaseSchema {
    @Prop({ type: String, required: true, unique: true })
    userId: string

    @Prop({ type: String })
    name?: string

    @Prop({ type: String })
    avatar?: string

    @Prop({ type: String, required: true })
    refBy: string

    @Prop({ type: Date })
    refTime?: Date

    @Prop({ default: 1 })
    server: number

    @Prop({ type: Number, default: 0 })
    solarLevel: number

    @Prop({ type: [CurrencySchema], default: initSolarBalance })
    solarBalance: CurrencySchema[]

    @Prop({ type: Number, default: 0 })
    totalLutonEarnedByInvite: number

    @Prop({ type: Number, default: 0 })
    totalPremiumFriendInvited: number

    @Prop({ type: Number, default: 0 })
    totalFriendInvited: number
}

export const UserReferralSchema = SchemaFactory.createForClass(UserReferral)
UserReferralSchema.index({ userId: 1, refBy: 1 }, { unique: true })
UserReferralSchema.index({ deletedAt: 1, userId: 1, server: 1 })
UserReferralSchema.index({ deletedAt: 1, refBy: 1, server: 1, solarLevel: 1 })
