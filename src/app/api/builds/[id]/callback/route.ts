import { NextResponse } from "next/server";
import { db } from "@/db";
import { builds, appSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "").trim();

    const settingsList = await db.select().from(appSettings).limit(1);
    const expectedSecret = settingsList[0]?.callbackSecret;

    if (expectedSecret && token !== expectedSecret) {
      return NextResponse.json({ error: "Unauthorized webhook token" }, { status: 401 });
    }

    const body = await req.json();
    const { status, progress, step, error, logMessage, apkBase64 } = body;

    const buildRecords = await db.select().from(builds).where(eq(builds.id, id)).limit(1);
    if (buildRecords.length === 0) {
      return NextResponse.json({ error: "Build not found" }, { status: 404 });
    }

    const currentBuild = buildRecords[0];
    let updatedLogs = currentBuild.logs;

    if (logMessage) {
      updatedLogs += `[${new Date().toISOString()}] [RUNNER] ${logMessage}\n`;
    }

    const updateData: Partial<typeof builds.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (status) updateData.status = status;
    if (progress !== undefined) updateData.progressPercent = progress;
    if (step) updateData.currentStep = step;
    if (error) {
      updateData.errorMessage = error;
      updatedLogs += `[${new Date().toISOString()}] [ERROR] ${error}\n`;
    }
    if (apkBase64) {
      updateData.apkData = apkBase64;
      updateData.apkFileSize = Buffer.from(apkBase64, "base64").length;
      updateData.apkFileName = `${currentBuild.packageId}-v${currentBuild.versionName}-release.apk`;
      updateData.completedAt = new Date();
    }

    updateData.logs = updatedLogs;

    await db.update(builds).set(updateData).where(eq(builds.id, id));

    return NextResponse.json({ success: true, message: "Callback processed successfully" });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message || "Callback processing failed" }, { status: 500 });
  }
}
