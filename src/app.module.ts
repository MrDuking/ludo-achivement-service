import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from "@nestjs/core"
import { MongooseModule } from "@nestjs/mongoose"
import { ThrottlerModule } from "@nestjs/throttler"
import { WinstonModule } from "nest-winston"
import { AppController } from "./app.controller"
import { AllExceptionsFilter, GrpcInterceptor, LoggerMiddleware, TransformInterceptor, ValidationPipe } from "./common"
import { validate } from "./common/validations/env.validation"
import { WinstonConfigService } from "./configs"
import { configurations } from "./configs/config"
import { LeaderboardModule, UserInventoryModule, UserModule, UserReferralModule, WorkerModule } from "./modules"
import { ApplicationModule } from "./modules/application/application.module"
import { AuthModule } from "./modules/auth/auth.module"
import { FirebaseModule } from "./modules/firebase/firebase.module"
import { MonitorModule, MonitorService } from "./modules/monitor"

const modules = [UserModule, AuthModule, ApplicationModule, LeaderboardModule, UserInventoryModule, UserReferralModule, FirebaseModule, WorkerModule]
@Module({
    imports: [
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                uri: configService.get<string>("DB_URI"),
                dbName: configService.get<string>("DB_NAME")
            }),
            inject: [ConfigService]
        }),
        ConfigModule.forRoot({
            load: configurations,
            envFilePath: "./.env",
            isGlobal: true,
            validate: validate
        }),
        WinstonModule.forRootAsync({
            useFactory: (configService: ConfigService, monitorService: MonitorService) => new WinstonConfigService(configService, monitorService).createWinstonModuleOptions(),
            imports: [ConfigModule, MonitorModule],
            inject: [ConfigService, MonitorService]
        }),
        ThrottlerModule.forRoot([
            {
                ttl: 60000,
                limit: 100
            }
        ]),
        ...modules
    ],
    controllers: [AppController],
    providers: [
        {
            provide: APP_PIPE,
            useClass: ValidationPipe
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: TransformInterceptor
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: GrpcInterceptor
        },
        {
            provide: APP_FILTER,
            useClass: AllExceptionsFilter
        }
    ],
    exports: []
})
export class AppModule implements NestModule {
    async configure(consumer: MiddlewareConsumer) {
        consumer.apply(LoggerMiddleware).forRoutes("*")
    }
}
