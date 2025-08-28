import "dotenv/config"
import { REST, Routes, SlashCommandBuilder } from "discord.js"
import fg from "fast-glob"
import path from "node:path"
import { pathToFileURL } from "node:url"

async function load() {
  const files = await fg(["src/commands/**/*.ts", "src/commands/**/*.js"], { absolute: true })
  const cmds: any[] = []
  for (const f of files) {
    const mod = await import(pathToFileURL(f).toString())
    const data: SlashCommandBuilder | undefined = mod.default?.data
    if (data) cmds.push(data.toJSON())
  }
  return cmds
}

async function main() {
  const token = must(process.env.DISCORD_TOKEN, "DISCORD_TOKEN")
  const clientId = must(process.env.DISCORD_CLIENT_ID, "DISCORD_CLIENT_ID")
  const defaultGuild = process.argv.includes("--guild") ? must(process.env.DEFAULT_GUILD_ID, "DEFAULT_GUILD_ID") : undefined
  const rest = new REST({ version: "10" }).setToken(token)
  const commands = await load()
  if (defaultGuild) {
    await rest.put(Routes.applicationGuildCommands(clientId, defaultGuild), { body: commands })
    console.log(`Deployed ${commands.length} guild commands`)
  } else {
    await rest.put(Routes.applicationCommands(clientId), { body: commands })
    console.log(`Deployed ${commands.length} global commands`)
  }
}

function must(v: string | undefined, k: string) {
  if (!v || v.trim() === "") throw new Error(`Missing env ${k}`)
  return v
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
