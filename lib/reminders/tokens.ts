import crypto from "crypto";

export function createCompleteToken(reminderId: string): string {
  const secret = process.env.CRON_SECRET || "fallback-secret";
  return crypto
    .createHmac("sha256", secret)
    .update(reminderId)
    .digest("hex")
    .slice(0, 32);
}
