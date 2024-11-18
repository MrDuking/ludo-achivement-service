import { HttpException, HttpStatus, Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { daysIntoYear, HandlerError } from "@utils"
import { plainToClass } from "class-transformer"
import { Model } from "mongoose"
import { AchievementType, Currency, ResponseType } from "src/common"
import { MESSAGE_CODES, REWARD_LUTON } from "src/common/constants"
import { AchievementService } from "../achievement/achievement.service"
import { LeaderboardReferralService } from "../leaderboard/leaderboard-referral.service"
import { RedisService } from "../redis/redis.service"
import { UserInventoryService } from "../user-inventory/user-inventory.service"
import { UserService } from "../user/user.service"
import { CreateUserReferralRequestDto, GetReferralsResponseDto, UserReferralDto } from "./dtos"
import { UserRefferalRepository } from "./repositories"
import { UserReferral } from "./schemas"

@Injectable()
export class UserReferralService {
    constructor(
        @InjectModel(UserReferral.name) private userReferralModel: Model<UserReferral>,
        private readonly userRefferalRepository: UserRefferalRepository,
        private readonly userInventoryService: UserInventoryService,
        private readonly leaderBoardReferralService: LeaderboardReferralService,
        private readonly userService: UserService,
        private readonly achievementService: AchievementService,
        private readonly redisService: RedisService
    ) {}

    async getReferrals(
        filter: {
            refBy?: string
            server?: number
            refTime?: { start?: Date; end?: Date }
        } = {},
        page: number = 1,
        limit: number = 10
    ): Promise<{
        referrals: UserReferralDto[]
        total: number
        page: number
        pages: number
    }> {
        const skip = (page - 1) * limit

        const query: any = {}

        if (filter.refBy) {
            query.refBy = { $regex: filter.refBy, $options: "i" }
        }
        if (filter.server !== undefined) {
            query.server = filter.server
        }
        if (filter.refTime) {
            query.refTime = {}
            if (filter.refTime.start) {
                query.refTime.$gte = filter.refTime.start
            }
            if (filter.refTime.end) {
                query.refTime.$lte = filter.refTime.end
            }
        }

        const [referrals, total] = await Promise.all([
            this.userReferralModel.find(query).skip(skip).limit(limit).sort({ refTime: -1 }).lean(),
            this.userReferralModel.countDocuments(query)
        ])

        const pages = Math.ceil(total / limit)

        return {
            referrals: referrals.map((r) => plainToClass(UserReferralDto, r)),
            total,
            page,
            pages
        }
    }

    async createReferral(referralData: CreateUserReferralRequestDto) {
        try {
            const newReferral = new this.userReferralModel(referralData)

            return {
                code: MESSAGE_CODES.SUCCESS,
                data: await newReferral.save()
            }
        } catch (error) {
            if (error.code === 11000) {
                // MongoDB duplicate key error code
                throw new HttpException("This user-referrer pair already exists for the given server", HttpStatus.BAD_REQUEST, {
                    cause: {
                        code: MESSAGE_CODES.DUPLICATE_USER_REFERRAL
                    }
                })
            }
            throw new HttpException("internal server error", HttpStatus.INTERNAL_SERVER_ERROR, {
                cause: {
                    code: MESSAGE_CODES.INTERNAL_SERVER_ERROR,
                    message: error
                }
            })
        }
    }

    async getUserRef(userId: string, server?: number): Promise<ResponseType<UserReferralDto | null>> {
        const userReferral = await this.userRefferalRepository.findUserReferral(userId, server)

        return {
            code: MESSAGE_CODES.SUCCESS,
            data: userReferral ? plainToClass(UserReferralDto, userReferral) : null
        }
    }

    async updateUserRefBy(userId: string, name: string, avatar: string, refBy: string, isTelegramPremiumUser: boolean, server: number = 1) {
        try {
            // TODO: (@hhman24) check refBy and userId is exist in data
            const userRef = await this.userService.findUser(refBy)

            if (!userRef) {
                throw new HandlerError(`user refBy is empty or user not found --- ${refBy}`, HttpStatus.BAD_REQUEST, MESSAGE_CODES.BAD_REQUEST)
            }

            const existUserReferral = await this.userRefferalRepository.findUserReferral(userId)

            if (existUserReferral?.refBy === refBy || existUserReferral?.refBy === userId) {
                throw new HandlerError(`user ${userId} was ref by ${refBy}`, HttpStatus.BAD_REQUEST, MESSAGE_CODES.BAD_REQUEST)
            }

            // create new user referral for userId
            const [userRefInfo, userInfo] = await Promise.all([
                this.userRefferalRepository.increaseTotalFriendInvited(userRef.id, userRef.name, userRef.avatar, isTelegramPremiumUser),
                this.userRefferalRepository.updateUserRefBy(userId, name, avatar, userRef.id, server)
            ])

            const listPromises = []
            // TODO: (@hhman24) caching ref user and do achievement
            const archievmentType = isTelegramPremiumUser ? AchievementType.INVITE_PREMIUM_USER : AchievementType.INVITE_FRIENDS
            listPromises.push(this.achievementService.recordAchievement(userRef.id, archievmentType, 1))

            // TODO: (@hhman24) update user inventory
            listPromises.push(this.userInventoryService.addMoney(userRef.id, Currency.LUTON, REWARD_LUTON.INVITE_FRIEND))

            // TODO: (@an.hhm) create ref log date
            const currentDate = new Date()
            const year = currentDate.getUTCFullYear()
            const dayOfYear = daysIntoYear(currentDate)

            listPromises.push(this.userRefferalRepository.updateRefLogDate(userRef.id, dayOfYear, year, isTelegramPremiumUser))

            // TODO: summit user info to leaderboard
            listPromises.push(
                this.leaderBoardReferralService.submitUserToReferralLeaderboard(userRef.id, userRefInfo.totalFriendInvited, {
                    name: userRef.name,
                    avatar: userRef.avatar,
                    refBy: userRefInfo.refBy,
                    totalFriendInvited: userRefInfo.totalFriendInvited,
                    totalLutonEarnedByInvite: userRefInfo.totalLutonEarnedByInvite
                })
            )

            await Promise.all(listPromises)

            return plainToClass(UserReferralDto, userInfo)
        } catch (error) {
            throw error
        }
    }

    /**
     * @param page
     * @param limit
     * @description get top ref follow total friend invited
     */
    async getTopRef(limit: number, page: number = 1) {
        try {
            const cacheKey = `ludo:auth-service:referral:top-ref:page${page}:limit${limit}`

            const cacheData = await this.redisService.get<GetReferralsResponseDto>(cacheKey)

            if (cacheData) return cacheData

            const [listUserRef, total] = await Promise.all([
                await this.userRefferalRepository.getListTopUserReferral(page, limit),
                await this.userRefferalRepository.countUserRef()
            ])

            const value = {
                referrals: listUserRef.map((l) => plainToClass(UserReferralDto, l)),
                total: total,
                page: 1,
                pages: Math.ceil(total / limit)
            }

            // Note: (@an.hhm) cache for 15 minutes
            await this.redisService.set(cacheKey, value, { ttl: 15 * 60 })

            return value
        } catch (error) {
            throw error
        }
    }
}
