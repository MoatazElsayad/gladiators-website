import { useEffect, useState } from 'react'
import { apiBaseUrl } from '../lib/api'

export default function AuthenticatedImage({ src, token, alt, className, loading }) {
  const [objectUrl, setObjectUrl] = useState('')
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!src || !token) {
      setObjectUrl('')
      return undefined
    }

    let cancelled = false
    let nextObjectUrl = ''

    async function loadImage() {
      setFailed(false)
      try {
        const response = await fetch(`${apiBaseUrl}${src}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error('Image request failed.')
        }

        const blob = await response.blob()
        nextObjectUrl = URL.createObjectURL(blob)
        if (!cancelled) {
          setObjectUrl(nextObjectUrl)
        }
      } catch (error) {
        if (!cancelled) {
          setObjectUrl('')
          setFailed(true)
        }
      }
    }

    loadImage()

    return () => {
      cancelled = true
      if (nextObjectUrl) {
        URL.revokeObjectURL(nextObjectUrl)
      }
    }
  }, [src, token])

  if (failed) {
    return (
      <div className={`${className || ''} flex items-center justify-center bg-arena-void/80 text-center text-sm text-arena-sand`}>
        Image unavailable
      </div>
    )
  }

  if (!objectUrl) {
    return (
      <div className={`${className || ''} flex items-center justify-center bg-arena-void/80 text-center text-sm text-arena-sand`}>
        Loading image...
      </div>
    )
  }

  return <img src={objectUrl} alt={alt} className={className} loading={loading} />
}
