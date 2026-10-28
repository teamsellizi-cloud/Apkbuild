import crypto from "crypto";

const SIGNING_SECRET = process.env.DOWNLOAD_SIGNING_SECRET || "apk-signed-download-secret-key-2026";

export function generateSignedDownloadToken(buildId: string, expiresInMinutes: number = 60): {
  token: string;
  expires: number;
} {
  const expires = Math.floor(Date.now() / 1000) + expiresInMinutes * 60;
  const data = `${buildId}:${expires}`;
  const hmac = crypto.createHmac("sha256", SIGNING_SECRET).update(data).digest("hex");
  const token = `${expires}.${hmac}`;
  return { token, expires };
}

export function verifySignedDownloadToken(buildId: string, token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return false;

    const [expiresStr, hmac] = parts;
    const expires = parseInt(expiresStr, 10);

    if (isNaN(expires) || Math.floor(Date.now() / 1000) > expires) {
      return false; // Expired
    }

    const data = `${buildId}:${expires}`;
    const expectedHmac = crypto.createHmac("sha256", SIGNING_SECRET).update(data).digest("hex");

    return crypto.timingSafeEqual(Buffer.from(hmac, "hex"), Buffer.from(expectedHmac, "hex"));
  } catch {
    return false;
  }
}
