import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { comparePassword, createToken, ensureDefaultUserAndSettings, setSessionCookie } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await ensureDefaultUserAndSettings();
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const matchedUsers = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim())).limit(1);

    if (matchedUsers.length === 0) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const user = matchedUsers[0];
    const isPasswordValid = await comparePassword(password, user.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const token = createToken({ userId: user.id, email: user.email });
    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message || "Login failed" }, { status: 500 });
  }
}
