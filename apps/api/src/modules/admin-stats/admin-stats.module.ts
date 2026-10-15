import { Module } from '@nestjs/common'

import { PermissionsGuard } from '../../common/guards/permissions.guard'
import { RbacModule } from '../rbac/rbac.module'
import { AdminStatsController } from './admin-stats.controller'
import { AdminStatsService } from './admin-stats.service'

@Module({
    imports: [RbacModule],
    providers: [AdminStatsService, PermissionsGuard],
    controllers: [AdminStatsController],
})
export class AdminStatsModule {}
