import "server-only";

import crypto from "crypto";

export const ADMIN_COOKIE = "admin_session";

type AdminAuth = {
  username: string;
  passwordHash: string;
  salt: string;
  secret: string;
};

const AUTH_KEY = "resume:adminAuth";
const BLOB_PATH = "resume/admin-auth.json";
const SUPABASE_AUTH_ID = "default";

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

function isAdminAuth(value: unknown): value is AdminAuth {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    isString(v.username) &&
    isString(v.passwordHash) &&
    isString(v.salt) &&
    isString(v.secret)
  );
}

async function readAuthFile(): Promise<AdminAuth> {
  const { promises: fs } = await import("fs");
  const path = await import("path");
  const authPath = path.join(process.cwd(), "src", "data", "admin-auth.json");
  const raw = await fs.readFile(authPath, "utf8");
  const parsed = JSON.parse(raw) as unknown;
  if (!isAdminAuth(parsed))
    throw new Error("admin-auth.json schema is invalid");
  return parsed;
}

async function writeAuthFile(next: AdminAuth): Promise<void> {
  if (!isAdminAuth(next)) throw new Error("Invalid admin auth payload");
  const { promises: fs } = await import("fs");
  const path = await import("path");
  const authPath = path.join(process.cwd(), "src", "data", "admin-auth.json");
  const dir = path.dirname(authPath);
  const tmp = path.join(dir, `.admin-auth.${Date.now()}.tmp`);
  const payload = `${JSON.stringify(next, null, 2)}\n`;
  await fs.writeFile(tmp, payload, "utf8");
  await fs.rename(tmp, authPath);
}

function base64UrlEncode(input: Buffer | string): string {
  const buf = typeof input === "string" ? Buffer.from(input, "utf8") : input;
  return buf
    .toString("base64")
    .replaceAll("=", "")
    .replaceAll("+", "-")
    .replaceAll("/", "_");
}

function base64UrlDecodeToBuffer(input: string): Buffer {
  const normalized = input.replaceAll("-", "+").replaceAll("_", "/");
  const padLen = (4 - (normalized.length % 4)) % 4;
  const padded = normalized + "=".repeat(padLen);
  return Buffer.from(padded, "base64");
}

function timingSafeEqual(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

async function hashPassword(password: string, salt: string): Promise<string> {
  const key = await new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey as Buffer);
    });
  });
  return key.toString("hex");
}

