import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, sessionMatches } from "@/lib/auth";

export async function GET() {
  const jar = await cookies();
  const ok = sessionMatches(jar.get(ADMIN_COOKIE)?.value);
  return NextResponse.json({ ok });
}
