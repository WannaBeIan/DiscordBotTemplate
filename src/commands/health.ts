import { SlashCommandBuilder } from "discord.js"
import type { Command } from "../types/Command"

function fmt(n: number) {
  const u = ["B", "KB", "MB", "GB"]
  let i = 0, v = n
  while (v >= 1024 && i < u.length - 1) { v /= 1024; i++ }
  return `${v.toFixed(1)} ${u[i]}`
}

const command: Command = {
  data: new SlashCommandBuilder().setName("health").setDescription("Bot status"),
  run: async ({ interaction }) => {
    const c = interaction.client
    const m = process.memoryUsage()
    const lines = [
      `Uptime: ${Math.floor(process.uptime())}s`,
      `WS Ping: ${Math.round(c.ws.ping)}ms`,
      `Guilds: ${c.guilds.cache.size}`,
      `Users: ${c.users.cache.size}`,
      `RSS: ${fmt(m.rss)}`,
      `Heap: ${fmt(m.heapUsed)}/${fmt(m.heapTotal)}`
    ].join("\n")
    await interaction.reply({ content: "```\n" + lines + "\n```", ephemeral: true })
  }
}

export default command
