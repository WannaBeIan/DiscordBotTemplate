import fg from "fast-glob"
import { pathToFileURL } from "node:url"
import type { ComponentHandler } from "../types/Component"
import type { ButtonInteraction, StringSelectMenuInteraction, ModalSubmitInteraction } from "discord.js"

export class ComponentRouter {
  private handlers: ComponentHandler[] = []
  register(h: ComponentHandler) { this.handlers.push(h) }
  async load(globs: string[]) {
    const files = await fg(globs, { absolute: true })
    for (const f of files) {
      const m = await import(pathToFileURL(f).toString())
      const h: ComponentHandler | undefined = m.default
      if (h?.idPrefix && h?.kind) this.register(h)
    }
  }
  async route(i: ButtonInteraction | StringSelectMenuInteraction | ModalSubmitInteraction) {
    const id = "customId" in i ? i.customId : ""
    const t = i.isButton() ? "button" : i.isStringSelectMenu() ? "select" : "modal"
    const h = this.handlers.find(x => x.kind === t && id.startsWith(x.idPrefix + ":"))
    if (!h) {
      try {
        if (i.isButton() || i.isStringSelectMenu()) await i.deferUpdate()
        else if (i.isModalSubmit()) await i.reply({ content: "This form is no longer active.", ephemeral: true })
      } catch {}
      return
    }
    await h.run(i)
  }
}
