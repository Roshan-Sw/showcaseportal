/*
  Warnings:

  - The values [FILE] on the enum `CreativeType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CreativeType_new" AS ENUM ('LOGO', 'BROCHURE');
ALTER TABLE "Creative" ALTER COLUMN "type" TYPE "CreativeType_new" USING ("type"::text::"CreativeType_new");
ALTER TYPE "CreativeType" RENAME TO "CreativeType_old";
ALTER TYPE "CreativeType_new" RENAME TO "CreativeType";
DROP TYPE "CreativeType_old";
COMMIT;
