import "server-only";
import { cookies } from "next/headers";

/** Server-side calls from the dashboard to the API, forwarding the user's session cookie. */
const apiUrl = process.env.API_URL ?? "http://localhost:4000";
const SESSION_COOKIE = "bov_session";

export type Role = "admin" | "editor";
export type User = { id: string; email: string; name: string; role: Role };

export async function apiGet<T>(path: string): Promise<{ status: number; data: T | null }> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return { status: 401, data: null };
  try {
    const res = await fetch(`${apiUrl}${path}`, { headers: { cookie: `${SESSION_COOKIE}=${token}` }, cache: "no-store" });
    return { status: res.status, data: res.ok ? ((await res.json()) as T) : null };
  } catch {
    // API down: treat as a server error, not as "signed out"
    return { status: 503, data: null };
  }
}

/** The signed-in user, or null. */
export async function getCurrentUser(): Promise<User | null> {
  const { data } = await apiGet<{ user: User }>("/auth/me");
  return data?.user ?? null;
}
