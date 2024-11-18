import { HttpStatus, Injectable } from "@nestjs/common"
import { CorsOptions } from "@nestjs/common/interfaces/external/cors-options.interface"
import { ConfigService } from "@nestjs/config"
import { HandlerError } from "@utils"
import { WHITELIST_DOMAINS } from "src/common"

type StaticOrigin = boolean | string | RegExp | (string | RegExp)[]

@Injectable()
export class CorsOptionsFactory {
    constructor(private readonly configService: ConfigService) {}

    createCorsOptions(): CorsOptions {
        // const whitelistDomains = this.configService.get<string>("WHITELIST_DOMAINS")?.split(",") || []
        const buildMode = this.configService.get<string>("NODE_ENV")
        console.log("🚀 ~ CorsOptionsFactory ~ createCorsOptions ~ buildMode:", buildMode)

        return {
            origin: (requestOrigin: string, callback: (err: Error | null, origin?: StaticOrigin) => void) => {
                // allow all origins in development mode if no origin is provided
                if (buildMode === "dev") {
                    console.log("DEV MODE ALLOW ALL ORIGINS")
                    return callback(null, "*")
                }

                // check if the origin is in the whitelist
                if (WHITELIST_DOMAINS.includes(requestOrigin)) {
                    return callback(null, true)
                }

                // if not in the whitelist, throw a forbidden error
                return callback(new HandlerError(`${requestOrigin} not allowed by our CORS Policy.`, HttpStatus.FORBIDDEN))
            },
            methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
            optionsSuccessStatus: 200,
            credentials: true
        }
    }
}
