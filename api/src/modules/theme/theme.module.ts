import { Module } from '@nestjs/common'

import { RolesGuard } from '../../common/guards/roles.guard'
import { RbacModule } from '../rbac/rbac.module'
import { ThemeController } from './theme.controller'
import { ThemeService } from './theme.service'

@Module({
    imports: [RbacModule],
    providers: [ThemeService, RolesGuard],
    controllers: [ThemeController],
})
export class ThemeModule {}
