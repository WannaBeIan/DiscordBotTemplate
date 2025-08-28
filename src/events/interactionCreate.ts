import { Collection, Interaction } from "discord.js"
import type { Event } from "../types/Event"
import type { Command } from "../types/Command"
import { metrics } from "../core/Metrics"

const timestamps = new Collection<string, number>()
function key(userId: string, name: string) { return `${userId}:${name}` }

const event: Event = {
  name: "interactionCreate",
  run: async (client, i: Interaction) => {
    if (i.isChatInputCommand() || i.isUserContextMenuCommand() || i.isMessageContextMenuCommand()) {
      const cmd = client.commands.get(i.commandName) as Command | undefined
      if (!cmd) { await i.reply({ content: "Unavailable command.", ephemeral: true }); metrics.errors.inc({ type: "cmd_not_found" }); return }
      metrics.commands.inc({ name: i.commandName })
      if (cmd.guildOnly && !i.guild) { await i.reply({ content: "Guild only.", ephemeral: true }); return }
      const cd = cmd.cooldown ?? 0
      if (i.isChatInputCommand() && cd > 0) {
        const k = key(i.user.id, i.commandName)
        const last = timestamps.get(k) ?? 0
        const remain = last + cd - Date.now()
        if (remain > 0) { await i.reply({ content: `Slow down. ${Math.ceil(remain / 1000)}s`, ephemeral: true }); return }
        timestamps.set(k, Date.now())
        setTimeout(() => timestamps.delete(k), cd)
      }
      try { await cmd.run({ interaction: i }) }
      catch (err) {
        client.logger.error(err)
        metrics.errors.inc({ type: "cmd_error" })
        if (i.isRepliable()) {
          if (i.deferred || i.replied) await i.editReply({ content: "Error." })
          else await i.reply({ content: "Error.", ephemeral: true })
        }
      }
      return
    }
    if (i.isAutocomplete()) {
      try {
        const cmd = client.commands.get(i.commandName) as any
        const fn = cmd?.autocomplete as ((x: any) => Promise<void>) | undefined
        await (fn ? fn(i) : i.respond([]))
      } catch { metrics.errors.inc({ type: "autocomplete_error" }); await i.respond([]) }
      return
    }
    if (i.isButton() || i.isStringSelectMenu() || i.isModalSubmit()) {
      metrics.components.inc({ kind: i.isButton() ? "button" : i.isStringSelectMenu() ? "select" : "modal" })
      await client.components.route(i as any)
    }
  }
}

export default event
