import { Module } from '@nestjs/common'
import { RoleModule } from './role/role.module'
import { PermissionModule } from './permission/permission.module'

@Module({
    imports: [RoleModule, PermissionModule],
    exports: [RoleModule, PermissionModule],
})
export class RbacModule {}
