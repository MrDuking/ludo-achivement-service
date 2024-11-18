import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { HydratedDocument } from "mongoose"
import { BaseSchema, CurrencySchema } from "src/common"

export type SolarSystemClaimLogDocument = HydratedDocument<SolarSystemClaimLog>

const COLLECTION_NAME = "solar_system_claim_logs"

@Schema({ collection: COLLECTION_NAME, timestamps: true, versionKey: false })
export class SolarSystemClaimLog extends BaseSchema {
    @Prop({ type: String, required: true })
    userId: string

    @Prop({ type: Number })
    level: number

    @Prop({ type: [CurrencySchema], required: true })
    accumulatedCommission: CurrencySchema[]
}

export const SolarSystemClaimLogSchema = SchemaFactory.createForClass(SolarSystemClaimLog)
