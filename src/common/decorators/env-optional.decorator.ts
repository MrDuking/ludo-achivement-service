import { registerDecorator, ValidationArguments, ValidationOptions } from "class-validator"

export function EnvOptional(validationOptions?: ValidationOptions) {
    return function (object: any, propertyName: string) {
        registerDecorator({
            name: "isEnvOptional",
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any) {
                    return value !== undefined && value !== null && value !== ""
                },
                defaultMessage(args: ValidationArguments) {
                    return `Missing env: ${args.property}`
                }
            }
        })
    }
}
