import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const alias = body.alias || "apkbuilder-release-key";
    const appOrg = body.organization || "devs APK Builder";

    // Generate random mock keystore byte buffer & SHA-256 fingerprint
    const keyData = crypto.randomBytes(2048);
    const sha256 = crypto.createHash("sha256").update(keyData).digest("hex").toUpperCase();
    const formattedSha256 = sha256.match(/.{1,2}/g)?.join(":") || sha256;

    // Password suggestion
    const generatedPassword = crypto.randomBytes(12).toString("base64").replace(/[+/=]/g, "k");

    return NextResponse.json({
      success: true,
      alias,
      organization: appOrg,
      sha256Fingerprint: `SHA256: ${formattedSha256}`,
      suggestedPassword: generatedPassword,
      keystoreBase64Preview: keyData.toString("base64").substring(0, 120) + "...",
      fullKeystoreBase64: keyData.toString("base64"),
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message || "Failed to generate keystore" }, { status: 500 });
  }
}
