import { Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import { UserGameInfoRepository } from "./repositories"
import { UserGameInfo, UserGameInfoSchema } from "./schemas"
import { UserGameInfoController } from "./user-game-info.controller"
import { UserGameInfoService } from "./user-game-info.service"

@Module({
    imports: [MongooseModule.forFeature([{ name: UserGameInfo.name, schema: UserGameInfoSchema }])],
    providers: [UserGameInfoRepository, UserGameInfoService],
    exports: [UserGameInfoService],
    controllers: [UserGameInfoController]
})
export class UserGameInfoModule {}
