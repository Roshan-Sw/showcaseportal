-- CreateEnum
CREATE TYPE "WebsiteType" AS ENUM ('WEBSITE', 'LANDING_PAGE');

-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('WEBSITE', 'VIDEO', 'CREATIVE');

-- CreateTable
CREATE TABLE "Website" (
    "id" SERIAL NOT NULL,
    "client_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" "WebsiteType" NOT NULL,
    "description" TEXT,
    "thumbnail" TEXT,
    "launch_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Website_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Technology" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Technology_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Website_Technology_Mapping" (
    "id" SERIAL NOT NULL,
    "website_id" INTEGER NOT NULL,
    "technology_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Website_Technology_Mapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag_Mapping" (
    "id" SERIAL NOT NULL,
    "entity_type" "EntityType" NOT NULL,
    "entity_id" INTEGER NOT NULL,
    "tag_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tag_Mapping_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Website" ADD CONSTRAINT "Website_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Website_Technology_Mapping" ADD CONSTRAINT "Website_Technology_Mapping_website_id_fkey" FOREIGN KEY ("website_id") REFERENCES "Website"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Website_Technology_Mapping" ADD CONSTRAINT "Website_Technology_Mapping_technology_id_fkey" FOREIGN KEY ("technology_id") REFERENCES "Technology"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag_Mapping" ADD CONSTRAINT "Tag_Mapping_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "Website"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
