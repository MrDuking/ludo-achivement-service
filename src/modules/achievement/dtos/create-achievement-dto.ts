import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsArray, IsBoolean, IsDefined, IsInt, IsNumber, IsObject, IsString, ValidateNested } from "class-validator"

class Reward {
    @IsInt()
    type: number

    @IsInt()
    value: number
}

class Milestone {
    @IsInt()
    goal: number

    @IsDefined()
    @IsObject()
    @ValidateNested()
    @Type(() => Reward)
    reward: Reward
}

export class CreateAchievementDto {
    @IsString()
    @ApiProperty({ example: "Daily checkin" })
    name: string

    @IsString()
    @ApiProperty({ example: "Check in every day to earn reward" })
    description: string

    @IsNumber()
    @ApiProperty({ description: "0 for repeatable (every month) achievement, else use 1" })
    type: number

    @IsNumber()
    @ApiProperty({ example: "0" })
    requirementType: number

    @IsBoolean()
    @ApiProperty({ example: false })
    isActive: boolean

    @IsArray()
    @ValidateNested({ each: true }) // Validate each Milestone inside the array
    @Type(() => Milestone) // Ensure each item is treated as a Milestone object
    @ApiProperty({
        example: [
            {
                goal: 1,
                reward: {
                    type: 1,
                    value: 100
                }
            }
        ]
    })
    milestones: Milestone[]
}
