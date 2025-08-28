import pino from "pino"

type L = "debug" | "info" | "warn" | "error"

export class Logger {
  private logger: pino.Logger
  constructor(level: L = process.env.NODE_ENV === "production" ? "info" : "debug") {
    const dev = process.env.NODE_ENV !== "production"
    this.logger = pino({
      level,
      base: {},
      timestamp: pino.stdTimeFunctions.isoTime,
      transport: dev
        ? {
            target: "pino-pretty",
            options: {
              colorize: true,
              translateTime: "SYS:HH:mm:ss.l",
              singleLine: true,
              ignore: "pid,hostname",
              messageFormat: "[{shard}] {module} {msg}"
            }
          }
        : undefined
    })
  }

  context(bindings: Record<string, unknown>) {
    this.logger = this.logger.child(bindings)
  }

  private log(level: L, input: unknown, msg?: string) {
    if (input instanceof Error) {
      this.logger[level]({ err: { name: input.name, message: input.message, stack: input.stack } }, msg ?? input.message)
    } else if (typeof input === "string") {
      this.logger[level](input)
    } else if (input && typeof input === "object") {
      this.logger[level](input as Record<string, unknown>, msg ?? "")
    } else {
      this.logger[level](String(input))
    }
  }

  debug(input: unknown, msg?: string) { this.log("debug", input, msg) }
  info(input: unknown, msg?: string) { this.log("info", input, msg) }
  warn(input: unknown, msg?: string) { this.log("warn", input, msg) }
  error(input: unknown, msg?: string) { this.log("error", input, msg) }
}
