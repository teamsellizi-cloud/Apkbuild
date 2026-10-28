import { NextResponse } from "next/server";
import { analyzePWA } from "@/lib/pwa-analyzer";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const analysis = await analyzePWA(url);
    return NextResponse.json({ success: true, analysis });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message || "Failed to analyze PWA" }, { status: 500 });
  }
}
