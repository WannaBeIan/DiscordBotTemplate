import type { KeyValueStore } from "../core/Store"
import type { Env } from "../core/Env"

export class GuildSettingsRepo {
  constructor(private store: KeyValueStore, private env: Env) {}
  async getLocale(guildId?: string | null) {
    if (!guildId) return this.env.LOCALE_DEFAULT ?? "en-US"
    const v = await this.store.get(`guild:${guildId}:locale`)
    return v ?? (this.env.LOCALE_DEFAULT ?? "en-US")
  }
  async setLocale(guildId: string, locale: string) {
    await this.store.set(`guild:${guildId}:locale`, locale)
  }
}
