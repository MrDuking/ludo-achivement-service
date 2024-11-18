import { Global, Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import { Application, ApplicationSchema } from "src/common/schemas"
import { ApplicationRepository } from "./application.repository"
import { ApplicationService } from "./application.service"

@Global()
@Module({
    imports: [MongooseModule.forFeature([{ name: Application.name, schema: ApplicationSchema }])],
    providers: [ApplicationRepository, ApplicationService],
    exports: [ApplicationService]
})
export class ApplicationModule {}
