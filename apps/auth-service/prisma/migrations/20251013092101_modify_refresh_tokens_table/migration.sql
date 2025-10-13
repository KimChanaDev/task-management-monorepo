-- AlterTable
ALTER TABLE "refresh_tokens" ADD COLUMN     "deviceId" TEXT,
ADD COLUMN     "deviceName" TEXT,
ADD COLUMN     "ipAddress" TEXT,
ADD COLUMN     "isRevoked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "revokedAt" TIMESTAMPTZ,
ADD COLUMN     "tokenFamily" TEXT,
ADD COLUMN     "userAgent" TEXT;

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_isRevoked_expiresAt_idx" ON "refresh_tokens"("userId", "isRevoked", "expiresAt");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_isRevoked_idx" ON "refresh_tokens"("token", "isRevoked");

-- CreateIndex
CREATE INDEX "refresh_tokens_expiresAt_idx" ON "refresh_tokens"("expiresAt");
