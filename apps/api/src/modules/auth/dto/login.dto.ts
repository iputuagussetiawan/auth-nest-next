import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '@nest-auth/shared'
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator'

import { NormalizeEmail } from '../../../common/helpers/email'

export class LoginDto {
    @NormalizeEmail()
    @IsEmail()
    email!: string

    @IsString()
    @MinLength(PASSWORD_MIN_LENGTH)
    @MaxLength(PASSWORD_MAX_LENGTH)
    password!: string
}
