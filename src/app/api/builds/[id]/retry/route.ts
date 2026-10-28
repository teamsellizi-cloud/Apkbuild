import { NextResponse } from "next/server";
import { db } from "@/db";
import { builds } from "@/db/schema";
import { eq } from "drizzle-orm";
import { executeBuildJob } from "@/lib/build-runner";
import { AppCustomization, BuildType } from "@/types";

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

    // Enforce 1 retry rule
    if (build.retryCount >= 2) {
      return NextResponse.json(
        { error: "Maximum retry limit (2) reached for this build. Please create a new build." },
        { status: 400 }
      );
    }

    let parsedConfig: AppCustomization;
    try {
      parsedConfig = JSON.parse(build.configJson);
    } catch {
      return NextResponse.json({ error: "Invalid build config data" }, { status: 400 });
    }

    const newRetryCount = build.retryCount + 1;
    const restartLog = `\n[${new Date().toISOString()}] [INFO] --- RETRY ATTEMPT #${newRetryCount} ---\n`;

    await db
      .update(builds)
      .set({
        status: "pending",
        progressPercent: 5,
        currentStep: `Retrying build (Attempt #${newRetryCount})`,
        errorMessage: null,
        retryCount: newRetryCount,
        logs: build.logs + restartLog,
        updatedAt: new Date(),
      })
      .where(eq(builds.id, id));

    const origin = req.headers.get("origin") || req.headers.get("host") || "http://localhost:3000";
    const originUrl = origin.startsWith("http") ? origin : `https://${origin}`;

    executeBuildJob({
      id: build.id,
      userId: build.userId || undefined,
      appName: build.appName,
      packageId: build.packageId,
      versionName: build.versionName,
      versionCode: build.versionCode,
      buildType: build.buildType as BuildType,
      sourceUrl: build.sourceUrl || undefined,
      zipFileName: build.zipFileName || undefined,
      zipFileSize: build.zipFileSize || undefined,
      config: parsedConfig,
      originUrl,
    }).catch((err) => {
      console.error(`Error in retry build ${id}:`, err);
    });

    return NextResponse.json({
      success: true,
      message: `Build retried (Attempt #${newRetryCount})`,
      retryCount: newRetryCount,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message || "Failed to retry build" }, { status: 500 });
  }
}
