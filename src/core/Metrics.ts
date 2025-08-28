import http from 'node:http'
import type { Client } from 'discord.js'
import {
  Registry,
  collectDefaultMetrics,
  Counter,
  Gauge
} from 'prom-client'

type StartOpts = { shardId: number; perShard: boolean }

class Metrics {
  private server?: http.Server
  private reg = new Registry()
  private started = false
  private updater?: NodeJS.Timeout

  readonly commands = new Counter({ name: 'bot_commands_total', help: 'Commands executed', labelNames: ['name'], registers: [this.reg] })
  readonly components = new Counter({ name: 'bot_components_total', help: 'Components handled', labelNames: ['kind'], registers: [this.reg] })
  readonly errors = new Counter({ name: 'bot_errors_total', help: 'Errors', labelNames: ['type'], registers: [this.reg] })
  private ws = new Gauge({ name: 'bot_ws_ping_ms', help: 'Websocket ping', registers: [this.reg] })
  private guilds = new Gauge({ name: 'bot_guilds', help: 'Guild count', registers: [this.reg] })
  private users = new Gauge({ name: 'bot_users_cache', help: 'Users cached', registers: [this.reg] })

  constructor() {
    collectDefaultMetrics({ register: this.reg })
  }

  async start(client: Client, port: number, opts: StartOpts) {
    if (this.started) return
    if (!opts.perShard && opts.shardId !== 0) return

    const srv = http.createServer(async (req, res) => {
      if (req.url === '/metrics') {
        try {
          const data = await this.reg.metrics()
          res.writeHead(200, { 'Content-Type': this.reg.contentType })
          res.end(data)
        } catch {
          res.writeHead(500)
          res.end()
        }
      } else {
        res.writeHead(404)
        res.end()
      }
    })

    await new Promise<void>((resolve, reject) => {
      const onListening = () => { cleanup(); resolve() }
      const onError = (err: any) => {
        cleanup()
        if (err && err.code === 'EADDRINUSE') resolve()
        else reject(err)
      }
      const cleanup = () => {
        srv.removeListener('listening', onListening)
        srv.removeListener('error', onError)
      }
      srv.once('listening', onListening)
      srv.once('error', onError)
      srv.listen(port)
    })

    this.server = srv
    this.started = true

    this.updater = setInterval(() => {
      this.ws.set((client.ws as any).ping || 0)
      this.guilds.set(client.guilds.cache.size)
      this.users.set(client.users.cache.size)
    }, 5000)
  }

  async stop() {
    if (!this.started) return
    if (this.updater) clearInterval(this.updater)
    this.updater = undefined
    const s = this.server
    this.server = undefined
    this.started = false
    if (!s) return
    await new Promise<void>(resolve => s.close(() => resolve()))
  }

  get registry() {
    return this.reg
  }
}

export const metrics = new Metrics()
export type { Metrics }
