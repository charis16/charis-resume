import "server-only";

import { type ProfileData } from "@/data/profile";
import defaultProfile from "@/data/profile.store.json";

const STORE_KEY = "resume:profile";
const BLOB_PATH = "resume/profile.json";

const SUPABASE_PROFILE_ID = "default";

type StoreMode = "file" | "blob" | "kv" | "supabase";

function storeMode(): StoreMode {
  const mode = process.env.RESUME_STORE;
  if (
    mode === "file" ||
    mode === "blob" ||
    mode === "kv" ||
    mode === "supabase"
  )
    return mode;
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
    return "supabase";
  if (process.env.BLOB_READ_WRITE_TOKEN) return "blob";
  if (process.env.KV_REST_API_URL) return "kv";
  return "file";
}

async function getKvClient() {
  const mod = await import("@vercel/kv");
  return mod.kv;
}

async function getBlobClient() {
  const mod = await import("@vercel/blob");
  return { get: mod.get, put: mod.put };
}

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

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isProfileData(value: unknown): value is ProfileData {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;

  const summary = v.summary as unknown;
  const about = v.about as unknown;
  const links = v.links as unknown;
  const skills = v.skills as unknown;
  const experience = v.experience as unknown;
  const certifications = v.certifications as unknown;
  const education = v.education as unknown;
  const projects = v.projects as unknown;

  if (!isString(v.name)) return false;
  if (!isString(v.headline)) return false;
  if (!isString(v.location)) return false;

  if (!summary || typeof summary !== "object") return false;
  const s = summary as Record<string, unknown>;
  if (!isString(s.id) || !isString(s.en)) return false;

  if (!about || typeof about !== "object") return false;
  const a = about as Record<string, unknown>;
  if (!isString(a.id) || !isString(a.en)) return false;

  if (!Array.isArray(links)) return false;
  if (!Array.isArray(skills) || !skills.every((x) => typeof x === "string"))
    return false;

  if (!Array.isArray(experience)) return false;
  if (!Array.isArray(certifications)) return false;
  if (!Array.isArray(education)) return false;
  if (!Array.isArray(projects)) return false;

  return true;
}

async function readJsonFile(): Promise<unknown> {
  const { promises: fs } = await import("fs");
  const path = await import("path");
  const storePath = path.join(
    process.cwd(),
    "src",
    "data",
    "profile.store.json",
  );
  const raw = await fs.readFile(storePath, "utf8");
  return JSON.parse(raw) as unknown;
}

async function writeJsonFile(value: unknown): Promise<void> {
  const { promises: fs } = await import("fs");
  const path = await import("path");
  const storePath = path.join(
    process.cwd(),
    "src",
    "data",
    "profile.store.json",
  );
  const dir = path.dirname(storePath);
  const tmp = path.join(dir, `.profile.store.${Date.now()}.tmp`);
  const payload = `${JSON.stringify(value, null, 2)}\n`;
  await fs.writeFile(tmp, payload, "utf8");
  await fs.rename(tmp, storePath);
}

export async function getProfile(): Promise<ProfileData> {
  if (storeMode() === "supabase") {
    const supabase = await getSupabaseAdmin();
    const { data, error } = await supabase
      .from("resume_profile")
      .select("data")
      .eq("id", SUPABASE_PROFILE_ID)
      .maybeSingle();
    if (error) throw new Error(error.message);
    const stored = data?.data as unknown;
    if (isProfileData(stored)) return stored;

    if (isProfileData(defaultProfile)) {
      const { error: upsertError } = await supabase
        .from("resume_profile")
        .upsert(
          {
            id: SUPABASE_PROFILE_ID,
            data: defaultProfile,
          },
          { onConflict: "id" },
        );
      if (upsertError) throw new Error(upsertError.message);
      return defaultProfile;
    }
    throw new Error("profile.store.json schema is invalid");
  }

  if (storeMode() === "blob") {
    const blob = await getBlobClient();
    const res = await blob.get(BLOB_PATH, {
      access: "private",
      useCache: false,
    });
    if (res?.stream) {
      const text = await new Response(res.stream).text();
      const parsed = JSON.parse(text) as unknown;
      if (isProfileData(parsed)) return parsed;
    }
    if (isProfileData(defaultProfile)) {
      await blob.put(
        BLOB_PATH,
        `${JSON.stringify(defaultProfile, null, 2)}\n`,
        {
          access: "private",
          addRandomSuffix: false,
          allowOverwrite: true,
          contentType: "application/json",
        },
      );
      return defaultProfile;
    }
    throw new Error("profile.store.json schema is invalid");
  }

  if (storeMode() === "kv") {
    const kv = await getKvClient();
    const fromKv = await kv.get<unknown>(STORE_KEY);
    if (isProfileData(fromKv)) return fromKv;
    if (isProfileData(defaultProfile)) {
      await kv.set(STORE_KEY, defaultProfile);
      return defaultProfile;
    }
    throw new Error("profile.store.json schema is invalid");
  }
  const data = await readJsonFile();
  if (!isProfileData(data))
    throw new Error("profile.store.json schema is invalid");
  return data;
}

export async function saveProfile(next: ProfileData): Promise<void> {
  if (!isProfileData(next)) {
    throw new Error("Invalid profile payload");
  }
  if (storeMode() === "supabase") {
    const supabase = await getSupabaseAdmin();
    const { error } = await supabase.from("resume_profile").upsert(
      {
        id: SUPABASE_PROFILE_ID,
        data: next,
      },
      { onConflict: "id" },
    );
    if (error) throw new Error(error.message);
    return;
  }
  if (storeMode() === "blob") {
    const blob = await getBlobClient();
    await blob.put(BLOB_PATH, `${JSON.stringify(next, null, 2)}\n`, {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
    });
    return;
  }
  if (storeMode() === "kv") {
    const kv = await getKvClient();
    await kv.set(STORE_KEY, next);
    return;
  }
  await writeJsonFile(next);
}
