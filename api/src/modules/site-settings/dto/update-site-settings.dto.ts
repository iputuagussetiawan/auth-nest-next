import { Transform } from 'class-transformer'
import { IsBoolean, IsEmail, IsOptional, IsString, MaxLength } from 'class-validator'

const emptyToUndefined = () =>
    Transform(({ value }) => (value === '' ? undefined : value))

export class UpdateSiteSettingsDto {
    @IsOptional() @IsString() @MaxLength(200) siteName?: string
    @IsOptional() @IsString() @MaxLength(300) tagline?: string
    @IsOptional() @IsString() description?: string

    @IsOptional() @IsString() @MaxLength(500) logoUrl?: string
    @IsOptional() @IsString() @MaxLength(500) faviconUrl?: string

    @IsOptional() @emptyToUndefined() @IsEmail() @MaxLength(200) contactEmail?: string
    @IsOptional() @IsString() @MaxLength(50) contactPhone?: string
    @IsOptional() @IsString() contactAddress?: string

    @IsOptional() @IsString() @MaxLength(500) socialTwitter?: string
    @IsOptional() @IsString() @MaxLength(500) socialFacebook?: string
    @IsOptional() @IsString() @MaxLength(500) socialInstagram?: string
    @IsOptional() @IsString() @MaxLength(500) socialLinkedin?: string
    @IsOptional() @IsString() @MaxLength(500) socialYoutube?: string

    @IsOptional() @IsString() @MaxLength(200) metaTitle?: string
    @IsOptional() @IsString() @MaxLength(500) metaDescription?: string
    @IsOptional() @IsString() @MaxLength(300) metaKeywords?: string
    @IsOptional() @IsString() @MaxLength(500) ogImageUrl?: string
    @IsOptional() @IsString() @MaxLength(50) googleAnalyticsId?: string

    @IsOptional() @IsBoolean() maintenanceMode?: boolean
    @IsOptional() @IsString() @MaxLength(500) maintenanceMessage?: string
}
