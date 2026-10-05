import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '@nest-auth/shared'
import { IsString, MaxLength, MinLength } from 'class-validator'

export class UpdatePasswordDto {
    @IsString()
    currentPassword!: string

    @IsString()
    @MinLength(PASSWORD_MIN_LENGTH)
    @MaxLength(PASSWORD_MAX_LENGTH)
    newPassword!: string

    @IsString()
    @MinLength(PASSWORD_MIN_LENGTH)
    @MaxLength(PASSWORD_MAX_LENGTH)
    confirmPassword!: string
}
