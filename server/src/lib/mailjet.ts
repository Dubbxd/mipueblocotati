/**
 * Mailjet — transactional emails + newsletter campaigns
 * Docs: https://dev.mailjet.com/email/guides/
 */
import Mailjet from 'node-mailjet'
import { readFileSync } from 'fs'
import { join } from 'path'
import { unsubToken } from './hmac'

const MJ_API_KEY = process.env.MAILJET_API_KEY ?? ''
const MJ_SECRET_KEY = process.env.MAILJET_SECRET_KEY ?? ''
const FROM_EMAIL = process.env.MAILJET_FROM_EMAIL ?? 'noreply@mipueblocotati.com'
const FROM_NAME = process.env.MAILJET_FROM_NAME ?? 'Mi Pueblo Cotati'
const ADMIN_EMAIL = process.env.MAILJET_ADMIN_EMAIL ?? 'admin@mipueblocotati.com'
const PUBLIC_URL = process.env.PUBLIC_URL ?? 'https://mipueblocotati.com'
// API server URL used for backend links (unsubscribe endpoint, etc.)
const API_URL = process.env.API_URL ?? `http://localhost:${process.env.PORT ?? 3001}`

// Logo loaded as base64 for CID inline attachment (Gmail blocks data: URIs)
function getLogoBase64(): string | null {
  const candidates = [
    process.env.LOGO_PATH,
    join(process.cwd(), 'email-logo.png'),
    join(process.cwd(), '../app/public/assets/logos/logo-cotati-secondary.png'),
  ].filter(Boolean) as string[]
  for (const p of candidates) {
    try {
      return readFileSync(p).toString('base64')
    } catch {
      // try next path
    }
  }
  return null
}
const LOGO_BASE64 = getLogoBase64()
// CID used in HTML — works across Gmail, Outlook, Apple Mail
const LOGO_CID = 'logo@mipueblocotati'

