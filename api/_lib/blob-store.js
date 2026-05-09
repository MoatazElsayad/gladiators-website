import { put } from '@vercel/blob'

function sanitizeSegment(value, fallback) {
  const normalized = String(value || fallback)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return normalized || fallback
}

export async function uploadHighlightImage({
  username,
  attackType,
  capturedAt,
  imageBuffer,
  contentType
}) {
  if (!imageBuffer || imageBuffer.length === 0) {
    throw new Error('Highlight image is required.')
  }

  const filePath = [
    'battle-highlights',
    sanitizeSegment(username, 'unknown-gladiator'),
    `${sanitizeSegment(capturedAt, 'capture')}-${sanitizeSegment(attackType, 'attack')}.png`
  ].join('/')

  const blob = await put(filePath, imageBuffer, {
    access: 'private',
    addRandomSuffix: true,
    contentType: contentType || 'image/png'
  })

  return blob.url
}
