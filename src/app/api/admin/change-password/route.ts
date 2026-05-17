import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ADMIN_COOKIE,
  createAdminSessionToken,
  validateAdminSessionToken,
  getAdminUsername,
  setAdminPassword,
} from "@/data/admin-auth-store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  const ok = await validateAdminSessionToken(token);
  if (!ok) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  let newPassword = "";
  let confirmPassword = "";

  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = (await request.json().catch(() => null)) as
      | { newPassword?: unknown; confirmPassword?: unknown }
      | null;
    newPassword = typeof body?.newPassword === "string" ? body.newPassword : "";
    confirmPassword =
      typeof body?.confirmPassword === "string" ? body.confirmPassword : "";
  } else {
    const form = await request.formData();
    newPassword = typeof form.get("newPassword") === "string" ? (form.get("newPassword") as string) : "";
    confirmPassword =
      typeof form.get("confirmPassword") === "string"
        ? (form.get("confirmPassword") as string)
        : "";
  }

  if (!newPassword || !confirmPassword) {
    return NextResponse.redirect(
      new URL("/admin/settings?error=Field%20tidak%20lengkap", request.url),
    );
  }
  if (newPassword.trim() !== confirmPassword.trim()) {
    return NextResponse.redirect(
      new URL("/admin/settings?error=Konfirmasi%20password%20tidak%20sama", request.url),
    );
  }

  try {
    const username = await getAdminUsername();
    await setAdminPassword(newPassword);
    const nextToken = await createAdminSessionToken(username);
    const res = NextResponse.redirect(new URL("/admin/settings?success=1", request.url));
    res.cookies.set(ADMIN_COOKIE, nextToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  } catch (e) {
    const message = e instanceof Error ? e.message : "Gagal mengganti password";
    return NextResponse.redirect(
      new URL(`/admin/settings?error=${encodeURIComponent(message)}`, request.url),
    );
  }
}
