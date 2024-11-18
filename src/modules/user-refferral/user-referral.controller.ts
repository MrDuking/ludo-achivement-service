import { status } from "@grpc/grpc-js"
import { Body, Controller, Get, HttpException, HttpStatus, Post, Query, UseGuards, UseInterceptors } from "@nestjs/common"
import { GrpcMethod, RpcException } from "@nestjs/microservices"
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger"
import { convertToGrpcStatusCode, formatErrors, HandlerError, validateMessage } from "@utils"
import { plainToClass } from "class-transformer"
import { ApiOkPaginationResponseCustom, ApiOkResponseCustom, AuthGuard, CurrentUser, ResponseType, SerializerGrpcMethodInterceptor } from "src/common"
import { MESSAGE_CODES } from "src/common/constants"
import { ParsedUser } from "../auth/dtos/parsed-user"
import {
    CreateUserReferralRequestDto,
    GetRefByMessage,
    GetReferralsRequestDto,
    GetReferralsResponseDto,
    GetTopRefQuery,
    RecordSolarSystemCommissionDto,
    SolarSystemCommissionLogDto,
    UpdateUserRefByDto,
    UserReferralDto
} from "./dtos"
import { ClaimSolarUserLevel, GetCurrentUserLevelResponseDto } from "./dtos/solar-system-user-level.dto"
import { GetRefBy, UpdateUserRefByMessage } from "./interfaces"
import { RecordSolarSystemCommission } from "./interfaces/solar-system.interface"
import { SolarSystemService } from "./solar-system.service"
import { UserReferralService } from "./user-referral.service"

@Controller("user-referral")
@ApiTags("User Referral")
export class UserReferralController {
    constructor(
        private readonly userReferralService: UserReferralService,
        private readonly solarSystemService: SolarSystemService
    ) {}

    @Post()
    async createReferral(@Body() referralData: CreateUserReferralRequestDto) {
        return this.userReferralService.createReferral(referralData)
    }

    @Get("referrals")
    @UseGuards(AuthGuard)
    @ApiBearerAuth("access-token")
    @ApiOkPaginationResponseCustom(ResponseType, GetReferralsResponseDto, UserReferralDto)
    async getReferrals(@CurrentUser() user: ParsedUser, @Query() query: GetReferralsRequestDto) {
        try {
            const { server, startDate, endDate, page, take } = query
            const filter: any = {}

            filter.refBy = user.id.toString()
            if (server !== undefined) filter.server = Number(server)

            if (startDate || endDate) {
                filter.refTime = {}
                if (startDate) {
                    filter.refTime.start = startDate
                }
                if (endDate) {
                    filter.refTime.end = endDate
                }
            }

            const [result, userRef] = await Promise.all([this.userReferralService.getReferrals(filter, page, take), this.userReferralService.getUserRef(filter.refBy)])
            return {
                code: MESSAGE_CODES.SUCCESS,
                data: {
                    ...result,
                    totalLutonEarnedByInvite: userRef ? userRef.data?.totalLutonEarnedByInvite : null,
                    totalPremiumFriendInvited: userRef ? userRef.data?.totalPremiumFriendInvited : null,
                    totalFriendInvited: userRef ? userRef.data?.totalFriendInvited : null
                }
            }
        } catch (error) {
            throw new HttpException(error?.message || "internal server error", error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR, {
                cause: {
                    code: error?.code || MESSAGE_CODES.INTERNAL_SERVER_ERROR,
                    message: error
                }
            })
        }
    }

    @Get("top")
    @UseGuards(AuthGuard)
    @ApiBearerAuth("access-token")
    @ApiOkResponseCustom(ResponseType, UserReferralDto)
    async getTopRef(@Query() query: GetTopRefQuery) {
        try {
            const res = await this.userReferralService.getTopRef(query.limit)

            return {
                statusCode: HttpStatus.OK,
                code: MESSAGE_CODES.SUCCESS,
                data: res
            }
        } catch (error) {
            throw new HttpException(error?.message || "server internal error", error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR, {
                cause: {
                    code: error?.code || MESSAGE_CODES.INTERNAL_SERVER_ERROR,
                    message: error
                }
            })
        }
    }

    @Get("/solar-system/level")
    @UseGuards(AuthGuard)
    @ApiBearerAuth("access-token")
    @ApiOkResponseCustom(ResponseType, GetCurrentUserLevelResponseDto)
    async getCurrentUserLevel(@CurrentUser() user: ParsedUser) {
        try {
            const res = await this.solarSystemService.getCurrentUserLevel(user?.id.toString() || "")

            return {
                statusCode: HttpStatus.OK,
                code: MESSAGE_CODES.SUCCESS,
                data: {
                    levels: res
                }
            }
        } catch (error) {
            throw new HttpException(error?.message || "server internal error", error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR, {
                cause: {
                    code: error?.code || MESSAGE_CODES.INTERNAL_SERVER_ERROR,
                    message: error
                }
            })
        }
    }

