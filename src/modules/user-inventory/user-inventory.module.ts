import { Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import { UserInventoryLogRepository, UserItemsRepository } from "./repositories"
import { UserInventoryRepository } from "./repositories/user-inventory-repository"
import { UserInventory, UserInventoryLog, UserInventoryLogSchema, UserInventorySchema } from "./schemas"
import { UserItems, UserItemsSchema } from "./schemas/user-items.schema"
import { UserInventoryController } from "./user-inventory.controller"
import { UserInventoryService } from "./user-inventory.service"

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: UserItems.name, schema: UserItemsSchema },
            { name: UserInventory.name, schema: UserInventorySchema },
            { name: UserInventoryLog.name, schema: UserInventoryLogSchema }
        ])
    ],
    controllers: [UserInventoryController],
    providers: [UserInventoryService, UserInventoryRepository, UserItemsRepository, UserInventoryService, UserInventoryLogRepository, UserInventoryLogRepository],
    exports: [UserInventoryService]
})
export class UserInventoryModule {}
