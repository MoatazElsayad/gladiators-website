import { put } from '@vercel/blob'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const envFiles = ['.env.local', '.env']
const installerPath = path.resolve(projectRoot, '../Gladiators/dist/GladiatorsSetup.exe')
const shouldWriteEnv = process.argv.includes('--write-env')

function loadEnvFile(fileName) {
  const envPath = path.join(projectRoot, fileName)
  if (!fs.existsSync(envPath)) {
    return
  }

  const envText = fs.readFileSync(envPath, 'utf8')
  for (const line of envText.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) {
      continue
    }

    const separator = trimmed.indexOf('=')
    if (separator === -1) {
      continue
    }

    const key = trimmed.slice(0, separator).trim()
    let value = trimmed.slice(separator + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }

    process.env[key] ||= value
  }
}

function upsertEnvValue(fileName, key, value) {
  const envPath = path.join(projectRoot, fileName)
  const current = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : ''
  const line = `${key}=${value}`
  const pattern = new RegExp(`^${key}=.*$`, 'm')
  const next = pattern.test(current)
    ? current.replace(pattern, line)
    : `${current.replace(/\s*$/, '')}\n${line}\n`

  fs.writeFileSync(envPath, next)
}

for (const fileName of envFiles) {
  loadEnvFile(fileName)
}

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  throw new Error('Missing BLOB_READ_WRITE_TOKEN. Pull it from Vercel or add it to .env.local before uploading.')
}

if (!fs.existsSync(installerPath)) {
  throw new Error(`Missing installer: ${installerPath}`)
}

const blobName = `downloads/GladiatorsSetup-${new Date().toISOString().slice(0, 10)}.exe`
const installer = fs.createReadStream(installerPath)
const stat = fs.statSync(installerPath)

let access = 'public'
let blob

try {
  blob = await put(blobName, installer, {
    access,
    addRandomSuffix: false,
    contentType: 'application/vnd.microsoft.portable-executable',
    token: process.env.BLOB_READ_WRITE_TOKEN
  })
} catch (error) {
  if (!String(error?.message || '').includes('private store')) {
    throw error
  }

  access = 'private'
  blob = await put(blobName, fs.createReadStream(installerPath), {
    access,
    addRandomSuffix: false,
    contentType: 'application/vnd.microsoft.portable-executable',
    token: process.env.BLOB_READ_WRITE_TOKEN
  })
}

if (shouldWriteEnv) {
  upsertEnvValue('.env.local', 'GLADIATORS_WINDOWS_INSTALLER_BLOB_URL', blob.url)
}

console.log(`Uploaded ${blobName}`)
console.log(`Access: ${access}`)
console.log(`Size: ${(stat.size / 1024 / 1024).toFixed(1)} MB`)
console.log(`GLADIATORS_WINDOWS_INSTALLER_BLOB_URL=${blob.url}`)