/** Escape HTML entities to prevent injection in email templates. */
function esc(s: string | null | undefined): string {
  if (!s) return ''
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/** Returns null if Mailjet keys are not configured (dev without keys). */
function getClient() {
  if (!MJ_API_KEY || MJ_API_KEY === 'your_mailjet_api_key_here') return null
  return new Mailjet({ apiKey: MJ_API_KEY, apiSecret: MJ_SECRET_KEY })
}

// ─────────────────────────────────────────────────────────────────
// BASE EMAIL TEMPLATE  —  multi-band design
// ─────────────────────────────────────────────────────────────────
function baseTemplate(title: string, content: string, unsubEmail?: string) {
  const year = new Date().getFullYear()
  const unsubSpan = unsubEmail
    ? `<span class="unsub">&copy; ${year} Mi Pueblo Cotati &nbsp;&middot;&nbsp; <a href="${API_URL}/api/public/newsletter/unsubscribe?email=${encodeURIComponent(unsubEmail)}&token=${unsubToken(unsubEmail)}" style="color:rgba(200,160,122,.5);">Unsubscribe</a></span>`
    : `<span class="unsub">&copy; ${year} Mi Pueblo Cotati</span>`
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<title>${title}</title>
<style>
  * { box-sizing:border-box; margin:0; padding:0; }
  body { background:#FFF5DE; font-family:Arial,Helvetica,sans-serif; -webkit-font-smoothing:antialiased; }
  table { border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; }
  img { border:0; display:block; max-width:100%; }
  a { color:#C8501C; }
  .outer { background:#FFF5DE; padding:40px 16px 48px; }
  .wrap { max-width:600px; margin:0 auto; }
  /* ── Logo band ── */
  .logo-sec { background:#FFFCF0; padding:28px 44px 22px; text-align:center; border-bottom:1px solid #FFE8C0; }
  .logo-sec img { max-height:66px; width:auto; margin:0 auto; }
  /* ── Brand band ── */
  .brand { background:#3D1A08; padding:22px 44px 20px; text-align:center; }
  .brand-name { color:#FFFCF0; font-size:20px; font-weight:700; letter-spacing:6px; text-transform:uppercase; line-height:1.2; font-family:Georgia,'Times New Roman',serif; }
  .brand-sub { color:#F09828; font-size:9px; letter-spacing:3px; text-transform:uppercase; margin-top:6px; }
  /* ── Accent stripe ── */
  .stripe { background:#C8501C; height:3px; font-size:0; line-height:0; }
  /* ── Content area ── */
  .body-wrap { background:#ffffff; padding:44px 48px 40px; }
  /* Badge */
  .badge { display:inline-block; background:#C8501C; color:#fff; font-size:9px; font-weight:700; letter-spacing:2.5px; text-transform:uppercase; padding:5px 14px; margin-bottom:18px; }
  /* Headings & text */
  h2 { font-family:Georgia,'Times New Roman',serif; font-size:28px; color:#3A2010; margin:0 0 18px; font-weight:700; line-height:1.25; }
  p { font-size:15px; line-height:1.85; margin:0 0 16px; color:#5A3820; }
  /* Detail box — left-border style */
  .detail-box { border-left:4px solid #C8501C; background:#FFFCF0; padding:20px 24px; margin:24px 0; }
  .detail-row { margin-bottom:10px; font-size:14px; line-height:1.6; }
  .detail-row:last-child { margin-bottom:0; }
  .detail-label { display:inline-block; color:#8A5A38; font-weight:700; min-width:130px; vertical-align:top; }
  .detail-value { display:inline-block; color:#3A2010; }
  /* Quote box */
  .quote-box { border-left:4px solid #F09828; background:#FFFCF0; padding:18px 22px; margin:20px 0; font-style:italic; color:#5A3820; font-size:15px; line-height:1.8; font-family:Georgia,serif; }
  /* CTA */
  .cta-wrap { margin:30px 0 12px; }
  .btn { display:block; background:#C8501C; color:#ffffff !important; text-decoration:none; padding:17px 40px; font-weight:700; font-size:13px; letter-spacing:2.5px; text-align:center; text-transform:uppercase; }
  /* Divider */
  .divider { border:none; border-top:1px solid #FFE8C0; margin:28px 0; }
  /* Footer */
  .footer { background:#3D1A08; padding:32px 44px 28px; text-align:center; }
  .footer-brand { display:block; color:#FFFCF0; font-family:Georgia,serif; font-size:13px; font-weight:700; letter-spacing:5px; text-transform:uppercase; margin-bottom:14px; }
  .footer p { color:#C8A07A; font-size:12px; line-height:2; margin:0; }
  .footer a { color:#F09828; text-decoration:none; }
  .footer .unsub { display:block; color:rgba(200,160,122,.5) !important; font-size:11px; margin-top:14px; }
  /* Responsive */
  @media only screen and (max-width:620px) {
    .body-wrap { padding:30px 24px 28px !important; }
    .logo-sec { padding:20px 24px 16px !important; }
    .brand { padding:18px 24px 16px !important; }
    .footer { padding:24px 24px 20px !important; }
    .detail-label { min-width:100px !important; }
    h2 { font-size:22px !important; }
  }
</style>
</head>
<body>
<div class="outer">
<div class="wrap">

  <!-- LOGO -->
  <div class="logo-sec">
    <img src="cid:${LOGO_CID}" alt="Mi Pueblo Cotati" />
  </div>

  <!-- BRAND -->
  <div class="brand">
    <div class="brand-name">Mi Pueblo Cotati</div>
    <div class="brand-sub">Authentic Mexican Cuisine &nbsp;·&nbsp; Since 1997</div>
  </div>

  <!-- STRIPE -->
  <div class="stripe">&#xFEFF;</div>

  <!-- BODY -->
  <div class="body-wrap">
    ${content}
  </div>

  <!-- FOOTER -->
  <div class="footer">
    <span class="footer-brand">Mi Pueblo Cotati</span>
    <p>7384 Commerce Blvd, Cotati, CA 94931</p>
    <p><a href="tel:+17078231234">(707) 823-1234</a> &nbsp;·&nbsp; <a href="${PUBLIC_URL}">mipueblocotati.com</a></p>
    <p><a href="${PUBLIC_URL}/legal/privacidad">Privacy Policy</a></p>
    ${unsubSpan}
  </div>

</div>
</div>
</body>
</html>`
}

// ─────────────────────────────────────────────────────────────────
// SEND HELPER
// ─────────────────────────────────────────────────────────────────
interface SendOpts {
  to: { email: string; name?: string }[]
  subject: string
  html: string
  replyTo?: string
}

export async function sendEmail(opts: SendOpts) {
  const mj = getClient()
  if (!mj) {
    console.log(`[mailjet] SKIP (no keys) → ${opts.to.map(t => t.email).join(', ')} · "${opts.subject}"`)
    return { ok: true, skipped: true }
  }

  // Inline logo attachment so Gmail (and all clients) render it correctly
  const inlinedAttachments = LOGO_BASE64
    ? [{ ContentType: 'image/png', Filename: 'logo.png', ContentID: LOGO_CID, Base64Content: LOGO_BASE64 }]
    : []

  const res = await mj.post('send', { version: 'v3.1' }).request({
    Messages: [
      {
        From: { Email: FROM_EMAIL, Name: FROM_NAME },
        To: opts.to.map(t => ({ Email: t.email, Name: t.name ?? t.email })),
        ReplyTo: opts.replyTo ? { Email: opts.replyTo } : undefined,
        Subject: opts.subject,
        HTMLPart: opts.html,
        InlinedAttachments: inlinedAttachments,
      },
    ],
  })
  return { ok: true, data: res.body }
}

// ─────────────────────────────────────────────────────────────────
// TRANSACTIONAL TEMPLATES
// ─────────────────────────────────────────────────────────────────

/** Confirmation email to customer after reservation */
export async function sendReservationConfirmation(r: {
  name: string
  email: string
  date: string
  time: string
  partySize: number
  locationName?: string
  notes?: string | null
}) {
  const html = baseTemplate('Reservation Confirmed · Mi Pueblo', `
    <div class="badge">Reservation Confirmed</div>
    <h2>Your reservation is set, ${esc(r.name)}!</h2>
    <p>Thank you for choosing Mi Pueblo. Here is a summary of your booking:</p>
    <div class="detail-box">
      <div class="detail-row"><span class="detail-label">Date:</span><span class="detail-value">${esc(r.date)}</span></div>
      <div class="detail-row"><span class="detail-label">Time:</span><span class="detail-value">${esc(r.time)}</span></div>
      <div class="detail-row"><span class="detail-label">Party size:</span><span class="detail-value">${r.partySize}</span></div>
      ${r.locationName ? `<div class="detail-row"><span class="detail-label">Location:</span><span class="detail-value">${esc(r.locationName)}</span></div>` : ''}
      ${r.notes ? `<div class="detail-row"><span class="detail-label">Notes:</span><span class="detail-value">${esc(r.notes)}</span></div>` : ''}
    </div>
    <p>We will confirm your reservation shortly. To make changes or cancel, call us at <strong>(707) 823-1234</strong>.</p>
    <div class="cta-wrap"><a href="${PUBLIC_URL}/reservar" class="btn">Make Another Reservation</a></div>
    <p style="font-size:12px;color:#8A5A38;margin-top:16px;">If you did not make this reservation, please disregard this email.</p>
  `)
  return sendEmail({
    to: [{ email: r.email, name: r.name }],
    subject: `Reservation confirmed for ${esc(r.date)} · Mi Pueblo`,
    html,
  })
}

/** Notification email to admin when a new reservation arrives */
export async function notifyAdminReservation(r: {
  name: string
  email: string
  phone: string
  date: string
  time: string
  partySize: number
  notes?: string | null
}) {
  const html = baseTemplate('New Reservation · Admin', `
    <div class="badge">Admin &middot; New Reservation</div>
    <h2>New reservation received</h2>
    <div class="detail-box">
      <div class="detail-row"><span class="detail-label">Name:</span><span class="detail-value">${esc(r.name)}</span></div>
      <div class="detail-row"><span class="detail-label">Phone:</span><span class="detail-value">${esc(r.phone)}</span></div>
      <div class="detail-row"><span class="detail-label">Email:</span><span class="detail-value">${esc(r.email)}</span></div>
      <div class="detail-row"><span class="detail-label">Date &amp; Time:</span><span class="detail-value">${esc(r.date)} &middot; ${esc(r.time)}</span></div>
      <div class="detail-row"><span class="detail-label">Party size:</span><span class="detail-value">${r.partySize}</span></div>
      ${r.notes ? `<div class="detail-row"><span class="detail-label">Notes:</span><span class="detail-value">${esc(r.notes)}</span></div>` : ''}
    </div>
    <div class="cta-wrap"><a href="${PUBLIC_URL}/admin/reservations" class="btn">View in Admin</a></div>
  `)
  return sendEmail({
    to: [{ email: ADMIN_EMAIL, name: 'Admin Mi Pueblo' }],
    subject: `New reservation: ${esc(r.name)} · ${esc(r.date)} ${esc(r.time)}`,
    html,
  })
}

/** Cancellation email to customer when admin cancels a reservation */
export async function sendReservationCancellation(r: {
  name: string
  email: string
  date: string
  time: string
  partySize: number
  reason?: string | null
}) {
  const html = baseTemplate('Reservation Cancelled · Mi Pueblo', `
    <div class="badge" style="background:#8B0000;">Reservation Cancelled</div>
    <h2>Your reservation has been cancelled</h2>
    <p>Hi ${esc(r.name)}, we are sorry to inform you that your reservation has been cancelled.</p>
    <div class="detail-box">
      <div class="detail-row"><span class="detail-label">Date:</span><span class="detail-value">${esc(r.date)}</span></div>
      <div class="detail-row"><span class="detail-label">Time:</span><span class="detail-value">${esc(r.time)}</span></div>
      <div class="detail-row"><span class="detail-label">Party size:</span><span class="detail-value">${r.partySize}</span></div>
      ${r.reason ? `<div class="detail-row"><span class="detail-label">Reason:</span><span class="detail-value">${esc(r.reason)}</span></div>` : ''}
    </div>
    <p>We apologize for any inconvenience. You are welcome to make a new reservation at any time.</p>
    <div class="cta-wrap"><a href="${PUBLIC_URL}/reservar" class="btn">Make a New Reservation</a></div>
    <hr class="divider" />
    <p style="font-size:13px;color:#8A5A38;">Questions? Call us at <strong>(707) 823-1234</strong> or reply to this email.</p>
  `)
  return sendEmail({
    to: [{ email: r.email, name: r.name }],
    subject: `Reservation cancelled for ${esc(r.date)} · Mi Pueblo`,
    html,
  })
}

/** Confirmation email to customer after catering request */
export async function sendCateringConfirmation(c: {
  name: string
  email: string
  eventType?: string | null
  eventDate?: string | null
  guests?: number | null
  budget?: string | null
}) {
  const html = baseTemplate('Catering Request Received · Mi Pueblo', `
    <div class="badge">Catering &middot; Request Received</div>
    <h2>We got your request, ${esc(c.name)}!</h2>
    <p>Thank you for considering Mi Pueblo for your event. Our catering team will review your request and reach out shortly with a personalized quote.</p>
    <div class="detail-box">
      ${c.eventType ? `<div class="detail-row"><span class="detail-label">Event type:</span><span class="detail-value">${esc(c.eventType)}</span></div>` : ''}
      ${c.eventDate ? `<div class="detail-row"><span class="detail-label">Event date:</span><span class="detail-value">${esc(c.eventDate)}</span></div>` : ''}
      ${c.guests ? `<div class="detail-row"><span class="detail-label">Guests:</span><span class="detail-value">${c.guests} people</span></div>` : ''}
      ${c.budget ? `<div class="detail-row"><span class="detail-label">Budget:</span><span class="detail-value">$${esc(c.budget)}</span></div>` : ''}
    </div>
    <p>Have immediate questions? Call us at <strong>(707) 823-1234</strong> or email <a href="mailto:catering@mipueblocotati.com">catering@mipueblocotati.com</a>.</p>
    <div class="cta-wrap"><a href="${PUBLIC_URL}/catering" class="btn">Explore Catering Services</a></div>
  `)
  return sendEmail({
    to: [{ email: c.email, name: c.name }],
    subject: 'Your catering request was received · Mi Pueblo',
    html,
  })
}

/** Notification email to admin for new catering request */
export async function notifyAdminCatering(c: {
  name: string
  email: string
  phone: string
  eventType?: string | null
  eventDate?: string | null
  guests?: number | null
  budget?: string | null
  message?: string | null
}) {
  const html = baseTemplate('New Catering Request · Admin', `
    <div class="badge">Admin &middot; Catering</div>
    <h2>New catering request</h2>
    <div class="detail-box">
      <div class="detail-row"><span class="detail-label">Name:</span><span class="detail-value">${esc(c.name)}</span></div>
      <div class="detail-row"><span class="detail-label">Phone:</span><span class="detail-value">${esc(c.phone)}</span></div>
      <div class="detail-row"><span class="detail-label">Email:</span><span class="detail-value">${esc(c.email)}</span></div>
      ${c.eventType ? `<div class="detail-row"><span class="detail-label">Event type:</span><span class="detail-value">${esc(c.eventType)}</span></div>` : ''}
      ${c.eventDate ? `<div class="detail-row"><span class="detail-label">Event date:</span><span class="detail-value">${esc(c.eventDate)}</span></div>` : ''}
      ${c.guests ? `<div class="detail-row"><span class="detail-label">Guests:</span><span class="detail-value">${c.guests}</span></div>` : ''}
      ${c.budget ? `<div class="detail-row"><span class="detail-label">Budget:</span><span class="detail-value">$${esc(c.budget)}</span></div>` : ''}
      ${c.message ? `<div class="detail-row"><span class="detail-label">Message:</span><span class="detail-value">${esc(c.message)}</span></div>` : ''}
    </div>
    <div class="cta-wrap"><a href="${PUBLIC_URL}/admin/catering" class="btn">Manage in Admin</a></div>
  `)
  return sendEmail({
    to: [{ email: ADMIN_EMAIL, name: 'Admin Mi Pueblo' }],
    subject: `New catering: ${esc(c.name)} · ${c.guests ?? '?'} guests`,
    html,
  })
}

/** Auto-reply to customer after contact form */
export async function sendContactAutoReply(contact: {
  name: string
  email: string
  message: string
}) {
  const html = baseTemplate('We received your message · Mi Pueblo', `
    <div class="badge">Message Received</div>
    <h2>Hi, ${esc(contact.name)}!</h2>
    <p>We received your message and will get back to you within 24 hours. Here is a copy of what you sent:</p>
    <div class="quote-box">&ldquo;${esc(contact.message)}&rdquo;</div>
    <p>In the meantime, you can:</p>
    <table style="margin:4px 0 18px; border-collapse:collapse;" cellpadding="0" cellspacing="0">
      <tr><td style="padding:5px 0; font-size:15px; line-height:1.6; color:#5A3820;">Call us at <strong>(707) 823-1234</strong></td></tr>
      <tr><td style="padding:5px 0; font-size:15px; line-height:1.6;"><a href="${PUBLIC_URL}/sucursales" style="color:#C8501C;">Find our locations</a></td></tr>
      <tr><td style="padding:5px 0; font-size:15px; line-height:1.6;"><a href="${PUBLIC_URL}/menu" style="color:#C8501C;">Browse the menu</a></td></tr>
    </table>
    <div class="cta-wrap"><a href="${PUBLIC_URL}" class="btn">Visit Our Website</a></div>
  `)
  return sendEmail({
    to: [{ email: contact.email, name: contact.name }],
    subject: 'We received your message · Mi Pueblo Cotati',
    html,
  })
}

/** Notification email to admin for new contact form */
export async function notifyAdminContact(contact: {
  name: string
  email: string
  phone?: string | null
  subject?: string | null
  message: string
}) {
  const html = baseTemplate('New Contact Message · Admin', `
    <div class="badge">Admin &middot; Contact</div>
    <h2>New contact message</h2>
    <div class="detail-box">
      <div class="detail-row"><span class="detail-label">Name:</span><span class="detail-value">${esc(contact.name)}</span></div>
      <div class="detail-row"><span class="detail-label">Email:</span><span class="detail-value">${esc(contact.email)}</span></div>
      ${contact.phone ? `<div class="detail-row"><span class="detail-label">Phone:</span><span class="detail-value">${esc(contact.phone)}</span></div>` : ''}
      ${contact.subject ? `<div class="detail-row"><span class="detail-label">Subject:</span><span class="detail-value">${esc(contact.subject)}</span></div>` : ''}
      <div class="detail-row"><span class="detail-label">Message:</span><span class="detail-value">${esc(contact.message)}</span></div>
    </div>
    <div class="cta-wrap"><a href="mailto:${esc(contact.email)}" class="btn">Reply Now</a></div>
  `)
  return sendEmail({
    to: [{ email: ADMIN_EMAIL, name: 'Admin Mi Pueblo' }],
    subject: `New contact: ${esc(contact.name)} — ${esc(contact.subject || contact.message.slice(0, 40))}`,
    html,
    replyTo: contact.email,
  })
}

// ─────────────────────────────────────────────────────────────────
// SURVEY NOTIFICATION  →  admin
// ─────────────────────────────────────────────────────────────────
const STARS = ['', '★☆☆☆☆', '★★☆☆☆', '★★★☆☆', '★★★★☆', '★★★★★']

/** Admin notification when a new survey is submitted */
export async function notifyAdminSurvey(s: {
  rating: number
  comment?: string | null
  name?: string | null
  email?: string | null
  locale?: string | null
}) {
  const html = baseTemplate('New Survey Response · Admin', `
    <div class="badge">Admin &middot; Survey</div>
    <h2>New survey response</h2>
    <div class="detail-box">
      <div class="detail-row"><span class="detail-label">Rating:</span><span class="detail-value">${STARS[s.rating] ?? s.rating} (${s.rating}/5)</span></div>
      ${s.name  ? `<div class="detail-row"><span class="detail-label">Name:</span><span class="detail-value">${esc(s.name)}</span></div>` : ''}
      ${s.email ? `<div class="detail-row"><span class="detail-label">Email:</span><span class="detail-value">${esc(s.email)}</span></div>` : ''}
      ${s.locale ? `<div class="detail-row"><span class="detail-label">Locale:</span><span class="detail-value">${esc(s.locale)}</span></div>` : ''}
      ${s.comment ? `<div class="detail-row"><span class="detail-label">Comment:</span><span class="detail-value">${esc(s.comment)}</span></div>` : ''}
    </div>
    ${s.email ? `<div class="cta-wrap"><a href="mailto:${esc(s.email)}" class="btn">Reply to Guest</a></div>` : ''}
  `)
  return sendEmail({
    to: [{ email: ADMIN_EMAIL, name: 'Admin Mi Pueblo' }],
    subject: `New survey: ${STARS[s.rating] ?? s.rating + '/5'}${s.name ? ` — ${s.name}` : ''}`,
    html,
    replyTo: s.email ?? undefined,
  })
}

// ─────────────────────────────────────────────────────────────────
// NEWSLETTER BULK SEND
// ─────────────────────────────────────────────────────────────────
export interface Subscriber {
  email: string
  name?: string | null
  locale?: string
}

/**
 * Sends a newsletter campaign to a list of subscribers.
 * Splits by locale: es subscribers get subjectEs/bodyHtmlEs, en gets English version.
 * Returns { sent, errors }.
 */
export async function sendCampaign(opts: {
  subjectEs: string
  subjectEn: string
  bodyHtmlEs: string
  bodyHtmlEn?: string | null
  subscribers: Subscriber[]
}) {
  const mj = getClient()
  if (!mj) {
    console.log(`[mailjet] SKIP campaign (no keys) → ${opts.subscribers.length} subscribers`)
    return { sent: opts.subscribers.length, errors: 0, skipped: true }
  }

  const esGroup = opts.subscribers.filter(s => (s.locale ?? 'es') !== 'en')
  const enGroup = opts.subscribers.filter(s => s.locale === 'en')
  let sent = 0
  let errors = 0

  const BATCH = 50 // Mailjet free tier: 200 msg/day, keep batches small

  async function sendBatch(group: Subscriber[], subject: string, html: string) {
    for (let i = 0; i < group.length; i += BATCH) {
      const chunk = group.slice(i, i + BATCH)
      try {
        await mj!.post('send', { version: 'v3.1' }).request({
          Messages: chunk.map(sub => ({
            From: { Email: FROM_EMAIL, Name: FROM_NAME },
            To: [{ Email: sub.email, Name: sub.name ?? sub.email }],
            Subject: subject,
            HTMLPart: addUnsubscribeFooter(html, sub.email),
          })),
        })
        sent += chunk.length
      } catch (e) {
        console.error('[mailjet] batch error', e)
        errors += chunk.length
      }
    }
  }

  if (esGroup.length) await sendBatch(esGroup, opts.subjectEs, opts.bodyHtmlEs)
  if (enGroup.length) await sendBatch(enGroup, opts.subjectEn, opts.bodyHtmlEn ?? opts.bodyHtmlEs)

  return { sent, errors }
}

function addUnsubscribeFooter(html: string, email: string) {
  const token = unsubToken(email)
  const unsubLink = `${API_URL}/api/public/newsletter/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`
  const footer = `
    <div style="text-align:center;padding:20px;font-size:11px;color:#8A5A38;background:#F9F0DF;border-top:1px solid #E8D5B0;">
      <p>Recibiste este correo porque estás suscrito al newsletter de Mi Pueblo Cotati.</p>
      <p><a href="${unsubLink}" style="color:#C8501C;">Cancelar suscripción</a></p>
    </div>
  `
  return html.replace('</body>', `${footer}</body>`)
}
