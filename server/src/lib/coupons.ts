import { db } from '../db/client'
import { coupons } from '../db/schema'

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function generateCouponCode(): string {
  let code = 'MP-'
  for (let i = 0; i < 6; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)]
  }
  return code
}

export async function createWelcomeCoupon(email: string, contactId?: number | null): Promise<string> {
  const code = generateCouponCode()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 90)

  await db.insert(coupons).values({
    code,
    type: 'welcome',
    discountType: 'fixed',
    discountValue: '5.00',
    minPurchase: '40.00',
    description: '$5 off your order of $40+',
    subscriberEmail: email.toLowerCase(),
    contactId: contactId ?? undefined,
    expiresAt,
  })

  return code
}
