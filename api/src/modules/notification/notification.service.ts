import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { and, count, desc, eq, isNull, sql } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'

import { DRIZZLE } from '../../database/drizzle.provider'
import * as schema from '../../database/schema'
import { notificationReads, notifications } from '../../database/schema/notification/notifications.schema'

@Injectable()
export class NotificationService {
    constructor(@Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>) {}

    async notifyNewUser(actor: { id: string; email: string; provider?: string | null }) {
        const [notification] = await this.db
            .insert(notifications)
            .values({
                type: 'NEW_USER',
                title: 'New user registered',
                message: `${actor.email} registered with ${actor.provider ?? 'email'}.`,
                actorUserId: actor.id,
                metadata: { email: actor.email, provider: actor.provider ?? 'email' },
            })
            .returning()

        return notification
    }

    async list(userId: string) {
        return this.db
            .select({
                id: notifications.id,
                type: notifications.type,
                title: notifications.title,
                message: notifications.message,
                actorUserId: notifications.actorUserId,
                metadata: notifications.metadata,
                createdAt: notifications.createdAt,
                isRead: sql<boolean>`case when ${notificationReads.notificationId} is null then false else true end`,
            })
            .from(notifications)
            .leftJoin(
                notificationReads,
                and(
                    eq(notificationReads.notificationId, notifications.id),
                    eq(notificationReads.userId, userId),
                ),
            )
            .orderBy(desc(notifications.createdAt))
            .limit(50)
    }

    async unreadCount(userId: string) {
        const [result] = await this.db
            .select({ count: count() })
            .from(notifications)
            .leftJoin(
                notificationReads,
                and(
                    eq(notificationReads.notificationId, notifications.id),
                    eq(notificationReads.userId, userId),
                ),
            )
            .where(isNull(notificationReads.notificationId))

        return { count: Number(result?.count ?? 0) }
    }

    async markRead(notificationId: string, userId: string) {
        const [notification] = await this.db
            .select({ id: notifications.id })
            .from(notifications)
            .where(eq(notifications.id, notificationId))
            .limit(1)

        if (!notification) throw new NotFoundException('Notification not found')

        await this.db
            .insert(notificationReads)
            .values({ notificationId, userId })
            .onConflictDoNothing()

        return { message: 'Notification marked as read' }
    }

    async markAllRead(userId: string) {
        const unread = await this.db
            .select({ notificationId: notifications.id })
            .from(notifications)
            .leftJoin(
                notificationReads,
                and(
                    eq(notificationReads.notificationId, notifications.id),
                    eq(notificationReads.userId, userId),
                ),
            )
            .where(isNull(notificationReads.notificationId))

        if (unread.length) {
            await this.db
                .insert(notificationReads)
                .values(unread.map(({ notificationId }) => ({ notificationId, userId })))
                .onConflictDoNothing()
        }

        return { message: 'Notifications marked as read' }
    }
}
