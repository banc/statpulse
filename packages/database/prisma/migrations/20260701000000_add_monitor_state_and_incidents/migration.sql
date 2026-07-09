-- CreateEnum
CREATE TYPE "MonitorType" AS ENUM ('HTTP');

-- CreateEnum
CREATE TYPE "HttpMethod" AS ENUM ('GET', 'HEAD');

-- CreateEnum
CREATE TYPE "MonitorStatus" AS ENUM ('UNKNOWN', 'UP', 'DOWN');

-- AlterTable
ALTER TABLE "Monitor"
ADD COLUMN "name" TEXT,
ADD COLUMN "type" "MonitorType" NOT NULL DEFAULT 'HTTP',
ADD COLUMN "method" "HttpMethod" NOT NULL DEFAULT 'GET',
ADD COLUMN "expectedStatus" INTEGER NOT NULL DEFAULT 200,
ADD COLUMN "timeoutMs" INTEGER NOT NULL DEFAULT 10000,
ADD COLUMN "status" "MonitorStatus" NOT NULL DEFAULT 'UNKNOWN',
ADD COLUMN "lastCheckedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Incident" (
    "id" TEXT NOT NULL,
    "monitorId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Incident_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Monitor_userId_status_idx" ON "Monitor"("userId", "status");

-- CreateIndex
CREATE INDEX "Incident_monitorId_resolvedAt_idx" ON "Incident"("monitorId", "resolvedAt");

-- CreateIndex
CREATE INDEX "Incident_monitorId_startedAt_idx" ON "Incident"("monitorId", "startedAt" DESC);

-- AddForeignKey
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_monitorId_fkey" FOREIGN KEY ("monitorId") REFERENCES "Monitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
