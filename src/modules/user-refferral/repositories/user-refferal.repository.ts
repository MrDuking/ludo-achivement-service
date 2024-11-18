import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model, SortOrder, Types } from "mongoose"
import { CurrencySchema, REWARD_LUTON } from "src/common"
import { UserReferral, UserReferralDateLog, UserReferralDateLogDocument, UserReferralDocument } from "../schemas"

@Injectable()
export class UserRefferalRepository {
    private readonly depthLevel: number = 5

    constructor(
        @InjectModel(UserReferral.name)
        private readonly userRefferalModel: Model<UserReferralDocument>,
        @InjectModel(UserReferralDateLog.name)
        private readonly userReferralDateLogModel: Model<UserReferralDateLogDocument>
    ) {}

    async createUserReferral(data: Partial<UserReferral>) {
        const user = await this.userRefferalModel.findOne({ $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }], userId: data.userId, server: data.server })

        if (!user) return null

        return this.userRefferalModel.create({ ...data })
    }

    async updateRefLogDate(userId: string, date: number, year: number, isTelegramPremiumUser: boolean) {
        return this.userReferralDateLogModel
            .updateOne(
                { $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }], userId: userId, date: date, year: year },
                {
                    userId: userId,
                    date: date,
                    year: year,
                    $inc: {
                        totalFriendInvited: 1,
                        totalLutonEarnedByInvite: REWARD_LUTON.INVITE_FRIEND,
                        ...(isTelegramPremiumUser && { totalPremiumFriendInvited: 1 })
                    }
                },
                { upsert: true }
            )
            .exec()
    }

    async findUserReferral(userId: string, server: number = 1): Promise<UserReferral | null> {
        return this.userRefferalModel.findOne({ $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }], userId: userId, server: server }).lean()
    }

    /**
     * @description return a list referral sorted by totalFriendInvited
     */
    async getListTopUserReferral(page: number = 1, limit: number = 300): Promise<UserReferral[]> {
        const offset = (page - 1) * limit

        const sortOptions: Record<string, SortOrder> = {
            ["totalFriendInvited"]: -1
        }

        return this.userRefferalModel
            .find({ $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }] })
            .skip(offset)
            .limit(limit)
            .sort(sortOptions)
            .lean()
            .exec()
    }

    async countFriendInLevel(refBy: string, level: number, server: number = 1): Promise<number> {
        const filter = {
            refBy: refBy,
            server: server,
            solarLevel: level
        }

        return this.userRefferalModel.countDocuments({ $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }], ...JSON.parse(JSON.stringify(filter)) })
    }

    async findAndUpdateSolarLevel(userId: string, level: number, server?: number) {
        const filter = {
            userId: userId,
            server: server
        }

        return this.userRefferalModel
            .findOneAndUpdate({ $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }], ...JSON.parse(JSON.stringify(filter)) }, { solarLevel: level }, { new: true })
            .exec()
    }

    /**
     * @description update user ref if no exist create new
     */
    async updateUserRefBy(userId: string, name: string, avatar: string, refBy: string, server: number = 1): Promise<UserReferral> {
        const updatedData = {
            name: name,
            avatar: avatar,
            refBy: refBy,
            refTime: new Date()
        }

        return this.userRefferalModel
            .findOneAndUpdate({ $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }], userId: userId, server: server }, updatedData, {
                new: true,
                upsert: true
            })
            .lean()
            .exec()
    }

    async increaseTotalFriendInvited(userId: string, name: string, avatar: string, isTelegramPremiumUser: boolean, server: number = 1): Promise<UserReferral> {
        const updateDate = {
            name: name ?? "",
            avatar: avatar ?? "",
            $inc: {
                totalFriendInvited: 1,
                totalLutonEarnedByInvite: REWARD_LUTON.INVITE_FRIEND,
                ...(isTelegramPremiumUser && { totalPremiumFriendInvited: 1 })
            }
        }

        return this.userRefferalModel
            .findOneAndUpdate({ $or: [{ deletedAt: { $exists: true } }, { deletedAt: null }], userId: userId, server: server }, updateDate, { new: true, upsert: true })
            .lean()
            .exec()
    }

    async updateSolarLevelByObjectId(_id: string, level: number) {
        return this.userRefferalModel
            .updateOne(
                { _id: new Types.ObjectId(_id) },
                {
                    $set: {
                        solarLevel: level
                    }
                }
            )
            .exec()
    }

    async countUserRef() {
        return this.userRefferalModel.countDocuments({ $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }] })
    }

    // ============================== NOTE: (@an.hhm) Solar System ==============================

    async claimCommision(_id: string, commision: CurrencySchema[]) {
        // TODO: (@hhman24) prepare an update object using `$inc` to increase each balance amount
        const balanceUpdates = commision.reduce(
            (acc, commission) => {
                if (commission.amount > 0) {
                    // `solarBalance` array has a structure where `type` is unique for each entry
                    acc[`solarBalance.$[elem${commission.type}].amount`] = commission.amount
                }
                return acc
            },
            {} as Record<string, number>
        )

        return this.userRefferalModel
            .updateOne(
                { _id: new Types.ObjectId(_id) },
                // apply the `$inc` update with arrayFilters to match specific `type` values
                { $inc: balanceUpdates },
                { arrayFilters: commision.map((c) => ({ [`elem${c.type}.type`]: c.type })) }
            )
            .exec()
    }

    async calculateUserReferralHierarchy(userId: string) {
        return this.userRefferalModel
            .aggregate([
                // stage 1: filter users
                {
                    $match: {
                        userId: userId
                    }
                },
                // stage 2: this performs a recursive search to find all user that form a referral chain steaming from refBy
                {
                    $graphLookup: {
                        from: "user_referrals",
                        startWith: "$refBy",
                        // connects the documents by following refBy and refCode fields.
                        connectFromField: "refBy",
                        connectToField: "userId",
                        maxDepth: this.depthLevel,
                        depthField: "level",
                        as: "referralHierarchy"
                    }
                },
                // stage 3:
                {
                    $project: {
                        _id: 0,
                        userId: 1,
                        name: 1,
                        referralHierarchy: {
                            $map: {
                                input: "$referralHierarchy",
                                as: "rh",
                                in: {
                                    userId: "$$rh.userId",
                                    name: "$$rh.name",
                                    avatar: "$$rh.avatar",
                                    refCode: "$$rh.refCode",
                                    refBy: "$$rh.refBy",
                                    refTime: "$$rh.refTime",
                                    server: "$$rh.server",
                                    solarLevel: "$$rh.solarLevel",
                                    solarBalance: "$$rh.solarBalance",
                                    totalLutonEarnedByInvite: "$$rh.totalLutonEarnedByInvite",
                                    totalPremiumFriendInvited: "$$rh.totalPremiumFriendInvited",
                                    totalFriendInvited: "$$rh.totalFriendInvited",
                                    level: "$$rh.level"
                                }
                            }
                        }
                    }
                }
            ])
            .exec()
    }
}
