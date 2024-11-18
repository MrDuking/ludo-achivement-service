import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { HandlerError, userLeaderBoardCoinRange } from "@utils"
import { EncryptService } from "../encrypt/encrypt.service"

@Injectable()
export class LeaderboardService {
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

    public getUserLeagueFromCoinEarn(coinEarn: number) {
        const league = userLeaderBoardCoinRange.find((range) => {
            if (range.maxCoinEarn === undefined) {
                return coinEarn >= range.minCoinEarn
            } else {
                return coinEarn >= range.minCoinEarn && coinEarn < range.maxCoinEarn
            }
        })
        return league
    }

    public async submitUserAllLeaderboards(userID: string, coinEarn: number, userData: { name: string; avatar: string }) {
        try {
            const userLeague = this.getUserLeagueFromCoinEarn(coinEarn)
            if (!userLeague) return false
            const leaderboardId = `${this.LEADERBOARD_GAME_ID}:${userLeague.name}`
            const body: any = {}
            const data = JSON.stringify({
                id: leaderboardId,
                score: coinEarn,
                override: true,
                userId: `${userID}`,
                userdata: {
                    userName: userData.name,
                    userId: `${userID}`,
                    metadata: {
                        avatar: userData.avatar
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
                throw new HandlerError(`submited to leader board fail ${userID} - ${coinEarn}`)
            }

            return await response.json()
        } catch (error) {
            throw error
        }
    }
}
