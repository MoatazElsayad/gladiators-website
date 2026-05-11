import { Pause, Play, RotateCcw } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { apiBaseUrl } from '../lib/api'
import AuthenticatedImage from './AuthenticatedImage'

export default function HighlightClipPlayer({ highlight, token }) {
  const [objectUrl, setObjectUrl] = useState('')
  const [failed, setFailed] = useState(false)
  const [failureReason, setFailureReason] = useState('')
  const [playing, setPlaying] = useState(true)
  const [frameIndex, setFrameIndex] = useState(0)

  const frameCount = Math.max(0, Number(highlight?.clipFrameCount || 0))
  const fps = Math.max(1, Number(highlight?.clipFps || 10))
  const columns = 5
  const rows = Math.max(1, Math.ceil(Math.max(frameCount, 1) / columns))
  const hasClip = Boolean(highlight?.clipSheetUrl && frameCount > 0)

  useEffect(() => {
    if (!hasClip || !token || !highlight?.id) {
      setObjectUrl('')
      setFailed(!hasClip)
      setFailureReason(!hasClip ? 'Poster only: this highlight was uploaded without a replay clip.' : '')
      return undefined
    }

    let cancelled = false
    let nextObjectUrl = ''

    async function loadClip() {
      setFailed(false)
      setFailureReason('')
      try {
        const response = await fetch(`${apiBaseUrl}/api/highlights/${highlight.id}/image?asset=clip`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error('Clip request failed.')
        }

        const blob = await response.blob()
        nextObjectUrl = URL.createObjectURL(blob)
        if (!cancelled) {
          setObjectUrl(nextObjectUrl)
          setFrameIndex(0)
          setPlaying(true)
        }
      } catch (error) {
        if (!cancelled) {
          setObjectUrl('')
          setFailed(true)
          setFailureReason('Replay clip unavailable. Showing the poster capture.')
        }
      }
    }

    loadClip()

    return () => {
      cancelled = true
      if (nextObjectUrl) {
        URL.revokeObjectURL(nextObjectUrl)
      }
    }
  }, [hasClip, highlight?.id, token])

  useEffect(() => {
    if (!playing || !objectUrl || frameCount <= 1) {
      return undefined
    }

    const interval = window.setInterval(() => {
      setFrameIndex((current) => {
        if (current >= frameCount - 1) {
          return 0
        }
        return current + 1
      })
    }, 1000 / fps)

    return () => window.clearInterval(interval)
  }, [fps, frameCount, objectUrl, playing])

  const frameStyle = useMemo(() => {
    const safeIndex = Math.min(Math.max(frameIndex, 0), Math.max(frameCount - 1, 0))
    const col = safeIndex % columns
    const row = Math.floor(safeIndex / columns)
    const x = columns <= 1 ? 0 : (col / (columns - 1)) * 100
    const y = rows <= 1 ? 0 : (row / (rows - 1)) * 100

    return {
      backgroundImage: `url(${objectUrl})`,
      backgroundSize: `${columns * 100}% ${rows * 100}%`,
      backgroundPosition: `${x}% ${y}%`
    }
  }, [frameCount, frameIndex, objectUrl, rows])

  if (failed || !objectUrl) {
    return (
      <div>
        <div className="aspect-video bg-arena-void/80">
          <AuthenticatedImage
            src={`/api/highlights/${highlight.id}/image`}
            token={token}
            alt={`${highlight.username} battle highlight`}
            className="h-full w-full object-cover"
          />
        </div>
        {failureReason && (
          <div className="border-t border-arena-bronzeLight/20 bg-arena-panel/80 px-4 py-3 text-xs uppercase tracking-[0.14em] text-arena-sand">
            {failureReason}
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <div className="aspect-video overflow-hidden bg-arena-void/80">
        <div
          className="h-full w-full bg-cover bg-no-repeat"
          style={frameStyle}
          role="img"
          aria-label={`${highlight.username} battle replay`}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-arena-bronzeLight/20 bg-arena-panel/80 px-4 py-3">
        <button
          type="button"
          onClick={() => setPlaying((value) => !value)}
          className="ghost-button px-4 py-2"
        >
          {playing ? <Pause className="mr-2 h-3.5 w-3.5" /> : <Play className="mr-2 h-3.5 w-3.5" />}
          {playing ? 'Pause' : 'Play'}
        </button>
        <button
          type="button"
          onClick={() => {
            setFrameIndex(0)
            setPlaying(true)
          }}
          className="ghost-button px-4 py-2"
        >
          <RotateCcw className="mr-2 h-3.5 w-3.5" />
          Replay
        </button>
        <input
          type="range"
          min="0"
          max={Math.max(frameCount - 1, 0)}
          value={frameIndex}
          onChange={(event) => {
            setPlaying(false)
            setFrameIndex(Number(event.target.value))
          }}
          className="h-2 min-w-[180px] flex-1 accent-[#FFD700]"
          aria-label="Replay frame"
        />
        <span className="text-xs uppercase tracking-[0.16em] text-arena-sand">
          {Math.min(frameIndex + 1, frameCount)} / {frameCount}
        </span>
      </div>
    </div>
  )
}
