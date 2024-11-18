import { ClassSerializerInterceptor, PlainLiteralObject } from "@nestjs/common"
import { ClassTransformOptions } from "class-transformer"
import { ResponseType } from "../dtos"

export function SerializerGrpcMethodInterceptor(): typeof ClassSerializerInterceptor {
    return class Interceptor extends ClassSerializerInterceptor {
        private convertUndefinedToNull(obj: PlainLiteralObject) {
            return Object.keys(obj).reduce((acc, key) => {
                acc[key] = obj[key] === undefined ? null : obj[key]
                return acc
            }, {} as PlainLiteralObject)
        }

        private changePlainObjectToClass(document: PlainLiteralObject) {
            return this.convertUndefinedToNull(document)
            // return plainToClass(classToIntercept, document, {
            //     excludePrefixes: ["_"]
            // })
        }

        private prepareResponse(response: ResponseType<PlainLiteralObject>) {
            if (!response.data) {
                return response
            }

            // If response.data is a empty array
            if (Array.isArray(response.data)) {
                return response
            }

            const transfromedData = Object.keys(response.data).reduce((acc, key) => {
                const value = response.data?.[key]

                if (value === undefined || value === null) {
                    acc[key] = null
                    return acc
                }

                if (Array.isArray(value)) {
                    acc[key] = value.map((v) => this.changePlainObjectToClass(v))
                } else if (typeof value === "object") acc[key] = this.changePlainObjectToClass(value)
                else {
                    acc[key] = value
                }

                return acc
            }, {} as PlainLiteralObject)

            return {
                ...response,
                data: transfromedData
            }
        }

        serialize(response: ResponseType<PlainLiteralObject>, options: ClassTransformOptions) {
            return super.serialize(this.prepareResponse(response), options)
        }
    }
}
