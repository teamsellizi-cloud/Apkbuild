export type BuildType = "website" | "zip" | "pwa";

export type BuildStatus =
  | "pending"
  | "validating"
  | "preparing"
  | "building"
  | "signing"
  | "completed"
  | "failed"
  | "cancelled";

export interface AndroidPermissions {
  internet: boolean;
  camera: boolean;
  geolocation: boolean;
  storage: boolean;
  microphone: boolean;
  notifications: boolean;
  biometrics: boolean;
}

export interface AppCustomization {
  appName: string;
  packageId: string;
  versionName: string;
  versionCode: number;
  iconDataUrl?: string;
  iconName?: string;
  splashBgColor: string;
  splashShowSpinner: boolean;
  splashDurationMs: number;
  statusBarColor: string;
  navBarColor: string;
  themeColor: string;
  orientation: "default" | "portrait" | "landscape" | "sensorPortrait";
  fullscreen: boolean;
  cleartextTraffic: boolean;
  customUserAgent?: string;
  permissions: AndroidPermissions;
  // TWA specific
  enableAssetLinks?: boolean;
  assetLinksDomain?: string;
  fallbackToCapacitorIfTwaFails?: boolean;
}

export interface PWAManifestCheck {
  url: string;
  hasManifest: boolean;
  manifestUrl?: string;
  name?: string;
  shortName?: string;
  startUrl?: string;
  display?: string;
  themeColor?: string;
  backgroundColor?: string;
  iconsCount: number;
  has512Icon: boolean;
  hasMaskableIcon: boolean;
  iconLargestUrl?: string;
  hasServiceWorker: boolean;
  serviceWorkerUrl?: string;
  isTwaReady: boolean;
  issues: string[];
  warnings: string[];
  manifestData?: Record<string, unknown>;
}

export interface ZipAnalysisResult {
  fileName: string;
  fileSize: number;
  fileCount: number;
  isSafe: boolean;
  hasIndexHtml: boolean;
  indexPath?: string;
  hasPackageJson: boolean;
  packageManager: "npm" | "yarn" | "pnpm" | "none";
  frameworkDetected?: string; // e.g. 'Vite', 'Next.js Static Export', 'React', 'Vue', 'Pure HTML/JS'
  buildScriptDetected: boolean;
  buildCommand?: string;
  distDirDetected?: string;
  error?: string;
  fileTree: string[];
}

export interface BuildLogEntry {
  timestamp: string;
  level: "info" | "warn" | "error" | "success" | "step";
  message: string;
}

export interface GitHubConfig {
  token?: string;
  repo?: string; // "owner/repo"
  branch?: string;
  workflow?: string;
}

export interface RunnerSettings {
  githubToken?: string;
  githubRepo?: string;
  githubBranch: string;
  githubWorkflow: string;
  runnerMode: "auto" | "github_actions" | "in_app";
  keystoreAlias?: string;
  keystoreFingerprint?: string;
  keystoreConfigured: boolean;
  retentionDays: number;
}
