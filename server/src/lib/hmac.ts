import { createHmac } from 'node:crypto'

const UNSUB_SECRET = process.env.UNSUB_SECRET ?? process.env.JWT_SECRET ?? 'unsub-dev-secret'

/** Generate a short HMAC-SHA256 token for an email address. */
export function unsubToken(email: string): string {
  return createHmac('sha256', UNSUB_SECRET).update(email.toLowerCase()).digest('hex').slice(0, 32)
}

/** Generate a cancellation token for a reservation (id + email). */
export function cancelReservationToken(id: number, email: string): string {
  return createHmac('sha256', UNSUB_SECRET).update(`cancel:${id}:${email.toLowerCase()}`).digest('hex').slice(0, 32)
}

/** Constant-time compare to avoid timing attacks. */
function timingSafeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  return require('node:crypto').timingSafeEqual(Buffer.from(a), Buffer.from(b))
}

export function verifyUnsubToken(email: string, token: string): boolean {
  return timingSafeCompare(unsubToken(email), token)
}

export function verifyCancelReservationToken(id: number, email: string, token: string): boolean {
  return timingSafeCompare(cancelReservationToken(id, email), token)
}
