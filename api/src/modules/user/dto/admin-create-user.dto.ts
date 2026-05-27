import { IsBoolean, IsEmail, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator'

export class AdminCreateUserDto {
    @IsEmail()
    email: string

    @IsString()
    @MinLength(8)
    @MaxLength(100)
    password: string

    @IsOptional()
    @IsString()
    @MaxLength(100)
    firstName?: string

    @IsOptional()
    @IsString()
    @MaxLength(100)
    lastName?: string

    @IsOptional()
    @IsUUID()
    roleId?: string

    @IsOptional()
    @IsBoolean()
    isActive?: boolean
}
