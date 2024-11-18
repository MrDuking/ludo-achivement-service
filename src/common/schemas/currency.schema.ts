import { Prop } from "@nestjs/mongoose"

export class CurrencySchema {
    @Prop({ type: Number })
    type: number

    @Prop({ type: Number })
    amount: number
}
