import { HttpService } from "@nestjs/axios"
import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { HandlerError } from "@utils"
import { plainToClass } from "class-transformer"
import { catchError, firstValueFrom } from "rxjs"
import { LeaderboardSeasonStatus, LeaderboardType } from "src/common"
import { EncryptService } from "../encrypt/encrypt.service"
import { RedisService } from "../redis/redis.service"
import { CreateSeasonDto, LeaderboardSeasonResponse, ReferralCountResponseDto } from "./dtos"
import { LeaderboardSeasonRepository, ReferralCountRepository } from "./repositories"

@Injectable()
export class LeaderboardReferralService {
    private readonly CACHE_KEY = "ludo:auth-service:ref-leaderboard"
    private readonly XXTEA_KEY: string
    private readonly LEADERBOARD_ENDPOINT: string
    private readonly LEADERBOARD_GAME_ID: string

    constructor(
        private readonly encryptService: EncryptService,
        private readonly configService: ConfigService,
        private readonly leaderboardSeasonRepository: LeaderboardSeasonRepository,
        private readonly referralCountRepository: ReferralCountRepository,
        private readonly redisService: RedisService,
        private readonly httpService: HttpService
    ) {
        this.XXTEA_KEY = this.configService.get<string>("XXTEA_KEY") || ""
        this.LEADERBOARD_ENDPOINT = this.configService.get<string>("API_ENDPOINT") || ""
        this.LEADERBOARD_GAME_ID = this.configService.get<string>("LEADERBOARD_GAME_ID") || ""
    }

    async submitTotalFriendInvited(
        userID: string,
        totalFriendInvited: number,
        userData: { name: string; avatar: string; refBy: string; totalFriendInvited: number; totalLutonEarnedByInvite: number }
    ) {
        try {
            const leaderboardId = `${this.LEADERBOARD_GAME_ID}ref:referral`
            const payload = {
                id: leaderboardId,
                score: totalFriendInvited,
                override: true,
                userId: `${userID}`,
                userdata: {
                    userName: userData.name,
                    userId: `${userID}`,
                    metadata: {
                        avatar: userData.avatar,
                        refBy: userData.refBy,
                        totalFriendInvited: userData.totalFriendInvited,
                        totalLutonEarnedByInvite: userData.totalLutonEarnedByInvite
                    }
                }
            }
            const encrypted = this.encryptService.encryptToString(JSON.stringify(payload), this.XXTEA_KEY)
            const requestBody = {
                data: encrypted
            }

            const response = await firstValueFrom(
                this.httpService
                    .post(`${this.LEADERBOARD_ENDPOINT}/leaderboard/report`, requestBody, {
                        headers: { "Content-Type": "application/json" },
                        timeout: 5000 // Optional timeout
                    })
                    .pipe(
                        catchError((error) => {
                            // Customize the error message and rethrow as an HttpException
                            throw new HandlerError(`failed to post to leaderboard: ${error.message}`, error.response?.status || 500)
                        })
                    )
            )

            if (response.status !== 200) {
                throw new HandlerError(`post to leader board fail: ${userID}, ${totalFriendInvited}`)
            }

            return true
        } catch (error) {
            throw error
        }
    }

    async submitUserToReferralLeaderboard(
        userId: string,
        totalFriendInvited: number,
        userData: { name: string; avatar: string; refBy: string; totalFriendInvited: number; totalLutonEarnedByInvite: number }
    ) {
        try {
            // NOTE: (@an.hhm) record to leaderboard in db
            const latestSeason = await this.getLatestSeason()

            if (!latestSeason || latestSeason.status !== LeaderboardSeasonStatus.OPEN) {
                return null
            }

            const [submited] = await Promise.all([
                this.submitTotalFriendInvited(userId, totalFriendInvited, userData),
                this.referralCountRepository.increaseUserReferralCountAllTime(userId, latestSeason.season)
            ])

            return {
                success: submited,
                results: {
                    submited: submited
                }
            }
        } catch (error) {
            throw error
        }
    }

    async getLatestSeason(): Promise<LeaderboardSeasonResponse | null> {
        try {
            // Đọc từ cache trước
            const cacheData = await this.redisService.get<LeaderboardSeasonResponse>(`${this.CACHE_KEY}:latest`)
            if (cacheData) return cacheData

            const res = await this.leaderboardSeasonRepository.getLastestReferralSeason()

            if (!res) return null

            const value = plainToClass(LeaderboardSeasonResponse, res)

            await this.redisService.set(`${this.CACHE_KEY}:latest`, value, { ttl: 10 * 60 })
            return value
        } catch (error) {
            throw error
        }
    }

    async checkAndCreateNewReferralSeason() {
        try {
            const openSeason = await this.leaderboardSeasonRepository.findOpenReferralSeason()

            if (!openSeason?._id) {
                throw new HandlerError(`open season does not exist _id`)
            }

            if (openSeason && openSeason.endTime < Date.now()) {
                // NOTE: (@an.hhm) end season now.
                const latestSeason = await this.leaderboardSeasonRepository.findOneAndUpdateReferralSeasonStatus(openSeason._id, LeaderboardSeasonStatus.END)

                // NOTE: (@an.hhm) create new season
                const newSeasonNumber = latestSeason ? latestSeason.season + 1 : 1
                const newStartTime = openSeason.endTime
                const newEndTime = newStartTime + 30 * 24 * 60 * 60 * 1000 // 30 date

                const createSeasonDto: CreateSeasonDto = {
                    season: newSeasonNumber,
                    startTime: newStartTime,
                    endTime: newEndTime,
                    type: LeaderboardType.REFERRAL,
                    poolReward: openSeason.poolReward,
                    rewardDistribution: openSeason.rewardDistribution,
                    status: LeaderboardSeasonStatus.OPEN
                }

                const res = await this.leaderboardSeasonRepository.createNewSeason(createSeasonDto)
                const value = plainToClass(LeaderboardSeasonResponse, res)

                // NOTE: (an.hhm) set new leaderboard in cache
                await this.redisService.set(`${this.CACHE_KEY}:latest`, value, { ttl: 10 * 60 })
            }
        } catch (error) {
            throw error
        }
    }

    async getListUserRefPreviousSeasonRank(userId: string, season: number, page: number, limit: number) {
        try {
            const cacheKey = `${this.CACHE_KEY}:prev-season-${season}:page-${page}:limit-${limit}`
            const cacheData = await this.redisService.get<LeaderboardSeasonResponse>(cacheKey)

            if (cacheData) {
                const userRank = await this.referralCountRepository.getUserRefPreviousSeasonRank(season, userId)

                return { cacheData, player: plainToClass(ReferralCountResponseDto, userRank) }
            }

            const refSeason = await this.leaderboardSeasonRepository.getPreviousReferralSeason(season)

            if (!refSeason) return null

            const [users, total, player] = await Promise.all([
                this.referralCountRepository.getListUserRefPreviousSeasonRank(season, page, limit),
                this.referralCountRepository.countUserRefPreviousSeasonRank(season),
                this.referralCountRepository.getUserRefPreviousSeasonRank(season, userId)
            ])

            const result = {
                userRanking: {
                    users: users.map((r) => plainToClass(ReferralCountResponseDto, r)),
                    total: total,
                    page: page,
                    pages: Math.ceil(total / limit)
                },
                player: plainToClass(ReferralCountResponseDto, player),
                season: plainToClass(LeaderboardSeasonResponse, refSeason)
            }

            await this.redisService.set(cacheKey, result, { ttl: 10 * 60 })

            return result
        } catch (error) {}
    }
}
