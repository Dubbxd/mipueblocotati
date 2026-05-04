/**
 * OpenAI — AI content generation for blog posts and newsletter campaigns.
 * Falls back gracefully when OPENAI_API_KEY is not set.
 */
import OpenAI from 'openai'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? ''

function getClient() {
  if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your_openai_api_key_here') return null
  return new OpenAI({ apiKey: OPENAI_API_KEY })
}

const RESTAURANT_CONTEXT = `
Eres el asistente de contenido para "Mi Pueblo Cotati", un restaurante de comida mexicana auténtica en California 
fundado en 1997 con 6 sucursales en los condados de Sonoma y Marin. 
El restaurante es conocido por sus burritos, tacos, enchiladas y bebidas tradicionales.
Tono: cálido, familiar, auténtico, apetitoso. Nunca exageres ni uses clichés turísticos.
Siempre incluye una llamada a la acción natural al final.
`.trim()

// ─────────────────────────────────────────────────────────────────
// BLOG POST GENERATION
// ─────────────────────────────────────────────────────────────────
export interface GeneratedPost {
  titleEs: string
  titleEn: string
  excerptEs: string
  excerptEn: string
  bodyEs: string
  bodyEn: string
  metaDescriptionEs: string
  metaDescriptionEn: string
  suggestedSlug: string
  suggestedTags: string[]
}

export async function generateBlogPost(topic: string, category: string): Promise<GeneratedPost> {
  const ai = getClient()
  if (!ai) {
    // Return placeholder content when AI is not configured
    return mockBlogPost(topic)
  }

  const prompt = `
${RESTAURANT_CONTEXT}

Genera un artículo de blog completo sobre: "${topic}"
Categoría: ${category}

Responde ÚNICAMENTE con un JSON válido con esta estructura exacta:
{
  "titleEs": "Título en español (máx 80 caracteres)",
  "titleEn": "Title in English (max 80 chars)",
  "excerptEs": "Resumen en español (2-3 oraciones, máx 200 caracteres)",
  "excerptEn": "Summary in English (2-3 sentences, max 200 chars)",
  "bodyEs": "Cuerpo completo en español en formato HTML (usa <p>, <h2>, <ul>, <strong>). Mínimo 400 palabras.",
  "bodyEn": "Full body in English in HTML format. Minimum 300 words.",
  "metaDescriptionEs": "Meta descripción SEO en español (máx 160 chars)",
  "metaDescriptionEn": "SEO meta description in English (max 160 chars)",
  "suggestedSlug": "slug-en-ingles-sin-acentos",
  "suggestedTags": ["tag1", "tag2", "tag3"]
}
`

  const response = await ai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.7,
    max_tokens: 2500,
  })

  const content = response.choices[0]?.message?.content ?? '{}'
  return JSON.parse(content) as GeneratedPost
}

// ─────────────────────────────────────────────────────────────────
// NEWSLETTER CAMPAIGN GENERATION
// ─────────────────────────────────────────────────────────────────
export interface GeneratedCampaign {
  subjectEs: string
  subjectEn: string
  previewTextEs: string
  previewTextEn: string
  bodyHtmlEs: string
  bodyHtmlEn: string
}

export async function generateCampaign(
  topic: string,
  promotion?: string | null
): Promise<GeneratedCampaign> {
  const ai = getClient()
  if (!ai) return mockCampaign(topic)

  const prompt = `
${RESTAURANT_CONTEXT}

Genera el contenido de un email newsletter sobre: "${topic}"
${promotion ? `Promoción a incluir: ${promotion}` : ''}

El email debe tener estructura HTML bien diseñada con colores del restaurante:
- Brand color: #C8501C (naranja)
- Accent: #F09828 (amarillo)  
- Background: #FFFCF0

Responde ÚNICAMENTE con JSON válido con esta estructura:
{
  "subjectEs": "Asunto del email en español (máx 60 chars, con emoji)",
  "subjectEn": "Email subject in English (max 60 chars, with emoji)",
  "previewTextEs": "Texto de vista previa en español (máx 100 chars)",
  "previewTextEn": "Preview text in English (max 100 chars)",
  "bodyHtmlEs": "HTML completo del email en español. Incluye sección de header con emoji grande, sección principal, CTA button y cierre amigable.",
  "bodyHtmlEn": "Full HTML email in English with same structure."
}
`

  const response = await ai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.7,
    max_tokens: 3000,
  })

  const content = response.choices[0]?.message?.content ?? '{}'
  return JSON.parse(content) as GeneratedCampaign
}

// ─────────────────────────────────────────────────────────────────
// IMPROVE / REWRITE EXISTING CONTENT
// ─────────────────────────────────────────────────────────────────
export async function improveText(text: string, instruction: string, lang: 'es' | 'en' = 'es'): Promise<string> {
  const ai = getClient()
  if (!ai) return text

  const response = await ai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `${RESTAURANT_CONTEXT}\nResponde siempre en ${lang === 'es' ? 'español' : 'English'}. Solo devuelve el texto mejorado, sin explicaciones.`,
      },
      { role: 'user', content: `${instruction}:\n\n${text}` },
    ],
    temperature: 0.6,
    max_tokens: 1000,
  })

  return response.choices[0]?.message?.content?.trim() ?? text
}

// ─────────────────────────────────────────────────────────────────
// MOCK FALLBACKS (when OpenAI is not configured)
// ─────────────────────────────────────────────────────────────────
function mockBlogPost(topic: string): GeneratedPost {
  return {
    titleEs: `[Borrador IA] ${topic}`,
    titleEn: `[AI Draft] ${topic}`,
    excerptEs: 'Extracto generado por IA. Configura OPENAI_API_KEY para contenido real.',
    excerptEn: 'AI-generated excerpt. Set OPENAI_API_KEY for real content.',
    bodyEs: `<p>Este es un artículo de muestra sobre <strong>${topic}</strong>.</p><p>Configura tu clave de OpenAI en el archivo .env para generar contenido real.</p>`,
    bodyEn: `<p>This is a sample article about <strong>${topic}</strong>.</p><p>Set your OpenAI API key in .env to generate real content.</p>`,
    metaDescriptionEs: `Artículo sobre ${topic} - Mi Pueblo Cotati`,
    metaDescriptionEn: `Article about ${topic} - Mi Pueblo Cotati`,
    suggestedSlug: topic.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    suggestedTags: ['blog', 'mipueblo'],
  }
}

function mockCampaign(topic: string): GeneratedCampaign {
  return {
    subjectEs: `🌮 ${topic} · Mi Pueblo`,
    subjectEn: `🌮 ${topic} · Mi Pueblo`,
    previewTextEs: 'Novedades de Mi Pueblo Cotati para ti.',
    previewTextEn: 'News from Mi Pueblo Cotati for you.',
    bodyHtmlEs: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;"><h1 style="color:#C8501C;">🌮 Mi Pueblo Cotati</h1><p>${topic}</p><p>Configura OPENAI_API_KEY para contenido generado por IA.</p></div>`,
    bodyHtmlEn: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;"><h1 style="color:#C8501C;">🌮 Mi Pueblo Cotati</h1><p>${topic}</p><p>Set OPENAI_API_KEY for AI-generated content.</p></div>`,
  }
}
