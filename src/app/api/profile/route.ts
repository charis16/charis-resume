import { type ProfileData } from "@/data/profile";
import { getProfile, saveProfile } from "@/data/profile-store";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, validateAdminSessionToken } from "@/data/admin-auth-store";

export const runtime = "nodejs";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  const ok = await validateAdminSessionToken(token);
  if (!ok) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const profile = await getProfile();
  return Response.json(profile);
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  const ok = await validateAdminSessionToken(token);
  if (!ok) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = (await request.json()) as unknown;
    await saveProfile(payload as ProfileData);
    revalidatePath("/");
    revalidatePath("/print");
    return Response.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid payload";
    return Response.json({ ok: false, error: message }, { status: 400 });
  }
}
