import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model, SortOrder } from "mongoose"
import { SortDirection } from "src/common"
import { UserInventoryLog, UserInventoryLogDocument } from "../schemas/user-inventory-log.schema"

@Injectable()
export class UserInventoryLogRepository {
    constructor(
        @InjectModel(UserInventoryLog.name)
        private readonly userInventoryLogModel: Model<UserInventoryLogDocument>
    ) {}

    async create(body: Partial<UserInventoryLog>): Promise<UserInventoryLog> {
        return await this.userInventoryLogModel.create({ ...body })
    }

    async findAllOptions(
        skip: number,
        limit: number,
        filter: { userId?: string; action?: string },
        sort: string,
        sortDirection: SortDirection
    ): Promise<{
        items: UserInventoryLog[]
        total: number
    }> {
        const query: any = {}

        if (filter.userId) query.userId = filter.userId
        if (filter.action) query.action = filter.action

        const sortOptions: Record<string, SortOrder> = {
            [sort]: sortDirection === SortDirection.ASC ? 1 : -1
        }

        const [total, items] = await Promise.all([
            this.userInventoryLogModel.countDocuments({ $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }] }).exec(),
            this.userInventoryLogModel
                .find({ $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }], ...query })
                .skip(skip)
                .limit(limit)
                .sort(sortOptions)
                .lean()
        ])
        return {
            total,
            items
        }
    }
}
