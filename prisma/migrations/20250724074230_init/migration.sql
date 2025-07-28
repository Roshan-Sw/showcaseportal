-- CreateTable
CREATE TABLE "Client" (
    "id" INTEGER NOT NULL,
    "client_name" TEXT NOT NULL,
    "country_id" INTEGER NOT NULL,
    "description" TEXT,
    "thumbnail" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);
