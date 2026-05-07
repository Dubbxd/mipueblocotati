import { createHmac } from 'node:crypto'

const UNSUB_SECRET = process.env.UNSUB_SECRET ?? process.env.JWT_SECRET ?? 'unsub-dev-secret'

/** Generate a short HMAC-SHA256 token for an email address. */
export function unsubToken(email: string): string {
  return createHmac('sha256', UNSUB_SECRET).update(email.toLowerCase()).digest('hex').slice(0, 32)
}

/** Constant-time compare to avoid timing attacks. */
export function verifyUnsubToken(email: string, token: string): boolean {
  const expected = unsubToken(email)
  if (expected.length !== token.length) return false
  // Use crypto.timingSafeEqual via Buffer
  return require('node:crypto').timingSafeEqual(Buffer.from(expected), Buffer.from(token))
}
