/**
 * Envía todos los emails de prueba a una dirección destino.
 *
 *   bun run scripts/test-emails.ts
 */

import {
  sendReservationConfirmation,
  notifyAdminReservation,
  sendCateringConfirmation,
  notifyAdminCatering,
  sendContactAutoReply,
  notifyAdminContact,
} from '../src/lib/mailjet'

const TEST_EMAIL = '1308728@gmail.com'

const tests: Array<{ name: string; fn: () => Promise<any> }> = [
  {
    name: '1. Confirmación de reserva (al cliente)',
    fn: () =>
      sendReservationConfirmation({
        name: 'Carlos Hernández',
        email: TEST_EMAIL,
        date: 'Sábado 9 de mayo, 2026',
        time: '7:00 PM',
        partySize: 4,
        locationName: 'Mi Pueblo Cotati — 7995 Old Redwood Hwy',
        notes: 'Festejando cumpleaños, por favor mesa apartada',
      }),
  },
  {
    name: '2. Notificación admin — nueva reserva',
    fn: () =>
      notifyAdminReservation({
        name: 'Carlos Hernández',
        email: TEST_EMAIL,
        phone: '(707) 555-0101',
        date: 'Sábado 9 de mayo, 2026',
        time: '7:00 PM',
        partySize: 4,
        notes: 'Festejando cumpleaños, por favor mesa apartada',
      }),
  },
  {
    name: '3. Confirmación de catering (al cliente)',
    fn: () =>
      sendCateringConfirmation({
        name: 'Sofía Ramírez',
        email: TEST_EMAIL,
        eventType: 'Boda',
        eventDate: 'Sábado 20 de junio, 2026',
        guests: 120,
        budget: '3,500',
      }),
  },
  {
    name: '4. Notificación admin — nueva solicitud de catering',
    fn: () =>
      notifyAdminCatering({
        name: 'Sofía Ramírez',
        email: TEST_EMAIL,
        phone: '(415) 555-0202',
        eventType: 'Boda',
        eventDate: 'Sábado 20 de junio, 2026',
        guests: 120,
        budget: '3,500',
        message: 'Menú degustación con opciones vegetarianas. Necesitamos mesa de quesos y taquiza al momento.',
      }),
  },
  {
    name: '5. Auto-respuesta de contacto (al cliente)',
    fn: () =>
      sendContactAutoReply({
        name: 'Miguel Torres',
        email: TEST_EMAIL,
        message: '¿Tienen opciones sin gluten en el menú? Soy celíaco y quiero saber antes de reservar.',
      }),
  },
  {
    name: '6. Notificación admin — nuevo mensaje de contacto',
    fn: () =>
      notifyAdminContact({
        name: 'Miguel Torres',
        email: TEST_EMAIL,
        phone: '(510) 555-0303',
        subject: 'Opciones sin gluten',
        message: '¿Tienen opciones sin gluten en el menú? Soy celíaco y quiero saber antes de reservar.',
      }),
  },
]

async function main() {
  console.log(`\n📧 Enviando ${tests.length} correos de prueba a ${TEST_EMAIL}\n`)
  console.log('─'.repeat(60))

  let passed = 0
  let failed = 0

  for (const test of tests) {
    process.stdout.write(`${test.name} … `)
    try {
      const res: any = await test.fn()
      if (res?.skipped) {
        console.log('⚠️  SKIP (claves Mailjet no configuradas)')
      } else {
        console.log('✅ enviado')
        passed++
      }
    } catch (err: any) {
      console.log(`❌ ERROR: ${err?.message ?? err}`)
      failed++
    }
  }

  console.log('─'.repeat(60))
  console.log(`\nResultado: ${passed} enviados · ${failed} errores\n`)
}

main()
