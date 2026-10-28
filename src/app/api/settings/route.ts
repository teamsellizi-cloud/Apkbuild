import { NextResponse } from "next/server";
import { db } from "@/db";
import { appSettings, builds } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { ensureDefaultUserAndSettings } from "@/lib/auth";

export async function GET() {
  try {
    await ensureDefaultUserAndSettings();
    const settingsList = await db.select().from(appSettings).limit(1);
    const settings = settingsList[0] || {
      id: "default",
      githubToken: "",
      githubRepo: "",
      githubBranch: "main",
      githubWorkflow: "apk-builder.yml",
      runnerMode: "auto",
      keystoreAlias: "apkbuilder-release-key",
      keystoreFingerprint: "",
      keystoreConfigured: false,
      retentionDays: 14,
    };

    // Calculate storage usage
    const storageStats = await db
      .select({
        totalCount: sql<number>`count(*)`,
        totalSizeBytes: sql<number>`coalesce(sum(${builds.apkFileSize}), 0)`,
      })
      .from(builds);

    const count = Number(storageStats[0]?.totalCount || 0);
    const totalBytes = Number(storageStats[0]?.totalSizeBytes || 0);

    return NextResponse.json({
      success: true,
      settings: {
        ...settings,
        githubTokenMasked: settings.githubToken
          ? `${settings.githubToken.slice(0, 4)}...${settings.githubToken.slice(-4)}`
          : "",
        hasGithubToken: Boolean(settings.githubToken),
      },
      storage: {
        totalBuilds: count,
        totalSizeBytes: totalBytes,
        totalSizeMb: (totalBytes / (1024 * 1024)).toFixed(2),
      },
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message || "Failed to load settings" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await ensureDefaultUserAndSettings();
    const body = await req.json();

    const {
      githubToken,
      githubRepo,
      githubBranch,
      githubWorkflow,
      runnerMode,
      keystoreAlias,
      keystoreFingerprint,
      keystoreConfigured,
      retentionDays,
    } = body;

    const existing = await db.select().from(appSettings).limit(1);
    const updatePayload: Partial<typeof appSettings.$inferInsert> = {
      githubRepo,
      githubBranch: githubBranch || "main",
      githubWorkflow: githubWorkflow || "apk-builder.yml",
      runnerMode: runnerMode || "auto",
      keystoreAlias,
      keystoreFingerprint,
      keystoreConfigured: Boolean(keystoreConfigured),
      retentionDays: retentionDays ? parseInt(retentionDays, 10) : 14,
      updatedAt: new Date(),
    };

    // Only update token if non-empty string passed
    if (githubToken !== undefined && githubToken !== "") {
      updatePayload.githubToken = githubToken;
    }

    if (existing.length > 0) {
      await db.update(appSettings).set(updatePayload).where(eq(appSettings.id, existing[0].id));
    } else {
      await db.insert(appSettings).values({
        id: "default",
        ...updatePayload,
      });
    }

    return NextResponse.json({ success: true, message: "Settings saved successfully" });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message || "Failed to save settings" }, { status: 500 });
  }
}
