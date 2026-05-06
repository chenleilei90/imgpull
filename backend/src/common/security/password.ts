import { pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto";

const ITERATIONS = 210_000;
const KEY_LENGTH = 32;
const DIGEST = "sha256";
const PREFIX = "pbkdf2_sha256";

export function createPasswordHash(credential: string): string {
  const salt = randomBytes(16).toString("base64url");
  const hash = pbkdf2Sync(credential, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString("base64url");
  return `${PREFIX}$${ITERATIONS}$${salt}$${hash}`;
}

export function verifyPasswordHash(credential: string, storedHash: string): boolean {
  const [prefix, iterationsText, salt, expectedHash] = storedHash.split("$");
  if (prefix !== PREFIX || !iterationsText || !salt || !expectedHash) {
    return false;
  }

  const iterations = Number(iterationsText);
  if (!Number.isInteger(iterations) || iterations <= 0) {
    return false;
  }

  const actual = Buffer.from(pbkdf2Sync(credential, salt, iterations, KEY_LENGTH, DIGEST).toString("base64url"));
  const expected = Buffer.from(expectedHash);
  if (actual.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(actual, expected);
}
