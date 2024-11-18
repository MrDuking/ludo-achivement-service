import { status } from "@grpc/grpc-js"
import { HttpService } from "@nestjs/axios"
import { Inject, Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { AxiosError } from "axios"
import { WINSTON_MODULE_PROVIDER } from "nest-winston"
import { catchError, firstValueFrom } from "rxjs"
import { MESSAGE_CODES, ResponseType, REWARD_LUTON } from "src/common"
import { Logger } from "winston"
import { BotControllerService } from "../bot-controller/bot-controller.service"
import { FirebaseService } from "../firebase/firebase.service"
import { UserReferralService } from "../user-refferral/user-referral.service"
import { User } from "../user/schemas/user.schema"
import { UserService } from "../user/user.service"
import { AuthRepository } from "./auth.repository"
import { LoginRequestDto } from "./dtos"
import { ParsedUser } from "./dtos/parsed-user"
@Injectable()
export class AuthService {
    constructor(
        private authRepository: AuthRepository,
        private readonly httpService: HttpService,
        private userSerivce: UserService,
        private readonly configService: ConfigService,
        private readonly firebaseService: FirebaseService,
        private readonly userReferralService: UserReferralService,
        private readonly botControllerService: BotControllerService,

        @Inject(WINSTON_MODULE_PROVIDER)
        private readonly logger: Logger
    ) {}

    async logIn(user: ParsedUser, request: LoginRequestDto): Promise<{ data: User; code: string }> {
        const userData: any = {
            ...user
        }
        userData.isTelegramPremiumUser = request.is_premium as boolean
        userData.id = user?.id.toString() || ""
        userData.name = user?.firstName || ""
        userData.refCode = user?.id.toString() || "" // FIX: (@hhman24) update refCode for user

        if (user?.lastName) {
            userData.name = `${user.firstName} ${user.lastName}`
        }

        const findUser = await this.authRepository.login(userData as User)

        try {
            // NOTE: (@an.hhm) if refBy call user ref service to update
            if (request.refBy) {
                await this.userReferralService.updateUserRefBy(findUser.id, findUser.name, findUser.avatar, request.refBy, request.is_premium)

                await this.botControllerService.postNotificationToTelegramBot({
                    message: `You have invited ${findUser.name} to join LudoTon\nReferral Reward ${REWARD_LUTON.INVITE_FRIEND}! Keep it up!`,
                    userId: request.refBy,
                    buttons: 2
                })
            }
        } catch (error) {
            this.logger.error(`🚨🚢📢 Function Exception: [Error: ${error.message}] [Stack: ${error.stack}]`)
        }

        try {
            await this.firebaseService.setUserSessionId(findUser.id, `${findUser.id}-${Date.now()}`)
            //register user with ludo crypto service
            if (!findUser.isRegisteredPayment) {
                await this.registerPayment(findUser.id)
                await this.userSerivce.updateRegisterPaymentStatus(findUser.id, true)
            }
        } catch (error) {
            this.logger.error(`🚨🚢📢 Function Exception: [Error: ${error.message}] [Stack: ${error.stack}]`)
        }

        return { data: findUser, code: MESSAGE_CODES.SUCCESS }
    }

    async logInGrpc(user: User): Promise<ResponseType<User>> {
        try {
            const findUser = await this.authRepository.login(user)

            try {
                if (user.sessionId) {
                    await this.firebaseService.setUserSessionId(findUser.id, user.sessionId)
                }
                //register user with ludo crypto service
                if (!findUser.isRegisteredPayment) {
                    await this.registerPayment(findUser.id)
                    await this.userSerivce.updateRegisterPaymentStatus(findUser.id, true)
                }
            } catch (error) {
                this.logger.error(`🚨🚢📢 Function Exception: [Error: ${error.message}] [Stack: ${error.stack}]`)
            }

            return { data: findUser, code: MESSAGE_CODES.SUCCESS, statusCode: status.OK }
        } catch (error) {
            throw error
        }
    }

    //register user to crypto service
    async registerPayment(userId: string) {
        try {
            //check if user already registered
            const response = await firstValueFrom(
                this.httpService
                    .get(this.configService.get<string>("TON_TRACKING_SERVICE_URL") + `/users/${userId}` || "", {
                        headers: {
                            Authorization: "Bearer " + this.configService.get<string>("TON_TRACKING_SERVICE_BEARER")
                        }
                    })
                    .pipe(
                        catchError((error: AxiosError) => {
                            throw new Error(`Request failed: ${error.message}`)
                        })
                    )
            )
            if (response.data && response.data.data) {
                return response.data.data
            }

            const res = await firstValueFrom(
                this.httpService
                    .post(
                        this.configService.get<string>("TON_TRACKING_SERVICE_URL") + "/users" || "",
                        {
                            userId
                        },
                        {
                            headers: {
                                Authorization: "Bearer " + this.configService.get<string>("TON_TRACKING_SERVICE_BEARER")
                            }
                        }
                    )
                    .pipe(
                        catchError((error: AxiosError) => {
                            throw new Error(`Request failed: ${error.message}`)
                        })
                    )
            )
            return res.data.data
        } catch (e) {
            throw new Error("Cannot get token address: " + e.message)
        }
    }
}
