import {
    NAME_MAX_LENGTH,
    NAME_MIN_LENGTH,
    PASSWORD_MAX_LENGTH,
    PASSWORD_MIN_LENGTH,
} from '@nest-auth/shared'
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator'

import { NormalizeEmail } from '../../../common/helpers/email'

export class RegisterDto {
    @IsString()
    @MinLength(NAME_MIN_LENGTH)
    @MaxLength(NAME_MAX_LENGTH)
    firstName!: string

    @IsString()
    @MinLength(NAME_MIN_LENGTH)
    @MaxLength(NAME_MAX_LENGTH)
    lastName!: string

    @NormalizeEmail()
    @IsEmail()
    email!: string

    @IsString()
    @MinLength(PASSWORD_MIN_LENGTH)
    @MaxLength(PASSWORD_MAX_LENGTH)
    password!: string
}
