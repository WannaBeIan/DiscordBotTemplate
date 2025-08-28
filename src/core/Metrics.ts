import http from "node:http"
import { Counter, Gauge, Registry, collectDefaultMetrics } from "prom-client"
import type { Client } from "discord.js"

class Metrics {
  readonly reg = new Registry()
  readonly commands = new Counter({ name: "bot_commands_total", help: "Commands executed", labelNames: ["name"], registers: [this.reg] })
  readonly components = new Counter({ name: "bot_components_total", help: "Components handled", labelNames: ["kind"], registers: [this.reg] })
  readonly errors = new Counter({ name: "bot_errors_total", help: "Errors", labelNames: ["type"], registers: [this.reg] })
  readonly wsPing = new Gauge({ name: "bot_ws_ping_ms", help: "Websocket ping", registers: [this.reg] })
  readonly guilds = new Gauge({ name: "bot_guilds", help: "Guild count", registers: [this.reg] })
  readonly users = new Gauge({ name: "bot_users_cache", help: "Users cached", registers: [this.reg] })
  private server: http.Server | null = null
  start(client: Client, port: number) {
    collectDefaultMetrics({ register: this.reg })
    setInterval(() => {
      this.wsPing.set(Math.max(0, Math.round(client.ws.ping)))
      this.guilds.set(client.guilds.cache.size)
      this.users.set(client.users.cache.size)
    }, 5000).unref()
    if (port > 0 && !this.server) {
      this.server = http.createServer(async (req, res) => {
        if (req.url === "/metrics") {
          const out = await this.reg.metrics()
          res.writeHead(200, { "Content-Type": this.reg.contentType })
          res.end(out)
          return
        }
        res.writeHead(200, { "Content-Type": "text/plain" })
        res.end("ok")
      })
      this.server.listen(port)
    }
  }
}

export const metrics = new Metrics()
