import { randomBytes, randomInt, scrypt, timingSafeEqual } from "node:crypto";

/** scrypt (built into Node): stored as "scrypt$N$r$p$salt$hash" so parameters can be raised later. */
const N = 2 ** 15;
const r = 8;
const p = 1;
const KEYLEN = 64;

function derive(password: string, salt: Buffer, n: number, rr: number, pp: number): Promise<Buffer> {
  return new Promise((resolve, reject) =>
    scrypt(password.normalize("NFKC"), salt, KEYLEN, { N: n, r: rr, p: pp, maxmem: 128 * n * rr * 2 }, (err, key) =>
      err ? reject(err) : resolve(key),
    ),
  );
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await derive(password, salt, N, r, p);
  return ["scrypt", N, r, p, salt.toString("base64url"), key.toString("base64url")].join("$");
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algo, n, rr, pp, salt, hash] = stored.split("$");
  if (algo !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64url");
  const key = await derive(password, Buffer.from(salt, "base64url"), Number(n), Number(rr), Number(pp));
  return key.length === expected.length && timingSafeEqual(key, expected);
}

/** Hash used when the email doesn't exist, so a wrong email takes as long as a wrong password. */
export const dummyHash = await hashPassword(randomBytes(16).toString("hex"));

/** Password rule for dashboard accounts (owner's rule): at least 12 characters, with letters, numbers and symbols. */
export const MIN_PASSWORD = 12;

/** Returns null when the password follows the rule, otherwise which part is missing. */
export function passwordProblem(password: string): "length" | "letter" | "number" | "symbol" | null {
  if (password.length < MIN_PASSWORD) return "length";
  if (!/\p{L}/u.test(password)) return "letter";
  if (!/\p{N}/u.test(password)) return "number";
  if (!/[^\p{L}\p{N}\s]/u.test(password)) return "symbol";
  return null;
}

/** A random password that follows the rule (for a first login; the user changes it in the dashboard). */
export function randomPassword(length = MIN_PASSWORD): string {
  const sets = ["ABCDEFGHJKLMNPQRSTUVWXYZ", "abcdefghijkmnopqrstuvwxyz", "23456789", "!@#$%&*?-_+="];
  const all = sets.join("");
  const pick = (chars: string) => chars[randomInt(chars.length)];
  // One from each set, the rest from all, then shuffle
  const chars = [...sets.map(pick), ...Array.from({ length: length - sets.length }, () => pick(all))];
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}
