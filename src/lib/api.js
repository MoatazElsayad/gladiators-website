const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()

export const apiBaseUrl = configuredBaseUrl && configuredBaseUrl.length > 0
  ? configuredBaseUrl.replace(/\/$/, '')
  : ''

export async function fetchJson(path, options = {}) {
  let response

  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    })
  } catch (error) {
    throw new Error(
      `Could not reach the Gladiators backend${apiBaseUrl ? ` at ${apiBaseUrl}` : ''}. Start the website server or set VITE_API_BASE_URL correctly.`
    )
  }

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    const message = payload?.message || `Request failed with status ${response.status}`
    throw new Error(message)
  }

  return payload
}
