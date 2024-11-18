import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator"
import { PageOptionsDto, UserInventoryLogAction } from "src/common"

export class GetListUserInvetoryLogDto extends PageOptionsDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    readonly userId: string

    @IsOptional()
    @IsEnum(UserInventoryLogAction)
    readonly action: string
}
