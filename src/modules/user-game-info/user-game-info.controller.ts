import { status } from "@grpc/grpc-js"
import { Controller, Get, HttpException, HttpStatus, Param, UseGuards } from "@nestjs/common"
import { GrpcMethod, RpcException } from "@nestjs/microservices"
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger"
import { AuthGuard, CurrentUser } from "src/common"
import { MESSAGE_CODES } from "src/common/constants"
import { ParsedUser } from "../auth/dtos/parsed-user"
import { UpdateUserGameInfoDto } from "./dtos"
import { UserGameInfoService } from "./user-game-info.service"

@ApiTags("User GameInfo")
@Controller("user-game-info")
export class UserGameInfoController {
    constructor(private readonly userGameInfoService: UserGameInfoService) {}

    @Get()
    @UseGuards(AuthGuard)
    @ApiOperation({ summary: "Get user GameInfo data" })
    @ApiBearerAuth("access-token")
    async getUserGameInfo(@CurrentUser() user: ParsedUser) {
        try {
            const data = await this.userGameInfoService.getUserGameInfoForGameClient(user.id.toString())
            return { data, code: MESSAGE_CODES.SUCCESS }
        } catch (error) {
            throw new HttpException(error?.message || "internal server error", error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR, {
                cause: {
                    code: error?.code || MESSAGE_CODES.INTERNAL_SERVER_ERROR,
                    message: error
                }
            })
        }
    }

    @Get(":userId")
    @ApiOperation({ summary: "Get user GameInfo data by userId" })
    async getUserGameInfoForGameServer(@Param("userId") userId: string) {
        try {
            const data = await this.userGameInfoService.getUserGameInfo(userId)
            return { data, code: MESSAGE_CODES.SUCCESS }
        } catch (error) {
            throw new HttpException(error?.message || "internal server error", error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR, {
                cause: {
                    code: error?.code || MESSAGE_CODES.INTERNAL_SERVER_ERROR,
                    message: error
                }
            })
        }
    }

    @GrpcMethod("UserGameInfoService", "getUserGameInfo")
    async getUserGameInfoForAdmin(data: { userId: string }) {
        try {
            const result = await this.userGameInfoService.getUserGameInfo(data.userId)
            return { data: result, code: MESSAGE_CODES.SUCCESS }
        } catch (error) {
            throw new RpcException({
                code: error?.statusCode || status.INTERNAL,
                details: error?.code || MESSAGE_CODES.INTERNAL_SERVER_ERROR,
                message: error?.message || "internal server error"
            })
        }
    }

    @GrpcMethod("UserGameInfoService", "updateUserGameInfo")
    async updateUserGameInfoForAdmin(request: { data: UpdateUserGameInfoDto }) {
        try {
            const { data } = request
            if (!data.userId || typeof data.userId !== "string") {
                throw new HttpException("userId should not be empty and must be a string", HttpStatus.BAD_REQUEST)
            }
            const result = await this.userGameInfoService.updateUserGameInfo(data.userId, data)
            return { data: result, code: MESSAGE_CODES.SUCCESS }
        } catch (error) {
            throw new RpcException({
                code: status.INTERNAL,
                message: error.message || MESSAGE_CODES.INTERNAL_SERVER_ERROR
            })
        }
    }
}
