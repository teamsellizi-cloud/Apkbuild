import { db } from "@/db";
import { builds } from "@/db/schema";
import { generateAndroidApkPackage } from "./apk-generator";

export async function seedInitialBuildsIfEmpty() {
  try {
    const existing = await db.select().from(builds).limit(1);
    if (existing.length > 0) return;

    const defaultConfig = {
      appName: "My Website App",
      packageId: "com.mysite.app",
      versionName: "1.0.0",
      versionCode: 1,
      splashBgColor: "#0f172a",
      splashShowSpinner: true,
      splashDurationMs: 2000,
      statusBarColor: "#1e293b",
      navBarColor: "#0f172a",
      themeColor: "#2563eb",
      orientation: "portrait" as const,
      fullscreen: false,
      cleartextTraffic: false,
      permissions: {
        internet: true,
        camera: false,
        geolocation: true,
        storage: false,
        microphone: false,
        notifications: true,
        biometrics: false,
      },
    };

    // Generate real sample APK for item 1
    const item1Apk = await generateAndroidApkPackage({
      appName: "My Website App",
      packageId: "com.mysite.app",
      versionName: "1.0.0",
      versionCode: 1,
      buildType: "website",
      sourceUrl: "https://mysite.example.com",
      config: defaultConfig,
    });

    const item2Apk = await generateAndroidApkPackage({
      appName: "Portfolio App",
      packageId: "com.portfolio.app",
      versionName: "1.2.0",
      versionCode: 2,
      buildType: "zip",
      config: { ...defaultConfig, appName: "Portfolio App", packageId: "com.portfolio.app", themeColor: "#8b5cf6" },
    });

    // Populate initial items
    await db.insert(builds).values([
      {
        id: "bld_website_01",
        appName: "My Website App",
        packageId: "com.mysite.app",
        versionName: "1.0.0",
        versionCode: 1,
        buildType: "website",
        sourceUrl: "https://mysite.example.com",
        status: "completed",
        progressPercent: 100,
        currentStep: "Build finished successfully",
        configJson: JSON.stringify(defaultConfig),
        logs: `[2026-10-27T14:30:00.000Z] [INFO] Starting build job bld_website_01\n[2026-10-27T14:30:02.000Z] [INFO] Validating HTTPS URL: https://mysite.example.com\n[2026-10-27T14:30:04.000Z] [INFO] Configured Capacitor Android WebView wrapper\n[2026-10-27T14:30:08.000Z] [STEP] Running Gradle assembleRelease\n[2026-10-27T14:30:12.000Z] [SUCCESS] Signed com.mysite.app-v1.0.0-release.apk (1.4 MB)`,
        apkFileName: item1Apk.fileName,
        apkFileSize: item1Apk.fileSize,
        apkData: item1Apk.apkBuffer.toString("base64"),
        createdAt: new Date("2026-10-27T14:30:00Z"),
        completedAt: new Date("2026-10-27T14:32:00Z"),
      },
      {
        id: "bld_zip_02",
        appName: "Portfolio App",
        packageId: "com.portfolio.app",
        versionName: "1.2.0",
        versionCode: 2,
        buildType: "zip",
        zipFileName: "portfolio-dist.zip",
        zipFileSize: 2450000,
        status: "completed",
        progressPercent: 100,
        currentStep: "Build finished successfully",
        configJson: JSON.stringify({ ...defaultConfig, appName: "Portfolio App", packageId: "com.portfolio.app", themeColor: "#8b5cf6" }),
        logs: `[2026-10-27T11:15:00.000Z] [INFO] Uploaded portfolio-dist.zip (2.4 MB)\n[2026-10-27T11:15:02.000Z] [INFO] Detected static HTML/React bundle\n[2026-10-27T11:16:00.000Z] [STEP] Compiling Android resources\n[2026-10-27T11:18:00.000Z] [SUCCESS] Generated signed APK com.portfolio.app-v1.2.0-release.apk`,
        apkFileName: item2Apk.fileName,
        apkFileSize: item2Apk.fileSize,
        apkData: item2Apk.apkBuffer.toString("base64"),
        createdAt: new Date("2026-10-27T11:15:00Z"),
        completedAt: new Date("2026-10-27T11:18:00Z"),
      },
      {
        id: "bld_pwa_03",
        appName: "News App",
        packageId: "com.news.app",
        versionName: "1.0.0",
        versionCode: 1,
        buildType: "pwa",
        sourceUrl: "https://news.invalid-sample.com",
        status: "failed",
        progressPercent: 20,
        currentStep: "Manifest validation failed",
        errorMessage: "PWA manifest is missing required 512x512 maskable icon and Service Worker.",
        configJson: JSON.stringify({ ...defaultConfig, appName: "News App", packageId: "com.news.app", themeColor: "#10b981" }),
        logs: `[2026-10-26T20:44:00.000Z] [INFO] Validating PWA endpoint https://news.invalid-sample.com\n[2026-10-26T20:45:00.000Z] [ERROR] Manifest validation failed: Missing 512x512 maskable icon and Service Worker not registered.\n[2026-10-26T20:45:01.000Z] [INFO] Suggestion: Use Capacitor WebView mode as fallback.`,
        createdAt: new Date("2026-10-26T20:44:00Z"),
      },
      {
        id: "bld_website_04",
        appName: "Blog App",
        packageId: "com.blog.app",
        versionName: "1.0.0",
        versionCode: 1,
        buildType: "website",
        sourceUrl: "https://myblog.example.org",
        status: "pending",
        progressPercent: 10,
        currentStep: "Queued in build pipeline",
        configJson: JSON.stringify({ ...defaultConfig, appName: "Blog App", packageId: "com.blog.app", themeColor: "#0284c7" }),
        logs: `[2026-10-26T17:12:00.000Z] [INFO] Build job queued. Waiting for runner allocation...`,
        createdAt: new Date("2026-10-26T17:12:00Z"),
      },
    ]);

    // Insert additional mock builds to achieve screenshot's exact initial totals (10 successful, 1 failed, 1 pending = 12 total)
    for (let i = 5; i <= 12; i++) {
      await db.insert(builds).values({
        id: `bld_archive_${i}`,
        appName: `Mobile Tool ${i}`,
        packageId: `com.devs.tool${i}.app`,
        versionName: "1.0.0",
        versionCode: 1,
        buildType: i % 2 === 0 ? "website" : "zip",
        sourceUrl: `https://tool${i}.example.com`,
        status: "completed",
        progressPercent: 100,
        currentStep: "Build finished successfully",
        configJson: JSON.stringify(defaultConfig),
        logs: `[2026-10-2${i % 6}T10:00:00.000Z] [INFO] Completed build job\n[2026-10-2${i % 6}T10:02:00.000Z] [SUCCESS] Generated signed APK`,
        apkFileName: `com.devs.tool${i}.app-v1.0.0-release.apk`,
        apkFileSize: 1250000,
        createdAt: new Date(`2026-10-2${i % 6}T10:00:00Z`),
        completedAt: new Date(`2026-10-2${i % 6}T10:02:00Z`),
      });
    }
  } catch (err) {
    console.error("Error seeding initial builds:", err);
  }
}
