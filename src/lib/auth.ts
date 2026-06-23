import "server-only";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

/**
 * Lightweight admin auth for the curated-marketplace MVP.
 *
 * The password lives only in the server environment (ADMIN_PASSWORD). On login
 * we set an httpOnly, signed cookie — nothing sensitive is ever exposed to the
 * client, and the cookie can't be forged without ADMIN_SECRET. When Supabase
 * Auth is introduced this is the single module to swap.
 */

const COOKIE = "fg_admin";

function secret(): string {
  return process.env.ADMIN_SECRET ?? "farmgate-dev-secret-change-me";
}

function adminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? "FarmGate2026!";
}

function sign(value: string): string {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

/** Returns the signed token value for a valid password, or null. */
export function tokenFor(password: string): string | null {
  if (!safeEqual(password, adminPassword())) return null;
  const issued = String(Date.now());
  return `${issued}.${sign(issued)}`;
}

export async function setAdminCookie(token: string): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
  });
}

export async function clearAdminCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  if (!raw) return false;
  const [issued, sig] = raw.split(".");
  if (!issued || !sig) return false;
  return safeEqual(sig, sign(issued));
}
