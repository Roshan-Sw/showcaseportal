-- CreateEnum
CREATE TYPE "VideoFormat" AS ENUM ('LANDSCAPE', 'PORTRAIT', 'SQUARE');

-- CreateEnum
CREATE TYPE "VideoType" AS ENUM ('CORPORATE_VIDEO', 'AD_FILM', 'REEL', 'ANIMATION', 'INTERVIEW', 'PORTRAIT');

-- CreateTable
CREATE TABLE "Video" (
    "id" SERIAL NOT NULL,
    "client_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "video_url" TEXT NOT NULL,
    "thumbnail" TEXT,
    "format" "VideoFormat" NOT NULL,
    "type" "VideoType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER,
    "updated_by" INTEGER,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- RenameForeignKey
ALTER TABLE "Tag_Mapping" RENAME CONSTRAINT "Tag_Mapping_entity_id_fkey" TO "fk_tagmapping_website";

-- AddForeignKey
ALTER TABLE "Tag_Mapping" ADD CONSTRAINT "fk_tagmapping_video" FOREIGN KEY ("entity_id") REFERENCES "Video"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
