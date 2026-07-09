-- CreateEnum
CREATE TYPE "AlertChannelType" AS ENUM ('TELEGRAM', 'EMAIL');

-- CreateEnum
CREATE TYPE "AlertDeliveryStatus" AS ENUM ('SENT', 'FAILED', 'SKIPPED');

-- CreateTable
CREATE TABLE "AlertChannel" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "AlertChannelType" NOT NULL,
    "name" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "cooldownSeconds" INTEGER NOT NULL DEFAULT 300,
    "lastSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AlertChannel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlertDeliveryLog" (
    "id" TEXT NOT NULL,
    "alertChannelId" TEXT NOT NULL,
    "monitorId" TEXT NOT NULL,
    "incidentId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "status" "AlertDeliveryStatus" NOT NULL,
    "message" TEXT,
    "providerResponse" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AlertDeliveryLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AlertChannel_userId_type_idx" ON "AlertChannel"("userId", "type");

-- CreateIndex
CREATE INDEX "AlertChannel_userId_isEnabled_idx" ON "AlertChannel"("userId", "isEnabled");

-- CreateIndex
CREATE INDEX "AlertDeliveryLog_alertChannelId_createdAt_idx" ON "AlertDeliveryLog"("alertChannelId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "AlertDeliveryLog_incidentId_createdAt_idx" ON "AlertDeliveryLog"("incidentId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "AlertDeliveryLog_monitorId_createdAt_idx" ON "AlertDeliveryLog"("monitorId", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "AlertChannel" ADD CONSTRAINT "AlertChannel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertDeliveryLog" ADD CONSTRAINT "AlertDeliveryLog_alertChannelId_fkey" FOREIGN KEY ("alertChannelId") REFERENCES "AlertChannel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertDeliveryLog" ADD CONSTRAINT "AlertDeliveryLog_monitorId_fkey" FOREIGN KEY ("monitorId") REFERENCES "Monitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertDeliveryLog" ADD CONSTRAINT "AlertDeliveryLog_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "Incident"("id") ON DELETE CASCADE ON UPDATE CASCADE;
