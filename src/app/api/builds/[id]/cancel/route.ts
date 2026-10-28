import { NextResponse } from "next/server";
import { db } from "@/db";
import { builds } from "@/db/schema";
import { eq } from "drizzle-orm";

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
    if (build.status === "completed" || build.status === "failed") {
      return NextResponse.json({ error: "Cannot cancel a finished build." }, { status: 400 });
    }

    const updatedLogs = `${build.logs}\n[${new Date().toISOString()}] [WARN] Build cancelled by user.\n`;

    await db
      .update(builds)
      .set({
        status: "cancelled",
        currentStep: "Build cancelled by user",
        logs: updatedLogs,
        updatedAt: new Date(),
      })
      .where(eq(builds.id, id));

    return NextResponse.json({ success: true, message: "Build cancelled" });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message || "Failed to cancel build" }, { status: 500 });
  }
}
