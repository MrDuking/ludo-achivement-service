import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { HydratedDocument } from "mongoose"
import { BaseSchema, CurrencySchema } from "src/common"

export type SolarSystemCommissionLogDocument = HydratedDocument<SolarSystemCommissionLog>

const COLLECTION_NAME = "solar_system_commission_logs"

export class CommissionDistribution {
    @Prop({ required: true })
    referrerId: string

    @Prop({ required: true })
    commisssionLevel: number

    @Prop({ required: true })
    commissionAmount: CurrencySchema
}

@Schema({ collection: COLLECTION_NAME, timestamps: true, versionKey: false })
export class SolarSystemCommissionLog extends BaseSchema {
    @Prop({ type: String, required: true })
    userId: string

    @Prop({ type: [CommissionDistribution], required: true })
    commissionDistribution: CommissionDistribution[]

    @Prop({ type: String, required: true, unique: true })
    paymentId: string
}

export const SolarSystemCommissionLogSchema = SchemaFactory.createForClass(SolarSystemCommissionLog)
SolarSystemCommissionLogSchema.index({ deletedAt: 1, paymentId: 1, userId: 1 })
