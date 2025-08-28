import type { ComponentHandler } from "../types/Component"

const handler: ComponentHandler = {
  kind: "button",
  idPrefix: "template",
  run: async i => {
    await i.reply({ content: `Component handled: ${"customId" in i ? i.customId : ""}`, ephemeral: true })
  }
}

export default handler
