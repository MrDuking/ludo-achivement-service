import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { BaseSchema } from "../../../common/schemas"

const COLLECTION_NAME = "user_game_info"
@Schema({
    collection: COLLECTION_NAME,
    timestamps: true,
    versionKey: false
})
export class UserGameInfo extends BaseSchema {
    @Prop({ type: String, required: true })
    userId: string

    @Prop({ type: Number, default: 0 })
    totalMatchPlayed: number

    @Prop({ type: Number, default: 0 })
    totalClassicModeWins: number

    @Prop({ type: Number, default: 0 })
    totalRushModeWins: number

    @Prop({ type: Number, default: 0 })
    totalBlitzModeWins: number

    @Prop({ type: Number, default: 0 })
    totalTwoPlayerWins: number

    @Prop({ type: Number, default: 0 })
    totalFourPlayerWins: number

    @Prop({ type: Number, default: 0 })
    totalPawnCaptured: number

    @Prop({ type: Number, default: 0 })
    totalCoinEarned: number

    @Prop({ type: Number, default: 0 })
    totalCoinSpend: number

    @Prop({ type: Number, default: 0 })
    totalDiamondEarned: number

    @Prop({ type: Number, default: 0 })
    totalDiamondSpend: number

    @Prop({ type: Number, default: 0 })
    totalLutonEarned: number

    @Prop({ type: Number, default: 0 })
    totalLutonSpend: number

    @Prop({ type: Number, default: 0 })
    totalQuestPointEarned: number

    @Prop({ type: Number, default: 0 })
    totalAdsWatched: number

    @Prop({ type: Number, default: 0 })
    totalLutonEarnedByInvite: number

    @Prop({ type: Number, default: 0 })
    totalFriendInvited: number
}
export const UserGameInfoSchema = SchemaFactory.createForClass(UserGameInfo)
