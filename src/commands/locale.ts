import { SlashCommandBuilder } from "discord.js"
import type { Command } from "../types/Command"
import { createStore } from "../core/Store"
import { loadEnv } from "../core/Env"
import { createGuildRepo } from "../utils/locale"
import { supportedLocales, hasLocale, t } from "../i18n/i18n"

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("locale")
    .setDescription("Get or set locale")
    .addStringOption(o => o.setName("set").setDescription("Locale code").addChoices(...supportedLocales.map(l => ({ name: l, value: l })))),
  guildOnly: true,
  run: async ({ interaction }) => {
    if (!interaction.isChatInputCommand()) return
    const env = loadEnv()
    const repo = createGuildRepo(createStore(env), env)
    const loc = interaction.options.getString("set")
    if (!loc) {
      const cur = await repo.getLocale(interaction.guildId)
      await interaction.reply({ content: t("locale.get", cur, { loc: cur }), ephemeral: true })
      return
    }
    if (!hasLocale(loc)) {
      await interaction.reply({ content: `Unsupported locale: ${loc}`, ephemeral: true })
      return
    }
    await repo.setLocale(interaction.guildId!, loc)
    await interaction.reply({ content: t("locale.set", loc, { loc }), ephemeral: true })
  }
}
export default command
