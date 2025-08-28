import "dotenv/config"
import { logger } from "./core/Logger"
import { loadEnv } from "./core/Env"
import { ExtendedClient } from "./core/ExtendedClient"
import { loadCommands, loadEvents, loadModules, loadJobs, loadComponents } from "./core/Loader"
import { validateDiscordToken } from "./core/TokenGuard"
import { metrics } from "./core/Metrics"

async function main() {
  const env = loadEnv()
  const token = validateDiscordToken(env.DISCORD_TOKEN)
  const client = new ExtendedClient(env)

  function shardIdNow(): number {
    const ids = client?.shard?.ids
    if (Array.isArray(ids) && ids.length) return Number(ids[0])
    const first = (process.env.SHARD_LIST || "")
      .split(",")
      .map(s => s.trim())
      .find(s => /^\d+$/.test(s))
    return first ? Number(first) : 0
  }

  client.logger.context({ shard: `S${shardIdNow()}` })

  await loadCommands(client)
  await loadEvents(client)
  await loadModules(client)
  await loadJobs(client)
  await loadComponents(client)

  process.on('uncaughtException', e => client.logger.error(e, 'uncaughtException'))
  process.on('unhandledRejection', e => client.logger.error(e as any, 'unhandledRejection'))
  process.on('SIGINT', () => shutdown(client))
  process.on('SIGTERM', () => shutdown(client))

  client.once("clientReady", async () => {
    const sid = client.shard?.ids?.[0] ?? 0
    if (sid === 0) {
      const port = Number(process.env.METRICS_PORT || 3100)
      await metrics.start(client, port, { shardId: sid, perShard: false })
    }
  })

  await client.login(token)
}

async function shutdown(client: ExtendedClient) {
  try { await client.destroy() } finally { process.exit(0) }
}

main().catch(err => { console.error(err); process.exit(1) })