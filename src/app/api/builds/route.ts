import { NextResponse } from "next/server";
import { db } from "@/db";
import { builds } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { executeBuildJob } from "@/lib/build-runner";
import { ensureDefaultUserAndSettings, getCurrentUser } from "@/lib/auth";
import { seedInitialBuildsIfEmpty } from "@/lib/seed";
import { AppCustomization, BuildType } from "@/types";

export async function GET(req: Request) {
  try {
    await ensureDefaultUserAndSettings();
    await seedInitialBuildsIfEmpty();

    const { searchParams } = new URL(req.url);
    const filterType = searchParams.get("type"); // 'all', 'website', 'zip', 'pwa'
    const filterStatus = searchParams.get("status"); // 'all', 'completed', 'failed', 'pending'
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const allBuilds = await db
      .select({
        id: builds.id,
        appName: builds.appName,
        packageId: builds.packageId,
        versionName: builds.versionName,
        versionCode: builds.versionCode,
        buildType: builds.buildType,
        sourceUrl: builds.sourceUrl,
        zipFileName: builds.zipFileName,
        zipFileSize: builds.zipFileSize,
        status: builds.status,
        progressPercent: builds.progressPercent,
        currentStep: builds.currentStep,
        errorMessage: builds.errorMessage,
        appIconUrl: builds.appIconUrl,
        apkFileName: builds.apkFileName,
        apkFileSize: builds.apkFileSize,
        hasApk: sql<boolean>`CASE WHEN ${builds.apkData} IS NOT NULL THEN true ELSE false END`,
        retryCount: builds.retryCount,
        githubRunUrl: builds.githubRunUrl,
        createdAt: builds.createdAt,
        completedAt: builds.completedAt,
      })
      .from(builds)
      .orderBy(desc(builds.createdAt))
      .limit(limit);

    // Compute stats
    let total = 0;
    let successful = 0;
    let failed = 0;
    let pending = 0;

    for (const b of allBuilds) {
      total++;
      if (b.status === "completed") successful++;
      else if (b.status === "failed") failed++;
      else pending++;
    }

    // Filter if requested
    let filtered = allBuilds;
    if (filterType && filterType !== "all") {
      filtered = filtered.filter((b) => b.buildType === filterType);
    }
    if (filterStatus && filterStatus !== "all") {
      if (filterStatus === "pending") {
        filtered = filtered.filter(
          (b) => b.status === "pending" || b.status === "validating" || b.status === "preparing" || b.status === "building" || b.status === "signing"
        );
      } else {
        filtered = filtered.filter((b) => b.status === filterStatus);
      }
    }

    return NextResponse.json({
      success: true,
      stats: {
        total,
        successful,
        failed,
        pending,
      },
      builds: filtered,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message || "Failed to load builds" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await ensureDefaultUserAndSettings();
    const user = await getCurrentUser();

    // Support multipart/form-data for ZIP uploads or JSON for URL builds
    const contentType = req.headers.get("content-type") || "";
    let appName = "";
    let packageId = "";
    let versionName = "1.0.0";
    let versionCode = 1;
    let buildType: BuildType = "website";
    let sourceUrl = "";
    let config: AppCustomization;
    let zipBuffer: Buffer | undefined;
    let zipFileName: string | undefined;
    let zipFileSize: number | undefined;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      appName = (formData.get("appName") as string) || "My Web App";
      packageId = (formData.get("packageId") as string) || "com.app.webapp";
      versionName = (formData.get("versionName") as string) || "1.0.0";
      versionCode = parseInt((formData.get("versionCode") as string) || "1", 10);
      buildType = (formData.get("buildType") as BuildType) || "zip";
      sourceUrl = (formData.get("sourceUrl") as string) || "";

      const configStr = formData.get("config") as string;
      config = configStr ? JSON.parse(configStr) : null;

      const file = formData.get("zipFile") as File | null;
      if (file) {
        const ab = await file.arrayBuffer();
        zipBuffer = Buffer.from(ab);
        zipFileName = file.name;
        zipFileSize = file.size;
      }
    } else {
      const body = await req.json();
      appName = body.appName || "My Web App";
      packageId = body.packageId || "com.app.webapp";
      versionName = body.versionName || "1.0.0";
      versionCode = body.versionCode || 1;
      buildType = body.buildType || "website";
      sourceUrl = body.sourceUrl || "";
      config = body.config;
    }

    if (!appName || !packageId) {
      return NextResponse.json({ error: "App Name and Package ID are required." }, { status: 400 });
    }

    // Validate Package ID format
    const packageIdRegex = /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/i;
    if (!packageIdRegex.test(packageId)) {
      return NextResponse.json(
        { error: "Invalid Package ID format. Must be in format 'com.company.app' (letters, numbers, underscores)." },
        { status: 400 }
      );
    }

    if (!config) {
      config = {
        appName,
        packageId,
        versionName,
        versionCode,
        splashBgColor: "#0f172a",
        splashShowSpinner: true,
        splashDurationMs: 2000,
        statusBarColor: "#1e293b",
        navBarColor: "#0f172a",
        themeColor: "#2563eb",
        orientation: "portrait",
        fullscreen: false,
        cleartextTraffic: false,
        permissions: {
          internet: true,
          camera: false,
          geolocation: false,
          storage: false,
          microphone: false,
          notifications: true,
          biometrics: false,
        },
      };
    }

    const buildId = `bld_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const origin = req.headers.get("origin") || req.headers.get("host") || "http://localhost:3000";
    const originUrl = origin.startsWith("http") ? origin : `https://${origin}`;

    // Insert new build
    await db.insert(builds).values({
      id: buildId,
      userId: user?.userId,
      appName,
      packageId,
      versionName,
      versionCode,
      buildType,
      sourceUrl: sourceUrl || undefined,
      zipFileName,
      zipFileSize,
      status: "pending",
      progressPercent: 5,
      currentStep: "Initializing build job...",
      configJson: JSON.stringify(config),
      appIconUrl: config.iconDataUrl,
      logs: `[${new Date().toISOString()}] [INFO] Created build job ${buildId}\n`,
    });

    // Start background execution
    executeBuildJob({
      id: buildId,
      userId: user?.userId,
      appName,
      packageId,
      versionName,
      versionCode,
      buildType,
      sourceUrl,
      zipFileName,
      zipFileSize,
      zipBuffer,
      appIconUrl: config.iconDataUrl,
      config,
      originUrl,
    }).catch((err) => {
      console.error(`Error running build job ${buildId}:`, err);
    });

    return NextResponse.json({
      success: true,
      buildId,
      status: "pending",
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message || "Failed to create build" }, { status: 500 });
  }
}
