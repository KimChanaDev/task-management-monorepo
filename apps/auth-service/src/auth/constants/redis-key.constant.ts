export const REDIS_KEYS = {
  refreshToken: (token: string) => `refresh_token:${token}`,
  userActiveSessions: (userId: string) => `user:${userId}:active_sessions`,
} as const;
