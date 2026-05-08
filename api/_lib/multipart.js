import Busboy from 'busboy'

export async function readMultipartBody(req, { maxFileSize = 4 * 1024 * 1024 } = {}) {
  return new Promise((resolve, reject) => {
    const fields = {}
    let fileBuffer = null
    let fileMimeType = ''
    let fileName = ''
    let fileTooLarge = false

    const busboy = Busboy({
      headers: req.headers,
      limits: {
        files: 1,
        fileSize: maxFileSize
      }
    })

    busboy.on('field', (name, value) => {
      fields[name] = value
    })

    busboy.on('file', (name, file, info) => {
      fileMimeType = info.mimeType || ''
      fileName = info.filename || ''
      const chunks = []

      file.on('limit', () => {
        fileTooLarge = true
      })

      file.on('data', (chunk) => {
        chunks.push(chunk)
      })

      file.on('end', () => {
        fileBuffer = Buffer.concat(chunks)
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
        fileBuffer,
        fileMimeType,
        fileName
      })
    })

    req.pipe(busboy)
  })
}
