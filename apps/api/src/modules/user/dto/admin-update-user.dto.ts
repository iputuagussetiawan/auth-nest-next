import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator'

export class AdminUpdateUserDto {
    @IsOptional()
    @IsString()
    @MaxLength(100)
    firstName?: string

    @IsOptional()
    @IsString()
    @MaxLength(100)
    lastName?: string

    @IsOptional()
    @IsBoolean()
    isActive?: boolean
}
