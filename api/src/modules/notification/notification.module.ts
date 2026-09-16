import { Module } from '@nestjs/common'

import { RolesGuard } from '../../common/guards/roles.guard'
import { RbacModule } from '../rbac/rbac.module'
import { NotificationController } from './notification.controller'
import { NotificationService } from './notification.service'

@Module({
    imports: [RbacModule],
    providers: [NotificationService, RolesGuard],
    controllers: [NotificationController],
    exports: [NotificationService],
})
export class NotificationModule {}
