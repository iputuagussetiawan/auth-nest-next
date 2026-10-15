-- The app now lowercases emails on every write and lookup; bring stored rows in line.
-- Fails on the users_email_unique constraint if two accounts differ only by case. Find them with:
--   SELECT lower(trim(email)), array_agg(email) FROM users GROUP BY 1 HAVING count(*) > 1;
UPDATE "users" SET "email" = lower(trim("email")) WHERE "email" <> lower(trim("email"));
