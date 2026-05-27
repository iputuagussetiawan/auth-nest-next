import { Module } from '@nestjs/common'
import { ThemeService } from './theme.service'
import { ThemeController } from './theme.controller'
import { RolesGuard } from '../../common/guards/roles.guard'
import { RbacModule } from '../rbac/rbac.module'

@Module({
    imports: [RbacModule],
    providers: [ThemeService, RolesGuard],
    controllers: [ThemeController],
})
export class ThemeModule {}
