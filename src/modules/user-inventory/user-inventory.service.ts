import { HttpStatus, Injectable } from "@nestjs/common"
import { plainToClass } from "class-transformer"
import { ClientSession } from "mongoose"
import { ItemType, PageDto, PageMetaDto, ResponseType, UserInventoryLogAction } from "src/common"
import { MESSAGE_CODES } from "src/common/constants"
import HandlerError from "src/utils/error-handler"
import { ActiveItemRequestDto, GetListUserInvetoryLogDto, UserItemsReponse } from "./dtos"
import { UserInventoryLogMessage } from "./dtos/user-inventory-log-response.dto"
import { UserInventoryLogRepository, UserItemsRepository } from "./repositories"
import { UserInventoryRepository } from "./repositories/user-inventory-repository"
import { UserInventory } from "./schemas"

@Injectable()
export class UserInventoryService {
    constructor(
        private readonly userInventoryLogRepository: UserInventoryLogRepository,
        private readonly userInventoryRepository: UserInventoryRepository,
        private readonly userItemsRepository: UserItemsRepository
    ) {}

    async getAllLogGrpcMethod(request: GetListUserInvetoryLogDto): Promise<ResponseType<PageDto<UserInventoryLogMessage>>> {
        try {
            const { page, take, userId, action, sort, sortDirection } = request

            const skip = (page - 1) * take

            const res = await this.userInventoryLogRepository.findAllOptions(
                skip,
                take,
                {
                    userId: userId,
                    action: action
                },
                sort,
                sortDirection
            )

            const pageMeta = new PageMetaDto({
                pageOptionsDto: request,
                itemCount: res.total
            })

            return {
                code: MESSAGE_CODES.SUCCESS,
                data: new PageDto(
                    res.items.map((r) => plainToClass(UserInventoryLogMessage, r)),
                    pageMeta
                )
            }
        } catch (error) {
            throw error
        }
    }

    async findUserInventoryByUserId(userId: string) {
        return this.userInventoryRepository.findByUserId(userId)
    }

    async findUserSpecificInventoryByUserId(userId: string, currencyId: number) {
        return this.userInventoryRepository.findSpecificInventoryByUserId(userId, currencyId)
    }

    async findUserInventoryAndItemByUserId(userId: string) {
        const userInventories = await this.userInventoryRepository.findByUserId(userId)
        const userItems = await this.userItemsRepository.findByUserId(userId)

        return {
            userInventories,
            userItems
        }
    }

    async findUsersInventoryAndItemByUserId(userIds: string[]) {
        const userInventories = await this.userInventoryRepository.findByUserIds(userIds)
        const userItems = await this.userItemsRepository.findByUserIds(userIds)
        for (const userId of userIds) {
            userInventories[userId].items = userItems.find((item) => item.userId === userId)
        }

        return userInventories
    }

    async addMoney(userId: string, currencyId: number, amount: number): Promise<UserInventory> {
        // NOTE: (@hhman24) create user inventory log
        await this.userInventoryLogRepository.create({
            amount: amount,
            userId: userId,
            currencyId: currencyId,
            action: UserInventoryLogAction.ADD_MONEY,
            transactionDate: new Date()
        })

        return await this.userInventoryRepository.updateAmount(userId, currencyId, amount)
    }

    async buyItem(userId: string, item: any) {
        const session = await this.userInventoryRepository.startSession()
        session.startTransaction()

        try {
            const money = await this.subtractMoney(userId, item.currencyId, item.cost, { session })
            if (!money) throw new HandlerError("Not enough money", HttpStatus.BAD_REQUEST, MESSAGE_CODES.BAD_REQUEST)
            const updatedUserItems = await this.addItemToUser(userId, item.itemType, item.id)
            await session.commitTransaction()
            return updatedUserItems
        } catch (error) {
            await session.abortTransaction()
            throw error
        } finally {
            session.endSession()
        }
    }

    async getUserItem(userId: string): Promise<ResponseType<UserItemsReponse>> {
        try {
            const user = await this.userItemsRepository.getUserItems(userId)

            if (!user) throw new HandlerError("User Not found", HttpStatus.BAD_REQUEST, MESSAGE_CODES.BAD_REQUEST)

            return {
                statusCode: HttpStatus.OK,
                code: MESSAGE_CODES.SUCCESS,
                data: user
            }
        } catch (error) {
            throw error
        }
    }

    async addItemToUser(userId: string, itemType: ItemType, itemId: number, options?: any) {
        const userItem = await this.userItemsRepository.addItem(userId, itemType, itemId, options)

        // NOTE: (@hhman24) create user inventory log
        await this.userInventoryLogRepository.create({ userId: userId, action: UserInventoryLogAction.ADD_ITEM, actionData: { ...userItem } })

        return userItem
    }

    async subtractMoney(userId: string, currencyId: number, amount: number, options?: { session: ClientSession }) {
        // NOTE: (@hhman24) create user inventory log
        await this.userInventoryLogRepository.create({
            amount: amount,
            userId: userId,
            currencyId: currencyId,
            action: UserInventoryLogAction.SUBTRACT_MONEY,
            transactionDate: new Date()
        })

        return await this.userInventoryRepository.subtractMoney(userId, currencyId, -amount, options)
    }

    async removeItemFromUser(userId: string, itemType: number, itemId: number) {
        const res = await this.userItemsRepository.removeItem(userId, itemType, itemId)

        // NOTE: (@hhman24) create user inventory log
        await this.userInventoryLogRepository.create({ userId: userId, action: UserInventoryLogAction.REMOVE_ITEM, actionData: { ...res } })

        return res
    }

    async setItemActive(userId: string, data: ActiveItemRequestDto) {
        const res = await this.userItemsRepository.setItemActive(userId, data)

        // NOTE: (@hhman24) create user inventory log
        await this.userInventoryLogRepository.create({ userId: userId, action: UserInventoryLogAction.SET_ACTIVE_ITEM, actionData: { ...res } })
    }
}
