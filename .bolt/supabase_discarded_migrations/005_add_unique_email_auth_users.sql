-- 005_add_unique_email_auth_users.sql
-- Ajoute une contrainte UNIQUE sur auth.users(email)
ALTER TABLE auth.users
ADD CONSTRAINT IF NOT EXISTS auth_users_email_unique
  UNIQUE (email);
