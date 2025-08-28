import "dotenv/config"
import { ShardingManager } from "discord.js"
import { fileURLToPath } from "node:url"
import path from "node:path"

const here = path.dirname(fileURLToPath(import.meta.url))
const isDist = process.env.RUNTIME_DIR === "dist" || here.includes(`${path.sep}dist${path.sep}`)
const worker = isDist ? path.join(here, "index.js") : path.join(here, "index.ts")

const manager = new ShardingManager(worker, {
  token: process.env.DISCORD_TOKEN,
  execArgv: isDist ? [] : ["--loader", "tsx"]
})

manager.on("shardCreate", s => console.log(`Shard ${s.id} launched`))
await manager.spawn()