import { plainToInstance } from "class-transformer"
import { IsNumber, IsString, validateSync } from "class-validator"
import { EnvOptional } from "../decorators/env-optional.decorator"
class EnvironmentVariables {
    @IsString()
    SERVICE_NAME: string

    @IsString()
    VERSION: string

    @IsNumber()
    PORT: number

    @IsString()
    DB_URI: string

    @IsString()
    NODE_ENV: string

    @IsString()
    LOG_DIR: string

    @EnvOptional()
    GAME_SERVER_API_KEY: string

    @EnvOptional()
    FIREBASE_PROJECT_ID: string

    @EnvOptional()
    FIREBASE_PRIVATE_KEY: string

    @EnvOptional()
    FIREBASE_CLIENT_EMAIL: string

    @EnvOptional()
    FIREBASE_DATABASE_URL: string
}

export function validate(config: Record<string, unknown>) {
    const validatedConfig = plainToInstance(EnvironmentVariables, config, {
        enableImplicitConversion: true
    })

    const errors = validateSync(validatedConfig, {
        skipMissingProperties: false
    })

    if (errors.length > 0) {
        const criticalErrors = errors.filter((error) => !Object.keys(error.constraints || {}).includes("isEnvOptional"))
        if (criticalErrors.length > 0) {
            throw new Error(`missing env: ${criticalErrors.map((error) => Object.values(error.constraints || {})).join(", ")}`)
        }
        const optionalErrors = errors.filter((error) => Object.keys(error.constraints || {}).includes("isEnvOptional"))
        optionalErrors.forEach((error) => {
            console.warn(`ENV WARNING: ${Object.values(error.constraints || {}).join(", ")}`)
        })
    }

    return validatedConfig
}
