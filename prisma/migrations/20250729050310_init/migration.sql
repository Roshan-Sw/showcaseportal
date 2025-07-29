/*
  Warnings:

  - You are about to drop the column `entity_id` on the `Tag_Mapping` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Tag_Mapping" DROP CONSTRAINT "fk_tagmapping_video";

-- DropForeignKey
ALTER TABLE "Tag_Mapping" DROP CONSTRAINT "fk_tagmapping_website";

-- AlterTable
ALTER TABLE "Tag_Mapping" DROP COLUMN "entity_id",
ADD COLUMN     "video_id" INTEGER,
ADD COLUMN     "website_id" INTEGER;

-- AddForeignKey
ALTER TABLE "Tag_Mapping" ADD CONSTRAINT "fk_tagmapping_website" FOREIGN KEY ("website_id") REFERENCES "Website"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Tag_Mapping" ADD CONSTRAINT "fk_tagmapping_video" FOREIGN KEY ("video_id") REFERENCES "Video"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
