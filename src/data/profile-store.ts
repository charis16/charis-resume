import "server-only";

import { type ProfileData } from "@/data/profile";
import defaultProfile from "@/data/profile.store.json";

const STORE_KEY = "resume:profile";

function isKvEnabled(): boolean {
  if (process.env.RESUME_STORE === "file") return false;
  if (process.env.RESUME_STORE === "kv") return true;
  return Boolean(process.env.KV_REST_API_URL);
}

async function getKvClient() {
  const mod = await import("@vercel/kv");
  return mod.kv;
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
  if (!Array.isArray(skills) || !skills.every((x) => typeof x === "string")) return false;

  if (!Array.isArray(experience)) return false;
  if (!Array.isArray(certifications)) return false;
  if (!Array.isArray(education)) return false;
  if (!Array.isArray(projects)) return false;

  return true;
}

async function readJsonFile(): Promise<unknown> {
  const { promises: fs } = await import("fs");
  const path = await import("path");
  const storePath = path.join(process.cwd(), "src", "data", "profile.store.json");
  const raw = await fs.readFile(storePath, "utf8");
  return JSON.parse(raw) as unknown;
}

async function writeJsonFile(value: unknown): Promise<void> {
  const { promises: fs } = await import("fs");
  const path = await import("path");
  const storePath = path.join(process.cwd(), "src", "data", "profile.store.json");
  const dir = path.dirname(storePath);
  const tmp = path.join(dir, `.profile.store.${Date.now()}.tmp`);
  const payload = `${JSON.stringify(value, null, 2)}\n`;
  await fs.writeFile(tmp, payload, "utf8");
  await fs.rename(tmp, storePath);
}

export async function getProfile(): Promise<ProfileData> {
  if (isKvEnabled()) {
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
  if (!isProfileData(data)) throw new Error("profile.store.json schema is invalid");
  return data;
}

export async function saveProfile(next: ProfileData): Promise<void> {
  if (!isProfileData(next)) {
    throw new Error("Invalid profile payload");
  }
  if (isKvEnabled()) {
    const kv = await getKvClient();
    await kv.set(STORE_KEY, next);
    return;
  }
  await writeJsonFile(next);
}