    @Post("/solar-system/claim")
    @UseGuards(AuthGuard)
    @ApiBearerAuth("access-token")
    @ApiOkResponse({ type: ResponseType })
    async claimSolarUserLevel(@CurrentUser() user: ParsedUser, @Body() body: ClaimSolarUserLevel) {
        try {
            const res = await this.solarSystemService.claimSolarSystemReward(user?.id.toString() || "", body.level)

            if (!res) throw new HandlerError(`not eligible to claim`, HttpStatus.BAD_REQUEST, MESSAGE_CODES.BAD_REQUEST)

            return {
                statusCode: HttpStatus.OK,
                code: MESSAGE_CODES.SUCCESS
            }
        } catch (error) {
            throw new HttpException(error?.message || "server internal error", error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR, {
                cause: {
                    code: error?.code || MESSAGE_CODES.INTERNAL_SERVER_ERROR,
                    message: error
                }
            })
        }
    }

    // NOTE: (@hhman24) Grpc method
    @GrpcMethod("UserReferralService", "getRef")
    @UseInterceptors(SerializerGrpcMethodInterceptor())
    async getRefByGrpc(data: GetRefBy) {
        try {
            // validate message
            const errors = await validateMessage(data, GetRefByMessage)

            if (errors.length > 0) {
                throw new HandlerError(`Form Arguments invalid: ${formatErrors(errors)}`, status.INVALID_ARGUMENT, MESSAGE_CODES.INVALID_REQUEST, "rpc")
            }

            return await this.userReferralService.getUserRef(data.userId, data.server)
        } catch (error) {
            throw new RpcException({
                statusCode: error?.method === "rpc" ? error?.statusCode || status.INTERNAL : convertToGrpcStatusCode(error.statusCode || 500),
                code: error?.code || MESSAGE_CODES.INTERNAL_SERVER_ERROR,
                message: error?.message || "internal server error"
            })
        }
    }

    @GrpcMethod("UserReferralService", "updateUserRefBy")
    @UseInterceptors(SerializerGrpcMethodInterceptor())
    async updateUserRefBy(data: UpdateUserRefByMessage) {
        try {
            // validate message
            const errors = await validateMessage(data, UpdateUserRefByDto)

            if (errors.length > 0) {
                throw new HandlerError(`Form Arguments invalid: ${formatErrors(errors)}`, status.INVALID_ARGUMENT, MESSAGE_CODES.INVALID_REQUEST, "rpc")
            }

            const res = await this.userReferralService.updateUserRefBy(data.userId, data.name, data.avatar, data.refBy, data.isTelegramPremiumUser)

            return {
                statusCode: status.OK,
                code: MESSAGE_CODES.SUCCESS,
                data: res
            }
        } catch (error) {
            throw new RpcException({
                statusCode: error?.method === "rpc" ? error?.statusCode || status.INTERNAL : convertToGrpcStatusCode(error.statusCode || 500),
                code: error?.code || MESSAGE_CODES.INTERNAL_SERVER_ERROR,
                message: error?.message || "internal server error"
            })
        }
    }

    @GrpcMethod("UserReferralService", "recordSolarSystemCommission")
    @UseInterceptors(SerializerGrpcMethodInterceptor())
    async recordSolarSystemCommission(data: RecordSolarSystemCommission) {
        try {
            // validate message
            const errors = await validateMessage(data, RecordSolarSystemCommissionDto)

            if (errors.length > 0) {
                throw new HandlerError(`Form Arguments invalid: ${formatErrors(errors)}`, status.INVALID_ARGUMENT, MESSAGE_CODES.INVALID_REQUEST, "rpc")
            }

            const { userId, paymentId, currency } = plainToClass(RecordSolarSystemCommissionDto, data)

            const res = await this.solarSystemService.recordSolarSystemCommission(userId, paymentId, currency)

            return {
                statusCode: status.OK,
                code: res ? MESSAGE_CODES.SUCCESS : MESSAGE_CODES.FAILED,
                data: plainToClass(SolarSystemCommissionLogDto, res)
            }
        } catch (error) {
            throw new RpcException({
                statusCode: error?.method === "rpc" ? error?.statusCode || status.INTERNAL : convertToGrpcStatusCode(error.statusCode || 500),
                code: error?.code || MESSAGE_CODES.INTERNAL_SERVER_ERROR,
                message: error?.message || "internal server error"
            })
        }
    }
}
