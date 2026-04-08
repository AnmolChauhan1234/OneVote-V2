type LogLevel = "debug" | "info" | "warn" | "error"

interface LogEntry {
  level: LogLevel
  message: string
  data?: unknown
  timestamp: string
}

const isDev = process.env.NODE_ENV === "development"

const formatEntry = (level: LogLevel, message: string, data?: unknown): LogEntry => ({
  level,
  message,
  data,
  timestamp: new Date().toISOString(),
})

const STYLES = {
  debug: "color: #6366f1; font-weight: bold",  // indigo
  info:  "color: #22c55e; font-weight: bold",  // green
  warn:  "color: #f59e0b; font-weight: bold",  // amber
  error: "color: #ef4444; font-weight: bold",  // red
} as const

export const logger = {
  debug: (message: string, data?: unknown) => {
    if (!isDev) return
    const entry = formatEntry("debug", message, data)
    console.debug(`%c[DEBUG] ${entry.timestamp} — ${message}`, STYLES.debug, data ?? "")
  },

  info: (message: string, data?: unknown) => {
    if (!isDev) return
    const entry = formatEntry("info", message, data)
    console.info(`%c[INFO] ${entry.timestamp} — ${message}`, STYLES.info, data ?? "")
  },

  warn: (message: string, data?: unknown) => {
    // warn logs even in production — it's not sensitive, it's a warning
    const entry = formatEntry("warn", message, data)
    console.warn(`%c[WARN] ${entry.timestamp} — ${message}`, STYLES.warn, data ?? "")
  },

  error: (message: string, data?: unknown) => {
    // errors always log — you need to know about these
    const entry = formatEntry("error", message, data)
    console.error(`%c[ERROR] ${entry.timestamp} — ${message}`, STYLES.error, data ?? "")
  },
}