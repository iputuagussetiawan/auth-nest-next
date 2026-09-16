import { Module } from '@nestjs/common'

import { RolesGuard } from '../../common/guards/roles.guard'
import { RbacModule } from '../rbac/rbac.module'
import { AdminStatsController } from './admin-stats.controller'
import { AdminStatsService } from './admin-stats.service'

@Module({
    imports: [RbacModule],
    providers: [AdminStatsService, RolesGuard],
    controllers: [AdminStatsController],
})
export class AdminStatsModule {}
