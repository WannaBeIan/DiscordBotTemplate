import { EmbedBuilder, SlashCommandBuilder } from "discord.js"
import type { Command } from "../types/Command"
import type { ExtendedClient } from "../core/ExtendedClient"

const command: Command = {
  data: new SlashCommandBuilder().setName("help").setDescription("List commands"),
  run: async ({ interaction }) => {
    const client = interaction.client as ExtendedClient
    const names = [...client.commands.keys()].sort()
    const embed = new EmbedBuilder().setTitle("Commands").setDescription(names.map(n => "`/" + n + "`").join(" "))
    await interaction.reply({ embeds: [embed], ephemeral: true })
  }
}
export default command
