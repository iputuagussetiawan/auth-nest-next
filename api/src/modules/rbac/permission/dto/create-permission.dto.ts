import { IsString, MinLength, MaxLength, IsOptional, Matches } from 'class-validator'

export class CreatePermissionDto {
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    @Matches(/^[a-z0-9_:]+$/, { message: 'name must be lowercase alphanumeric with : or _' })
    name: string

    @IsOptional()
    @IsString()
    @MaxLength(255)
    description?: string
}
