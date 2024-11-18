import { Injectable } from "@nestjs/common"
import { Application } from "../../common/schemas/application.schema"
import { ApplicationRepository } from "./application.repository"

@Injectable()
export class ApplicationService {
    constructor(private readonly applicationRepository: ApplicationRepository) {}
    async getApplicationById(appId: string): Promise<Application | null> {
        try {
            return await this.applicationRepository.findByAppId(appId)
        } catch (err) {
            throw err
        }
    }

    async getApplicationByName(name: string): Promise<Application | null> {
        try {
            return await this.applicationRepository.findApplicationByName(name)
        } catch (err) {
            throw err
        }
    }
}
