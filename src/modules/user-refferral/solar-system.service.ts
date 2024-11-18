import { HttpStatus, Inject, Injectable } from "@nestjs/common"
import { getCurrencyType, HandlerError, initSolarCommission } from "@utils"
import { plainToClass } from "class-transformer"
import { WINSTON_MODULE_PROVIDER } from "nest-winston"
import { Currency } from "src/common"
import { MESSAGE_CODES } from "src/common/constants"
import { Logger } from "winston"
import { BotControllerService } from "../bot-controller/bot-controller.service"
import { CurrencyDto } from "./dtos"
import { UserLevelResponseDto } from "./dtos/solar-system-user-level.dto"
import { UserRefferalRepository } from "./repositories"
import { SolarSystemRepository } from "./repositories/solar-system.repository"
import { CommissionDistribution, SolarSystemConfig, SolarSystemUserLevel } from "./schemas"

@Injectable()
export class SolarSystemService {
    constructor(
        private readonly userRefferalRepository: UserRefferalRepository,
        private readonly solarSystemRepository: SolarSystemRepository,
        private readonly botControllerService: BotControllerService,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
    ) {}

    /**
     * @description It support for user referral module. Get and init user level in solar system
     * @returns class SolarSystemUserLevel array
     */
    async initSolarSystemUserLevel(userId: string): Promise<SolarSystemUserLevel[]> {
        try {
            // TODO: (@hhman24) init if user not in solar system
            const [userLevels, levelConfig] = await Promise.all([this.solarSystemRepository.getAllUserLevel(userId), this.solarSystemRepository.getAllLevelConfig()])

            // create levels only if the user does not already have them
            const newUserLevels = levelConfig
                .filter((l) => !userLevels.some((u) => u.level === l.level)) // filter out levels that user already has
                .map((l) =>
                    this.solarSystemRepository.createUserLevel({
                        userId,
                        level: l.level,
                        accumulatedCommission: initSolarCommission()
                    })
                )

            const res = newUserLevels.length > 0 ? await Promise.all(newUserLevels) : []

            return [...userLevels, ...res]
        } catch (error) {
            throw error
        }
    }

    async getCurrentUserLevel(userId: string): Promise<UserLevelResponseDto[]> {
        try {
            // ISSUE: (@hhman24) option 1: get all user level and create if it not exist
            const userLevel = (await this.initSolarSystemUserLevel(userId)) || []
            // const flatUserLevel = userLevel.map((r) => plainToClass(UserLevelResponseDto, r))

            const res = await Promise.all(
                userLevel.map(async (level) => {
                    const totalFriendsInLevel = await this.userRefferalRepository.countFriendInLevel(userId, level.level - 1)
                    const solarLevel = plainToClass(UserLevelResponseDto, level)
                    return {
                        ...solarLevel,
                        totalInvitedFriendInLevel: totalFriendsInLevel
                    }
                })
            )
            // ISSUE: (@hhman24) option2: get user level

            return res
        } catch (error) {
            throw error
        }
    }

    async claimSolarSystemReward(userId: string, level: number) {
        try {
            const [currentUserLevel, userRef] = await Promise.all([this.solarSystemRepository.getUserLevel(userId, level), this.userRefferalRepository.findUserReferral(userId, 1)])

            if (!currentUserLevel || !userRef) {
                throw new HandlerError(`🚧 user level: ${level} not found or not exist solar level userId ${userId}`, HttpStatus.BAD_REQUEST, MESSAGE_CODES.BAD_REQUEST)
            }

            if (!currentUserLevel._id || !userRef._id) {
                throw new HandlerError(`_id is undefined`)
            }

            // ISSUE: (@hhman24) if currentUserLevel.level - userRef.Level > 2. Should return
            if (!currentUserLevel.isUnLoked) {
                let conditionUnClock = false

                // ISSUE: (@hhman24) call to shop service
                const totalPurchase = 1000 // asummes to test
                const levelConfig = await this.solarSystemRepository.getLevelConfig(currentUserLevel.level)

                // TODO: (@hhman24) check requrie total purchasse of user
                if (levelConfig?.iapRequired && totalPurchase >= levelConfig?.iapRequired) {
                    conditionUnClock = true
                }

                // TODO: (@hhman24) check at least your friend has required level
                if (levelConfig?.friendLevelRequired !== undefined && conditionUnClock) {
                    const totalFriend = await this.userRefferalRepository.countFriendInLevel(userId, levelConfig?.friendLevelRequired, 1)
                    conditionUnClock = !!(levelConfig?.totalFriendRequiredInLevel && totalFriend >= levelConfig?.totalFriendRequiredInLevel)
                }

                if (conditionUnClock) {
                    // NOTE: (@hhman24) is unclock and update user referral if currentUserLevel is next level

                    await this.solarSystemRepository.updateUnClockUserLevel(currentUserLevel._id.toString())

                    if (currentUserLevel.level > userRef.solarLevel) {
                        await this.userRefferalRepository.updateSolarLevelByObjectId(userRef?._id, currentUserLevel.level)
                    }
                } else {
                    return null
                }
            }

            // TODO: (@hhman24) claim check if all accumulatedCommission amounts are zero
            const allAmountsZero = currentUserLevel.accumulatedCommission.every((commission: CurrencyDto) => commission.amount === 0)

            if (allAmountsZero) {
                throw new HandlerError("accumulated commission is be zero to claim reward", HttpStatus.BAD_REQUEST, MESSAGE_CODES.BAD_REQUEST)
            }

            await Promise.all([
                // TODO: (@hhman24) update solar balance of user ref
                this.userRefferalRepository.claimCommision(userRef._id, currentUserLevel.accumulatedCommission),
                // TODO: (@hhman24) seset the accummuldated commission to zero after claim
                this.solarSystemRepository.resetAccummulatedCommision(currentUserLevel._id.toString(), currentUserLevel.accumulatedCommission),

                // TODO: (@hhman24) record claim commissions
                this.solarSystemRepository.createClaimLog({
                    userId: userId,
                    level: currentUserLevel.level,
                    accumulatedCommission: currentUserLevel.accumulatedCommission
                })
            ])

            await this.solarSystemRepository.createClaimLog({
                userId: userId,
                level: currentUserLevel.level,
                accumulatedCommission: currentUserLevel.accumulatedCommission
            })

            // ISSUE: (@hhman24) update user wallet
            return await this.userRefferalRepository.findUserReferral(userRef.userId)
        } catch (error) {
            throw error
        }
    }

