import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { GameNumberPlayer, GameType, InGameCurrency } from "src/common"
import { IncrementUserGameInfoDto } from "../dtos"
import { UserGameInfo } from "../schemas"

@Injectable()
export class UserGameInfoRepository {
    constructor(
        @InjectModel(UserGameInfo.name)
        private readonly userGameInfoModel: Model<UserGameInfo>
    ) {}

    async initializeUserGameInfo(userId: string): Promise<UserGameInfo> {
        const newUserGameInfo = new this.userGameInfoModel({ userId })
        return newUserGameInfo.save()
    }

    async updateUserGameInfo(userId: string, updateData: Partial<UserGameInfo>): Promise<UserGameInfo | null> {
        return this.userGameInfoModel.findOneAndUpdate({ userId }, updateData, { new: true }).exec()
    }

    async getUserGameInfo(userId: string): Promise<UserGameInfo | null> {
        return this.userGameInfoModel.findOne({ userId }).exec()
    }

    async incrementUserGameInfo(userId: string, incrementData: IncrementUserGameInfoDto): Promise<UserGameInfo | null> {
        const update: { $inc: { [key: string]: number } } = { $inc: {} }

        const currencyFieldMapping: { [key in InGameCurrency]: { earn: string; spend: string } } = {
            [InGameCurrency.COIN]: { earn: "totalCoinEarned", spend: "totalCoinSpend" },
            [InGameCurrency.DIAMOND]: { earn: "totalDiamondEarned", spend: "totalDiamondSpend" },
            [InGameCurrency.LUDOTON]: { earn: "totalLutonEarned", spend: "totalLutonSpend" }
        }

        // Process currency transactions
        if (incrementData.currency !== undefined) {
            const fields = currencyFieldMapping[incrementData.currency]
            if (fields) {
                if (incrementData.earnAmount) {
                    update.$inc[fields.earn] = incrementData.earnAmount
                }
                if (incrementData.spendAmount) {
                    update.$inc[fields.spend] = incrementData.spendAmount
                }
            }
        }

        // Process game-related fields
        if (incrementData.gameType !== undefined && incrementData.gameNumberPlayer !== undefined) {
            const gameTypeField =
                incrementData.gameType === GameType.CLASSIC ? "totalClassicModeWins" : incrementData.gameType === GameType.RUSH ? "totalRushModeWins" : "totalBlitzModeWins"

            const playerCountField = incrementData.gameNumberPlayer === GameNumberPlayer.TWOPLAYER ? "totalTwoPlayerWins" : "totalFourPlayerWins"

            if (incrementData.matchWon) {
                update.$inc[gameTypeField] = incrementData.matchWon
                update.$inc[playerCountField] = incrementData.matchWon
            }
        }

        // Process other fields
        const otherFieldsMapping: { [key: string]: string } = {
            pawnsCaptured: "totalPawnCaptured",
            questPointEarned: "totalQuestPointEarned",
            friendInvited: "totalFriendInvited",
            adsWatched: "totalAdsWatched"
        }

        Object.entries(incrementData).forEach(([key, value]) => {
            if (typeof value === "number" && otherFieldsMapping[key]) {
                update.$inc[otherFieldsMapping[key]] = value
            }
        })

        // Add totalMatchPlayed increment
        update.$inc.totalMatchPlayed = 1

        const options = { new: true }
        return this.userGameInfoModel.findOneAndUpdate({ userId }, update, options).exec()
    }

    async updateQuestPoint(userId: string) {
        return await this.userGameInfoModel.findOneAndUpdate({ userId: userId }, { $inc: { totalQuestPointEarned: 1 } }, { new: true, upsert: true }).lean()
    }

    async updateReferralPoint(userId: string, ludoTonAmount: number): Promise<UserGameInfo | null> {
        return await this.userGameInfoModel
            .findOneAndUpdate(
                { userId: userId },
                { $inc: { totalLutonEarnedByInvite: ludoTonAmount, totalLutonEarned: ludoTonAmount, totalFriendInvited: 1 } },
                { new: true, upsert: true }
            )
            .lean()
    }
}
