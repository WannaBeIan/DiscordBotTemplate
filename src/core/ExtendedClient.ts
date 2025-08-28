import { Client, Collection, GatewayIntentBits, Partials } from "discord.js"
import { Logger } from "./Logger"
import type { Command } from "../types/Command"
import type { Env } from "./Env"
import { ComponentRouter } from "./ComponentRouter"

export class ExtendedClient extends Client {
  readonly logger = new Logger()
  readonly commands = new Collection<string, Command>()
  readonly cooldowns = new Collection<string, Map<string, number>>()
  readonly components = new ComponentRouter()
  readonly env: Env

constructor(env: Env) {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
      ],
      partials: [Partials.Channel, Partials.GuildMember, Partials.User]
    })
    this.env = env
  }
}