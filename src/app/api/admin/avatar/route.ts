import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  ADMIN_COOKIE,
  validateAdminSessionToken,
} from "@/data/admin-auth-store";
import { getProfile, saveProfile } from "@/data/profile-store";

export const runtime = "nodejs";

const SUPABASE_BUCKET_ID = "resume";
const MAX_IMAGE_BYTES = 4_000_000;

async function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase belum dikonfigurasi. Set SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY.",
    );
  }
  const mod = await import("@supabase/supabase-js");
  return mod.createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function ensureSupabaseBucket() {
  const supabase = await getSupabaseAdmin();
  const buckets = await supabase.storage.listBuckets();
  if (buckets.error) throw new Error(buckets.error.message);

  const existing = buckets.data?.find((b) => b.id === SUPABASE_BUCKET_ID);
  if (!existing) {
    const created = await supabase.storage.createBucket(SUPABASE_BUCKET_ID, {
      public: true,
      fileSizeLimit: MAX_IMAGE_BYTES,
      allowedMimeTypes: ["image/*"],
    });
    if (created.error) throw new Error(created.error.message);
  } else if (existing.public === false) {
    const updated = await supabase.storage.updateBucket(SUPABASE_BUCKET_ID, {
      public: true,
      fileSizeLimit: MAX_IMAGE_BYTES,
      allowedMimeTypes: ["image/*"],
    });
    if (updated.error) throw new Error(updated.error.message);
  }

  return supabase;
}

function extFromContentType(type: string): string | null {
  const t = type.toLowerCase();
  if (t === "image/jpeg") return "jpg";
  if (t === "image/png") return "png";
  if (t === "image/webp") return "webp";
  return null;
}

function sanitizeExt(ext: string | null): string {
  if (!ext) return "jpg";
  const clean = ext.toLowerCase().replaceAll(/[^a-z0-9]/g, "");
  if (clean === "jpg" || clean === "jpeg") return "jpg";
  if (clean === "png") return "png";
  if (clean === "webp") return "webp";
  return "jpg";
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE)?.value;
    const ok = await validateAdminSessionToken(token);
    if (!ok) {
      return Response.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return Response.json(
        { ok: false, error: "File tidak ditemukan" },
        { status: 400 },
      );
    }

    if (!file.type.toLowerCase().startsWith("image/")) {
      return Response.json(
        { ok: false, error: "File harus gambar" },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_IMAGE_BYTES) {
      return Response.json(
        { ok: false, error: "Ukuran gambar maksimal 4MB" },
        { status: 400 },
      );
    }

    const ext = sanitizeExt(extFromContentType(file.type));
    const filename = `avatar-${Date.now()}.${ext}`;

    let avatarUrl = "";
    const useSupabase =
      process.env.RESUME_STORE === "supabase" ||
      (!process.env.RESUME_STORE &&
        Boolean(
          process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
        ));
    const useBlob =
      process.env.RESUME_STORE === "blob" ||
      (!process.env.RESUME_STORE && Boolean(process.env.BLOB_READ_WRITE_TOKEN));

    if (useSupabase) {
      const supabase = await ensureSupabaseBucket();
      const objectPath = `avatar/${filename}`;
      const { error } = await supabase.storage
        .from(SUPABASE_BUCKET_ID)
        .upload(objectPath, Buffer.from(arrayBuffer), {
          contentType: file.type,
          upsert: true,
        });
      if (error) throw new Error(error.message);
      const { data } = supabase.storage
        .from(SUPABASE_BUCKET_ID)
        .getPublicUrl(objectPath);
      if (!data.publicUrl) throw new Error("Gagal mendapatkan public URL");
      avatarUrl = data.publicUrl;
    } else if (useBlob) {
      const mod = await import("@vercel/blob");
      const result = await mod.put(
        `resume/${filename}`,
        Buffer.from(arrayBuffer),
        {
          access: "public",
          addRandomSuffix: false,
          contentType: file.type,
        },
      );
      avatarUrl = result.url;
    } else {
      const { promises: fs } = await import("fs");
      const path = await import("path");
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(uploadDir, { recursive: true });
      const outPath = path.join(uploadDir, filename);
      await fs.writeFile(outPath, Buffer.from(arrayBuffer));
      avatarUrl = `/uploads/${filename}`;
    }

    const profile = await getProfile();
    await saveProfile({ ...profile, avatarUrl });
    revalidatePath("/");
    revalidatePath("/print");

    return Response.json({ ok: true, avatarUrl });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Gagal upload";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
