import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, sessionMatches } from "@/lib/auth";
import { readContent, sanitizeContent, writeContent } from "@/lib/content";
import { saveContentToGithub } from "@/lib/github";

async function requireAdmin() {
  const jar = await cookies();
  if (!sessionMatches(jar.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  return null;
}

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  return NextResponse.json(readContent());
}

export async function PUT(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const content = sanitizeContent(await request.json());
    if (process.env.VERCEL) {
      if (!process.env.GITHUB_TOKEN) {
        return NextResponse.json(
          { error: "GITHUB_TOKEN is not set on Vercel, so this deploy cannot store edits." },
          { status: 500 },
        );
      }
      await saveContentToGithub(content);
      return NextResponse.json({
        ok: true,
        mode: "github",
        message: "Saved to GitHub. Vercel will redeploy, and the live site updates in about a minute.",
      });
    }
    writeContent(content);
    return NextResponse.json({
      ok: true,
      mode: "local",
      message: "Saved on this machine. Refresh the site to see it.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
