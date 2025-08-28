import type { CommandInteraction, InteractionReplyOptions, InteractionEditReplyOptions } from "discord.js"

export async function autoDefer(i: CommandInteraction, ephemeral = true) {
  if (!i.deferred && !i.replied) await i.deferReply({ ephemeral })
}

export async function safeReply(i: CommandInteraction, opts: InteractionReplyOptions) {
  if (!i.deferred && !i.replied) return i.reply(opts)
  const { ephemeral, flags, ...rest } = opts as any
  return i.editReply(rest as InteractionEditReplyOptions)
}
