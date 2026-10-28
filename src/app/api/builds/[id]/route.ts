import { NextResponse } from "next/server";
import { db } from "@/db";
import { builds } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateSignedDownloadToken } from "@/lib/signed-urls";

export async function GET(
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

    // Generate signed download link if completed
    let downloadUrl: string | null = null;
    let expiresAt: number | null = null;

    if (build.status === "completed" && build.apkData) {
      const { token, expires } = generateSignedDownloadToken(build.id, 60); // 60 min token
      downloadUrl = `/api/builds/${build.id}/download?token=${token}`;
      expiresAt = expires;
    }

    let parsedConfig = null;
    try {
      parsedConfig = JSON.parse(build.configJson);
    } catch {
      // Ignore
    }

    return NextResponse.json({
      success: true,
      build: {
        ...build,
        apkData: undefined, // Don't send huge base64 in status polling
        hasApk: Boolean(build.apkData),
        config: parsedConfig,
        downloadUrl,
        downloadExpiresAt: expiresAt,
      },
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message || "Failed to get build" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.delete(builds).where(eq(builds.id, id));
    return NextResponse.json({ success: true, message: "Build deleted successfully" });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message || "Failed to delete build" }, { status: 500 });
  }
}
