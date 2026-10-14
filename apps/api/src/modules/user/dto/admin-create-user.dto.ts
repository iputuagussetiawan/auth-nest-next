import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '@nest-auth/shared'
import {
    IsBoolean,
    IsEmail,
    IsOptional,
    IsString,
    IsUUID,
    MaxLength,
    MinLength,
} from 'class-validator'

export class AdminCreateUserDto {
    @IsEmail()
    email!: string

    @IsString()
    @MinLength(PASSWORD_MIN_LENGTH)
    @MaxLength(PASSWORD_MAX_LENGTH)
    password!: string

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
