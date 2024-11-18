import { PlainLiteralObject, Type } from "@nestjs/common"
import { plainToInstance } from "class-transformer"
import { validate, ValidationError } from "class-validator"

export async function validateMessage(value: PlainLiteralObject, metaType: Type): Promise<ValidationError[]> {
    try {
        const object = plainToInstance(metaType, value)
        return await validate(object)
    } catch (error) {
        throw error
    }
}
