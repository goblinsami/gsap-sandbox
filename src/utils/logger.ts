const DEBUG_LOGS_ENABLED = import.meta.env.DEV || String(import.meta.env.VITE_DEBUG_LOGS ?? '').toLowerCase() === 'true'

export const debugLog = (...args: unknown[]) => {
  if (!DEBUG_LOGS_ENABLED) return
  console.log(...args)
}

export const isDebugLogsEnabled = DEBUG_LOGS_ENABLED
