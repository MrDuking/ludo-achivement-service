import { Metadata } from "@grpc/grpc-js"
import { Observable } from "rxjs"
import { NotifyQuery, NotifyResponse } from "./bot-controller.interface"

export interface BotControllerSerivceGrpc {
    postNotificationToTelegramBot(data: NotifyQuery, metadata: Metadata): Observable<NotifyResponse>
}
