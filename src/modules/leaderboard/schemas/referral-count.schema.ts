import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { HydratedDocument } from "mongoose"
import { BaseSchema } from "src/common"

export type ReferralCountDocument = HydratedDocument<ReferralCount>

const COLLECTION_NAME = "referral_count"

@Schema({
    collection: COLLECTION_NAME,
    timestamps: true,
    versionKey: false
})
export class ReferralCount extends BaseSchema {
    @Prop({ type: Number })
    seasonId: number

    @Prop({ type: String })
    userId: string

    @Prop({ type: Number, default: 0 })
    invitedCount: number

    @Prop({ type: Number })
    month?: number

    @Prop({ type: Number })
    week?: number

    @Prop({ type: Number })
    day?: number

    @Prop({ type: Boolean, default: false })
    rewardClaimed: boolean

    @Prop({ type: Date })
    claimDate?: Date
}

export const ReferralCountSchema = SchemaFactory.createForClass(ReferralCount)
ReferralCountSchema.index({ deletedAt: 1, seasonId: 1, userId: 1 })
