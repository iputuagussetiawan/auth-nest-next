import { IsUUID } from 'class-validator'

export class SetThemePreferenceDto {
    @IsUUID()
    themeId: string
}
