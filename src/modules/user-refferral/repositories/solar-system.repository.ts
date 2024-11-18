import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model, Types } from "mongoose"
import { CurrencySchema, SolarSystemConfigType } from "src/common"
import {
    SolarSystemClaimLog,
    SolarSystemClaimLogDocument,
    SolarSystemCommissionLog,
    SolarSystemCommissionLogDocument,
    SolarSystemUserLevel,
    SolarSystemUserLevelDocument
} from "../schemas"
import { SolarSystemConfig, SolarSystemConfigDocument } from "../schemas/solar-system-config.schema"
import { SolarSystemWithdrawLog, SolarSystemWithdrawLogDocument } from "../schemas/solar-system-withdraw-log.schema"

@Injectable()
export class SolarSystemRepository {
    constructor(
        @InjectModel(SolarSystemUserLevel.name)
        private readonly userLevelModel: Model<SolarSystemUserLevelDocument>,

        @InjectModel(SolarSystemConfig.name)
        private readonly configModel: Model<SolarSystemConfigDocument>,

        @InjectModel(SolarSystemCommissionLog.name)
        private readonly commissionLogModel: Model<SolarSystemCommissionLogDocument>,

        @InjectModel(SolarSystemClaimLog.name)
        private readonly claimLogModel: Model<SolarSystemClaimLogDocument>,

        @InjectModel(SolarSystemWithdrawLog.name)
        private readonly solarWithdrawLogModel: Model<SolarSystemWithdrawLogDocument>
    ) {}

    async createClaimLog(body: SolarSystemClaimLog) {
        return this.claimLogModel.create({ ...body })
    }

    async getAllLevelConfig(): Promise<SolarSystemConfig[]> {
        return this.configModel.find({ type: SolarSystemConfigType.LEVEL }).sort({ level: 1 }).lean()
    }

    async getLevelConfig(level: number): Promise<SolarSystemConfig | null> {
        return this.configModel.findOne({ type: SolarSystemConfigType.LEVEL, level: level }).lean()
    }

    async createUserLevel(body: Partial<SolarSystemUserLevel>) {
        return this.userLevelModel.create({ ...body })
    }

    async getAllUserLevel(userId: string): Promise<SolarSystemUserLevel[]> {
        return this.userLevelModel.find({ $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }], userId: userId }).lean()
    }

    async getUserLevel(userId: string, level: number): Promise<SolarSystemUserLevel | null> {
        return this.userLevelModel.findOne({ $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }], userId: userId, level: level }).lean()
    }

    async findAndUpdateUnClockUserLevel(userId: string, level: number) {
        return this.userLevelModel.findOneAndUpdate(
            { $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }], userId: userId, level: level },
            { isUnLoked: true, unLokedDate: new Date() },
            { new: true }
        )
    }

    async updateUnClockUserLevel(_id: string) {
        return this.userLevelModel.updateOne({ _id: new Types.ObjectId(_id) }, { isUnLoked: true, unLokedDate: new Date() })
    }

    async resetAccummulatedCommision(_id: string, commision: CurrencySchema[]) {
        // TODO: (@hhman24) prepare an update object using `$inc` to increase each balance amount
        const balanceUpdates = commision.reduce(
            (acc, commission) => {
                if (commission.amount > 0) {
                    // `solarBalance` array has a structure where `type` is unique for each entry
                    acc[`accumulatedCommission.$[elem${commission.type}].amount`] = -commission.amount
                }
                return acc
            },
            {} as Record<string, number>
        )

        return this.userLevelModel.updateOne(
            { _id: new Types.ObjectId(_id) },
            // apply the `$inc` update with arrayFilters to match specific `type` values
            { $inc: balanceUpdates },
            { arrayFilters: commision.map((c) => ({ [`elem${c.type}.type`]: c.type })) }
        )
    }

    async increaseAccummulatedCommision(userId: string, level: number, currencyType: number, amount: number) {
        const result = await this.userLevelModel.updateOne(
            {
                $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
                userId,
                level
            },
            {
                $inc: { "accumulatedCommission.$[currency].amount": amount }
            },
            {
                arrayFilters: [{ "currency.type": currencyType }]
            }
        )

        // if no entry was modified, it means the currency type didn't exist in accumulatedCommission
        if (result.modifiedCount === 0) {
            // add a new entry for the specified currency type and amount
            return this.userLevelModel.updateOne(
                {
                    $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
                    userId,
                    level
                },
                {
                    $push: { accumulatedCommission: { type: currencyType, amount } }
                },
                { upsert: true }
            )
        }

        return result
    }

    async createCommisionLog(body: SolarSystemCommissionLog): Promise<SolarSystemCommissionLog> {
        return this.commissionLogModel.create({ ...body })
    }

    async findPaymentId(paymentId: string): Promise<SolarSystemCommissionLog | null> {
        return this.commissionLogModel.findOne({ paymentId: paymentId }).lean()
    }
}
