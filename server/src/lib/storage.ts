import { mkdir, writeFile, unlink } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, extname } from 'node:path'
import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadBucketCommand, CreateBucketCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { GetObjectCommand } from '@aws-sdk/client-s3'

/**
 * Storage abstraction. Driver is selected via STORAGE_DRIVER env:
 *   - "local" (default): writes to disk under UPLOAD_DIR, served via /uploads.
 *   - "s3":   uses any S3-compatible object store (MinIO, AWS S3, R2, B2…).
 *
 * MinIO setup (local dev):
 *   docker run -d --name minio -p 9000:9000 -p 9001:9001 \
 *     -e MINIO_ROOT_USER=minio -e MINIO_ROOT_PASSWORD=minio12345 \
 *     -v %USERPROFILE%/minio-data:/data quay.io/minio/minio server /data --console-address ":9001"
 *   → console http://localhost:9001  ·  api http://localhost:9000
 *
 * Required env when STORAGE_DRIVER=s3:
 *   S3_ENDPOINT          e.g. http://localhost:9000  (omit for AWS)
 *   S3_REGION            e.g. us-east-1              (any value for MinIO)
 *   S3_BUCKET            e.g. mipueblo-media
 *   S3_ACCESS_KEY        MinIO root user / IAM access key
 *   S3_SECRET_KEY        MinIO root password / IAM secret
 *   S3_FORCE_PATH_STYLE  "true" for MinIO, "false" for AWS (default true if endpoint set)
 *   S3_PUBLIC_URL        public base URL for objects, e.g. http://localhost:9000/mipueblo-media
 *                        (or your CDN). If unset, presigned GET URLs are used.
 *   S3_USE_PRESIGNED     "true" to always return presigned GET URLs (private bucket)
 *   S3_PRESIGN_EXPIRES   seconds, default 604800 (7 days)
 */

export interface StoredFile {
  key: string
  url: string
  size: number
  mime: string
}

export interface Storage {
  driver: 'local' | 's3'
  put(buf: Buffer, opts: { mime: string; ext: string; prefix?: string }): Promise<StoredFile>
  remove(key: string): Promise<void>
  /** Resolve a stored key/url to a publicly fetchable URL (handles presigning). */
  resolve(keyOrUrl: string): Promise<string>
}

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? './uploads'
const PUBLIC_URL = (process.env.PUBLIC_UPLOADS_URL ?? 'http://localhost:3001/uploads').replace(/\/$/, '')

function randomKey(ext: string, prefix?: string): string {
  const ts = Date.now()
  const rand = Math.random().toString(36).slice(2, 10)
  const name = `${ts}-${rand}${ext.startsWith('.') ? ext : '.' + ext}`
  return prefix ? `${prefix.replace(/^\/+|\/+$/g, '')}/${name}` : name
}

// ─────────────── LOCAL DRIVER ───────────────

class LocalStorage implements Storage {
  driver = 'local' as const
  async put(buf: Buffer, opts: { mime: string; ext: string; prefix?: string }): Promise<StoredFile> {
    if (!existsSync(UPLOAD_DIR)) await mkdir(UPLOAD_DIR, { recursive: true })
    const key = randomKey(opts.ext, opts.prefix)
    const fullDir = opts.prefix ? join(UPLOAD_DIR, opts.prefix) : UPLOAD_DIR
    if (opts.prefix && !existsSync(fullDir)) await mkdir(fullDir, { recursive: true })
    await writeFile(join(UPLOAD_DIR, key), buf)
    return { key, url: `${PUBLIC_URL}/${key}`, size: buf.length, mime: opts.mime }
  }
  async remove(key: string): Promise<void> {
    try { await unlink(join(UPLOAD_DIR, key)) } catch { /* ignore */ }
  }
  async resolve(keyOrUrl: string): Promise<string> {
    if (keyOrUrl.startsWith('http')) return keyOrUrl
    return `${PUBLIC_URL}/${keyOrUrl}`
  }
}

// ─────────────── S3 / MINIO DRIVER ───────────────

class S3Storage implements Storage {
  driver = 's3' as const
  private client: S3Client
  private bucket: string
  private publicBase: string | null
  private usePresigned: boolean
  private presignExpires: number

