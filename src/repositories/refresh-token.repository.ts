import { RefreshToken, hashRefreshToken, type IRefreshToken } from "../models/refresh-token.model";

export const refreshTokenRepository = {
  create(payload: {
    userId: string;
    rawToken: string;
    expiresAt: Date;
    userAgent?: string;
    ipAddress?: string;
  }): Promise<IRefreshToken> {
    return RefreshToken.create({
      userId: payload.userId,
      tokenHash: hashRefreshToken(payload.rawToken),
      expiresAt: payload.expiresAt,
      userAgent: payload.userAgent,
      ipAddress: payload.ipAddress,
    });
  },

  findActiveByRawToken(rawToken: string): Promise<IRefreshToken | null> {
    return RefreshToken.findOne({
      tokenHash: hashRefreshToken(rawToken),
      revokedAt: { $exists: false },
      expiresAt: { $gt: new Date() },
    });
  },

  findByRawToken(rawToken: string): Promise<IRefreshToken | null> {
    return RefreshToken.findOne({
      tokenHash: hashRefreshToken(rawToken),
    });
  },

  async revokeAndReplace(
    currentTokenId: string,
    currentRawToken: string,
    replacementRawToken: string,
  ): Promise<void> {
    await RefreshToken.findByIdAndUpdate(currentTokenId, {
      revokedAt: new Date(),
      replacedByTokenHash: hashRefreshToken(replacementRawToken),
      tokenHash: hashRefreshToken(currentRawToken),
    });
  },

  async revokeByRawToken(rawToken: string): Promise<void> {
    await RefreshToken.updateOne(
      { tokenHash: hashRefreshToken(rawToken), revokedAt: { $exists: false } },
      { revokedAt: new Date() },
    );
  },

  async revokeAllForUser(userId: string): Promise<void> {
    await RefreshToken.updateMany(
      { userId, revokedAt: { $exists: false } },
      { revokedAt: new Date() },
    );
  },
};
