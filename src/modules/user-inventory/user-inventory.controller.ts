import { status } from "@grpc/grpc-js"
import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, UseGuards } from "@nestjs/common"
import { GrpcMethod, RpcException } from "@nestjs/microservices"
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger"
import { formatErrors } from "@utils"
import { plainToClass, plainToInstance } from "class-transformer"
import { validate } from "class-validator"
import { ApplicationGuard, AuthGuard, CurrentUser, MESSAGE_CODES } from "src/common"
import { ActiveItemRequestDto, AddSubtractMoneyDto, GetListUserInvetoryLogDto, UserItemDto } from "./dtos"
import { GetUsersInventoryRequestDto } from "./dtos/get-users-inventory-request.dto"
import { GetListUserInventoryLogQuery } from "./interfaces"
import { UserInventoryService } from "./user-inventory.service"

@Controller("user-inventory")
@ApiTags("User Inventory")
export class UserInventoryController {
    constructor(private readonly userInventoryService: UserInventoryService) {}

    @Get("")
    @ApiOperation({ summary: "Get user inventory data" })
    @ApiBearerAuth("access-token")
    @UseGuards(AuthGuard)
    async getUserInventory(@CurrentUser("id") userId: string) {
        try {
            const result = await this.userInventoryService.findUserInventoryAndItemByUserId(userId)
            return {
                code: MESSAGE_CODES.SUCCESS,
                data: result
            }
        } catch (error) {
            throw new HttpException("internal server error", HttpStatus.INTERNAL_SERVER_ERROR, {
                cause: {
                    code: MESSAGE_CODES.INTERNAL_SERVER_ERROR,
                    message: error
                }
            })
        }
    }

    @Post("users")
    @ApiOperation({ summary: "Get users inventory data" })
    async getUsersInventory(@Body() getUsersInventoryRequest: GetUsersInventoryRequestDto) {
        try {
            const result = await this.userInventoryService.findUsersInventoryAndItemByUserId(getUsersInventoryRequest.userIds)
            return {
                code: MESSAGE_CODES.SUCCESS,
                data: result
            }
        } catch (error) {
            throw new HttpException("internal server error", HttpStatus.INTERNAL_SERVER_ERROR, {
                cause: {
                    code: MESSAGE_CODES.INTERNAL_SERVER_ERROR,
                    message: error
                }
            })
        }
    }

    @Post("active")
    @ApiOperation({ summary: "Set an item active for the user" })
    @ApiBearerAuth("access-token")
    @UseGuards(AuthGuard)
    async setItemActive(@Body() activeItemDto: ActiveItemRequestDto, @CurrentUser("id") userId: string) {
        try {
            const result = await this.userInventoryService.setItemActive(userId, activeItemDto)
            return {
                code: MESSAGE_CODES.SUCCESS,
                data: result
            }
        } catch (error) {
            throw new HttpException("internal server error", HttpStatus.INTERNAL_SERVER_ERROR, {
                cause: {
                    code: MESSAGE_CODES.INTERNAL_SERVER_ERROR,
                    message: error
                }
            })
        }
    }

    @Get(":userId")
    @UseGuards(ApplicationGuard)
    async getUserInventoryForGameServer(@Param("userId") userId: string): Promise<any> {
        try {
            const result = await this.userInventoryService.findUserInventoryByUserId(userId)
            return {
                code: MESSAGE_CODES.SUCCESS,
                data: result
            }
        } catch (error) {
            throw new RpcException({
                code: status.INTERNAL,
                message: "Internal server error",
                details: error.message || MESSAGE_CODES.INTERNAL_SERVER_ERROR
            })
        }
    }

    @Get(":userId/:currencyId")
    @UseGuards(ApplicationGuard)
    async getUserSpecificInventoryForGameServer(@Param("userId") userId: string, @Param("currencyId") currencyId: number): Promise<any> {
        try {
            const result = await this.userInventoryService.findUserSpecificInventoryByUserId(userId, currencyId)
            return {
                code: MESSAGE_CODES.SUCCESS,
                data: result
            }
        } catch (error) {
            throw new RpcException({
                code: status.INTERNAL,
                message: "Internal server error",
                details: error.message || MESSAGE_CODES.INTERNAL_SERVER_ERROR
            })
        }
    }

    @Post("add-money")
    @UseGuards(ApplicationGuard)
    async addMoney(@Body() data: AddSubtractMoneyDto) {
        try {
            const object = plainToInstance(AddSubtractMoneyDto, data)
            const result = await this.userInventoryService.addMoney(object.userId, object.currencyId, object.amount)
            return { code: MESSAGE_CODES.SUCCESS, data: result }
        } catch (error) {
            throw new HttpException("internal server error", HttpStatus.INTERNAL_SERVER_ERROR, {
                cause: {
                    code: MESSAGE_CODES.INTERNAL_SERVER_ERROR,
                    message: error
                }
            })
        }
    }

