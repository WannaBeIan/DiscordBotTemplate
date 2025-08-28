import fg from "fast-glob"
import path from "node:path"
import { pathToFileURL } from "node:url"
import type { ExtendedClient } from "./ExtendedClient"
import type { Command } from "../types/Command"
import type { Event } from "../types/Event"

function isDistRuntime() {
  if (process.env.RUNTIME_DIR === "dist") return true
  const argv1 = process.argv[1] || ""
  if (argv1.includes(`${path.sep}dist${path.sep}`)) return true
  try {
    const here = new URL(import.meta.url).pathname
    return here.includes(`/dist/`) || here.includes(`\\dist\\`)
  } catch { return false }
}

function patterns(folder: string) {
  const dist = isDistRuntime()
  const base = dist ? "dist" : "src"
  const exts = dist ? ["js"] : ["ts", "js"]
  return exts.map(ext => `${base}/${folder}/**/*.${ext}`)
}

async function importDefaults<T>(globs: string[]) {
  const files = await fg(globs, { absolute: true })
  const out: T[] = []
  for (const f of files) {
    const m = await import(pathToFileURL(f).toString())
    if (m?.default) out.push(m.default as T)
  }
  return out
}

export async function loadCommands(client: ExtendedClient) {
  const cmds = await importDefaults<Command>(patterns("commands"))
  for (const c of cmds) if (c?.data?.name) client.commands.set(c.data.name as string, c)
  client.logger.info({ module: "loader", count: client.commands.size }, "Commands loaded")
}

export async function loadEvents(client: ExtendedClient) {
  const evts = await importDefaults<Event>(patterns("events"))
  for (const e of evts) {
    if (!e?.name) continue
    if (e.once) client.once(e.name, (...args) => e.run(client, ...args))
    else client.on(e.name, (...args) => e.run(client, ...args))
  }
  client.logger.info({ module: "loader" }, "Events loaded")
}

export async function loadModules(client: ExtendedClient) {
  const files = await fg(patterns("modules"), { absolute: true })
  for (const f of files) {
    const m = await import(pathToFileURL(f).toString())
    if (typeof m.init === "function") await m.init(client)
  }
  client.logger.info({ module: "loader" }, "Modules initialized")
}

export async function loadJobs(client: ExtendedClient) {
  const files = await fg(patterns("jobs"), { absolute: true })
  for (const f of files) {
    const m = await import(pathToFileURL(f).toString())
    if (typeof m.start === "function") await m.start(client)
  }
  client.logger.info({ module: "loader" }, "Jobs scheduled")
}

export async function loadComponents(client: ExtendedClient) {
  const files = await fg(patterns("components"), { absolute: true })
  for (const f of files) {
    const m = await import(pathToFileURL(f).toString())
    if (m?.default?.idPrefix && m?.default?.kind) client.components.register(m.default)
  }
  client.logger.info({ module: "loader" }, "Components loaded")
}
