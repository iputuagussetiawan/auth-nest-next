import { IsArray, IsInt, IsOptional, IsUUID, Min, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

class ReorderItemDto {
    @IsUUID()
    id: string

    @IsOptional()
    @IsUUID()
    parentId: string | null

    @IsInt()
    @Min(0)
    order: number
}

export class ReorderModulesDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ReorderItemDto)
    items: ReorderItemDto[]
}
