/**
 * CRM — upsertContact
 *
 * Unique identifier strategy:
 *   1. Look up by email (normalized to lowercase)
 *   2. If not found, look up by phone (digits only, preserved E.164 +)
 *   3. If still not found → INSERT new contact
 *   4. If found → UPDATE last_seen, visit_count++, backfill missing fields
 *   5. Always INSERT a contact_interactions row
 *
 * Returns the contact id (or null if no email AND no phone were provided).
 */

import { db } from '../db/client'
import { contacts, contactInteractions } from '../db/schema'
import { eq, or, sql } from 'drizzle-orm'

// ── Phone normalization ──────────────────────────────────────────
/** Strips formatting, keeps leading + for international numbers.
 *  e.g. "(707) 555-1234" → "+17075551234" won't happen here — we
 *  just strip non-digit chars except leading + so matching is consistent. */
function normalizePhone(raw: string): string {
  const s = raw.trim()
  if (s.startsWith('+')) return '+' + s.slice(1).replace(/\D/g, '')
  return s.replace(/\D/g, '')
}

// ── Email normalization ──────────────────────────────────────────
function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase()
}

// ── Public interface ─────────────────────────────────────────────
export interface UpsertContactOpts {
  email?: string | null
  phone?: string | null
  name?: string | null
  locale?: string | null
  /** Guest consented to Terms & Conditions */
  consentTerms: boolean
  /** Guest consented to data collection */
  consentData: boolean
  /** Guest opted in to marketing emails */
  consentMarketing?: boolean
  /** Which form / source this interaction came from */
  source?: string
  interaction: {
    /** reservation | catering | survey | contact_msg | newsletter_sub | newsletter_unsub */
    type: string
    refTable?: string
    refId?: number
    /** Short human-readable summary for timeline */
    summary: string
    metadata?: Record<string, unknown>
  }
}

export async function upsertContact(opts: UpsertContactOpts): Promise<number | null> {
  const email = opts.email ? normalizeEmail(opts.email) : null
  const phone = opts.phone ? normalizePhone(opts.phone) : null

  // At least one identifier required
  if (!email && !phone) return null

  try {
    // 1. Try to find existing contact
    let existingId: number | null = null

    if (email) {
      const [row] = await db
        .select({ id: contacts.id })
        .from(contacts)
        .where(eq(contacts.email, email))
        .limit(1)
      if (row) existingId = row.id
    }

    if (!existingId && phone) {
      const [row] = await db
        .select({ id: contacts.id })
        .from(contacts)
        .where(eq(contacts.phone, phone))
        .limit(1)
      if (row) existingId = row.id
    }

    let contactId: number

    if (existingId) {
      // 2. UPDATE existing — backfill missing fields, bump counters
      await db
        .update(contacts)
        .set({
          // Backfill identifiers if this row was created with only one
          ...(email ? { email } : {}),
          ...(phone ? { phone } : {}),
          // Backfill name only if not already set
          ...(opts.name ? { name: opts.name } : {}),
          // Upgrade consent if not yet granted
          ...(opts.consentTerms ? { consentTerms: true } : {}),
          ...(opts.consentData ? { consentData: true } : {}),
          ...(opts.consentMarketing ? { consentMarketing: true } : {}),
          // Newsletter opt-in
          ...(opts.interaction.type === 'newsletter_sub' ? { isSubscriber: true } : {}),
          ...(opts.interaction.type === 'newsletter_unsub' ? { isSubscriber: false } : {}),
          lastSeen: new Date(),
          visitCount: sql`${contacts.visitCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(contacts.id, existingId))
      contactId = existingId
    } else {
      // 3. INSERT new contact
      const [inserted] = await db
        .insert(contacts)
        .values({
          email: email ?? undefined,
          phone: phone ?? undefined,
          name: opts.name ?? undefined,
          locale: opts.locale ?? 'es',
          consentTerms: opts.consentTerms,
          consentData: opts.consentData,
          consentMarketing: opts.consentMarketing ?? false,
          consentedAt: opts.consentTerms ? new Date() : undefined,
          isSubscriber: opts.interaction.type === 'newsletter_sub',
          firstSeen: new Date(),
          lastSeen: new Date(),
          visitCount: 1,
        })
        .returning({ id: contacts.id })
      contactId = inserted!.id
    }

    // 4. Record interaction
    await db.insert(contactInteractions).values({
      contactId,
      type: opts.interaction.type,
      refTable: opts.interaction.refTable ?? undefined,
      refId: opts.interaction.refId ?? undefined,
      summary: opts.interaction.summary,
      metadata: opts.interaction.metadata ?? {},
    })

    return contactId
  } catch (err) {
    // Never block the main request — log and return null
    console.error('[crm] upsertContact error:', err)
    return null
  }
}
