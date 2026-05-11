import Busboy from 'busboy'

export async function readMultipartBody(req, { maxFileSize = 4 * 1024 * 1024 } = {}) {
  return new Promise((resolve, reject) => {
    const fields = {}
    const files = {}
    let fileBuffer = null
    let fileMimeType = ''
    let fileName = ''
    let fileTooLarge = false

    const busboy = Busboy({
      headers: req.headers,
      limits: {
        files: 4,
        fileSize: maxFileSize
      }
    })

    busboy.on('field', (name, value) => {
      fields[name] = value
    })

    busboy.on('file', (name, file, info) => {
      const currentMimeType = info.mimeType || ''
      const currentFileName = info.filename || ''
      const chunks = []

      file.on('limit', () => {
        fileTooLarge = true
      })

      file.on('data', (chunk) => {
        chunks.push(chunk)
      })

      file.on('end', () => {
        const buffer = Buffer.concat(chunks)
        files[name] = {
          buffer,
          mimeType: currentMimeType,
          fileName: currentFileName
        }

        if (!fileBuffer) {
          fileBuffer = buffer
          fileMimeType = currentMimeType
          fileName = currentFileName
        }
      })
    })

    busboy.on('error', reject)
    busboy.on('finish', () => {
      if (fileTooLarge) {
        reject(new Error('Uploaded image exceeds the size limit.'))
        return
      }

      resolve({
        fields,
        files,
        fileBuffer,
        fileMimeType,
        fileName
      })
    })

    req.pipe(busboy)
  })
}
