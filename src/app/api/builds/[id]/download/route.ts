import { NextResponse } from "next/server";
import { db } from "@/db";
import { builds } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifySignedDownloadToken } from "@/lib/signed-urls";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return new NextResponse("Unauthorized: Missing download signature token.", { status: 401 });
    }

    const isValid = verifySignedDownloadToken(id, token);
    if (!isValid) {
      return new NextResponse(
        "Forbidden: Expired or invalid download link signature. Please refresh download link from app.",
        { status: 403 }
      );
    }

    const records = await db.select().from(builds).where(eq(builds.id, id)).limit(1);
    if (records.length === 0) {
      return new NextResponse("Build not found.", { status: 404 });
    }

    const build = records[0];
    if (!build.apkData) {
      return new NextResponse("No APK data stored for this build.", { status: 404 });
    }

    const apkBuffer = Buffer.from(build.apkData, "base64");
    const fileName = build.apkFileName || `${build.packageId}-v${build.versionName}.apk`;

    return new NextResponse(apkBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.android.package-archive",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": apkBuffer.length.toString(),
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (err: unknown) {
    const error = err as Error;
    return new NextResponse(`Error downloading APK: ${error.message}`, { status: 500 });
  }
}
