import { Type } from 'class-transformer'
import { IsBoolean, IsIn, IsObject, IsOptional, IsString, Matches, MaxLength, ValidateNested } from 'class-validator'

export class ThemeConfigDto {
    @IsString() @Matches(/^#[0-9a-fA-F]{6}$/) primaryColor: string
    @IsString() @Matches(/^#[0-9a-fA-F]{6}$/) accentColor: string
    @IsString() @Matches(/^#[0-9a-fA-F]{6}$/) backgroundColor: string
    @IsString() @Matches(/^#[0-9a-fA-F]{6}$/) foregroundColor: string
    @IsString() @Matches(/^#[0-9a-fA-F]{6}$/) cardColor: string
    @IsString() borderRadius: string
    @IsString() @MaxLength(100) fontFamily: string
    @IsIn(['centered', 'fullwidth']) heroVariant: 'centered' | 'fullwidth'
    @IsIn(['gradient', 'solid', 'mesh']) heroBackground: 'gradient' | 'solid' | 'mesh'
    @IsBoolean() darkMode: boolean
}

export class CreateThemeDto {
    @IsString() @MaxLength(100) name: string
    @IsString() @Matches(/^[a-z0-9-]+$/) @MaxLength(100) slug: string
    @IsOptional() @IsBoolean() isActive?: boolean
    @IsObject() @ValidateNested() @Type(() => ThemeConfigDto) config: ThemeConfigDto
}
