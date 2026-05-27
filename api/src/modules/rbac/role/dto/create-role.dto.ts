import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator'

export class CreateRoleDto {
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    name: string

    @IsOptional()
    @IsString()
    @MaxLength(255)
    description?: string

    @IsOptional()
    @IsString()
    @MaxLength(100)
    icon?: string
}
