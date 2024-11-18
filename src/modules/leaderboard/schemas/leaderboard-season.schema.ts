import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { HydratedDocument } from "mongoose"
import { BaseSchema, CurrencySchema, LeaderboardPeriod, LeaderboardType } from "src/common"

export type LeaderboardSeasonDocument = HydratedDocument<LeaderboardSeason>

const COLLECTION_NAME = "leaderboard_seasons"

export class PoolReward {
    @Prop({ type: Number, required: true })
    milestone: number

    @Prop({ type: CurrencySchema, required: true })
    reward: CurrencySchema

    @Prop({ type: Boolean })
    isUnclocked: boolean

    @Prop({ type: Date })
    unClockedDate?: Date
}

export class RewardDistribution {
    @Prop({ type: Number, required: true })
    rankFrom: number

    @Prop({ type: Number, required: true })
    rankTo: number

    @Prop({ type: Number, required: true })
    rewardPercentage: number
}

@Schema({
    collection: COLLECTION_NAME,
    timestamps: true,
    versionKey: false
})
export class LeaderboardSeason extends BaseSchema {
    @Prop({ type: Number, required: true })
    season: number

    @Prop({ type: Number })
    startTime: number

    @Prop({ type: Number })
    endTime: number

    @Prop({ type: Number, required: true })
    type: LeaderboardType

    @Prop({ type: Number, default: LeaderboardPeriod.ALLTIME })
    rewardPeriod: LeaderboardPeriod

    @Prop({ type: [PoolReward], required: true })
    poolReward: PoolReward[]

    @Prop({ type: [RewardDistribution], required: false })
    rewardDistribution?: RewardDistribution[]

    @Prop({ type: Number, default: true })
    status: number
}

export const LeaderboardSeasonSchema = SchemaFactory.createForClass(LeaderboardSeason)
LeaderboardSeasonSchema.index({ deletedAt: 1, type: 1, status: 1, endTime: 1, season: -1 })
LeaderboardSeasonSchema.index({ deletedAt: 1, type: 1, status: 1, season: -1 })
