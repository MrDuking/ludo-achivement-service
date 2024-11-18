import { GRPC_STATUS_FROM_HTTP } from "src/common"

/**
 * @description convert http status code to grpc stautus code
 */
export const convertToGrpcStatusCode = (statusCode: number) => {
    console.log("🚀 ~ convertToGrpcStatusCode ~ statusCode:", GRPC_STATUS_FROM_HTTP[statusCode])
    return GRPC_STATUS_FROM_HTTP[statusCode]
}
