import type { CommandInteraction } from "discord.js"
import { GuildSettingsRepo } from "../repos/GuildSettingsRepo"
import type { KeyValueStore } from "../core/Store"
import type { Env } from "../core/Env"

export async function resolveLocale(i: CommandInteraction, repo: GuildSettingsRepo): Promise<string> {
  return await repo.getLocale(i.guildId)
}

export function createGuildRepo(store: KeyValueStore, env: Env) {
  return new GuildSettingsRepo(store, env)
}
