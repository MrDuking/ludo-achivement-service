import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsArray, IsBoolean, IsDefined, IsInt, IsNumber, IsObject, IsOptional, IsString, ValidateNested } from "class-validator"

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

export class UpdateAchievementDto {
    @IsOptional()
    @IsString()
    @ApiProperty()
    name?: string

    @IsOptional()
    @IsString()
    @ApiProperty()
    description?: string

    @IsOptional()
    @IsNumber()
    @ApiProperty()
    type?: number

    @IsOptional()
    @IsNumber()
    @ApiProperty()
    requirementType?: number

    @IsOptional()
    @IsBoolean()
    @ApiProperty()
    isActive?: boolean

    @IsArray()
    @IsOptional()
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
    milestones?: Milestone[]
}
