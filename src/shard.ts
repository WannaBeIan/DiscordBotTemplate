import 'dotenv/config'
import { ShardingManager } from 'discord.js'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { ChildProcess } from 'node:child_process'

const here = path.dirname(fileURLToPath(import.meta.url))
const isDist = process.env.RUNTIME_DIR === 'dist' || here.includes(`${path.sep}dist${path.sep}`)
const worker = path.join(here, isDist ? 'index.js' : 'index.ts')

if (!process.env.DISCORD_TOKEN) {
  console.error('DISCORD_TOKEN is missing')
  process.exit(1)
}

const manager = new ShardingManager(worker, {
  token: process.env.DISCORD_TOKEN,
  execArgv: isDist ? [] : ['--import', 'tsx', '--enable-source-maps'],
  respawn: false
})

manager.on('shardCreate', s => {
  console.log(`Shard ${s.id} launched`)
  const cp = s.process as ChildProcess | null
  if (cp?.stdout) cp.stdout.on('data', d => process.stdout.write(`[S${s.id}] ${d}`))
  if (cp?.stderr) cp.stderr.on('data', d => process.stderr.write(`[S${s.id}] ERR ${d}`))
  cp?.on('exit', (code, signal) => console.error(`Shard ${s.id} exited`, { code, signal }))
  s.on('error', e => console.error(`Shard ${s.id} error`, e))
  s.on('disconnect', () => console.error(`Shard ${s.id} disconnected`))
  s.on('death', () => console.error(`Shard ${s.id} died`))
})

await manager.spawn({ amount: 2 })
