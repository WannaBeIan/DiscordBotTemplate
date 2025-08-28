import type { Client } from "discord.js"

export function shardLabel(client?: Client) {
  const env = process.env.SHARD_ID ?? (process.env.SHARDS?.split(",")[0] ?? "")
  const envId = Number(env)
  const id = Number.isFinite(envId) ? envId : (client?.shard?.ids?.[0] ?? 0)
  return `S${id}`
}
export function resolveShardLabel(client?: Client) {
  return process.env.SHARD_ID ? `S${process.env.SHARD_ID}` : shardLabel(client)
}