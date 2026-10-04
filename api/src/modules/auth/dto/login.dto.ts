import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '@nest-auth/shared'
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator'

export class LoginDto {
    @IsEmail()
    email!: string

    @IsString()
    @MinLength(PASSWORD_MIN_LENGTH)
    @MaxLength(PASSWORD_MAX_LENGTH)
    password!: string
}
