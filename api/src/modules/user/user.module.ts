import { Module } from '@nestjs/common'

import { CloudinaryModule } from '../../shared/cloudinary/cloudinary.module'
import { RoleModule } from '../rbac/role/role.module'
import { SessionModule } from '../session/session.module'
import { UserController } from './user.controller'
import { UserService } from './user.service'

@Module({
    imports: [RoleModule, CloudinaryModule, SessionModule],
    providers: [UserService],
    controllers: [UserController],
})
export class UserModule {}
