import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'

import { NotificationModule } from '../notification/notification.module'
import { RoleModule } from '../rbac/role/role.module'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { GoogleStrategy } from './strategies/google.strategy'
import { JwtStrategy } from './strategies/jwt.strategy'
import { LocalStrategy } from './strategies/local.strategy'

@Module({
    imports: [PassportModule, JwtModule.register({}), RoleModule, NotificationModule],
    providers: [AuthService, LocalStrategy, JwtStrategy, GoogleStrategy],
    controllers: [AuthController],
    exports: [AuthService],
})
export class AuthModule {}
