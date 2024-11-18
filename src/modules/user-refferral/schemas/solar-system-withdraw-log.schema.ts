import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { HydratedDocument } from "mongoose"
import { BaseSchema, CurrencySchema } from "src/common"

export type SolarSystemWithdrawLogDocument = HydratedDocument<SolarSystemWithdrawLog>

const COLLECTION_NAME = "solar_system_withdraw_logs"

@Schema({ collection: COLLECTION_NAME, timestamps: true, versionKey: false })
export class SolarSystemWithdrawLog extends BaseSchema {
    @Prop({ type: String, required: true })
    userId: string

    @Prop({ type: CurrencySchema, required: true })
    amount: CurrencySchema

    @Prop({ type: Date, required: true })
    time: Date

    @Prop({ type: String })
    paymentId?: string
}

export const SolarSystemWithdrawLogSchema = SchemaFactory.createForClass(SolarSystemWithdrawLog)
