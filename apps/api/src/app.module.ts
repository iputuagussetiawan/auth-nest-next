import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { DatabaseModule } from './database/database.module'
import { AdminStatsModule } from './modules/admin-stats/admin-stats.module'
import { AuthModule } from './modules/auth/auth.module'
import { NotificationModule } from './modules/notification/notification.module'
import { RbacModule } from './modules/rbac/rbac.module'
import { SessionModule } from './modules/session/session.module'
import { SiteSettingsModule } from './modules/site-settings/site-settings.module'
import { ThemeModule } from './modules/theme/theme.module'
import { UserModule } from './modules/user/user.module'
import { MailModule } from './shared/mail/mail.module'

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
        DatabaseModule,
        MailModule,
        AuthModule,
        RbacModule,
        UserModule,
        SessionModule,
        ThemeModule,
        AdminStatsModule,
        SiteSettingsModule,
        NotificationModule,
    ],
    controllers: [AppController],
    providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
