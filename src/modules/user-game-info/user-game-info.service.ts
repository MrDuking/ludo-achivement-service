import { status } from "@grpc/grpc-js"
import { Injectable } from "@nestjs/common"
import { HandlerError } from "@utils"
import { MESSAGE_CODES, ResponseType } from "src/common"
import { IncrementUserGameInfoDto, QuestPointDto, UpdateReferralPointResponse, UpdateUserGameInfoDto } from "./dtos"
import { UserGameInfoRepository } from "./repositories"
import { UserGameInfo } from "./schemas"

@Injectable()
export class UserGameInfoService {
    constructor(private readonly userGameInfoRepository: UserGameInfoRepository) {}

    async initializeUserGameInfo(userId: string): Promise<UserGameInfo> {
        return this.userGameInfoRepository.initializeUserGameInfo(userId)
    }

    async updateUserGameInfo(userId: string, updateData: UpdateUserGameInfoDto): Promise<UserGameInfo | null> {
        // ISSUE: (@hhman24) do not update user inventory
        return this.userGameInfoRepository.updateUserGameInfo(userId, updateData)
    }

    async getUserGameInfo(userId: string) {
        return this.userGameInfoRepository.getUserGameInfo(userId)
    }

    async getUserGameInfoForGameClient(userId: string): Promise<UserGameInfo> {
        let gameInfo = await this.userGameInfoRepository.getUserGameInfo(userId)
        if (!gameInfo) {
            gameInfo = await this.initializeUserGameInfo(userId)
        }
        return gameInfo
    }

    async incrementUserGameInfoV2(userId: string, incrementData: IncrementUserGameInfoDto): Promise<UserGameInfo | null> {
        const updatedGameInfo = await this.userGameInfoRepository.incrementUserGameInfo(userId, incrementData)

        if (!updatedGameInfo) {
            throw new HandlerError("Cannot increment user game info")
        }

        return updatedGameInfo
    }

    async increaseQuestPointGrpc(userId: string): Promise<ResponseType<QuestPointDto | null>> {
        try {
            const info = await this.userGameInfoRepository.updateQuestPoint(userId)

            return {
                statusCode: info ? status.OK : status.INVALID_ARGUMENT,
                code: info ? MESSAGE_CODES.SUCCESS : MESSAGE_CODES.BAD_REQUEST,
                data: info ? { totalQuestPointEarned: info.totalQuestPointEarned, userId: info.userId } : null
            }
        } catch (error) {
            throw error
        }
    }

    /**
     * @description increase point for referral with total luton earned by invite, total luton earned, and total friend invited.
     * */
    async updateTotalReferralPointGrpc(userId: string): Promise<ResponseType<UpdateReferralPointResponse | null>> {
        try {
            const info = await this.userGameInfoRepository.updateReferralPoint(userId, 5)

            return {
                statusCode: info ? status.OK : status.INVALID_ARGUMENT,
                code: info ? MESSAGE_CODES.SUCCESS : MESSAGE_CODES.BAD_REQUEST,
                data: info
                    ? {
                          userId: info.userId,
                          totalFriendInvited: info.totalFriendInvited,
                          totalLutonEarnedByInvite: info.totalLutonEarnedByInvite
                      }
                    : null
            }
        } catch (error) {
            throw error
        }
    }
}
