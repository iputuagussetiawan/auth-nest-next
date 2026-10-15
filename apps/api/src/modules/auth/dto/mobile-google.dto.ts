import { IsString, Matches, MaxLength } from 'class-validator'

const HEX_64 = /^[0-9a-f]{64}$/

export class MobileGoogleStartDto {
    /** The app's deep link, e.g. myauthmobile://auth/google */
    @IsString()
    @MaxLength(500)
    redirectUri!: string
}

export class MobileGoogleExchangeDto {
    @Matches(HEX_64, { message: 'Invalid sign-in code' })
    code!: string

    @Matches(HEX_64, { message: 'Invalid sign-in verifier' })
    verifier!: string
}
