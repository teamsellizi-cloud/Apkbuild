import { NextResponse } from "next/server";
import { verifyGitHubConfig } from "@/lib/github-actions";
import { db } from "@/db";
import { appSettings } from "@/db/schema";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let token = body.token;
    const repo = body.repo;
    const workflow = body.workflow || "apk-builder.yml";

    // If token wasn't sent in body, read from db
    if (!token) {
      const settings = await db.select().from(appSettings).limit(1);
      token = settings[0]?.githubToken;
    }

    if (!token || !repo) {
      return NextResponse.json({
        valid: false,
        message: "Both GitHub Personal Access Token and Repository (owner/repo) are required.",
      });
    }

    const check = await verifyGitHubConfig({
      token,
      repo,
      workflow,
    });

    return NextResponse.json(check);
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({
      valid: false,
      message: `Failed to test GitHub connection: ${error.message}`,
    });
  }
}
