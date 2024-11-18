import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { ItemType } from "src/common"
import { ActiveItemRequestDto } from "../dtos"
import { UserItems } from "../schemas/user-items.schema"

@Injectable()
export class UserItemsRepository {
    constructor(@InjectModel(UserItems.name) private readonly userItemsModel: Model<UserItems>) {}

    async initializeUserItems(userId: string, options?: any) {
        const session = options?.session
        const userItems = await this.userItemsModel.findOne({ userId }).lean()
        if (userItems) return userItems

        const userItemsDoc = new this.userItemsModel({
            userId
        })

        return (await userItemsDoc.save({ session })).toObject()
    }

    async findByUserId(userId: string) {
        const userItems = await this.userItemsModel.findOne({ userId }).lean().exec()

        // If no items found, create new ones
        if (!userItems) {
            return this.initializeUserItems(userId)
        }

        return userItems
    }

    async findByUserIds(userIds: string[]): Promise<UserItems[]> {
        return await this.userItemsModel
            .find({ userId: { $in: userIds } })
            .lean()
            .exec()
    }

    async getUserItems(userId: string): Promise<UserItems | null> {
        return await this.userItemsModel.findOne({ userId: userId, $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }] }).exec()
    }

    async addItem(userId: string, itemType: number, itemId: number, options: any) {
        const field = this.getItemTypeField(itemType)

        const update = {
            $push: {
                [field]: {
                    itemId,
                    isActive: false
                }
            }
        }

        return await this.userItemsModel.findOneAndUpdate(
            {
                userId,
                [`${field}.itemId`]: { $ne: itemId }
            },
            update,
            {
                new: true,
                session: options?.session
            }
        )
    }

    // Method to remove an item from the user's inventory (frames, dices, or emojis)
    async removeItem(userId: string, itemType: number, itemId: number) {
        const userItems = await this.userItemsModel.findOne({ userId }).exec()

        if (!userItems) {
            throw new NotFoundException("User not found")
        }

        switch (itemType) {
            case ItemType.DICE: {
                userItems.dices = userItems.dices.filter((item) => item.itemId !== itemId)
                break
            }
            case ItemType.FRAME: {
                userItems.frames = userItems.frames.filter((item) => item.itemId !== itemId)
                break
            }
            case ItemType.EMOJI: {
                userItems.emojis = userItems.emojis.filter((item) => item.itemId !== itemId)
                break
            }
        }

        return await this.userItemsModel.findOneAndUpdate({ userId: userId }, userItems, { new: true })
    }

    async setItemActive(userId: string, data: ActiveItemRequestDto) {
        const { itemType, oldActiveItemIds, newActiveItemIds } = data
        const itemField = this.getItemTypeField(itemType)
        switch (itemType) {
            case ItemType.DICE:
            case ItemType.FRAME: {
                if (oldActiveItemIds.length > 1 || oldActiveItemIds.length == 0 || newActiveItemIds.length > 1 || newActiveItemIds.length == 0) {
                    throw Error("Old active item ids and new active item ids must have exactly 1 item id")
                }
                if (oldActiveItemIds[0] === newActiveItemIds[0]) {
                    throw Error("Old and new item active item can not be the same")
                }
                const result = await this.userItemsModel.findOneAndUpdate(
                    {
                        userId: userId,
                        [itemField]: {
                            $elemMatch: {
                                itemId: oldActiveItemIds[0],
                                isActive: true
                            }
                        }
                    },
                    {
                        $set: {
                            [`${itemField}.$[oldItem].isActive`]: false,
                            [`${itemField}.$[newItem].isActive`]: true
                        }
                    },
                    {
                        new: true,
                        arrayFilters: [
                            { "oldItem.itemId": oldActiveItemIds[0], "oldItem.isActive": true },
                            { "newItem.itemId": newActiveItemIds[0], "newItem.isActive": false }
                        ]
                    }
                )

                if (!result) {
                    throw Error("UserItem not found")
                }

                return result
            }
            case ItemType.EMOJI: {
                let result
                if (oldActiveItemIds.length == 0) {
                    result = await this.userItemsModel.findOneAndUpdate(
                        {
                            userId: userId,
                            $nor: [
                                {
                                    [itemField]: {
                                        $elemMatch: {
                                            isActive: true
                                        }
                                    }
                                }
                            ]
                        },
                        {
                            $set: {
                                "emojis.$[elem].isActive": true, // Activate emojis with the new IDs
                                "emojis.$[elemInactive].isActive": false
                            }
                        },
                        {
                            new: true,
                            arrayFilters: [
                                { "elem.itemId": { $in: newActiveItemIds } }, // Activate these
                                { "elemInactive.itemId": { $nin: newActiveItemIds } } // Deactivate others
                            ]
                        }
                    )
                } else {
                    result = await this.userItemsModel.findOneAndUpdate(
                        {
                            userId: userId,
                            [itemField]: {
                                $elemMatch: {
                                    itemId: { $in: oldActiveItemIds },
                                    isActive: true
                                }
                            }
                        },
                        {
                            $set: {
                                "emojis.$[elem].isActive": true, // Activate emojis with the new IDs
                                "emojis.$[elemInactive].isActive": false
                            }
                        },
                        {
                            new: true,
                            arrayFilters: [
                                { "elem.itemId": { $in: newActiveItemIds } }, // Activate these
                                { "elemInactive.itemId": { $nin: newActiveItemIds } } // Deactivate others
                            ]
                        }
                    )
                }

                if (!result) {
                    throw Error(`UserItem for userId ${userId} not found`)
                }

                return result
            }
        }
    }

    async startSession() {
        return await this.userItemsModel.db.startSession()
    }

    private getItemTypeField(itemType: ItemType): "frames" | "dices" | "emojis" {
        switch (itemType) {
            case ItemType.DICE:
                return "dices"
            case ItemType.FRAME:
                return "frames"
            case ItemType.EMOJI:
                return "emojis"
            default:
                throw new Error("Invalid item type")
        }
    }
}
