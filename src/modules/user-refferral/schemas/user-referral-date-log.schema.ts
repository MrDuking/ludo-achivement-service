import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { HydratedDocument } from "mongoose"
import { BaseSchema } from "src/common"

export type UserReferralDateLogDocument = HydratedDocument<UserReferralDateLog>

const COLLECTION_NAME = "user_referral_date_log"

@Schema({
    collection: COLLECTION_NAME,
    timestamps: true,
    versionKey: false
})
export class UserReferralDateLog extends BaseSchema {
    @Prop({ type: String })
    userId: string

    @Prop({ type: Number })
    date: number

    @Prop({ type: Number })
    year: number

    @Prop({ type: Number })
    totalLutonEarnedByInvite: number

    @Prop({ type: Number })
    totalPremiumFriendInvited: number

    @Prop({ type: Number })
    totalFriendInvited: number
}

export const UserReferralDateLogSchema = SchemaFactory.createForClass(UserReferralDateLog)
