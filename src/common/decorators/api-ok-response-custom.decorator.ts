import { Type, applyDecorators } from "@nestjs/common"
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from "@nestjs/swagger"
// eslint-disable-next-line
export const ApiOkResponseCustom = <GenericType extends Type<unknown>>(responseModel: Function, data: GenericType, options?: { isArray: boolean }) =>
    applyDecorators(
        ApiExtraModels(responseModel, data),
        ApiOkResponse({
            description: "",
            schema: {
                allOf: [
                    { $ref: getSchemaPath(responseModel) },
                    options?.isArray
                        ? {
                              properties: {
                                  data: { type: "array", items: { $ref: getSchemaPath(data) } }
                              }
                          }
                        : {
                              properties: {
                                  data: { $ref: getSchemaPath(data) }
                              }
                          }
                ]
            }
        })
    )
