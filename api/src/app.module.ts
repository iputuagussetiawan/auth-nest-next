import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { DatabaseModule } from './database/database.module'
import { MailModule } from './shared/mail/mail.module'
import { AuthModule } from './modules/auth/auth.module'
import { RbacModule } from './modules/rbac/rbac.module'
import { UserModule } from './modules/user/user.module'
import { SessionModule } from './modules/session/session.module'
import { AppModuleModule } from './modules/app-module/app-module.module'
import { ThemeModule } from './modules/theme/theme.module'

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
        AppModuleModule,
        ThemeModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        { provide: APP_GUARD, useClass: ThrottlerGuard },
    ],
})
export class AppModule {}
