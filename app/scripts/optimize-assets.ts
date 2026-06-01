/**
 * optimize-assets.ts
 * Converts all JPG/PNG images in public/assets/ to WebP using sharp.
 * Keeps originals untouched (browsers use them as fallback via <picture>).
 *
 * Run: pnpm --filter @mipueblo/web optimize:assets
 */

import sharp from 'sharp'
import { readdir, stat } from 'node:fs/promises'
import { join, extname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const ASSETS_DIR = join(__dirname, '../public/assets')

// Quality settings: photos benefit from 82, PNG-derived graphics from 90
const PHOTO_QUALITY = 82
const GRAPHIC_QUALITY = 90

async function* walkDir(dir: string): AsyncGenerator<string> {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      yield* walkDir(fullPath)
    } else if (entry.isFile()) {
      yield fullPath
    }
  }
}

async function convertToWebP(filePath: string): Promise<void> {
  const ext = extname(filePath).toLowerCase()
  if (!['.jpg', '.jpeg', '.png'].includes(ext)) return

  const webpPath = filePath.replace(/\.(jpg|jpeg|png)$/i, '.webp')
  try {
    await stat(webpPath)
    // Already exists — skip
    return
  } catch {
    // Does not exist yet — proceed
  }

  const isGraphic = ext === '.png'
  const quality = isGraphic ? GRAPHIC_QUALITY : PHOTO_QUALITY

  const info = await sharp(filePath)
    .webp({ quality })
    .toFile(webpPath)

  const origStats = await stat(filePath)
  const savings = (((origStats.size - info.size) / origStats.size) * 100).toFixed(1)
  console.log(
    `✔  ${basename(filePath)} → ${basename(webpPath)}  ${(origStats.size / 1024).toFixed(0)} KB → ${(info.size / 1024).toFixed(0)} KB  (-${savings}%)`
  )
}

async function main() {
  console.log(`Scanning ${ASSETS_DIR} ...\n`)
  let converted = 0
  let skipped = 0

  for await (const file of walkDir(ASSETS_DIR)) {
    const ext = extname(file).toLowerCase()
    if (['.jpg', '.jpeg', '.png'].includes(ext)) {
      const webpPath = file.replace(/\.(jpg|jpeg|png)$/i, '.webp')
      try {
        await stat(webpPath)
        skipped++
      } catch {
        await convertToWebP(file)
        converted++
      }
    }
  }

  console.log(`\nDone. ${converted} converted, ${skipped} already existed.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
