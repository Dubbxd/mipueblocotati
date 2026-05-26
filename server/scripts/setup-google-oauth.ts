/**
 * Setup OAuth para Google Business Profile API — ejecutar UNA sola vez.
 *
 * Pasos previos en Google Cloud Console (console.cloud.google.com):
 *   1. Crea / selecciona un proyecto
 *   2. Habilita "My Business Business Information API" y "Business Profile API"
 *   3. APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID
 *      Tipo: "Web application"
 *      Authorized redirect URIs: http://localhost:3099/callback
 *   4. Copia client_id y client_secret al .env:
 *      GOOGLE_CLIENT_ID=...
 *      GOOGLE_CLIENT_SECRET=...
 *
 * Luego ejecuta:
 *   bun scripts/setup-google-oauth.ts
 *
 * Abre la URL que muestra en el navegador con la cuenta Google
 * que gestiona la ficha del negocio. Al autorizar, este script
 * imprimirá el GOOGLE_REFRESH_TOKEN para agregar al .env.
 */

import * as http from 'http'

const CLIENT_ID     = process.env.GOOGLE_CLIENT_ID
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('❌ Faltan GOOGLE_CLIENT_ID y/o GOOGLE_CLIENT_SECRET en el .env')
  process.exit(1)
}

const REDIRECT_URI = 'http://localhost:3099/callback'
const SCOPE        = 'https://www.googleapis.com/auth/business.manage'

const authUrl =
  'https://accounts.google.com/o/oauth2/v2/auth?' +
  new URLSearchParams({
    client_id:     CLIENT_ID,
    redirect_uri:  REDIRECT_URI,
    response_type: 'code',
    scope:         SCOPE,
    access_type:   'offline',
    prompt:        'consent', // fuerza a devolver refresh_token siempre
  })

console.log('\n🔗 Abre esta URL en el navegador (con la cuenta Google del negocio):\n')
console.log(authUrl)
console.log('\n⏳ Esperando autorización en http://localhost:3099/callback...\n')

const server = http.createServer(async (req, res) => {
  const url  = new URL(req.url!, 'http://localhost:3099')
  const code = url.searchParams.get('code')

  if (!code) {
    res.writeHead(400)
    res.end('No authorization code received.')
    return
  }

  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
  res.end('<h1 style="font-family:sans-serif;color:green">✅ Autorización exitosa. Puedes cerrar esta ventana.</h1>')
  server.close()

  // Intercambiar código por tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    new URLSearchParams({
      code,
      client_id:     CLIENT_ID!,
      client_secret: CLIENT_SECRET!,
      redirect_uri:  REDIRECT_URI,
      grant_type:    'authorization_code',
    }),
  })

  const tokens = await tokenRes.json() as any

  if (tokens.error) {
    console.error('❌ Error al obtener tokens:', tokens.error_description)
    process.exit(1)
  }

  if (!tokens.refresh_token) {
    console.error('❌ No se recibió refresh_token.')
    console.error('   → La cuenta ya había autorizado la app sin prompt=consent.')
    console.error('   → Ve a https://myaccount.google.com/permissions, revoca el acceso y vuelve a correr el script.')
    process.exit(1)
  }

  console.log('\n✅ ¡Tokens obtenidos! Agrega esto a tu .env:\n')
  console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`)
  console.log('\nEl refresh_token es permanente. El access_token expira cada hora (se renueva automáticamente).')
  console.log('\n🚀 Siguiente paso: bun scripts/sync-google-reviews.ts\n')
})

server.listen(3099, () => {
  // servidor listo, esperando el callback
})
