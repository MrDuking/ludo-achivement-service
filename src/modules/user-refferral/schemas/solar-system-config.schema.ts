import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { HydratedDocument } from "mongoose"
import { BaseSchema, CurrencySchema } from "src/common"

export type SolarSystemConfigDocument = HydratedDocument<SolarSystemConfig>

const COLLECTION_NAME = "solar_system_configs"

@Schema({ collection: COLLECTION_NAME, timestamps: true, versionKey: false })
export class SolarSystemConfig extends BaseSchema {
    @Prop({ type: Number, required: true })
    type: number

    @Prop({ type: Number })
    level?: number

    @Prop({ type: String })
    levelName?: string

    @Prop({ type: Number })
    benefitPercent?: number

    @Prop({ type: Number })
    iapRequired?: number

    @Prop({ type: Number })
    totalFriendRequiredInLevel?: number

    @Prop({ type: Number })
    friendLevelRequired?: number

    @Prop({ type: [CurrencySchema] })
    minWithdraw?: CurrencySchema[]

    @Prop({ type: [CurrencySchema] })
    maxWithdraw?: CurrencySchema[]
}

export const SolarSystemConfigSchema = SchemaFactory.createForClass(SolarSystemConfig)
