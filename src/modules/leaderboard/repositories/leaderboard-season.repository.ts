import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model, Types } from "mongoose"
import { LeaderboardSeasonStatus, LeaderboardType } from "src/common"
import { CreateSeasonDto } from "../dtos"
import { LeaderboardSeason, LeaderboardSeasonDocument, ReferralCount, ReferralCountDocument } from "../schemas"

@Injectable()
export class LeaderboardSeasonRepository {
    constructor(
        @InjectModel(LeaderboardSeason.name) private readonly leaderboardSeasonModel: Model<LeaderboardSeasonDocument>,
        @InjectModel(ReferralCount.name) private readonly referralCountModel: Model<ReferralCountDocument>
    ) {}

    async createNewSeason(body: CreateSeasonDto) {
        return this.leaderboardSeasonModel.create({ ...body })
    }

    /**
     * @description find lastest by sorting season ref.
     */
    async getLastestReferralSeason(): Promise<LeaderboardSeason | null> {
        return this.leaderboardSeasonModel
            .findOne({ $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }], type: LeaderboardType.REFERRAL })
            .sort({ season: -1 })
            .lean()
            .exec()
    }

    /**
     * @description find open lastest season and haven't end yet.
     */
    async findOpenReferralSeason(): Promise<LeaderboardSeason | null> {
        const timestamp = new Date().getTime() // to milliseconds.

        return this.leaderboardSeasonModel
            .findOne({
                $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
                type: LeaderboardType.REFERRAL,
                status: LeaderboardSeasonStatus.OPEN,
                endTime: { $gt: timestamp }
            })
            .sort({ season: -1 })
            .lean()
            .exec()
    }

    async getPreviousReferralSeason(season: number): Promise<LeaderboardSeason | null> {
        return this.leaderboardSeasonModel
            .findOne({ $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }], type: LeaderboardType.REFERRAL, status: LeaderboardSeasonStatus.END, season: season })
            .lean()
            .exec()
    }

    async updateSeasonReferralStatus(_id: string, status: LeaderboardSeasonStatus) {
        return this.leaderboardSeasonModel.updateOne({ _id: new Types.ObjectId(_id) }, { $set: { status: status } }).exec()
    }

    async findOneAndUpdateReferralSeasonStatus(_id: string, status: LeaderboardSeasonStatus) {
        return this.leaderboardSeasonModel.findOneAndUpdate({ _id: new Types.ObjectId(_id) }, { $set: { status: status } }, { new: true }).exec()
    }
}