    async recordSolarSystemCommission(userId: string, paymentId: string, currency: { type: number; amount: number }) {
        try {
            // TODO: (@hhman24) check user had ref yet
            const userRef = await this.userRefferalRepository.findUserReferral(userId)

            if (!userRef || !userRef._id || userRef.refBy === "") {
                throw new HandlerError("user doesn't not have ref", HttpStatus.NOT_FOUND, MESSAGE_CODES.BAD_REQUEST)
            }

            if (currency.amount <= 0) {
                throw new HandlerError(`currency ${currency.type} amount: ${currency.amount} is invalid`, HttpStatus.BAD_REQUEST, MESSAGE_CODES.BAD_REQUEST)
            }

            const existPaymentLog = await this.solarSystemRepository.findPaymentId(paymentId)

            if (existPaymentLog) {
                throw new HandlerError(`exist payment id: ${paymentId}`, HttpStatus.BAD_REQUEST, MESSAGE_CODES.BAD_REQUEST)
            }

            const [res, levelConfig] = await Promise.all([
                this.userRefferalRepository.calculateUserReferralHierarchy(userId),
                this.solarSystemRepository.getAllLevelConfig() // Cache this if possible
            ])

            const user = res[0]
            const commissionDistribution: CommissionDistribution[] = []
            const listPromises: Promise<any>[] = []

            const levelCommission = levelConfig.map((l: SolarSystemConfig) => (l.benefitPercent ? (l.benefitPercent * currency.amount) / 100 : 0)) // sorted

            const sortedLevel = user.referralHierarchy.sort((a: any, b: any) => a.level - b.level)

            sortedLevel.forEach((level: any) => {
                const commissionAmount = levelCommission[level.level]

                commissionDistribution.push({
                    commissionAmount: { type: Currency.TON, amount: commissionAmount },
                    commisssionLevel: level.level,
                    referrerId: level.userId
                })

                // Push async operations to the promise array for concurrent execution
                listPromises.push(
                    this.solarSystemRepository.increaseAccummulatedCommision(level.userId, level.level + 1, currency.type, commissionAmount),
                    this.botControllerService.postNotificationToTelegramBot({
                        message: `☀️ BONUS $${getCurrencyType(currency.type)} FROM SOLAR SYSTEM!  ☀️\n🙆 You have just accumulated $${getCurrencyType(currency.type)} in the role of ${levelConfig[level.level].levelName} 🙆\n💰 REWARD: ${commissionAmount} $${getCurrencyType(currency.type)} 💰`,
                        userId: level.userId,
                        buttons: 2
                    })
                )
            })

            // TODO: (@hhman24) write log commission
            const log = await this.solarSystemRepository.createCommisionLog({ userId: userId, paymentId: paymentId, commissionDistribution: commissionDistribution })

            // NOTE: (an.hhm) using allSettled to handle partial failures without breaking
            const results = await Promise.allSettled(listPromises)
            const failedPromises = results.filter((result) => result.status === "rejected")

            if (failedPromises.length > 0) {
                failedPromises.forEach((failure) => this.logger.error("⚠️ Failed operation:", failure))
            }

            return log
        } catch (error) {
            throw error
        }
    }
}
