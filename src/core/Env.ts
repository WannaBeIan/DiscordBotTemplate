export type Env = {
  DISCORD_TOKEN: string
  DISCORD_CLIENT_ID: string
  DEFAULT_GUILD_ID?: string
  NODE_ENV?: string
  OWNER_IDS?: string[]
  STORE_BACKEND?: "memory" | "sqlite" | "redis"
  SQLITE_PATH?: string
  REDIS_URL?: string
  LOCALE_DEFAULT?: string
  METRICS_PORT?: string
}

export function loadEnv(): Env {
  return {
    DISCORD_TOKEN: must(process.env.DISCORD_TOKEN, "DISCORD_TOKEN"),
    DISCORD_CLIENT_ID: must(process.env.DISCORD_CLIENT_ID, "DISCORD_CLIENT_ID"),
    DEFAULT_GUILD_ID: process.env.DEFAULT_GUILD_ID,
    NODE_ENV: process.env.NODE_ENV,
    OWNER_IDS: parseList(process.env.OWNER_IDS),
    STORE_BACKEND: (process.env.STORE_BACKEND as any) ?? "memory",
    SQLITE_PATH: process.env.SQLITE_PATH ?? "./data/bot.db",
    REDIS_URL: process.env.REDIS_URL,
    LOCALE_DEFAULT: process.env.LOCALE_DEFAULT ?? "en-US",
    METRICS_PORT: process.env.METRICS_PORT ?? "0"
  }
}

function must(v: string | undefined, k: string): string {
  if (!v || v.trim() === "") throw new Error(`Missing env ${k}`)
  return v
}

function parseList(v?: string) {
  return v ? v.split(",").map(s => s.trim()).filter(Boolean) : undefined
}
