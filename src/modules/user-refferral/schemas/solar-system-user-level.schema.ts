// solar-system-user-level.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { initSolarCommission } from "@utils"
import { HydratedDocument } from "mongoose"
import { BaseSchema, CurrencySchema } from "src/common"

export type SolarSystemUserLevelDocument = HydratedDocument<SolarSystemUserLevel>

const COLLECTION_NAME = "solar_system_user_levels"

@Schema({ collection: COLLECTION_NAME, timestamps: true, versionKey: false })
export class SolarSystemUserLevel extends BaseSchema {
    @Prop({ type: String, required: true })
    userId: string

    @Prop({ type: Number, required: true })
    level: number

    @Prop({ type: [CurrencySchema], required: true, default: initSolarCommission })
    accumulatedCommission: CurrencySchema[]

    @Prop({ required: true, default: false })
    isUnLoked: boolean

    @Prop({ type: Date })
    unLokedDate?: Date
}

export const SolarSystemUserLevelSchema = SchemaFactory.createForClass(SolarSystemUserLevel)
SolarSystemUserLevelSchema.index({ deletedAt: 1, userId: 1, level: 1 })
