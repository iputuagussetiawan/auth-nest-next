import { Module } from '@nestjs/common'

import { PermissionsGuard } from '../../common/guards/permissions.guard'
import { RbacModule } from '../rbac/rbac.module'
import { ThemeController } from './theme.controller'
import { ThemeService } from './theme.service'

@Module({
    imports: [RbacModule],
    providers: [ThemeService, PermissionsGuard],
    controllers: [ThemeController],
})
export class ThemeModule {}
