import fs from "node:fs"
import path from "node:path"
import Database from "better-sqlite3"
import Redis from "ioredis"
import type { Env } from "./Env"

export interface KeyValueStore {
  get(key: string): Promise<string | null>
  set(key: string, value: string): Promise<void>
  del(key: string): Promise<void>
}

class MemoryStore implements KeyValueStore {
  private m = new Map<string, string>()
  async get(key: string) { return this.m.get(key) ?? null }
  async set(key: string, value: string) { this.m.set(key, value) }
  async del(key: string) { this.m.delete(key) }
}

class SqliteStore implements KeyValueStore {
  private db: Database.Database
  private getStmt: Database.Statement
  private setStmt: Database.Statement
  private delStmt: Database.Statement
  constructor(file: string) {
    const dir = path.dirname(file)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    this.db = new Database(file)
    this.db.exec("CREATE TABLE IF NOT EXISTS kv (k TEXT PRIMARY KEY, v TEXT NOT NULL)")
    this.getStmt = this.db.prepare("SELECT v FROM kv WHERE k = ?")
    this.setStmt = this.db.prepare("INSERT INTO kv (k, v) VALUES (?, ?) ON CONFLICT(k) DO UPDATE SET v=excluded.v")
    this.delStmt = this.db.prepare("DELETE FROM kv WHERE k = ?")
  }
  async get(key: string) { const r = this.getStmt.get(key) as { v: string } | undefined; return r?.v ?? null }
  async set(key: string, value: string) { this.setStmt.run(key, value) }
  async del(key: string) { this.delStmt.run(key) }
}

class RedisStore implements KeyValueStore {
  private r: Redis
  constructor(url: string) { this.r = new Redis(url) }
  async get(key: string) { return await this.r.get(key) }
  async set(key: string, value: string) { await this.r.set(key, value) }
  async del(key: string) { await this.r.del(key) }
}

export function createStore(env: Env): KeyValueStore {
  if (env.STORE_BACKEND === "sqlite") return new SqliteStore(env.SQLITE_PATH!)
  if (env.STORE_BACKEND === "redis") return new RedisStore(env.REDIS_URL!)
  return new MemoryStore()
}
