import "server-only";

import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

export const ADMIN_COOKIE = "admin_session";

type AdminAuth = {
  username: string;
  passwordHash: string;
  salt: string;
  secret: string;
};

const AUTH_PATH = path.join(process.cwd(), "src", "data", "admin-auth.json");

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
  const raw = await fs.readFile(AUTH_PATH, "utf8");
  const parsed = JSON.parse(raw) as unknown;
  if (!isAdminAuth(parsed)) {
    throw new Error("admin-auth.json schema is invalid");
  }
  return parsed;
}

export async function getAdminUsername(): Promise<string> {
  const auth = await readAuthFile();
  return auth.username;
}

async function writeAuthFile(next: AdminAuth): Promise<void> {
  if (!isAdminAuth(next)) {
    throw new Error("Invalid admin auth payload");
  }
  const dir = path.dirname(AUTH_PATH);
  const tmp = path.join(dir, `.admin-auth.${Date.now()}.tmp`);
  const payload = `${JSON.stringify(next, null, 2)}\n`;
  await fs.writeFile(tmp, payload, "utf8");
  await fs.rename(tmp, AUTH_PATH);
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

export async function verifyAdminCredentials(
  username: string,
  password: string,
): Promise<boolean> {
  const auth = await readAuthFile();
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
  const auth = await readAuthFile();
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

  const auth = await readAuthFile();
  return payload.u === auth.username;
}

export async function setAdminPassword(newPassword: string): Promise<void> {
  const trimmed = newPassword.trim();
  if (trimmed.length < 8) {
    throw new Error("Password minimal 8 karakter");
  }

  const auth = await readAuthFile();
  const salt = crypto.randomBytes(16).toString("hex");
  const secret = crypto.randomBytes(32).toString("hex");
  const passwordHash = await hashPassword(trimmed, salt);

  await writeAuthFile({
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

  const auth = await readAuthFile();
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

  await writeAuthFile({
    username: auth.username,
    passwordHash,
    salt,
    secret,
  });
}
