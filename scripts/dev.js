import { spawn } from 'node:child_process'
import net from 'node:net'
import path from 'node:path'
import process from 'node:process'

const root = process.cwd()
const isWindows = process.platform === 'win32'

function bin(name) {
  return path.join(root, 'node_modules', '.bin', isWindows ? `${name}.cmd` : name)
}

function isPortOpen(port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ port, host: '127.0.0.1' })
    socket.once('connect', () => {
      socket.destroy()
      resolve(true)
    })
    socket.once('error', () => resolve(false))
  })
}

const children = []

if (await isPortOpen(3001)) {
  console.log('Local API server already listening at http://localhost:3001')
} else {
  children.push(spawn(process.execPath, [path.join(root, 'server', 'server.js')], {
    cwd: root,
    stdio: 'inherit',
    shell: false
  }))
}

children.push(spawn(bin('vite'), [], {
  cwd: root,
  stdio: 'inherit',
  shell: isWindows
}))

function stopAll(signal) {
  for (const child of children) {
    if (!child.killed) {
      child.kill(signal)
    }
  }
}

for (const child of children) {
  child.on('exit', (code) => {
    if (code && code !== 0) {
      stopAll('SIGTERM')
      process.exit(code)
    }
  })
}

process.on('SIGINT', () => {
  stopAll('SIGINT')
  process.exit(0)
})

process.on('SIGTERM', () => {
  stopAll('SIGTERM')
  process.exit(0)
})