    @Post("subtract-money")
    @UseGuards(ApplicationGuard)
    async subtractMoney(@Body() data: AddSubtractMoneyDto) {
        try {
            const object = plainToInstance(AddSubtractMoneyDto, data)
            const result = await this.userInventoryService.subtractMoney(object.userId, object.currencyId, object.amount)
            return { code: MESSAGE_CODES.SUCCESS, data: result }
        } catch (error) {
            throw new HttpException("internal server error", HttpStatus.INTERNAL_SERVER_ERROR, {
                cause: {
                    code: MESSAGE_CODES.INTERNAL_SERVER_ERROR,
                    message: error
                }
            })
        }
    }

    @GrpcMethod("UserInventoryService", "buyItem")
    async buyItem(@Body() data: { userId: string; item: any }) {
        try {
            const { userId, item } = data
            const result = await this.userInventoryService.buyItem(userId, item)

            return {
                code: MESSAGE_CODES.SUCCESS,
                data: result
            }
        } catch (error) {
            console.log(error)
            throw new RpcException({
                code: status.INTERNAL,
                message: "Internal server error",
                details: error.message || MESSAGE_CODES.INTERNAL_SERVER_ERROR
            })
        }
    }

    @GrpcMethod("UserInventoryService", "getUserInventory")
    async getUserInventoryGrpc({ userId }: { userId: string }): Promise<any> {
        try {
            const result = await this.userInventoryService.findUserInventoryAndItemByUserId(userId)

            return {
                code: MESSAGE_CODES.SUCCESS,
                data: result
            }
        } catch (error) {
            throw new RpcException({
                code: status.INTERNAL,
                message: "Internal server error",
                details: error.message || MESSAGE_CODES.INTERNAL_SERVER_ERROR
            })
        }
    }

    @GrpcMethod("UserInventoryService", "getListLogUserInventory")
    async getListLogUserInventoryGrpc(data: GetListUserInventoryLogQuery) {
        try {
            // validate message
            const object = plainToInstance(GetListUserInvetoryLogDto, data)
            const errors = await validate(object)

            if (errors.length > 0) {
                throw new Error(`${formatErrors(errors)}`)
            }

            const query = plainToClass(GetListUserInvetoryLogDto, data)

            return await this.userInventoryService.getAllLogGrpcMethod(query)
        } catch (error) {
            throw new RpcException({
                code: error?.statusCode || status.INTERNAL,
                details: error?.code || MESSAGE_CODES.INTERNAL_SERVER_ERROR,
                message: error?.message || "internal server error"
            })
        }
    }

    @GrpcMethod("UserInventoryService", "addMoney")
    async addMoneyGrpc(data: AddSubtractMoneyDto) {
        try {
            const object = plainToInstance(AddSubtractMoneyDto, data)
            const errors = await validate(object)

            if (errors.length > 0) {
                throw new RpcException({
                    code: status.INVALID_ARGUMENT,
                    message: `Validation failed: ${errors}`,
                    details: MESSAGE_CODES.BAD_REQUEST
                })
            }

            const result = await this.userInventoryService.addMoney(object.userId, object.currencyId, object.amount)
            return { code: MESSAGE_CODES.SUCCESS, data: result }
        } catch (error) {
            throw new RpcException({
                code: error?.statusCode || status.INTERNAL,
                message: error?.message || "internal server error",
                details: MESSAGE_CODES.INTERNAL_SERVER_ERROR
            })
        }
    }

    @GrpcMethod("UserInventoryService", "subtractMoney")
    async subtractMoneyGrpc(data: AddSubtractMoneyDto) {
        try {
            const object = plainToInstance(AddSubtractMoneyDto, data)
            const errors = await validate(object)

            if (errors.length > 0) {
                throw new RpcException({
                    code: status.INVALID_ARGUMENT,
                    message: `Validation failed: ${errors}`,
                    details: MESSAGE_CODES.BAD_REQUEST
                })
            }

            const result = await this.userInventoryService.subtractMoney(object.userId, object.currencyId, object.amount)
            return { code: MESSAGE_CODES.SUCCESS, data: result }
        } catch (error) {
            throw new RpcException({
                code: error?.statusCode || status.INTERNAL,
                message: error?.message || "internal server error",
                details: MESSAGE_CODES.INTERNAL_SERVER_ERROR
            })
        }
    }

    @GrpcMethod("UserInventoryService", "addItemToUser")
    async addItemToUser(data: UserItemDto) {
        const { userId, itemType, itemId } = data
        try {
            const result = await this.userInventoryService.addItemToUser(userId, itemType, itemId)
            if (!result) throw new Error("Item not found " + JSON.stringify(data))
            return { code: MESSAGE_CODES.SUCCESS, data: result }
        } catch (error) {
            throw new RpcException({
                code: error?.statusCode || status.INTERNAL,
                message: error?.message || "internal server error",
                details: MESSAGE_CODES.INTERNAL_SERVER_ERROR
            })
        }
    }

    @GrpcMethod("UserInventoryService", "removeItem")
    async removeItemFromUser(data: UserItemDto) {
        const { userId, itemType, itemId } = data
        try {
            const result = await this.userInventoryService.removeItemFromUser(userId, itemType, itemId)
            return { code: MESSAGE_CODES.SUCCESS, data: result }
        } catch (error) {
            throw new RpcException({
                code: error?.statusCode || status.INTERNAL,
                message: error?.message || "internal server error",
                details: MESSAGE_CODES.INTERNAL_SERVER_ERROR
            })
        }
    }
}
