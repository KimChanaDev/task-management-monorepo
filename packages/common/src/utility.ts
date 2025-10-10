export class Utility {
  public static parseExpiresIn(expiresIn: string): number {
    const units: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
      M: 30 * 24 * 60 * 60 * 1000,
      y: 365 * 24 * 60 * 60 * 1000,
    };

    const match = expiresIn.match(/^(\d+)([smhdMy])$/);
    if (!match) {
      throw new Error(
        "Invalid expiresIn format. Use formats like: 30d, 24h, 1M, 1y"
      );
    }

    const [, value, unit] = match;
    return parseInt(value, 10) * units[unit];
  }
}
