import { Module } from '@nestjs/common'

import { RolesGuard } from '../../../common/guards/roles.guard'
import { CloudinaryModule } from '../../../shared/cloudinary/cloudinary.module'
import { RoleController } from './role.controller'
import { RoleService } from './role.service'

@Module({
    imports: [CloudinaryModule],
    providers: [RoleService, RolesGuard],
    controllers: [RoleController],
    exports: [RoleService, RolesGuard],
})
export class RoleModule {}
