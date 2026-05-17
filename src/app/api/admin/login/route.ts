import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  createAdminSessionToken,
  verifyAdminCredentials,
} from "@/data/admin-auth-store";

export const runtime = "nodejs";

function getRedirectUrl(request: Request, pathname: string): URL {
  return new URL(pathname, request.url);
}

export async function POST(request: Request) {
  let username = "";
  let password = "";

  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = (await request.json().catch(() => null)) as
      | { username?: unknown; password?: unknown }
      | null;
    username = typeof body?.username === "string" ? body.username : "";
    password = typeof body?.password === "string" ? body.password : "";
  } else {
    const form = await request.formData();
    username = typeof form.get("username") === "string" ? (form.get("username") as string) : "";
    password = typeof form.get("password") === "string" ? (form.get("password") as string) : "";
  }

  const ok = await verifyAdminCredentials(username, password);
  if (!ok) {
    return NextResponse.redirect(getRedirectUrl(request, "/admin/login?error=1"));
  }

  const token = await createAdminSessionToken(username);
  const res = NextResponse.redirect(getRedirectUrl(request, "/admin"));
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}

