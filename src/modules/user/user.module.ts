import { Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import { AchievementModule } from "../achievement/achievement.module"
import { LeaderboardModule } from "../leaderboard/leaderboard.module"
import { UserGameInfoModule } from "../user-game-info/user-game-info.module"
import { UserInventoryModule } from "../user-inventory/user-inventory.module"
import { UserRepository } from "./repositories"
import { User, UserSchema } from "./schemas"
import { UserController } from "./user.controller"
import { UserService } from "./user.service"

@Module({
    imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), LeaderboardModule, UserGameInfoModule, UserInventoryModule, AchievementModule],
    controllers: [UserController],
    providers: [UserService, UserRepository],
    exports: [UserService, UserRepository]
})
export class UserModule {}
