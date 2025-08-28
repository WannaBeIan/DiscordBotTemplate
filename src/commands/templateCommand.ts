import { SlashCommandBuilder } from "discord.js"
import type { Command } from "../types/Command"

const command: Command = {
  data: new SlashCommandBuilder().setName("template").setDescription("Template command"),
  run: async ({ interaction }) => {
    if (!interaction.isChatInputCommand()) return
    await interaction.reply({ content: "Template executed.", ephemeral: true })
  }
}

export default command
