import { Type } from 'class-transformer'
import { IsBoolean, IsIn, IsObject, IsOptional, IsString, Matches, MaxLength, ValidateNested } from 'class-validator'

const hexColor = () => Matches(/^#[0-9a-fA-F]{6}$/)

export class ThemeVarsDto {
    @IsString() @hexColor() background: string
    @IsString() @hexColor() foreground: string
    @IsString() @hexColor() card: string
    @IsString() @hexColor() cardForeground: string
    @IsString() @hexColor() popover: string
    @IsString() @hexColor() popoverForeground: string
    @IsString() @hexColor() primary: string
    @IsString() @hexColor() primaryForeground: string
    @IsString() @hexColor() secondary: string
    @IsString() @hexColor() secondaryForeground: string
    @IsString() @hexColor() muted: string
    @IsString() @hexColor() mutedForeground: string
    @IsString() @hexColor() accent: string
    @IsString() @hexColor() accentForeground: string
    @IsString() @hexColor() destructive: string
    @IsString() @hexColor() border: string
    @IsString() @hexColor() input: string
    @IsString() @hexColor() ring: string
    @IsString() @hexColor() chart1: string
    @IsString() @hexColor() chart2: string
    @IsString() @hexColor() chart3: string
    @IsString() @hexColor() chart4: string
    @IsString() @hexColor() chart5: string
    @IsString() @hexColor() sidebar: string
    @IsString() @hexColor() sidebarForeground: string
    @IsString() @hexColor() sidebarPrimary: string
    @IsString() @hexColor() sidebarPrimaryForeground: string
    @IsString() @hexColor() sidebarAccent: string
    @IsString() @hexColor() sidebarAccentForeground: string
    @IsString() @hexColor() sidebarBorder: string
    @IsString() @hexColor() sidebarRing: string
}

export class ThemeConfigDto {
    @IsObject() @ValidateNested() @Type(() => ThemeVarsDto) light: ThemeVarsDto
    @IsObject() @ValidateNested() @Type(() => ThemeVarsDto) dark: ThemeVarsDto
    @IsString() radius: string
    @IsString() @MaxLength(100) fontFamily: string
    @IsIn(['centered', 'fullwidth']) heroVariant: 'centered' | 'fullwidth'
    @IsIn(['gradient', 'solid', 'mesh']) heroBackground: 'gradient' | 'solid' | 'mesh'
}

export class CreateThemeDto {
    @IsString() @MaxLength(100) name: string
    @IsString() @Matches(/^[a-z0-9-]+$/) @MaxLength(100) slug: string
    @IsOptional() @IsBoolean() isActive?: boolean
    @IsObject() @ValidateNested() @Type(() => ThemeConfigDto) config: ThemeConfigDto
}
