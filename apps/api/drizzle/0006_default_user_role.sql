-- Sign-up assigns the 'user' role, but it was never created, so every self-registered account
-- ended up with no role. Create it (no permissions) and give it to accounts that have no role.
INSERT INTO "roles" ("name", "label", "description", "icon")
VALUES ('user', 'User', 'Default role for new sign-ups', 'User')
ON CONFLICT ("name") DO NOTHING;
--> statement-breakpoint
INSERT INTO "user_roles" ("user_id", "role_id")
SELECT u."id", r."id"
FROM "users" u CROSS JOIN "roles" r
WHERE r."name" = 'user'
  AND NOT EXISTS (SELECT 1 FROM "user_roles" ur WHERE ur."user_id" = u."id");
