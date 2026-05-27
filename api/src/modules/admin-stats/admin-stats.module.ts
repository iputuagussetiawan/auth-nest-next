import { Module } from '@nestjs/common'
import { AdminStatsService } from './admin-stats.service'
import { AdminStatsController } from './admin-stats.controller'
import { RolesGuard } from '../../common/guards/roles.guard'
import { RbacModule } from '../rbac/rbac.module'

@Module({
    imports: [RbacModule],
    providers: [AdminStatsService, RolesGuard],
    controllers: [AdminStatsController],
})
export class AdminStatsModule {}
