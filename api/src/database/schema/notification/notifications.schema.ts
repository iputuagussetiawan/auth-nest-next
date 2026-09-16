import { pgTable, primaryKey, text, timestamp, uuid, varchar, jsonb } from 'drizzle-orm/pg-core'

import { users } from '../auth/users.schema'

export const notifications = pgTable('notifications', {
    id: uuid('id').defaultRandom().primaryKey(),
    type: varchar('type', { length: 50 }).notNull(),
    title: varchar('title', { length: 200 }).notNull(),
    message: text('message').notNull(),
    actorUserId: uuid('actor_user_id').references(() => users.id, { onDelete: 'set null' }),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const notificationReads = pgTable(
    'notification_reads',
    {
        notificationId: uuid('notification_id')
            .notNull()
            .references(() => notifications.id, { onDelete: 'cascade' }),
        userId: uuid('user_id')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        readAt: timestamp('read_at').defaultNow().notNull(),
    },
    (table) => [primaryKey({ columns: [table.notificationId, table.userId] })],
)

export type Notification = typeof notifications.$inferSelect
export type NewNotification = typeof notifications.$inferInsert
