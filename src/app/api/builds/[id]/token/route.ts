import { NextResponse } from "next/server";
import { generateSignedDownloadToken } from "@/lib/signed-urls";
import { db } from "@/db";
import { builds } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const records = await db.select().from(builds).where(eq(builds.id, id)).limit(1);

    if (records.length === 0) {
      return NextResponse.json({ error: "Build not found" }, { status: 404 });
    }

    const build = records[0];
    if (build.status !== "completed" || !build.apkData) {
      return NextResponse.json({ error: "APK artifact is not ready or build is not completed." }, { status: 400 });
    }

    const { token, expires } = generateSignedDownloadToken(id, 60);
    const downloadUrl = `/api/builds/${id}/download?token=${token}`;

    return NextResponse.json({
      success: true,
      token,
      expiresAt: expires,
      downloadUrl,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message || "Failed to generate token" }, { status: 500 });
  }
}
