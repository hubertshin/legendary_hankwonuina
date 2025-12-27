import pino from "pino";

const isDev = process.env.NODE_ENV === "development";

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDev ? "debug" : "info"),
  transport: isDev
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      }
    : undefined,
  base: {
    env: process.env.NODE_ENV,
  },
  redact: ["password", "token", "secret", "apiKey"],
});

// Create child loggers for different components
export const dbLogger = logger.child({ component: "database" });
export const apiLogger = logger.child({ component: "api" });
export const workerLogger = logger.child({ component: "worker" });
export const authLogger = logger.child({ component: "auth" });

export default logger;
