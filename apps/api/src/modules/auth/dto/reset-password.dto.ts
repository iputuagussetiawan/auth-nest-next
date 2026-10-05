import {
    PASSWORD_MAX_LENGTH,
    PASSWORD_MIN_LENGTH,
    VERIFICATION_CODE_MAX_LENGTH,
} from '@nest-auth/shared'
import { IsString, MaxLength, MinLength } from 'class-validator'

export class ResetPasswordDto {
    @IsString()
    @MinLength(PASSWORD_MIN_LENGTH)
    @MaxLength(PASSWORD_MAX_LENGTH)
    password!: string

    @IsString()
    @MinLength(1)
    @MaxLength(VERIFICATION_CODE_MAX_LENGTH)
    verificationCode!: string
}
