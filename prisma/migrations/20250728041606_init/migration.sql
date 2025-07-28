/*
  Warnings:

  - The primary key for the `Project` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- CreateEnum
CREATE TYPE "ScopeType" AS ENUM ('WEBSITE_DEVELOPMENT', 'LANDING_PAGE', 'SEO', 'SOCIAL_MEDIA_MARKETING', 'META_ADS', 'GOOGLE_ADS', 'BRANDING', 'LOGO_DESIGN', 'BROCHURE_DESIGN', 'DOMAIN_MANAGEMENT', 'REEL_PRODUCTION', 'CORPORATE_VIDEO', 'AD_FILM', 'INFLUENCER_MARKETING');

-- AlterTable
ALTER TABLE "Project" DROP CONSTRAINT "Project_pkey",
ALTER COLUMN "id" SET DATA TYPE BIGINT,
ADD CONSTRAINT "Project_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "project_scopes" (
    "id" BIGINT NOT NULL,
    "projectId" BIGINT NOT NULL,
    "scopeType" "ScopeType" NOT NULL,
    "isSelected" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "project_scopes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "project_scopes" ADD CONSTRAINT "project_scopes_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
