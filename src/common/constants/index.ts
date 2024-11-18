import { status } from "@grpc/grpc-js"
import { HttpStatus } from "@nestjs/common"

export const MESSAGE_CODES = {
    SUCCESS: "success",
    FAILED: "failed",
    NOT_FOUND: "not_found",
    INVALID_REQUEST: "invalid_request",
    ALREADY_EXISTS: "already_exists",
    INTERNAL_SERVER_ERROR: "internal_server_error",
    NOT_IMPLEMENT_YET: "not_implement_yet",
    BAD_REQUEST: "bad_request",
    UNAUTHORIZED: "unauthorized",
    REQUEST_TIMEOUT: "request_timeout",
    T0O_MANY_REQUESTS: "too_many_requests",
    SERVICE_UNAVAILABLE: "service_unavailable",
    DUPLICATE_USER_REFERRAL: "duplicate_user_referral"
}

export const GRPC_STATUS_FROM_HTTP: Record<number, number> = {
    [HttpStatus.BAD_REQUEST]: status.INVALID_ARGUMENT,
    [HttpStatus.UNAUTHORIZED]: status.UNAUTHENTICATED,
    [HttpStatus.FORBIDDEN]: status.PERMISSION_DENIED,
    [HttpStatus.NOT_FOUND]: status.NOT_FOUND,
    [HttpStatus.CONFLICT]: status.ALREADY_EXISTS,
    [HttpStatus.GONE]: status.ABORTED,
    [HttpStatus.TOO_MANY_REQUESTS]: status.RESOURCE_EXHAUSTED,
    499: status.CANCELLED,
    [HttpStatus.INTERNAL_SERVER_ERROR]: status.INTERNAL,
    [HttpStatus.NOT_IMPLEMENTED]: status.UNIMPLEMENTED,
    [HttpStatus.BAD_GATEWAY]: status.UNKNOWN,
    [HttpStatus.SERVICE_UNAVAILABLE]: status.UNAVAILABLE,
    [HttpStatus.GATEWAY_TIMEOUT]: status.DEADLINE_EXCEEDED,
    [HttpStatus.HTTP_VERSION_NOT_SUPPORTED]: status.UNAVAILABLE,
    [HttpStatus.PAYLOAD_TOO_LARGE]: status.OUT_OF_RANGE,
    [HttpStatus.UNSUPPORTED_MEDIA_TYPE]: status.CANCELLED,
    [HttpStatus.UNPROCESSABLE_ENTITY]: status.CANCELLED,
    [HttpStatus.I_AM_A_TEAPOT]: status.UNKNOWN,
    [HttpStatus.METHOD_NOT_ALLOWED]: status.CANCELLED,
    [HttpStatus.PRECONDITION_FAILED]: status.FAILED_PRECONDITION
}

export const REWARD_LUTON = {
    INVITE_FRIEND: 5
}

export const WHITELIST_DOMAINS = ["http://127.0.0.1:3000", "https://api-auth.ludoton.io", "https://ludoton-tma-staging.web.app", "https://game.ludoton.io"]

export const PAKAGES = {
    USER_INVENTORY: "user_inventory",
    USER_REFERRAL: "user_referral",
    ACHIEVEMENT: "achievement",
    BOT_CONTROLLER: "bot_controller"
}
