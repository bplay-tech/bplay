type LogLevel = "info" | "warn" | "error" | "debug";

const log = (level: LogLevel, message: string, data?: unknown) => {
  if (process.env.NODE_ENV === "production" && level === "debug") return;
  const entry = { level, message, timestamp: new Date().toISOString(), ...(data ? { data } : {}) };
  // eslint-disable-next-line no-console
  console[level === "debug" ? "log" : level](JSON.stringify(entry));
};

export const logger = {
  info: (message: string, data?: unknown) => log("info", message, data),
  warn: (message: string, data?: unknown) => log("warn", message, data),
  error: (message: string, data?: unknown) => log("error", message, data),
  debug: (message: string, data?: unknown) => log("debug", message, data),
};
