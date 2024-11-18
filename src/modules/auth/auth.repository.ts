// import { nanoid } from "nanoid"
import { Injectable } from "@nestjs/common"
import { InGameCurrency } from "src/common"
import { isDifferentDate } from "src/utils/utils"
import { UserInventoryService } from "../user-inventory/user-inventory.service"
import { UserRepository } from "../user/repositories"
import { User } from "../user/schemas"
import { UserService } from "../user/user.service"

@Injectable()
export class AuthRepository {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly userService: UserService,
        private readonly userInventoryService: UserInventoryService
    ) {}

    async signup(userData: User): Promise<User> {
        const userProfile = await this.userService.initializeUser(userData)
        return userProfile
    }

    async login(userData: User): Promise<User> {
        let findUser: User | null = await this.userService.findUser(userData.id)
        if (!findUser) {
            findUser = await this.signup(userData)
        } else {
            const cmdUpdate = {
                lastLoginDate: new Date().toString(),
                name: userData.name,
                isTelegramPremiumUser: userData.isTelegramPremiumUser,
                sessionId: userData.sessionId,

                // NOTE: (an.hhm) update play time when user login
                playTime: findUser.playTime + 1
            }

            if (findUser.lastLoginDate == null || isDifferentDate(new Date(findUser.lastLoginDate), new Date())) {
                await this.userInventoryService.addMoney(findUser.id, InGameCurrency.COIN, 20000)
            }

            findUser = await this.userRepository.findOneAndUpdate(userData.id, cmdUpdate, { new: true })
        }
        return findUser
    }
}
