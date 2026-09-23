import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import type { SessionPayload } from "@/lib/auth/types";

/**
 * Session stateless (JWT HS256), ditandatangani SESSION_SECRET.
 * Empat langkah rekomendasi docs Next.js untuk stateless session
 * (authentication → session management → stateless sessions).
 */
const COOKIE_NAME = "session";
const SESSION_MAX_AGE_SECONDS = 60 * 60; // 1 jam

const secretKey = process.env.SESSION_SECRET;
if (!secretKey) {
  throw new Error("SESSION_SECRET belum diatur. Salin .env.example ke .env.local dan isi nilainya.");
}
const encodedKey = new TextEncoder().encode(secretKey);

export async function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`).sign(encodedKey);
}

export async function decrypt(sessionToken: string | undefined): Promise<SessionPayload | null> {
  if (!sessionToken) return null;

  try {
    const { payload } = await jwtVerify(sessionToken, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  return decrypt(cookieStore.get(COOKIE_NAME)?.value);
}

export async function createSession(userId: string): Promise<void> {
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
  const sessionToken = await encrypt({ userId, expiresAt });

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/** Perpanjang umur session setiap pengguna masih aktif. */
export async function refreshSession(): Promise<void> {
  const session = await getSession();
  if (!session?.userId) return;

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(COOKIE_NAME)?.value;
  if (!sessionToken) return;

  cookieStore.set(COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}
