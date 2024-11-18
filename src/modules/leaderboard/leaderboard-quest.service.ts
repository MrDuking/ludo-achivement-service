import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { HandlerError } from "@utils"
import { EncryptService } from "../encrypt/encrypt.service"

@Injectable()
export class LeaderboardQuestService {
    private readonly XXTEA_KEY: string
    private readonly LEADERBOARD_ENDPOINT: string
    private readonly LEADERBOARD_GAME_ID: string

    constructor(
        private readonly encryptService: EncryptService,
        private readonly configService: ConfigService
    ) {
        this.XXTEA_KEY = this.configService.get<string>("XXTEA_KEY") || ""
        this.LEADERBOARD_ENDPOINT = this.configService.get<string>("API_ENDPOINT") || ""
        this.LEADERBOARD_GAME_ID = this.configService.get<string>("LEADERBOARD_GAME_ID") || ""
    }

    public async submitQuestPoint(userID: string, questPoint: number, userData: { name: string; avatar: string; totalQuestPointEarned: number }) {
        try {
            const leaderboardId = `${this.LEADERBOARD_GAME_ID}quest:quest`
            const body: any = {}
            const data = JSON.stringify({
                id: leaderboardId,
                score: questPoint,
                override: true,
                userId: `${userID}`,
                userdata: {
                    userName: userData.name,
                    userId: `${userID}`,
                    metadata: {
                        avatar: userData.avatar,
                        totalQuestPointEarned: userData.totalQuestPointEarned
                    }
                }
            })
            const encrypted = this.encryptService.encryptToString(data, this.XXTEA_KEY)
            body.data = encrypted

            const bodyString = JSON.stringify(body)

            const response = await fetch(`${this.LEADERBOARD_ENDPOINT}/leaderboard/report`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: bodyString
            })
            if (!response.ok) {
                throw new HandlerError(`post to leader board fail: ${userID}, ${questPoint}`)
            }
            const result = await response.json()
            return result
        } catch (error) {
            throw error
        }
    }

    public async submitUserAllLeaderboard(userID: string, questPoint: number, userData: { name: string; avatar: string; totalQuestPointEarned: number }) {
        try {
            const [submited] = await Promise.all([this.submitQuestPoint(userID, questPoint, userData)])

            return {
                success: submited,
                results: {
                    submited: submited
                }
            }
        } catch (error) {
            throw new HandlerError(`post to leader board fail: ${userID}, ${questPoint}`)
        }
    }
}
