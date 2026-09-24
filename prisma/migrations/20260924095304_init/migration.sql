-- CreateTable
CREATE TABLE "declarations" (
    "id" TEXT NOT NULL,
    "cert_number" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "seller" JSONB NOT NULL,
    "buyer" JSONB NOT NULL,
    "husband" JSONB NOT NULL,
    "wife" JSONB NOT NULL,
    "joint" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "declarations_pkey" PRIMARY KEY ("id")
);
