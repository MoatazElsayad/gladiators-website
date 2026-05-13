import { del, put } from '@vercel/blob'

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

export async function uploadHighlightClipSheet({
  username,
  attackType,
  capturedAt,
  clipBuffer,
  contentType
}) {
  if (!clipBuffer || clipBuffer.length === 0) {
    return null
  }

  const filePath = [
    'battle-highlight-clips',
    sanitizeSegment(username, 'unknown-gladiator'),
    `${sanitizeSegment(capturedAt, 'capture')}-${sanitizeSegment(attackType, 'attack')}-sheet.jpg`
  ].join('/')

  const blob = await put(filePath, clipBuffer, {
    access: 'private',
    addRandomSuffix: true,
    contentType: contentType || 'image/jpeg'
  })

  return blob.url
}

export async function deleteHighlightAssets(urls = []) {
  const safeUrls = [...new Set(
    urls
      .map((url) => String(url || '').trim())
      .filter(Boolean)
  )]

  if (safeUrls.length === 0) {
    return
  }

  try {
    await del(safeUrls)
  } catch (error) {
    console.warn('Failed to delete old highlight blob assets:', error?.message || error)
  }
}
