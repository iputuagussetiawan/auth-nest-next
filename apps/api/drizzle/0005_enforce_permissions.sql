-- Permissions are enforced from this release on; until now they granted nothing. The old seed gave
-- every role user:read, which would now let any account list all users, so start non-admin roles
-- from no permissions and let admins grant access deliberately. The admin role passes every check
-- regardless; it gets the full list only so the Roles page shows it accurately.
INSERT INTO "permissions" ("name", "description") VALUES
    ('user:read', 'List and view users'),
    ('user:create', 'Create users'),
    ('user:update', 'Edit users and activate or deactivate them'),
    ('user:delete', 'Delete users'),
    ('role:manage', 'Manage roles and permissions and assign roles'),
    ('theme:manage', 'Create, edit and activate themes'),
    ('settings:manage', 'Edit site settings and upload site assets'),
    ('stats:read', 'View dashboard statistics')
ON CONFLICT ("name") DO NOTHING;
--> statement-breakpoint
DELETE FROM "role_permissions"
WHERE "role_id" IN (SELECT "id" FROM "roles" WHERE "name" <> 'admin');
--> statement-breakpoint
INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT r."id", p."id" FROM "roles" r CROSS JOIN "permissions" p WHERE r."name" = 'admin'
ON CONFLICT DO NOTHING;
