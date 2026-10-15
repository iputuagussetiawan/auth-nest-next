import { IsOptional, IsString, MaxLength } from 'class-validator'

export class RefreshTokenDto {
    /** Sent by the mobile app, which keeps its refresh token in secure storage. Browsers use the cookie. */
    @IsOptional()
    @IsString()
    @MaxLength(2000)
    refreshToken?: string
}
