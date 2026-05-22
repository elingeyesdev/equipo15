-- CreateTable
CREATE TABLE "allowed_domains" (
    "id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "allowed_domains_pkey" PRIMARY KEY ("id")
);

-- Create unique index on domain
CREATE UNIQUE INDEX "allowed_domains_domain_key" ON "allowed_domains"("domain");

-- Create index for domain
CREATE INDEX "allowed_domains_domain_idx" ON "allowed_domains"("domain");
