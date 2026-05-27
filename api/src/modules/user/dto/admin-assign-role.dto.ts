import { IsUUID } from 'class-validator'

export class AdminAssignRoleDto {
    @IsUUID()
    roleId: string
}
