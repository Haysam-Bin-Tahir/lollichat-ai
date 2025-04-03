ALTER TABLE "User" ALTER COLUMN "password" DROP NOT NULL;

-- Add new columns for OAuth providers
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "name" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "image" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "provider" VARCHAR(20) DEFAULT 'credentials';

-- You may need to update any existing users
UPDATE "User" SET "provider" = 'credentials' WHERE "provider" IS NULL;