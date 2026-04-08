export interface LogEntry {
  level: LogLevel
  message: string
  data?: unknown
  timestamp: string
}