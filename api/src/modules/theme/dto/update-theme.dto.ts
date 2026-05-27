import { Type } from 'class-transformer'
import { IsBoolean, IsIn, IsObject, IsOptional, IsString, Matches, MaxLength, ValidateNested } from 'class-validator'
import { ThemeConfigDto } from './create-theme.dto'

export class UpdateThemeDto {
    @IsOptional() @IsString() @MaxLength(100) name?: string
    @IsOptional() @IsString() @Matches(/^[a-z0-9-]+$/) @MaxLength(100) slug?: string
    @IsOptional() @IsBoolean() isActive?: boolean
    @IsOptional() @IsObject() @ValidateNested() @Type(() => ThemeConfigDto) config?: ThemeConfigDto
}
