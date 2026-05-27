import { IsArray, IsBoolean, IsOptional, IsString, IsUUID, Matches, MaxLength, MinLength } from 'class-validator'

export class UpdateAppModuleDto {
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    name?: string

    @IsOptional()
    @IsString()
    @Matches(/^[a-z0-9-]+$/, { message: 'slug must be lowercase letters, numbers, and hyphens only' })
    @MaxLength(100)
    slug?: string

    @IsOptional()
    @IsString()
    @MaxLength(255)
    path?: string

    @IsOptional()
    @IsString()
    @MaxLength(100)
    icon?: string

    @IsOptional()
    @IsString()
    @MaxLength(255)
    description?: string

    @IsOptional()
    @IsBoolean()
    isActive?: boolean

    @IsOptional()
    @IsArray()
    @IsUUID('all', { each: true })
    roleIds?: string[]

    @IsOptional()
    @IsArray()
    @IsUUID('all', { each: true })
    permissionIds?: string[]
}
