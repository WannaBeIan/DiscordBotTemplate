import dotenv from 'dotenv'
dotenv.config()
import { loadEnv } from "./core/Env"
import { ExtendedClient } from "./core/ExtendedClient"
import { loadCommands, loadEvents, loadJobs, loadModules, loadComponents } from "./core/Loader"
import { validateDiscordToken } from "./core/TokenGuard"
import { metrics } from "./core/Metrics"

function envPort(key: string, fallback: number) {
  const raw = process.env[key]
  if (!raw) return fallback
  const cleaned = raw.trim().replace(/^['"]|['"]$/g, '').replace(/\s*#.*$/, '')
  const n = parseInt(cleaned, 10)
  return Number.isFinite(n) && n >= 1 && n <= 65535 ? n : fallback
}

function currentShardId(client: any) {
  const ids = client?.shard?.ids
  if (Array.isArray(ids) && ids.length) return ids[0]
  const envRaw = String(process.env.SHARD_LIST ?? '').split(',')[0]?.trim()
  const n = Number(envRaw)
  return Number.isFinite(n) && n >= 0 ? n : 0
}

async function main() {
  const env = loadEnv()
  const token = validateDiscordToken(env.DISCORD_TOKEN)
  const client = new ExtendedClient(env)

  await loadCommands(client)
  await loadEvents(client)
  await loadModules(client)
  await loadJobs(client)
  await loadComponents(client)

  process.on('uncaughtException', e => client.logger.error(e, 'uncaughtException'))
  process.on('unhandledRejection', e => client.logger.error(e as any, 'unhandledRejection'))
  process.on('SIGINT', () => shutdown(client))
  process.on('SIGTERM', () => shutdown(client))

  client.once('clientReady', async () => {
    const sid = currentShardId(client)
    if (sid === 0) {
      const port = envPort('METRICS_PORT', 3100)
      await metrics.start(client, port, { shardId: sid, perShard: false })
    }
  })

  await client.login(token)
}

async function shutdown(client: ExtendedClient) {
  try { await client.destroy() } finally { process.exit(0) }
}

main().catch(err => { console.error(err); process.exit(1) })