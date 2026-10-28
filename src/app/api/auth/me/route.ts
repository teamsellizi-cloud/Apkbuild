import { NextResponse } from "next/server";
import { clearSessionCookie, getCurrentUser, ensureDefaultUserAndSettings } from "@/lib/auth";

export async function POST() {
  await clearSessionCookie();
  return NextResponse.json({ success: true });
}

export async function GET() {
  await ensureDefaultUserAndSettings();
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }
  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.userId,
      email: user.email,
    },
  });
}
