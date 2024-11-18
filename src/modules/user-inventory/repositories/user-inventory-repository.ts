import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { Currency } from "src/common/enums"
import { UserInventory } from "../schemas"

@Injectable()
export class UserInventoryRepository {
    constructor(
        @InjectModel(UserInventory.name)
        private readonly userInventoryModel: Model<UserInventory>
    ) {}

    async initializeUserInventory(userId: string): Promise<UserInventory[]> {
        const currencies = Object.values(Currency)
            .map((currency) => parseInt(currency.toString()))
            .filter((currency) => !isNaN(currency))
        const existingInventories = await this.userInventoryModel.find({
            userId,
            currencyId: { $in: currencies }
        })
        const existingCurrencyIds = existingInventories.map((inventory) => inventory.currencyId)

        const missingCurrencies = currencies.filter((currency) => !existingCurrencyIds.includes(currency))

        // If all currencies already exist, return the existing inventories
        if (missingCurrencies.length === 0) {
            return existingInventories
        }

        // Create new inventory records only for the missing currencies
        const newInventories = await Promise.all(
            missingCurrencies.map((currency) => {
                const newInventory = new this.userInventoryModel({
                    userId,
                    currencyId: currency, // Set the currency ID (e.g., COIN, DIAMOND, etc.)
                    amount: currency == Currency.COIN ? 50000 : 0 // Initialize with 0 amount for each currency
                })
                return newInventory.save() // Save each new inventory record
            })
        )

        // Return all inventories (existing + new ones)
        return [...existingInventories, ...newInventories]
    }

    async createUserInventory(userId: string, currencyId: number, initialAmount: number): Promise<UserInventory> {
        const newInventory = new this.userInventoryModel({
            userId,
            currencyId,
            amount: initialAmount
        })
        return newInventory.save()
    }

    async findByUserId(userId: string): Promise<UserInventory[]> {
        const inventories = await this.userInventoryModel.find({ userId }).lean().exec()

        // If no inventories found, create new ones
        if (!inventories || inventories.length === 0 || inventories.length != Object.values(Currency).length) {
            return this.initializeUserInventory(userId) // Use your initialization function
        }

        return inventories
    }

    async findByUserIds(userIds: string[]) {
        const inventories = await this.userInventoryModel
            .find({ userId: { $in: userIds } })
            .lean()
            .exec()

        const result: any = {}
        for (const userId of userIds) {
            result[userId] = {}
            result[userId].inventories = inventories.filter((inventory) => inventory.userId === userId)
        }
        return result
    }

    async findSpecificInventoryByUserId(userId: string, currencyId: number): Promise<UserInventory> {
        const inventory = await this.userInventoryModel.findOne({ userId, currencyId }).lean().exec()

        // If no inventories found, create new ones
        if (!inventory) {
            const inventoryDoc = new this.userInventoryModel({
                userId,
                currencyId,
                amount: 0
            })
            return await inventoryDoc.save()
        }

        return inventory
    }

    async updateAmount(userId: string, currencyId: number, amount: number, options?: any): Promise<UserInventory> {
        const session = options?.session
        return await this.userInventoryModel
            .findOneAndUpdate(
                { userId, currencyId },
                { $inc: { amount } }, // Increment or decrement amount
                { new: true, upsert: true }
            )
            .session(session)
            .lean()
    }

    async findByUserIdAndCurrency(userId: string, currencyId: number): Promise<UserInventory | null> {
        return this.userInventoryModel.findOne({ userId, currencyId }, { upsert: true }).lean()
    }

    async getUserInventorys(userId: string): Promise<UserInventory[]> {
        return await this.userInventoryModel.find({ userId: userId, $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }] }).exec()
    }

    async subtractMoney(userId: string, currencyId: number, amount: number, options?: any) {
        if (amount > 0) throw new Error("Amount must be negative")
        console.log("Subtracting: " + amount)
        const session = options?.session
        return await this.userInventoryModel
            .findOneAndUpdate({ userId, currencyId, amount: { $gte: -amount } }, { $inc: { amount } }, { new: true })
            .session(session)
            .lean()
    }

    async startSession() {
        return await this.userInventoryModel.db.startSession()
    }
}
