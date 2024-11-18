import { status } from "@grpc/grpc-js"
import { HttpStatus, Injectable } from "@nestjs/common"
import { RpcException } from "@nestjs/microservices"
import { HandlerError } from "@utils"
import { plainToClass } from "class-transformer"
import { InGameCurrency, MESSAGE_CODES, PageMetaDto, ResponseType } from "src/common"
import { isDifferentDate } from "src/utils/utils"
import { AchievementService } from "../achievement/achievement.service"
import { LeaderboardQuestService } from "../leaderboard/leaderboard-quest.service"
import { LeaderboardReferralService } from "../leaderboard/leaderboard-referral.service"
import { LeaderboardService } from "../leaderboard/leaderboard.service"
import { UserGameInfoService } from "../user-game-info/user-game-info.service"
import { UserInventoryService } from "../user-inventory/user-inventory.service"
import { GetReferralQuery, IncrementUserGameInfoDto } from "./dtos"
import { GetReferralPagingResponse, GetReferralResponse } from "./dtos/referral-response.dto"
import { UserRepository } from "./repositories"
import { User } from "./schemas/user.schema"

@Injectable()
export class UserService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly userGameInfoService: UserGameInfoService,
        private readonly userInventoryService: UserInventoryService,
        private readonly leaderBoardReferralService: LeaderboardReferralService,
        private readonly leaderBoardQuestService: LeaderboardQuestService,
        private readonly leaderBoardService: LeaderboardService,
        private readonly achievementService: AchievementService
    ) {}

    async findUser(id: string): Promise<User | null> {
        const user = await this.userRepository.findOneById(id)
        return user
    }

    async findUserWithInventory(id: string) {
        const user = await this.userRepository.findOneById(id)

        if (!user) return null

        const inventories = await this.userInventoryService.findUserInventoryAndItemByUserId(id)
        const gameInfo = await this.userGameInfoService.getUserGameInfo(id)

        return {
            ...user,
            inventories: inventories.userInventories,
            items: inventories.userItems,
            gameInfo
        }
    }

    async findAll(query: any, page: number, take: number): Promise<{ users: any; total: number; page: number; pages: number }> {
        const skip = (page - 1) * take

        try {
            const [users, total] = await Promise.all([this.userRepository.findAllPaginated(query, skip, take), this.userRepository.countUsers(query)])
            const pages = Math.ceil(total / take)
            const usersWithInventory = await Promise.all(
                users.map(async (user) => {
                    const inventories = await this.userInventoryService.findUserInventoryByUserId(user.id)
                    return {
                        ...user,
                        inventories
                    }
                })
            )
            // console.log({ users: usersWithInventory, total, page, pages })
            return { users: usersWithInventory, total, page, pages }
        } catch (error) {
            throw new RpcException(`Failed to get users: ${error.message}`)
        }
    }

    async initializeUser(userData: User): Promise<User> {
        const user: User = {
            id: userData.id,
            email: "",
            name: userData.name,
            lastLoginDate: new Date().toString(),
            refCode: userData.refCode ? userData.refCode : "test",
            refCodeUpdateTime: new Date().toString(),
            sessionId: userData.sessionId || "",
            countryCode: "",
            lastLoginIP: "",
            createdAt: new Date(),
            avatar: userData.avatar !== "" ? userData.avatar : "",
            avatarUpdateTime: "",
            walletAddress: "",
            isTelegramPremiumUser: userData.isTelegramPremiumUser || false,
            playTime: 0
        }

        const [profile] = await Promise.all([
            this.userRepository.createNewUser(user),
            this.userGameInfoService.initializeUserGameInfo(userData.id),
            this.userInventoryService.findUserInventoryAndItemByUserId(userData.id)
        ])

        return profile
    }

    async updateUserLogin(user: User, userData: User): Promise<User> {
        const cmdUpdate = {
            lastLoginDate: new Date().toString(),
            name: userData.name,
            isTelegramPremiumUser: userData.isTelegramPremiumUser,
            sessionId: userData.sessionId
        }

        if (user.lastLoginDate == null || isDifferentDate(new Date(user.lastLoginDate), new Date())) {
            console.log("Login new date!")
        }

        return this.userRepository.findOneAndUpdate(user.id, cmdUpdate, { new: true }) as Promise<User>
    }

    async findAllUserId() {
        try {
            const users = await this.userRepository.findAll()

            const ids = users.map((u) => u.id)

            return {
                data: ids
            }
        } catch (error) {
            throw error
        }
    }

    async updateUserPrenium(userId: string, isPrenium: boolean): Promise<ResponseType<User | null>> {
        try {
            const res = await this.userRepository.updateUserPrenium(userId, isPrenium)
            return {
                statusCode: status.OK,
                code: MESSAGE_CODES.SUCCESS,
                data: res
            }
        } catch (error) {
            throw error
        }
    }

    async updateUserAvatar(userId: string, avatar: string): Promise<ResponseType<User | null>> {
        try {
            const res = await this.userRepository.updateUserAvatar(userId, avatar)
            return {
                statusCode: status.OK,
                code: MESSAGE_CODES.SUCCESS,
                data: res
            }
        } catch (error) {
            throw error
        }
    }

    async findUserByRefCode(refCode: string): Promise<ResponseType<User | null>> {
        try {
            const user = await this.userRepository.findUserByRefCode(refCode)
            // ISSUE: (@hhman24) check user ban

            return {
                statusCode: status.OK,
                code: MESSAGE_CODES.SUCCESS,
                data: user ? user : null
            }
        } catch (error) {
            throw error
        }
    }

    async increaseQuestPointGrpc(userId: string) {
        try {
            const user = await this.findUser(userId)
            const res = (await this.userGameInfoService.increaseQuestPointGrpc(userId)).data
            if (!user || !res) throw new HandlerError("user not found")

            await this.leaderBoardQuestService.submitUserAllLeaderboard(user?.id, res?.totalQuestPointEarned, {
                name: user?.name,
                avatar: user?.avatar,
                totalQuestPointEarned: res?.totalQuestPointEarned
            })

            return {
                statusCode: status.OK,
                code: MESSAGE_CODES.SUCCESS,
                data: res ? res : null
            }
        } catch (error) {
            throw error
        }
    }

    async updateUserWalletAddress(userId: string, walletAddress: string) {
        try {
            const res = await this.userRepository.updateUserWalletAddress(userId, walletAddress)
            return {
                statusCode: status.OK,
                code: MESSAGE_CODES.SUCCESS,
                data: res
            }
        } catch (error) {
            throw error
        }
    }

    async updateRegisterPaymentStatus(userId: string, isRegisteredPayment: boolean = true) {
        return this.userRepository.updateRegisterPaymentStatus(userId, isRegisteredPayment)
    }

    async getUserReferrals(userId: string, query: GetReferralQuery): Promise<ResponseType<GetReferralPagingResponse<GetReferralResponse>>> {
        try {
            const { page, take, sort, sortDirection, refStartDate, refEndDate } = query
            const filter: any = {
                refBy: userId,
                sort: sort,
                sortDirection: sortDirection
            }

            if (refStartDate || refEndDate) {
                filter.refTime = {}
                if (refStartDate) filter.refTime.start = refStartDate
                if (refEndDate) filter.refTime.end = refEndDate
            }

            const res = await this.userRepository.findAllUserReferral(filter, page, take)
            const userInfo = await this.userGameInfoService.getUserGameInfo(userId)

            const pagingMeta = new PageMetaDto({ pageOptionsDto: { page, sort, sortDirection, take }, itemCount: res.total })

            return {
                statusCode: HttpStatus.OK,
                code: MESSAGE_CODES.SUCCESS,
                data: {
                    items: res.items.map((r) => plainToClass(GetReferralResponse, r)),
                    totalLutonEarnedByInvite: userInfo?.totalLutonEarnedByInvite || 0,
                    totalFriendInvited: userInfo?.totalFriendInvited || 0,
                    meta: pagingMeta
                }
            }
        } catch (error) {
            throw error
        }
    }

    async incrementUserGameInfo(userId: string, incrementData: IncrementUserGameInfoDto) {
        try {
            const user = await this.findUser(userId)
            if (!user) return null
            const updatedGameInfo = await this.userGameInfoService.incrementUserGameInfoV2(userId, incrementData)

            if (!updatedGameInfo) {
                throw new HandlerError("Cannot increment user game info")
            }

            // Check if updatedGameInfo is not null before proceeding
            if (updatedGameInfo) {
                // check if coin earn
                if (incrementData.currency === InGameCurrency.COIN && incrementData.earnAmount && incrementData.earnAmount > 0) {
                    const userData = await this.findUser(userId)
                    if (userData) {
                        const userInfo = {
                            name: userData.name,
                            avatar: userData.avatar
                        }
                        await this.leaderBoardService.submitUserAllLeaderboards(userId, updatedGameInfo.totalCoinEarned, userInfo)
                    }
                }
            }
        } catch (error) {
            throw error
        }
    }
}
