import "dotenv/config"
import { loadEnv } from "./core/Env"
import { ExtendedClient } from "./core/ExtendedClient"
import { loadCommands, loadEvents, loadJobs, loadModules, loadComponents } from "./core/Loader"
import { validateDiscordToken } from "./core/TokenGuard"
import { metrics } from "./core/Metrics"
import { shardLabel } from "./utils/shardLabel"
async function main() {
  const env = loadEnv()
  const token = validateDiscordToken(env.DISCORD_TOKEN)
  const client = new ExtendedClient(env)
  client.logger.context({ shard: shardLabel(client) })

  await loadCommands(client)
  await loadEvents(client)
  await loadModules(client)
  await loadJobs(client)
  await loadComponents(client)
  process.on("uncaughtException", err => client.logger.error(err, "uncaughtException"))
  process.on("unhandledRejection", reason => client.logger.error(reason, "unhandledRejection"))
  process.on("SIGINT", () => shutdown(client))
  process.on("SIGTERM", () => shutdown(client))
  const port = Number(env.METRICS_PORT ?? "0")
  metrics.start(client, isFinite(port) ? port : 0)
  await client.login(token)
}

async function shutdown(client: ExtendedClient) {
  try { await client.destroy() } catch { }
  process.exit(0)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
