import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { RedisService } from "./redis.service"

@Module({
    imports: [ConfigModule],
    controllers: [],
    exports: [RedisService],
    providers: [RedisService]
})
export class RedisModule {}