  constructor() {
    const endpoint = process.env.S3_ENDPOINT?.replace(/\/$/, '') || undefined
    const region = process.env.S3_REGION || 'us-east-1'
    const accessKeyId = process.env.S3_ACCESS_KEY
    const secretAccessKey = process.env.S3_SECRET_KEY
    const bucket = process.env.S3_BUCKET
    if (!accessKeyId || !secretAccessKey || !bucket) {
      throw new Error('[storage] STORAGE_DRIVER=s3 requires S3_ACCESS_KEY, S3_SECRET_KEY and S3_BUCKET')
    }
    const forcePathStyle = process.env.S3_FORCE_PATH_STYLE
      ? process.env.S3_FORCE_PATH_STYLE === 'true'
      : !!endpoint
    this.client = new S3Client({
      endpoint,
      region,
      credentials: { accessKeyId, secretAccessKey },
      forcePathStyle,
    })
    this.bucket = bucket
    this.publicBase = process.env.S3_PUBLIC_URL?.replace(/\/$/, '') || null
    this.usePresigned = process.env.S3_USE_PRESIGNED === 'true' || !this.publicBase
    this.presignExpires = Number(process.env.S3_PRESIGN_EXPIRES ?? 60 * 60 * 24 * 7)
  }

  /** Ensure the bucket exists (idempotent). Call once at boot. */
  async ensureBucket(): Promise<void> {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }))
    } catch {
      try {
        await this.client.send(new CreateBucketCommand({ Bucket: this.bucket }))
        console.log(`[storage] Created bucket "${this.bucket}"`)
      } catch (err) {
        console.warn(`[storage] Could not create bucket "${this.bucket}":`, (err as Error).message)
      }
    }
  }

  async put(buf: Buffer, opts: { mime: string; ext: string; prefix?: string }): Promise<StoredFile> {
    const key = randomKey(opts.ext, opts.prefix)
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buf,
        ContentType: opts.mime,
        CacheControl: 'public, max-age=31536000, immutable',
      })
    )
    const url = await this.resolve(key)
    return { key, url, size: buf.length, mime: opts.mime }
  }

  async remove(key: string): Promise<void> {
    // Accept either bare key or full URL
    const k = key.startsWith('http') ? this.extractKey(key) : key
    if (!k) return
    try {
      await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: k }))
    } catch (err) {
      console.warn('[storage] delete failed:', (err as Error).message)
    }
  }

  async resolve(keyOrUrl: string): Promise<string> {
    if (keyOrUrl.startsWith('http')) return keyOrUrl
    if (!this.usePresigned && this.publicBase) {
      return `${this.publicBase}/${keyOrUrl}`
    }
    return getSignedUrl(this.client, new GetObjectCommand({ Bucket: this.bucket, Key: keyOrUrl }), {
      expiresIn: this.presignExpires,
    })
  }

  private extractKey(url: string): string | null {
    if (this.publicBase && url.startsWith(this.publicBase + '/')) {
      return url.slice(this.publicBase.length + 1).split('?')[0]
    }
    try {
      const u = new URL(url)
      // path-style: /<bucket>/<key>
      const parts = u.pathname.replace(/^\/+/, '').split('/')
      if (parts[0] === this.bucket) return parts.slice(1).join('/').split('?')[0]
      return parts.join('/').split('?')[0]
    } catch {
      return null
    }
  }
}

// ─────────────── FACTORY ───────────────

let _storage: Storage | null = null

export async function getStorage(): Promise<Storage> {
  if (_storage) return _storage
  const driver = (process.env.STORAGE_DRIVER ?? 'local').toLowerCase()
  if (driver === 's3' || driver === 'minio') {
    const s3 = new S3Storage()
    await s3.ensureBucket()
    _storage = s3
    console.log(`[storage] Using S3 driver  ·  bucket="${process.env.S3_BUCKET}"  ·  endpoint="${process.env.S3_ENDPOINT ?? 'aws'}"`)
  } else {
    _storage = new LocalStorage()
    console.log(`[storage] Using local driver  ·  dir="${UPLOAD_DIR}"`)
  }
  return _storage
}
