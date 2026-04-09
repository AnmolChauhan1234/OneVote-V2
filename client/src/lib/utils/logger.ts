import { LogEntry } from "@/types/logger.type";

type LogLevel = "debug" | "info" | "warn" | "error";

const isDev = process.env.NEXT_ENV === "development";

// ─── ANSI escape helpers ───────────────────────────────────────────────────────
const ANSI = {
  reset:    "\x1b[0m",
  bold:     "\x1b[1m",
  dim:      "\x1b[2m",
  white:    "\x1b[97m",
  black:    "\x1b[30m",
  bgIndigo: "\x1b[48;5;99m",
  bgGreen:  "\x1b[48;5;40m",
  bgAmber:  "\x1b[48;5;214m",
  bgRed:    "\x1b[48;5;196m",
} as const;

const LEVEL_STYLE: Record<LogLevel, { bg: string; fg: string; label: string }> = {
  debug: { bg: ANSI.bgIndigo, fg: ANSI.white, label: " DEBUG " },
  info:  { bg: ANSI.bgGreen,  fg: ANSI.black, label: "  INFO " },
  warn:  { bg: ANSI.bgAmber,  fg: ANSI.black, label: "  WARN " },
  error: { bg: ANSI.bgRed,    fg: ANSI.white, label: " ERROR " },
};

// ─── Browser CSS ───────────────────────────────────────────────────────────────
const BROWSER_STYLES: Record<LogLevel, string> = {
  debug: "background:#6366f1;color:#fff;font-weight:bold;padding:2px 8px;border-radius:3px",
  info:  "background:#22c55e;color:#000;font-weight:bold;padding:2px 8px;border-radius:3px",
  warn:  "background:#f59e0b;color:#000;font-weight:bold;padding:2px 8px;border-radius:3px",
  error: "background:#ef4444;color:#fff;font-weight:bold;padding:2px 8px;border-radius:3px",
};

// ─── Environment detection ─────────────────────────────────────────────────────
const isNode =
  typeof process !== "undefined" &&
  process.versions != null &&
  process.versions.node != null;

const supportsColor =
  isNode &&
  process.stdout.isTTY &&
  process.env.NO_COLOR == null;

// ─── Helpers ───────────────────────────────────────────────────────────────────
const formatEntry = (level: LogLevel, message: string, data?: unknown): LogEntry => ({
  level,
  message,
  data,
  timestamp: new Date().toISOString(),
});

const shortTime = (iso: string) => iso.slice(11, 19);

// Terminal vertical padding — one blank line above and below each log entry
const PAD = "";

const logToTerminal = (level: LogLevel, entry: LogEntry, data?: unknown) => {
  const { bg, fg, label } = LEVEL_STYLE[level];
  const time = shortTime(entry.timestamp);

  const badge = supportsColor
    ? `${bg}${fg}${ANSI.bold}${label}${ANSI.reset}`
    : `[${level.toUpperCase()}]`;

  const msg = supportsColor
    ? `${ANSI.bold}${entry.message}${ANSI.reset}`
    : entry.message;

  const timestamp = supportsColor
    ? `${ANSI.dim}${time}${ANSI.reset}`
    : time;

  const line = `${badge} ${timestamp} ${msg}`;

  const consoleFn =
    level === "debug" ? console.debug
    : level === "info"  ? console.info
    : level === "warn"  ? console.warn
    : console.error;

  if (data !== undefined) {
    consoleFn(`${PAD}\n${line}\n`, "\n          ", data, `\n${PAD}`);
  } else {
    consoleFn(`${PAD}\n${line}\n${PAD}`);
  }
};

const logToBrowser = (level: LogLevel, entry: LogEntry, data?: unknown) => {
  const style = BROWSER_STYLES[level];
  const time  = shortTime(entry.timestamp);
  const label = level.toUpperCase();

  const consoleFn =
    level === "debug" ? console.debug
    : level === "info"  ? console.info
    : level === "warn"  ? console.warn
    : console.error;

  consoleFn(
    `%c ${label} %c ${time} — ${entry.message}`,
    style,
    "color:inherit",
    data ?? ""
  );
};

// ─── Internal emit ─────────────────────────────────────────────────────────────
const emit = (level: LogLevel, message: string, data?: unknown) => {
  const entry = formatEntry(level, message, data);
  if (isNode) {
    logToTerminal(level, entry, data);
  } else {
    logToBrowser(level, entry, data);
  }
};

// ─── Public API ───────────────────────────────────────────────────────────────
export const logger = {
  /** Dev-only. Indigo badge. */
  debug: (message: string, data?: unknown) => {
    if (!isDev) return;
    emit("debug", message, data);
  },

  /** Dev-only. Green badge. */
  info: (message: string, data?: unknown) => {
    if (!isDev) return;
    emit("info", message, data);
  },

  /** Always logs. Amber badge. */
  warn: (message: string, data?: unknown) => {
    emit("warn", message, data);
  },

  /** Always logs. Red badge. */
  error: (message: string, data?: unknown) => {
    emit("error", message, data);
  },
};