import { VERIFICATION_CODE_MAX_LENGTH } from '@nest-auth/shared'
import { IsString, MaxLength, MinLength } from 'class-validator'

export class VerifyEmailDto {
    @IsString()
    @MinLength(1)
    @MaxLength(VERIFICATION_CODE_MAX_LENGTH)
    code!: string
}
