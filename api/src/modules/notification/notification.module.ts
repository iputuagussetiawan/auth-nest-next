import { Module } from '@nestjs/common'

import { RbacModule } from '../rbac/rbac.module'
import { RolesGuard } from '../../common/guards/roles.guard'
import { NotificationController } from './notification.controller'
import { NotificationService } from './notification.service'

@Module({
    imports: [RbacModule],
    providers: [NotificationService, RolesGuard],
    controllers: [NotificationController],
    exports: [NotificationService],
})
export class NotificationModule {}
