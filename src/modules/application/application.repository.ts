import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { Application } from "../../common/schemas/application.schema"

@Injectable()
export class ApplicationRepository {
    constructor(@InjectModel(Application.name) private readonly applicationModel: Model<Application>) {}

    async findByAppId(appId: string): Promise<Application | null> {
        return await this.applicationModel.findOne({ appId: appId })
    }

    async findApplicationByName(name: string): Promise<Application | null> {
        return await this.applicationModel.findOne({ serviceName: name })
    }
}