async function writeAuth(next: AdminAuth): Promise<void> {
  if (!isAdminAuth(next)) throw new Error("Invalid admin auth payload");
  if (storeMode() === "supabase") {
    const supabase = await getSupabaseAdmin();
    const { error } = await supabase.from("resume_admin_auth").upsert(
      {
        id: SUPABASE_AUTH_ID,
        username: next.username,
        password_hash: next.passwordHash,
        salt: next.salt,
        secret: next.secret,
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
    await kv.set(AUTH_KEY, next);
    return;
  }
  await writeAuthFile(next);
}

async function bootstrapAuth(): Promise<AdminAuth> {
  const username = (
    process.env.ADMIN_INIT_USERNAME ??
    process.env.ADMIN_USERNAME ??
    ""
  ).trim();
  const password = (
    process.env.ADMIN_INIT_PASSWORD ??
    process.env.ADMIN_PASSWORD ??
    ""
  ).trim();

  if (!username || !password) {
    throw new Error(
      "Admin auth belum dikonfigurasi. Set ADMIN_INIT_USERNAME dan ADMIN_INIT_PASSWORD di environment variables.",
    );
  }

  const salt = crypto.randomBytes(16).toString("hex");
  const secret = crypto.randomBytes(32).toString("hex");
  const passwordHash = await hashPassword(password, salt);
  const auth: AdminAuth = { username, passwordHash, salt, secret };
  await writeAuth(auth);
  return auth;
}

async function readAuth(): Promise<AdminAuth> {
  if (storeMode() === "supabase") {
    const supabase = await getSupabaseAdmin();
    const { data, error } = await supabase
      .from("resume_admin_auth")
      .select("username,password_hash,salt,secret")
      .eq("id", SUPABASE_AUTH_ID)
      .maybeSingle();
    if (error) throw new Error(error.message);
    const row = data as {
      username?: unknown;
      password_hash?: unknown;
      salt?: unknown;
      secret?: unknown;
    } | null;
    const mapped: AdminAuth | null = row
      ? {
          username: String(row.username ?? ""),
          passwordHash: String(row.password_hash ?? ""),
          salt: String(row.salt ?? ""),
          secret: String(row.secret ?? ""),
        }
      : null;
    if (mapped && isAdminAuth(mapped)) return mapped;
    return await bootstrapAuth();
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
      if (isAdminAuth(parsed)) return parsed;
    }
    return await bootstrapAuth();
  }

  if (storeMode() === "kv") {
    const kv = await getKvClient();
    const fromKv = await kv.get<unknown>(AUTH_KEY);
    if (isAdminAuth(fromKv)) return fromKv;
    return await bootstrapAuth();
  }

  return await readAuthFile();
}

export async function getAdminUsername(): Promise<string> {
  const auth = await readAuth();
  return auth.username;
}

export async function verifyAdminCredentials(
  username: string,
  password: string,
): Promise<boolean> {
  const auth = await readAuth();
  if (username !== auth.username) return false;
  const computed = await hashPassword(password, auth.salt);
  const a = Buffer.from(computed, "hex");
  const b = Buffer.from(auth.passwordHash, "hex");
  return timingSafeEqual(a, b);
}

type SessionPayload = {
  u: string;
  exp: number;
};

async function sign(payloadB64: string): Promise<string> {
  const auth = await readAuth();
  const mac = crypto
    .createHmac("sha256", auth.secret)
    .update(payloadB64)
    .digest();
  return base64UrlEncode(mac);
}

export async function createAdminSessionToken(
  username: string,
): Promise<string> {
  const payload: SessionPayload = {
    u: username,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 30,
  };
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const sig = await sign(payloadB64);
  return `${payloadB64}.${sig}`;
}

export async function validateAdminSessionToken(
  token: string | undefined,
): Promise<boolean> {
  if (!token) return false;
  const [payloadB64, sig] = token.split(".");
  if (!payloadB64 || !sig) return false;

  const expected = await sign(payloadB64);
  const a = Buffer.from(sig, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (!timingSafeEqual(a, b)) return false;

  let payload: SessionPayload;
  try {
    payload = JSON.parse(
      base64UrlDecodeToBuffer(payloadB64).toString("utf8"),
    ) as SessionPayload;
  } catch {
    return false;
  }

  if (!payload || typeof payload !== "object") return false;
  if (!isString(payload.u)) return false;
  if (typeof payload.exp !== "number") return false;
  if (Date.now() > payload.exp) return false;

  const auth = await readAuth();
  return payload.u === auth.username;
}

export async function setAdminPassword(newPassword: string): Promise<void> {
  const trimmed = newPassword.trim();
  if (trimmed.length < 8) {
    throw new Error("Password minimal 8 karakter");
  }

  const auth = await readAuth();
  const salt = crypto.randomBytes(16).toString("hex");
  const secret = crypto.randomBytes(32).toString("hex");
  const passwordHash = await hashPassword(trimmed, salt);

  await writeAuth({
    username: auth.username,
    passwordHash,
    salt,
    secret,
  });
}

export async function changeAdminPassword(params: {
  username: string;
  oldPassword: string;
  newPassword: string;
}): Promise<void> {
  const { username, oldPassword, newPassword } = params;
  const trimmed = newPassword.trim();
  if (trimmed.length < 8) {
    throw new Error("Password minimal 8 karakter");
  }

  const auth = await readAuth();
  if (username !== auth.username) {
    throw new Error("Unauthorized");
  }

  const oldComputed = await hashPassword(oldPassword, auth.salt);
  const a = Buffer.from(oldComputed, "hex");
  const b = Buffer.from(auth.passwordHash, "hex");
  if (!timingSafeEqual(a, b)) {
    throw new Error("Password lama salah");
  }

  const salt = crypto.randomBytes(16).toString("hex");
  const secret = crypto.randomBytes(32).toString("hex");
  const passwordHash = await hashPassword(trimmed, salt);

  await writeAuth({
    username: auth.username,
    passwordHash,
    salt,
    secret,
  });
}
