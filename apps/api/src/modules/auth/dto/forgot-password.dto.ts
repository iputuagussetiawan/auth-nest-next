import { IsEmail } from 'class-validator'

import { NormalizeEmail } from '../../../common/helpers/email'

export class ForgotPasswordDto {
    @NormalizeEmail()
    @IsEmail()
    email!: string
}
