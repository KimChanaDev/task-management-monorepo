export class GrpcUtils {
  // Helper function to convert Long/object to number
  public static toNumber(value: unknown): number {
    if (typeof value === "number") return value;
    if (typeof value === "string") return Number(value);
    if (value && typeof value === "object" && "low" in value) {
      // Handle protobuf Long type
      const long = value as { low: number; high: number; unsigned: boolean };
      return (
        long.high * 0x100000000 + (long.unsigned ? long.low >>> 0 : long.low)
      );
    }
    return 0;
  }
}
