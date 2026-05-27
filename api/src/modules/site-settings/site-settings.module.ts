import { Module } from '@nestjs/common'
import { RbacModule } from '../rbac/rbac.module'
import { SiteSettingsController } from './site-settings.controller'
import { SiteSettingsService } from './site-settings.service'

@Module({
    imports: [RbacModule],
    controllers: [SiteSettingsController],
    providers: [SiteSettingsService],
    exports: [SiteSettingsService],
})
export class SiteSettingsModule {}
