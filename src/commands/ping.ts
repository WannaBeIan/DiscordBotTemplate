import { SlashCommandBuilder } from "discord.js"
import type { Command } from "../types/Command"
import { createStore } from "../core/Store"
import { loadEnv } from "../core/Env"
import { createGuildRepo, resolveLocale } from "../utils/locale"
import { t } from "../i18n/i18n"

const command: Command = {
  data: new SlashCommandBuilder().setName("ping").setDescription("Latency check"),
  cooldown: 3000,
  run: async ({ interaction }) => {
    const env = loadEnv()
    const repo = createGuildRepo(createStore(env), env)
    const loc = await resolveLocale(interaction, repo)
    const sent = await interaction.reply({ content: "Pinging...", ephemeral: true, fetchReply: true })
    const diff = sent.createdTimestamp - interaction.createdTimestamp
    await interaction.editReply(t("ping.pong", loc, { ms: diff }))
  }
}

export default command
