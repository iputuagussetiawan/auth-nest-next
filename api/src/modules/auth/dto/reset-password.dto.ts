import { IsString, MinLength, MaxLength } from 'class-validator'

export class ResetPasswordDto {
    @IsString()
    @MinLength(8)
    @MaxLength(72)
    password: string

    @IsString()
    @MinLength(1)
    @MaxLength(64)
    verificationCode: string
}
