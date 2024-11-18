import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { ReferralCount, ReferralCountDocument } from "../schemas"

@Injectable()
export class ReferralCountRepository {
    constructor(@InjectModel(ReferralCount.name) private readonly referralCountModel: Model<ReferralCountDocument>) {}

    async increaseUserReferralCountAllTime(userId: string, seasonId: number) {
        return this.referralCountModel
            .updateOne(
                { $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }], seasonId: seasonId, userId: userId },
                {
                    $inc: {
                        invitedCount: 1
                    }
                },
                { upsert: true }
            )
            .exec()
    }

    async getListUserRefPreviousSeasonRank(seasonId: number, page: number = 1, limit: number = 300): Promise<ReferralCount[]> {
        const offset = (page - 1) * limit

        return this.referralCountModel
            .find({ $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }], seasonId: seasonId })
            .skip(offset)
            .limit(limit)
            .sort({ invitedCount: -1 })
            .lean()
            .exec()
    }

    async countUserRefPreviousSeasonRank(seasonId: number): Promise<number> {
        return this.referralCountModel
            .countDocuments({ $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }], seasonId: seasonId })
            .lean()
            .exec()
    }

    async getUserRefPreviousSeasonRank(seasonId: number, userId: string): Promise<ReferralCount | null> {
        return this.referralCountModel
            .findOne({ $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }], seasonId: seasonId, userId: userId })
            .lean()
            .exec()
    }
}
