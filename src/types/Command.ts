import {
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
  SlashCommandOptionsOnlyBuilder,
  ContextMenuCommandBuilder,
  type CommandInteraction,
  type PermissionResolvable
} from "discord.js"

export type CommandData =
  | SlashCommandBuilder
  | SlashCommandSubcommandsOnlyBuilder
  | SlashCommandOptionsOnlyBuilder
  | ContextMenuCommandBuilder

export type Command = {
  data: CommandData
  run: (ctx: { interaction: CommandInteraction }) => Promise<void>
  cooldown?: number
  guildOnly?: boolean
  dmPermission?: boolean
  defaultMemberPermissions?: PermissionResolvable | null
  userPerms?: PermissionResolvable[] | PermissionResolvable
  botPerms?: PermissionResolvable[] | PermissionResolvable
  ownerOnly?: boolean
}
