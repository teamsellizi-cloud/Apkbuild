import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users, appSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

const JWT_SECRET = process.env.JWT_SECRET || "apk-builder-super-secret-key-2026-secure";
const SESSION_COOKIE_NAME = "apk_builder_session";

export interface UserPayload {
  userId: string;
  email: string;
}

export function createToken(payload: UserPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
}

export function verifyToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserPayload;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function getCurrentUser(): Promise<UserPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function ensureDefaultUserAndSettings() {
  try {
    // Check if any user exists
    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length === 0) {
      const defaultEmail = process.env.ADMIN_EMAIL || "developer@apkbuilder.dev";
      const defaultPassword = process.env.ADMIN_PASSWORD || "devbuilder2026";
      const hashedPassword = await hashPassword(defaultPassword);

      await db.insert(users).values({
        id: "usr_admin_001",
        email: defaultEmail,
        passwordHash: hashedPassword,
      });
    }

    // Check if app settings exist
    const existingSettings = await db.select().from(appSettings).limit(1);
    if (existingSettings.length === 0) {
      await db.insert(appSettings).values({
        id: "default",
        githubToken: process.env.GITHUB_TOKEN || "",
        githubRepo: process.env.GITHUB_REPO || "",
        githubBranch: "main",
        githubWorkflow: "apk-builder.yml",
        runnerMode: "auto",
        keystoreAlias: "apkbuilder-release-key",
        keystoreFingerprint: "SHA256: 4A:91:8C:F2:7E:11:33:9A:88:B5:C2:E1:90:3A:42:F1:C9:88:12:34:56:78:90:AB:CD:EF:01:23:45:67:89:01",
        keystoreConfigured: false,
        retentionDays: 14,
        callbackSecret: "secret_callback_" + Math.random().toString(36).substring(2, 15),
      });
    }
  } catch (err) {
    console.error("Error in ensureDefaultUserAndSettings:", err);
  }
}
