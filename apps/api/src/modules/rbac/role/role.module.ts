import { Module } from '@nestjs/common'

import { PermissionsGuard } from '../../../common/guards/permissions.guard'
import { RolesGuard } from '../../../common/guards/roles.guard'
import { CloudinaryModule } from '../../../shared/cloudinary/cloudinary.module'
import { RoleController } from './role.controller'
import { RoleService } from './role.service'

@Module({
    imports: [CloudinaryModule],
    providers: [RoleService, RolesGuard, PermissionsGuard],
    controllers: [RoleController],
    exports: [RoleService, RolesGuard, PermissionsGuard],
})
export class RoleModule {}
