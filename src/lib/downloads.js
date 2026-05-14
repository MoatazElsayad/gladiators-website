export const windowsInstallerUrl = import.meta.env.VITE_GLADIATORS_WINDOWS_INSTALLER_URL || ''

export function handleMissingInstaller(event) {
  if (windowsInstallerUrl) {
    return
  }

  event.preventDefault()
  window.alert('The Windows installer is not connected yet. Please try again after the next deployment.')
}
