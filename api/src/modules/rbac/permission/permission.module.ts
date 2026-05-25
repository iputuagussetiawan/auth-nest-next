import { Module } from '@nestjs/common'
import { PermissionService } from './permission.service'
import { PermissionController } from './permission.controller'
import { RoleModule } from '../role/role.module'

@Module({
    imports: [RoleModule],
    providers: [PermissionService],
    controllers: [PermissionController],
    exports: [PermissionService],
})
export class PermissionModule {}
