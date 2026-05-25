import { Inject, Injectable } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { eq } from 'drizzle-orm'

import { DRIZZLE } from '../../database/drizzle.provider'
import * as schema from '../../database/schema'
import { users } from '../../database/schema/users.schema'
import { RoleService } from '../rbac/role/role.service'
import { CloudinaryService } from '../../shared/cloudinary/cloudinary.service'
import { SessionService } from '../session/session.service'
import { BadRequestException, NotFoundException } from '../../common/exceptions/app-error'
import { UpdateProfileDto } from './dto/update-profile.dto'
import { UpdatePasswordDto } from './dto/update-password.dto'

@Injectable()
export class UserService {
    constructor(
        @Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>,
        private roleService: RoleService,
        private cloudinaryService: CloudinaryService,
        private sessionService: SessionService,
    ) {}

    async getMe(userId: string, sessionId: string) {
        const [user] = await this.db
            .select({
                id: users.id,
                email: users.email,
                firstName: users.firstName,
                lastName: users.lastName,
                profilePicture: users.profilePicture,
                isEmailVerified: users.isEmailVerified,
                isActive: users.isActive,
                provider: users.provider,
                lastLogin: users.lastLogin,
                createdAt: users.createdAt,
                updatedAt: users.updatedAt,
            })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1)

        if (!user) throw new NotFoundException('User not found')

        const userRoles = await this.roleService.getUserRoles(userId)
        const permissions = await this.roleService.getUserPermissions(userId)
        const sessions = await this.sessionService.getSessions(userId, sessionId)

        return {
            ...user,
            role: userRoles[0]?.name ?? null,
            permissions,
            sessions,
        }
    }

    async updateProfile(userId: string, dto: UpdateProfileDto) {
        const [user] = await this.db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1)

        if (!user) throw new NotFoundException('User not found')

        const [updated] = await this.db
            .update(users)
            .set({ ...dto, updatedAt: new Date() })
            .where(eq(users.id, userId))
            .returning({
                id: users.id,
                email: users.email,
                firstName: users.firstName,
                lastName: users.lastName,
                profilePicture: users.profilePicture,
                updatedAt: users.updatedAt,
            })

        return { message: 'Profile updated', user: updated }
    }

    async updateAvatar(userId: string, file: Express.Multer.File) {
        const [user] = await this.db
            .select({ id: users.id, profilePicture: users.profilePicture })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1)

        if (!user) throw new NotFoundException('User not found')

        if (user.profilePicture?.includes('cloudinary')) {
            await this.cloudinaryService.delete(user.profilePicture)
        }

        const result = await this.cloudinaryService.upload(file)

        const [updated] = await this.db
            .update(users)
            .set({ profilePicture: result.secure_url, updatedAt: new Date() })
            .where(eq(users.id, userId))
            .returning({
                id: users.id,
                email: users.email,
                firstName: users.firstName,
                lastName: users.lastName,
                profilePicture: users.profilePicture,
                updatedAt: users.updatedAt,
            })

        return { message: 'Avatar updated', user: updated }
    }

    async updatePassword(userId: string, dto: UpdatePasswordDto) {
        if (dto.newPassword !== dto.confirmPassword) {
            throw new BadRequestException('Passwords do not match')
        }

        const [user] = await this.db
            .select({ id: users.id, password: users.password, provider: users.provider })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1)

        if (!user) throw new NotFoundException('User not found')

        if (user.provider !== 'email' || !user.password) {
            throw new BadRequestException('Password update is only available for email accounts')
        }

        const isMatch = await bcrypt.compare(dto.currentPassword, user.password)
        if (!isMatch) throw new BadRequestException('Current password is incorrect')

        const hashed = await bcrypt.hash(dto.newPassword, 10)

        await this.db
            .update(users)
            .set({ password: hashed, updatedAt: new Date() })
            .where(eq(users.id, userId))

        return { message: 'Password updated successfully' }
    }
}
