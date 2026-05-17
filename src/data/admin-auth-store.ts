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

export async function getAdminUsername(): Promise<string> {
  const auth = await readAuth();
  return auth.username;
}

async function writeAuthFile(next: AdminAuth): Promise<void> {
  if (!isAdminAuth(next)) {
    throw new Error("Invalid admin auth payload");
  }
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
  if (isKvEnabled()) {
    const kv = await getKvClient();
    const fromKv = await kv.get<unknown>(AUTH_KEY);
    if (isAdminAuth(fromKv)) return fromKv;
    return await bootstrapAuth();
  }
  return await readAuthFile();
}

async function writeAuth(next: AdminAuth): Promise<void> {
  if (!isAdminAuth(next)) throw new Error("Invalid admin auth payload");
  if (isKvEnabled()) {
    const kv = await getKvClient();
    await kv.set(AUTH_KEY, next);
    return;
  }
  await writeAuthFile(next);
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
