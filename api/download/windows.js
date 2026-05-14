import { Readable } from 'node:stream'

const INSTALLER_FILE_NAME = 'GladiatorsSetup.exe'
const INSTALLER_CONTENT_TYPE = 'application/vnd.microsoft.portable-executable'

function getInstallerUrl() {
  return (
    process.env.GLADIATORS_WINDOWS_INSTALLER_BLOB_URL ||
    process.env.GLADIATORS_WINDOWS_INSTALLER_URL ||
    ''
  )
}

function isVercelBlobUrl(url) {
  return /^https:\/\/[^/]+\.public\.blob\.vercel-storage\.com\//i.test(url) ||
    /^https:\/\/[^/]+\.blob\.vercel-storage\.com\//i.test(url)
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD')
    return res.status(405).json({ ok: false, message: 'Method not allowed.' })
  }

  const installerUrl = getInstallerUrl()

  if (!installerUrl) {
    return res.status(503).json({
      ok: false,
      message: 'The Windows installer is not configured yet.'
    })
  }

  if (!isVercelBlobUrl(installerUrl)) {
    return res.status(500).json({
      ok: false,
      message: 'The configured installer URL must point to Vercel Blob.'
    })
  }

  if (installerUrl.includes('.public.blob.vercel-storage.com/')) {
    res.writeHead(302, { Location: installerUrl })
    return res.end()
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(503).json({
      ok: false,
      message: 'Private installer download requires BLOB_READ_WRITE_TOKEN.'
    })
  }

  const blobResponse = await fetch(installerUrl, {
    headers: {
      Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`
    }
  })

  if (!blobResponse.ok) {
    return res.status(blobResponse.status).json({
      ok: false,
      message: 'Could not read the installer from Blob.'
    })
  }

  res.setHeader('Content-Type', blobResponse.headers.get('content-type') || INSTALLER_CONTENT_TYPE)
  res.setHeader('Content-Disposition', `attachment; filename="${INSTALLER_FILE_NAME}"`)
  res.setHeader('Cache-Control', 'public, max-age=3600')

  const contentLength = blobResponse.headers.get('content-length')
  if (contentLength) {
    res.setHeader('Content-Length', contentLength)
  }

  if (req.method === 'HEAD') {
    return res.end()
  }

  return Readable.fromWeb(blobResponse.body).pipe(res)
}
