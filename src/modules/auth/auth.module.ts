import { HttpModule } from "@nestjs/axios"
import { Global, Module } from "@nestjs/common"
import { BotControllerModule } from "../bot-controller/bot-controller.module"
import { FirebaseModule } from "../firebase/firebase.module"
import { UserInventoryModule } from "../user-inventory/user-inventory.module"
import { UserReferralModule } from "../user-refferral/user-referral.module"
import { UserModule } from "../user/user.module"
import { AuthController } from "./auth.controller"
import { AuthRepository } from "./auth.repository"
import { AuthService } from "./auth.service"

@Global()
@Module({
    imports: [UserModule, HttpModule, FirebaseModule, UserReferralModule, BotControllerModule, UserInventoryModule],
    controllers: [AuthController],
    providers: [AuthService, AuthRepository]
})
export class AuthModule {}
