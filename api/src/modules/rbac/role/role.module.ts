import { Module } from '@nestjs/common'
import { RoleService } from './role.service'
import { RoleController } from './role.controller'
import { RolesGuard } from '../../../common/guards/roles.guard'
import { CloudinaryModule } from '../../../shared/cloudinary/cloudinary.module'

@Module({
    imports: [CloudinaryModule],
    providers: [RoleService, RolesGuard],
    controllers: [RoleController],
    exports: [RoleService, RolesGuard],
})
export class RoleModule {}
