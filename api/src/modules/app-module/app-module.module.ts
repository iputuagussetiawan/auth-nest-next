import { Module } from '@nestjs/common'
import { AppModuleService } from './app-module.service'
import { AppModuleController } from './app-module.controller'
import { RolesGuard } from '../../common/guards/roles.guard'
import { RbacModule } from '../rbac/rbac.module'

@Module({
    imports: [RbacModule],
    providers: [AppModuleService, RolesGuard],
    controllers: [AppModuleController],
})
export class AppModuleModule {}
